import { createClient } from '@/utils/supabase/server';
import { PriceHistoryList } from '@/components/analytics/price-history';
import { QuickPurchaseForm } from '@/components/forms/quick-purchase-form';
import { ProductMemoEditor } from '@/components/products/product-memo-editor';
import { ProductNameEditor } from '@/components/products/product-name-editor';
import { ProductUrlEditor } from '@/components/products/product-url-editor';
import { ProductTagsEditor } from '@/components/tags/product-tags-editor';
import { ProductArchiveToggle } from '@/components/products/product-archive-toggle';
import { CategorySelect } from '@/components/products/category-select';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { ProductStockEditor } from '@/components/products/product-stock-editor';
import { EditLockProvider } from '@/hooks/use-edit-lock';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [productRes, storesRes, allTagsRes, categoriesRes, stockRes, lastStoreRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, category_id, memo, is_archived, product_url, product_tags(tags(*))')
      .eq('id', id)
      .single(),
    supabase.from('stores').select('*').order('sort_order'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('stock').select('quantity').eq('product_id', id).maybeSingle(),
    supabase
      .from('purchase_lines')
      .select('purchases(store_id)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const { data: product } = productRes;
  const { data: stores } = storesRes;
  const { data: allTags } = allTagsRes;
  const { data: categories } = categoriesRes;
  const { data: stock } = stockRes;
  const { data: lastStoreData } = lastStoreRes;

  if (!product) return <div>商品が見つかりません</div>;

  const currentQuantity = stock?.quantity || 0;
  const productTags = (product as any).product_tags?.map((item: any) => item.tags) || [];
  const lastStoreId = (lastStoreData?.purchases as any)?.store_id;

  return (
    <EditLockProvider>
      <div className="container mx-auto p-4 max-w-lg pb-24">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <ProductNameEditor id={id} initialName={product.name} />
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <CategorySelect
                id={id}
                initialCategoryId={product.category_id}
                categories={categories || []}
              />
              <ProductStockEditor productId={id} initialQuantity={currentQuantity} />
              <ProductArchiveToggle productId={id} initialIsArchived={!!product.is_archived} />
            </div>
          </div>
          <DeleteProductDialog id={product.id} productName={product.name} />
        </div>

        <div className="mb-6">
          <ProductTagsEditor
            productId={id}
            currentTags={productTags as any[]}
            allTags={allTags || []}
          />
        </div>

        <div className="space-y-4">
          <ProductUrlEditor id={id} initialUrl={product.product_url} />
          <ProductMemoEditor id={id} initialMemo={product.memo || ''} />
        </div>

        <div className="mt-8">
          <QuickPurchaseForm productId={id} stores={stores || []} lastStoreId={lastStoreId} />
        </div>

        <Suspense fallback={
          <div className="mt-8 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        }>
          <PriceHistoryList productId={id} />
        </Suspense>
      </div>
    </EditLockProvider>
  );
}
