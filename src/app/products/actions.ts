'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const defaultUnitId = formData.get('defaultUnitId') as string;
  const minStock = Number(formData.get('minStock'));

  const { error } = await supabase.from('products').insert({
    name,
    category_id: categoryId === 'none' || !categoryId ? null : categoryId,
    default_unit_id: defaultUnitId,
    min_stock_threshold: minStock
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function updateProductCategory(id: string, categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ category_id: categoryId === 'none' ? null : categoryId })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/products');
  revalidatePath('/inventory');
}

export async function updateProductMemo(id: string, memo: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ memo })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${id}`);
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

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
