import { createClient } from '@/utils/supabase/server';
import { PriceHistoryList } from '@/components/analytics/price-history';
import { deleteProduct } from '@/app/products/actions';
import { Button } from '@/components/ui/button';
import { QuickPurchaseForm } from '@/components/forms/quick-purchase-form';
import { ProductMemoEditor } from '@/components/products/product-memo-editor';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, category_id, memo')
    .eq('id', id)
    .single();

  if (!product) return <div>商品が見つかりません</div>;

  const { data: stores } = await supabase.from('stores').select('*').order('sort_order');

  // この商品の直近の購入店を取得
  const { data: lastPurchaseForProduct } = await supabase
    .from('purchase_lines')
    .select('purchases(store_id)')
    .eq('product_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastStoreId = (lastPurchaseForProduct?.purchases as any)?.store_id;

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', product.category_id)
    .maybeSingle();

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="text-gray-500">{category?.name || '未分類'}</div>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <Button variant="destructive" size="sm" type="submit">削除</Button>
        </form>
      </div>

      <ProductMemoEditor id={id} initialMemo={product.memo || ''} />

      <QuickPurchaseForm productId={id} stores={stores || []} lastStoreId={lastStoreId} />
      
      <PriceHistoryList productId={id} />
    </div>
  );
}
