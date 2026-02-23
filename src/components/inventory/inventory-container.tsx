import { StockList } from "@/components/inventory/stock-list";
import { createClient } from "@/utils/supabase/server";
import { Category, Product, Stock, StockStatus, Tag } from "@/types";

export interface StockItem {
  product_id: string;
  product_name: string;
  category: string;
  category_id: string | null;
  tags: { id: string, name: string, color_key: string }[];
  quantity: number;
  is_archived: boolean;
  stock_status: StockStatus;
  stock_mode: 'exact' | 'approximate';
  approximate_quantity: 'many' | 'few' | null;
  last_updated: string | null;
}

export async function InventoryList() {
  const supabase = await createClient();

  // Fetch stock, categories and tags in parallel
  const [stockRes, categoriesRes, tagsRes] = await Promise.all([
    supabase
      .from("stock")
      .select(
        `
        product_id,
        quantity,
        stock_status,
        stock_mode,
        approximate_quantity,
        last_updated,
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
      .order("quantity", { ascending: true })
      .order("product_id"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("tags").select("*").order("name"),
  ]);

  const { data: stockData, error } = stockRes;
  const { data: categoriesData } = categoriesRes;
  const { data: tagsData } = tagsRes;

  if (error || !stockData) {
    console.error(error);
    return <div>Error loading inventory</div>;
  }

  const allCategories = categoriesData as Category[] || [];
  const allTags = tagsData as Tag[] || [];
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
      stock_mode: item.stock_mode || 'exact',
      approximate_quantity: item.approximate_quantity || null,
      last_updated: item.last_updated || null,
    };
  });

  if (stockItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        商品が登録されていません。「+ 商品追加」から追加してください。
      </div>
    );
  }

  return <StockList stockItems={stockItems} categories={allCategories} allTags={allTags} />;
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
