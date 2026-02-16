'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTag(name: string, colorKey: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tags')
    .insert({ name, color_key: colorKey })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/tags');
  return data;
}

export async function updateTag(id: string, name: string, colorKey: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tags')
    .update({ name, color_key: colorKey })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/tags');
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/tags');
}

export async function assignTagsToProduct(productId: string, tagIds: string[]) {
  const supabase = await createClient();

  // First, delete existing associations
  await supabase
    .from('product_tags')
    .delete()
    .eq('product_id', productId);

  if (tagIds.length > 0) {
    // Insert new associations
    const { error } = await supabase
      .from('product_tags')
      .insert(tagIds.map(tagId => ({ product_id: productId, tag_id: tagId })));

    if (error) throw new Error(error.message);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath('/products');
}

export async function getProductTags(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_tags')
    .select('tag_id, tags(*)')
    .eq('product_id', productId);

  if (error) throw new Error(error.message);
  return data.map(item => item.tags);
}

export async function bulkUpdateTagColors(tagIds: string[], colorKey: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tags')
    .update({ color_key: colorKey })
    .in('id', tagIds);

  if (error) throw new Error(error.message);
  revalidatePath('/tags');
}

