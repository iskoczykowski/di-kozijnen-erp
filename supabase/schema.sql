-- =====================================================
-- D&I Kozijnen ERP 2.0
-- Basisdatenbank
-- =====================================================

create extension if not exists "pgcrypto";

--------------------------------------------------------
-- CUSTOMERS
--------------------------------------------------------

create table if not exists customers (

    id uuid primary key default gen_random_uuid(),

    company_name text not null,
    contact_name text,
    phone text,
    email text,

    street text,
    zip text,
    city text,
    country text,

    notes text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

--------------------------------------------------------
-- ORDERS
--------------------------------------------------------

create table if not exists orders (

    id uuid primary key default gen_random_uuid(),

    customer_id uuid references customers(id) on delete cascade,

    order_number text not null,

    customer_name text,
    project_name text,

    contact_name text,
    phone text,
    email text,

    status text default 'Offen',

    notes text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

--------------------------------------------------------
-- PROJECTS
--------------------------------------------------------

create table if not exists projects (

    id uuid primary key default gen_random_uuid(),

    order_id uuid references orders(id) on delete cascade,

    customer_id uuid references customers(id),

    customer_name text,
    project_name text,

    status text default 'Offen',

    progress integer default 0,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

--------------------------------------------------------
-- MEASUREMENTS
--------------------------------------------------------

create table if not exists measurements (

    id uuid primary key default gen_random_uuid(),

    project_id uuid references projects(id) on delete cascade,

    room text,

    width numeric,
    height numeric,

    laser text,

    notes text,

    created_at timestamptz default now()
);

--------------------------------------------------------
-- PHOTOS
--------------------------------------------------------

create table if not exists photos (

    id uuid primary key default gen_random_uuid(),

    project_id uuid references projects(id) on delete cascade,

    file_url text,

    description text,

    created_at timestamptz default now()
);

--------------------------------------------------------
-- DOCUMENTS
--------------------------------------------------------

create table if not exists documents (

    id uuid primary key default gen_random_uuid(),

    project_id uuid references projects(id) on delete cascade,

    name text,

    file_url text,

    created_at timestamptz default now()
);
