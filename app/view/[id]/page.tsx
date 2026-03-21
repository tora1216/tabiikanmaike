"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTrips } from "@/components/trip-context";
import type { Trip } from "@/lib/trips";
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon, CreditCardIcon } from "@heroicons/react/24/outline";

const TRIP_ICONS: Record<string, string> = {
  plane: "✈️", train: "🚃", bus: "🚌", car: "🚗",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function fmtTime(t?: string) {
  return t ?? "";
}

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addTrip } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(false);
  const [alreadyImported, setAlreadyImported] = useState(false);

  useEffect(() => {
    if (!id) return;
    try {
      const done = JSON.parse(localStorage.getItem("imported_shares") ?? "[]") as string[];
      if (done.includes(id)) setAlreadyImported(true);
    } catch { /* ignore */ }
    getDoc(doc(db, "shared_trips", id))
      .then((snap) => {
        if (!snap.exists()) { setError("この共有リンクは無効です。"); return; }
        setTrip(snap.data().trip as Trip);
      })
      .catch(() => setError("データの読み込みに失敗しました。"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <svg className="h-6 w-6 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F5FA] px-4">
        <p className="text-sm text-slate-500">{error || "データが見つかりません。"}</p>
        <Link href="/" className="text-sm font-semibold text-indigo-500 hover:underline">トップへ戻る</Link>
      </div>
    );
  }

  const totalDays = Math.max(
    1,
    Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1
  );
  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const tripIcon = TRIP_ICONS[trip.icon ?? "plane"] ?? "✈️";
  const totalCost = (trip.days ?? []).reduce((s, a) => {
    if (!a.cost) return s;
    return s + (a.costType === "per_person" ? a.cost * (trip.participants ?? 2) : a.cost);
  }, 0);

  const handleImport = () => {
    addTrip({
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description,
      days: trip.days,
      packingList: trip.packingList,
      notes: trip.notes,
      noteEntries: trip.noteEntries,
    });
    try {
      const done = JSON.parse(localStorage.getItem("imported_shares") ?? "[]") as string[];
      localStorage.setItem("imported_shares", JSON.stringify([...done, id]));
    } catch { /* ignore */ }
    setImported(true);
    setTimeout(() => router.push("/"), 1000);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeftIcon className="h-4 w-4 text-slate-500" />
        </Link>
        <span className="text-xs font-semibold text-slate-400">共有された旅程（閲覧専用）</span>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-6 space-y-4">
        {/* Trip title card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tripIcon}</span>
            <div>
              <h1 className="text-xl font-black text-slate-900">{trip.title}</h1>
              <p className="text-sm text-slate-500">
                {fmtDate(trip.startDate)} 〜 {fmtDate(trip.endDate)}（{totalDays}日間）
              </p>
            </div>
          </div>
          {trip.description && (
            <p className="mt-3 text-sm text-slate-600">{trip.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {trip.participants && (
              <span>{trip.participants}人</span>
            )}
            {totalCost > 0 && (
              <span className="flex items-center gap-1">
                <CreditCardIcon className="h-3.5 w-3.5" />
                合計 ¥{totalCost.toLocaleString()}
                {trip.participants && ` （1人 ¥${Math.round(totalCost / trip.participants).toLocaleString()}）`}
              </span>
            )}
          </div>
        </div>

        {/* Itinerary */}
        {allDays.map((n) => {
          const acts = (trip.days ?? []).filter((d) => d.day === n);
          return (
            <div key={n} className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                <span className="text-sm font-bold text-slate-700">Day {n}</span>
              </div>
              {acts.length === 0 ? (
                <p className="px-4 py-3 text-xs text-slate-400">予定なし</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {acts.map((a, i) => {
                    const isTransport = a.type === "transport";
                    const name = isTransport && a.from && a.to ? `${a.from} → ${a.to}` : a.destination;
                    const timeStr = a.time && a.endTime
                      ? `${a.time} ~ ${a.endTime}`
                      : a.time ? `${a.time} ~` : a.endTime ? `~ ${a.endTime}` : "";
                    return (
                      <li key={i} className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 text-lg">{a.icon}</span>
                        <div className="min-w-0 flex-1">
                          {timeStr && <p className="text-[11px] text-slate-400">{timeStr}</p>}
                          <p className="text-sm font-semibold text-slate-800">{name}</p>
                          {a.memo && <p className="text-xs text-slate-500">{a.memo}</p>}
                          {a.mapsUrl && (
                            <a
                              href={a.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:underline"
                            >
                              <MapPinIcon className="h-3 w-3" />地図を開く
                            </a>
                          )}
                        </div>
                        {a.cost && a.cost > 0 && (
                          <span className="shrink-0 text-xs font-semibold text-indigo-600">
                            ¥{a.cost.toLocaleString()}
                            {a.costType === "per_person" && <span className="font-normal text-indigo-400">/人</span>}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* Import button */}
        <button
          type="button"
          onClick={handleImport}
          disabled={imported || alreadyImported}
          className="w-full rounded-2xl bg-[#22C55E] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-400 disabled:opacity-60"
        >
          {imported ? "追加しました ✓" : alreadyImported ? "追加済みです ✓" : "自分の旅程リストに追加する"}
        </button>
      </div>
    </div>
  );
}
