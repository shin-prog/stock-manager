import { createClient } from '@/utils/supabase/server';
import { ProductForm } from '@/components/forms/product-form';

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ categoryId?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  const [categoriesRes, tagsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('tags').select('*').order('name')
  ]);

  const { data: categories } = categoriesRes;
  const { data: tags } = tagsRes;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <ProductForm
        categories={categories || []}
        allTags={tags || []}
        defaultCategoryId={params.categoryId || ''}
      />
    </div>
  );
}
