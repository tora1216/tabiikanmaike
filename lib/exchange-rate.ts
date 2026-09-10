// オンライン時に無料APIから為替レートを取得し、1日1回localStorageにキャッシュする
// オフライン・API接続失敗時は前回取得できたレートを「stale」として返す（なければnull＝非表示）
const CACHE_KEY = "exchange_rates_jpy_v1";
const API_URL = "https://open.er-api.com/v6/latest/JPY";

type RatesCache = { date: string; rates: Record<string, number> };

export type JpyRatesResult = { rates: Record<string, number>; date: string; stale: boolean };

function readCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as RatesCache) : null;
  } catch {
    return null;
  }
}

function writeCache(rates: Record<string, number>): string {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const cache: RatesCache = { date, rates };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  return date;
}

// 1 JPY あたりの各通貨レートを返す（取得できず、キャッシュも無い場合はnull）
export async function getJpyRates(): Promise<JpyRatesResult | null> {
  const today = new Date().toISOString().slice(0, 10);
  const cached = readCache();
  if (cached && cached.date === today) return { rates: cached.rates, date: cached.date, stale: false };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return cached ? { rates: cached.rates, date: cached.date, stale: true } : null;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("exchange rate fetch failed");
    const data = await res.json();
    if (data.result !== "success" || !data.rates) throw new Error("invalid exchange rate response");
    const date = writeCache(data.rates);
    return { rates: data.rates as Record<string, number>, date, stale: false };
  } catch {
    return cached ? { rates: cached.rates, date: cached.date, stale: true } : null;
  }
}
