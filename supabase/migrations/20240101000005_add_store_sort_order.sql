-- stores テーブルに任意の並び順を保持するカラムを追加
alter table stores add column if not exists sort_order integer default 0;

-- スキーマキャッシュの更新
notify pgrst, 'reload schema';
