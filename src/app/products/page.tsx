import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ProductListClient } from '@/components/products/product-list-client';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').order('name');
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">商品一覧</h1>
        <Link href="/products/new">
          <Button>+ 商品追加</Button>
        </Link>
      </div>

      <ProductListClient 
        products={products || []} 
        categories={categories || []} 
      />
    </div>
  );
}
