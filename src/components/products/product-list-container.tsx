import { createClient } from '@/utils/supabase/server';
import { ProductListClient } from '@/components/products/product-list-client';

export async function ProductListContainer() {
  const supabase = await createClient();
  
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('*').order('name'),
    supabase.from('categories').select('*').order('sort_order')
  ]);

  const { data: products } = productsRes;
  const { data: categories } = categoriesRes;

  return (
    <ProductListClient 
      products={products || []} 
      categories={categories || []} 
    />
  );
}

export function ProductListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-lg border border-slate-200" />
      ))}
    </div>
  );
}
