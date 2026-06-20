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

// ─── 水族館・動物園データ ───────────────────────────────────────────────────────

export type SpotType = "aquarium" | "zoo";
export type SpotDef = { id: string; name: string; pref: string; type: SpotType };

export const SPOT_TYPE_LABEL: Record<SpotType, string> = {
  aquarium: "水族館",
  zoo: "動物園",
};

export const SPOTS: SpotDef[] = [
  // 水族館
  { id: "churaumi",      name: "沖縄美ら海水族館",       pref: "okinawa",   type: "aquarium" },
  { id: "hakkeijima",    name: "八景島シーパラダイス",   pref: "kanagawa",  type: "aquarium" },
  { id: "enoshima",      name: "新江ノ島水族館",         pref: "kanagawa",  type: "aquarium" },
  { id: "sumida",        name: "すみだ水族館",           pref: "tokyo",     type: "aquarium" },
  { id: "sunshine",      name: "サンシャイン水族館",     pref: "tokyo",     type: "aquarium" },
  { id: "kasai",         name: "葛西臨海水族園",         pref: "tokyo",     type: "aquarium" },
  { id: "kamogawa",      name: "鴨川シーワールド",       pref: "chiba",     type: "aquarium" },
  { id: "nagoyako",      name: "名古屋港水族館",         pref: "aichi",     type: "aquarium" },
  { id: "toba",          name: "鳥羽水族館",             pref: "mie",       type: "aquarium" },
  { id: "kaiyukan",      name: "海遊館",                 pref: "osaka",     type: "aquarium" },
  { id: "kyoto_aqua",    name: "京都水族館",             pref: "kyoto",     type: "aquarium" },
  { id: "suma",          name: "神戸須磨海浜水族園",     pref: "hyogo",     type: "aquarium" },
  { id: "aquas",         name: "しまね海洋館アクアス",   pref: "shimane",   type: "aquarium" },
  { id: "uminonakamichi",name: "マリンワールド海の中道", pref: "fukuoka",   type: "aquarium" },
  { id: "uminomori",     name: "仙台うみの杜水族館",     pref: "miyagi",    type: "aquarium" },
  { id: "aquamarine",    name: "アクアマリンふくしま",   pref: "fukushima", type: "aquarium" },
  { id: "kamo",          name: "鶴岡市立加茂水族館",     pref: "yamagata",  type: "aquarium" },
  { id: "kaikyokan",     name: "海響館",                 pref: "yamaguchi", type: "aquarium" },
  { id: "umigatari",     name: "上越市立水族博物館うみがたり", pref: "niigata", type: "aquarium" },
  { id: "katsurahama",   name: "桂浜水族館",             pref: "kochi",     type: "aquarium" },
  // 動物園
  { id: "ueno",          name: "上野動物園",             pref: "tokyo",     type: "zoo" },
  { id: "tama",          name: "多摩動物公園",           pref: "tokyo",     type: "zoo" },
  { id: "zoorasia",      name: "よこはま動物園ズーラシア", pref: "kanagawa", type: "zoo" },
  { id: "chiba_zoo",     name: "千葉市動物公園",         pref: "chiba",     type: "zoo" },
  { id: "tobu",          name: "東武動物公園",           pref: "saitama",   type: "zoo" },
  { id: "higashiyama",   name: "東山動植物園",           pref: "aichi",     type: "zoo" },
  { id: "kyoto_zoo",     name: "京都市動物園",           pref: "kyoto",     type: "zoo" },
  { id: "tennoji",       name: "天王寺動物園",           pref: "osaka",     type: "zoo" },
  { id: "oji",           name: "王子動物園",             pref: "hyogo",     type: "zoo" },
  { id: "fukuoka_zoo",   name: "福岡市動物園",           pref: "fukuoka",   type: "zoo" },
  { id: "itozu",         name: "到津の森公園",           pref: "fukuoka",   type: "zoo" },
  { id: "asa",           name: "安佐動物公園",           pref: "hiroshima", type: "zoo" },
  { id: "asahiyama",     name: "旭山動物園",             pref: "hokkaido",  type: "zoo" },
  { id: "maruyama",      name: "円山動物園",             pref: "hokkaido",  type: "zoo" },
  { id: "yagiyama",      name: "八木山動物公園",         pref: "miyagi",    type: "zoo" },
  { id: "nasu",          name: "那須どうぶつ王国",       pref: "tochigi",   type: "zoo" },
  { id: "fuji_safari",   name: "富士サファリパーク",     pref: "shizuoka",  type: "zoo" },
  { id: "nihondaira",    name: "日本平動物園",           pref: "shizuoka",  type: "zoo" },
  { id: "ishikawa_zoo",  name: "いしかわ動物園",         pref: "ishikawa",  type: "zoo" },
  { id: "gunma_safari",  name: "群馬サファリパーク",     pref: "gunma",     type: "zoo" },
];

