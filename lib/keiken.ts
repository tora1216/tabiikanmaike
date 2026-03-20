// ─── 経験レベル定義 ────────────────────────────────────────────────────────────

export const LEVELS = [
  { value: 0, short: "未踏", label: "行ってない",   bg: "#FFFFFF", border: "#D1D5DB", text: "#6B7280", dot: "#E5E7EB" },
  { value: 1, short: "通過", label: "通過した",     bg: "#DBEAFE", border: "#93C5FD", text: "#1D4ED8", dot: "#60A5FA" },
  { value: 2, short: "接地", label: "降り立った",   bg: "#D1FAE5", border: "#6EE7B7", text: "#065F46", dot: "#34D399" },
  { value: 3, short: "訪問", label: "歩いた",       bg: "#FEF9C3", border: "#FDE047", text: "#854D0E", dot: "#FBBF24" },
  { value: 4, short: "宿泊", label: "泊まった",     bg: "#FFEDD5", border: "#FDBA74", text: "#9A3412", dot: "#FB923C" },
  { value: 5, short: "居住", label: "住んだ",       bg: "#FCE7F3", border: "#F9A8D4", text: "#9D174D", dot: "#EC4899" },
];

// ─── 都道府県データ ─────────────────────────────────────────────────────────────

export type PrefDef = { id: string; name: string; col: number; row: number; colSpan?: number; rowSpan?: number };

export const PREFECTURES: PrefDef[] = [
  { id: "hokkaido",   name: "北海道", col:  9, row:  0, colSpan: 2, rowSpan: 2 },
  { id: "aomori",     name: "青森",   col:  9, row:  2 },
  { id: "iwate",      name: "岩手",   col: 10, row:  2 },
  { id: "akita",      name: "秋田",   col:  8, row:  3 },
  { id: "miyagi",     name: "宮城",   col:  9, row:  3 },
  { id: "yamagata",   name: "山形",   col:  8, row:  4 },
  { id: "fukushima",  name: "福島",   col:  9, row:  4 },
  { id: "ibaraki",    name: "茨城",   col: 10, row:  5 },
  { id: "tochigi",    name: "栃木",   col:  9, row:  5 },
  { id: "gunma",      name: "群馬",   col:  8, row:  5 },
  { id: "saitama",    name: "埼玉",   col:  9, row:  6 },
  { id: "chiba",      name: "千葉",   col: 10, row:  6 },
  { id: "tokyo",      name: "東京",   col:  9, row:  7 },
  { id: "kanagawa",   name: "神奈川", col:  9, row:  8 },
  { id: "niigata",    name: "新潟",   col:  7, row:  5 },
  { id: "toyama",     name: "富山",   col:  6, row:  6 },
  { id: "ishikawa",   name: "石川",   col:  5, row:  6 },
  { id: "fukui",      name: "福井",   col:  4, row:  7 },
  { id: "yamanashi",  name: "山梨",   col:  8, row:  6 },
  { id: "nagano",     name: "長野",   col:  7, row:  6 },
  { id: "gifu",       name: "岐阜",   col:  6, row:  7 },
  { id: "shizuoka",   name: "静岡",   col:  8, row:  7 },
  { id: "aichi",      name: "愛知",   col:  7, row:  7 },
  { id: "mie",        name: "三重",   col:  8, row:  8 },
  { id: "shiga",      name: "滋賀",   col:  6, row:  8 },
  { id: "kyoto",      name: "京都",   col:  5, row:  8 },
  { id: "osaka",      name: "大阪",   col:  5, row:  9 },
  { id: "hyogo",      name: "兵庫",   col:  4, row:  8 },
  { id: "nara",       name: "奈良",   col:  7, row:  9 },
  { id: "wakayama",   name: "和歌山", col:  7, row: 10 },
  { id: "tottori",    name: "鳥取",   col:  3, row:  8 },
  { id: "shimane",    name: "島根",   col:  2, row:  8 },
  { id: "okayama",    name: "岡山",   col:  4, row:  9 },
  { id: "hiroshima",  name: "広島",   col:  3, row:  9 },
  { id: "yamaguchi",  name: "山口",   col:  2, row:  9 },
  { id: "ehime",      name: "愛媛",   col:  3, row: 10 },
  { id: "kagawa",     name: "香川",   col:  4, row: 10 },
  { id: "tokushima",  name: "徳島",   col:  5, row: 10 },
  { id: "kochi",      name: "高知",   col:  4, row: 11 },
  { id: "saga",       name: "佐賀",   col:  0, row: 10 },
  { id: "fukuoka",    name: "福岡",   col:  1, row: 10 },
  { id: "oita",       name: "大分",   col:  2, row: 10 },
  { id: "nagasaki",   name: "長崎",   col:  0, row: 11 },
  { id: "kumamoto",   name: "熊本",   col:  1, row: 11 },
  { id: "miyazaki",   name: "宮崎",   col:  2, row: 11 },
  { id: "kagoshima",  name: "鹿児島", col:  1, row: 12 },
  { id: "okinawa",    name: "沖縄",   col:  0, row: 13 },
];

