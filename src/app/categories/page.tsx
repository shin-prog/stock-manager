import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { CategoryListClient } from '@/components/categories/category-list-client';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">カテゴリ管理</h1>
        <Link href="/categories/new">
          <Button>+ カテゴリ追加</Button>
        </Link>
      </div>
      <CategoryListClient categories={categories || []} />
    </div>
  );
}
