'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getMeasurements,
  saveMeasurement,
  deleteMeasurement,
  type Measurement,
} from '../../lib/measurements';

const emptyMeasurement: Measurement = {
  project_id: '',
  room: '',
  width: 0,
  height: 0,
  laser: '',
  notes: '',
};

export default function MeasurementsModule({
  projectId,
}: {
  projectId: string;
}) {
  const [lang, setLang] = useState<Lang>('de');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selected, setSelected] = useState<Measurement>({
    ...emptyMeasurement,
    project_id: projectId,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    load();

    return () =>
      window.removeEventListener('language-change', update);
  }, [projectId]);

  async function load() {
    try {
      setMeasurements(await getMeasurements(projectId));
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return measurements.filter((m) =>
      JSON.stringify(m).toLowerCase().includes(q)
    );
  }, [measurements, search]);

  async function save() {
    const saved = await saveMeasurement({
      ...selected,
      project_id: projectId,
    });

    setSelected(saved);

    await load();
  }

  async function remove() {
    if (!selected.id) return;

    await deleteMeasurement(selected.id);

    setSelected({
      ...emptyMeasurement,
      project_id: projectId,
    });

    await load();
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-black">
          {t('measure', lang)}
        </h2>

        <div className="flex gap-3">

          <button
            onClick={save}
            className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white"
          >
            {t('save', lang)}
          </button>

          <button
            onClick={remove}
            className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white"
          >
            {t('delete', lang)}
          </button>

        </div>

      </div>

      <input
        className="mb-5 w-full rounded-2xl border px-4 py-3"
        placeholder={t('search', lang)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">

        <Field
          label={t('room', lang)}
          value={selected.room}
          onChange={(v) =>
            setSelected({ ...selected, room: v })
          }
        />

        <Field
          label={t('laser', lang)}
          value={selected.laser || ''}
          onChange={(v) =>
            setSelected({ ...selected, laser: v })
          }
        />

        <NumberField
          label={t('width', lang)}
          value={selected.width}
          onChange={(v) =>
            setSelected({ ...selected, width: v })
          }
        />

        <NumberField
          label={t('height', lang)}
          value={selected.height}
          onChange={(v) =>
            setSelected({ ...selected, height: v })
          }
        />

      </div>

      <textarea
        value={selected.notes}
        onChange={(e) =>
          setSelected({
            ...selected,
            notes: e.target.value,
          })
        }
        className="mt-5 min-h-32 w-full rounded-2xl border p-4"
        placeholder={t('notes', lang)}
      />

      <div className="mt-8 space-y-3">

        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="flex w-full items-center justify-between rounded-2xl border p-4 hover:bg-slate-50"
          >
            <div>

              <div className="font-black">
                {m.room}
              </div>

              <div className="text-slate-500">
                {m.width} × {m.height}
              </div>

            </div>

            <div className="font-bold">
              {m.laser}
            </div>

          </button>
        ))}

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
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block font-bold">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block font-bold">
        {label}
      </span>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border px-4 py-3"
      />
    </label>
  );
}
