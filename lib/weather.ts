// Open-Meteo（APIキー不要・無料）で最大16日先までの日別天気予報を取得する
const CACHE_PREFIX = "weather_forecast_v1_";

export type DailyForecast = { code: number; tempMax: number; tempMin: number };

type ForecastCache = { fetchedAt: string; days: Record<string, DailyForecast> };

function cacheKey(lat: number, lon: number) {
  return `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

function readCache(key: string): ForecastCache | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ForecastCache) : null;
  } catch {
    return null;
  }
}

// 日付（YYYY-MM-DD）→ その日の天気、のマップを返す（取得できずキャッシュも無ければnull）
export async function getWeatherForecast(lat: number, lon: number): Promise<Record<string, DailyForecast> | null> {
  const key = cacheKey(lat, lon);
  const today = new Date().toISOString().slice(0, 10);
  const cached = readCache(key);
  if (cached && cached.fetchedAt === today) return cached.days;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return cached?.days ?? null;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather fetch failed");
    const data = await res.json();
    const dates: string[] = data.daily?.time ?? [];
    const codes: number[] = data.daily?.weathercode ?? [];
    const maxs: number[] = data.daily?.temperature_2m_max ?? [];
    const mins: number[] = data.daily?.temperature_2m_min ?? [];
    const days: Record<string, DailyForecast> = {};
    dates.forEach((d, i) => { days[d] = { code: codes[i], tempMax: maxs[i], tempMin: mins[i] }; });
    try { localStorage.setItem(key, JSON.stringify({ fetchedAt: today, days })); } catch { /* ignore */ }
    return days;
  } catch {
    return cached?.days ?? null;
  }
}

// WMO weather code → 絵文字
export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55, 56, 57, 80, 81, 82].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}
