import { supabase } from './supabase';

export type Project = {
  id?: string;
  customer_id?: string;
  customer_name: string;
  order_id?: string;
  order_number?: string;
  project_name: string;
  status: string;
  created_at?: string;
};

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function saveProject(project: Project) {
  if (project.id) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', project.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function createProjectFromOrder(order: {
  id?: string;
  customer_id?: string;
  customer_name: string;
  order_number?: string;
  project_name: string;
}) {
  return saveProject({
    customer_id: order.customer_id,
    customer_name: order.customer_name,
    order_id: order.id,
    order_number: order.order_number,
    project_name: order.project_name,
    status: 'Offen',
  });
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
