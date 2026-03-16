"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

// ─── 経験レベル定義 ────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 0, short: "未踏", label: "行ってない",   bg: "#FFFFFF", border: "#D1D5DB", text: "#6B7280", dot: "#E5E7EB" },
  { value: 1, short: "通過", label: "通過した",     bg: "#DBEAFE", border: "#93C5FD", text: "#1D4ED8", dot: "#60A5FA" },
  { value: 2, short: "接地", label: "降り立った",   bg: "#D1FAE5", border: "#6EE7B7", text: "#065F46", dot: "#34D399" },
  { value: 3, short: "訪問", label: "歩いた",       bg: "#FEF9C3", border: "#FDE047", text: "#854D0E", dot: "#FBBF24" },
  { value: 4, short: "宿泊", label: "泊まった",     bg: "#FFEDD5", border: "#FDBA74", text: "#9A3412", dot: "#FB923C" },
  { value: 5, short: "居住", label: "住んだ",       bg: "#FCE7F3", border: "#F9A8D4", text: "#9D174D", dot: "#EC4899" },
];

// ─── 都道府県（11列 × 14行グリッド、北海道のみ2×2スパン） ───────────────────

// col/row は 0始まり。colSpan/rowSpan で複数タイル占有
type PrefDef = { id: string; name: string; col: number; row: number; colSpan?: number; rowSpan?: number };

const PREFECTURES: PrefDef[] = [
  // 北海道（2×2）
  { id: "hokkaido",   name: "北海道", col:  9, row:  0, colSpan: 2, rowSpan: 2 },
  // 東北（北海道の2行分を空けて row+2 にシフト）
  { id: "aomori",     name: "青森",   col:  9, row:  2 },
  { id: "iwate",      name: "岩手",   col: 10, row:  2 },
  { id: "akita",      name: "秋田",   col:  8, row:  3 },
  { id: "miyagi",     name: "宮城",   col:  9, row:  3 },
  { id: "yamagata",   name: "山形",   col:  8, row:  4 },
  { id: "fukushima",  name: "福島",   col:  9, row:  4 },
  // 関東
  { id: "ibaraki",    name: "茨城",   col: 10, row:  5 },
  { id: "tochigi",    name: "栃木",   col:  9, row:  5 },
  { id: "gunma",      name: "群馬",   col:  8, row:  5 },
  { id: "saitama",    name: "埼玉",   col:  9, row:  6 },
  { id: "chiba",      name: "千葉",   col: 10, row:  6 },
  { id: "tokyo",      name: "東京",   col:  9, row:  7 },
  { id: "kanagawa",   name: "神奈川", col:  9, row:  8 },
  // 中部
  { id: "niigata",    name: "新潟",   col:  7, row:  5 },
  { id: "toyama",     name: "富山",   col:  6, row:  6 },
  { id: "ishikawa",   name: "石川",   col:  5, row:  6 },
  { id: "fukui",      name: "福井",   col:  4, row:  7 },
  { id: "yamanashi",  name: "山梨",   col:  8, row:  6 },
  { id: "nagano",     name: "長野",   col:  7, row:  6 },
  { id: "gifu",       name: "岐阜",   col:  6, row:  7 },
  { id: "shizuoka",   name: "静岡",   col:  8, row:  7 },
  { id: "aichi",      name: "愛知",   col:  7, row:  7 },
  // 近畿
  { id: "mie",        name: "三重",   col:  8, row:  8 },
  { id: "shiga",      name: "滋賀",   col:  6, row:  8 },
  { id: "kyoto",      name: "京都",   col:  5, row:  8 },
  { id: "osaka",      name: "大阪",   col:  5, row:  9 },
  { id: "hyogo",      name: "兵庫",   col:  4, row:  8 },
  { id: "nara",       name: "奈良",   col:  7, row:  9 },
  { id: "wakayama",   name: "和歌山", col:  7, row: 10 },
  // 中国
  { id: "tottori",    name: "鳥取",   col:  3, row:  8 },
  { id: "shimane",    name: "島根",   col:  2, row:  8 },
  { id: "okayama",    name: "岡山",   col:  4, row:  9 },
  { id: "hiroshima",  name: "広島",   col:  3, row:  9 },
  { id: "yamaguchi",  name: "山口",   col:  2, row:  9 },
  // 四国（1列左シフト → 岡山の下に香川、広島の下に愛媛、大阪の下に徳島）
  { id: "ehime",      name: "愛媛",   col:  3, row: 10 },
  { id: "kagawa",     name: "香川",   col:  4, row: 10 },
  { id: "tokushima",  name: "徳島",   col:  5, row: 10 },
  { id: "kochi",      name: "高知",   col:  4, row: 11 },
  // 九州（大分を東側へ、九州本体は col 0-1 に集約）
  { id: "saga",       name: "佐賀",   col:  0, row: 10 },
  { id: "fukuoka",    name: "福岡",   col:  1, row: 10 },
  { id: "oita",       name: "大分",   col:  2, row: 10 },
  { id: "nagasaki",   name: "長崎",   col:  0, row: 11 },
  { id: "kumamoto",   name: "熊本",   col:  1, row: 11 },
  { id: "miyazaki",   name: "宮崎",   col:  2, row: 11 },
  { id: "kagoshima",  name: "鹿児島", col:  1, row: 12 },
  // 沖縄
  { id: "okinawa",    name: "沖縄",   col:  0, row: 13 },
];