export const PREF_ORDER = [
  "hokkaido",
  "aomori","iwate","akita","miyagi","yamagata","fukushima",
  "ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",
  "niigata","toyama","ishikawa","fukui","yamanashi","nagano","gifu","shizuoka","aichi",
  "mie","shiga","kyoto","osaka","hyogo","nara","wakayama",
  "tottori","shimane","okayama","hiroshima","yamaguchi",
  "kagawa","tokushima","ehime","kochi",
  "fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima",
  "okinawa",
];

export const MAX_SCORE = PREFECTURES.length * 5;

export const REGIONS = [
  { name: "北海道",     ids: ["hokkaido"] },
  { name: "東北",       ids: ["aomori","iwate","miyagi","akita","yamagata","fukushima"] },
  { name: "関東",       ids: ["ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa"] },
  { name: "中部",       ids: ["niigata","toyama","ishikawa","fukui","yamanashi","nagano","gifu","shizuoka","aichi"] },
  { name: "近畿",       ids: ["mie","shiga","kyoto","osaka","hyogo","nara","wakayama"] },
  { name: "中国",       ids: ["tottori","shimane","okayama","hiroshima","yamaguchi"] },
  { name: "四国",       ids: ["tokushima","kagawa","ehime","kochi"] },
  { name: "九州・沖縄", ids: ["fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima","okinawa"] },
];

// ─── 海外：国データ ─────────────────────────────────────────────────────────────

export type CountryDef = { id: string; name: string; continent: string; flag: string };

export const CONTINENTS = [
  { id: "asia",          name: "アジア",          emoji: "🌏" },
  { id: "europe",        name: "ヨーロッパ",      emoji: "🌍" },
  { id: "north_america", name: "北米・オセアニア", emoji: "🌎" },
  { id: "south_america", name: "中南米",          emoji: "🌎" },
  { id: "middle_east",   name: "中東",            emoji: "🕌" },
  { id: "africa",        name: "アフリカ",        emoji: "🌍" },
];

