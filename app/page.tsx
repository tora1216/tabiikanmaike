"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTrips } from "@/components/trip-context";
import { PlusIcon, CalendarIcon, Cog6ToothIcon, TrashIcon, DocumentDuplicateIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-indigo-400 to-blue-600",
];

function hashGradient(id: string) {
  let h = 0;
  for (const c of id) {
    h = (h << 5) - h + c.charCodeAt(0);
    h |= 0;
  }
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function tripDayCount(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[16px] text-slate-900 outline-none ring-[#3EA8FF] focus:bg-white focus:ring-2 transition-all placeholder:text-slate-400";

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
        className="relative w-full max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [addError, setAddError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");

  const resetAdd = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
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
    addTrip({ title, startDate, endDate, description: description.trim(), days: [] });
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
    }));
    setEditError("");
    setEditOpen(false);
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="text-base font-extrabold tracking-tight text-slate-900">旅いかんまいけ</span>
          </div>
          <Link href="/profile" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <UserCircleIcon className="h-7 w-7" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3EA8FF] via-sky-500 to-blue-600 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-200">
            Travel Planner
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">旅いかんまいけ</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sky-100 sm:text-base">
            行きたい旅・行った旅のプランを管理。日別スケジュールをまとめて、思い出の旅をカタチにしましょう。
          </p>
        </div>
      </section>

      {/* Trips */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600">
            {trips.length > 0 ? `${trips.length}件の旅` : "旅の一覧"}
          </h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[#3EA8FF] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400 active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            新しい旅
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
            <span className="text-5xl">🗺️</span>
            <p className="mt-4 text-base font-bold text-slate-600">まだ旅がありません</p>
            <p className="mt-1 text-sm text-slate-400">「新しい旅」から最初の旅を作りましょう。</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-6 flex items-center gap-1.5 rounded-full bg-[#3EA8FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400"
            >
              <PlusIcon className="h-4 w-4" />
              旅を追加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const days = tripDayCount(trip.startDate, trip.endDate);
              const grad = hashGradient(trip.id);
              return (
                <div
                  key={trip.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Gradient banner */}
                  <div className={`relative h-20 bg-gradient-to-br ${grad}`}>
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
                    <h3 className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-[#3EA8FF]">
                      {trip.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {fmtDate(trip.startDate)} 〜 {fmtDate(trip.endDate)}
                      </span>
                    </div>
                    {trip.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {trip.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {days}日間
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
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
          onClose={() => {
            resetAdd();
            setAddOpen(false);
          }}
        >
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">タイトル *</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例）夏の北海道ドライブ旅"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">開始日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">終了日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">旅の概要</label>
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
              className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
              onClick={() => {
                resetAdd();
                setAddOpen(false);
              }}
            >
              キャンセル
            </button>
            <button
              className="rounded-full bg-[#3EA8FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
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
          onClose={() => {
            setEditError("");
            setEditOpen(false);
            setEditId(null);
          }}
        >
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">タイトル *</label>
              <input
                className={inputCls}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">開始日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">終了日 *</label>
                <input
                  type="date"
                  className={`${inputCls} appearance-none`}
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">旅の概要</label>
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
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
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
                className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
                onClick={() => {
                  setEditError("");
                  setEditOpen(false);
                  setEditId(null);
                }}
              >
                キャンセル
              </button>
              <button
                className="rounded-full bg-[#3EA8FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                onClick={handleUpdate}
              >
                保存
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
