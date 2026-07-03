import { supabase } from './supabase';

export type ProductionJob = {
  id?: string;
  project_id: string;
  order_id: string;
  customer_name: string;
  project_name: string;

  status: 'Offen' | 'Geplant' | 'Produktion' | 'Fertig';

  planned_date?: string;
  started_at?: string;
  finished_at?: string;

  employee?: string;

  notes?: string;

  created_at?: string;
};

export async function getProductionJobs() {
  const { data, error } = await supabase
    .from('production')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function saveProductionJob(job: ProductionJob) {
  if (job.id) {
    const { data, error } = await supabase
      .from('production')
      .update(job)
      .eq('id', job.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from('production')
    .insert(job)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProductionJob(id: string) {
  const { error } = await supabase
    .from('production')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setProductionStatus(
  id: string,
  status: ProductionJob['status']
) {
  const { data, error } = await supabase
    .from('production')
    .update({
      status,
      finished_at: status === 'Fertig' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
