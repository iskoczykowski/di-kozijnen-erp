'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Lang = 'de' | 'nl';
type Module =
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'montage'
  | 'production'
  | 'stock'
  | 'calendar'
  | 'employees'
  | 'messages'
  | 'reports'
  | 'settings';

type TaskStatus = 'open' | 'progress' | 'done';
type TaskPriority = 'normal' | 'important';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  date: string;
};

type EventItem = {
  id: string;
  title: string;
  customer: string;
  location: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  type: 'measurement' | 'montage' | 'production' | 'delivery' | 'customer';
};

type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  type: 'order' | 'message' | 'production' | 'montage' | 'delivery' | 'success' | 'system';
};

const TASK_KEY = 'di_dashboard_tasks_v1';
const EVENT_KEY = 'di_dashboard_events_v1';
const NOTIFICATION_KEY = 'di_dashboard_notifications_v1';

const t = {
  de: {
    subtitle: 'Professionelle Verwaltung für Kunden, Aufträge, Produktion, Montage und Planung.',
    dashboard: 'Dashboard',
    customers: 'Kunden',
    orders: 'Aufträge',
    montage: 'Montage',
    production: 'Produktion',
    stock: 'Lager',
    calendar: 'Kalender',
    employees: 'Mitarbeiter',
    messages: 'Nachrichten',
    reports: 'Berichte',
    settings: 'Einstellungen',
    collapse: 'Menü einklappen',
    office: 'Büro',
    online: 'Online',
    search: 'Suchen...',
    calendarTitle: 'Kalender',
    today: 'Heute',
    appointmentsFor: 'Termine für',
    newAppointment: 'Neuer Termin',
    weekend: 'Wochenende',
    holidayNl: 'Feiertag (NL)',
    nextHoliday: 'Nächster Feiertag',
    todo: 'To-Do Liste',
    newTask: 'Neue Aufgabe',
    all: 'Alle',
    open: 'Offen',
    progress: 'In Arbeit',
    done: 'Erledigt',
    notifications: 'Benachrichtigungen',
    markAllRead: 'Alle als gelesen',
    allTasks: 'Alle Aufgaben anzeigen',
    allNotifications: 'Alle Benachrichtigungen anzeigen',
    important: 'Wichtig',
    createdOrder: 'Neuer Auftrag erfasst',
    newMessage: 'Neue Nachricht',
    productionRule: 'Produktionsvorschrift',
    montageTomorrow: 'Montage Termin morgen',
    deliveryPlanned: 'Lieferung geplant',
    orderDone: 'Auftrag abgeschlossen',
    newProductionTask: 'Neue Produktionsaufgabe',
    systemUpdate: 'System Update',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    help: 'Hilfe',
  },
  nl: {
    subtitle: 'Professioneel beheer voor klanten, orders, productie, montage en planning.',
    dashboard: 'Dashboard',
    customers: 'Klanten',
    orders: 'Orders',
    montage: 'Montage',
    production: 'Productie',
    stock: 'Magazijn',
    calendar: 'Kalender',
    employees: 'Medewerkers',
    messages: 'Berichten',
    reports: 'Rapporten',
    settings: 'Instellingen',
    collapse: 'Menu inklappen',
    office: 'Kantoor',
    online: 'Online',
    search: 'Zoeken...',
    calendarTitle: 'Kalender',
    today: 'Vandaag',
    appointmentsFor: 'Afspraken voor',
    newAppointment: 'Nieuwe afspraak',
    weekend: 'Weekend',
    holidayNl: 'Feestdag (NL)',
    nextHoliday: 'Volgende feestdag',
    todo: 'To-Do lijst',
    newTask: 'Nieuwe taak',
    all: 'Alles',
    open: 'Open',
    progress: 'In uitvoering',
    done: 'Klaar',
    notifications: 'Meldingen',
    markAllRead: 'Alles als gelezen',
    allTasks: 'Alle taken tonen',
    allNotifications: 'Alle meldingen tonen',
    important: 'Belangrijk',
    createdOrder: 'Nieuwe order aangemaakt',
    newMessage: 'Nieuw bericht',
    productionRule: 'Productievoorschrift',
    montageTomorrow: 'Montage afspraak morgen',
    deliveryPlanned: 'Levering gepland',
    orderDone: 'Order afgerond',
    newProductionTask: 'Nieuwe productietaak',
    systemUpdate: 'Systeem update',
    privacy: 'Privacy',
    imprint: 'Impressum',
    help: 'Hulp',
  },
};

