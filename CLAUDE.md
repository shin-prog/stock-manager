# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

- **作業ブランチは `develop`**。`main` に直接コミットしない。
- まずdevelopブランチに切り替えてから作業を開始する。
- `develop` で作業 → `gh pr create --base main --head develop` で PR → マージ。
- コミットメッセージは**日本語**で書く（例: `feat: 〜を追加`、`fix: 〜を修正`、`perf: 〜を最適化`）。

## Spec Document

機能追加・UI変更を行ったら **`docs/spec.md`** も合わせて更新する。

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint
npm run test      # Run all tests (Vitest)
npx vitest run path/to/test.test.ts  # Run a single test file
```

## Architecture

**Stock Manager** is a Japanese home inventory management app built with Next.js App Router. The architecture follows the "Server Components + Server Actions" pattern with no centralized client-side state management.

### Tech Stack

- **Next.js 16** (App Router, Server Components)
- **Supabase** (PostgreSQL via `@supabase/supabase-js` + `@supabase/ssr`)
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI primitives in `src/components/ui/`)
- **React Hook Form** + **Zod** for form validation
- **@dnd-kit** for drag-and-drop sorting
- **Vitest** + **@testing-library/react** for testing

### Data Flow

1. **Server Components** fetch data directly from Supabase (no API routes needed).
2. **Server Actions** (`'use server'`) handle all mutations — they call Supabase and run `revalidatePath()` to invalidate cache and trigger re-renders.
3. **Client Components** (`'use client'`) hold only local UI state (`useState`, `useTransition`).

```
User action → Client component → Server action → Supabase update
  → revalidatePath() → Server component re-fetches → UI updates
```

### Key Files

| File | Purpose |
|---|---|
| `src/app/actions.ts` | Global server actions: `setStock`, `adjustStock`, `batchUpdateInventory`, `submitPurchase` |
| `src/app/*/actions.ts` | Per-page CRUD actions for products, stores, categories, tags |
| `src/utils/supabase/server.ts` | Server-side Supabase client (cookie-based session) |
| `src/utils/supabase/client.ts` | Browser-side Supabase client |
| `src/middleware.ts` | Simple auth: checks `?key=` query param, sets HTTP-only cookie |
| `src/components/inventory/stock-list.tsx` | Main inventory UI — complex client component with edit mode, filtering, batch updates |
| `src/hooks/use-sortable-list.ts` | Custom hook wrapping dnd-kit for drag-to-reorder lists |

### Authentication

A custom simple auth is used (not Supabase Auth):
- First access requires `?key=YOUR_SECRET_KEY` in the URL.
- Middleware sets an HTTP-only secure cookie and subsequent requests are allowed.
- Environment variables: `AUTH_SECRET_KEY` (private), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Supabase Performance Patterns

Server Actions で複数の独立した DB 操作がある場合は `Promise.all` で並列化する。

```ts
// Bad: 逐次
for (const item of items) {
  await supabase.from('table').update(...).eq('id', item.id);
}

// Good: 並列
await Promise.all(
  items.map(item => supabase.from('table').update(...).eq('id', item.id))
);
```

UPDATE 前に SELECT が不要な場合（新しい値がクライアントで分かる場合）は SELECT を省略して直接 UPDATE する。

### UI Conventions

- **FAB ボタン**: `bg-slate-900 text-white rounded-full shadow-2xl` で統一（`src/components/inventory/stock-list.tsx` 参照）。
- **編集モードでの要素の出し入れ**: `display:none`（条件レンダリング）ではなく `disabled` + 親の `opacity-60` を使う。`invisible`（`visibility:hidden`）は子要素に `transition-all` があると非表示が遅延するため避ける。

### Database Schema (main tables)

`products`, `stock`, `stock_adjustments`, `purchase_lines`, `purchases`, `stores`, `categories`, `tags`, `product_tags`

Stock status values are: sufficient / needed / unchecked (在庫あり / 要補充 / 未確認).
