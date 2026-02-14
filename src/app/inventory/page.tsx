import { createClient } from '@/utils/supabase/server';
import { StockList } from '@/components/inventory/stock-list';

export default async function InventoryPage() {
  const supabase = await createClient();
  
  // Fetch stock with product details
  const { data: stockData, error } = await supabase
    .from('stock')
    .select(`
      product_id,
      quantity,
      products (
        name,
        units (
          symbol
        )
      )
    `);

  if (error) {
    console.error(error);
    return <div>Error loading inventory</div>;
  }

  // Transform data for the component
  const stockItems = stockData.map((item: any) => ({
    product_id: item.product_id,
    product_name: item.products?.name || 'Unknown Product',
    quantity: item.quantity,
    unit_symbol: item.products?.units?.symbol || '',
  }));

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">在庫一覧</h1>
      
      {stockItems.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          在庫がありません。「買い物」から追加してください。
        </div>
      ) : (
        <StockList stockItems={stockItems} />
      )}
    </div>
  );
}
