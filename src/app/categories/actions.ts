'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;

  const { data: latest } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();
  
  const nextOrder = (latest?.sort_order || 0) + 1;

  const { error } = await supabase.from('categories').insert({
    name,
    sort_order: nextOrder
  });

  if (error) throw new Error(error.message);

  revalidatePath('/categories');
  redirect('/categories');
}

export async function updateCategoriesOrder(items: { id: string, sort_order: number }[]) {
  const supabase = await createClient();
  for (const item of items) {
    await supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id);
  }
  revalidatePath('/categories');
  revalidatePath('/products');
  revalidatePath('/inventory');
}

export async function updateCategoryOrder(id: string, newOrder: number) {
  const supabase = await createClient();
  await supabase.from('categories').update({ sort_order: newOrder }).eq('id', id);
  revalidatePath('/categories');
  revalidatePath('/products');
  revalidatePath('/inventory');
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/categories');
  revalidatePath('/products');
  revalidatePath('/inventory');
}