export const MAX_SCORE_SPOTS = SPOTS.length;

// ─── 世界遺産（国内）データ ─────────────────────────────────────────────────────

export type HeritageDef = { id: string; name: string; pref: string; natural?: boolean };

export const HERITAGE_SITES: HeritageDef[] = [
  { id: "horyuji",       name: "法隆寺地域の仏教建造物",                 pref: "nara" },
  { id: "himeji",        name: "姫路城",                                 pref: "hyogo" },
  { id: "kyoto_heritage",name: "古都京都の文化財",                       pref: "kyoto" },
  { id: "shirakawago",   name: "白川郷・五箇山の合掌造り集落",           pref: "gifu" },
  { id: "genbaku_dome",  name: "原爆ドーム",                             pref: "hiroshima" },
  { id: "itsukushima",   name: "厳島神社",                               pref: "hiroshima" },
  { id: "nara_heritage", name: "古都奈良の文化財",                       pref: "nara" },
  { id: "nikko",         name: "日光の社寺",                             pref: "tochigi" },
  { id: "ryukyu_gusuku", name: "琉球王国のグスク及び関連遺産群",         pref: "okinawa" },
  { id: "kii_sanchi",    name: "紀伊山地の霊場と参詣道",                 pref: "wakayama" },
  { id: "iwami_ginzan",  name: "石見銀山遺跡とその文化的景観",           pref: "shimane" },
  { id: "hiraizumi",     name: "平泉の文化遺産",                         pref: "iwate" },
  { id: "fujisan",       name: "富士山-信仰の対象と芸術の源泉",          pref: "yamanashi" },
  { id: "tomioka",       name: "富岡製糸場と絹産業遺産群",               pref: "gunma" },
  { id: "meiji_industry",name: "明治日本の産業革命遺産",                 pref: "fukuoka" },
  { id: "corbusier",     name: "ル・コルビュジエの建築作品（国立西洋美術館）", pref: "tokyo" },
  { id: "okinoshima",    name: "「神宿る島」宗像・沖ノ島と関連遺産群",   pref: "fukuoka" },
  { id: "amakusa",       name: "長崎と天草地方の潜伏キリシタン関連遺産", pref: "nagasaki" },
  { id: "mozu_furuichi", name: "百舌鳥・古市古墳群",                     pref: "osaka" },
  { id: "jomon",         name: "北海道・北東北の縄文遺跡群",             pref: "aomori" },
  { id: "sado_kinzan",   name: "佐渡島の金山",                           pref: "niigata" },
  { id: "yakushima",     name: "屋久島",                                 pref: "kagoshima", natural: true },
  { id: "shirakami",     name: "白神山地",                               pref: "aomori",    natural: true },
  { id: "shiretoko",     name: "知床",                                   pref: "hokkaido",  natural: true },
  { id: "ogasawara",     name: "小笠原諸島",                             pref: "tokyo",      natural: true },
  { id: "amami_okinawa", name: "奄美大島、徳之島、沖縄島北部及び西表島", pref: "kagoshima", natural: true },
];

