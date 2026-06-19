"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HomeIcon, PlusIcon, PencilSquareIcon, TrashIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import {
  TravelPlan, PlanItem, PlanItemType,
  loadTravelPlans, saveTravelPlans, genPlanId, planTotal,
  ITEM_TYPE_ICON, ITEM_TYPE_LABEL, PLAN_SECTIONS,
} from "@/lib/travel-plans";

const HOTEL_SITES = ["じゃらん", "楽天トラベル", "Yahooトラベル", "Trip.com", "Expedia"];

function hotelSiteUrl(site: string, name: string): string {
  const q = encodeURIComponent(name);
  switch (site) {
    case "じゃらん": return `https://www.jalan.net/yad/?keyword=${q}`;
    case "楽天トラベル": return `https://travel.rakuten.co.jp/keyword/${q}/`;
    case "Yahooトラベル": return `https://travel.yahoo.co.jp/keyword?q=${q}`;
    case "Trip.com": return `https://jp.trip.com/hotels/list?keyword=${q}`;
    case "Expedia": return `https://www.expedia.co.jp/Hotel-Search?destination=${q}`;
    default: return `https://www.google.com/search?q=${q}`;
  }
}

export default function PlanningPage() {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planNameDraft, setPlanNameDraft] = useState("");
  const [planEditId, setPlanEditId] = useState<string | null>(null);
  const [planDeleteConfirm, setPlanDeleteConfirm] = useState<(() => void) | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemEditId, setItemEditId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<PlanItemType>("outbound");
  const [itemOrigin, setItemOrigin] = useState("");
  const [itemDestination, setItemDestination] = useState("");
  const [itemLabel, setItemLabel] = useState("");
  const [itemDateFrom, setItemDateFrom] = useState("");
  const [itemDateTo, setItemDateTo] = useState("");
  const [itemNights, setItemNights] = useState(1);
  const [itemPrice, setItemPrice] = useState<number | "">("");
  const [itemMemo, setItemMemo] = useState("");
  const [itemDeleteConfirm, setItemDeleteConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    const plans = loadTravelPlans();
    setTravelPlans(plans);
    if (plans.length > 0) setActivePlanId(plans[0].id);
  }, []);

  const fmtDate = (d: string, withTime?: boolean) => {
    if (!d) return "";
    const [datePart, timePart] = d.includes("T") ? d.split("T") : [d, ""];
    const hasDate = !!datePart;
    const hasTime = withTime && !!timePart;
    let base = "";
    if (hasDate) {
      const dt = new Date(datePart);
      if (!isNaN(dt.getTime())) base = `${dt.getMonth() + 1}/${dt.getDate()}`;
    }
    if (hasTime) {
      const [h, m] = timePart.split(":");
      const time = `${h ?? ""}:${m ?? ""}`;
      return base ? `${base} ${time}` : time;
    }
    return base;
  };

  const updatePlans = (next: TravelPlan[]) => {
    setTravelPlans(next);
    saveTravelPlans(next);
  };

  const addPlan = (name: string) => {
    const plan: TravelPlan = {
      id: genPlanId(),
      name: name.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };
    updatePlans([...travelPlans, plan]);
  };

  const renamePlan = (id: string, name: string) => {
    updatePlans(travelPlans.map(p => p.id === id ? { ...p, name: name.trim() } : p));
  };

  const deletePlan = (id: string) => {
    updatePlans(travelPlans.filter(p => p.id !== id));
  };

  const resetItemForm = () => {
    setItemOrigin(""); setItemDestination(""); setItemLabel(""); setItemDateFrom("");
    setItemDateTo(""); setItemNights(1); setItemPrice(""); setItemMemo("");
    setItemEditId(null);
  };

  const openAddItem = (planId: string, type: PlanItemType) => {
    resetItemForm();
    setItemType(type);
    setActivePlanId(planId);
    setItemModalOpen(true);
  };

  const openEditItem = (planId: string, item: PlanItem) => {
    setActivePlanId(planId);
    setItemEditId(item.id); setItemType(item.type);
    setItemOrigin(item.origin ?? ""); setItemDestination(item.destination ?? "");
    setItemLabel(item.label); setItemDateFrom(item.dateFrom); setItemDateTo(item.dateTo ?? "");
    setItemNights(item.nights ?? 1); setItemPrice(item.price === 0 ? "" : item.price); setItemMemo(item.memo ?? "");
    setItemModalOpen(true);
  };

  const saveItem = () => {
    if (!activePlanId || !itemLabel.trim()) return;
    const item: PlanItem = {
      id: itemEditId ?? genPlanId(),
      type: itemType,
      origin: itemType !== "hotel" ? (itemOrigin.trim() || undefined) : undefined,
      destination: itemType !== "hotel" ? (itemDestination.trim() || undefined) : undefined,
      label: itemLabel.trim(),
      dateFrom: itemDateFrom,
      dateTo: itemType !== "hotel" ? (itemDateTo || undefined) : undefined,
      nights: itemType === "hotel" ? itemNights : undefined,
      price: itemPrice === "" ? 0 : itemPrice,
      memo: itemMemo.trim() || undefined,
    };
    updatePlans(travelPlans.map(p => {
      if (p.id !== activePlanId) return p;
      const items = itemEditId
        ? p.items.map(i => i.id === itemEditId ? item : i)
        : [...p.items, item];
      return { ...p, items };
    }));
    setItemModalOpen(false);
  };

  const deleteItem = (planId: string, itemId: string) => {
    updatePlans(travelPlans.map(p =>
      p.id === planId ? { ...p, items: p.items.filter(i => i.id !== itemId) } : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:bg-slate-800/90 dark:border-slate-700">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            <HomeIcon className="h-3.5 w-3.5" />一覧に戻る
          </Link>
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-slate-900 dark:text-white">旅の検討</span>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {travelPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="text-5xl">✏️</span>
            <p className="mt-4 text-base font-bold text-slate-600 dark:text-slate-300">検討中のプランがありません</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">右下の＋ボタンからプランを作りましょう。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const minTotal = Math.min(...travelPlans.map(p => planTotal(p)));
              return travelPlans.map(plan => {
              const isCheapest = travelPlans.length > 1 && planTotal(plan) === minTotal;
              return (
              <div key={plan.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                {/* Plan header */}
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white">{plan.name}</span>
                    {isCheapest && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600 dark:bg-green-900/40 dark:text-green-400">最安</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { setPlanNameDraft(plan.name); setPlanEditId(plan.id); setPlanModalOpen(true); }}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanDeleteConfirm(() => () => deletePlan(plan.id))}
                      className="rounded-full p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sections */}
                {PLAN_SECTIONS.map((sectionType, idx) => {
                  const sectionItems = plan.items.filter(i => i.type === sectionType);
                  return (
                    <div key={sectionType} className={idx > 0 ? "border-t border-slate-100 dark:border-slate-700" : ""}>
                      <div className="flex items-center justify-between px-4 pt-3 pb-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>{ITEM_TYPE_ICON[sectionType]}</span>{ITEM_TYPE_LABEL[sectionType]}
                        </span>
                        <button
                          type="button"
                          onClick={() => openAddItem(plan.id, sectionType)}
                          className="flex items-center gap-0.5 rounded-full bg-[#22C55E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-400"
                        >
                          <PlusIcon className="h-3 w-3" />追加
                        </button>
                      </div>
                      {sectionItems.length === 0 ? (
                        <p className="px-4 pb-3 text-xs text-slate-300 dark:text-slate-600">未登録</p>
                      ) : (
                        <ul className="pb-2">
                          {sectionItems.map(item => (
                            <li key={item.id} className="flex items-center gap-3 px-4 py-2">
                              <div className="min-w-0 flex-1">
                                {/* 出発地→目的地 */}
                                {(item.origin || item.destination) && (
                                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {item.origin ?? "?"} → {item.destination ?? "?"}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.dateFrom && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {fmtDate(item.dateFrom, item.type !== "hotel")}{item.dateTo && item.dateTo !== item.dateFrom ? `〜${fmtDate(item.dateTo, item.type !== "hotel")}` : ""}
                                    </span>
                                  )}
                                  {item.type === "hotel"
                                    ? <span className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</span>
                                    : item.label && <span className="truncate text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                                  }
                                  {item.type === "hotel" && item.nights && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.nights}泊</span>
                                  )}
                                </div>
                                {item.memo && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{item.memo}</p>}
                                {item.type === "hotel" && item.label && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {HOTEL_SITES.map(site => (
                                      <a
                                        key={site}
                                        href={hotelSiteUrl(site, item.label)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-0.5 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500 transition hover:border-green-300 hover:text-green-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-green-600 dark:hover:text-green-400"
                                      >
                                        {site}<ArrowTopRightOnSquareIcon className="h-2.5 w-2.5" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="shrink-0 text-sm font-bold text-slate-700 dark:text-slate-200">¥{item.price.toLocaleString()}</span>
                              <div className="flex shrink-0 items-center gap-0.5">
                                <button type="button" onClick={() => openEditItem(plan.id, item)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                  <PencilSquareIcon className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => setItemDeleteConfirm(() => () => deleteItem(plan.id, item.id))} className="rounded-full p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}

                {/* Total */}
                <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    合計 <span className="ml-1 text-base text-slate-900 dark:text-white">¥{planTotal(plan).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            );
            });
            })()}
          </div>
        )}
      </main>

      {/* ─── FAB ────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => { setPlanNameDraft(""); setPlanEditId(null); setPlanModalOpen(true); }}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] shadow-lg hover:bg-green-400 active:scale-95 transition"
        aria-label="プラン追加"
      >
        <PlusIcon className="h-7 w-7 text-white" />
      </button>

      {/* ─── プラン追加・編集ダイアログ ─────────────────────────────────────── */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setPlanModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">{planEditId ? "プランを編集" : "プランを追加"}</h3>
            <input
              type="text"
              value={planNameDraft}
              onChange={e => setPlanNameDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && planNameDraft.trim()) {
                  planEditId ? renamePlan(planEditId, planNameDraft) : addPlan(planNameDraft);
                  setPlanModalOpen(false);
                }
              }}
              placeholder="例）ANA案、JAL案"
              maxLength={20}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setPlanModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">キャンセル</button>
              <button
                type="button"
                disabled={!planNameDraft.trim()}
                onClick={() => { planEditId ? renamePlan(planEditId, planNameDraft) : addPlan(planNameDraft); setPlanModalOpen(false); }}
                className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-40"
              >保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── アイテム追加・編集ダイアログ ───────────────────────────────────── */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-6" onClick={() => setItemModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <p className="mb-1 text-xs font-semibold text-slate-400">{ITEM_TYPE_ICON[itemType]} {ITEM_TYPE_LABEL[itemType]}</p>
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">{itemEditId ? "編集" : "追加"}</h3>
            <div className="space-y-3">
              {itemType !== "hotel" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">出発地</label>
                    <input type="text" value={itemOrigin} onChange={e => setItemOrigin(e.target.value)} placeholder="例）東京" autoFocus className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">目的地</label>
                    <input type="text" value={itemDestination} onChange={e => setItemDestination(e.target.value)} placeholder="例）大阪" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{itemType === "hotel" ? "名前 *" : "便名・航空会社（任意）"}</label>
                <input
                  type="text"
                  value={itemLabel}
                  onChange={e => setItemLabel(e.target.value)}
                  placeholder={itemType === "hotel" ? "例）渋谷エクセルホテル" : "例）ANA 123"}
                  autoFocus={itemType === "hotel"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              {itemType === "hotel" ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">チェックイン</label>
                    <input type="date" value={itemDateFrom} onChange={e => setItemDateFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">泊数</label>
                    <input type="number" min={1} value={itemNights} onChange={e => setItemNights(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(["from", "to"] as const).map(side => {
                    const val = side === "from" ? itemDateFrom : itemDateTo;
                    const setVal = side === "from" ? setItemDateFrom : setItemDateTo;
                    const [datePart, timePart] = val ? val.split("T") : ["", ""];
                    const fromDatePart = itemDateFrom ? itemDateFrom.split("T")[0] : "";
                    return (
                      <div key={side}>
                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{side === "from" ? "出発" : "到着"}</label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={datePart ?? ""}
                            onChange={e => {
                              setVal(e.target.value + "T" + (timePart ?? ""));
                              // 出発日変更時、到着日が未入力なら同じ日付をセット
                              if (side === "from" && !itemDateTo.split("T")[0]) {
                                setItemDateTo(e.target.value + "T" + (itemDateTo.split("T")[1] ?? ""));
                              }
                            }}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                          <input
                            type="time"
                            value={timePart ?? ""}
                            onChange={e => setVal((datePart ?? (side === "to" ? fromDatePart : "")) + "T" + e.target.value)}
                            className="w-28 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">金額（円）</label>
                <input type="number" min={0} value={itemPrice} placeholder="0" onChange={e => setItemPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">メモ（任意）</label>
                <input type="text" value={itemMemo} onChange={e => setItemMemo(e.target.value)} placeholder="例）2000円OFFクーポン適用" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none ring-green-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setItemModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">キャンセル</button>
              <button type="button" disabled={!itemLabel.trim()} onClick={saveItem} className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-40">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── プラン削除確認 ──────────────────────────────────────────────────── */}
      {planDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setPlanDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">プランを削除</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">このプランとすべてのアイテムを削除しますか？</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPlanDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">キャンセル</button>
              <button type="button" onClick={() => { planDeleteConfirm(); setPlanDeleteConfirm(null); }} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">削除</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── アイテム削除確認 ────────────────────────────────────────────────── */}
      {itemDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setItemDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">アイテムを削除</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">このアイテムを削除しますか？</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setItemDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">キャンセル</button>
              <button type="button" onClick={() => { itemDeleteConfirm(); setItemDeleteConfirm(null); }} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">削除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
