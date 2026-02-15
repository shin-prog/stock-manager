import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ProductListContainer, ProductListSkeleton } from '@/components/products/product-list-container';

export default function ProductsPage() {
  return (
    <div className="space-y-6 container mx-auto p-4 max-w-lg pb-24">
      {/* ヘッダー部分は即座に表示される */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">商品一覧</h1>
        <Link href="/products/new">
          <Button size="sm">+ 商品追加</Button>
        </Link>
      </div>

      {/* リスト部分のみストリーミング表示 */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductListContainer />
      </Suspense>
    </div>
  );
}
