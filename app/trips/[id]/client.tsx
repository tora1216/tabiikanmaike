"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useTrips } from "@/components/trip-context";
import { TripActivity, Trip } from "@/lib/trips";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  useDroppable,
} from "@dnd-kit/core";

function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { sortable: { containerId: id } },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[50px] transition-colors ${
        isOver ? "bg-sky-50" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortableItem({ activity, onEdit, onDelete }: { activity: TripActivity; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.time + activity.destination }); // unique id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative cursor-move">
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="flex flex-col gap-1">
          {/* icon + destination */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{activity.icon}</span>
            <span className="text-sm text-zinc-900 font-medium">{activity.destination}</span>
          </div>
          {/* time, memo, cost */}
          <div className="text-xs text-zinc-500">{activity.time}</div>
          {activity.memo && (
            <p className="text-xs text-zinc-600">{activity.memo}</p>
          )}
          {activity.cost !== undefined && activity.cost > 0 && (
            <p className="text-xs text-zinc-600">費用: ¥{activity.cost.toLocaleString()}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="p-1 text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 text-red-600 hover:text-red-800"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export function TripDetailClient({ tripId }: { tripId: string }) {
  const { trips, updateTrip } = useTrips();
  const trip = trips.find((t) => t.id === tripId);

  const [day, setDay] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dayTime, setDayTime] = useState("");
  const [dayIcon, setDayIcon] = useState("");
  const [dayDestination, setDayDestination] = useState("");
  const [memo, setMemo] = useState("");
  const [cost, setCost] = useState(0);
  const [editingActivity, setEditingActivity] = useState<TripActivity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activityId = active.id as string;
    // if we dropped on an item, retrieve container id; otherwise use over.id
    let targetId: string;
    if (over.data.current?.sortable?.containerId) {
      targetId = over.data.current.sortable.containerId as string;
    } else {
      targetId = over.id as string;
    }

    let newDay: number;
    if (targetId.startsWith("day-")) {
      newDay = parseInt(targetId.replace("day-", ""));
    } else if (targetId === "unassigned") {
      newDay = 0;
    } else {
      return;
    }

    updateTrip(trip!.id, (current) => ({
      ...current,
      days: current.days.map(d => {
        if (d.time + d.destination === activityId) {
          return { ...d, day: newDay };
        }
        return d;
      }),
    }));
  }

  const getTripDays = () => {
    if (!trip) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const tripDays = getTripDays();
  const availableDays = trip ? Array.from({ length: tripDays }, (_, i) => i + 1).filter(d => !trip.days.some(day => day.day === d)) : [];

  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(day)) {
      setDay(availableDays[0]);
    }
  }, [availableDays, day]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-8">
          <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <h1 className="text-xl font-semibold text-zinc-900">
              旅が見つかりませんでした
            </h1>
            <Link
              href="/"
              className="text-xs font-medium text-sky-600 underline-offset-2 hover:underline"
            >
              旅の一覧に戻る
            </Link>
          </header>
          <p className="text-sm text-zinc-600">
            URL が間違っているか、この旅は削除された可能性があります。
          </p>
        </main>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-500">
              {trip.startDate} 〜 {trip.endDate}
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {trip.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="rounded-full border border-zinc-200 px-3 py-1 font-medium text-zinc-600 hover:bg-zinc-100"
            >
              旅の一覧に戻る
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-6">
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-800">旅の概要</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                {trip.description || "この旅の概要はまだ入力されていません。"}
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-800">
                  日別プラン
                </h2>
                {trip.days.length > 0 && (
                  <p className="text-[11px] text-zinc-500">
                    全 {tripDays} 日のスケジュール
                  </p>
                )}
              </div>

              {trip.days.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                  まだ日別プランがありません。画面右下の＋ボタンから追加してみましょう。
                </p>
              ) : (
                <div className="space-y-4">
              {Array.from(new Set(trip.days.filter(d => d.day > 0).map(d => d.day))).sort((a, b) => a - b).map(day => {
                    const dayActivities = trip.days.filter(d => d.day === day);
                    return (
                      <DroppableArea key={day} id={`day-${day}`}>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="whitespace-nowrap inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                              Day {day}
                            </span>
                          </div>
                          <ol className="flex flex-col gap-2">
                            <SortableContext items={dayActivities.map(a => a.time + a.destination)} strategy={verticalListSortingStrategy}>
                              {dayActivities.map((activity) => (
                                <SortableItem
                                  key={activity.time + activity.destination}
                                  activity={activity}
                                  onEdit={() => {
                                    setEditingActivity(activity);
                                    const [start, end] = activity.time.split(" - ");
                                    setStartTime(start || "");
                                    setEndTime(end || "");
                                    setDayIcon(activity.icon);
                                    setDayDestination(activity.destination);
                                    setMemo(activity.memo || "");
                                    setCost(activity.cost || 0);
                                    setDay(activity.day);
                                    setIsDialogOpen(true);
                                  }}
                                  onDelete={() => {
                                    if (confirm('削除してよろしいですか？')) {
                                      updateTrip(trip.id, (current) => ({
                                        ...current,
                                        days: current.days.filter((_, i) => _ !== activity),
                                      }));
                                    }
                                  }}
                                />
                              ))}
                            </SortableContext>
                          </ol>
                        </div>
                      </DroppableArea>
                    );
                  })}
                </div>
              )}

              {/* Unassigned Activities */}
              {trip.days.some(d => d.day === 0) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-zinc-800">未割り当てのアクティビティ</h2>
                  <DroppableArea id="unassigned">
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                      <ol className="relative flex flex-col gap-2 pl-3">
                        <SortableContext items={trip.days.filter(d => d.day === 0).map(a => a.time + a.destination)} strategy={verticalListSortingStrategy}>
                          {trip.days.filter(d => d.day === 0).map((activity) => (
                            <SortableItem
                              key={activity.time + activity.destination}
                              activity={activity}
                              onEdit={() => {
                                setEditingActivity(activity);
                                const [start, end] = activity.time.split(" - ");
                                setStartTime(start || "");
                                setEndTime(end || "");
                                setDayIcon(activity.icon);
                                setDayDestination(activity.destination);
                                setMemo(activity.memo || "");
                                setCost(activity.cost || 0);
                                setDay(activity.day);
                                setIsDialogOpen(true);
                              }}
                              onDelete={() => {
                                updateTrip(trip.id, (current) => ({
                                  ...current,
                                  days: current.days.filter((_, i) => _ !== activity),
                                }));
                              }}
                            />
                          ))}
                        </SortableContext>
                      </ol>
                    </div>
                  </DroppableArea>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Floating Add Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-700"
        onClick={() => {
          setStartTime("");
          setEndTime("");
          setDayIcon("");
          setDayDestination("");
          setMemo("");
          setCost(0);
          setIsAddDialogOpen(true);
        }}
      >
        <PlusIcon className="h-6 w-6" />
      </button>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">アクティビティを編集</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700">アイコン</label>
                <select
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={dayIcon}
                  onChange={(e) => setDayIcon(e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="🍚">🍚</option>
                  <option value="📷">📷</option>
                  <option value="🏨">🏨</option>
                  <option value="🛍️">🛍️</option>
                  <option value="🚌">🚌</option>
                  <option value="🚆">🚆</option>
                  <option value="✈️">✈️</option>
                  <option value="🚗">🚗</option>
                  <option value="🚶">🚶</option>
                  <option value="🚢">🚢</option>
                  <option value="🔧">🔧</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">行先</label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={dayDestination}
                  onChange={(e) => setDayDestination(e.target.value)}
                  placeholder="例）東京スカイツリー"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">開始時間</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">終了時間</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">メモ</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例）朝早めに出発して混雑を避ける"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">費用 (円)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={cost}
                  onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                  placeholder="例）1000"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                onClick={() => {
                  if (!startTime || !endTime || !dayIcon || !dayDestination) return;
                  updateTrip(trip.id, (current) => ({
                    ...current,
                    days: current.days.map(d =>
                      d === editingActivity
                        ? {
                            ...d,
                            time: `${startTime} - ${endTime}`,
                            icon: dayIcon,
                            destination: dayDestination,
                            memo: memo || undefined,
                            cost: cost > 0 ? cost : undefined,
                          }
                        : d
                    ),
                  }));
                  setIsDialogOpen(false);
                  setEditingActivity(null);
                  setStartTime("");
                  setEndTime("");
                  setDayIcon("");
                  setDayDestination("");
                  setMemo("");
                  setCost(0);
                }}
              >
                保存
              </button>
              <button
                type="button"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingActivity(null);
                  setStartTime("");
                  setEndTime("");
                  setDayIcon("");
                  setDayDestination("");
                  setMemo("");
                  setCost(0);
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">アクティビティを追加</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  アイコン *
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={dayIcon}
                  onChange={(e) => setDayIcon(e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="🍚">🍚</option>
                  <option value="📷">📷</option>
                  <option value="🏨">🏨</option>
                  <option value="🛍️">🛍️</option>
                  <option value="🚌">🚌</option>
                  <option value="🚆">🚆</option>
                  <option value="✈️">✈️</option>
                  <option value="🚗">🚗</option>
                  <option value="🚶">🚶</option>
                  <option value="🚢">🚢</option>
                  <option value="🔧">🔧</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">
                  行先 *
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={dayDestination}
                  onChange={(e) => setDayDestination(e.target.value)}
                  placeholder="例）東京スカイツリー"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    開始時間
                  </label>
                  <input
                    type="time"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    終了時間
                  </label>
                  <input
                    type="time"
                    className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">メモ</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例）朝早めに出発して混雑を避ける"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700">費用 (円)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs outline-none ring-sky-500 focus:ring-1"
                  value={cost}
                  onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                  placeholder="例）1000"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                onClick={() => {
                  if (!startTime || !endTime || !dayIcon || !dayDestination) return;
                  updateTrip(trip.id, (current) => ({
                    ...current,
                    days: [
                      ...current.days,
                      {
                        day: 0,
                        time: `${startTime} - ${endTime}`,
                        icon: dayIcon,
                        destination: dayDestination,
                        memo: memo || undefined,
                        cost: cost > 0 ? cost : undefined,
                      },
                    ],
                  }));
                  setIsAddDialogOpen(false);
                  setStartTime("");
                  setEndTime("");
                  setDayIcon("");
                  setDayDestination("");
                  setMemo("");
                  setCost(0);
                }}
              >
                追加
              </button>
              <button
                type="button"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                onClick={() => {
                  setIsAddDialogOpen(false);
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
