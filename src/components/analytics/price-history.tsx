import { createClient } from '@/utils/supabase/server';
import { DeletePurchaseButton } from './delete-purchase-button';
import { SizeInfoEditor } from './size-info-editor';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PurchaseLine, Purchase, Store } from '@/types';

type PriceHistoryItem = {
  id: string;
  date: string;
  store: string;
  price: number;
  sizeInfo: string | null;
  quantity: number;
};

export async function PriceHistoryList({ productId }: { productId: string }) {
  const supabase = await createClient();
  
  // Fetch purchase lines for this product
  const { data: lines } = await supabase
    .from('purchase_lines')
    .select(`
      id,
      unit_price,
      quantity,
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

  // Transform to PriceHistoryItem
  const history: PriceHistoryItem[] = (lines as any[]).map((line) => {
    return {
      id: line.id,
      date: formatDate(line.purchases?.purchased_at),
      store: line.purchases?.stores?.name || '(不明)',
      price: line.unit_price,
      sizeInfo: line.size_info,
      quantity: line.quantity
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">価格履歴</h3>
      <div className="border rounded-md divide-y">
        {history.map((item) => (
          <div key={item.id} className="p-3 flex justify-between items-center group">
            <div>
              <div className="font-medium">{item.store}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {item.date} 
                <SizeInfoEditor id={item.id} productId={productId} initialSizeInfo={item.sizeInfo || ''} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold">
                  {formatCurrency(item.price)}
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
