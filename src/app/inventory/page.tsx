import { Suspense } from 'react';
import { InventoryList, InventorySkeleton } from '@/components/inventory/inventory-container';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* ヘッダー部分 */}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package className="text-blue-600" />
        在庫一覧
      </h1>

      {/* リスト部分のみストリーミング表示 */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryList />
      </Suspense>
    </div>
  );
}
