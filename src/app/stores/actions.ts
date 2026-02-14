'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createStore(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;

  const { error } = await supabase.from('stores').insert({
    name,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/stores');
  redirect('/stores');
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
