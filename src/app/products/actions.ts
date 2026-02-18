'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const tagIds = formData.getAll('tagIds') as string[];

  const { data: product, error } = await supabase.from('products').insert({
    name,
    category_id: categoryId === 'none' || !categoryId ? null : categoryId,
  }).select().single();

  if (error) {
    throw new Error(error.message);
  }

  // 在庫レコードとタグを並列で作成
  await Promise.all([
    supabase.from('stock').insert({
      product_id: product.id,
      quantity: 0,
      last_updated: new Date().toISOString(),
    }),
    tagIds.length > 0
      ? supabase.from('product_tags').insert(
          tagIds.map(tagId => ({ product_id: product.id, tag_id: tagId }))
        )
      : Promise.resolve(),
  ]);

  revalidatePath('/inventory');
  revalidatePath('/products');
  redirect('/inventory');
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

export async function updateProductName(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${id}`);
  revalidatePath('/products');
  revalidatePath('/inventory');
}

export async function updateProductUrl(id: string, url: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ product_url: url })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${id}`);
}

export async function toggleProductArchive(id: string, isArchived: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_archived: isArchived })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${id}`);
  revalidatePath('/inventory');
  revalidatePath('/products');
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  // 依存レコードを並列削除してから本体を削除
  await Promise.all([
    supabase.from('purchase_lines').delete().eq('product_id', id),
    supabase.from('stock_adjustments').delete().eq('product_id', id),
    supabase.from('stock').delete().eq('product_id', id),
  ]);

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/inventory');
  revalidatePath('/products');
  redirect('/inventory');
}
