-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Table: units
create table units (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  symbol text not null,
  description text,
  created_at timestamptz default now()
);

-- Table: products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  description text,
  image_url text,
  default_unit_id uuid references units(id),
  min_stock_threshold integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table: product_units (Conversion Logic)
create table product_units (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  unit_id uuid references units(id),
  factor_to_base numeric not null default 1.0, -- How many base units this unit represents
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Table: stores
create table stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location_name text, -- e.g. "Downtown Branch"
  created_at timestamptz default now()
);

-- Table: purchases (Header)
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id),
  purchased_at timestamptz default now(),
  total_cost numeric,
  currency_code text default 'JPY',
  note text,
  created_at timestamptz default now()
);

-- Table: purchase_lines (Detail & Price History)
create table purchase_lines (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid references purchases(id) on delete cascade,
  product_id uuid references products(id),
  unit_id uuid references units(id), -- Unit used at purchase time (e.g. "Pack")
  quantity numeric not null, -- Quantity in purchased units
  unit_price numeric, -- Price per purchased unit
  line_cost numeric, -- Calculated total for this line
  created_at timestamptz default now()
);

-- Table: stock (Inventory Snapshot)
create table stock (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade unique, -- One record per product for MVP
  quantity numeric default 0, -- Tracked in Base Unit
  last_updated timestamptz default now()
);

-- Table: stock_adjustments (For manual decrement/audit)
create table stock_adjustments (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  change_amount numeric not null, -- Negative for consumption, Positive for correction
  reason text, -- "consumed", "audit", "expired"
  adjusted_at timestamptz default now()
);

-- RLS Policies (Simple Personal Use - Allow All for Anon/Auth for now to reduce friction)
alter table units enable row level security;
alter table products enable row level security;
alter table product_units enable row level security;
alter table stores enable row level security;
alter table purchases enable row level security;
alter table purchase_lines enable row level security;
alter table stock enable row level security;
alter table stock_adjustments enable row level security;

-- Policy: Allow all access for now (User requested simple personal use)
-- Ideally this checks auth.uid() but we'll start open for local dev/single user simplicity
create policy "Allow all access" on units for all using (true);
create policy "Allow all access" on products for all using (true);
create policy "Allow all access" on product_units for all using (true);
create policy "Allow all access" on stores for all using (true);
create policy "Allow all access" on purchases for all using (true);
create policy "Allow all access" on purchase_lines for all using (true);
create policy "Allow all access" on stock for all using (true);
create policy "Allow all access" on stock_adjustments for all using (true);

-- Seed Basic Units
insert into units (name, symbol, description) values
  ('Milliliter', 'ml', 'Volume'),
  ('Liter', 'L', 'Volume'),
  ('Gram', 'g', 'Weight'),
  ('Kilogram', 'kg', 'Weight'),
  ('Piece', 'pc', 'Count'),
  ('Pack', 'pk', 'Collection'),
  ('Box', 'bx', 'Container'),
  ('Bottle', 'btl', 'Container'),
  ('Can', 'can', 'Container');
