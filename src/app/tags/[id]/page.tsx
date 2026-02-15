import { createClient } from '@/utils/supabase/server';
import { TagBadge } from '@/components/tags/tag-badge';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Product, PurchaseLine } from '@/types';

type AggregatedHistoryItem = {
  id: string;
  date: string;
  store: string;
  productName: string;
  price: number;
  sizeInfo: string | null;
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

  // Fetch products with this tag
  const { data: productsData } = await supabase
    .from('product_tags')
    .select('products(id, name, category_id)')
    .eq('tag_id', id);

  const products = (productsData?.map(p => p.products) as unknown as Product[]) || [];
  const productIds = products.map(p => p.id);

  // Fetch aggregated purchase history
  let history: AggregatedHistoryItem[] = [];
  if (productIds.length > 0) {
    const { data: lines } = await supabase
      .from('purchase_lines')
      .select(`
        id,
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

    history = lines?.map((line: any) => ({
      id: line.id,
      date: formatDate(line.purchases?.purchased_at),
      store: line.purchases?.stores?.name || '不明なお店',
      productName: line.products?.name,
      price: line.unit_price,
      sizeInfo: line.size_info
    })) || [];
  }

  return (
    <div className="container mx-auto p-4 max-w-lg space-y-8">
      <div className="flex items-center gap-3">
        <TagBadge name={tag.name} colorKey={tag.color_key} className="text-xl py-1 px-4" />
        <h1 className="text-2xl font-bold">の商品一覧</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <Package size={20} className="text-slate-400" /> 対象商品 ({products.length})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <Link 
              key={p.id} 
              href={`/products/${p.id}`}
              className="p-3 border rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {p.name}
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
        <h2 className="text-lg font-semibold border-b pb-2">統合価格履歴</h2>
        <div className="border rounded-md divide-y bg-white">
          {history.map((item) => (
            <div key={item.id} className="p-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{item.productName}</span>
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
                <div className="font-bold text-lg">
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
