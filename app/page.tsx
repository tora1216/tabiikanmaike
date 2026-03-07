"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTrips } from "@/components/trip-context";

export default function Home() {
  const router = useRouter();
  const { trips, addTrip, removeTrip, updateTrip } = useTrips();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  const handleAddTrip = () => {
    if (!title || !startDate || !endDate) {
      alert("タイトルと日程は必須です。");
      return;
    }

    const newTrip = addTrip({
      title,
      startDate,
      endDate,
      description: description.trim(),
      days: [],
    });

    resetForm();
    setIsDialogOpen(false);
    router.push(`/trips/${newTrip.id}`);
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("このページのURLをコピーしました。");
    } catch (e) {
      alert("URLのコピーに失敗しました。");
    }
  };

  const openEditDialog = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setEditingTripId(tripId);
    setEditTitle(trip.title);
    setEditStartDate(trip.startDate);
    setEditEndDate(trip.endDate);
    setEditDescription(trip.description ?? "");
    setIsEditDialogOpen(true);
  };

  const resetEditForm = () => {
    setEditingTripId(null);
    setEditTitle("");
    setEditStartDate("");
    setEditEndDate("");
    setEditDescription("");
  };

  const handleUpdateTrip = () => {
    if (!editingTripId) return;
    if (!editTitle || !editStartDate || !editEndDate) {
      alert("タイトルと日程は必須です。");
      return;
    }

    updateTrip(editingTripId, (current) => ({
      ...current,
      title: editTitle,
      startDate: editStartDate,
      endDate: editEndDate,
      description: editDescription.trim(),
    }));

    setIsEditDialogOpen(false);
    resetEditForm();
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">旅のしおり</h1>
            <p className="mt-1 text-sm text-zinc-500">
              行きたい旅・行った旅のプランを一覧で管理しましょう。
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
          >
            共有
          </button>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-800">旅の一覧</h2>
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-700"
            >
              旅を追加
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
              >
                <button
                  type="button"
                  aria-label="旅を編集"
                  className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(trip.id);
                  }}
                >
                  <span className="text-lg leading-none">⚙</span>
                </button>

                <Link
                  href={`/trips/${trip.id}`}
                  className="flex flex-1 flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {trip.startDate} 〜 {trip.endDate}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                      {trip.description || "まだ説明はありません。"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">
              新しい旅を追加
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              タイトル・日程・ラベルを入力してください。
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  タイトル *
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例）夏の北海道ドライブ旅"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    開始日 *
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    終了日 *
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  旅の概要
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="この旅でやりたいことや目的を書いておきましょう。"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-sm">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-zinc-500 hover:bg-zinc-100"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleAddTrip}
                className="rounded-full bg-sky-600 px-4 py-1.5 font-medium text-white hover:bg-sky-700"
              >
                追加して詳細へ
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditDialogOpen && editingTripId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">
              旅の情報を編集
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              タイトル・日程・概要を編集できます。
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  タイトル *
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    開始日 *
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    終了日 *
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  旅の概要
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none ring-sky-500 focus:ring-1"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (
                    window.confirm(
                      "この旅を削除してもよろしいですか？この操作は取り消せません。",
                    )
                  ) {
                    removeTrip(editingTripId);
                    setIsEditDialogOpen(false);
                    resetEditForm();
                  }
                }}
              >
                <span className="text-base leading-none">🗑</span>
                <span>削除</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-zinc-500 hover:bg-zinc-100"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetEditForm();
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleUpdateTrip}
                  className="rounded-full bg-sky-600 px-4 py-1.5 font-medium text-white hover:bg-sky-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