// 一覧に表示する順（地方順）
const PREF_ORDER = [
  "hokkaido",
  "aomori","iwate","akita","miyagi","yamagata","fukushima",
  "ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",
  "niigata","toyama","ishikawa","fukui","yamanashi","nagano","gifu","shizuoka","aichi",
  "mie","shiga","kyoto","osaka","hyogo","nara","wakayama",
  "tottori","shimane","okayama","hiroshima","yamaguchi",
  "kagawa","tokushima","ehime","kochi",
  "fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima",
  "okinawa",
];

const MAX_SCORE = PREFECTURES.length * 5; // 235

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function ProfilePage() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingLevel, setPendingLevel] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("keiken");
      if (saved) setScores(JSON.parse(saved));
    } catch {/* ignore */}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("keiken", JSON.stringify(scores));
  }, [scores, hydrated]);

  const openPrefDialog = (id: string) => {
    setSelectedId(id);
    setPendingLevel(scores[id] ?? 0);
  };

  const confirmLevel = () => {
    if (selectedId !== null) {
      setScores((prev) => ({ ...prev, [selectedId]: pendingLevel }));
    }
    setSelectedId(null);
  };

  const totalScore = PREFECTURES.reduce((sum, p) => sum + (scores[p.id] ?? 0), 0);
  const visitedCount = PREFECTURES.filter((p) => (scores[p.id] ?? 0) > 0).length;

  const selectedPref = selectedId ? PREFECTURES.find((p) => p.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-[#F0F5FA]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeftIcon className="h-3.5 w-3.5" />ホーム
          </Link>
          <span className="text-sm font-bold text-slate-900">マイページ</span>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />編集
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* スコアカード */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">経県値</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900">{totalScore}</span>
            <span className="mb-1 text-sm text-slate-400">/ {MAX_SCORE} 点</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{visitedCount} 都道府県を訪問済み</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${(totalScore / MAX_SCORE) * 100}%` }}
            />
          </div>
        </div>

        {/* 凡例 */}
        <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1.5">
          {[...LEVELS].reverse().map((lv) => (
            <div key={lv.value} className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black"
                style={{ backgroundColor: lv.dot, color: "#fff" }}>
                {lv.value}
              </span>
              <span className="text-xs text-slate-500">{lv.short}</span>
            </div>
          ))}
        </div>

        {/* 日本地図（タイルグリッド・11列×14行・レスポンシブ） */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-3 text-xs font-semibold text-slate-400">日本地図（タップで編集）</p>
          {/* aspect-ratio: 11/14 で正方形タイルをレスポンシブ実現 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(11, 1fr)",
              gridTemplateRows: "repeat(14, 1fr)",
              gap: "2px",
              aspectRatio: "11 / 14",
              width: "100%",
              maxWidth: "440px",
              margin: "0 auto",
            }}
          >
            {PREFECTURES.map((pref) => {
              const level = scores[pref.id] ?? 0;
              const lv = LEVELS[level];
              const isLarge = !!(pref.colSpan && pref.rowSpan);
              return (
                <button
                  key={pref.id}
                  type="button"
                  title={`${pref.name}：${lv.label}`}
                  onClick={() => openPrefDialog(pref.id)}
                  style={{
                    gridColumn: `${pref.col + 1} / ${pref.col + (pref.colSpan ?? 1) + 1}`,
                    gridRow: `${pref.row + 1} / ${pref.row + (pref.rowSpan ?? 1) + 1}`,
                    backgroundColor: level === 0 ? "#F1F5F9" : lv.dot,
                    borderRadius: isLarge ? "8px" : "4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isLarge ? "clamp(10px, 2.5vw, 14px)" : "clamp(6px, 1.8vw, 9px)",
                    fontWeight: 800,
                    color: level === 0 ? "#94A3B8" : "#fff",
                    userSelect: "none",
                    cursor: "pointer",
                    border: `1.5px solid ${level === 0 ? "#E2E8F0" : lv.border}`,
                    lineHeight: 1.25,
                    padding: 0,
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  {isLarge ? (
                    // 北海道は全3文字表示
                    <span>{pref.name}</span>
                  ) : (
                    <>
                      <span>{pref.name.slice(0, 2)}</span>
                      {pref.name.length > 2 && <span>{pref.name.slice(2)}</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 編集モーダル（都道府県一覧） ─────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4" onClick={() => setEditOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">マップ編集</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-50"
                >
                  完了
                </button>
              </div>
              {/* スコア */}
              <div className="inline-flex items-center rounded-xl bg-amber-50 px-4 py-2 mb-2">
                <span className="text-2xl font-black text-amber-600">{totalScore}</span>
                <span className="ml-1 text-sm text-amber-500">点</span>
              </div>
              {/* 凡例 */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[...LEVELS].reverse().map((lv) => (
                  <div key={lv.value} className="flex items-center gap-1">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ backgroundColor: lv.dot }}>
                      {lv.value}
                    </span>
                    <span className="text-[10px] text-slate-500">{lv.short}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 都道府県グリッド */}
            <div className="grid grid-cols-4 gap-2 p-4">
              {PREF_ORDER.map((id) => {
                const pref = PREFECTURES.find((p) => p.id === id)!;
                const level = scores[id] ?? 0;
                const lv = LEVELS[level];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openPrefDialog(id)}
                    className="flex items-center justify-between rounded-xl border px-3 py-2 transition hover:brightness-95 active:scale-95"
                    style={{
                      backgroundColor: level === 0 ? "#FAFAFA" : lv.bg,
                      borderColor: level === 0 ? "#E5E7EB" : lv.border,
                    }}
                  >
                    <span className="text-sm font-semibold text-slate-700">{pref.name}</span>
                    <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ backgroundColor: lv.dot }}>
                      {level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 都道府県別レベル選択ダイアログ ─────────────────────────────────── */}
      {selectedPref && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-center text-xl font-black text-slate-900">{selectedPref.name}</h3>

            <div className="space-y-3">
              {[...LEVELS].reverse().map((lv) => {
                const checked = pendingLevel === lv.value;
                return (
                  <button
                    key={lv.value}
                    type="button"
                    onClick={() => setPendingLevel(lv.value)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:brightness-95"
                    style={{
                      backgroundColor: checked ? lv.bg : "#F8FAFC",
                      border: `2px solid ${checked ? lv.border : "#E2E8F0"}`,
                    }}
                  >
                    {/* チェックボックス */}
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${checked ? "border-slate-400 bg-slate-400" : "border-slate-200 bg-white"}`}>
                      {checked && <span className="text-[10px] text-white font-black">✓</span>}
                    </span>
                    {/* 番号バッジ */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                      style={{ backgroundColor: lv.dot }}>
                      {lv.value}
                    </span>
                    {/* ラベル */}
                    <span className="text-sm font-semibold text-slate-700">{lv.short}</span>
                    <span className="text-sm text-slate-500">{lv.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmLevel}
              className="mt-5 w-full rounded-xl py-3 text-base font-bold text-white transition hover:brightness-90"
              style={{ backgroundColor: "#FB923C" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
