import { StockList } from "@/components/inventory/stock-list";
import { createClient } from "@/utils/supabase/server";
import { Category, Product, Stock } from "@/types";

export interface StockItem {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  is_archived: boolean;
}

export async function InventoryList() {
  const supabase = await createClient();

  // Fetch stock and categories in parallel
  const [stockRes, categoriesRes] = await Promise.all([
    supabase
      .from("stock")
      .select(
        `
        product_id,
        quantity,
        products (
          name,
          category_id,
          is_archived
        )
      `,
      )
      .order("quantity", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const { data: stockData, error } = stockRes;
  const { data: categoriesData } = categoriesRes;

  if (error || !stockData) {
    console.error(error);
    return <div>Error loading inventory</div>;
  }

  const categoriesMap = new Map<string, string>(
    (categoriesData as Category[] || []).map((c) => [c.id, c.name]),
  );

  // Transform data for the component
  const stockItems: StockItem[] = (stockData as any[]).map((item) => ({
    product_id: item.product_id,
    product_name: item.products?.name || "Unknown Product",
    category: categoriesMap.get(item.products?.category_id) || "未分類",
    quantity: item.quantity,
    is_archived: !!item.products?.is_archived,
  }));

  const categories = (categoriesData || []).map((c) => c.name);

  if (stockItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        在庫がありません。「買い物」から追加してください。
      </div>
    );
  }

  return <StockList stockItems={stockItems} categories={categories} />;
}

export function InventorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-slate-100 rounded-lg border border-slate-200"
        />
      ))}
    </div>
  );
}
