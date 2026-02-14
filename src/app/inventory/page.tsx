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
        category_id,
        units (
          symbol
        )
      )
    `)
    .order('quantity', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading inventory</div>;
  }

  const { data: categoriesData } = await supabase.from('categories').select('*').order('sort_order');
  const categoriesMap = new Map((categoriesData || []).map(c => [c.id, c.name]));

  // Transform data for the component
  const stockItems = stockData.map((item: any) => ({
    product_id: item.product_id,
    product_name: item.products?.name || 'Unknown Product',
    category: categoriesMap.get(item.products?.category_id) || '未分類',
    quantity: item.quantity,
    unit_symbol: item.products?.units?.symbol || '',
  }));

  const categories = (categoriesData || []).map(c => c.name);

  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      <h1 className="text-xl font-bold mb-3">在庫一覧</h1>
      
      {stockItems.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          在庫がありません。「買い物」から追加してください。
        </div>
      ) : (
        <StockList stockItems={stockItems} categories={categories} />
      )}
    </div>
  );
}
