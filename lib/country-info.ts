import { COUNTRIES } from "./keiken";

export { COUNTRIES, CONTINENTS } from "./keiken";
export type { CountryDef } from "./keiken";

export type CountryInfo = {
  currency: string; // ISO 4217 通貨コード
  timezone: string; // IANA タイムゾーン（代表都市基準）
  city: string;     // 代表都市名（表示用）
  lat: number;      // 代表都市の緯度（天気予報取得用）
  lon: number;      // 代表都市の経度（天気予報取得用）
};

// 国土が複数タイムゾーンにまたがる国（米・露・豪など）は、代表都市の時差・天気で近似する
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  // アジア
  china:        { currency: "CNY", timezone: "Asia/Shanghai",    city: "北京",           lat: 39.90,  lon: 116.40 },
  south_korea:  { currency: "KRW", timezone: "Asia/Seoul",       city: "ソウル",         lat: 37.57,  lon: 126.98 },
  taiwan:       { currency: "TWD", timezone: "Asia/Taipei",      city: "台北",           lat: 25.03,  lon: 121.57 },
  hong_kong:    { currency: "HKD", timezone: "Asia/Hong_Kong",   city: "香港",           lat: 22.32,  lon: 114.17 },
  thailand:     { currency: "THB", timezone: "Asia/Bangkok",     city: "バンコク",       lat: 13.75,  lon: 100.50 },
  vietnam:      { currency: "VND", timezone: "Asia/Ho_Chi_Minh", city: "ホーチミン",     lat: 10.78,  lon: 106.70 },
  indonesia:    { currency: "IDR", timezone: "Asia/Jakarta",     city: "ジャカルタ",     lat: -6.21,  lon: 106.85 },
  singapore:    { currency: "SGD", timezone: "Asia/Singapore",   city: "シンガポール",   lat: 1.35,   lon: 103.82 },
  malaysia:     { currency: "MYR", timezone: "Asia/Kuala_Lumpur",city: "クアラルンプール",lat: 3.14,   lon: 101.69 },
  philippines:  { currency: "PHP", timezone: "Asia/Manila",      city: "マニラ",         lat: 14.60,  lon: 120.98 },
  india:        { currency: "INR", timezone: "Asia/Kolkata",     city: "ニューデリー",   lat: 28.61,  lon: 77.21 },
  nepal:        { currency: "NPR", timezone: "Asia/Kathmandu",   city: "カトマンズ",     lat: 27.72,  lon: 85.32 },
  cambodia:     { currency: "KHR", timezone: "Asia/Phnom_Penh",  city: "プノンペン",     lat: 11.56,  lon: 104.92 },
  myanmar:      { currency: "MMK", timezone: "Asia/Yangon",      city: "ヤンゴン",       lat: 16.87,  lon: 96.20 },
  laos:         { currency: "LAK", timezone: "Asia/Vientiane",   city: "ビエンチャン",   lat: 17.97,  lon: 102.60 },
  sri_lanka:    { currency: "LKR", timezone: "Asia/Colombo",     city: "コロンボ",       lat: 6.93,   lon: 79.85 },
  maldives:     { currency: "MVR", timezone: "Indian/Maldives",  city: "マレ",           lat: 4.18,   lon: 73.51 },
  bhutan:       { currency: "BTN", timezone: "Asia/Thimphu",     city: "ティンプー",     lat: 27.47,  lon: 89.64 },
  mongolia:     { currency: "MNT", timezone: "Asia/Ulaanbaatar", city: "ウランバートル", lat: 47.92,  lon: 106.92 },
  macau:        { currency: "MOP", timezone: "Asia/Macau",       city: "マカオ",         lat: 22.20,  lon: 113.55 },
  // ヨーロッパ
  france:       { currency: "EUR", timezone: "Europe/Paris",     city: "パリ",           lat: 48.86,  lon: 2.35 },
  uk:           { currency: "GBP", timezone: "Europe/London",    city: "ロンドン",       lat: 51.51,  lon: -0.13 },
  germany:      { currency: "EUR", timezone: "Europe/Berlin",    city: "ベルリン",       lat: 52.52,  lon: 13.40 },
  italy:        { currency: "EUR", timezone: "Europe/Rome",      city: "ローマ",         lat: 41.90,  lon: 12.50 },
  spain:        { currency: "EUR", timezone: "Europe/Madrid",    city: "マドリード",     lat: 40.42,  lon: -3.70 },
  portugal:     { currency: "EUR", timezone: "Europe/Lisbon",    city: "リスボン",       lat: 38.72,  lon: -9.14 },
  netherlands:  { currency: "EUR", timezone: "Europe/Amsterdam", city: "アムステルダム", lat: 52.37,  lon: 4.90 },
  belgium:      { currency: "EUR", timezone: "Europe/Brussels",  city: "ブリュッセル",   lat: 50.85,  lon: 4.35 },
  switzerland:  { currency: "CHF", timezone: "Europe/Zurich",    city: "チューリッヒ",   lat: 47.37,  lon: 8.55 },
  austria:      { currency: "EUR", timezone: "Europe/Vienna",    city: "ウィーン",       lat: 48.21,  lon: 16.37 },
  czech:        { currency: "CZK", timezone: "Europe/Prague",    city: "プラハ",         lat: 50.08,  lon: 14.44 },
  hungary:      { currency: "HUF", timezone: "Europe/Budapest",  city: "ブダペスト",     lat: 47.50,  lon: 19.04 },
  poland:       { currency: "PLN", timezone: "Europe/Warsaw",    city: "ワルシャワ",     lat: 52.23,  lon: 21.01 },
  greece:       { currency: "EUR", timezone: "Europe/Athens",    city: "アテネ",         lat: 37.98,  lon: 23.73 },
  croatia:      { currency: "EUR", timezone: "Europe/Zagreb",    city: "ザグレブ",       lat: 45.81,  lon: 15.98 },
  sweden:       { currency: "SEK", timezone: "Europe/Stockholm", city: "ストックホルム", lat: 59.33,  lon: 18.07 },
  norway:       { currency: "NOK", timezone: "Europe/Oslo",      city: "オスロ",         lat: 59.91,  lon: 10.75 },
  finland:      { currency: "EUR", timezone: "Europe/Helsinki",  city: "ヘルシンキ",     lat: 60.17,  lon: 24.94 },
  denmark:      { currency: "DKK", timezone: "Europe/Copenhagen",city: "コペンハーゲン", lat: 55.68,  lon: 12.57 },
  iceland:      { currency: "ISK", timezone: "Atlantic/Reykjavik", city: "レイキャビク", lat: 64.15,  lon: -21.94 },
  russia:       { currency: "RUB", timezone: "Europe/Moscow",    city: "モスクワ",       lat: 55.76,  lon: 37.62 },
  // 北米・オセアニア
  usa:          { currency: "USD", timezone: "America/New_York", city: "ニューヨーク",   lat: 40.71,  lon: -74.01 },
  canada:       { currency: "CAD", timezone: "America/Toronto",  city: "トロント",       lat: 43.65,  lon: -79.38 },
  mexico:       { currency: "MXN", timezone: "America/Mexico_City", city: "メキシコシティ", lat: 19.43, lon: -99.13 },
  australia:    { currency: "AUD", timezone: "Australia/Sydney", city: "シドニー",       lat: -33.87, lon: 151.21 },
  new_zealand:  { currency: "NZD", timezone: "Pacific/Auckland", city: "オークランド",   lat: -36.85, lon: 174.76 },
  fiji:         { currency: "FJD", timezone: "Pacific/Fiji",     city: "スバ",           lat: -18.14, lon: 178.44 },
  // 中南米
  brazil:       { currency: "BRL", timezone: "America/Sao_Paulo", city: "サンパウロ",    lat: -23.55, lon: -46.63 },
  argentina:    { currency: "ARS", timezone: "America/Argentina/Buenos_Aires", city: "ブエノスアイレス", lat: -34.60, lon: -58.38 },
  peru:         { currency: "PEN", timezone: "America/Lima",     city: "リマ",           lat: -12.05, lon: -77.04 },
  chile:        { currency: "CLP", timezone: "America/Santiago", city: "サンティアゴ",   lat: -33.45, lon: -70.65 },
  colombia:     { currency: "COP", timezone: "America/Bogota",   city: "ボゴタ",         lat: 4.71,   lon: -74.07 },
  cuba:         { currency: "CUP", timezone: "America/Havana",   city: "ハバナ",         lat: 23.13,  lon: -82.38 },
  costa_rica:   { currency: "CRC", timezone: "America/Costa_Rica", city: "サンホセ",     lat: 9.93,   lon: -84.08 },
  // 中東
  uae:          { currency: "AED", timezone: "Asia/Dubai",       city: "ドバイ",         lat: 25.20,  lon: 55.27 },
  turkey:       { currency: "TRY", timezone: "Europe/Istanbul",  city: "イスタンブール", lat: 41.01,  lon: 28.98 },
  israel:       { currency: "ILS", timezone: "Asia/Jerusalem",   city: "エルサレム",     lat: 31.77,  lon: 35.21 },
  jordan:       { currency: "JOD", timezone: "Asia/Amman",       city: "アンマン",       lat: 31.95,  lon: 35.93 },
  qatar:        { currency: "QAR", timezone: "Asia/Qatar",       city: "ドーハ",         lat: 25.29,  lon: 51.53 },
  saudi:        { currency: "SAR", timezone: "Asia/Riyadh",      city: "リヤド",         lat: 24.71,  lon: 46.68 },
  // アフリカ
  egypt:        { currency: "EGP", timezone: "Africa/Cairo",       city: "カイロ",       lat: 30.04,  lon: 31.24 },
  morocco:      { currency: "MAD", timezone: "Africa/Casablanca",  city: "カサブランカ", lat: 33.57,  lon: -7.59 },
  south_africa: { currency: "ZAR", timezone: "Africa/Johannesburg",city: "ヨハネスブルグ", lat: -26.20, lon: 28.05 },
  kenya:        { currency: "KES", timezone: "Africa/Nairobi",     city: "ナイロビ",     lat: -1.29,  lon: 36.82 },
  tanzania:     { currency: "TZS", timezone: "Africa/Dar_es_Salaam", city: "ダルエスサラーム", lat: -6.79, lon: 39.21 },
  ethiopia:     { currency: "ETB", timezone: "Africa/Addis_Ababa", city: "アディスアベバ", lat: 9.03,  lon: 38.74 },
};

