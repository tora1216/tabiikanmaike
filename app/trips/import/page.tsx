"use client";

import { Suspense, useState } from "react";
import LZString from "lz-string";
import { useSearchParams, useRouter } from "next/navigation";
import { useTrips } from "@/components/trip-context";
import type { Trip } from "@/lib/trips";
import Link from "next/link";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

function ImportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addTrip } = useTrips();
  const [imported, setImported] = useState(false);
  const [error, setError] = useState("");

  const raw = searchParams.get("data");

  let trip: Trip | null = null;
  try {
    if (raw) {
      const decompressed = LZString.decompressFromEncodedURIComponent(raw);
      trip = JSON.parse(decompressed ?? decodeURIComponent(raw)) as Trip;
    }
  } catch {
    // parse error handled below
  }

  if (!raw || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F0F5FA] px-4">
        <p className="text-sm text-slate-500">無効な共有リンクです。</p>
        <Link href="/" className="text-sm font-semibold text-blue-500 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const handleImport = () => {
    try {
      const newTrip = addTrip({
        title: trip!.title,
        startDate: trip!.startDate,
        endDate: trip!.endDate,
        description: trip!.description,
        days: trip!.days,
        packingList: trip!.packingList,
        notes: trip!.notes,
        noteEntries: trip!.noteEntries,
        color: trip!.color,
        tripIcon: trip!.tripIcon,
        members: trip!.members,
        participants: trip!.participants,
        shareOwner: false,
      });
      setImported(true);
      setTimeout(() => router.push(`/trips?id=${newTrip.id}`), 800);
    } catch {
      setError("インポートに失敗しました。");
    }
  };

  const totalDays = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1
    : Math.max(trip.days?.reduce((m, a) => Math.max(m, a.day), 0) ?? 0, 1);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#F0F5FA] px-4 py-10">
      <div className="mx-auto max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />一覧に戻る
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <PaperAirplaneIcon className="h-6 w-6 text-blue-500" />
          </div>

          <p className="mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">共有された旅程</p>
          <h1 className="text-xl font-black text-slate-900">{trip.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {trip.startDate && trip.endDate ? `${fmt(trip.startDate)} 〜 ${fmt(trip.endDate)}（${totalDays}日間）` : "日程未定"}
          </p>
          {trip.description && (
            <p className="mt-2 text-sm text-slate-600">{trip.description}</p>
          )}

          {/* Activity summary */}
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">旅程の概要</p>
            <ul className="space-y-1">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((n) => {
                const acts = trip!.days.filter((d) => d.day === n);
                return (
                  <li key={n} className="text-xs text-slate-600">
                    <span className="font-semibold">Day {n}</span>
                    {acts.length > 0
                      ? `：${acts.map((a) => a.destination).join("、")}`
                      : "：予定なし"}
                  </li>
                );
              })}
            </ul>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          <button
            type="button"
            onClick={handleImport}
            disabled={imported}
            className="mt-5 w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {imported ? "追加しました ✓" : "自分の旅程に追加する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]"><p className="text-sm text-slate-400">読み込み中...</p></div>}>
      <ImportContent />
    </Suspense>
  );
}