const nlHolidays2026 = [
  { date: '2026-01-01', name: 'Nieuwjaarsdag' },
  { date: '2026-04-03', name: 'Goede Vrijdag' },
  { date: '2026-04-05', name: 'Eerste Paasdag' },
  { date: '2026-04-06', name: 'Tweede Paasdag' },
  { date: '2026-04-27', name: 'Koningsdag' },
  { date: '2026-05-05', name: 'Bevrijdingsdag' },
  { date: '2026-05-14', name: 'Hemelvaartsdag' },
  { date: '2026-05-24', name: 'Eerste Pinksterdag' },
  { date: '2026-05-25', name: 'Tweede Pinksterdag' },
  { date: '2026-07-05', name: 'Keti Koti' },
  { date: '2026-12-25', name: 'Eerste Kerstdag' },
  { date: '2026-12-26', name: 'Tweede Kerstdag' },
];

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatDateDE(date: Date) {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateNL(date: Date) {
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function nextNlHoliday(from = '2026-06-30') {
  return nlHolidays2026.find((h) => h.date >= from) || nlHolidays2026[0];
}

function defaultTasks(lang: Lang): Task[] {
  return [
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Angebot für Familie Jansen erstellen' : 'Offerte voor familie Jansen maken',
      status: 'open',
      priority: 'important',
      date: '30.06.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Aufmaß Termin vorbereiten' : 'Inmeetafspraak voorbereiden',
      status: 'progress',
      priority: 'normal',
      date: '30.06.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Neue Bestellung – Fensterprofile' : 'Nieuwe bestelling – raamprofielen',
      status: 'open',
      priority: 'normal',
      date: '01.07.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Produktion Auftrag A-2026-1042 starten' : 'Productie order A-2026-1042 starten',
      status: 'open',
      priority: 'normal',
      date: '01.07.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Lieferung zu Projekt De Vries planen' : 'Levering voor project De Vries plannen',
      status: 'open',
      priority: 'normal',
      date: '02.07.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Auftrag A-2026-1041 überprüfen' : 'Order A-2026-1041 controleren',
      status: 'done',
      priority: 'normal',
      date: '28.06.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Rechnung Nr. R-2026-105 versenden' : 'Factuur nr. R-2026-105 verzenden',
      status: 'done',
      priority: 'normal',
      date: '28.06.',
    },
    {
      id: makeId('task'),
      title: lang === 'de' ? 'Montagematerial prüfen' : 'Montagemateriaal controleren',
      status: 'done',
      priority: 'normal',
      date: '29.06.',
    },
  ];
}

function defaultEvents(lang: Lang): EventItem[] {
  return [
    {
      id: makeId('ev'),
      title: lang === 'de' ? 'Aufmaß – Fam. Jansen' : 'Inmeting – Fam. Jansen',
      customer: 'Familie Jansen',
      location: 'Amsterdam',
      date: '2026-06-30',
      timeFrom: '09:00',
      timeTo: '11:00',
      type: 'measurement',
    },
    {
      id: makeId('ev'),
      title: lang === 'de' ? 'Montage – Projekt De Vries' : 'Montage – Project De Vries',
      customer: 'De Vries',
      location: 'Rotterdam',
      date: '2026-06-30',
      timeFrom: '13:00',
      timeTo: '15:00',
      type: 'montage',
    },
    {
      id: makeId('ev'),
      title: lang === 'de' ? 'Besprechung – Produktion' : 'Bespreking – Productie',
      customer: '',
      location: lang === 'de' ? 'Büro' : 'Kantoor',
      date: '2026-06-30',
      timeFrom: '16:00',
      timeTo: '17:30',
      type: 'production',
    },
  ];
}

function defaultNotifications(lang: Lang): NotificationItem[] {
  return [
    {
      id: makeId('not'),
      icon: '🏠',
      title: t[lang].createdOrder,
      text: lang === 'de' ? 'Auftrag A-2026-1047 wurde erstellt.' : 'Order A-2026-1047 is aangemaakt.',
      time: '10:20',
      unread: true,
      type: 'order',
    },
    {
      id: makeId('not'),
      icon: '💬',
      title: t[lang].newMessage,
      text: lang === 'de' ? 'Von Familie Jansen' : 'Van familie Jansen',
      time: '10:15',
      unread: true,
      type: 'message',
    },
    {
      id: makeId('not'),
      icon: '⚠️',
      title: t[lang].productionRule,
      text: lang === 'de' ? 'Neue Vorschrift für Fensterprofil 88mm.' : 'Nieuw voorschrift voor raamprofiel 88mm.',
      time: '09:55',
      unread: true,
      type: 'production',
    },
    {
      id: makeId('not'),
      icon: '📅',
      title: t[lang].montageTomorrow,
      text: lang === 'de' ? 'Aufmaß bei Familie Jansen um 09:00 Uhr.' : 'Inmeting bij familie Jansen om 09:00 uur.',
      time: '09:30',
      unread: true,
      type: 'montage',
    },
    {
      id: makeId('not'),
      icon: '🚚',
      title: t[lang].deliveryPlanned,
      text: lang === 'de' ? 'Lieferung für Auftrag A-2026-1045 am 02.07.' : 'Levering voor order A-2026-1045 op 02.07.',
      time: '08:45',
      unread: true,
      type: 'delivery',
    },
    {
      id: makeId('not'),
      icon: '✅',
      title: t[lang].orderDone,
      text: lang === 'de' ? 'Auftrag A-2026-1040 wurde abgeschlossen.' : 'Order A-2026-1040 is afgerond.',
      time: lang === 'de' ? 'Gestern' : 'Gisteren',
      unread: false,
      type: 'success',
    },
    {
      id: makeId('not'),
      icon: '🏭',
      title: t[lang].newProductionTask,
      text: lang === 'de' ? 'Produktion Auftrag A-2026-1042 gestartet.' : 'Productie order A-2026-1042 gestart.',
      time: lang === 'de' ? 'Gestern' : 'Gisteren',
      unread: false,
      type: 'production',
    },
    {
      id: makeId('not'),
      icon: '⚙️',
      title: t[lang].systemUpdate,
      text: lang === 'de' ? 'Version 2.1.0 wurde erfolgreich installiert.' : 'Versie 2.1.0 is succesvol geïnstalleerd.',
      time: lang === 'de' ? 'Gestern' : 'Gisteren',
      unread: false,
      type: 'system',
    },
  ];
}

const app: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '96px 1fr',
  background: '#f3f7fc',
  color: '#0f172a',
  fontFamily: 'Arial, sans-serif',
};

