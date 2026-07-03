import { supabase } from './supabase';

export async function getDashboardStats() {
  const [
    customers,
    orders,
    projects,
    production,
    warehouse,
    employees,
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('production').select('*', { count: 'exact', head: true }),
    supabase.from('warehouse').select('*', { count: 'exact', head: true }),
    supabase.from('employees').select('*', { count: 'exact', head: true }),
  ]);

  return {
    customers: customers.count ?? 0,
    orders: orders.count ?? 0,
    projects: projects.count ?? 0,
    production: production.count ?? 0,
    warehouse: warehouse.count ?? 0,
    employees: employees.count ?? 0,
  };
}
