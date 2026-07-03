import { supabase } from './supabase';

export type InstallationJob = {
  id?: string;
  project_id: string;
  order_id: string;
  customer_name: string;
  project_name: string;

  status: 'Geplant' | 'Unterwegs' | 'Montage' | 'Abgeschlossen';

  installation_date?: string;
  team?: string;

  notes?: string;

  created_at?: string;
};

export async function getInstallationJobs() {
  const { data, error } = await supabase
    .from('installation')
    .select('*')
    .order('installation_date', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function saveInstallationJob(job: InstallationJob) {
  if (job.id) {
    const { data, error } = await supabase
      .from('installation')
      .update(job)
      .eq('id', job.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from('installation')
    .insert(job)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteInstallationJob(id: string) {
  const { error } = await supabase
    .from('installation')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateInstallationStatus(
  id: string,
  status: InstallationJob['status']
) {
  const { data, error } = await supabase
    .from('installation')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
