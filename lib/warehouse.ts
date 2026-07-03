import { supabase } from './supabase';

export type WarehouseItem = {
  id?: string;

  article_number: string;
  article_name: string;
  category: string;

  quantity: number;
  unit: string;

  location: string;

  minimum_stock: number;

  supplier?: string;

  notes?: string;

  created_at?: string;
  updated_at?: string;
};

export async function getWarehouseItems() {
  const { data, error } = await supabase
    .from('warehouse')
    .select('*')
    .order('article_name');

  if (error) throw error;

  return data ?? [];
}

export async function saveWarehouseItem(item: WarehouseItem) {
  if (item.id) {
    const { data, error } = await supabase
      .from('warehouse')
      .update(item)
      .eq('id', item.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from('warehouse')
    .insert(item)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteWarehouseItem(id: string) {
  const { error } = await supabase
    .from('warehouse')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function changeStock(id: string, quantity: number) {
  const { data, error } = await supabase
    .from('warehouse')
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
