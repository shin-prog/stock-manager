-- 容量メモ用の列を追加
alter table purchase_lines add column if not exists size_info text;

-- 設定をアプリに反映させるためにキャッシュを強制更新
notify pgrst, 'reload schema';
