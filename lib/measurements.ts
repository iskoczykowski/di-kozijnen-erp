import { supabase } from './supabase';

export type Measurement = {
  id?: string;
  project_id: string;
  room: string;
  width: number;
  height: number;
  laser?: string;
  notes?: string;
  created_at?: string;
};

export async function getMeasurements(projectId: string) {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function saveMeasurement(measurement: Measurement) {
  if (measurement.id) {
    const { data, error } = await supabase
      .from('measurements')
      .update(measurement)
      .eq('id', measurement.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('measurements')
    .insert(measurement)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeasurement(id: string) {
  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
