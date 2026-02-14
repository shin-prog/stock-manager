-- purchases の store_id 外部キー制約を、お店削除時に NULL をセットするように変更
alter table purchases
drop constraint if exists purchases_store_id_fkey,
add constraint purchases_store_id_fkey
  foreign key (store_id)
  references stores(id)
  on delete set null;
