import { Suspense } from 'react';
import { InventoryList, InventorySkeleton } from '@/components/inventory/inventory-container';

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      {/* ページタイトルは即座に表示される */}
      <h1 className="text-xl font-bold mb-3">在庫一覧</h1>
      
      {/* リスト部分のみストリーミング表示 */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryList />
      </Suspense>
    </div>
  );
}

