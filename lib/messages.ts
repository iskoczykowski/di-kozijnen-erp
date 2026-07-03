import { supabase } from './supabase';

export type Message = {
  id?: string;
  title: string;
  message: string;
  sender?: string;
  receiver?: string;
  status: string;
  created_at?: string;
};

export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function saveMessage(message: Message) {
  if (message.id) {
    const { data, error } = await supabase
      .from('messages')
      .update(message)
      .eq('id', message.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
