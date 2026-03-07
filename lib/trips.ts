export type TripActivity = {
  day: number;
  time: string;
  icon: string;
  destination: string;
  memo?: string;
  cost?: number;
};

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  days: TripActivity[];
};

export const initialTrips: Trip[] = [
  {
    id: "tokyo-weekend",
    title: "東京週末トリップ",
    startDate: "2026-04-12",
    endDate: "2026-04-14",
    description: "友達と行く、2泊3日の東京観光プラン。",
    days: [
      {
        day: 1,
        time: "09:00 - 12:00",
        icon: "📷",
        destination: "浅草寺",
        memo: "朝早めに出発して混雑を避ける",
        cost: 1000,
      },
      {
        day: 1,
        time: "12:00 - 13:00",
        icon: "🍚",
        destination: "仲見世通り",
        memo: "人形焼きを食べる",
        cost: 500,
      },
      {
        day: 1,
        time: "13:00 - 16:00",
        icon: "📷",
        destination: "東京スカイツリー",
        memo: "展望台から景色を楽しむ",
        cost: 2000,
      },
      {
        day: 2,
        time: "10:00 - 12:00",
        icon: "🛍️",
        destination: "渋谷スクランブル交差点",
        memo: "写真撮影スポット",
        cost: 0,
      },
      {
        day: 2,
        time: "12:00 - 14:00",
        icon: "📷",
        destination: "SHIBUYA SKY",
        memo: "展望台からの眺望",
        cost: 2000,
      },
      {
        day: 2,
        time: "14:00 - 16:00",
        icon: "🛍️",
        destination: "竹下通り",
        memo: "クレープを買う",
        cost: 800,
      },
      {
        day: 3,
        time: "10:00 - 12:00",
        icon: "🍚",
        destination: "蔵前カフェめぐり",
        memo: "カフェ巡り",
        cost: 1500,
      },
      {
        day: 3,
        time: "12:00 - 14:00",
        icon: "🛍️",
        destination: "駅ナカでお土産購入",
        memo: "お土産を買う",
        cost: 3000,
      },
    ],
  },
  {
    id: "kyoto-solo",
    title: "ひとり京都さんぽ",
    startDate: "2026-05-02",
    endDate: "2026-05-05",
    description: "一人でのんびり神社仏閣とカフェを巡る旅。",
    days: [
      {
        day: 1,
        time: "09:00 - 12:00",
        icon: "📷",
        destination: "清水寺",
      },
      {
        day: 1,
        time: "12:00 - 14:00",
        icon: "📷",
        destination: "二年坂・三年坂",
      },
      {
        day: 1,
        time: "14:00 - 16:00",
        icon: "📷",
        destination: "祇園白川",
      },
      {
        day: 2,
        time: "10:00 - 12:00",
        icon: "観光スポット",
        destination: "嵐山竹林の小径",
      },
      {
        day: 2,
        time: "12:00 - 14:00",
        icon: "観光スポット",
        destination: "渡月橋",
      },
      {
        day: 3,
        time: "10:00 - 12:00",
        icon: "ご飯",
        destination: "レトロ喫茶",
      },
      {
        day: 3,
        time: "12:00 - 14:00",
        icon: "ご飯",
        destination: "抹茶スイーツの有名店",
      },
    ],
  },
];

