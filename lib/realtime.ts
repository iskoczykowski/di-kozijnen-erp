import { supabase } from './supabase';

export function subscribeCustomers(callback: () => void) {
  return supabase
    .channel('customers')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'customers',
      },
      () => callback()
    )
    .subscribe();
}

export function subscribeOrders(callback: () => void) {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      () => callback()
    )
    .subscribe();
}

export function unsubscribe(channel: any) {
  supabase.removeChannel(channel);
}
