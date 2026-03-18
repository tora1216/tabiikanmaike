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

// ─── 都道府県データ ─────────────────────────────────────────────────────────────

type PrefDef = { id: string; name: string; col: number; row: number; colSpan?: number; rowSpan?: number };

const PREFECTURES: PrefDef[] = [
  { id: "hokkaido",   name: "北海道", col:  9, row:  0, colSpan: 2, rowSpan: 2 },
  { id: "aomori",     name: "青森",   col:  9, row:  2 },
  { id: "iwate",      name: "岩手",   col: 10, row:  2 },
  { id: "akita",      name: "秋田",   col:  8, row:  3 },
  { id: "miyagi",     name: "宮城",   col:  9, row:  3 },
  { id: "yamagata",   name: "山形",   col:  8, row:  4 },
  { id: "fukushima",  name: "福島",   col:  9, row:  4 },
  { id: "ibaraki",    name: "茨城",   col: 10, row:  5 },
  { id: "tochigi",    name: "栃木",   col:  9, row:  5 },
  { id: "gunma",      name: "群馬",   col:  8, row:  5 },
  { id: "saitama",    name: "埼玉",   col:  9, row:  6 },
  { id: "chiba",      name: "千葉",   col: 10, row:  6 },
  { id: "tokyo",      name: "東京",   col:  9, row:  7 },
  { id: "kanagawa",   name: "神奈川", col:  9, row:  8 },
  { id: "niigata",    name: "新潟",   col:  7, row:  5 },
  { id: "toyama",     name: "富山",   col:  6, row:  6 },
  { id: "ishikawa",   name: "石川",   col:  5, row:  6 },
  { id: "fukui",      name: "福井",   col:  4, row:  7 },
  { id: "yamanashi",  name: "山梨",   col:  8, row:  6 },
  { id: "nagano",     name: "長野",   col:  7, row:  6 },
  { id: "gifu",       name: "岐阜",   col:  6, row:  7 },
  { id: "shizuoka",   name: "静岡",   col:  8, row:  7 },
  { id: "aichi",      name: "愛知",   col:  7, row:  7 },
  { id: "mie",        name: "三重",   col:  8, row:  8 },
  { id: "shiga",      name: "滋賀",   col:  6, row:  8 },
  { id: "kyoto",      name: "京都",   col:  5, row:  8 },
  { id: "osaka",      name: "大阪",   col:  5, row:  9 },
  { id: "hyogo",      name: "兵庫",   col:  4, row:  8 },
  { id: "nara",       name: "奈良",   col:  7, row:  9 },
  { id: "wakayama",   name: "和歌山", col:  7, row: 10 },
  { id: "tottori",    name: "鳥取",   col:  3, row:  8 },
  { id: "shimane",    name: "島根",   col:  2, row:  8 },
  { id: "okayama",    name: "岡山",   col:  4, row:  9 },
  { id: "hiroshima",  name: "広島",   col:  3, row:  9 },
  { id: "yamaguchi",  name: "山口",   col:  2, row:  9 },
  { id: "ehime",      name: "愛媛",   col:  3, row: 10 },
  { id: "kagawa",     name: "香川",   col:  4, row: 10 },
  { id: "tokushima",  name: "徳島",   col:  5, row: 10 },
  { id: "kochi",      name: "高知",   col:  4, row: 11 },
  { id: "saga",       name: "佐賀",   col:  0, row: 10 },
  { id: "fukuoka",    name: "福岡",   col:  1, row: 10 },
  { id: "oita",       name: "大分",   col:  2, row: 10 },
  { id: "nagasaki",   name: "長崎",   col:  0, row: 11 },
  { id: "kumamoto",   name: "熊本",   col:  1, row: 11 },
  { id: "miyazaki",   name: "宮崎",   col:  2, row: 11 },
  { id: "kagoshima",  name: "鹿児島", col:  1, row: 12 },
  { id: "okinawa",    name: "沖縄",   col:  0, row: 13 },
];

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

