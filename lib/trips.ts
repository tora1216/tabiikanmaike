export type TripActivity = {
  day: number;
  time: string;
  icon: string;
  type?: "place" | "transport";
  destination: string;
  from?: string; // transport: departure
  to?: string;   // transport: arrival
  memo?: string;
  cost?: number;
  costType?: "per_person" | "total";
};

export type PackingItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type TodoTask = {
  id: string;
  label: string;
  checked: boolean;
};

export type NoteEntry = {
  id: string;
  text: string;
  createdAt: string;
};

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  days: TripActivity[];
  packingList?: PackingItem[];
  todoList?: TodoTask[];
  notes?: string;
  noteEntries?: NoteEntry[];
  color?: string;
  tripIcon?: string;
  participants?: number;
};

export const initialTrips: Trip[] = [
  {
    id: "sapporo-spring",
    title: "札幌旅行",
    startDate: "2026-04-24",
    endDate: "2026-04-26",
    description: "春の北海道・札幌へ。海鮮・ラーメン・ジンギスカンを食べ尽くす2泊3日。",
    days: [
      {
        day: 1,
        time: "09:00 - 11:00",
        icon: "✈️",
        type: "transport",
        destination: "羽田 → 新千歳",
        from: "羽田空港",
        to: "新千歳空港",
        memo: "早めにチェックイン",
        cost: 18000,
      },
      {
        day: 1,
        time: "12:30 - 13:30",
        icon: "🍣",
        type: "place",
        destination: "二条市場 海鮮丼",
        memo: "新鮮なウニ・イクラ丼を堪能",
        cost: 2500,
      },
      {
        day: 1,
        time: "14:00 - 16:30",
        icon: "📷",
        type: "place",
        destination: "大通公園・さっぽろテレビ塔",
        memo: "チューリップが見ごろの時期",
        cost: 800,
      },
      {
        day: 1,
        time: "19:00 - 20:30",
        icon: "🍺",
        type: "place",
        destination: "ジンギスカン だるま 本店",
        memo: "行列必至。早めに並ぶ",
        cost: 3000,
      },
      {
        day: 2,
        time: "10:00 - 11:30",
        icon: "🌿",
        type: "place",
        destination: "円山公園",
        memo: "桜が残っていればラッキー",
        cost: 0,
      },
      {
        day: 2,
        time: "12:00 - 13:00",
        icon: "🍛",
        type: "place",
        destination: "スープカレー GARAKU",
        memo: "野菜たっぷりのスープカレー",
        cost: 1500,
      },
      {
        day: 2,
        time: "14:00 - 17:00",
        icon: "🛍️",
        type: "place",
        destination: "狸小路商店街",
        memo: "お土産・ショッピング",
        cost: 5000,
      },
      {
        day: 2,
        time: "19:00 - 20:30",
        icon: "🍣",
        type: "place",
        destination: "回転寿司 トリトン",
        memo: "北海道ネタが充実",
        cost: 3500,
      },
      {
        day: 3,
        time: "09:30 - 11:00",
        icon: "🏛️",
        type: "place",
        destination: "北海道庁旧本庁舎（赤れんが庁舎）",
        memo: "レンガ造りの歴史的建造物",
        cost: 0,
      },
      {
        day: 3,
        time: "11:30 - 12:30",
        icon: "🍜",
        type: "place",
        destination: "味噌ラーメン 麺屋雪風",
        memo: "濃厚な札幌味噌ラーメン",
        cost: 1200,
      },
      {
        day: 3,
        time: "14:30 - 16:30",
        icon: "✈️",
        type: "transport",
        destination: "新千歳 → 羽田",
        from: "新千歳空港",
        to: "羽田空港",
        cost: 18000,
      },
    ],
  },
  {
    id: "fukuoka-summer",
    title: "福岡旅行",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    description: "博多ラーメン・もつ鍋・中洲の屋台を楽しむ2泊3日の福岡グルメ旅。",
    days: [
      {
        day: 1,
        time: "10:00 - 11:30",
        icon: "✈️",
        type: "transport",
        destination: "羽田 → 福岡",
        from: "羽田空港",
        to: "福岡空港",
        cost: 15000,
      },
      {
        day: 1,
        time: "12:30 - 13:30",
        icon: "🍜",
        type: "place",
        destination: "博多ラーメン 一蘭 博多店",
        memo: "とんこつの本場で食べる一杯",
        cost: 1000,
      },
      {
        day: 1,
        time: "14:00 - 16:30",
        icon: "📷",
        type: "place",
        destination: "太宰府天満宮",
        memo: "梅ヶ枝餅も忘れずに",
        cost: 500,
      },
      {
        day: 1,
        time: "19:00 - 21:00",
        icon: "🍺",
        type: "place",
        destination: "中洲屋台街",
        memo: "屋台でラーメンや焼き鳥をハシゴ",
        cost: 3000,
      },
      {
        day: 2,
        time: "10:00 - 12:00",
        icon: "🌿",
        type: "place",
        destination: "大濠公園",
        memo: "広大な池を眺めながら散歩",
        cost: 0,
      },
      {
        day: 2,
        time: "12:30 - 13:30",
        icon: "🍲",
        type: "place",
        destination: "水炊き 博多 華味鳥",
        memo: "あっさり上品な博多水炊き",
        cost: 4000,
      },
      {
        day: 2,
        time: "14:30 - 17:00",
        icon: "🛍️",
        type: "place",
        destination: "キャナルシティ博多",
        memo: "ショッピング＆運河沿いの散策",
        cost: 3000,
      },
      {
        day: 2,
        time: "19:00 - 21:00",
        icon: "🍺",
        type: "place",
        destination: "もつ鍋 楽天地 博多本店",
        memo: "コラーゲンたっぷり。〆はちゃんぽん",
        cost: 3500,
      },
      {
        day: 3,
        time: "09:30 - 11:00",
        icon: "🛍️",
        type: "place",
        destination: "天神エリア・お土産購入",
        memo: "明太子・博多通りもんを買う",
        cost: 4000,
      },
      {
        day: 3,
        time: "11:30 - 12:30",
        icon: "🍜",
        type: "place",
        destination: "牧のうどん 博多バスターミナル店",
        memo: "柔らかくてだしが染みた福岡うどん",
        cost: 700,
      },
      {
        day: 3,
        time: "14:00 - 15:30",
        icon: "✈️",
        type: "transport",
        destination: "福岡 → 羽田",
        from: "福岡空港",
        to: "羽田空港",
        cost: 15000,
      },
    ],
  },
  {
    id: "korea-summer",
    title: "韓国旅行",
    startDate: "2026-07-18",
    endDate: "2026-07-20",
    description: "ソウルで食べて買って歩く2泊3日。参鶏湯・焼肉・チキンを制覇。",
    days: [
      {
        day: 1,
        time: "10:00 - 12:30",
        icon: "✈️",
        type: "transport",
        destination: "羽田 → 仁川",
        from: "羽田空港",
        to: "仁川国際空港",
        memo: "入国審査に時間がかかることも",
        cost: 25000,
      },
      {
        day: 1,
        time: "13:30 - 14:30",
        icon: "🍲",
        type: "place",
        destination: "土俗村 参鶏湯",
        memo: "景福宮近くの名店。行列必至",
        cost: 2000,
      },
      {
        day: 1,
        time: "15:00 - 17:30",
        icon: "📷",
        type: "place",
        destination: "景福宮・仁寺洞",
        memo: "韓服レンタルで写真映え",
        cost: 1500,
      },
      {
        day: 1,
        time: "19:00 - 21:00",
        icon: "🥩",
        type: "place",
        destination: "マポ区 韓国焼肉",
        memo: "サムギョプサルを炭火で",
        cost: 3000,
      },
      {
        day: 2,
        time: "10:00 - 12:00",
        icon: "🛍️",
        type: "place",
        destination: "弘大（ホンデ）エリア",
        memo: "若者の街。古着・コスメ・カフェ",
        cost: 8000,
      },
      {
        day: 2,
        time: "12:30 - 13:30",
        icon: "🌮",
        type: "place",
        destination: "明洞屋台グルメ",
        memo: "トッポッキ・ホットク・ハットグ",
        cost: 1500,
      },
      {
        day: 2,
        time: "15:00 - 17:00",
        icon: "📷",
        type: "place",
        destination: "Nソウルタワー（南山タワー）",
        memo: "ソウル市街を一望。夕暮れ時がおすすめ",
        cost: 2000,
      },
      {
        day: 2,
        time: "19:00 - 21:00",
        icon: "🍗",
        type: "place",
        destination: "弘大 ヤンニョムチキン店",
        memo: "チキン＆マッコリで乾杯",
        cost: 2500,
      },
      {
        day: 3,
        time: "10:00 - 12:00",
        icon: "🛍️",
        type: "place",
        destination: "明洞ショッピング",
        memo: "コスメ・ファッション・お土産まとめ買い",
        cost: 10000,
      },
      {
        day: 3,
        time: "12:30 - 13:30",
        icon: "🍜",
        type: "place",
        destination: "乙密台（ウルミルデ）平壌冷麺",
        memo: "あっさりしたスープの本格冷麺",
        cost: 1800,
      },
      {
        day: 3,
        time: "15:30 - 18:00",
        icon: "✈️",
        type: "transport",
        destination: "仁川 → 羽田",
        from: "仁川国際空港",
        to: "羽田空港",
        cost: 25000,
      },
    ],
  },
];
