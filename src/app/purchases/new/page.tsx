import { createClient } from '@/utils/supabase/server';
import { PurchaseForm } from '@/components/forms/purchase-form';

export default async function NewPurchasePage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');
  const { data: stores } = await supabase.from('stores').select('*');
  const { data: units } = await supabase.from('units').select('*');

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">買い物登録</h1>
      <PurchaseForm 
        products={products || []} 
        stores={stores || []} 
        units={units || []} 
      />
    </div>
  );
}
