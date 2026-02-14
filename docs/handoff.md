# 開発者向け引き継ぎドキュメント

## 1. プロジェクトの現状と重要コンテキスト

このプロジェクトは「Home Stock Manager」というNext.jsベースの在庫管理PWAです。
「家にあれあったっけ？」を解消するため、極力シンプルな操作性を目指しています。

### 技術スタック
- **Framework**: Next.js 16.1.6 (App Router)
- **Styling**: Tailwind CSS v4, Shadcn/UI
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel (GitHub連携)

### 特殊な実装ルール（重要）
開発を進める上で、過去のトラブルシューティングから得られた以下のルールを厳守してください。

1.  **CSS設定**:
    - **Tailwind v4** を使用しています。`tailwind.config.ts` は不要です。
    - CSSの設定は `src/app/globals.css` 内の `@import "tailwindcss";` と `@theme` ブロックで行ってください。古い `config` ファイルを作るとデザインが崩れます。

2.  **並び替え機能の実装**:
    - **楽観的UIの使用禁止（並び替えのみ）**: お店一覧やカテゴリ一覧の並び替えにおいて、`useOptimistic` による即時反映は**行わないでください**。過去に「わけのわからない順番変更」バグの原因となりました。
    - **並び替えモード**: 現在は「並び替えモード」に切り替え → ローカルstateで順序変更 → 「保存」ボタンで一括更新、というフローを採用しています。これが最も安定しています。
    - **一括更新**: サーバーアクション `updateAllStoreOrders` 等では `upsert` を使用して一括更新しています。

3.  **連打防止とUX**:
    - 登録ボタン等は `useFormStatus` や `useTransition` を用いて、処理中の二重送信を防止しています。
    - 登録完了後の `redirect` による画面遷移を、`try-catch` ブロックがエラーとして誤検知しないよう注意が必要です（現状のコードは対応済み）。

## 2. データベース構造と注意点

### マイグレーション
`supabase/migrations` ディレクトリにSQLファイルがあります。
特に `sort_order`（並び順）や `category_id`（外部キー）の追加など、後から変更したスキーマが多いため、新規環境構築時は最新のSQLを適用してください。

### データの整合性
- **削除時の制約**:
    - `products` 削除時: 関連する `purchase_lines`, `stock` 等は **CASCADE削除** されます。
    - `stores` 削除時: 関連する `purchases.store_id` は **Set NULL** されます（履歴は残る）。
    - `categories` 削除時: 関連する `products.category_id` は **Set NULL** されます（商品は残る）。

## 3. 次のステップ・残課題

- **認証**: 現在は完全なシングルユーザー（パーソナルユース）想定で、RLSは `true`（全許可）になっています。マルチユーザー化する場合はAuthの実装が必要です。
- **モバイル最適化**: 画面下部のメニューが隠れないよう `100dvh` や `safe-area-pb` を設定済みですが、OSアップデート等で挙動が変わる可能性があるため注視してください。

## 4. コマンドリファレンス

- 開発サーバー起動: `npm run dev`
- ビルド確認: `npm run build`
- デプロイ: GitHubへのpushでVercelに自動デプロイ

---
このドキュメントは `docs/handoff.md` として保存してください。
