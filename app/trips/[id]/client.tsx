"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useTrips } from "@/components/trip-context";
import { useAuth } from "@/components/auth-context";
import { TripActivity, PackingItem, NoteEntry, TodoTask } from "@/lib/trips";
import { PACKING_TEMPLATES } from "@/lib/packing-templates";
import {
  PencilIcon, TrashIcon, PlusIcon, ArrowLeftIcon,
  CalendarDaysIcon, ShoppingBagIcon, CreditCardIcon,
  DocumentTextIcon, ShareIcon, XMarkIcon, MapPinIcon, ChevronDownIcon, HomeIcon,
  ClipboardDocumentIcon, CheckIcon,

} from "@heroicons/react/24/outline";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-indigo-400 to-blue-600",
];

const PLACE_CATEGORIES = [
  { icon: "🍽️", label: "食事" },
  { icon: "📷", label: "観光" },
  { icon: "🎡", label: "遊び" },
  { icon: "🛏️", label: "宿泊" },
  { icon: "🛍️", label: "買い物" },
  { icon: "📍", label: "その他" },
];

const TRANSPORT_CATEGORIES = [
  { icon: "🚃", label: "電車", fromPh: "東京", toPh: "上野", suffix: "駅" },
  { icon: "🚌", label: "バス", fromPh: "出発バス停", toPh: "到着バス停", suffix: "" },
  { icon: "🚗", label: "車", fromPh: "出発地", toPh: "目的地", suffix: "" },
  { icon: "✈️", label: "飛行機", fromPh: "羽田空港", toPh: "新千歳空港", suffix: "" },
  { icon: "🚶", label: "徒歩", fromPh: "出発地", toPh: "目的地", suffix: "" },
  { icon: "🚢", label: "船", fromPh: "出発港", toPh: "到着港", suffix: "" },
  { icon: "❓", label: "その他", fromPh: "出発地", toPh: "目的地", suffix: "" },
];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[16px] text-slate-900 outline-none ring-indigo-500 focus:bg-white focus:ring-2 transition-all placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-600";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashGradient(id: string) {
  let h = 0;
  for (const c of id) { h = (h << 5) - h + c.charCodeAt(0); h |= 0; }
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function fmtDateLong(d?: string) {
  if (!d) return "未定";
  return new Date(d).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function fmtDayDate(tripStart: string | undefined, dayNum: number) {
  if (!tripStart) return "";
  const d = new Date(tripStart);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" }).replace("（", "(").replace("）", ")");
}

function activityId(a: TripActivity) {
  return a.id ?? (a.time + a.destination);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function containerDayNumber(containerId: string): number {
  if (containerId === "unassigned") return 0;
  if (containerId.startsWith("day-")) return parseInt(containerId.replace("day-", ""));
  return -1;
}

// ─── DroppableArea ────────────────────────────────────────────────────────────

function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[56px] rounded-b-2xl transition-colors ${isOver ? "bg-sky-50/70" : ""}`}
    >
      {children}
    </div>
  );
}

// ─── ActivityCard ─────────────────────────────────────────────────────────────
// Pure visual — used both in SortableItem and DragOverlay

function ActivityCard({
  activity,
  onEdit,
  onDelete,
  onMapsClick,
  overlay = false,
  dragHandle,
  allMembers,
}: {
  activity: TripActivity;
  onEdit?: () => void;
  onDelete?: () => void;
  onMapsClick?: (url: string) => void;
  overlay?: boolean;
  dragHandle?: React.ReactNode;
  allMembers?: string[];
}) {
  const isTransport = activity.type === "transport";

  return (
    <div
      className={`relative rounded-xl border bg-white p-3 dark:bg-slate-800 ${
        overlay
          ? "border-indigo-500 shadow-2xl rotate-1"
          : "border-slate-200/80 shadow-sm dark:border-slate-700"
      }`}
    >
      {/* Action buttons - absolute top-right */}
      {!overlay && !dragHandle && (onEdit || onDelete) && (
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {(() => {
            const mapsQuery = activity.type === "transport"
              ? activity.to
              : activity.destination;
            return mapsQuery ? (
              <button
                type="button"
                className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onMapsClick?.(`https://www.google.com/maps/search/${encodeURIComponent(mapsQuery)}`); }}
              >
                <MapPinIcon className="h-3.5 w-3.5" />
              </button>
            ) : null;
          })()}
          {onEdit && (
            <button
              type="button"
              className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-blue-50 hover:text-blue-500"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl select-none ${
          isTransport ? "bg-blue-50 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800" : "bg-slate-50 border border-slate-100 dark:bg-slate-700 dark:border-slate-600"
        }`}>
          {activity.icon || "📍"}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {isTransport && activity.from && activity.to ? (
            <div className={`flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white ${!overlay && !dragHandle && (onEdit || onDelete) ? "pr-20" : ""}`}>
              <span>{activity.from}</span>
              <span className="text-slate-300 dark:text-slate-600">→</span>
              <span>{activity.to}</span>
            </div>
          ) : (
            <p className={`font-semibold leading-snug text-slate-900 dark:text-white ${!overlay && !dragHandle && (onEdit || onDelete) ? "pr-20" : ""}`}>{activity.destination}</p>
          )}
          {activity.time && (
            <p className="mt-0.5 text-xs font-medium text-indigo-500">⏰ {activity.time}</p>
          )}
          {activity.memo && (
            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-500 dark:text-slate-400">{activity.memo}</p>
          )}
          {(() => {
            const hasCost = activity.cost !== undefined && activity.cost > 0;
            const partialMembers = (() => {
              if (!allMembers || allMembers.length === 0) return null;
              const members = activity.activityMembers;
              if (!members || members.length === 0 || members.length === allMembers.length) return null;
              return members;
            })();
            if (!hasCost && !partialMembers) return null;
            return (
              <div className="mt-1 flex items-center justify-between gap-2">
                {hasCost ? (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    ¥{activity.cost!.toLocaleString()}
                    {activity.costType === "per_person" && (
                      <span className="ml-0.5 font-normal text-indigo-400 dark:text-indigo-500">/人</span>
                    )}
                  </p>
                ) : <span />}
                {partialMembers && (
                  <div className="flex flex-wrap justify-end gap-1">
                    {partialMembers.map((m) => (
                      <span key={m} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Drag handle */}
        {!overlay && dragHandle}
      </div>
    </div>
  );
}

// ─── SortableItem ─────────────────────────────────────────────────────────────

function SortableItem({
  activity,
  onEdit,
  onDelete,
  onMapsClick,
  isEditMode,
  allMembers,
}: {
  activity: TripActivity;
  onEdit: () => void;
  onDelete: () => void;
  onMapsClick: (url: string) => void;
  isEditMode: boolean;
  allMembers?: string[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activityId(activity),
    disabled: !isEditMode,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const dragHandleNode = isEditMode ? (
    <div
      {...attributes}
      {...listeners}
      className="flex h-8 w-7 shrink-0 self-center cursor-grab touch-none select-none items-center justify-center text-slate-300 active:cursor-grabbing dark:text-slate-600"
    >
      <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
        <rect x="3" y="4.5" width="14" height="2" rx="1"/>
        <rect x="3" y="9" width="14" height="2" rx="1"/>
        <rect x="3" y="13.5" width="14" height="2" rx="1"/>
      </svg>
    </div>
  ) : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-0" : ""}`}
    >
      <ActivityCard
        activity={activity}
        onEdit={isEditMode ? undefined : onEdit}
        onDelete={isEditMode ? undefined : onDelete}
        onMapsClick={isEditMode ? undefined : onMapsClick}
        dragHandle={dragHandleNode}
        allMembers={allMembers}
      />
    </li>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
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
        className="relative max-h-[90vh] w-full overflow-x-hidden overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── ActivityForm ─────────────────────────────────────────────────────────────

