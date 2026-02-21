'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';

async function updateStockQuantity(supabase: SupabaseClient, productId: string, delta: number) {
  const { data: stock } = await supabase.from('stock').select('id, quantity').eq('product_id', productId).single();

  if (stock) {
    const newQuantity = Math.max(0, Number(stock.quantity) + delta);
    await supabase.from('stock').update({
      quantity: newQuantity,
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

  // 2. Process Lines（一括 INSERT）
  const { error: lError } = await supabase.from('purchase_lines').insert(
    lines.map(line => ({
      purchase_id: purchase.id,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: line.price,
      line_cost: line.quantity * line.price,
      size_info: line.sizeInfo,
    }))
  );
  if (lError) throw new Error(lError.message);

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

export async function updateProductCategory(productId: string, categoryId: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ category_id: categoryId })
    .eq('id', productId);

  if (error) throw new Error(error.message);

  revalidatePath('/inventory');
}

export async function batchUpdateInventory(updates: {
  productId: string,
  quantityDelta: number,
  newQuantity: number,
  categoryId: string | null,
  stockStatus: string,
  stockMode?: 'exact' | 'approximate',
  approximateQuantity?: 'many' | 'few' | null
}[]) {
  const supabase = await createClient();

  const quantityUpdates = updates.filter(u => u.quantityDelta !== 0);
  const now = new Date().toISOString();

  const ops: PromiseLike<any>[] = [];

  // 在庫数変更履歴を一括 INSERT
  if (quantityUpdates.length > 0) {
    ops.push(
      supabase.from('stock_adjustments').insert(
        quantityUpdates.map(u => ({
          product_id: u.productId,
          change_amount: u.quantityDelta,
          reason: 'batch_edit',
          adjusted_at: now,
        }))
      )
    );
  }

  // カテゴリ・ステータス・在庫数(モード含む)更新を並列実行
  for (const u of updates) {
    if (u.categoryId !== undefined) {
      ops.push(
        supabase.from('products').update({ category_id: u.categoryId }).eq('id', u.productId)
      );
    }

    const stockPayload: any = {
      stock_status: u.stockStatus,
      stock_mode: u.stockMode || 'exact',
      approximate_quantity: u.approximateQuantity || null
    };

    if (u.quantityDelta !== 0) {
      stockPayload.quantity = u.newQuantity;
      stockPayload.last_updated = now;
    } else if (u.stockMode !== undefined) {
      stockPayload.last_updated = now;
    }

    ops.push(
      supabase.from('stock').update(stockPayload).eq('product_id', u.productId)
    );
  }

  await Promise.all(ops);

  revalidatePath('/inventory');
}

export async function setStock(
  productId: string,
  newQuantity: number,
  stockMode: 'exact' | 'approximate' = 'exact',
  approximateQuantity: 'many' | 'few' | null = null
) {
  const supabase = await createClient();

  const { data: stock } = await supabase.from('stock').select('id, quantity, stock_mode, approximate_quantity').eq('product_id', productId).single();

  if (stock) {
    const oldQuantity = Number(stock.quantity);
    const delta = newQuantity - oldQuantity;
    const modeChanged = stock.stock_mode !== stockMode;
    const approxChanged = stock.approximate_quantity !== approximateQuantity;

    if (delta !== 0 || modeChanged || approxChanged) {
      const now = new Date().toISOString();
      const ops = [];

      if (delta !== 0) {
        ops.push(supabase.from('stock_adjustments').insert({
          product_id: productId,
          change_amount: delta,
          reason: 'manual_update',
          adjusted_at: now,
        }));
      }

      ops.push(supabase.from('stock').update({
        quantity: newQuantity,
        stock_mode: stockMode,
        approximate_quantity: approximateQuantity,
        last_updated: now,
      }).eq('id', stock.id));

      await Promise.all(ops);
    }
  } else {
    await (supabase as any).from('stock').insert({
      product_id: productId,
      quantity: newQuantity,
      stock_mode: stockMode,
      approximate_quantity: approximateQuantity,
      last_updated: new Date().toISOString()
    });

    if (newQuantity !== 0) {
      await (supabase as any).from('stock_adjustments').insert({
        product_id: productId,
        change_amount: newQuantity,
        reason: 'initial_setup',
        adjusted_at: new Date().toISOString()
      });
    }
  }

  revalidatePath('/inventory');
  revalidatePath(`/products/${productId}`);
}
