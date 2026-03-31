"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HomeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/auth-context";
import japanMap from "@svg-maps/japan";
import worldMap from "@svg-maps/world";
import {
  LEVELS, PREFECTURES, PREF_ORDER, MAX_SCORE, REGIONS,
  CONTINENTS, COUNTRIES, ISO_TO_COUNTRY, MAX_SCORE_WORLD,
} from "@/lib/keiken";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function ProfilePage() {
  const [tab, setTab] = useState<"japan" | "world">("japan");
  const [japanEditOpen, setJapanEditOpen] = useState(false);

  // 日本
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editOpen, setEditOpen] = useState(false);

  // 海外
  const [worldScores, setWorldScores] = useState<Record<string, number>>({});
  const [worldEditOpen, setWorldEditOpen] = useState(false);

  // 共通：レベル選択ダイアログ
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isWorldDialog, setIsWorldDialog] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<number>(0);

  const { user, loading: authLoading, login, logout } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [syncingUI, setSyncingUI] = useState(false);
  const syncingRef = useRef(false); // 即時チェック用（Reactのstateは次renderまで反映されないため）
  const [loginConfirmOpen, setLoginConfirmOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const prevUserId = useRef<string | null>(null);

  // プロフィール名
  const [username, setUsername] = useState("");
  const [usernameEditOpen, setUsernameEditOpen] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");

  // ローカル初期化
  useEffect(() => {
    try {
      const saved = localStorage.getItem("keiken");
      if (saved) setScores(JSON.parse(saved));
      const savedW = localStorage.getItem("keiken_world");
      if (savedW) setWorldScores(JSON.parse(savedW));
      const savedName = localStorage.getItem("profile_username");
      if (savedName) setUsername(savedName);
    } catch {/* ignore */}
    setHydrated(true);
  }, []);

  const doSync = async (uid?: string) => {
    const targetUid = uid ?? user?.uid;
    if (!targetUid || !db) {
      setSyncError(!db ? "Firebase未設定" : null);
      return;
    }
    syncingRef.current = true;
    setSyncingUI(true);
    setSyncError(null);
    try {
      const ref = doc(db, "users", targetUid, "keiken", "data");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as { japan?: Record<string, number>; world?: Record<string, number> };
        setScores(prev => {
          const merged: Record<string, number> = { ...prev };
          for (const [k, v] of Object.entries(data.japan ?? {})) {
            merged[k] = Math.max(merged[k] ?? 0, v);
          }
          localStorage.setItem("keiken", JSON.stringify(merged));
          return merged;
        });
        setWorldScores(prev => {
          const merged: Record<string, number> = { ...prev };
          for (const [k, v] of Object.entries(data.world ?? {})) {
            merged[k] = Math.max(merged[k] ?? 0, v);
          }
          localStorage.setItem("keiken_world", JSON.stringify(merged));
          return merged;
        });
      } else {
        const localJapan = JSON.parse(localStorage.getItem("keiken") || "{}");
        const localWorld = JSON.parse(localStorage.getItem("keiken_world") || "{}");
        await setDoc(ref, { japan: localJapan, world: localWorld });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("keiken sync error:", e);
      setSyncError(msg);
    }
    syncingRef.current = false;
    setSyncingUI(false);
  };

  // ログイン時: Firestoreと同期（両方のデータで最大値を採用）
  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (!user) { prevUserId.current = null; return; }
    if (prevUserId.current === user.uid) return;
    prevUserId.current = user.uid;
    doSync(user.uid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated, authLoading]);

  // スコア変更時: localStorageに保存 + ログイン中はFirestoreにも保存
  useEffect(() => {
    if (!hydrated || syncingRef.current) return;
    localStorage.setItem("keiken", JSON.stringify(scores));
    localStorage.setItem("keiken_world", JSON.stringify(worldScores));
    if (db && user && prevUserId.current === user.uid) {
      const ref = doc(db, "users", user.uid, "keiken", "data");
      setDoc(ref, { japan: scores, world: worldScores }).catch(() => {});
    }
  }, [scores, worldScores, hydrated, user, syncingUI]);

  const saveUsername = (name: string) => {
    const trimmed = name.trim();
    setUsername(trimmed);
    localStorage.setItem("profile_username", trimmed);
    if (db && user) {
      setDoc(doc(db, "users", user.uid, "profile", "data"), { username: trimmed }, { merge: true }).catch(() => {});
    }
    setUsernameEditOpen(false);
  };

  const openDialog = (id: string, isWorld: boolean) => {
    setSelectedId(id);
    setIsWorldDialog(isWorld);
    setPendingLevel((isWorld ? worldScores[id] : scores[id]) ?? 0);
  };

  const confirmLevel = () => {
    if (selectedId !== null) {
      if (isWorldDialog) {
        setWorldScores((prev) => ({ ...prev, [selectedId]: pendingLevel }));
      } else {
        setScores((prev) => ({ ...prev, [selectedId]: pendingLevel }));
      }
    }
    setSelectedId(null);
  };

  const totalScore = PREFECTURES.reduce((sum, p) => sum + (scores[p.id] ?? 0), 0);
  const visitedCount = PREFECTURES.filter((p) => (scores[p.id] ?? 0) > 0).length;

  const totalWorldScore = COUNTRIES.reduce((sum, c) => sum + (worldScores[c.id] ?? 0), 0);
  const visitedCountries = COUNTRIES.filter((c) => (worldScores[c.id] ?? 0) > 0).length;

  const selectedPref = !isWorldDialog && selectedId ? PREFECTURES.find((p) => p.id === selectedId) : null;
  const selectedCountry = isWorldDialog && selectedId ? COUNTRIES.find((c) => c.id === selectedId) : null;
  const dialogName = selectedPref?.name ?? selectedCountry?.name ?? "";
  const dialogFlag = selectedCountry?.flag ?? "";

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:bg-slate-800/90 dark:border-slate-700">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            <HomeIcon className="h-3.5 w-3.5" />一覧に戻る
          </Link>
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-slate-900 dark:text-white">マイページ</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* ログインセクション */}
        {!authLoading && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img src={user.photoURL} alt="avatar" className="h-9 w-9 rounded-full" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {username || user.displayName}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setUsernameDraft(username || user.displayName || ""); setUsernameEditOpen(true); }}
                      className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {syncingUI ? "同期中…" : syncError ? <span className="text-red-500">同期失敗: {syncError}</span> : user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-700">
                    👤
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {username || "名前未設定"}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setUsernameDraft(username); setUsernameEditOpen(true); }}
                        className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ログインなしで利用中</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-700/50">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">ログインするとできること</p>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <li>☁️ 旅程・経験値をサーバーに保存</li>
                    <li>📱 PCとスマホでデータを自動同期</li>
                    <li>🔗 旅程を共有</li>
                    <li>🔄 共有した旅程はリアルタイムで共同編集</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginConfirmOpen(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Googleでログイン
                </button>
              </div>
            )}
          </div>
        )}

        {/* タブ */}
        <div className="mb-5 flex rounded-2xl bg-white p-1 shadow-sm dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab("japan")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              tab === "japan"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🗾 日本
          </button>
          <button
            type="button"
            onClick={() => setTab("world")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              tab === "world"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🌍 海外
          </button>
        </div>

        {/* ─── 日本タブ ─── */}
        {tab === "japan" && (
          <>
            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">国内経験値</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{totalScore}</span>
                <span className="mb-1 text-sm text-slate-400">/ {MAX_SCORE} 点</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{visitedCount} 都道府県を訪問済み</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${(totalScore / MAX_SCORE) * 100}%` }} />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1.5">
              {[...LEVELS].reverse().map((lv) => (
                <div key={lv.value} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black" style={{ backgroundColor: lv.dot, color: "#fff" }}>
                    {lv.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{lv.short}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">日本地図</p>
                <button
                  type="button"
                  onClick={() => setJapanEditOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  編集
                </button>
              </div>
              <svg
                viewBox="0 0 560 516"
                className="mx-auto block w-full"
                style={{ maxHeight: "480px" }}
              >
                {japanMap.locations.map((loc: { id: string; name: string; path: string }) => {
                  const level = scores[loc.id] ?? 0;
                  const lv = LEVELS[level];
                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      fill={level === 0 ? "#E2E8F0" : lv.dot}
                      stroke={level === 0 ? "#CBD5E1" : lv.border}
                      strokeWidth="0.5"
                      style={{ cursor: "pointer", transition: "fill 0.15s" }}
                      onClick={() => openDialog(loc.id, false)}
                    >
                      <title>{`${loc.name}：${lv.label}`}</title>
                    </path>
                  );
                })}
              </svg>
            </div>
          </>
        )}

        {/* ─── 海外タブ ─── */}
        {tab === "world" && (
          <>
            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">海外経験値</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{totalWorldScore}</span>
                <span className="mb-1 text-sm text-slate-400">/ {MAX_SCORE_WORLD} 点</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{visitedCountries} か国を訪問済み</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${(totalWorldScore / MAX_SCORE_WORLD) * 100}%` }} />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1.5">
              {[...LEVELS].reverse().map((lv) => (
                <div key={lv.value} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black" style={{ backgroundColor: lv.dot, color: "#fff" }}>
                    {lv.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{lv.short}</span>
                </div>
              ))}
            </div>

            {/* 世界地図 */}
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">世界地図</p>
                <button
                  type="button"
                  onClick={() => setWorldEditOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  編集
                </button>
              </div>
              <svg
                viewBox={worldMap.viewBox}
                className="mx-auto block w-full"
              >
                {worldMap.locations.map((loc: { id: string; name: string; path: string }) => {
                  const countryId = ISO_TO_COUNTRY[loc.id];
                  const level = countryId ? (worldScores[countryId] ?? 0) : 0;
                  const lv = LEVELS[level];
                  const isTracked = !!countryId;
                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      fill={level > 0 ? lv.dot : isTracked ? "#CBD5E1" : "#E8EDF2"}
                      stroke="#fff"
                      strokeWidth="0.3"
                      style={{ cursor: isTracked ? "pointer" : "default", transition: "fill 0.15s" }}
                      onClick={() => { if (countryId) openDialog(countryId, true); }}
                    >
                      <title>{loc.name}{countryId ? `：${LEVELS[level].label}` : ""}</title>
                    </path>
                  );
                })}
              </svg>
            </div>
          </>
        )}
      </div>

      {/* ─── 日本 編集モーダル ───────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4" onClick={() => setEditOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">マップ編集（日本）</h2>
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-full px-3 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700">完了</button>
              </div>
              <div className="inline-flex items-center rounded-xl bg-amber-50 px-4 py-2 mb-2 dark:bg-amber-900/20">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalScore}</span>
                <span className="ml-1 text-sm text-amber-500">点</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[...LEVELS].reverse().map((lv) => (
                  <div key={lv.value} className="flex items-center gap-1">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>{lv.value}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{lv.short}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 p-4">
              {PREF_ORDER.map((id) => {
                const pref = PREFECTURES.find((p) => p.id === id)!;
                const level = scores[id] ?? 0;
                const lv = LEVELS[level];
                return (
                  <button key={id} type="button" onClick={() => openDialog(id, false)}
                    className="flex items-center justify-between rounded-xl border px-3 py-2 transition hover:brightness-95 active:scale-95"
                    style={{ backgroundColor: level === 0 ? "#FAFAFA" : lv.bg, borderColor: level === 0 ? "#E5E7EB" : lv.border }}
                  >
                    <span className="text-sm font-semibold text-slate-700">{pref.name}</span>
                    <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>{level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 海外 編集モーダル ───────────────────────────────────────────────── */}
      {worldEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4" onClick={() => setWorldEditOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">マップ編集（海外）</h2>
                <button type="button" onClick={() => setWorldEditOpen(false)} className="rounded-full px-3 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700">完了</button>
              </div>
              <div className="inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2 mb-2 dark:bg-indigo-900/20">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalWorldScore}</span>
                <span className="ml-1 text-sm text-indigo-500">点</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[...LEVELS].reverse().map((lv) => (
                  <div key={lv.value} className="flex items-center gap-1">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>{lv.value}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{lv.short}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 p-4">
              {CONTINENTS.map((cont) => {
                const countries = COUNTRIES.filter((c) => c.continent === cont.id);
                return (
                  <div key={cont.id}>
                    <p className="mb-2 text-xs font-bold text-slate-400">{cont.emoji} {cont.name}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {countries.map((country) => {
                        const level = worldScores[country.id] ?? 0;
                        const lv = LEVELS[level];
                        return (
                          <button key={country.id} type="button" onClick={() => openDialog(country.id, true)}
                            className="flex items-center gap-2 rounded-xl border px-2.5 py-2 transition hover:brightness-95 active:scale-95"
                            style={{ backgroundColor: level === 0 ? "#FAFAFA" : lv.bg, borderColor: level === 0 ? "#E5E7EB" : lv.border }}
                          >
                            <span className="text-base leading-none">{country.flag}</span>
                            <span className="min-w-0 flex-1 text-xs font-semibold leading-tight text-slate-700">{country.name}</span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>{level}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 日本 編集ダイアログ ─────────────────────────────────────────────── */}
      {japanEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setJapanEditOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-800 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">都道府県を編集</h3>
              <button type="button" onClick={() => setJapanEditOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              {REGIONS.map((region) => (
                <div key={region.name}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{region.name}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {region.ids.map((id) => {
                      const pref = PREFECTURES.find((p) => p.id === id)!;
                      const level = scores[id] ?? 0;
                      const lv = LEVELS[level];
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => openDialog(id, false)}
                          className="flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold transition hover:brightness-95"
                          style={{ backgroundColor: level === 0 ? "#F8FAFC" : lv.bg, borderColor: level === 0 ? "#E5E7EB" : lv.border, color: level === 0 ? "#64748B" : lv.text }}
                        >
                          <span>{pref.name}</span>
                          {level > 0 && (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>
                              {level}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── レベル選択ダイアログ（日本・海外共通） ─────────────────────────── */}
      {selectedId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-5 text-center text-xl font-black text-slate-900 dark:text-white">
              {dialogFlag && <span className="mr-2">{dialogFlag}</span>}{dialogName}
            </h3>
            <div className="space-y-3">
              {[...LEVELS].reverse().map((lv) => {
                const checked = pendingLevel === lv.value;
                return (
                  <button key={lv.value} type="button" onClick={() => setPendingLevel(lv.value)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:brightness-95"
                    style={{ backgroundColor: checked ? lv.bg : "#F8FAFC", border: `2px solid ${checked ? lv.border : "#E2E8F0"}` }}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${checked ? "border-slate-400 bg-slate-400" : "border-slate-200 bg-white"}`}>
                      {checked && <span className="text-[10px] text-white font-black">✓</span>}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: lv.dot }}>{lv.value}</span>
                    <span className="text-sm font-semibold text-slate-700">{lv.short}</span>
                    <span className="text-sm text-slate-500">{lv.label}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={confirmLevel}
              className="mt-5 w-full rounded-xl py-3 text-base font-bold text-white transition hover:brightness-90"
              style={{ backgroundColor: "#FB923C" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ─── ログイン確認ダイアログ ──────────────────────────────────────────── */}
      {loginConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={() => setLoginConfirmOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Googleでログイン</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              ログインすると、旅程と経験値データがサーバーに保存されます。同じアカウントでログインした端末間でデータが自動的に同期されます。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLoginConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => { setLoginConfirmOpen(false); login(); }}
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ユーザー名編集ダイアログ ─────────────────────────────────────────── */}
      {usernameEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={() => setUsernameEditOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">ユーザー名を編集</h3>
            <input
              type="text"
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveUsername(usernameDraft); }}
              placeholder="名前を入力"
              maxLength={30}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setUsernameEditOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => saveUsername(usernameDraft)}
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
