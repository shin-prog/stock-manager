import { createClient } from '@/utils/supabase/server';
import { PurchaseForm } from '@/components/forms/purchase-form';

export default async function NewPurchasePage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');
  const { data: stores } = await supabase.from('stores').select('*');
  const { data: units } = await supabase.from('units').select('*');

  // 最後に利用したお店を取得
  const { data: lastPurchase } = await supabase
    .from('purchases')
    .select('store_id')
    .order('purchased_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">買い物登録</h1>
      <PurchaseForm 
        products={products || []} 
        stores={stores || []} 
        units={units || []} 
        lastStoreId={lastPurchase?.store_id || ''}
      />
    </div>
  );
}