export const MAX_SCORE_HERITAGE = HERITAGE_SITES.length;

// ─── 実績（バッジ） ─────────────────────────────────────────────────────────────

export type BadgeData = {
  scores: Record<string, number>;
  worldScores: Record<string, number>;
  spotVisited: Record<string, boolean>;
  heritageVisited: Record<string, boolean>;
};

export type BadgeDef = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  check: (data: BadgeData) => boolean;
};

const prefVisitedCount = (scores: Record<string, number>) =>
  PREFECTURES.filter((p) => (scores[p.id] ?? 0) > 0).length;

const countryVisitedCount = (worldScores: Record<string, number>) =>
  COUNTRIES.filter((c) => (worldScores[c.id] ?? 0) > 0).length;

export const BADGES: BadgeDef[] = [
  // 都道府県
  { id: "pref_10", emoji: "🚶", label: "旅好き", description: "10都道府県を訪問", check: (d) => prefVisitedCount(d.scores) >= 10 },
  { id: "pref_25", emoji: "🧳", label: "旅人", description: "25都道府県を訪問", check: (d) => prefVisitedCount(d.scores) >= 25 },
  { id: "pref_47", emoji: "🏆", label: "47都道府県制覇", description: "すべての都道府県を訪問", check: (d) => prefVisitedCount(d.scores) >= 47 },
  // 地方制覇
  ...REGIONS.map((region) => ({
    id: `region_${region.name}`,
    emoji: "🗺️",
    label: `${region.name}制覇`,
    description: `${region.name}地方の都道府県をすべて訪問`,
    check: (d: BadgeData) => region.ids.every((id) => (d.scores[id] ?? 0) > 0),
  })),
  // 海外
  { id: "country_1", emoji: "🌏", label: "初めての海外", description: "1か国以上を訪問", check: (d) => countryVisitedCount(d.worldScores) >= 1 },
  { id: "country_10", emoji: "✈️", label: "世界を旅する人", description: "10か国を訪問", check: (d) => countryVisitedCount(d.worldScores) >= 10 },
  // 大陸制覇
  ...CONTINENTS.map((cont) => {
    const ids = COUNTRIES.filter((c) => c.continent === cont.id).map((c) => c.id);
    return {
      id: `continent_${cont.id}`,
      emoji: cont.emoji,
      label: `${cont.name}制覇`,
      description: `${cont.name}の国をすべて訪問`,
      check: (d: BadgeData) => ids.every((id) => (d.worldScores[id] ?? 0) > 0),
    };
  }),
  // 施設
  { id: "spot_aquarium_all", emoji: "🐠", label: "水族館マスター", description: "主要な水族館をすべて訪問", check: (d) => SPOTS.filter((s) => s.type === "aquarium").every((s) => d.spotVisited[s.id]) },
  { id: "spot_zoo_all", emoji: "🦁", label: "動物園マスター", description: "主要な動物園をすべて訪問", check: (d) => SPOTS.filter((s) => s.type === "zoo").every((s) => d.spotVisited[s.id]) },
  { id: "spot_all", emoji: "🏅", label: "施設コンプリート", description: "水族館・動物園をすべて訪問", check: (d) => SPOTS.every((s) => d.spotVisited[s.id]) },
  // 世界遺産
  { id: "heritage_5", emoji: "🏛️", label: "世界遺産めぐり", description: "5件の世界遺産を訪問", check: (d) => HERITAGE_SITES.filter((h) => d.heritageVisited[h.id]).length >= 5 },
  { id: "heritage_all", emoji: "🌟", label: "世界遺産コンプリート", description: "国内の世界遺産をすべて訪問", check: (d) => HERITAGE_SITES.every((h) => d.heritageVisited[h.id]) },
];
