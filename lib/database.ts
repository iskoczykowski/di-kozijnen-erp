import { supabase } from './supabase';

export const DB = {
  customers: 'customers',
  orders: 'orders',
  projects: 'projects',
  measurements: 'measurements',
  production: 'production',
  installation: 'installation',
  warehouse: 'warehouse',
  calendar: 'calendar',
  employees: 'employees',
  messages: 'messages',
  documents: 'documents',
  photos: 'photos',
  offers: 'offers',
  invoices: 'invoices',
  notifications: 'notifications',
};

export async function getAll(table: keyof typeof DB) {
  const { data, error } = await supabase
    .from(DB[table])
    .select('*');

  if (error) throw error;

  return data ?? [];
}

export async function getById(
  table: keyof typeof DB,
  id: string
) {
  const { data, error } = await supabase
    .from(DB[table])
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

export async function insert(
  table: keyof typeof DB,
  values: Record<string, any>
) {
  const { data, error } = await supabase
    .from(DB[table])
    .insert(values)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function update(
  table: keyof typeof DB,
  id: string,
  values: Record<string, any>
) {
  const { data, error } = await supabase
    .from(DB[table])
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function remove(
  table: keyof typeof DB,
  id: string
) {
  const { error } = await supabase
    .from(DB[table])
    .delete()
    .eq('id', id);

  if (error) throw error;
}
