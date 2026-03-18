"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTrips } from "@/components/trip-context";
import { PlusIcon, CalendarIcon, Cog6ToothIcon, TrashIcon, DocumentDuplicateIcon, UserCircleIcon, XMarkIcon, SunIcon, MoonIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { APP_VERSION, CHANGELOG } from "@/lib/changelog";

const TRIP_COLORS = [
  "#6366F1", "#3B82F6", "#F97316", "#EC4899",
  "#8B5CF6", "#EF4444", "#14B8A6", "#EAB308",
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function tripDayCount(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[16px] text-slate-900 outline-none ring-indigo-500 focus:bg-white focus:ring-2 transition-all placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-600";

function ColorSwatch({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full transition-transform hover:scale-110 flex-shrink-0"
          style={{ backgroundColor: c, outline: value === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { trips, addTrip, removeTrip, updateTrip } = useTrips();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    const seen = localStorage.getItem("seen_version");
    if (seen !== APP_VERSION) setHasUnread(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const openSettings = () => {
    setSettingsOpen(true);
    setHasUnread(false);
    localStorage.setItem("seen_version", APP_VERSION);
  };
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [addColor, setAddColor] = useState(TRIP_COLORS[0]);
  const [addError, setAddError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState(TRIP_COLORS[0]);
  const [editError, setEditError] = useState("");

  const resetAdd = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setAddColor(TRIP_COLORS[0]);
    setAddError("");
  };

  const handleAdd = () => {
    if (!title || !startDate || !endDate) {
      setAddError("タイトルと日程は必須項目です。");
      return;
    }
    if (startDate > endDate) {
      setAddError("終了日は開始日より後の日付を設定してください。");
      return;
    }
    addTrip({ title, startDate, endDate, description: description.trim(), days: [], color: addColor });
    resetAdd();
    setAddOpen(false);
  };

  const openEdit = (id: string) => {
    const t = trips.find((t) => t.id === id);
    if (!t) return;
    setEditId(id);
    setEditTitle(t.title);
    setEditStart(t.startDate);
    setEditEnd(t.endDate);
    setEditDesc(t.description ?? "");
    setEditColor(t.color ?? TRIP_COLORS[0]);
    setEditOpen(true);
  };

  const handleCopy = () => {
    const t = trips.find((t) => t.id === editId);
    if (!t) return;
    const copied = addTrip({
      title: `${t.title}（コピー）`,
      startDate: t.startDate,
      endDate: t.endDate,
      description: t.description,
      days: t.days,
      packingList: t.packingList,
      notes: t.notes,
    });
    setEditOpen(false);
    setEditId(null);
    router.push(`/trips?id=${copied.id}`);
  };

  const handleUpdate = () => {
    if (!editId || !editTitle || !editStart || !editEnd) {
      setEditError("タイトルと日程は必須項目です。");
      return;
    }
    if (editStart > editEnd) {
      setEditError("終了日は開始日より後の日付を設定してください。");
      return;
    }
    updateTrip(editId, (c) => ({
      ...c,
      title: editTitle,
      startDate: editStart,
      endDate: editEnd,
      description: editDesc.trim(),
      color: editColor,
    }));
    setEditError("");
    setEditOpen(false);
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:bg-slate-800/90 dark:border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">旅のしおり</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label="テーマ切替"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="relative rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label="設定"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            <Link href="/profile" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
              <UserCircleIcon className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-200">
            Travel Planner
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">旅のしおり</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sky-100 sm:text-base">
            行きたい旅・行った旅のプランを管理。日別スケジュールをまとめて、思い出の旅をカタチにしましょう。
          </p>
        </div>
      </section>

      {/* Trips */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {trips.length > 0 ? `${trips.length}件の旅` : "旅の一覧"}
          </h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[#22C55E] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-400 active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            新しい旅
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="text-5xl">🗺️</span>
            <p className="mt-4 text-base font-bold text-slate-600 dark:text-slate-300">まだ旅がありません</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">「新しい旅」から最初の旅を作りましょう。</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-6 flex items-center gap-1.5 rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-400"
            >
              <PlusIcon className="h-4 w-4" />
              旅を追加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...trips].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((trip) => {
              const days = tripDayCount(trip.startDate, trip.endDate);
              const bannerColor = trip.color ?? TRIP_COLORS[0];
              return (
                <div
                  key={trip.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700"
                >
                  {/* Color banner */}
                  <div className="relative h-20" style={{ backgroundColor: bannerColor }}>
                    <div className="absolute bottom-3 left-4 text-2xl">✈️</div>
                    <button
                      type="button"
                      aria-label="編集"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(trip.id);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/20 p-1.5 text-white transition-colors hover:bg-black/35"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Card body */}
                  <Link href={`/trips?id=${trip.id}`} className="block p-4">
                    <h3 className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-indigo-500 dark:text-white">
                      {trip.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {fmtDate(trip.startDate)} 〜 {fmtDate(trip.endDate)}
                      </span>
                    </div>
                    {trip.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {trip.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {days}日間
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {trip.days.length}スポット
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {addOpen && (
        <Modal
          title="新しい旅を追加"
          subtitle="タイトルと日程を入力してください。"
          onClose={() => { resetAdd(); setAddOpen(false); }}
        >
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">カラー</label>
              <ColorSwatch colors={TRIP_COLORS} value={addColor} onChange={setAddColor} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">タイトル *</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例）夏の北海道ドライブ旅"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">開始日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate("");
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">終了日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    if (startDate && e.target.value < startDate) {
                      setEndDate("");
                      setAddError("終了日は開始日より後の日付を設定してください。");
                    } else {
                      setAddError("");
                      setEndDate(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">旅の概要</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="この旅でやりたいことを書いておきましょう。"
              />
            </div>
          </div>
          {addError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">{addError}</p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              onClick={() => {
                resetAdd();
                setAddOpen(false);
              }}
            >
              キャンセル
            </button>
            <button
              className="rounded-full bg-[#22C55E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
              onClick={handleAdd}
            >
              追加
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editOpen && editId && (
        <Modal
          title="旅の情報を編集"
          onClose={() => { setEditError(""); setEditOpen(false); setEditId(null); }}
        >
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">カラー</label>
              <ColorSwatch colors={TRIP_COLORS} value={editColor} onChange={setEditColor} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">タイトル *</label>
              <input
                className={inputCls}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">開始日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={editStart}
                  onChange={(e) => {
                    setEditStart(e.target.value);
                    if (editEnd && e.target.value > editEnd) setEditEnd("");
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">終了日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={editEnd}
                  min={editStart || undefined}
                  onChange={(e) => {
                    if (editStart && e.target.value < editStart) {
                      setEditEnd("");
                      setEditError("終了日は開始日より後の日付を設定してください。");
                    } else {
                      setEditError("");
                      setEditEnd(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">旅の概要</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
          </div>
          {editError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">{editError}</p>
          )}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={handleCopy}
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                コピー
              </button>
              <button
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
                onClick={() => {
                  if (window.confirm("この旅を削除してもよろしいですか？")) {
                    removeTrip(editId);
                    setEditOpen(false);
                    setEditId(null);
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
                削除
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={() => {
                  setEditError("");
                  setEditOpen(false);
                  setEditId(null);
                }}
              >
                キャンセル
              </button>
              <button
                className="rounded-full bg-[#22C55E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
                onClick={handleUpdate}
              >
                保存
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <Modal title="設定" onClose={() => setSettingsOpen(false)}>
          <div className="mt-5 space-y-5">
            {/* バージョン・アップデート情報 */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 dark:text-white">アップデート情報</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">v{APP_VERSION}</span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {CHANGELOG.map((entry, i) => (
                  <div key={entry.version}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${i === 0 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                        v{entry.version}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{entry.title}</span>
                      <span className="ml-auto text-[10px] text-slate-400">{entry.date}</span>
                    </div>
                    <ul className="space-y-0.5 pl-2">
                      {entry.changes.map((c, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                          {c}
                        </li>
                      ))}
                    </ul>
                    {i < CHANGELOG.length - 1 && <div className="mt-3 border-b border-slate-100 dark:border-slate-700" />}
                  </div>
                ))}
              </div>
            </div>
            {/* Add to Home Screen */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpOnSquareIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">ホーム画面に追加</span>
              </div>
              {isInstalled ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">すでにホーム画面に追加されています。</p>
              ) : isIOS ? (
                <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">1</span>
                    <span>画面下部の共有ボタン <span className="inline-flex items-baseline gap-0.5 font-semibold">(<ArrowUpOnSquareIcon className="h-3.5 w-3.5 inline" />) </span>をタップ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">2</span>
                    <span>「ホーム画面に追加」を選択</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">3</span>
                    <span>「追加」をタップして完了</span>
                  </li>
                </ol>
              ) : deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="w-full rounded-xl bg-[#22C55E] py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
                >
                  ホーム画面にインストール
                </button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">お使いのブラウザでは自動インストールに対応していません。ブラウザのメニューから「ホーム画面に追加」を選択してください。</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
