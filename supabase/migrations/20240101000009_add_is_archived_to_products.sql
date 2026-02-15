-- Add is_archived column to products table
alter table products add column is_archived boolean default false;
