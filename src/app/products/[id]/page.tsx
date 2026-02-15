import { createClient } from '@/utils/supabase/server';
import { PriceHistoryList } from '@/components/analytics/price-history';
import { deleteProduct } from '@/app/products/actions';
import { Button } from '@/components/ui/button';
import { QuickPurchaseForm } from '@/components/forms/quick-purchase-form';
import { ProductMemoEditor } from '@/components/products/product-memo-editor';
import { ProductNameEditor } from '@/components/products/product-name-editor';
import { ProductUrlEditor } from '@/components/products/product-url-editor';
import { ProductTagsEditor } from '@/components/tags/product-tags-editor';
import { ProductArchiveToggle } from '@/components/products/product-archive-toggle';
import { Trash2 } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [productRes, storesRes, allTagsRes, productTagsRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, category_id, memo, is_archived, product_url')
      .eq('id', id)
      .single(),
    supabase.from('stores').select('*').order('sort_order'),
    supabase.from('tags').select('*').order('name'),
    supabase
      .from('product_tags')
      .select('tags(*)')
      .eq('product_id', id)
  ]);

  const { data: product } = productRes;
  const { data: stores } = storesRes;
  const { data: allTags } = allTagsRes;
  const { data: productTagsData } = productTagsRes;

  if (!product) return <div>商品が見つかりません</div>;

  const productTags = productTagsData?.map(item => item.tags) || [];

  // この商品の直近の購入店とカテゴリ情報を並列取得
  const [lastPurchaseRes, categoryRes] = await Promise.all([
    supabase
      .from('purchase_lines')
      .select('purchases(store_id)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('name')
      .eq('id', product.category_id)
      .maybeSingle()
  ]);

  const lastPurchaseForProduct = lastPurchaseRes.data;
  const category = categoryRes.data;

  const lastStoreId = (lastPurchaseForProduct?.purchases as any)?.store_id;

  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      <div className="flex justify-between items-start mb-4">
        <div>
          <ProductNameEditor id={id} initialName={product.name} />
          <div className="text-sm text-gray-500">{category?.name || '未分類'}</div>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <Button variant="ghost" className="text-red-600 h-8 w-8 p-0" type="submit">
            <Trash2 size={16} />
          </Button>
        </form>
      </div>

      <div className="mb-6">
        <ProductTagsEditor 
          productId={id} 
          currentTags={productTags as any[]} 
          allTags={allTags || []} 
        />
      </div>

      <ProductUrlEditor id={id} initialUrl={product.product_url} />

      <ProductMemoEditor id={id} initialMemo={product.memo || ''} />

      <ProductArchiveToggle productId={id} initialIsArchived={!!product.is_archived} />

      <QuickPurchaseForm productId={id} stores={stores || []} lastStoreId={lastStoreId} />
      
      <PriceHistoryList productId={id} />
    </div>
  );
}
