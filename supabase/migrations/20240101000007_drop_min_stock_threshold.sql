-- Remove min_stock_threshold column from products table
alter table products drop column if exists min_stock_threshold;
