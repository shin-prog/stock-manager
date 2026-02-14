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
