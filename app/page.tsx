"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTrips } from "@/components/trip-context";
import { PlusIcon, CalendarIcon, Cog6ToothIcon, TrashIcon, DocumentDuplicateIcon, UserCircleIcon, XMarkIcon, SunIcon, MoonIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { APP_VERSION, CHANGELOG } from "@/lib/changelog";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Trip } from "@/lib/trips";
import LZString from "lz-string";

const TRIP_COLORS = [
  "#3B82F6", "#0EA5E9", "#06B6D4", "#10B981",
  "#22C55E", "#84CC16", "#EAB308", "#F97316",
  "#EF4444", "#F43F5E", "#EC4899", "#F472B6",
];

const TRIP_ICONS = [
  { icon: "✈️", label: "飛行機" },
  { icon: "🚃", label: "電車" },
  { icon: "🚌", label: "バス" },
  { icon: "🚗", label: "車" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function tripDayCount(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function getTripStatus(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return "draft" as const;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const end = new Date(endDate); end.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((start.getTime() - today.getTime()) / 86400000);
  if (today > end) return "completed" as const;
  if (today >= start) return "ongoing" as const;
  if (daysUntil <= 7) return "soon" as const;
  return "planning" as const;
}

const STATUS_BADGE = {
  draft:     { label: "下書き", cls: "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500" },
  completed: { label: "完了",   cls: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400" },
  ongoing:   { label: "旅行中", cls: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" },
  soon:      { label: "もうすぐ", cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" },
  planning:  { label: "計画中", cls: "bg-indigo-50 text-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400" },
} as const;

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
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "planning" | "soon" | "ongoing" | "completed">("all");
  const [linkInput, setLinkInput] = useState("");
  const [linkImporting, setLinkImporting] = useState(false);
  const [linkResult, setLinkResult] = useState<"ok" | "error" | "already" | null>(null);
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
  const [addIcon, setAddIcon] = useState("✈️");
  const [addMembers, setAddMembers] = useState<string[]>([]);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [addError, setAddError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState(TRIP_COLORS[0]);
  const [editIcon, setEditIcon] = useState("✈️");
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [editMemberInput, setEditMemberInput] = useState("");
  const [editError, setEditError] = useState("");

  // inline member name editing (shared across both modals — only one open at a time)
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renamingVal, setRenamingVal] = useState("");

  const resetAdd = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setAddColor(TRIP_COLORS[0]);
    setAddIcon("✈️");
    setAddMembers([]);
    setAddMemberInput("");
    setAddError("");
  };

  const handleAdd = () => {
    if (!title) {
      setAddError("タイトルは必須項目です。");
      return;
    }
    if (startDate && !endDate) {
      setAddError("開始日を設定した場合は終了日も入力してください。");
      return;
    }
    if (!startDate && endDate) {
      setAddError("終了日を設定した場合は開始日も入力してください。");
      return;
    }
    addTrip({ title, startDate: startDate || undefined, endDate: endDate || undefined, description: description.trim(), days: [], color: addColor, tripIcon: addIcon, members: addMembers });
    resetAdd();
    setAddOpen(false);
  };

  const openEdit = (id: string) => {
    const t = trips.find((t) => t.id === id);
    if (!t) return;
    setEditId(id);
    setEditTitle(t.title);
    setEditStart(t.startDate ?? "");
    setEditEnd(t.endDate ?? "");
    setEditDesc(t.description ?? "");
    setEditColor(t.color ?? TRIP_COLORS[0]);
    setEditIcon(t.tripIcon ?? "✈️");
    setEditMembers(t.members ?? []);
    setEditMemberInput("");
    setEditOpen(true);
  };

  const handleCopy = () => {
    const t = trips.find((t) => t.id === editId);
    if (!t) return;
    addTrip({
      title: `${t.title}（コピー）`,
      startDate: t.startDate,
      endDate: t.endDate,
      description: t.description,
      days: t.days,
      packingList: t.packingList,
      todoList: t.todoList,
      notes: t.notes,
      tripIcon: t.tripIcon,
      members: t.members,
    });
    setEditOpen(false);
    setEditId(null);
  };

  const handleUpdate = () => {
    if (!editId || !editTitle) {
      setEditError("タイトルは必須項目です。");
      return;
    }
    if (editStart && !editEnd) {
      setEditError("開始日を設定した場合は終了日も入力してください。");
      return;
    }
    if (!editStart && editEnd) {
      setEditError("終了日を設定した場合は開始日も入力してください。");
      return;
    }
    updateTrip(editId, (c) => ({
      ...c,
      title: editTitle,
      startDate: editStart || undefined,
      endDate: editEnd || undefined,
      description: editDesc.trim(),
      color: editColor,
      tripIcon: editIcon,
      members: editMembers,
      status: undefined,
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
            <span className="text-xl">🐯</span>
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
            {trips.length > 0 ? `${[...trips].filter((t) => statusFilter === "all" || getTripStatus(t.startDate, t.endDate) === statusFilter).length}件の旅` : "旅の一覧"}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 outline-none transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">すべて</option>
              <option value="draft">下書き</option>
              <option value="planning">計画中</option>
              <option value="soon">もうすぐ</option>
              <option value="ongoing">旅行中</option>
              <option value="completed">完了</option>
            </select>
            <button
              onClick={() => setAddOpen(true)}
              className="hidden sm:flex items-center gap-1 rounded-full bg-[#22C55E] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-400 active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              新しい旅
            </button>
          </div>
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
            {[...trips].filter((t) => statusFilter === "all" || getTripStatus(t.startDate, t.endDate) === statusFilter).sort((a, b) => {
              const as_ = getTripStatus(a.startDate, a.endDate);
              const bs_ = getTripStatus(b.startDate, b.endDate);
              const rank = (s: string) => s === "completed" ? 2 : s === "draft" ? 1 : 0;
              if (rank(as_) !== rank(bs_)) return rank(as_) - rank(bs_);
              return (a.startDate ?? "").localeCompare(b.startDate ?? "");
            }).map((trip) => {
              const days = tripDayCount(trip.startDate, trip.endDate);
              const bannerColor = trip.color ?? TRIP_COLORS[0];
              const status = getTripStatus(trip.startDate, trip.endDate);
              const badge = STATUS_BADGE[status];
              const badgeLabel = status === "soon" ? (() => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const start = new Date(trip.startDate!); start.setHours(0, 0, 0, 0);
                const d = Math.ceil((start.getTime() - today.getTime()) / 86400000);
                return `あと${d}日`;
              })() : badge.label;
              return (
                <div
                  key={trip.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 ${status === "completed" ? "opacity-60 ring-slate-200/40 dark:ring-slate-700/40" : "ring-slate-200/60 dark:ring-slate-700"}`}
                >
                  {/* Color banner */}
                  <div className="relative h-20" style={{ backgroundColor: bannerColor }}>
                    <div className="absolute bottom-3 left-4 text-2xl">{trip.tripIcon ?? "✈️"}</div>
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
                    <div className="flex items-center gap-2">
                      <h3 className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-indigo-500 dark:text-white">
                        {trip.title}
                      </h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badgeLabel}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {trip.startDate && trip.endDate ? `${fmtDate(trip.startDate)} 〜 ${fmtDate(trip.endDate)}` : "日程未定"}
                      </span>
                    </div>
                    {trip.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {trip.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {days !== null && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          {days}日間
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {(trip.members?.length || trip.participants) ?? 0}人
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {trip.days.length}スポット
                      </span>
                      {trip.updatedAt && (
                        <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
                          更新 {new Date(trip.updatedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })} {new Date(trip.updatedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-lg transition hover:bg-green-400 active:scale-95 sm:hidden"
        aria-label="新しい旅"
      >
        <PlusIcon className="h-7 w-7" />
      </button>

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
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">移動手段</label>
              <div className="grid grid-cols-4 gap-2">
                {TRIP_ICONS.map(({ icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAddIcon(icon)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-sm transition-all ${
                      addIcon === icon
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 ring-2 ring-indigo-500"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
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
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">開始日<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
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
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">終了日{startDate ? " *" : <span className="ml-1 font-normal text-slate-400">（任意）</span>}</label>
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
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">メンバー名<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={addMemberInput}
                  onChange={(e) => setAddMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = addMemberInput.trim();
                      if (name && !addMembers.includes(name)) setAddMembers([...addMembers, name]);
                      setAddMemberInput("");
                    }
                  }}
                  placeholder="例）あおい"
                />
                <button
                  type="button"
                  onClick={() => {
                    const name = addMemberInput.trim();
                    if (name && !addMembers.includes(name)) setAddMembers([...addMembers, name]);
                    setAddMemberInput("");
                  }}
                  className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
                >追加</button>
              </div>
              {addMembers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {addMembers.map((m, idx) => renamingIdx === idx ? (
                    <span key={m} className="flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-0.5 dark:border-indigo-500 dark:bg-indigo-900/30">
                      <input
                        autoFocus
                        className="w-20 bg-transparent text-xs font-semibold text-indigo-600 outline-none dark:text-indigo-300"
                        value={renamingVal}
                        onChange={(e) => setRenamingVal(e.target.value)}
                        onBlur={() => {
                          const v = renamingVal.trim();
                          if (v && !addMembers.some((x, i) => x === v && i !== idx)) setAddMembers(addMembers.map((x, i) => i === idx ? v : x));
                          setRenamingIdx(null);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setRenamingIdx(null); }}
                      />
                    </span>
                  ) : (
                    <span key={m} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <button type="button" onClick={() => { setRenamingIdx(idx); setRenamingVal(m); }} className="hover:text-indigo-500">{m}</button>
                      <button type="button" onClick={() => setAddMembers(addMembers.filter((x) => x !== m))} className="text-slate-400 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">旅の概要<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
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
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">移動手段</label>
              <div className="grid grid-cols-4 gap-2">
                {TRIP_ICONS.map(({ icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setEditIcon(icon)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-sm transition-all ${
                      editIcon === icon
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 ring-2 ring-indigo-500"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
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
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">開始日<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
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
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">終了日{editStart ? " *" : <span className="ml-1 font-normal text-slate-400">（任意）</span>}</label>
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
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">メンバー名<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={editMemberInput}
                  onChange={(e) => setEditMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = editMemberInput.trim();
                      if (name && !editMembers.includes(name)) setEditMembers([...editMembers, name]);
                      setEditMemberInput("");
                    }
                  }}
                  placeholder="例）あおい"
                />
                <button
                  type="button"
                  onClick={() => {
                    const name = editMemberInput.trim();
                    if (name && !editMembers.includes(name)) setEditMembers([...editMembers, name]);
                    setEditMemberInput("");
                  }}
                  className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
                >追加</button>
              </div>
              {editMembers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {editMembers.map((m, idx) => renamingIdx === idx ? (
                    <span key={m} className="flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-0.5 dark:border-indigo-500 dark:bg-indigo-900/30">
                      <input
                        autoFocus
                        className="w-20 bg-transparent text-xs font-semibold text-indigo-600 outline-none dark:text-indigo-300"
                        value={renamingVal}
                        onChange={(e) => setRenamingVal(e.target.value)}
                        onBlur={() => {
                          const v = renamingVal.trim();
                          if (v && !editMembers.some((x, i) => x === v && i !== idx)) setEditMembers(editMembers.map((x, i) => i === idx ? v : x));
                          setRenamingIdx(null);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setRenamingIdx(null); }}
                      />
                    </span>
                  ) : (
                    <span key={m} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <button type="button" onClick={() => { setRenamingIdx(idx); setRenamingVal(m); }} className="hover:text-indigo-500">{m}</button>
                      <button type="button" onClick={() => setEditMembers(editMembers.filter((x) => x !== m))} className="text-slate-400 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">旅の概要<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
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
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
                onClick={() => {
                  const trip = trips.find((t) => t.id === editId);
                  const msg = trip?.shareId
                    ? "この旅を削除すると共有リンクも無効になります。\n本当に削除してもよろしいですか？"
                    : "この旅を削除してもよろしいですか？";
                  if (window.confirm(msg)) {
                    removeTrip(editId);
                    setEditOpen(false);
                    setEditId(null);
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
                削除
              </button>
              <button
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                onClick={handleCopy}
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                コピー
              </button>
            </div>
            <button
              className="rounded-full bg-[#22C55E] px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
              onClick={handleUpdate}
            >
              保存
            </button>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <Modal title="設定" onClose={() => setSettingsOpen(false)}>
          <div className="mt-5 space-y-5">
            {/* Add to Home Screen - only show when not installed and supported */}
            {!isInstalled && (isIOS || deferredPrompt) && (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpOnSquareIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">ホーム画面に追加</span>
              </div>
              {isIOS ? (
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
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full rounded-xl bg-[#22C55E] py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
                >
                  ホーム画面にインストール
                </button>
              )}
            </div>
            )}
            {/* データの追加 */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-3 text-sm font-bold text-slate-800 dark:text-white">データの追加</p>
              <div className="space-y-2">
                {/* Link import */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">共有リンクから旅をインポート</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="共有リンクを貼り付け"
                      value={linkInput}
                      onChange={(e) => { setLinkInput(e.target.value); setLinkResult(null); }}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[16px] leading-tight text-slate-700 outline-none focus:border-indigo-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      disabled={!linkInput.trim() || linkImporting}
                      onClick={async () => {
                        setLinkImporting(true);
                        setLinkResult(null);
                        try {
                          const raw = linkInput.trim();

                          // LZ圧縮形式（/trips/import?data=...）
                          const lzMatch = raw.match(/[?&]data=([^&]+)/);
                          if (lzMatch) {
                            const lzKey = lzMatch[1];
                            const importedLz = (() => { try { return JSON.parse(localStorage.getItem("imported_lz_shares") ?? "[]") as string[]; } catch { return []; } })();
                            if (importedLz.includes(lzKey) && (() => { try { const decompressed = LZString.decompressFromEncodedURIComponent(lzKey); const t = JSON.parse(decompressed ?? "") as Trip; return trips.some((x) => x.title === t.title && x.startDate === t.startDate && x.endDate === t.endDate); } catch { return false; } })()) {
                              setLinkResult("already"); setLinkImporting(false); return;
                            }
                            const decompressed = LZString.decompressFromEncodedURIComponent(lzKey);
                            const trip = JSON.parse(decompressed ?? decodeURIComponent(lzKey)) as Trip;
                            addTrip({
                              title: trip.title, startDate: trip.startDate, endDate: trip.endDate,
                              description: trip.description, days: trip.days,
                              packingList: trip.packingList, notes: trip.notes, noteEntries: trip.noteEntries,
                              color: trip.color, tripIcon: trip.tripIcon, members: trip.members, participants: trip.participants,
                            });
                            try { localStorage.setItem("imported_lz_shares", JSON.stringify([...importedLz, lzKey])); } catch { /* ignore */ }
                            setLinkInput("");
                            setLinkResult("ok");
                            setLinkImporting(false);
                            return;
                          }

                          // Firestore形式（/view/{shareId}）
                          const match = raw.match(/\/view\/([A-Za-z0-9_-]+)/);
                          if (!match) throw new Error("invalid");
                          const shareId = match[1];
                          const alreadyImported = (() => {
                            try { return (JSON.parse(localStorage.getItem("imported_shares") ?? "[]") as string[]).includes(shareId); } catch { return false; }
                          })();
                          if (alreadyImported && trips.some((t) => t.shareId === shareId)) {
                            setLinkResult("already"); setLinkImporting(false); return;
                          }
                          if (!db) throw new Error("db not initialized");
                          const snap = await getDoc(doc(db, "shared_trips", shareId));
                          if (!snap.exists()) throw new Error("not found");
                          const trip = snap.data().trip as Trip;
                          addTrip({
                            title: trip.title, startDate: trip.startDate, endDate: trip.endDate,
                            description: trip.description, days: trip.days,
                            packingList: trip.packingList, notes: trip.notes, noteEntries: trip.noteEntries,
                            color: trip.color, tripIcon: trip.tripIcon,
                            members: trip.members, participants: trip.participants,
                            shareId, shareOwner: false,
                          });
                          try {
                            const done = JSON.parse(localStorage.getItem("imported_shares") ?? "[]") as string[];
                            if (!done.includes(shareId)) localStorage.setItem("imported_shares", JSON.stringify([...done, shareId]));
                          } catch { /* ignore */ }
                          setLinkInput("");
                          setLinkResult("ok");
                        } catch {
                          setLinkResult("error");
                        } finally {
                          setLinkImporting(false);
                        }
                      }}
                      className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {linkImporting ? "…" : "追加"}
                    </button>
                  </div>
                  {linkResult === "ok" && <p className="text-xs text-green-500">旅を追加しました ✓</p>}
                  {linkResult === "already" && <p className="text-xs text-amber-500">この旅はすでにインポート済みです</p>}
                  {linkResult === "error" && <p className="text-xs text-red-500">リンクが無効か、旅が見つかりません</p>}
                </div>
              </div>
            </div>

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
          </div>
        </Modal>
      )}
    </div>
  );
}