// 通貨コード → 日本語の通称（「1ドル＝○円」のように使う）
export const CURRENCY_NAME: Record<string, string> = {
  CNY: "元", KRW: "ウォン", TWD: "台湾ドル", HKD: "香港ドル", THB: "バーツ",
  VND: "ドン", IDR: "ルピア", SGD: "シンガポールドル", MYR: "リンギット",
  PHP: "ペソ", INR: "ルピー", NPR: "ネパールルピー", KHR: "リエル",
  MMK: "チャット", LAK: "キープ", LKR: "スリランカルピー", MVR: "ルフィヤ",
  BTN: "ヌルタム", MNT: "トゥグルグ", MOP: "パタカ",
  EUR: "ユーロ", GBP: "ポンド", CHF: "フラン", CZK: "コルナ", HUF: "フォリント",
  PLN: "ズロチ", SEK: "スウェーデンクローナ", NOK: "ノルウェークローネ",
  DKK: "デンマーククローネ", ISK: "アイスランドクローナ", RUB: "ルーブル",
  USD: "ドル", CAD: "カナダドル", MXN: "メキシコペソ", AUD: "オーストラリアドル",
  NZD: "ニュージーランドドル", FJD: "フィジードル",
  BRL: "レアル", ARS: "アルゼンチンペソ", PEN: "ソル", CLP: "チリペソ",
  COP: "コロンビアペソ", CUP: "キューバペソ", CRC: "コロン",
  AED: "ディルハム", TRY: "リラ", ILS: "シェケル", JOD: "ヨルダンディナール",
  QAR: "カタールリアル", SAR: "サウジリヤル",
  EGP: "エジプトポンド", MAD: "モロッコディルハム", ZAR: "ランド",
  KES: "ケニアシリング", TZS: "タンザニアシリング", ETB: "ブル",
};