export const COUNTRIES: CountryDef[] = [
  // アジア
  { id: "china",        name: "中国",         continent: "asia",          flag: "🇨🇳" },
  { id: "south_korea",  name: "韓国",         continent: "asia",          flag: "🇰🇷" },
  { id: "taiwan",       name: "台湾",         continent: "asia",          flag: "🇹🇼" },
  { id: "hong_kong",    name: "香港",         continent: "asia",          flag: "🇭🇰" },
  { id: "thailand",     name: "タイ",         continent: "asia",          flag: "🇹🇭" },
  { id: "vietnam",      name: "ベトナム",     continent: "asia",          flag: "🇻🇳" },
  { id: "indonesia",    name: "インドネシア", continent: "asia",          flag: "🇮🇩" },
  { id: "singapore",    name: "シンガポール", continent: "asia",          flag: "🇸🇬" },
  { id: "malaysia",     name: "マレーシア",   continent: "asia",          flag: "🇲🇾" },
  { id: "philippines",  name: "フィリピン",   continent: "asia",          flag: "🇵🇭" },
  { id: "india",        name: "インド",       continent: "asia",          flag: "🇮🇳" },
  { id: "nepal",        name: "ネパール",     continent: "asia",          flag: "🇳🇵" },
  { id: "cambodia",     name: "カンボジア",   continent: "asia",          flag: "🇰🇭" },
  { id: "myanmar",      name: "ミャンマー",   continent: "asia",          flag: "🇲🇲" },
  { id: "laos",         name: "ラオス",       continent: "asia",          flag: "🇱🇦" },
  { id: "sri_lanka",    name: "スリランカ",   continent: "asia",          flag: "🇱🇰" },
  { id: "maldives",     name: "モルディブ",   continent: "asia",          flag: "🇲🇻" },
  { id: "bhutan",       name: "ブータン",     continent: "asia",          flag: "🇧🇹" },
  { id: "mongolia",     name: "モンゴル",     continent: "asia",          flag: "🇲🇳" },
  { id: "macau",        name: "マカオ",       continent: "asia",          flag: "🇲🇴" },
  // ヨーロッパ
  { id: "france",       name: "フランス",     continent: "europe",        flag: "🇫🇷" },
  { id: "uk",           name: "イギリス",     continent: "europe",        flag: "🇬🇧" },
  { id: "germany",      name: "ドイツ",       continent: "europe",        flag: "🇩🇪" },
  { id: "italy",        name: "イタリア",     continent: "europe",        flag: "🇮🇹" },
  { id: "spain",        name: "スペイン",     continent: "europe",        flag: "🇪🇸" },
  { id: "portugal",     name: "ポルトガル",   continent: "europe",        flag: "🇵🇹" },
  { id: "netherlands",  name: "オランダ",     continent: "europe",        flag: "🇳🇱" },
  { id: "belgium",      name: "ベルギー",     continent: "europe",        flag: "🇧🇪" },
  { id: "switzerland",  name: "スイス",       continent: "europe",        flag: "🇨🇭" },
  { id: "austria",      name: "オーストリア", continent: "europe",        flag: "🇦🇹" },
  { id: "czech",        name: "チェコ",       continent: "europe",        flag: "🇨🇿" },
  { id: "hungary",      name: "ハンガリー",   continent: "europe",        flag: "🇭🇺" },
  { id: "poland",       name: "ポーランド",   continent: "europe",        flag: "🇵🇱" },
  { id: "greece",       name: "ギリシャ",     continent: "europe",        flag: "🇬🇷" },
  { id: "croatia",      name: "クロアチア",   continent: "europe",        flag: "🇭🇷" },
  { id: "sweden",       name: "スウェーデン", continent: "europe",        flag: "🇸🇪" },
  { id: "norway",       name: "ノルウェー",   continent: "europe",        flag: "🇳🇴" },
  { id: "finland",      name: "フィンランド", continent: "europe",        flag: "🇫🇮" },
  { id: "denmark",      name: "デンマーク",   continent: "europe",        flag: "🇩🇰" },
  { id: "iceland",      name: "アイスランド", continent: "europe",        flag: "🇮🇸" },
  { id: "russia",       name: "ロシア",       continent: "europe",        flag: "🇷🇺" },
  // 北米・オセアニア
  { id: "usa",          name: "アメリカ",       continent: "north_america", flag: "🇺🇸" },
  { id: "canada",       name: "カナダ",         continent: "north_america", flag: "🇨🇦" },
  { id: "mexico",       name: "メキシコ",       continent: "north_america", flag: "🇲🇽" },
  { id: "australia",    name: "オーストラリア", continent: "north_america", flag: "🇦🇺" },
  { id: "new_zealand",  name: "NZ",             continent: "north_america", flag: "🇳🇿" },
  { id: "fiji",         name: "フィジー",       continent: "north_america", flag: "🇫🇯" },
  // 中南米
  { id: "brazil",       name: "ブラジル",     continent: "south_america", flag: "🇧🇷" },
  { id: "argentina",    name: "アルゼンチン", continent: "south_america", flag: "🇦🇷" },
  { id: "peru",         name: "ペルー",       continent: "south_america", flag: "🇵🇪" },
  { id: "chile",        name: "チリ",         continent: "south_america", flag: "🇨🇱" },
  { id: "colombia",     name: "コロンビア",   continent: "south_america", flag: "🇨🇴" },
  { id: "cuba",         name: "キューバ",     continent: "south_america", flag: "🇨🇺" },
  { id: "costa_rica",   name: "コスタリカ",   continent: "south_america", flag: "🇨🇷" },
  // 中東
  { id: "uae",          name: "UAE",            continent: "middle_east",   flag: "🇦🇪" },
  { id: "turkey",       name: "トルコ",         continent: "middle_east",   flag: "🇹🇷" },
  { id: "israel",       name: "イスラエル",     continent: "middle_east",   flag: "🇮🇱" },
  { id: "jordan",       name: "ヨルダン",       continent: "middle_east",   flag: "🇯🇴" },
  { id: "qatar",        name: "カタール",       continent: "middle_east",   flag: "🇶🇦" },
  { id: "saudi",        name: "サウジアラビア", continent: "middle_east",   flag: "🇸🇦" },
  // アフリカ
  { id: "egypt",        name: "エジプト",   continent: "africa", flag: "🇪🇬" },
  { id: "morocco",      name: "モロッコ",   continent: "africa", flag: "🇲🇦" },
  { id: "south_africa", name: "南アフリカ", continent: "africa", flag: "🇿🇦" },
  { id: "kenya",        name: "ケニア",     continent: "africa", flag: "🇰🇪" },
  { id: "tanzania",     name: "タンザニア", continent: "africa", flag: "🇹🇿" },
  { id: "ethiopia",     name: "エチオピア", continent: "africa", flag: "🇪🇹" },
];

