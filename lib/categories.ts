export type PlaceCategory = {
  icon: string;
  label: string;
};

export const DEFAULT_PLACE_CATEGORIES: PlaceCategory[] = [
  { icon: "🍽️", label: "食事" },
  { icon: "☕", label: "カフェ" },
  { icon: "🗼", label: "観光" },
  { icon: "🎡", label: "遊び" },
  { icon: "🏄", label: "体験" },
  { icon: "🏨", label: "宿泊" },
  { icon: "🛍️", label: "買い物" },
  { icon: "📍", label: "その他" },
];

export const MAX_PLACE_CATEGORIES = 12;

const STORAGE_KEY = "place_categories";

export function loadPlaceCategories(): PlaceCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {/* ignore */}
  return DEFAULT_PLACE_CATEGORIES;
}

export function savePlaceCategories(cats: PlaceCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch {/* ignore */}
}
