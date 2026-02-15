export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Tag {
  id: string;
  name: string;
  color_key: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  memo: string | null;
  is_archived: boolean;
  product_url: string | null;
  created_at?: string;
}

export interface Store {
  id: string;
  name: string;
  sort_order: number;
}

export interface Purchase {
  id: string;
  store_id: string;
  purchased_at: string;
  total_cost: number;
}

export interface PurchaseLine {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_cost: number;
  size_info: string | null;
}

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  last_updated: string;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  change_amount: number;
  reason: string;
  adjusted_at: string;
}
