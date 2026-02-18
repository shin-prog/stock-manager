'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createStore(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;

  // 最新の sort_order を取得して +1 する
  const { data: latest } = await supabase
    .from('stores')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();
  
  const nextOrder = (latest?.sort_order || 0) + 1;

  const { error } = await supabase.from('stores').insert({
    name,
    sort_order: nextOrder
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/stores');
  redirect('/stores');
}

export async function updateStoresOrder(items: { id: string, sort_order: number }[]) {
  const supabase = await createClient();
  
  await Promise.all(
    items.map(item => supabase.from('stores').update({ sort_order: item.sort_order }).eq('id', item.id))
  );

  revalidatePath('/stores');
}

export async function updateStoreOrder(id: string, newOrder: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('stores')
    .update({ sort_order: newOrder })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/stores');
}

export async function updateStoreName(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('stores')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/stores');
  revalidatePath('/inventory');
}

export async function deleteStore(formData: FormData) {

  const supabase = await createClient();
  const id = formData.get('id') as string;

  // 1. このお店に紐付いている購入データの store_id を NULL に更新して、履歴を残しつつ削除を可能にする
  await supabase
    .from('purchases')
    .update({ store_id: null })
    .eq('store_id', id);

  // 2. お店を削除
  const { error } = await supabase.from('stores').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/stores');
  redirect('/stores');
}
