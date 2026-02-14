'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const defaultUnitId = formData.get('defaultUnitId') as string;
  const minStock = Number(formData.get('minStock'));

  const { error } = await supabase.from('products').insert({
    name,
    category,
    default_unit_id: defaultUnitId,
    min_stock_threshold: minStock
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  // 手動で関連データを削除（DB側の設定が間に合わない場合の安全策）
  await supabase.from('purchase_lines').delete().eq('product_id', id);
  await supabase.from('stock_adjustments').delete().eq('product_id', id);
  await supabase.from('stock').delete().eq('product_id', id);

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/products');
  redirect('/products');
}
