import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { InventoryList, InventorySkeleton } from '@/components/inventory/inventory-container';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" />
          在庫一覧
        </h1>
        <Link href="/products/new">
          <Button size="sm" className="font-bold">+ 商品追加</Button>
        </Link>
      </div>

      {/* リスト部分のみストリーミング表示 */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryList />
      </Suspense>
    </div>
  );
}
