# プロジェクト環境・インフラ構成書

## 1. サービス URL
- **本番環境 (Production)**: [https://stock-manager-ten-jet.vercel.app/inventory](https://stock-manager-ten-jet.vercel.app/inventory)
- **開発/プレビュー環境 (Preview)**: develop ブランチ [開発環境](https://stock-manager-git-develop-shin-progs-projects.vercel.app)
- **GitHub リポジトリ**: [https://github.com/shin-prog/stock-manager](https://github.com/shin-prog/stock-manager)

## 2. 環境分離の方針 (PRD / DEV)
本番データと開発・テスト用データを完全に分離するため、以下の構成をとります。

### 2.1 環境別接続先
| 環境 | Vercel Environment | ブランチ | 接続先 Supabase |
| :--- | :--- | :--- | :--- |
| **Production** | Production | `main` | **PRD プロジェクト** |
| **Preview** | Preview | `develop` / PR | **DEV プロジェクト** |
| **Local** | Development | N/A | **DEV プロジェクト** |

### 2.2 設定方法 (Vercel)
Vercel の `Settings > Environment Variables` にて、`NEXT_PUBLIC_SUPABASE_URL` および `NEXT_PUBLIC_SUPABASE_ANON_KEY` をそれぞれ以下のパターンで登録してください。

1. **PRDプロジェクトの値**: `Production` 環境にのみチェックを入れて保存。
2. **DEVプロジェクトの値**: `Preview` および `Development` 環境にチェックを入れて保存。

## 3. インフラ・ミドルウェア構成

### 2.1 フロントエンド / ホスティング

- **プラットフォーム**: Vercel
- **フレームワーク**: Next.js 16.1.6 (App Router / Turbopack)
- **デプロイフロー**: `main` ブランチへのプッシュで自動デプロイ

### 2.2 バックエンド / データベース

- **プラットフォーム**: Supabase
- **データベース**: PostgreSQL
- **認証**: なし（個人用ツールの前提で、現時点では RLS を全開放設定）
- **接続方式**: サーバーコンポーネントからは `createClient` (utils/supabase/server.ts) を使用し、Cookie 経由でセッション情報を維持

## 3. 主要な環境変数 (Vercel / .env.local)

開発およびデプロイに以下の変数が必要です：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の Anon Key

## 4. 開発者向けTips

### 4.1 データベースの変更 (Migration)

- `supabase/migrations/` ディレクトリに SQL ファイルとして履歴を保存しています。
- 新しい環境を構築する場合、これらの SQL を古い順に Supabase の SQL Editor で実行することで、最新のテーブル構造が再現されます。

### 4.2 ローカル開発

1. 依存関係のインストール: `npm install`
2. 環境変数の設定: `.env.local` を作成
3. 起動: `npm run dev`

### 4.3 UI コンポーネント

- UI ライブラリとして **Shadcn/UI** を使用しています。
- スタイル調整は **Tailwind CSS v4** に準拠しています。
- アイコンは **Lucide-react** を標準としています。

## 5. 設計上の重要なルール

- **個体数管理**: 容量や重さではなく「個数」を最小単位とする。
- **CASCADE 削除**: 商品を削除すると、紐付く履歴や在庫、タグもすべて消えるよう SQL レベルで設定されている。
- **段階的表示 (Streaming)**: `Suspense` を活用し、ヘッダー等の即時表示を優先する構成にしている。