const MAX_SCORE = PREFECTURES.length * 5;

// ─── 海外：国データ ─────────────────────────────────────────────────────────────

type CountryDef = { id: string; name: string; continent: string; flag: string };

const CONTINENTS = [
  { id: "asia",          name: "アジア",         emoji: "🌏" },
  { id: "europe",        name: "ヨーロッパ",     emoji: "🌍" },
  { id: "north_america", name: "北米・オセアニア", emoji: "🌎" },
  { id: "south_america", name: "中南米",         emoji: "🌎" },
  { id: "middle_east",   name: "中東",           emoji: "🕌" },
  { id: "africa",        name: "アフリカ",       emoji: "🌍" },
];

const COUNTRIES: CountryDef[] = [
  // アジア
  { id: "china",        name: "中国",         continent: "asia",          flag: "🇨🇳" },
  { id: "south_korea",  name: "韓国",         continent: "asia",          flag: "🇰🇷" },
  { id: "taiwan",       name: "台湾",         continent: "asia",          flag: "🇹🇼" },
  { id: "hong_kong",    name: "香港",         continent: "asia",          flag: "🇭🇰" },
  { id: "thailand",     name: "タイ",         continent: "asia",          flag: "🇹🇭" },
  { id: "vietnam",      name: "ベトナム",     continent: "asia",          flag: "🇻🇳" },
  { id: "indonesia",    name: "インドネシア", continent: "asia",          flag: "🇮🇩" },
  { id: "singapore",    name: "シンガポール", continent: "asia",          flag: "🇸🇬" },
  { id: "malaysia",     name: "マレーシア",   continent: "asia",          flag: "🇲🇾" },
  { id: "philippines",  name: "フィリピン",   continent: "asia",          flag: "🇵🇭" },
  { id: "india",        name: "インド",       continent: "asia",          flag: "🇮🇳" },
  { id: "nepal",        name: "ネパール",     continent: "asia",          flag: "🇳🇵" },
  { id: "cambodia",     name: "カンボジア",   continent: "asia",          flag: "🇰🇭" },
  { id: "myanmar",      name: "ミャンマー",   continent: "asia",          flag: "🇲🇲" },
  { id: "laos",         name: "ラオス",       continent: "asia",          flag: "🇱🇦" },
  { id: "sri_lanka",    name: "スリランカ",   continent: "asia",          flag: "🇱🇰" },
  { id: "maldives",     name: "モルディブ",   continent: "asia",          flag: "🇲🇻" },
  { id: "bhutan",       name: "ブータン",     continent: "asia",          flag: "🇧🇹" },
  { id: "mongolia",     name: "モンゴル",     continent: "asia",          flag: "🇲🇳" },
  { id: "macau",        name: "マカオ",       continent: "asia",          flag: "🇲🇴" },
  // ヨーロッパ
  { id: "france",       name: "フランス",     continent: "europe",        flag: "🇫🇷" },
  { id: "uk",           name: "イギリス",     continent: "europe",        flag: "🇬🇧" },
  { id: "germany",      name: "ドイツ",       continent: "europe",        flag: "🇩🇪" },
  { id: "italy",        name: "イタリア",     continent: "europe",        flag: "🇮🇹" },
  { id: "spain",        name: "スペイン",     continent: "europe",        flag: "🇪🇸" },
  { id: "portugal",     name: "ポルトガル",   continent: "europe",        flag: "🇵🇹" },
  { id: "netherlands",  name: "オランダ",     continent: "europe",        flag: "🇳🇱" },
  { id: "belgium",      name: "ベルギー",     continent: "europe",        flag: "🇧🇪" },
  { id: "switzerland",  name: "スイス",       continent: "europe",        flag: "🇨🇭" },
  { id: "austria",      name: "オーストリア", continent: "europe",        flag: "🇦🇹" },
  { id: "czech",        name: "チェコ",       continent: "europe",        flag: "🇨🇿" },
  { id: "hungary",      name: "ハンガリー",   continent: "europe",        flag: "🇭🇺" },
  { id: "poland",       name: "ポーランド",   continent: "europe",        flag: "🇵🇱" },
  { id: "greece",       name: "ギリシャ",     continent: "europe",        flag: "🇬🇷" },
  { id: "croatia",      name: "クロアチア",   continent: "europe",        flag: "🇭🇷" },
  { id: "sweden",       name: "スウェーデン", continent: "europe",        flag: "🇸🇪" },
  { id: "norway",       name: "ノルウェー",   continent: "europe",        flag: "🇳🇴" },
  { id: "finland",      name: "フィンランド", continent: "europe",        flag: "🇫🇮" },
  { id: "denmark",      name: "デンマーク",   continent: "europe",        flag: "🇩🇰" },
  { id: "iceland",      name: "アイスランド", continent: "europe",        flag: "🇮🇸" },
  { id: "russia",       name: "ロシア",       continent: "europe",        flag: "🇷🇺" },
  // 北米・オセアニア
  { id: "usa",          name: "アメリカ",       continent: "north_america", flag: "🇺🇸" },
  { id: "canada",       name: "カナダ",         continent: "north_america", flag: "🇨🇦" },
  { id: "mexico",       name: "メキシコ",       continent: "north_america", flag: "🇲🇽" },
  { id: "australia",    name: "オーストラリア", continent: "north_america", flag: "🇦🇺" },
  { id: "new_zealand",  name: "NZ",             continent: "north_america", flag: "🇳🇿" },
  { id: "fiji",         name: "フィジー",       continent: "north_america", flag: "🇫🇯" },
  // 中南米
  { id: "brazil",       name: "ブラジル",     continent: "south_america", flag: "🇧🇷" },
  { id: "argentina",    name: "アルゼンチン", continent: "south_america", flag: "🇦🇷" },
  { id: "peru",         name: "ペルー",       continent: "south_america", flag: "🇵🇪" },
  { id: "chile",        name: "チリ",         continent: "south_america", flag: "🇨🇱" },
  { id: "colombia",     name: "コロンビア",   continent: "south_america", flag: "🇨🇴" },
  { id: "cuba",         name: "キューバ",     continent: "south_america", flag: "🇨🇺" },
  { id: "costa_rica",   name: "コスタリカ",   continent: "south_america", flag: "🇨🇷" },
  // 中東
  { id: "uae",          name: "UAE",          continent: "middle_east",   flag: "🇦🇪" },
  { id: "turkey",       name: "トルコ",       continent: "middle_east",   flag: "🇹🇷" },
  { id: "israel",       name: "イスラエル",   continent: "middle_east",   flag: "🇮🇱" },
  { id: "jordan",       name: "ヨルダン",     continent: "middle_east",   flag: "🇯🇴" },
  { id: "qatar",        name: "カタール",     continent: "middle_east",   flag: "🇶🇦" },
  { id: "saudi",        name: "サウジアラビア", continent: "middle_east", flag: "🇸🇦" },
  // アフリカ
  { id: "egypt",        name: "エジプト",     continent: "africa",        flag: "🇪🇬" },
  { id: "morocco",      name: "モロッコ",     continent: "africa",        flag: "🇲🇦" },
  { id: "south_africa", name: "南アフリカ",   continent: "africa",        flag: "🇿🇦" },
  { id: "kenya",        name: "ケニア",       continent: "africa",        flag: "🇰🇪" },
  { id: "tanzania",     name: "タンザニア",   continent: "africa",        flag: "🇹🇿" },
  { id: "ethiopia",     name: "エチオピア",   continent: "africa",        flag: "🇪🇹" },
];

