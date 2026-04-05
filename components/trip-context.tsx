"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { initialTrips, type Trip } from "@/lib/trips";
import { useAuth } from "@/components/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

type TripContextValue = {
  trips: Trip[];
  hydrated: boolean;
  addTrip: (trip: Omit<Trip, "id">) => Trip;
  removeTrip: (id: string) => void;
  updateTrip: (id: string, updater: (trip: Trip) => Trip) => void;
  syncTripFromRemote: (id: string, trip: Trip) => void;
};

const TripContext = createContext<TripContextValue | undefined>(undefined);

// 削除済みトリップIDと削除日時のマップ
type DeletedAt = Record<string, string>;

function loadDeletedAt(): DeletedAt {
  try {
    const stored = localStorage.getItem("trips_deleted");
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function saveDeletedAt(deletedAt: DeletedAt) {
  try { localStorage.setItem("trips_deleted", JSON.stringify(deletedAt)); } catch { /* ignore */ }
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();
  const prevUserId = useRef<string | null>(null);
  const syncing = useRef(false);
  const deletedAtRef = useRef<DeletedAt>({});
  const skipFirestoreRef = useRef(false);

  // Load from localStorage after mount
  useEffect(() => {
    deletedAtRef.current = loadDeletedAt();
    try {
      const stored = localStorage.getItem("trips");
      if (stored) {
        const parsed = JSON.parse(stored) as Trip[];
        const normalized = parsed.map((trip) => ({
          ...trip,
          days: trip.days.map((d) => ({
            ...d,
            icon: d.icon && d.icon.length <= 4 ? d.icon : "📍",
          })),
        }));
        // 削除済みIDを除外
        const deletedIds = deletedAtRef.current;
        setTrips(normalized.filter((t) => !deletedIds[t.id]));
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // ログイン時: Firestoreと同期
  useEffect(() => {
    if (!hydrated || !user) { prevUserId.current = null; return; }
    if (prevUserId.current === user.uid) return;
    prevUserId.current = user.uid;

    const sync = async () => {
      if (!db) return;
      syncing.current = true;
      try {
        const ref = doc(db, "users", user.uid, "trips", "data");
        const snap = await getDoc(ref);
        setTrips((local) => {
          const cloudData = snap.exists() ? snap.data() : null;
          const cloud: Trip[] = cloudData?.trips as Trip[] ?? [];
          const cloudDeletedAt: DeletedAt = cloudData?.deletedAt ?? {};

          // トゥームストーンをマージ（同じIDは新しい方を優先）
          const mergedDeletedAt: DeletedAt = { ...deletedAtRef.current };
          for (const [id, ts] of Object.entries(cloudDeletedAt)) {
            if (!mergedDeletedAt[id] || ts > mergedDeletedAt[id]) {
              mergedDeletedAt[id] = ts;
            }
          }
          deletedAtRef.current = mergedDeletedAt;
          saveDeletedAt(mergedDeletedAt);

          // トリップをマージ: 同じIDは更新日時が新しい方を優先
          const merged = new Map<string, Trip>();
          for (const t of [...local, ...cloud]) {
            const existing = merged.get(t.id);
            if (!existing) { merged.set(t.id, t); continue; }
            const existingAt = existing.updatedAt ?? existing.startDate ?? "";
            const newAt = t.updatedAt ?? t.startDate ?? "";
            if (newAt > existingAt) merged.set(t.id, t);
          }

          // 削除済みIDを除外
          const result = Array.from(merged.values()).filter((t) => !mergedDeletedAt[t.id]);
          localStorage.setItem("trips", JSON.stringify(result));
          // マージ結果をFirestoreに保存
          setDoc(ref, {
            trips: JSON.parse(JSON.stringify(result)),
            deletedAt: mergedDeletedAt,
          }).catch(() => {});
          return result;
        });
      } catch (e) { console.error("trips sync error:", e); }
      syncing.current = false;
    };
    sync();
  }, [user, hydrated]);

  // Persist to localStorage + Firestore whenever trips change (after hydration)
  useEffect(() => {
    if (!hydrated || syncing.current) return;
    try { localStorage.setItem("trips", JSON.stringify(trips)); } catch { /* ignore */ }
    if (skipFirestoreRef.current) { skipFirestoreRef.current = false; return; }
    if (db && user && prevUserId.current === user.uid) {
      const ref = doc(db, "users", user.uid, "trips", "data");
      setDoc(ref, {
        trips: JSON.parse(JSON.stringify(trips)),
        deletedAt: deletedAtRef.current,
      }).catch(() => {});
    }
  }, [trips, hydrated, user]);

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      hydrated,
      addTrip: (tripWithoutId) => {
        const date = (tripWithoutId.startDate ?? "").replace(/-/g, "") || Date.now().toString();
        const rand = Math.random().toString(36).slice(2, 6);
        const id = `trip-${date}-${rand}`;
        const newTrip: Trip = { ...tripWithoutId, id };
        setTrips((prev) => {
          const next = [...prev, newTrip];
          // ナビゲーション前にlocalStorageへ即時書き込み（Full Page Load対策）
          try { localStorage.setItem("trips", JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
        return newTrip;
      },
      removeTrip: (id) => {
        // トゥームストーンに追加
        const now = new Date().toISOString();
        deletedAtRef.current = { ...deletedAtRef.current, [id]: now };
        saveDeletedAt(deletedAtRef.current);
        setTrips((prev) => {
          const trip = prev.find((t) => t.id === id);
          // shareOwner === false の場合は友人のインポート旅程なので Firestore を削除しない
          if (trip?.shareId && trip?.shareOwner !== false && db) {
            deleteDoc(doc(db, "shared_trips", trip.shareId)).catch(() => {});
          }
          return prev.filter((t) => t.id !== id);
        });
      },
      updateTrip: (id, updater) => {
        setTrips((prev) =>
          prev.map((trip) => {
            if (trip.id !== id) return trip;
            const updated = { ...updater(trip), updatedAt: new Date().toISOString() };
            // 友人インポート旅程（shareOwner: false）はログイン済みのみ書き込み。オーナーは常に書き込み可
            if (updated.shareId && db && (updated.shareOwner !== false || user)) {
              setDoc(doc(db, "shared_trips", updated.shareId), {
                trip: JSON.parse(JSON.stringify(updated)),
              }, { merge: true }).catch(() => {});
            }
            return updated;
          })
        );
      },
      syncTripFromRemote: (id, trip) => {
        // リモートからの同期: localStorage は更新するが Firestore への書き戻しはスキップ
        // shareOwner はローカル専用フラグ（受信者の false を creator の値で上書きしない）
        skipFirestoreRef.current = true;
        setTrips((prev) => prev.map((t) => (t.id === id ? { ...trip, id: t.id, shareOwner: t.shareOwner } : t)));
      },
    }),
    [trips, user]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrips must be used within TripProvider");
  return ctx;
}
