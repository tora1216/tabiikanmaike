export type PlanItemType = "outbound" | "return" | "hotel";

export type PlanItem = {
  id: string;
  type: PlanItemType;
  origin?: string;
  destination?: string;
  dateFrom: string;
  dateTo?: string;
  label: string;
  nights?: number;
  price: number;
  memo?: string;
};

export type TravelPlan = {
  id: string;
  name: string;
  items: PlanItem[];
  createdAt: string;
};

const STORAGE_KEY = "travel_plans";

export function loadTravelPlans(): TravelPlan[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? (JSON.parse(s) as TravelPlan[]) : [];
  } catch { return []; }
}

export function saveTravelPlans(plans: TravelPlan[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); } catch { /* ignore */ }
}

export function genPlanId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function planTotal(plan: TravelPlan): number {
  return plan.items.reduce((s, i) => s + i.price, 0);
}

export const ITEM_TYPE_ICON: Record<PlanItemType, string> = {
  outbound: "🛫",
  return: "🛬",
  hotel: "🏨",
};

export const ITEM_TYPE_LABEL: Record<PlanItemType, string> = {
  outbound: "往路",
  return: "復路",
  hotel: "ホテル",
};

export const PLAN_SECTIONS: PlanItemType[] = ["outbound", "return", "hotel"];
