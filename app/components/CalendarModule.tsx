'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getCalendarEvents,
  saveCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from '../../lib/calendar';

const emptyEvent: CalendarEvent = {
  title: '',
  description: '',
  date: '',
  time: '',
  type: 'Termin',
  customer_name: '',
};

export default function CalendarModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<CalendarEvent>(emptyEvent);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());
    window.addEventListener('language-change', update);

    load();

    return () => window.removeEventListener('language-change', update);
  }, []);

  async function load() {
    try {
      setEvents(await getCalendarEvents());
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((event) =>
      JSON.stringify(event).toLowerCase().includes(q)
    );
  }, [events, search]);

  async function save() {
    const saved = await saveCalendarEvent(selected);
    setSelected(saved);
    await load();
  }

  async function remove() {
    if (!selected.id) return;

    await deleteCalendarEvent(selected.id);
    setSelected(emptyEvent);
    await load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setSelected(emptyEvent)}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white"
          >
            + {t('appointment', lang)}
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
          {filtered.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className={
                selected.id === event.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border bg-slate-50 p-4 text-left'
              }
            >
              <div className="font-black">{event.title || '-'}</div>
              <div className="text-sm text-slate-500">
                {event.date || '-'} · {event.time || '-'}
              </div>
              <div className="text-sm text-slate-500">
                {event.customer_name || '-'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black">{t('calendar', lang)}</h2>

          <button
            onClick={remove}
            className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
          >
            {t('delete', lang)}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label={t('appointment', lang)}
            value={selected.title}
            onChange={(v) => setSelected({ ...selected, title: v })}
          />

          <Field
            label={t('customers', lang)}
            value={selected.customer_name || ''}
            onChange={(v) => setSelected({ ...selected, customer_name: v })}
          />

          <Field
            label={t('date', lang)}
            value={selected.date}
            type="date"
            onChange={(v) => setSelected({ ...selected, date: v })}
          />

          <Field
            label={t('time', lang)}
            value={selected.time}
            type="time"
            onChange={(v) => setSelected({ ...selected, time: v })}
          />

          <Field
            label={t('status', lang)}
            value={selected.type}
            onChange={(v) => setSelected({ ...selected, type: v })}
          />
        </div>

        <textarea
          value={selected.description || ''}
          onChange={(e) =>
            setSelected({ ...selected, description: e.target.value })
          }
          placeholder={t('description', lang)}
          className="mt-5 min-h-32 w-full rounded-2xl border p-4 font-semibold"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3 font-semibold"
      />
    </label>
  );
}
