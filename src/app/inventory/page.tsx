import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { InventoryList, InventorySkeleton } from '@/components/inventory/inventory-container';

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">在庫一覧</h1>
        <Link href="/products/new">
          <Button size="sm">+ 商品追加</Button>
        </Link>
      </div>

      {/* リスト部分のみストリーミング表示 */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryList />
      </Suspense>
    </div>
  );
}