export const MAX_SCORE_WORLD = COUNTRIES.length * 5;

// 独自ID → ISO 2文字コード
export const COUNTRY_ISO: Record<string, string> = {
  china: "cn", south_korea: "kr", taiwan: "tw", hong_kong: "hk",
  thailand: "th", vietnam: "vn", indonesia: "id", singapore: "sg",
  malaysia: "my", philippines: "ph", india: "in", nepal: "np",
  cambodia: "kh", myanmar: "mm", laos: "la", sri_lanka: "lk",
  maldives: "mv", bhutan: "bt", mongolia: "mn", macau: "mo",
  france: "fr", uk: "gb", germany: "de", italy: "it", spain: "es",
  portugal: "pt", netherlands: "nl", belgium: "be", switzerland: "ch",
  austria: "at", czech: "cz", hungary: "hu", poland: "pl", greece: "gr",
  croatia: "hr", sweden: "se", norway: "no", finland: "fi", denmark: "dk",
  iceland: "is", russia: "ru",
  usa: "us", canada: "ca", mexico: "mx", australia: "au",
  new_zealand: "nz", fiji: "fj",
  brazil: "br", argentina: "ar", peru: "pe", chile: "cl",
  colombia: "co", cuba: "cu", costa_rica: "cr",
  uae: "ae", turkey: "tr", israel: "il", jordan: "jo",
  qatar: "qa", saudi: "sa",
  egypt: "eg", morocco: "ma", south_africa: "za",
  kenya: "ke", tanzania: "tz", ethiopia: "et",
};

// ISO 2文字コード → 独自ID（逆引き）
export const ISO_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_ISO).map(([k, v]) => [v, k])
);
