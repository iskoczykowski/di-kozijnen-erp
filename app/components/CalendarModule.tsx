'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import { saveNotification } from '../../lib/notifications';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  color: string;
  createdAt: string;
};

const STORAGE_KEY = 'firmaflow_calendar_events';

const emptyEvent: CalendarEvent = {
  id: '',
  title: '',
  date: '',
  time: '',
  location: '',
  notes: '',
  color: '#2563eb',
  createdAt: '',
};

function getEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export default function CalendarModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [form, setForm] = useState<CalendarEvent>(emptyEvent);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());
    setEvents(getEvents());
  }, []);

  const filtered = useMemo(() => {
    return events
      .filter((event) =>
        `${event.title} ${event.date} ${event.time} ${event.location} ${event.notes}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [events, search]);

  function resetForm() {
    setForm(emptyEvent);
  }

  function handleSave() {
    if (!form.title.trim() || !form.date) return;

    const event: CalendarEvent = {
      ...form,
      id: form.id || crypto.randomUUID(),
      createdAt: form.createdAt || new Date().toISOString(),
    };

    const exists = events.some((item) => item.id === event.id);

    const updated = exists
      ? events.map((item) => (item.id === event.id ? event : item))
      : [event, ...events];

    setEvents(updated);
    saveEvents(updated);

    saveNotification({
      title: `${t(lang, 'calendar')}: ${t(lang, 'save')}`,
      text: `${event.title} - ${event.date} ${event.time}`,
      type: 'calendar',
    });

    resetForm();
  }

  function handleEdit(event: CalendarEvent) {
    setForm(event);
  }

  function handleDelete(id: string) {
    const updated = events.filter((event) => event.id !== id);
    setEvents(updated);
    saveEvents(updated);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, 'calendar')}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border p-3"
            placeholder={t(lang, 'title')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder={t(lang, 'location')}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder={t(lang, 'notes')}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            {t(lang, 'save')}
          </button>

          <button
            onClick={resetForm}
            className="rounded-xl bg-gray-200 px-5 py-3 font-semibold"
          >
            {t(lang, 'clear')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <input
          className="mb-4 w-full rounded-xl border p-3"
          placeholder={`${t(lang, 'search')}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border p-4"
              style={{ borderLeft: `8px solid ${event.color}` }}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {event.date} {event.time}
                  </p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>

              {event.notes && (
                <p className="mt-3 whitespace-pre-wrap text-gray-700">
                  {event.notes}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                >
                  {t(lang, 'edit')}
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  {t(lang, 'delete')}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-500">{t(lang, 'noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
