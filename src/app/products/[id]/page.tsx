import { createClient } from '@/utils/supabase/server';
import { PriceHistoryList } from '@/components/analytics/price-history';

import { deleteProduct } from '@/app/products/actions';
import { Button } from '@/components/ui/button';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, category')
    .eq('id', id)
    .single();

  if (!product) return <div>商品が見つかりません</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="text-gray-500">{product.category}</div>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <Button variant="destructive" size="sm" type="submit">削除</Button>
        </form>
      </div>
      
      <PriceHistoryList productId={id} />
    </div>
  );
}
