import { createClient } from '@/utils/supabase/server';
import { ProductForm } from '@/components/forms/product-form';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: units } = await supabase.from('units').select('*');
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');
  const { data: tags } = await supabase.from('tags').select('*').order('name');

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <ProductForm 
        units={units || []} 
        categories={categories || []} 
        allTags={tags || []}
      />
    </div>
  );
}
