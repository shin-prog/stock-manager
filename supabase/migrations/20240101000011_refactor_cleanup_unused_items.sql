-- リファクタリング: 不要な「単位」関連および重複カラムの削除

-- 1. 外部キー制約の削除
alter table products drop constraint if exists products_default_unit_id_fkey;
alter table purchase_lines drop constraint if exists purchase_lines_unit_id_fkey;

-- 2. カラムの削除
alter table products 
  drop column if exists category,
  drop column if exists description,
  drop column if exists image_url,
  drop column if exists default_unit_id;

alter table purchase_lines 
  drop column if exists unit_id;

alter table stores 
  drop column if exists location_name;

alter table purchases 
  drop column if exists currency_code,
  drop column if exists note;

-- 3. テーブルの削除
drop table if exists product_units;
drop table if exists units;
