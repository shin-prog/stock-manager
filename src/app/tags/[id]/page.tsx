import { createClient } from '@/utils/supabase/server';
import { TagBadge } from '@/components/tags/tag-badge';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Product, PurchaseLine } from '@/types';
import { cn } from '@/lib/utils';

type ProductWithStock = {
  id: string;
  name: string;
  category_id: string | null;
  is_archived: boolean;
  stock_quantity: number;
};

type AggregatedHistoryItem = {
  id: string;
  date: string;
  store: string;
  productName: string;
  productId: string;
  price: number;
  sizeInfo: string | null;
  is_archived: boolean;
};

export default async function TagDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch tag details
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();

  if (!tag) return <div>タグが見つかりません</div>;

  // Fetch products with this tag, including is_archived and stock
  const { data: productsData } = await supabase
    .from('product_tags')
    .select('products(id, name, category_id, is_archived)')
    .eq('tag_id', id);

  const rawProducts = (productsData?.map(p => p.products as any).filter(Boolean)) || [];
  const productIds = rawProducts.map((p: any) => p.id as string);

  // Fetch stock data separately to avoid nested join issues
  let stockMap = new Map<string, number>();
  if (productIds.length > 0) {
    const { data: stockData } = await supabase
      .from('stock')
      .select('product_id, quantity')
      .in('product_id', productIds);

    stockMap = new Map(
      (stockData || []).map(s => [s.product_id, Number(s.quantity)])
    );
  }

  const products: ProductWithStock[] = rawProducts.map((prod: any) => ({
    id: prod.id,
    name: prod.name,
    category_id: prod.category_id,
    is_archived: !!prod.is_archived,
    stock_quantity: stockMap.get(prod.id) ?? 0,
  }));

  // Sort products: active first, then archived
  const sortedProducts = [...products].sort((a, b) => {
    if (a.is_archived !== b.is_archived) {
      return a.is_archived ? 1 : -1;
    }
    return 0;
  });

  // Build a map for quick lookup of product info
  const productInfoMap = new Map(products.map(p => [p.id, p]));

  // Fetch aggregated purchase history
  let history: AggregatedHistoryItem[] = [];
  if (productIds.length > 0) {
    const { data: lines } = await supabase
      .from('purchase_lines')
      .select(`
        id,
        product_id,
        unit_price,
        size_info,
        products (name),
        purchases (
          purchased_at,
          stores (name)
        )
      `)
      .in('product_id', productIds)
      .order('purchases(purchased_at)', { ascending: false });

    history = lines?.map((line: any) => {
      const prodInfo = productInfoMap.get(line.product_id);
      return {
        id: line.id,
        date: formatDate(line.purchases?.purchased_at),
        store: line.purchases?.stores?.name || '(不明)',
        productName: line.products?.name,
        productId: line.product_id,
        price: line.unit_price,
        sizeInfo: line.size_info,
        is_archived: prodInfo?.is_archived ?? false,
      };
    }) || [];
  }

  return (
    <div className="container mx-auto p-4 max-w-lg space-y-8">
      <div className="flex items-center gap-3">
        <TagBadge name={tag.name} colorKey={tag.color_key} className="text-xl py-1 px-4 max-w-[60%]" />
        <h1 className="text-2xl font-bold">の商品一覧</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <Package size={20} className="text-slate-400" /> 対象商品 ({products.length})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {sortedProducts.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={cn(
                "p-3 border rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-between gap-2",
                p.is_archived
                  ? "opacity-50 bg-slate-50 border-slate-200"
                  : "border-slate-200"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  p.is_archived ? "bg-slate-300" : "bg-slate-400"
                )} />
                <span className={cn(
                  "truncate",
                  p.is_archived && "text-slate-400"
                )}>{p.name}</span>
              </div>
              <span className={cn(
                "text-xs shrink-0 px-1.5 py-0.5 rounded font-medium",
                p.is_archived
                  ? "bg-slate-100 text-slate-400"
                  : "bg-blue-50 text-blue-600"
              )}>
                {p.stock_quantity}
              </span>
            </Link>
          ))}
          {products.length === 0 && (
            <div className="col-span-2 text-center text-slate-400 py-4">
              商品が登録されていません。
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pb-24">
        <h2 className="text-lg font-semibold border-b pb-2">統合購入履歴</h2>
        <div className="border rounded-md divide-y bg-white">
          {history.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-3 flex justify-between items-center",
                item.is_archived && "opacity-50 bg-slate-50"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-bold text-sm",
                    item.is_archived && "text-slate-400"
                  )}>{item.productName}</span>
                  <span className="text-xs text-slate-400">@ {item.store}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{item.date}</span>
                  {item.sizeInfo && (
                    <span className="bg-slate-100 px-1 rounded">{item.sizeInfo}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-bold text-lg",
                  item.is_archived && "text-slate-400"
                )}>
                  {formatCurrency(item.price)}
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              購入履歴がありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
