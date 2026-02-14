import { PurchaseLine, StockAdjustment, ProductUnit } from '@/types';

export function calculateStock(
  purchases: PurchaseLine[],
  adjustments: StockAdjustment[],
  productUnits: ProductUnit[]
): number {
  return purchases.reduce((sum, purchase) => {
    const unit = productUnits.find(u => u.unit_id === purchase.unit_id);
    const factor = unit ? Number(unit.factor_to_base) : 1;
    return sum + (Number(purchase.quantity) * factor);
  }, 0) + adjustments.reduce((sum, adj) => sum + Number(adj.change_amount), 0);
}

export function normalizePrice(
  price: number,
  unitId: string,
  productUnits: ProductUnit[]
): number {
  const unit = productUnits.find(u => u.unit_id === unitId);
  const factor = unit ? Number(unit.factor_to_base) : 1;
  if (factor === 0) return 0;
  return price / factor;
}
