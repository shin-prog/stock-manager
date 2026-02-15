'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';

async function updateStockQuantity(supabase: SupabaseClient, productId: string, delta: number) {
  const { data: stock } = await supabase.from('stock').select('id, quantity').eq('product_id', productId).single();

  if (stock) {
    await supabase.from('stock').update({ 
      quantity: Number(stock.quantity) + delta,
      last_updated: new Date().toISOString()
    }).eq('id', stock.id);
  } else {
    await supabase.from('stock').insert({
      product_id: productId,
      quantity: delta,
      last_updated: new Date().toISOString()
    });
  }
}

interface PurchaseLineInput {
  productId: string;
  quantity: number;
  price: number;
  sizeInfo: string;
}

interface SubmitPurchaseData {
  storeId: string;
  date: string;
  lines: PurchaseLineInput[];
}

export async function submitPurchase(formData: SubmitPurchaseData) {
  const supabase = await createClient();
  const { storeId, date, lines } = formData;

  // 1. Create Purchase Header
  const { data: purchase, error: pError } = await supabase.from('purchases').insert({
    store_id: storeId,
    purchased_at: new Date(date).toISOString(),
    total_cost: lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
  }).select().single();

  if (pError) throw new Error(pError.message);

  // 2. Process Lines & Update Stock
  for (const line of lines) {
    // Insert Line
    const { error: lError } = await supabase.from('purchase_lines').insert({
      purchase_id: purchase.id,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: line.price,
      line_cost: line.quantity * line.price,
      size_info: line.sizeInfo
    });
    if (lError) throw new Error(lError.message);

    // Update Stock
    await updateStockQuantity(supabase, line.productId, Number(line.quantity));
  }

  revalidatePath('/inventory');
}

export async function deletePurchaseLine(id: string, productId: string) {
  const supabase = await createClient();

  // 価格履歴の削除時は在庫数を変更しない（ユーザー要望）
  await supabase.from('purchase_lines').delete().eq('id', id);

  revalidatePath(`/products/${productId}`);
  revalidatePath('/inventory');
}

export async function updatePurchaseLineSizeInfo(id: string, productId: string, sizeInfo: string) {
  const supabase = await createClient();

  await supabase
    .from('purchase_lines')
    .update({ size_info: sizeInfo })
    .eq('id', id);

  revalidatePath(`/products/${productId}`);
}

export async function adjustStock(productId: string, amount: number, reason: string = 'consumed') {
  const supabase = await createClient();

  // 1. Record Adjustment
  await supabase.from('stock_adjustments').insert({
    product_id: productId,
    change_amount: amount,
    reason: reason,
    adjusted_at: new Date().toISOString()
  });

  // 2. Update Snapshot
  await updateStockQuantity(supabase, productId, amount);

  revalidatePath('/inventory');
}