type ActivityType = "place" | "transport";

type ActivityFormProps = {
  activityType: ActivityType; setActivityType: (v: ActivityType) => void;
  dayIcon: string; setDayIcon: (v: string) => void;
  dayDestination: string; setDayDestination: (v: string) => void;
  fromPlace: string; setFromPlace: (v: string) => void;
  toPlace: string; setToPlace: (v: string) => void;
  startTime: string; setStartTime: (v: string) => void;
  endTime: string; setEndTime: (v: string) => void;
  memo: string; setMemo: (v: string) => void;
  cost: number; setCost: (v: number) => void;
  costType: "per_person" | "total"; setCostType: (v: "per_person" | "total") => void;
  activityMembers: string[]; setActivityMembers: (v: string[]) => void;
  paidBy: string; setPaidBy: (v: string) => void;
  settled: boolean; setSettled: (v: boolean) => void;
  allMembers: string[];
  daySelector?: React.ReactNode;
  onClearError: () => void;
  addReturnTrip?: boolean; setAddReturnTrip?: (v: boolean) => void;
};

function ActivityForm({
  activityType, setActivityType,
  dayIcon, setDayIcon,
  dayDestination, setDayDestination,
  fromPlace, setFromPlace,
  toPlace, setToPlace,
  startTime, setStartTime,
  endTime, setEndTime,
  memo, setMemo,
  cost, setCost,
  costType, setCostType,
  activityMembers, setActivityMembers,
  paidBy, setPaidBy,
  settled, setSettled,
  daySelector,
  allMembers,
  onClearError,
  addReturnTrip,
  setAddReturnTrip,
}: ActivityFormProps) {
  const transport = TRANSPORT_CATEGORIES.find((t) => t.icon === dayIcon);
  const suffix = activityType === "transport" ? (transport?.suffix ?? "") : "";
  const fromPh = transport?.fromPh ?? "出発地";
  const toPh = transport?.toPh ?? "目的地";
  const hasOptionalValues = !!(memo || cost || activityMembers.length || paidBy);
  const [showOptional, setShowOptional] = useState(hasOptionalValues);

  return (
    <div className="space-y-4">
      {/* Type switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
        {(["place", "transport"] as ActivityType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setActivityType(t);
              setDayIcon(t === "place" ? PLACE_CATEGORIES[0].icon : TRANSPORT_CATEGORIES[0].icon);
              onClearError();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${
              activityType === t
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>{t === "place" ? "📍" : "🚃"}</span>
            <span>{t === "place" ? "場所を追加" : "移動を追加"}</span>
          </button>
        ))}
      </div>

      {/* Category grid */}
      {activityType === "place" ? (
        <div className="grid grid-cols-3 gap-2">
          {PLACE_CATEGORIES.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDayIcon(icon)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm transition-all ${
                dayIcon === icon
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 ring-2 ring-indigo-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {TRANSPORT_CATEGORIES.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDayIcon(icon)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm transition-all ${
                dayIcon === icon
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 ring-2 ring-indigo-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Place: destination name */}
      {activityType === "place" && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">場所名 *</label>
          <input
            className={inputCls}
            value={dayDestination}
            onChange={(e) => setDayDestination(e.target.value)}
            placeholder="例）東京タワー"
          />
        </div>
      )}

      {/* Transport: from → to */}
      {activityType === "transport" && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">出発地 → 目的地 *</label>
            {setAddReturnTrip && (
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <input
                  type="checkbox"
                  checked={addReturnTrip ?? false}
                  onChange={(e) => setAddReturnTrip(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-indigo-500"
                />
                帰りの移動を追加
              </label>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                className={inputCls}
                value={fromPlace}
                onChange={(e) => setFromPlace(e.target.value)}
                placeholder={fromPh}
                style={suffix ? { paddingRight: "2.25rem" } : {}}
              />
              {suffix && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {suffix}
                </span>
              )}
            </div>
            <span className="hidden shrink-0 text-sm text-slate-400 sm:block">→</span>
            <span className="block text-xs font-semibold text-slate-400 sm:hidden">↓ 目的地</span>
            <div className="relative flex-1">
              <input
                className={inputCls}
                value={toPlace}
                onChange={(e) => setToPlace(e.target.value)}
                placeholder={toPh}
                style={suffix ? { paddingRight: "2.25rem" } : {}}
              />
              {suffix && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day selector */}
      {daySelector}

      {/* Common: time */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">開始時間<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
          <div className="relative">
            <input
              type="time"
              className={`${inputCls} appearance-none ${startTime ? "pr-8" : ""}`}
              value={startTime}
              onFocus={() => { if (!startTime) setStartTime("00:00"); }}
              onChange={(e) => setStartTime(e.target.value)}
            />
            {startTime && (
              <button
                type="button"
                onClick={() => setStartTime("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">終了時間<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
          <div className="relative">
            <input
              type="time"
              className={`${inputCls} appearance-none ${endTime ? "pr-8" : ""}`}
              value={endTime}
              onFocus={() => { if (!endTime) setEndTime("00:00"); }}
              onChange={(e) => setEndTime(e.target.value)}
            />
            {endTime && (
              <button
                type="button"
                onClick={() => setEndTime("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 任意項目トグル */}
      <div className={`rounded-xl border border-dashed transition-colors ${showOptional ? "border-slate-300 dark:border-slate-600" : "border-slate-300 dark:border-slate-600"}`}>
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span>{showOptional ? "詳細を閉じる" : "メモ・費用を追加"}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
        </button>

        {showOptional && (
          <div className="space-y-4 border-t border-slate-200 px-3 pb-3 pt-3 dark:border-slate-600">
            {/* 参加メンバー */}
            {allMembers.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  参加メンバー
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allMembers.map((m) => {
                    const isAll = activityMembers.length === 0;
                    const selected = isAll || activityMembers.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          if (isAll) {
                            setActivityMembers(allMembers.filter((x) => x !== m));
                          } else {
                            const next = selected
                              ? activityMembers.filter((x) => x !== m)
                              : [...activityMembers, m];
                            setActivityMembers(next.length === allMembers.length ? [] : next);
                          }
                        }}
                        className={`rounded-full border px-3 py-0.5 text-xs font-semibold transition-all ${
                          selected
                            ? "border-indigo-400 bg-indigo-50 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 費用 */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">費用 (円)<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={settled}
                      onChange={(e) => setSettled(e.target.checked)}
                      className="h-3.5 w-3.5 accent-green-500"
                    />
                    精算済
                  </label>
                  <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-700">
                    {(["per_person", "total"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCostType(t)}
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                          costType === t
                            ? "bg-white text-slate-800 shadow-sm dark:bg-slate-600 dark:text-white"
                            : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                        }`}
                      >
                        {t === "per_person" ? "1人分" : "全員分"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input
                type="number"
                className={inputCls}
                value={cost || ""}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                placeholder={costType === "per_person" ? "例）1000（1人あたり）" : "例）4000（全員分）"}
                min={0}
              />
            </div>

            {/* 支払った人 */}
            {allMembers.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  支払った人<span className="ml-1 font-normal text-slate-400">（任意）</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allMembers.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaidBy(paidBy === m ? "" : m)}
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold transition-all ${
                        paidBy === m
                          ? "border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* メモ */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">メモ<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
              <textarea
                className={`${inputCls} resize-none`}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例）朝早めに出発して混雑を避ける"
                rows={2}
              />
            </div>
          </div>
      )}
      </div>
    </div>
  );
}

// ─── TripDetailClient ─────────────────────────────────────────────────────────

export function TripDetailClient({ tripId }: { tripId: string }) {
  const { trips, hydrated, updateTrip, syncTripFromRemote } = useTrips();
  const { user } = useAuth();
  const trip = trips.find((t) => t.id === tripId);
  const shareId = trip?.shareId;
  const lastRemoteUpdatedAt = useRef<string>("");

  // リアルタイム同期: shareId がある旅はリモート変更を受信する
  useEffect(() => {
    if (!shareId || !db) return;
    const ref = doc(db, "shared_trips", shareId);
    const unsub = onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
      if (snap.metadata.hasPendingWrites) return; // 自分の書き込みはスキップ
      const remote = snap.data()?.trip;
      if (!remote) return;
      const remoteAt = remote.updatedAt ?? "";
      if (remoteAt && remoteAt === lastRemoteUpdatedAt.current) return; // 重複スキップ
      lastRemoteUpdatedAt.current = remoteAt;
      syncTripFromRemote(tripId, remote);
    });
    return unsub;
  }, [shareId, tripId, syncTripFromRemote]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"itinerary" | "packing" | "expenses" | "notes">("itinerary");
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());
  const toggleDay = (n: number) => setCollapsedDays(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  const [isEditMode, setIsEditMode] = useState(false);

  // Share modal
  const [shareModal, setShareModal] = useState(false);
  const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [sharePasswordInput, setSharePasswordInput] = useState("");
  const [sharePasswordSaved, setSharePasswordSaved] = useState(false);
  const [sharePasswordConfirmPending, setSharePasswordConfirmPending] = useState(false);
  const [activeShareId, setActiveShareId] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSettlement, setCopiedSettlement] = useState(false);
  const [shareLinkLoading, setShareLinkLoading] = useState(false);

  const handleShare = async () => {
    const lines: string[] = [
      `✈️ ${tripData.title}`,
      `📅 ${fmtDateLong(tripData.startDate)} 〜 ${fmtDateLong(tripData.endDate)}`,
    ];
    if (tripData.description) lines.push(`📝 ${tripData.description}`);
    lines.push("");
    allDayNumbers.forEach((n) => {
      const acts = tripData.days.filter((d) => d.day === n);
      lines.push(`【Day ${n}】${fmtDayDate(tripData.startDate, n)}`);
      if (acts.length === 0) { lines.push("　(予定なし)"); }
      acts.forEach((a) => {
        const name = a.type === "transport" && a.from && a.to ? `${a.from} → ${a.to}` : a.destination;
        const time = a.time ? `${a.time} ` : "";
        lines.push(`　${time}${a.icon} ${name}${a.cost ? ` ¥${a.cost.toLocaleString()}` : ""}`);
        if (a.memo) lines.push(`　　└ ${a.memo}`);
      });
      lines.push("");
    });
    if (tripData.notes) { lines.push(`📓 メモ`); lines.push(tripData.notes); }
    setShareText(lines.join("\n"));
    setShareLink("");
    setCopiedText(false);
    setCopiedLink(false);
    setSharePasswordSaved(false);
    setSharePasswordConfirmPending(false);
    setShareConfirmOpen(false);
    setShareModal(true);
    setShareLinkLoading(true);
    try {
      let shareId = tripData.shareId;
      if (!shareId) {
        if (!db) throw new Error("db not initialized");
        const docRef = await addDoc(collection(db, "shared_trips"), {
          trip: JSON.parse(JSON.stringify(tripData)),
          password: sharePasswordInput || null,
          createdAt: serverTimestamp(),
        });
        shareId = docRef.id;
        updateTrip(tripData.id, (c) => ({ ...c, shareId, sharePassword: sharePasswordInput || undefined }));
      } else if (db) {
        // 既に共有済みの場合も最新データで上書き（メンバー等の変更を反映）
        const latest = { ...tripData, shareId };
        await setDoc(doc(db, "shared_trips", shareId), {
          trip: JSON.parse(JSON.stringify(latest)),
        }, { merge: true });
      }
      setShareLink(`${window.location.origin}/view/${shareId}`);
      setActiveShareId(shareId ?? "");
    } catch {
      const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(tripData));
      setShareLink(`${window.location.origin}/trips/import?data=${encoded}`);
    } finally {
      setShareLinkLoading(false);
    }
  };

  // Packing list state
  const [packingInput, setPackingInput] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [todoInput, setTodoInput] = useState("");

  // Notes chat state
  const [noteInput, setNoteInput] = useState("");

  // Form validation
  const [formError, setFormError] = useState("");

  // Form state
  const [activityType, setActivityType] = useState<ActivityType>("place");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dayIcon, setDayIcon] = useState(PLACE_CATEGORIES[0].icon);
  const [dayDestination, setDayDestination] = useState("");
  const [fromPlace, setFromPlace] = useState("");
  const [toPlace, setToPlace] = useState("");
  const [memo, setMemo] = useState("");
  const [cost, setCost] = useState(0);
  const [costType, setCostType] = useState<"per_person" | "total">("per_person");
  const [activityMembers, setActivityMembers] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState("");
  const [settled, setSettled] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TripActivity | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addDay, setAddDay] = useState(0);
  const [editDay, setEditDay] = useState(0);
  const [addReturnTrip, setAddReturnTrip] = useState(false);

  // DnD state
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetForm = () => {
    setActivityType("place");
    setStartTime(""); setEndTime("");
    setDayIcon(PLACE_CATEGORIES[0].icon);
    setDayDestination(""); setFromPlace(""); setToPlace("");
    setMemo(""); setCost(0); setCostType("per_person"); setActivityMembers([]); setPaidBy(""); setSettled(false); setAddDay(0); setEditDay(0); setFormError(""); setAddReturnTrip(false);
  };

  const fmtTime = (s: string, e: string) => {
    if (s && e) return `${s} ~ ${e}`;
    if (s) return `${s} ~`;
    if (e) return `~ ${e}`;
    return "";
  };

  function parseTimeStr(timeStr: string): [string, string] {
    if (!timeStr) return ["", ""];
    if (timeStr.includes(" ~ ")) {
      const [s, e] = timeStr.split(" ~ ");
      return [s ?? "", e ?? ""];
    }
    if (timeStr.startsWith("~ ")) return ["", timeStr.slice(2)];
    if (timeStr.endsWith(" ~")) return [timeStr.slice(0, -2), ""];
    if (timeStr.includes(" - ")) {
      const [s, e] = timeStr.split(" - ");
      return [s ?? "", e ?? ""];
    }
    return [timeStr, ""];
  }

  // ── Not found ──
  if (!trip) {
    if (!hydrated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
          <svg className="h-6 w-6 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA] p-4">
        <div className="text-center">
          <span className="text-6xl">😕</span>
          <p className="mt-4 text-lg font-bold text-slate-700">旅が見つかりませんでした</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />旅の一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // Narrow trip type for use in closures
  const tripData = trip;

  // Derived values
  const tripDayCount = tripData.startDate && tripData.endDate
    ? Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / 86400000) + 1
    : Math.max(tripData.days.reduce((m, a) => Math.max(m, a.day), 0), 1);
  const allDayNumbers = Array.from({ length: tripDayCount }, (_, i) => i + 1);
  const bannerColor = tripData.color ?? "#6366F1";
  const participants = tripData.members?.length || tripData.participants || 2;
  const activityTotalCost = (a: TripActivity) => {
    if (!a.cost || a.cost <= 0) return 0;
    if (a.costType === "per_person") {
      const count = a.activityMembers?.length || participants;
      return a.cost * count;
    }
    return a.cost;
  };
  const totalCost = tripData.days.reduce((s, a) => s + activityTotalCost(a), 0);

  // Countdown
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tripStart = tripData.startDate ? new Date(tripData.startDate) : null;
  const tripEnd = tripData.endDate ? new Date(tripData.endDate) : null;
  if (tripStart) tripStart.setHours(0, 0, 0, 0);
  if (tripEnd) tripEnd.setHours(0, 0, 0, 0);
  const daysUntil = tripStart ? Math.ceil((tripStart.getTime() - today.getTime()) / 86400000) : null;
  const tripIcon = tripData.tripIcon ?? "✈️";
  const countdownLabel = daysUntil === null ? null :
    daysUntil > 0 ? `${tripIcon} 旅まであと ${daysUntil} 日` :
    daysUntil === 0 ? `🎉 今日から旅行！` :
    tripEnd && today <= tripEnd ? `🌏 旅行中！` :
    `📸 ${Math.abs(daysUntil)} 日前の旅行`;
  const unassigned = tripData.days.filter((d) => d.day === 0);
  const draggedActivity = dragActiveId
    ? tripData.days.find((d) => activityId(d) === dragActiveId)
    : null;

  // ── DnD handlers ──

  function handleDragStart(event: DragStartEvent) {
    setDragActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    // Determine which container the item is being dropped INTO
    // - If dropping on a sortable item: over.data.current.sortable.containerId
    // - If dropping on a DroppableArea (empty container): over.id is the container id
    const targetContainerId =
      (over.data.current?.sortable?.containerId as string | undefined) ?? overId;

    const targetDay = containerDayNumber(targetContainerId);
    if (targetDay === -1) return; // dropped outside any known container

    updateTrip(tripData.id, (current) => {
      const items = [...current.days];
      const activeIndex = items.findIndex((d) => activityId(d) === activeItemId);
      if (activeIndex === -1) return current;

      const sourceDay = items[activeIndex].day;

      if (sourceDay === targetDay) {
        // ── Same container: reorder ──
        // overId may be another item's id or the container id itself
        const overIndex = items.findIndex((d) => activityId(d) === overId);
        if (overIndex === -1 || activeIndex === overIndex) return current;
        return { ...current, days: arrayMove(items, activeIndex, overIndex) };
      } else {
        // ── Different container: move item to target day ──
        return {
          ...current,
          days: items.map((d) =>
            activityId(d) === activeItemId ? { ...d, day: targetDay } : d
          ),
        };
      }
    });
  }

  function openEdit(activity: TripActivity) {
    setEditingActivity(activity);
    const type: ActivityType = activity.type === "transport" ? "transport" : "place";
    setActivityType(type);
    const [s, e] = parseTimeStr(activity.time || "");
    setStartTime(s);
    setEndTime(e);
    setDayIcon(activity.icon || (type === "place" ? PLACE_CATEGORIES[0].icon : TRANSPORT_CATEGORIES[0].icon));
    setDayDestination(activity.destination || "");
    setFromPlace(activity.from || "");
    setToPlace(activity.to || "");
    setMemo(activity.memo || "");
    setCost(activity.cost || 0);
    setCostType(activity.costType ?? "per_person");
    setActivityMembers(activity.activityMembers ?? []);
    setPaidBy(activity.paidBy ?? "");
    setSettled(activity.settled ?? false);
    setEditDay(activity.day ?? 0);
    setIsEditOpen(true);
  }

  function saveEdit() {
    if (activityType === "transport") {
      if (!fromPlace || !toPlace) { setFormError("出発地と目的地は必須項目です。"); return; }
    } else {
      if (!dayDestination) { setFormError("場所名は必須項目です。"); return; }
    }
    updateTrip(tripData.id, (current) => ({
      ...current,
      days: current.days.map((d) =>
        d === editingActivity
          ? {
              ...d,
              day: editDay,
              type: activityType,
              time: fmtTime(startTime, endTime),
              icon: dayIcon,
              destination: activityType === "transport" ? `${fromPlace} → ${toPlace}` : dayDestination,
              from: activityType === "transport" ? fromPlace : undefined,
              to: activityType === "transport" ? toPlace : undefined,
              memo: memo || undefined,
              cost: cost > 0 ? cost : undefined,
              costType: cost > 0 ? costType : undefined,
              activityMembers: activityMembers.length > 0 ? activityMembers : undefined,
              paidBy: cost > 0 && paidBy ? paidBy : undefined,
              settled: cost > 0 && settled ? true : undefined,
            }
          : d
      ),
    }));
    setIsEditOpen(false);
    setEditingActivity(null);
    resetForm();
  }

  function saveAdd() {
    if (activityType === "transport") {
      if (!fromPlace || !toPlace) { setFormError("出発地と目的地は必須項目です。"); return; }
    } else {
      if (!dayDestination) { setFormError("場所名は必須項目です。"); return; }
    }
    updateTrip(tripData.id, (current) => ({
      ...current,
      days: [
        ...current.days,
        {
          id: genId(),
          day: addDay,
          type: activityType,
          time: fmtTime(startTime, endTime),
          icon: dayIcon,
          destination: activityType === "transport" ? `${fromPlace} → ${toPlace}` : dayDestination,
          from: activityType === "transport" ? fromPlace : undefined,
          to: activityType === "transport" ? toPlace : undefined,
          memo: memo || undefined,
          cost: cost > 0 ? cost : undefined,
          costType: cost > 0 ? costType : undefined,
          activityMembers: activityMembers.length > 0 ? activityMembers : undefined,
          paidBy: cost > 0 && paidBy ? paidBy : undefined,
          settled: cost > 0 && settled ? true : undefined,
        },
        ...(activityType === "transport" && addReturnTrip && fromPlace && toPlace ? [{
          id: genId(),
          day: 0,
          type: "transport" as const,
          time: "",
          icon: dayIcon,
          destination: `${toPlace} → ${fromPlace}`,
          from: toPlace,
          to: fromPlace,
        }] : []),
      ],
    }));
    setIsAddOpen(false);
    resetForm();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragActiveId(null)}
    >
      <div className="min-h-screen bg-[#F0F5FA] dark:bg-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md relative dark:bg-slate-800/90 dark:border-slate-700">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <HomeIcon className="h-3.5 w-3.5" />一覧に戻る
            </Link>
            <button
              type="button"
              onClick={() => {
                if (tripData.shareId) {
                  setSharePasswordInput(tripData.sharePassword ?? "");
                  handleShare();
                } else {
                  setSharePasswordInput("");
                  setShareConfirmOpen(true);
                }
              }}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ShareIcon className="h-3.5 w-3.5" />共有
            </button>
          </div>
        </header>

        {/* Banner */}
        <div className="px-4 py-10 text-white sm:px-6 sm:py-12" style={{ backgroundColor: bannerColor }}>
          <div className="mx-auto max-w-3xl">
            {(tripData.startDate || tripData.endDate) && (
              <p className="text-xs font-medium text-white/70">
                {fmtDateLong(tripData.startDate)} 〜 {fmtDateLong(tripData.endDate)}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{tripData.title}</h1>
            {tripData.description && (
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/80">{tripData.description}</p>
            )}
            {countdownLabel && (
              <div className="mt-3">
                <span className="text-sm font-bold text-white/90">{countdownLabel}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {tripDayCount}日間
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {participants}人
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {tripData.days.length}スポット
              </span>
              {totalCost > 0 && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  合計 ¥{totalCost.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 未ログイン共有旅程バナー */}
        {tripData.shareId && !user && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-400">
            ログインすると編集内容がリアルタイムで全員に共有されます
          </div>
        )}

        {/* Tab bar */}
        <div className="sticky top-[53px] z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:bg-slate-800/95 dark:border-slate-700">
          <div className="mx-auto flex max-w-3xl justify-center gap-1.5 px-4 py-2 sm:px-6">
            {([
              { key: "itinerary", label: "旅程",   icon: <CalendarDaysIcon  className="h-4 w-4" /> },
              { key: "packing",   label: "準備",   icon: <ShoppingBagIcon   className="h-4 w-4" /> },
              { key: "expenses",  label: "費用",   icon: <CreditCardIcon    className="h-4 w-4" /> },
              { key: "notes",     label: "メモ",   icon: <DocumentTextIcon  className="h-4 w-4" /> },
            ] as const).map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-[#22C55E] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Itinerary tab ── */}
        {activeTab === "itinerary" && (
          <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
            {/* PC: top-right above itinerary */}
            <div className="mb-3 flex justify-end max-sm:hidden">
              <button
                type="button"
                onClick={() => setIsEditMode((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  isEditMode
                    ? "bg-amber-400 text-white shadow-sm hover:bg-amber-300"
                    : "bg-[#22C55E] text-white shadow-sm hover:bg-green-400"
                }`}
              >
                {isEditMode ? (
                  <><span>✓</span> 編集完了</>
                ) : (
                  <><PencilIcon className="h-3.5 w-3.5" /> 並び替え</>
                )}
              </button>
            </div>
            {/* Mobile: fixed bottom-left */}
            <button
              type="button"
              onClick={() => setIsEditMode((v) => !v)}
              className={`fixed bottom-6 left-6 z-50 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition sm:hidden ${
                isEditMode
                  ? "bg-amber-400 text-white hover:bg-amber-300"
                  : "bg-[#22C55E] text-white hover:bg-green-400"
              }`}
            >
              {isEditMode ? (
                <><span>✓</span> 編集完了</>
              ) : (
                <><PencilIcon className="h-3.5 w-3.5" /> 並び替え</>
              )}
            </button>
            <div className="space-y-4">
              {allDayNumbers.map((dayNum) => {
                const dayActivities = tripData.days.filter((d) => d.day === dayNum);
                const dayCost = dayActivities.reduce((s, a) => s + activityTotalCost(a), 0);
                const containerId = `day-${dayNum}`;

                const isCollapsed = collapsedDays.has(dayNum);
                return (
                  <div key={dayNum} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center rounded-full bg-[#22C55E] px-3 py-0.5 text-xs font-bold text-white">
                          Day {dayNum}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {fmtDayDate(tripData.startDate, dayNum)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dayCost > 0 && (
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            ¥{dayCost.toLocaleString()}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleDay(dayNum)}
                          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                        >
                          <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`} />
                        </button>
                      </div>
                    </div>
                    {!isCollapsed && <SortableContext
                      id={containerId}
                      items={dayActivities.map(activityId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableArea id={containerId}>
                        {dayActivities.length === 0 ? (
                          <p className="px-4 py-4 text-center text-xs text-slate-400">
                            ここにドラッグして追加
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-2 p-3">
                            {dayActivities.map((activity) => (
                              <SortableItem
                                key={activityId(activity)}
                                activity={activity}
                                isEditMode={isEditMode}
                                onEdit={() => openEdit(activity)}
                                onMapsClick={setMapsUrl}
                                allMembers={tripData.members}
                                onDelete={() => {
                                  if (confirm("削除してよろしいですか？")) {
                                    updateTrip(tripData.id, (c) => ({
                                      ...c,
                                      days: c.days.filter((d) => d !== activity),
                                    }));
                                  }
                                }}
                              />
                            ))}
                          </ul>
                        )}
                      </DroppableArea>
                    </SortableContext>}
                  </div>
                );
              })}

              {/* Unassigned */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                  <span className="text-sm font-semibold text-amber-700">📌 未割り当て</span>
                </div>
                <SortableContext
                  id="unassigned"
                  items={unassigned.map(activityId)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableArea id="unassigned">
                    {unassigned.length === 0 ? (
                      <p className="px-4 py-5 text-center text-xs text-slate-400">
                        ＋ボタンで追加。各Dayにドラッグして割り当てできます。
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2 p-3">
                        {unassigned.map((activity) => (
                          <SortableItem
                            key={activityId(activity)}
                            activity={activity}
                            isEditMode={isEditMode}
                            onEdit={() => openEdit(activity)}
                            onMapsClick={setMapsUrl}
                            allMembers={tripData.members}
                            onDelete={() => {
                              updateTrip(tripData.id, (c) => ({
                                ...c,
                                days: c.days.filter((d) => d !== activity),
                              }));
                            }}
                          />
                        ))}
                      </ul>
                    )}
                  </DroppableArea>
                </SortableContext>
              </div>
            </div>
          </main>
        )}

        {/* ── Packing tab ── */}
        {activeTab === "packing" && (
          <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
            <div className="space-y-4">
            {/* ── やることリスト ── */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">やることリスト</span>
              </div>

              {/* Add item */}
              <div className="flex gap-2 p-4">
                <input
                  className={inputCls}
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  placeholder="例）航空券の予約、レストラン予約..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && todoInput.trim()) {
                      const newItem: TodoTask = { id: `todo-${Date.now()}`, label: todoInput.trim(), checked: false };
                      updateTrip(tripData.id, (c) => ({ ...c, todoList: [...(c.todoList ?? []), newItem] }));
                      setTodoInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400 active:scale-95"
                  onClick={() => {
                    if (!todoInput.trim()) return;
                    const newItem: TodoTask = { id: `todo-${Date.now()}`, label: todoInput.trim(), checked: false };
                    updateTrip(tripData.id, (c) => ({ ...c, todoList: [...(c.todoList ?? []), newItem] }));
                    setTodoInput("");
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  追加
                </button>
              </div>

              {/* Item list */}
              {(tripData.todoList ?? []).length === 0 ? (
                <p className="px-4 pb-8 text-center text-xs text-slate-400">
                  飛行機・ホテルの予約など、やることを追加しましょう。
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 px-4 pb-4 dark:divide-slate-700">
                  {(tripData.todoList ?? []).map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateTrip(tripData.id, (c) => ({
                            ...c,
                            todoList: (c.todoList ?? []).map((t) =>
                              t.id === item.id ? { ...t, checked: !t.checked } : t
                            ),
                          }))
                        }
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          item.checked
                            ? "border-indigo-500 bg-[#22C55E] text-white"
                            : "border-slate-300 hover:border-indigo-500 dark:border-slate-600"
                        }`}
                      >
                        {item.checked && (
                          <svg viewBox="0 0 12 10" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1,5 4,8 11,1" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateTrip(tripData.id, (c) => ({
                            ...c,
                            todoList: (c.todoList ?? []).filter((t) => t.id !== item.id),
                          }))
                        }
                        className="rounded-full p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Progress */}
              {(tripData.todoList ?? []).length > 0 && (() => {
                const total = (tripData.todoList ?? []).length;
                const done = (tripData.todoList ?? []).filter((t) => t.checked).length;
                return (
                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{done} / {total} 完了</span>
                      <span>{Math.round((done / total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-[#22C55E] transition-all"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── 持ち物リスト ── */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">持ち物リスト</span>
                <button
                  type="button"
                  onClick={() => setTemplateOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <PlusIcon className="h-3 w-3" />
                  テンプレート
                </button>
              </div>

              {/* Add item */}
              <div className="flex gap-2 p-4">
                <input
                  className={inputCls}
                  value={packingInput}
                  onChange={(e) => setPackingInput(e.target.value)}
                  placeholder="例）パスポート、充電器..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && packingInput.trim()) {
                      const newItem: PackingItem = {
                        id: `packing-${Date.now()}`,
                        label: packingInput.trim(),
                        checked: false,
                      };
                      updateTrip(tripData.id, (c) => ({
                        ...c,
                        packingList: [...(c.packingList ?? []), newItem],
                      }));
                      setPackingInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400 active:scale-95"
                  onClick={() => {
                    if (!packingInput.trim()) return;
                    const newItem: PackingItem = {
                      id: `packing-${Date.now()}`,
                      label: packingInput.trim(),
                      checked: false,
                    };
                    updateTrip(tripData.id, (c) => ({
                      ...c,
                      packingList: [...(c.packingList ?? []), newItem],
                    }));
                    setPackingInput("");
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  追加
                </button>
              </div>

              {/* Item list */}
              {(tripData.packingList ?? []).length === 0 ? (
                <p className="px-4 pb-8 text-center text-xs text-slate-400">
                  持ち物を追加しましょう。
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 px-4 pb-4 dark:divide-slate-700">
                  {(tripData.packingList ?? []).map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateTrip(tripData.id, (c) => ({
                            ...c,
                            packingList: (c.packingList ?? []).map((p) =>
                              p.id === item.id ? { ...p, checked: !p.checked } : p
                            ),
                          }))
                        }
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          item.checked
                            ? "border-indigo-500 bg-[#22C55E] text-white"
                            : "border-slate-300 hover:border-indigo-500 dark:border-slate-600"
                        }`}
                      >
                        {item.checked && (
                          <svg viewBox="0 0 12 10" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1,5 4,8 11,1" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateTrip(tripData.id, (c) => ({
                            ...c,
                            packingList: (c.packingList ?? []).filter((p) => p.id !== item.id),
                          }))
                        }
                        className="rounded-full p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Progress */}
              {(tripData.packingList ?? []).length > 0 && (() => {
                const total = (tripData.packingList ?? []).length;
                const done = (tripData.packingList ?? []).filter((p) => p.checked).length;
                return (
                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{done} / {total} 準備完了</span>
                      <span>{Math.round((done / total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-[#22C55E] transition-all"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            </div>
          </main>
        )}

        {/* ── Expenses tab ── */}
        {activeTab === "expenses" && (
          <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
            <div className="space-y-4">
              {/* Budget + Total */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">旅の合計費用</p>
                <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">¥{totalCost.toLocaleString()}</p>
                {totalCost > 0 && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    1人あたり ¥{Math.ceil(totalCost / participants).toLocaleString()}
                    <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">（{participants}人）</span>
                  </p>
                )}
                {totalCost === 0 && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">旅程タブで各アクティビティに費用を入力してください。</p>
                )}
              </div>

              {/* Per member spending */}
              {(tripData.members?.length ?? 0) >= 2 && totalCost > 0 && (() => {
                const members = tripData.members ?? [];
                const memberSpending: Record<string, number> = {};
                const memberPaid: Record<string, number> = {};
                members.forEach((m) => { memberSpending[m] = 0; memberPaid[m] = 0; });
                tripData.days.forEach((a) => {
                  if (!a.cost || a.cost <= 0) return;
                  const effectiveMembers = a.activityMembers?.length
                    ? a.activityMembers
                    : members;
                  const share = a.costType === "per_person"
                    ? a.cost
                    : a.cost / effectiveMembers.length;
                  effectiveMembers.forEach((m) => {
                    if (m in memberSpending) memberSpending[m] += share;
                  });
                  if (a.paidBy && a.paidBy in memberPaid) {
                    memberPaid[a.paidBy] += activityTotalCost(a);
                  }
                });
                return (
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-700/50">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">👤 メンバー別負担額</p>
                      <div className="flex gap-1">
                        <span className="w-20 text-right text-[11px] font-semibold text-slate-400">支払額</span>
                        <span className="w-20 text-right text-[11px] font-semibold text-slate-400">負担額</span>
                      </div>
                    </div>
                    <ul className="divide-y divide-slate-100 px-4 dark:divide-slate-700">
                      {members.map((m) => (
                        <li key={m} className="flex items-center justify-between py-2.5">
                          <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{m}</span>
                          <div className="flex gap-1">
                            <span className="w-20 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">¥{Math.round(memberPaid[m] ?? 0).toLocaleString()}</span>
                            <span className="w-20 text-right text-sm font-semibold text-indigo-600 dark:text-indigo-400">¥{Math.round(memberSpending[m] ?? 0).toLocaleString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Settlement */}
              {(() => {
                const members = tripData.members ?? [];
                if (members.length < 2) return null;
                const hasPaidBy = tripData.days.some((a) => a.cost && a.paidBy);
                if (!hasPaidBy) return null;

                // Calculate net balance per member (positive = owed money, negative = owes money)
                const balance: Record<string, number> = {};
                members.forEach((m) => (balance[m] = 0));
                tripData.days.forEach((a) => {
                  if (!a.cost || !a.paidBy || !(a.paidBy in balance) || a.settled) return;
                  const total = activityTotalCost(a);
                  const beneficiaries = a.activityMembers?.length ? a.activityMembers : members;
                  const share = total / beneficiaries.length;
                  balance[a.paidBy] += total;
                  beneficiaries.forEach((m) => { if (m in balance) balance[m] -= share; });
                });

                // Greedy settlement: pair max creditor with max debtor
                const settlements: { from: string; to: string; amount: number }[] = [];
                const pos = members.map((m) => ({ m, v: balance[m] })).filter((x) => x.v > 0.5).sort((a, b) => b.v - a.v);
                const neg = members.map((m) => ({ m, v: balance[m] })).filter((x) => x.v < -0.5).sort((a, b) => a.v - b.v);
                let i = 0, j = 0;
                while (i < pos.length && j < neg.length) {
                  const amt = Math.min(pos[i].v, -neg[j].v);
                  settlements.push({ from: neg[j].m, to: pos[i].m, amount: Math.ceil(amt) });
                  pos[i].v -= amt;
                  neg[j].v += amt;
                  if (pos[i].v < 0.5) i++;
                  if (neg[j].v > -0.5) j++;
                }
                if (settlements.length === 0) return null;

                return (
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">💸 精算</p>
                      <button
                        type="button"
                        onClick={() => {
                          const text = settlements.map((s) => `${s.from} → ${s.to}：¥${s.amount.toLocaleString()}`).join("\n");
                          navigator.clipboard.writeText(text);
                          setCopiedSettlement(true);
                          setTimeout(() => setCopiedSettlement(false), 2000);
                        }}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 ${copiedSettlement ? "text-green-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                      >
                        {copiedSettlement ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    <ul className="divide-y divide-slate-100 px-4 dark:divide-slate-700">
                      {settlements.map((s, idx) => (
                        <li key={idx} className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">{s.from}</span>
                            <span className="mx-1.5 text-slate-400">→</span>
                            <span className="font-semibold">{s.to}</span>
                          </span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">¥{s.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Per day breakdown */}
              {allDayNumbers.map((dayNum) => {
                const dayActivities = tripData.days.filter(
                  (d) => d.day === dayNum && d.cost !== undefined && d.cost > 0
                );
                const dayCost = dayActivities.reduce((s, a) => s + activityTotalCost(a), 0);
                if (dayActivities.length === 0) return null;
                return (
                  <div key={dayNum} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/50">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center rounded-full bg-[#22C55E] px-3 py-0.5 text-xs font-bold text-white">
                          Day {dayNum}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {fmtDayDate(tripData.startDate, dayNum)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">¥{dayCost.toLocaleString()}</span>
                    </div>
                    <ul className="divide-y divide-slate-100 px-4 dark:divide-slate-700">
                      {dayActivities.map((a) => (
                        <li key={activityId(a)} className="flex items-start gap-3 py-2.5">
                          <span className="mt-0.5 text-lg">{a.icon}</span>
                          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                                {a.type === "transport" && a.from && a.to
                                  ? `${a.from} → ${a.to}`
                                  : a.destination}
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {a.settled && (
                                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">精算済</span>
                                )}
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">¥{activityTotalCost(a).toLocaleString()}</span>
                              </div>
                            </div>
                            {(() => {
                              const allMembers = tripData.members ?? [];
                              const isAll = !a.activityMembers?.length ||
                                (allMembers.length > 0 && a.activityMembers!.length === allMembers.length && a.activityMembers!.every(m => allMembers.includes(m)));
                              const count = isAll ? allMembers.length : a.activityMembers!.length;
                              if (!a.paidBy && !allMembers.length) return null;
                              return (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-1">
                                    {a.paidBy && (
                                      <>
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{a.paidBy}</span>
                                        <span className="text-[10px] text-slate-300 dark:text-slate-600">|</span>
                                      </>
                                    )}
                                    {isAll ? (
                                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">全員</span>
                                    ) : (
                                      a.activityMembers!.map((m) => (
                                        <span key={m} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">
                                          {m}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                  {a.costType === "per_person" && (
                                    <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                                      ¥{(a.cost ?? 0).toLocaleString()} × {count || participants}人
                                    </span>
                                  )}
                                  {a.costType === "total" && (count || participants) > 0 && (
                                    <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                                      ¥{Math.round((a.cost ?? 0) / (count || participants)).toLocaleString()}<span className="ml-0.5 font-normal text-indigo-400 dark:text-indigo-500">/人</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Unassigned with cost */}
              {(() => {
                const items = unassigned.filter((d) => d.cost !== undefined && d.cost > 0);
                if (items.length === 0) return null;
                return (
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-3 flex items-center justify-between dark:border-slate-700 dark:bg-slate-700/50">
                      <span className="text-sm font-semibold text-amber-700">📌 未割り当て</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        ¥{items.reduce((s, a) => s + activityTotalCost(a), 0).toLocaleString()}
                      </span>
                    </div>
                    <ul className="divide-y divide-slate-100 px-4 dark:divide-slate-700">
                      {items.map((a) => (
                        <li key={activityId(a)} className="flex items-center gap-3 py-2.5">
                          <span className="text-lg">{a.icon}</span>
                          <div className="flex flex-1 flex-col min-w-0">
                            <span className="text-sm text-slate-700 dark:text-slate-300">{a.destination}</span>
                            {(() => {
                              const allMembers2 = tripData.members ?? [];
                              const isAll = !a.activityMembers?.length ||
                                (allMembers2.length > 0 && a.activityMembers!.length === allMembers2.length && a.activityMembers!.every(m => allMembers2.includes(m)));
                              if (isAll && allMembers2.length === 0) return null;
                              return (
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                  {isAll ? (
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">全員</span>
                                  ) : (
                                    a.activityMembers!.map((m) => (
                                      <span key={m} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {m}
                                      </span>
                                    ))
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {a.settled && (
                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">精算済</span>
                              )}
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                ¥{activityTotalCost(a).toLocaleString()}
                              </p>
                            </div>
                            {a.costType === "per_person" && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                ¥{(a.cost ?? 0).toLocaleString()} ×{" "}
                                {`${a.activityMembers?.length || participants}人`}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

            </div>
          </main>
        )}

        {/* ── Notes tab ── */}
        {activeTab === "notes" && (
          <main className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6">
            {/* Message list */}
            <div className="space-y-3">
              {(tripData.noteEntries ?? []).length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-4xl">📝</span>
                  <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">メモはまだありません</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">予約番号・連絡先・気になることを残しておこう</p>
                </div>
              )}
              {(tripData.noteEntries ?? []).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-sm text-white">
                    ✈
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">{entry.text}</p>
                    <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">{new Date(entry.createdAt).toLocaleString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateTrip(tripData.id, (c) => ({
                        ...c,
                        noteEntries: (c.noteEntries ?? []).filter((n) => n.id !== entry.id),
                      }))
                    }
                    className="mt-1 shrink-0 rounded-full p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200/80 bg-white/95 px-4 pb-8 pt-3 backdrop-blur-md sm:px-6 dark:bg-slate-800/95 dark:border-slate-700">
              <div className="mx-auto flex max-w-3xl gap-2">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={1}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="メモを追加…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && noteInput.trim()) {
                      e.preventDefault();
                      const entry: NoteEntry = { id: `note-${Date.now()}`, text: noteInput.trim(), createdAt: new Date().toISOString() };
                      updateTrip(tripData.id, (c) => ({ ...c, noteEntries: [...(c.noteEntries ?? []), entry] }));
                      setNoteInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400 active:scale-95"
                  onClick={() => {
                    if (!noteInput.trim()) return;
                    const entry: NoteEntry = { id: `note-${Date.now()}`, text: noteInput.trim(), createdAt: new Date().toISOString() };
                    updateTrip(tripData.id, (c) => ({ ...c, noteEntries: [...(c.noteEntries ?? []), entry] }));
                    setNoteInput("");
                  }}
                >
                  送信
                </button>
              </div>
            </div>
          </main>
        )}

        {/* FAB — itinerary tab only */}
        {activeTab === "itinerary" && (
          <button
            type="button"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-xl transition-all hover:scale-110 hover:bg-green-400 active:scale-95"
            onClick={() => { resetForm(); setIsAddOpen(true); }}
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* DragOverlay — floating card that follows the cursor */}
      <DragOverlay dropAnimation={null}>
        {draggedActivity ? (
          <div className="w-full max-w-sm cursor-grabbing">
            <ActivityCard activity={draggedActivity} overlay />
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit Modal */}
      {isEditOpen && (
        <Modal
          title="アクティビティを編集"
          onClose={() => { setIsEditOpen(false); setEditingActivity(null); resetForm(); }}
        >
          <ActivityForm
            activityType={activityType} setActivityType={setActivityType}
            dayIcon={dayIcon} setDayIcon={setDayIcon}
            dayDestination={dayDestination} setDayDestination={setDayDestination}
            fromPlace={fromPlace} setFromPlace={setFromPlace}
            toPlace={toPlace} setToPlace={setToPlace}
            startTime={startTime} setStartTime={setStartTime}
            endTime={endTime} setEndTime={setEndTime}
            memo={memo} setMemo={setMemo}
            cost={cost} setCost={setCost}
            costType={costType} setCostType={setCostType}
            activityMembers={activityMembers} setActivityMembers={setActivityMembers}
            paidBy={paidBy} setPaidBy={setPaidBy}
            settled={settled} setSettled={setSettled}
            allMembers={tripData.members ?? []}
            daySelector={
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">日程<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
                <select
                  className={`${inputCls} appearance-none`}
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                >
                  <option value={0}></option>
                  {allDayNumbers.map((n) => (
                    <option key={n} value={n}>Day {n}  {fmtDayDate(tripData.startDate, n)}</option>
                  ))}
                </select>
              </div>
            }
            onClearError={() => setFormError("")}
          />
          {formError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">{formError}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full bg-[#22C55E] py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
              onClick={saveEdit}
            >
              保存
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => { setIsEditOpen(false); setEditingActivity(null); resetForm(); }}
            >
              キャンセル
            </button>
          </div>
        </Modal>
      )}

      {/* Template Modal */}
      {templateOpen && (
        <Modal title="持ち物テンプレート" onClose={() => setTemplateOpen(false)}>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            テンプレートを選ぶと持ち物リストに追加されます（重複はスキップ）
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {PACKING_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => {
                  const existing = new Set((tripData.packingList ?? []).map((p) => p.label));
                  const toAdd: PackingItem[] = tmpl.items
                    .filter((item) => !existing.has(item))
                    .map((item) => ({ id: `packing-${Date.now()}-${Math.random().toString(36).slice(2)}`, label: item, checked: false }));
                  if (toAdd.length > 0) {
                    updateTrip(tripData.id, (c) => ({
                      ...c,
                      packingList: [...(c.packingList ?? []), ...toAdd],
                    }));
                  }
                  setTemplateOpen(false);
                }}
                className="flex flex-col items-start gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-700/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tmpl.icon}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tmpl.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tmpl.items.slice(0, 4).join("・")}{tmpl.items.length > 4 ? "…" : ""}
                </p>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <Modal
          title="アクティビティを追加"
          onClose={() => { setIsAddOpen(false); resetForm(); }}
        >
          <ActivityForm
            activityType={activityType} setActivityType={setActivityType}
            dayIcon={dayIcon} setDayIcon={setDayIcon}
            dayDestination={dayDestination} setDayDestination={setDayDestination}
            fromPlace={fromPlace} setFromPlace={setFromPlace}
            toPlace={toPlace} setToPlace={setToPlace}
            startTime={startTime} setStartTime={setStartTime}
            endTime={endTime} setEndTime={setEndTime}
            memo={memo} setMemo={setMemo}
            cost={cost} setCost={setCost}
            costType={costType} setCostType={setCostType}
            activityMembers={activityMembers} setActivityMembers={setActivityMembers}
            paidBy={paidBy} setPaidBy={setPaidBy}
            settled={settled} setSettled={setSettled}
            allMembers={tripData.members ?? []}
            daySelector={
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">日程<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
                <select
                  className={`${inputCls} appearance-none`}
                  value={addDay}
                  onChange={(e) => setAddDay(Number(e.target.value))}
                >
                  <option value={0}></option>
                  {allDayNumbers.map((n) => (
                    <option key={n} value={n}>Day {n}  {fmtDayDate(tripData.startDate, n)}</option>
                  ))}
                </select>
              </div>
            }
            onClearError={() => setFormError("")}
            addReturnTrip={addReturnTrip} setAddReturnTrip={setAddReturnTrip}
          />
          {formError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">{formError}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full bg-[#22C55E] py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
              onClick={saveAdd}
            >
              追加
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => { setIsAddOpen(false); resetForm(); }}
            >
              キャンセル
            </button>
          </div>
        </Modal>
      )}
      {/* Maps Confirm Dialog */}
      {mapsUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setMapsUrl(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <MapPinIcon className="h-5 w-5 text-indigo-500" />
              Google マップへ移動
            </div>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Google マップアプリ（またはブラウザ）で場所を確認しますか？</p>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setMapsUrl(null)}
              >キャンセル</button>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full bg-[#22C55E] py-2 text-center text-sm font-semibold text-white transition hover:bg-green-400"
                onClick={() => setMapsUrl(null)}
              >Google マップへ</a>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareConfirmOpen && (
        <Modal title="旅を共有" onClose={() => setShareConfirmOpen(false)}>
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-300">共有したデータはサーバーに保存されます。</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">リンクを知っている人のみが閲覧できる状態になります。</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">合言葉<span className="ml-1 font-normal text-slate-400">（任意）</span></label>
              <input
                type="text"
                value={sharePasswordInput}
                onChange={(e) => setSharePasswordInput(e.target.value)}
                placeholder="設定しない場合は空欄"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
              />
              <p className="mt-1 text-[11px] text-slate-400">設定するとリンクを開いた際に合言葉の入力が必要になります</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShareConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                共有する
              </button>
            </div>
          </div>
        </Modal>
      )}

      {shareModal && (
        <Modal title="旅を共有" onClose={() => setShareModal(false)}>
          <div className="space-y-4">
            {/* Share link */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">共有リンク</p>
              {shareLinkLoading ? (
                <div className="flex h-9 items-center gap-2 text-xs text-slate-400">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  リンクを生成中...
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="w-14 shrink-0 rounded-lg bg-blue-500 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    {copiedLink ? "コピー済" : "コピー"}
                  </button>
                </div>
              )}
              <p className="mt-1 text-[11px] text-slate-400">リンクを知っている人のみ閲覧できます</p>
              {/* Password — owner only */}
              {tripData.shareOwner !== false && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">合言葉<span className="ml-1 font-normal text-slate-400">（任意）</span></p>
                  {sharePasswordConfirmPending ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-700 dark:bg-amber-900/20">
                      <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        合言葉を「{sharePasswordInput || "なし"}」に変更しますか？
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSharePasswordConfirmPending(false)}
                          className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!db || !activeShareId) return;
                            await setDoc(doc(db, "shared_trips", activeShareId), { password: sharePasswordInput || null }, { merge: true });
                            updateTrip(tripData.id, (c) => ({ ...c, sharePassword: sharePasswordInput || undefined }));
                            setSharePasswordConfirmPending(false);
                            setSharePasswordSaved(true);
                            setTimeout(() => setSharePasswordSaved(false), 2000);
                          }}
                          className="flex-1 rounded-lg bg-indigo-500 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
                        >
                          変更する
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sharePasswordInput}
                        onChange={(e) => { setSharePasswordInput(e.target.value); setSharePasswordSaved(false); }}
                        placeholder="設定しない場合は空欄"
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none ring-indigo-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setSharePasswordConfirmPending(true)}
                        className="w-14 shrink-0 rounded-lg bg-indigo-500 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
                      >
                        {sharePasswordSaved ? "保存済 ✓" : "設定"}
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">設定するとリンクを開いた際に合言葉の入力が必要になります</p>
                </div>
              )}
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-700/50">
                <p className="mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">インポート方法</p>
                <ol className="list-decimal space-y-0.5 pl-4 text-[11px] text-slate-400 dark:text-slate-500">
                  <li>上のリンクを相手に共有する</li>
                  <li>受け取った側はリンクを開く</li>
                  <li>設定の「データの追加」にURLを貼り付けて追加</li>
                </ol>
              </div>
            </div>
            {/* Text output */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">テキスト出力</p>
              <textarea
                readOnly
                value={shareText}
                rows={8}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="mt-2 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {copiedText ? "コピー済み ✓" : "テキストをコピー"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DndContext>
  );
}
