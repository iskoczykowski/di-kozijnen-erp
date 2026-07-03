import { supabase } from './supabase';

export type Customer = {
  id?: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  notes: string;
};

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveCustomer(customer: Customer) {
  if (customer.id) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', customer.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