// 通貨コード → 記号（見つからない場合はコードのまま表示）
export const CURRENCY_SYMBOL: Record<string, string> = {
  KRW: "₩", THB: "฿", VND: "₫", PHP: "₱", INR: "₹",
  EUR: "€", GBP: "£", USD: "$", CAD: "$", AUD: "$",
  NZD: "$", SGD: "$", HKD: "$", TWD: "NT$", MYR: "RM",
  TRY: "₺", ILS: "₪", RUB: "₽", BRL: "R$", ZAR: "R",
  CNY: "¥", IDR: "Rp", MXN: "$", ARS: "$", CLP: "$",
  COP: "$", CUP: "$", MOP: "MOP$",
};

// 通貨コードを記号があれば記号、無ければコードのまま返す（例: "₩" / "KRW"）
export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOL[code] ?? code;
}

// 通貨コード一覧（日本語名の五十音順）。外貨入力欄のプルダウンなどに使う
export const CURRENCY_CODES: string[] = Object.keys(CURRENCY_NAME).sort((a, b) =>
  CURRENCY_NAME[a].localeCompare(CURRENCY_NAME[b], "ja")
);

// rateFromJpy = APIが返す「1円あたりの現地通貨額」。読みやすい単位（1,10,100...）に自動調整して
// 「1ドル＝150円」「100ウォン＝11円」のような文字列を作る
export function formatCurrencyRate(currency: string, rateFromJpy: number): string {
  const symbol = currencySymbol(currency);
  const jpyPerUnit = 1 / rateFromJpy;
  let unit = 1;
  let yen = jpyPerUnit;
  while (yen < 1 && unit < 100000) {
    unit *= 10;
    yen = jpyPerUnit * unit;
  }
  const yenStr = yen.toLocaleString(undefined, {
    maximumFractionDigits: yen >= 100 ? 0 : yen >= 10 ? 1 : 2,
  });
  return `${unit === 1 ? "" : unit.toLocaleString()}${symbol}＝${yenStr}円`;
}

export function getCountryDef(id: string) {
  return COUNTRIES.find((c) => c.id === id);
}

// 東京とtimezoneの時差を分単位で返す（現在時刻・DST考慮）
export function getTimeDiffMinutes(timezone: string): number {
  const now = new Date();
  const asMinutes = (tz: string) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
    return Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day")), Number(get("hour")), Number(get("minute"))) / 60000;
  };
  return asMinutes(timezone) - asMinutes("Asia/Tokyo");
}

export function formatTimeDiff(diffMinutes: number): string {
  if (diffMinutes === 0) return "0時間";
  const sign = diffMinutes > 0 ? "+" : "−";
  const abs = Math.abs(diffMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (m === 0) return `${sign}${h}時間`;
  if (m === 30) return `${sign}${h}.5時間`;
  return `${sign}${h}時間${m}分`;
}
