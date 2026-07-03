import { supabase } from './supabase';

export type CalendarEvent = {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: string;
  project_id?: string;
  customer_name?: string;
  created_at?: string;
};

export async function getCalendarEvents() {
  const { data, error } = await supabase
    .from('calendar')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function saveCalendarEvent(event: CalendarEvent) {
  if (event.id) {
    const { data, error } = await supabase
      .from('calendar')
      .update(event)
      .eq('id', event.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('calendar')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
