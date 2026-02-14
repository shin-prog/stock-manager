import { createClient } from '@/utils/supabase/server';
import { normalizePrice } from '@/lib/logic';
import { ProductUnit } from '@/types';
import { DeletePurchaseButton } from './delete-purchase-button';

export async function PriceHistoryList({ productId }: { productId: string }) {
  const supabase = await createClient();
  
  // Fetch purchase lines for this product
  const { data: lines } = await supabase
    .from('purchase_lines')
    .select(`
      id,
      unit_price,
      quantity,
      unit_id,
      size_info,
      purchases (
        purchased_at,
        stores (name)
      )
    `)
    .eq('product_id', productId)
    .order('purchases(purchased_at)', { ascending: false });

  if (!lines || lines.length === 0) {
    return <div className="text-gray-500">購入履歴がありません。</div>;
  }

  // Normalize prices
  const history = lines.map((line: any) => {
    return {
      id: line.id,
      date: new Date(line.purchases?.purchased_at).toLocaleDateString('ja-JP'),
      store: line.purchases?.stores?.name || '不明なお店',
      price: line.unit_price,
      sizeInfo: line.size_info,
      quantity: line.quantity
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">価格履歴</h3>
      <div className="border rounded-md divide-y">
        {history.map((item, i) => (
          <div key={i} className="p-3 flex justify-between items-center group">
            <div>
              <div className="font-medium">{item.store}</div>
              <div className="text-xs text-gray-500">
                {item.date} {item.sizeInfo && `(${item.sizeInfo})`}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold">
                  {item.price}円
                </div>
              </div>
              <DeletePurchaseButton id={item.id} productId={productId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