const MAX_SCORE_WORLD = COUNTRIES.length * 5;

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function ProfilePage() {
  const [tab, setTab] = useState<"japan" | "world">("japan");

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

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("keiken");
      if (saved) setScores(JSON.parse(saved));
      const savedW = localStorage.getItem("keiken_world");
      if (savedW) setWorldScores(JSON.parse(savedW));
    } catch {/* ignore */}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("keiken", JSON.stringify(scores));
  }, [scores, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("keiken_world", JSON.stringify(worldScores));
  }, [worldScores, hydrated]);

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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeftIcon className="h-3.5 w-3.5" />ホーム
          </Link>
          <span className="text-sm font-bold text-slate-900 dark:text-white">マイページ</span>
          <button
            type="button"
            onClick={() => tab === "japan" ? setEditOpen(true) : setWorldEditOpen(true)}
            className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />編集
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">経県値</p>
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
              <p className="mb-3 text-xs font-semibold text-slate-400">日本地図（タップで編集）</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(14, 1fr)", gap: "2px", aspectRatio: "11 / 14", width: "100%", maxWidth: "440px", margin: "0 auto" }}>
                {PREFECTURES.map((pref) => {
                  const level = scores[pref.id] ?? 0;
                  const lv = LEVELS[level];
                  const isLarge = !!(pref.colSpan && pref.rowSpan);
                  return (
                    <button
                      key={pref.id}
                      type="button"
                      title={`${pref.name}：${lv.label}`}
                      onClick={() => openDialog(pref.id, false)}
                      style={{
                        gridColumn: `${pref.col + 1} / ${pref.col + (pref.colSpan ?? 1) + 1}`,
                        gridRow: `${pref.row + 1} / ${pref.row + (pref.rowSpan ?? 1) + 1}`,
                        backgroundColor: level === 0 ? "#F1F5F9" : lv.dot,
                        borderRadius: isLarge ? "8px" : "4px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        fontSize: isLarge ? "clamp(10px, 2.5vw, 14px)" : "clamp(6px, 1.8vw, 9px)",
                        fontWeight: 800,
                        color: level === 0 ? "#94A3B8" : "#fff",
                        userSelect: "none", cursor: "pointer",
                        border: `1.5px solid ${level === 0 ? "#E2E8F0" : lv.border}`,
                        lineHeight: 1.25, padding: 0, minWidth: 0, overflow: "hidden",
                      }}
                    >
                      {isLarge ? (
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

            {/* 大陸別グリッド */}
            <div className="space-y-4">
              {CONTINENTS.map((cont) => {
                const countries = COUNTRIES.filter((c) => c.continent === cont.id);
                const visitedInCont = countries.filter((c) => (worldScores[c.id] ?? 0) > 0).length;
                return (
                  <div key={cont.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cont.emoji}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{cont.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{visitedInCont}/{countries.length}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {countries.map((country) => {
                        const level = worldScores[country.id] ?? 0;
                        const lv = LEVELS[level];
                        return (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() => openDialog(country.id, true)}
                            className="flex flex-col items-center gap-1 rounded-xl border py-3 transition hover:brightness-95 active:scale-95"
                            style={{
                              backgroundColor: level === 0 ? "#F8FAFC" : lv.bg,
                              borderColor: level === 0 ? "#E5E7EB" : lv.border,
                            }}
                          >
                            <span className="text-3xl leading-none">{country.flag}</span>
                            <span className="text-[10px] font-semibold leading-tight text-slate-600 dark:text-slate-300">{country.name}</span>
                            {level > 0 && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: lv.dot }}>
                                {level}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                    <div className="grid grid-cols-3 gap-1.5">
                      {countries.map((country) => {
                        const level = worldScores[country.id] ?? 0;
                        const lv = LEVELS[level];
                        return (
                          <button key={country.id} type="button" onClick={() => openDialog(country.id, true)}
                            className="flex items-center gap-2 rounded-xl border px-2.5 py-2 transition hover:brightness-95 active:scale-95"
                            style={{ backgroundColor: level === 0 ? "#FAFAFA" : lv.bg, borderColor: level === 0 ? "#E5E7EB" : lv.border }}
                          >
                            <span className="text-base leading-none">{country.flag}</span>
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{country.name}</span>
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
    </div>
  );
}
