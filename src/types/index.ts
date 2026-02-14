export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface ProductUnit {
  id: string;
  unit_id: string;
  factor_to_base: number;
  is_default: boolean;
}

export interface PurchaseLine {
  id: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  unit_price: number;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  change_amount: number; // Negative for consumption
}
