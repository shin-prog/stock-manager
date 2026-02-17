import { StockList } from "@/components/inventory/stock-list";
import { createClient } from "@/utils/supabase/server";
import { Category, Product, Stock, StockStatus } from "@/types";

export interface StockItem {
  product_id: string;
  product_name: string;
  category: string;
  category_id: string | null;
  tags: { id: string, name: string, color_key: string }[];
  quantity: number;
  is_archived: boolean;
  stock_status: StockStatus;
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
        stock_status,
        products (
          name,
          category_id,
          is_archived,
          product_tags (
            tags (
              id,
              name,
              color_key
            )
          )
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

  const allCategories = categoriesData as Category[] || [];
  const categoriesMap = new Map<string, string>(
    allCategories.map((c) => [c.id, c.name]),
  );

  // Transform data for the component
  const stockItems: StockItem[] = (stockData as any[]).map((item) => {
    const productTags = item.products?.product_tags || [];
    const tags = productTags.map((pt: any) => pt.tags).filter(Boolean);

    return {
      product_id: item.product_id,
      product_name: item.products?.name || "Unknown Product",
      category: categoriesMap.get(item.products?.category_id) || "未分類",
      category_id: item.products?.category_id || null,
      tags: tags,
      quantity: item.quantity,
      is_archived: !!item.products?.is_archived,
      stock_status: (item.stock_status as StockStatus) || 'unchecked',
    };
  });

  if (stockItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        商品が登録されていません。「+ 商品追加」から追加してください。
      </div>
    );
  }

  return <StockList stockItems={stockItems} categories={allCategories} />;
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
