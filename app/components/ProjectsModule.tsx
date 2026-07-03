'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getProjects,
  saveProject,
  deleteProject,
  type Project,
} from '../../lib/projects';
import ProjectFilesModule from './ProjectFilesModule';
import MeasurementsModule from './MeasurementsModule';

const emptyProject: Project = {
  customer_name: '',
  order_number: '',
  project_name: '',
  status: 'Offen',
};

export default function ProjectsModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project>(emptyProject);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'measure' | 'files'>('measure');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());
    window.addEventListener('language-change', update);

    load();

    return () => window.removeEventListener('language-change', update);
  }, []);

  async function load() {
    try {
      setProjects(await getProjects());
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => JSON.stringify(p).toLowerCase().includes(q));
  }, [projects, search]);

  async function save() {
    const saved = await saveProject(selected);
    setSelected(saved);
    await load();
  }

  async function remove() {
    if (!selected.id) return;

    await deleteProject(selected.id);
    setSelected(emptyProject);
    await load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setSelected(emptyProject)}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white"
          >
            + {t('newProject', lang)}
          </button>

          <button
            onClick={save}
            className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white"
          >
            {t('save', lang)}
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search', lang)}
          className="mb-4 w-full rounded-2xl border px-4 py-3 font-semibold"
        />

        <div className="space-y-3">
          {filtered.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelected(project)}
              className={
                selected.id === project.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border bg-slate-50 p-4 text-left'
              }
            >
              <div className="font-black">{project.project_name || '-'}</div>
              <div className="text-sm text-slate-500">
                {project.customer_name || '-'}
              </div>
              <div className="text-sm text-slate-500">
                {project.status || '-'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black">{t('projects', lang)}</h2>

          <button
            onClick={remove}
            className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
          >
            {t('delete', lang)}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label={t('customerData', lang)}
            value={selected.customer_name || ''}
            onChange={(v) => setSelected({ ...selected, customer_name: v })}
          />

          <Field
            label={t('orderNumber', lang)}
            value={selected.order_number || ''}
            onChange={(v) => setSelected({ ...selected, order_number: v })}
          />

          <Field
            label={t('projectName', lang)}
            value={selected.project_name || ''}
            onChange={(v) => setSelected({ ...selected, project_name: v })}
          />

          <Field
            label={t('status', lang)}
            value={selected.status || ''}
            onChange={(v) => setSelected({ ...selected, status: v })}
          />
        </div>

        {selected.id && (
          <>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('measure')}
                className={
                  activeTab === 'measure'
                    ? 'rounded-2xl bg-blue-600 px-5 py-3 font-black text-white'
                    : 'rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700'
                }
              >
                📐 {t('measure', lang)}
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={
                  activeTab === 'files'
                    ? 'rounded-2xl bg-blue-600 px-5 py-3 font-black text-white'
                    : 'rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700'
                }
              >
                📄 {t('documents', lang)} / 📷 {t('photos', lang)}
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'measure' && (
                <MeasurementsModule projectId={selected.id} />
              )}

              {activeTab === 'files' && (
                <ProjectFilesModule projectId={selected.id} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3 font-semibold"
      />
    </label>
  );
}
