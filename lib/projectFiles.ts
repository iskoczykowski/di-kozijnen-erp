import { supabase } from './supabase';

export async function uploadProjectFile(
  projectId: string,
  file: File
) {
  const path = `${projectId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('project-files')
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('project-files')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function getProjectFiles(projectId: string) {
  const { data, error } = await supabase.storage
    .from('project-files')
    .list(projectId);

  if (error) throw error;

  return data;
}

export async function deleteProjectFile(
  projectId: string,
  fileName: string
) {
  const { error } = await supabase.storage
    .from('project-files')
    .remove([`${projectId}/${fileName}`]);

  if (error) throw error;
}
