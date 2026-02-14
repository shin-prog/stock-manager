-- purchase_lines の外部キー制約を削除して、ON DELETE CASCADE を追加して再作成
alter table purchase_lines
drop constraint if exists purchase_lines_product_id_fkey,
add constraint purchase_lines_product_id_fkey
  foreign key (product_id)
  references products(id)
  on delete cascade;

-- stock_adjustments も同様に修正（念のため）
alter table stock_adjustments
drop constraint if exists stock_adjustments_product_id_fkey,
add constraint stock_adjustments_product_id_fkey
  foreign key (product_id)
  references products(id)
  on delete cascade;
