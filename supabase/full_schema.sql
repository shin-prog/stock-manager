-- ==========================================
-- Home Stock Manager: Complete Database Schema
-- Last Refactored: 2026-02-15
-- ==========================================
-- このファイルは全マイグレーション (000〜011) を適用した
-- 最終状態を1ファイルにまとめたものです。
-- 新しい開発環境の DB をゼロから構築する場合にお使いください。
-- ==========================================

-- ======================
-- 0. Extensions
-- ======================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- 1. Categories
-- ======================
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 2. Stores
-- ======================
CREATE TABLE stores (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 3. Products
-- ======================
CREATE TABLE products (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  memo        TEXT,
  product_url TEXT,
  is_archived BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 4. Tags
-- ======================
CREATE TABLE tags (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL UNIQUE,
  color_key  TEXT        NOT NULL DEFAULT 'slate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 5. Product Tags (Many-to-Many)
-- ======================
CREATE TABLE product_tags (
  product_id UUID        REFERENCES products(id) ON DELETE CASCADE,
  tag_id     UUID        REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, tag_id)
);

-- ======================
-- 6. Purchases (Header)
-- ======================
CREATE TABLE purchases (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id     UUID        REFERENCES stores(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  total_cost   NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 7. Purchase Lines (Details & Price History)
-- ======================
CREATE TABLE purchase_lines (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID        REFERENCES purchases(id) ON DELETE CASCADE,
  product_id  UUID        REFERENCES products(id) ON DELETE CASCADE,
  quantity    NUMERIC     NOT NULL,
  unit_price  NUMERIC,
  line_cost   NUMERIC,
  size_info   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 8. Stock (Inventory Snapshot)
-- ======================
CREATE TABLE stock (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID        REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  quantity     NUMERIC     DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- 9. Stock Adjustments (Manual Adjustment Log)
-- ======================
CREATE TABLE stock_adjustments (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID        REFERENCES products(id) ON DELETE CASCADE,
  change_amount NUMERIC     NOT NULL,
  reason        TEXT,           -- "consumed", "audit" など
  adjusted_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Indexes (Performance)
-- ==========================================
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_is_archived  ON products(is_archived);
CREATE INDEX idx_product_tags_product  ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag      ON product_tags(tag_id);
CREATE INDEX idx_purchases_store       ON purchases(store_id);
CREATE INDEX idx_purchases_date        ON purchases(purchased_at DESC);
CREATE INDEX idx_purchase_lines_purchase ON purchase_lines(purchase_id);
CREATE INDEX idx_purchase_lines_product  ON purchase_lines(product_id);
CREATE INDEX idx_stock_product         ON stock(product_id);
CREATE INDEX idx_stock_adj_product     ON stock_adjustments(product_id);

-- ==========================================
-- Triggers
-- ==========================================

-- tags.updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================
-- 個人利用のため全アクセスを許可するシンプルなポリシー

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_lines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON categories       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON stores           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON products         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON tags             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON product_tags     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON purchases        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON purchase_lines   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON stock            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);
