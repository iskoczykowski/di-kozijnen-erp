'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getEmployees,
  saveEmployee,
  deleteEmployee,
  type Employee,
} from '../../lib/employees';

const emptyEmployee: Employee = {
  name: '',
  role: '',
  phone: '',
  email: '',
  department: '',
  active: true,
  notes: '',
};

export default function EmployeesModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee>(emptyEmployee);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());
    window.addEventListener('language-change', update);

    load();

    return () =>
      window.removeEventListener('language-change', update);
  }, []);

  async function load() {
    try {
      setEmployees(await getEmployees());
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return employees.filter((e) =>
      JSON.stringify(e).toLowerCase().includes(q)
    );
  }, [employees, search]);

  async function save() {
    const saved = await saveEmployee(selected);
    setSelected(saved);
    await load();
  }

  async function remove() {
    if (!selected.id) return;

    await deleteEmployee(selected.id);

    setSelected(emptyEmployee);

    await load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <div className="rounded-3xl bg-white p-6 shadow">

        <div className="mb-4 flex gap-3">

          <button
            onClick={() => setSelected(emptyEmployee)}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white"
          >
            + {t('employees', lang)}
          </button>

          <button
            onClick={save}
            className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white"
          >
            {t('save', lang)}
          </button>

        </div>

        <input
          className="mb-4 w-full rounded-2xl border px-4 py-3"
          value={search}
          placeholder={t('search', lang)}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">

          {filtered.map((employee) => (

            <button
              key={employee.id}
              onClick={() => setSelected(employee)}
              className={
                selected.id === employee.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border p-4 text-left'
              }
            >
              <div className="font-black">
                {employee.name}
              </div>

              <div className="text-slate-500">
                {employee.role}
              </div>

            </button>

          ))}

        </div>

      </div>

      <div className="rounded-3xl bg-white p-6 shadow xl:col-span-2">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-3xl font-black">
            {t('employees', lang)}
          </h2>

          <button
            onClick={remove}
            className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
          >
            {t('delete', lang)}
          </button>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <Field
            label={t('employees', lang)}
            value={selected.name}
            onChange={(v) => setSelected({ ...selected, name: v })}
          />

          <Field
            label={t('status', lang)}
            value={selected.role}
            onChange={(v) => setSelected({ ...selected, role: v })}
          />

          <Field
            label={t('phone', lang)}
            value={selected.phone || ''}
            onChange={(v) => setSelected({ ...selected, phone: v })}
          />

          <Field
            label={t('email', lang)}
            value={selected.email || ''}
            onChange={(v) => setSelected({ ...selected, email: v })}
          />

        </div>

        <textarea
          className="mt-5 min-h-32 w-full rounded-2xl border p-4"
          value={selected.notes || ''}
          placeholder={t('notes', lang)}
          onChange={(e) =>
            setSelected({
              ...selected,
              notes: e.target.value,
            })
          }
        />

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
