import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="font-bold text-xl mb-6 px-4">在庫管理</div>
      
      <div className="text-sm font-semibold text-slate-500 mt-4 px-4">在庫</div>
      <Link href="/inventory">
        <Button className="w-full justify-start" variant="ghost">ダッシュボード</Button>
      </Link>

      <div className="text-sm font-semibold text-slate-500 mt-4 px-4">マスタ管理</div>
      <Link href="/products">
        <Button className="w-full justify-start" variant="ghost">商品一覧</Button>
      </Link>
      <Link href="/stores">
        <Button className="w-full justify-start" variant="ghost">お店一覧</Button>
      </Link>
      <Link href="/categories">
        <Button className="w-full justify-start" variant="ghost">カテゴリ一覧</Button>
      </Link>
      <Link href="/tags">
        <Button className="w-full justify-start" variant="ghost">タグ一覧</Button>
      </Link>
      {/* Units hidden per request */}
    </div>
  )
}

