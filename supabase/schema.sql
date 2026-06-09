create extension if not exists "uuid-ossp";

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  city text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  project_number text unique,
  customer_id uuid references customers(id) on delete set null,
  title text not null,
  product_type text,
  width_mm numeric,
  height_mm numeric,
  color text,
  glass_type text,
  status text default 'request',
  price numeric default 0,
  created_at timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  sku text,
  name text not null,
  category text,
  quantity numeric default 0,
  min_quantity numeric default 0,
  unit text default 'pcs',
  supplier text,
  created_at timestamptz default now()
);

create table if not exists goods_receipts (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references inventory_items(id) on delete cascade,
  quantity numeric not null,
  supplier text,
  note text,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  phone text,
  email text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  event_type text,
  project_id uuid references projects(id) on delete set null,
  employee_id uuid references employees(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  number text,
  total numeric default 0,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  number text,
  total numeric default 0,
  status text default 'open',
  created_at timestamptz default now()
);
