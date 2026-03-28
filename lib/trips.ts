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
  activityMembers?: string[]; // subset of trip members this cost applies to
  paidBy?: string;            // who paid for this activity
  settled?: boolean;          // true = this expense is already settled, exclude from settlement calc
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
  members?: string[];   // named member list
  participants?: number; // legacy fallback
  shareId?: string;
  shareOwner?: boolean; // true = 自分が共有を作成したオーナー, false = 友人がインポートした旅
  sharePassword?: string; // optional passphrase for shared trip access
  updatedAt?: string;
};

export const initialTrips: Trip[] = [
  {
    id: "toyama-spring",
    title: "富山旅行(サンプル)",
    color: "#10B981",
    tripIcon: "🚃",
    startDate: "2026-04-04",
    endDate: "2026-04-05",
    members: ["ダッキー", "バニー", "ロッツォ"],
    description: "北陸新幹線で行く1泊2日の富山旅。富山の絶景を巡り、地元グルメも満喫。",
    days: [
      {
        day: 1,
        time: "08:24 - 10:29",
        icon: "🚃",
        type: "transport",
        destination: "東京 → 富山",
        from: "東京駅",
        to: "富山駅",
        memo: "北陸新幹線 かがやき503号",
        cost: 14120,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 1,
        time: "11:00 - 12:30",
        icon: "📷",
        type: "place",
        destination: "富山市ガラス美術館",
        memo: "TOYAMAキラリ内。世界的なガラス作家の作品を展示。常設展は200円",
        cost: 200,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 1,
        time: "13:00 - 14:00",
        icon: "🍽️",
        type: "place",
        destination: "糸庄 もつ煮込みうどん",
        memo: "富山名物もつ煮込みうどんの老舗。濃厚な出汁ともつが絶品。並ぶ覚悟で",
        cost: 1000,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 1,
        time: "16:00 - 18:00",
        icon: "📷",
        type: "place",
        destination: "富岩運河環水公園",
        memo: "運河沿いの美しい公園。世界一美しいスタバがある。散策にちょうどいい",
        cost: 0,
      },
      {
        day: 1,
        time: "19:00 - 20:00",
        icon: "🍽️",
        type: "place",
        destination: "すし玉",
        memo: "富山湾の新鮮なネタが揃う回転寿司。白エビ・ブリ・ホタルイカがおすすめ",
        cost: 2000,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 1,
        time: "21:00",
        icon: "🛏️",
        type: "place",
        destination: "ホテル",
        memo: "富山駅周辺のホテルへ",
      },
      {
        day: 2,
        time: "09:00",
        icon: "🛏️",
        type: "place",
        destination: "ホテル",
        memo: "荷物はフロントに預けておくと楽",
      },
      {
        day: 2,
        time: "09:20 - 09:45",
        icon: "🚃",
        type: "transport",
        destination: "富山 → 高岡",
        from: "富山駅",
        to: "高岡駅",
        memo: "あいの風とやま鉄道",
        cost: 420,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 2,
        time: "10:00 - 11:00",
        icon: "📷",
        type: "place",
        destination: "瑞龍寺",
        memo: "国宝の禅寺。高岡藩主・前田利長の菩提寺。静かで荘厳な雰囲気",
        cost: 500,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 2,
        time: "11:15 - 11:45",
        icon: "📷",
        type: "place",
        destination: "高岡大仏",
        memo: "日本三大仏のひとつ。青銅製で高さ約16m。瑞龍寺から徒歩10分",
        cost: 0,
      },
      {
        day: 2,
        time: "12:00 - 13:00",
        icon: "🍽️",
        type: "place",
        destination: "氷見うどん 刀利庵",
        memo: "高岡名物の氷見うどん。コシのある細麺とあっさりだしが絶品。高岡駅すぐ",
        cost: 900,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 2,
        time: "13:10 - 13:35",
        icon: "🚃",
        type: "transport",
        destination: "高岡 → 雨晴",
        from: "高岡駅",
        to: "雨晴駅",
        memo: "JR氷見線",
        cost: 310,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 2,
        time: "13:45 - 15:00",
        icon: "📷",
        type: "place",
        destination: "雨晴海岸",
        memo: "晴れていれば富山湾越しに立山連峰が見える絶景スポット。女岩も必見",
        cost: 0,
      },
      {
        day: 2,
        time: "15:10 - 15:50",
        icon: "🚃",
        type: "transport",
        destination: "雨晴 → 高岡 → 新高岡",
        from: "雨晴駅",
        to: "新高岡駅",
        memo: "JR氷見線で高岡駅へ、JR城端線に乗り換えて新高岡駅（1駅）",
        cost: 500,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
      {
        day: 2,
        time: "15:45 - 16:30",
        icon: "🛍️",
        type: "place",
        destination: "新高岡駅 お土産タイム",
        memo: "白えびせんべい・ますのすし・高岡銅器小物など",
        costType: "per_person",
      },
      {
        day: 2,
        time: "17:09 - 19:56",
        icon: "🚃",
        type: "transport",
        destination: "新高岡 → 東京",
        from: "新高岡駅",
        to: "東京駅",
        memo: "北陸新幹線 はくたか572号",
        cost: 13850,
        costType: "per_person",
        activityMembers: ["ダッキー", "バニー", "ロッツォ"],
        paidBy: "ダッキー",
      },
    ],
  },
];
