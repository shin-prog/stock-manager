-- ざっくり在庫管理（多／少）のためのカラム追加
-- ダッシュボードのSQLエディタで実行してください。

ALTER TABLE stock 
ADD COLUMN IF NOT EXISTS stock_mode TEXT DEFAULT 'exact' CHECK (stock_mode IN ('exact', 'approximate')),
ADD COLUMN IF NOT EXISTS approximate_quantity TEXT DEFAULT NULL CHECK (approximate_quantity IN ('many', 'few'));

-- 既存の full_schema に合わせてコメント
COMMENT ON COLUMN stock.stock_mode IS '在庫管理モード: exact(数値) または approximate(ざっくり)';
COMMENT ON COLUMN stock.approximate_quantity IS 'ざっくり在庫量: many(多) または few(少)';
