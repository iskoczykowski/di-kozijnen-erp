import { supabase } from './supabase';

export type Order = {
  id?: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  project_name: string;
  status: string;
  contact_name: string;
  phone: string;
  email: string;
  notes: string;
};

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveOrder(order: Order) {
  if (order.id) {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
