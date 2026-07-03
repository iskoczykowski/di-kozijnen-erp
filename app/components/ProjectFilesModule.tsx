'use client';

import { useRef, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  uploadProjectFile,
  getProjectFiles,
  deleteProjectFile,
} from '../../lib/projectFiles';

export default function ProjectFilesModule({
  projectId,
}: {
  projectId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<Lang>(getLang());
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      setFiles(await getProjectFiles(projectId));
    } catch (e) {
      console.error(e);
    }
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      await uploadProjectFile(projectId, file);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(name: string) {
    await deleteProjectFile(projectId, name);
    await refresh();
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">
          {t('documents', lang)} / {t('photos', lang)}
        </h2>

        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
        >
          +
        </button>
      </div>

      <input hidden ref={inputRef} type="file" onChange={upload} />

      {loading && <div className="mb-4">{t('inProgress', lang)}...</div>}

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between rounded-2xl border p-4"
          >
            <div>{file.name}</div>

            <button
              onClick={() => remove(file.name)}
              className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
            >
              {t('delete', lang)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
