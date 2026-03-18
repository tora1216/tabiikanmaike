export const APP_VERSION = "1.3.0";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-03-18",
    title: "マイページ強化",
    changes: [
      "旅程の並び替えを編集モード切替式に変更（スクロールと干渉しなくなった）",
      "海外経験値マップを追加（大陸別・国旗絵文字）",
      "日本／海外タブ切り替えに対応",
      "設定からアプデ情報を確認できるように",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-03-17",
    title: "UI全体リニューアル",
    changes: [
      "ダークモード対応",
      "旅のカラーテーマ選択を追加",
      "Google マップ連携（マップピンアイコン）",
      "日程セクションの折りたたみ機能",
      "ホーム画面追加ガイドを設定に追加",
      "アプリアイコンを刷新（🐯）",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-10",
    title: "詳細機能追加",
    changes: [
      "ドラッグ＆ドロップでスケジュール並び替え",
      "持ち物リスト機能",
      "費用管理・日別合計",
      "メモ機能追加",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-01",
    title: "初回リリース 🎉",
    changes: [
      "旅の作成・編集・削除",
      "日別スケジュール管理",
      "交通・観光スポット登録",
      "経県値マップ（日本47都道府県）",
    ],
  },
];
