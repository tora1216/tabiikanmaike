# 旅のしおり

旅行の計画を簡単に管理できるWebアプリケーションです。旅行の追加・編集、日別プランの作成、アクティビティのドラッグ＆ドロップでの移動などが可能です。

## 機能

- **旅行の管理**: 旅行のタイトル、日程、概要を登録・編集・削除
- **日別プラン**: 各旅行の日ごとにアクティビティを追加
- **アクティビティの詳細**: 時間、アイコン、行き先、メモ、費用の設定
- **ドラッグ＆ドロップ**: アクティビティを日付間で移動可能
- **レスポンシブデザイン**: スマートフォンでも快適に使用可能

## 技術スタック

- **Framework**: Next.js 16
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **ドラッグ＆ドロップ**: @dnd-kit
- **アイコン**: Heroicons, Emoji
- **デプロイ**: Vercel (推奨)

## インストールと実行

### ローカル開発環境

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/your-username/tabiikanmaike.git
   cd tabiikanmaike
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

4. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### ビルド

```bash
npm run build
npm start
```

## デプロイ

### Vercel (推奨)

1. [Vercel](https://vercel.com) にアカウントを作成
2. GitHub リポジトリを接続
3. 自動デプロイが実行され、URL が割り当てられます (例: `https://tabiikanmaike.vercel.app`)

### GitHub Pages

1. リポジトリの **Settings > Pages** に移動
2. **Source** を **GitHub Actions** に設定
3. `next.config.ts` の `basePath` をリポジトリ名に合わせて変更 (例: `basePath: '/tabiikanmaike'`)
4. `main` ブランチに push すると自動デプロイ
5. URL: `https://your-username.github.io/tabiikanmaike`

### その他のプラットフォーム

- **Netlify**: GitHub 連携でデプロイ可能
- **GitHub Pages**: 静的サイトとしてデプロイ (Next.js の静的エクスポートが必要)

## 開発者向け

### プロジェクト構造

```
app/
├── page.tsx          # トップページ (旅行一覧)
├── trips/[id]/
│   └── page.tsx      # 旅行詳細ページ
├── globals.css       # グローバルスタイル
components/
├── trip-context.tsx  # 旅行データのコンテキスト
lib/
└── trips.ts          # 型定義と初期データ
```

### スクリプト

- `npm run dev`: 開発サーバー起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションビルドの実行
- `npm run lint`: ESLint 実行

## ライセンス

MIT License

## 貢献

バグ報告や機能リクエストは GitHub Issues からお願いします。
