ユーザへの問いかけや回答は常に日本語にすること
スマホでもPCでも使用するため、アイコンはホバーしなくても見えるように常時表示すること

ブランチはmainとdevelopの2つを使用すること

- main: 本番環境にデプロイされるブランチ
- develop: 開発用ブランチ。機能追加や修正はすべてこのブランチで行い、完了後にmainへマージするフローとする。
- **マージルール**: ブランチ間のマージ（特に `develop` から `main` へのリリース）は、直接コマンドで行わず、必ず GitHub 上で **Pull Request
st (PR)** を作成して行うこと。
- **環境分離**: ローカル開発時は `.env.local` の設定が開発環境（DEVプロジェクト）に向いていることを常に確認すること。

  GitHubリポジトリ: https://github.com/shin-prog/stock-manager

### 技術スタック

- **Framework**: Next.js 16.1.6 (App Router)
- **Styling**: Tailwind CSS v4, Shadcn/UI
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel (GitHub連携 https://github.com/shin-prog/stock-manager)