const sidebar: React.CSSProperties = {
  background: 'linear-gradient(180deg,#071b34,#10263d)',
  color: '#fff',
  padding: '18px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const iconBtn: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
  border: 0,
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 24,
  display: 'grid',
  placeItems: 'center',
};

const iconActive: React.CSSProperties = {
  ...iconBtn,
  background: '#2563eb',
  boxShadow: '0 12px 24px rgba(37,99,235,.3)',
};

const topbar: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e7edf5',
  borderRadius: 18,
  padding: '18px 26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 8px 24px rgba(15,23,42,.06)',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 8px 24px rgba(15,23,42,.04)',
};

const btn: React.CSSProperties = {
  border: '1px solid #d7e0ec',
  background: '#fff',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const blueBtn: React.CSSProperties = {
  ...btn,
  background: '#2563eb',
  color: '#fff',
  border: '1px solid #2563eb',
};

const input: React.CSSProperties = {
  height: 42,
  border: '1px solid #d7e0ec',
  borderRadius: 12,
  padding: '0 12px',
  background: '#fff',
};

function CalendarPanel({
  lang,
  events,
  addEvent,
}: {
  lang: Lang;
  events: EventItem[];
  addEvent: () => void;
}) {
  const [monthDate, setMonthDate] = useState(new Date(2026, 5, 30));
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const start = new Date(year, month, 1);
  const firstDay = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { day: number; current: boolean; key: string }[] = [];
  const prevDays = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    cells.push({ day: d, current: false, key: dateKey(year, month - 1, d) });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, key: dateKey(year, month, d) });
  }

  while (cells.length < 42) {
    const d = cells.length - firstDay - daysInMonth + 1;
    cells.push({ day: d, current: false, key: dateKey(year, month + 1, d) });
  }

  const selectedDate = '2026-06-30';
  const selected = new Date(2026, 5, 30);
  const dayEvents = events.filter((e) => e.date === selectedDate);
  const nextHoliday = nextNlHoliday(selectedDate);

  return (
    <section style={card}>
      <h2 style={{ marginTop: 0 }}>🗓️ {t[lang].calendarTitle}</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <button style={btn}>{t[lang].today}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={btn} onClick={() => setMonthDate(new Date(year, month - 1, 1))}>‹</button>
          <button style={btn} onClick={() => setMonthDate(new Date(year, month + 1, 1))}>›</button>
        </div>
        <b>{monthDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { month: 'long', year: 'numeric' })}</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #e2e8f0' }}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Za', 'Zo'].map((d, i) => (
          <div key={d} style={{ padding: 8, textAlign: 'center', color: i >= 5 ? '#dc2626' : '#0f172a', fontWeight: 800 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {cells.map((c, i) => {
          const isWeekend = i % 7 >= 5;
          const isHoliday = nlHolidays2026.some((h) => h.date === c.key);
          const isToday = c.key === selectedDate;
          const hasEvent = events.some((e) => e.date === c.key);

          return (
            <button
              key={`${c.key}-${i}`}
              style={{
                height: 44,
                border: '1px solid #edf2f7',
                background: isToday ? '#2563eb' : isHoliday ? '#fee2e2' : isWeekend ? '#fff1f2' : '#fff',
                color: isToday ? '#fff' : isHoliday || isWeekend ? '#dc2626' : c.current ? '#0f172a' : '#94a3b8',
                borderRadius: isToday ? 10 : 0,
                fontWeight: isToday ? 900 : 700,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {c.day}
              {hasEvent && !isToday && <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: 99, background: '#2563eb' }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t[lang].appointmentsFor} {lang === 'de' ? formatDateDE(selected) : formatDateNL(selected)}</h3>
        <button style={{ ...btn, color: '#2563eb' }} onClick={addEvent}>+ {t[lang].newAppointment}</button>
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {dayEvents.map((e) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <b>{e.timeFrom} – {e.timeTo}</b>
            <div>
              <b>{e.title}</b>
              <div style={{ color: '#64748b' }}>{e.location}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16, color: '#64748b' }}>
        <span><b style={{ background: '#dbeafe', padding: '3px 12px', borderRadius: 5 }} /> {t[lang].today}</span>
        <span><b style={{ background: '#ffe4e6', padding: '3px 12px', borderRadius: 5 }} /> {t[lang].weekend}</span>
        <span><b style={{ background: '#ef4444', padding: '3px 12px', borderRadius: 5 }} /> {t[lang].holidayNl}</span>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        🇳🇱 {t[lang].nextHoliday}: {new Date(nextHoliday.date).toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL')} – {nextHoliday.name}
      </div>
    </section>
  );
}

function TodoPanel({
  lang,
  tasks,
  setTasks,
}: {
  lang: Lang;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const filtered = tasks.filter((task) => filter === 'all' || task.status === filter);

  function addTask() {
    const title = prompt(lang === 'de' ? 'Neue Aufgabe:' : 'Nieuwe taak:');
    if (!title) return;
    setTasks((prev) => [
      {
        id: makeId('task'),
        title,
        status: 'open',
        priority: 'normal',
        date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      },
      ...prev,
    ]);
  }

  function toggleTask(task: Task) {
    const next: TaskStatus = task.status === 'done' ? 'open' : 'done';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>📋 {t[lang].todo}</h2>
        <button style={{ ...btn, color: '#2563eb' }} onClick={addTask}>+ {t[lang].newTask}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          ['all', t[lang].all],
          ['open', t[lang].open],
          ['progress', t[lang].progress],
          ['done', t[lang].done],
        ].map(([id, label]) => (
          <button
            key={id}
            style={filter === id ? blueBtn : btn}
            onClick={() => setFilter(id as any)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map((task) => (
          <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: 10, alignItems: 'center', padding: 13, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <button
              onClick={() => toggleTask(task)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: task.status === 'done' ? '#22c55e' : '#fff',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {task.status === 'done' ? '✓' : ''}
            </button>
            <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#64748b' : '#0f172a' }}>
              {task.title}
            </span>
            <span style={{
              fontSize: 12,
              borderRadius: 6,
              padding: '4px 8px',
              background: task.priority === 'important' ? '#fee2e2' : task.status === 'progress' ? '#fef3c7' : task.status === 'done' ? '#dcfce7' : '#dbeafe',
              color: task.priority === 'important' ? '#ef4444' : task.status === 'progress' ? '#d97706' : task.status === 'done' ? '#16a34a' : '#2563eb',
              fontWeight: 800,
            }}>
              {task.priority === 'important' ? t[lang].important : task.status === 'progress' ? t[lang].progress : task.status === 'done' ? t[lang].done : t[lang].open}
            </span>
            <span style={{ color: '#64748b' }}>{task.date}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <button style={{ ...btn, color: '#2563eb' }}>{t[lang].allTasks} →</button>
      </div>
    </section>
  );
}

function NotificationPanel({
  lang,
  notifications,
  setNotifications,
}: {
  lang: Lang;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}) {
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>🔔 {t[lang].notifications}</h2>
        <button style={{ border: 0, background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }} onClick={markAllRead}>
          {t[lang].markAllRead}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #e2e8f0', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: n.type === 'success' ? '#dcfce7' : n.type === 'production' ? '#fef3c7' : '#e8f2ff', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              {n.icon}
            </div>
            <div>
              <b>{n.title}</b>
              <div style={{ color: '#64748b', fontSize: 14 }}>{n.text}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#64748b', fontSize: 13 }}>
              {n.time}
              {n.unread && <div style={{ width: 10, height: 10, borderRadius: 99, background: '#2563eb', marginLeft: 'auto', marginTop: 8 }} />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <button style={{ ...btn, color: '#2563eb' }}>{t[lang].allNotifications} →</button>
      </div>
    </section>
  );
}

export default function DashboardModule({
  lang = 'de',
  setModule,
}: {
  lang?: Lang;
  setModule?: (m: Module) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const tasksData = readArray<Task>(TASK_KEY, defaultTasks(lang));
    const eventsData = readArray<EventItem>(EVENT_KEY, defaultEvents(lang));
    const notData = readArray<NotificationItem>(NOTIFICATION_KEY, defaultNotifications(lang));
    setTasks(tasksData);
    setEvents(eventsData);
    setNotifications(notData);
  }, [lang]);

  useEffect(() => {
    if (tasks.length) writeArray(TASK_KEY, tasks);
  }, [tasks]);

  useEffect(() => {
    if (events.length) writeArray(EVENT_KEY, events);
  }, [events]);

  useEffect(() => {
    if (notifications.length) writeArray(NOTIFICATION_KEY, notifications);
  }, [notifications]);

  function addEvent() {
    const title = prompt(lang === 'de' ? 'Titel vom Termin:' : 'Titel van afspraak:');
    if (!title) return;
    setEvents((prev) => [
      ...prev,
      {
        id: makeId('ev'),
        title,
        customer: '',
        location: t[lang].office,
        date: '2026-06-30',
        timeFrom: '09:00',
        timeTo: '10:00',
        type: 'customer',
      },
    ]);
  }

  return (
    <div style={app}>
      <aside style={sidebar}>
        <div style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid rgba(255,255,255,.75)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 22, marginBottom: 10 }}>
          D&I
        </div>

        {[
          ['dashboard', '🏠', t[lang].dashboard],
          ['customers', '👥', t[lang].customers],
          ['orders', '📋', t[lang].orders],
          ['montage', '🏭', t[lang].montage],
          ['production', '📦', t[lang].production],
          ['stock', '🚚', t[lang].stock],
          ['calendar', '🗓️', t[lang].calendar],
          ['employees', '👷', t[lang].employees],
          ['messages', '💬', t[lang].messages],
          ['reports', '📄', t[lang].reports],
          ['settings', '⚙️', t[lang].settings],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            title={label}
            style={id === 'dashboard' ? iconActive : iconBtn}
            onClick={() => setModule?.(id as Module)}
          >
            {icon}
          </button>
        ))}

        <button style={{ ...iconBtn, marginTop: 'auto', fontSize: 16 }} title={t[lang].collapse}>‹</button>
      </aside>

      <main style={{ padding: '0 28px 18px 28px' }}>
        <header style={{ ...topbar, marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>D&I</div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>Kunststoff Kozijnen</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>und Rollläden</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900 }}>10:24</div>
              <div style={{ color: '#475569' }}>{lang === 'de' ? 'Dienstag, 30. Juni 2026' : 'Dinsdag, 30 juni 2026'}</div>
            </div>
            <div>
              <b>{t[lang].office}</b>
              <div style={{ color: '#16a34a' }}>● {t[lang].online}</div>
            </div>
            <input style={{ ...input, width: 250 }} placeholder={t[lang].search} />
            <button style={blueBtn}>NL</button>
          </div>
        </header>

        <section style={{ padding: '24px 0 18px' }}>
          <h1 style={{ margin: 0 }}>D&I Kozijnen ERP</h1>
          <p style={{ color: '#475569', marginTop: 6 }}>{t[lang].subtitle}</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.1fr 1.1fr', gap: 18, alignItems: 'start' }}>
          <CalendarPanel lang={lang} events={events} addEvent={addEvent} />
          <TodoPanel lang={lang} tasks={tasks} setTasks={setTasks} />
          <NotificationPanel lang={lang} notifications={notifications} setNotifications={setNotifications} />
        </section>

        <footer style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: 20, padding: '0 6px' }}>
          <span>© 2026 D&I Kunststoff Kozijnen B.V. – Alle Rechte vorbehalten.</span>
          <span style={{ display: 'flex', gap: 28 }}>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{t[lang].privacy}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{t[lang].imprint}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{t[lang].settings}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{t[lang].help}</button>
          </span>
        </footer>
      </main>
    </div>
  );
}

