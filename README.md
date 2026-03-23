# 旅のしおり 🐯

旅行の計画・管理ができる PWA 対応の Web アプリです。

## 機能

### 旅の管理
- 旅の作成・編集・削除（タイトル・日程・概要・アイコン・カラー・参加人数）
- 旅の一覧を開始日順に表示
- データのエクスポート / インポート（JSON バックアップ）

### 日程・アクティビティ
- 日別スケジュール管理（観光・グルメ・移動などのカテゴリ）
- ドラッグ＆ドロップでアクティビティを並び替え（編集モード切替式）
- 時間・メモ・Google マップ連携・費用（1人分 / 全員分）の設定
- 日別・合計・1人あたりの費用集計

### 準備タブ
- やることリスト（飛行機予約・レストラン予約などのタスク管理）
- 持ち物リスト（テンプレートから追加：国内・海外・ビーチ・スキー・出張・キャンプ）

### 共有機能
- 旅程を短いリンクで共有（閲覧専用）
- リンクを知っている人のみアクセス可能（Firebase Firestore で管理）
- 共有ページから自分のリストへのインポートも可能
- 共有旅程を編集すると閲覧中の相手の画面にリアルタイム反映
- 旅程を削除すると共有リンクも自動で無効化

### アカウント（任意）
- Googleログインはオプション。ログインなしで全機能が利用可能
- ログインすると旅程・経験値データを複数端末で同期（データは自動マージ、新しい方を優先）
- マイページからログイン／ログアウト

### マイページ（経験値）
- 日本47都道府県の経験値マップ（SVG地図表示）
- 海外64カ国の経験値マップ（大陸別・国旗絵文字）
- レベル0〜5で経験値を管理

### その他
- ダークモード対応
- PWA 対応（ホーム画面に追加可能）
- アプリ内バージョン管理・更新履歴

## 技術スタック

- **Framework**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **ドラッグ＆ドロップ**: @dnd-kit
- **アイコン**: Heroicons
- **データ保存**: localStorage（ローカル）+ Firebase Firestore（共有・端末間同期）
- **デプロイ**: Vercel

## セットアップ

### 必要な環境変数

`.env.local` を作成して Firebase の設定値を入力：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### ローカル開発

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### ビルド

```bash
npm run build
npm start
```

## デプロイ（Vercel）

1. [Vercel](https://vercel.com) で GitHub リポジトリを接続
2. Environment Variables に上記の Firebase 設定値を追加
3. push するたびに自動デプロイ

## プロジェクト構造

```
app/
├── page.tsx              # トップページ（旅一覧）
├── trips/[id]/           # 旅の詳細ページ
├── view/[id]/            # 共有旅程の閲覧ページ
├── trips/import/         # 旅のインポートページ
├── profile/              # マイページ（経験値）
├── manifest.ts           # PWA マニフェスト
└── globals.css           # グローバルスタイル
components/
├── trip-context.tsx      # 旅データのコンテキスト（localStorage）
└── auth-context.tsx      # 認証コンテキスト（Firebase Auth）
lib/
├── trips.ts              # 型定義・初期データ
├── firebase.ts           # Firebase 初期化
├── keiken.ts             # 経験値の定数
├── packing-templates.ts  # 持ち物テンプレート
└── changelog.ts          # バージョン管理・更新履歴
```

## スクリプト

```bash
npm run dev    # 開発サーバー起動
npm run build  # プロダクションビルド
npm run lint   # ESLint 実行
```

## ライセンス

MIT License
