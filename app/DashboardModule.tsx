'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type Lang = 'de' | 'nl';

export type Module =
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'montage'
  | 'production'
  | 'stock'
  | 'delivery'
  | 'calendar'
  | 'employees'
  | 'messages';

type TaskStatus = 'open' | 'progress' | 'done';
type TaskPriority = 'normal' | 'important';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  date: string;
};

type EventType = 'measurement' | 'montage' | 'production' | 'delivery' | 'customer';

type EventItem = {
  id: string;
  title: string;
  customer: string;
  location: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  type: EventType;
};

type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  type: 'order' | 'message' | 'production' | 'montage' | 'delivery' | 'calendar' | 'success' | 'system';
};

const TASK_KEY = 'di_dashboard_tasks_v1';
const EVENT_KEY = 'di_dashboard_events_v1';
const NOTIFICATION_KEY = 'di_dashboard_notifications_v1';
const ORDER_KEY = 'di_orders_professional_v2';
const NOTIFIED_ORDERS_KEY = 'di_notified_orders_v1';

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

const T = {
  de: {
    subtitle: 'Professionelle Verwaltung für Kunden, Aufträge, Produktion, Montage und Planung.',
    dashboard: 'Dashboard',
    customers: 'Kunden',
    orders: 'Aufträge',
    montage: 'Montage',
    production: 'Produktion',
    stock: 'Lager',
    delivery: 'Lieferung',
    calendar: 'Kalender',
    employees: 'Mitarbeiter',
    messages: 'Nachrichten',
    office: 'Büro',
    online: 'Online',
    search: 'Suchen...',
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
    eventCreated: 'Neuer Termin erstellt',
    selectType: 'Terminart auswählen',
    appointmentTitle: 'Titel vom Termin',
    customer: 'Kunde',
    location: 'Ort',
    from: 'Von',
    to: 'Bis',
    save: 'Speichern',
    cancel: 'Abbrechen',
    measurement: 'Aufmaß',
    typeCustomer: 'Kunde',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    settings: 'Einstellungen',
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
    delivery: 'Levering',
    calendar: 'Kalender',
    employees: 'Medewerkers',
    messages: 'Berichten',
    office: 'Kantoor',
    online: 'Online',
    search: 'Zoeken...',
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
    eventCreated: 'Nieuwe afspraak aangemaakt',
    selectType: 'Afspraaktype kiezen',
    appointmentTitle: 'Titel van afspraak',
    customer: 'Klant',
    location: 'Plaats',
    from: 'Van',
    to: 'Tot',
    save: 'Opslaan',
    cancel: 'Annuleren',
    measurement: 'Inmeting',
    typeCustomer: 'Klant',
    privacy: 'Privacy',
    imprint: 'Impressum',
    settings: 'Instellingen',
    help: 'Hulp',
  },
};

const moduleLabels: Record<Module, { de: string; nl: string; icon: string }> = {
  dashboard: { de: 'Dashboard', nl: 'Dashboard', icon: '🏠' },
  customers: { de: 'Kunden', nl: 'Klanten', icon: '👥' },
  orders: { de: 'Aufträge', nl: 'Orders', icon: '📋' },
  montage: { de: 'Montage', nl: 'Montage', icon: '🔧' },
  production: { de: 'Produktion', nl: 'Productie', icon: '🏭' },
  stock: { de: 'Lager', nl: 'Magazijn', icon: '📦' },
  delivery: { de: 'Lieferung', nl: 'Levering', icon: '🚚' },
  calendar: { de: 'Kalender', nl: 'Kalender', icon: '🗓️' },
  employees: { de: 'Mitarbeiter', nl: 'Medewerkers', icon: '👷' },
  messages: { de: 'Nachrichten', nl: 'Berichten', icon: '💬' },
};

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
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
  const fixed = new Date(y, m, d);
  return `${fixed.getFullYear()}-${pad(fixed.getMonth() + 1)}-${pad(fixed.getDate())}`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nextNlHoliday(from: string) {
  return nlHolidays2026.find((h) => h.date >= from) || nlHolidays2026[0];
}

function defaultTasks(lang: Lang): Task[] {
  return [
    { id: makeId('task'), title: lang === 'de' ? 'Angebot für Familie Jansen erstellen' : 'Offerte voor familie Jansen maken', status: 'open', priority: 'important', date: '30.06.' },
    { id: makeId('task'), title: lang === 'de' ? 'Aufmaß Termin vorbereiten' : 'Inmeetafspraak voorbereiden', status: 'progress', priority: 'normal', date: '30.06.' },
    { id: makeId('task'), title: lang === 'de' ? 'Neue Bestellung – Fensterprofile' : 'Nieuwe bestelling – raamprofielen', status: 'open', priority: 'normal', date: '01.07.' },
  ];
}

function defaultEvents(lang: Lang): EventItem[] {
  return [
    { id: makeId('ev'), title: lang === 'de' ? 'Aufmaß – Fam. Jansen' : 'Inmeting – Fam. Jansen', customer: 'Familie Jansen', location: 'Amsterdam', date: '2026-06-30', timeFrom: '09:00', timeTo: '11:00', type: 'measurement' },
    { id: makeId('ev'), title: lang === 'de' ? 'Montage – Auftrag De Vries' : 'Montage – Order De Vries', customer: 'De Vries', location: 'Rotterdam', date: '2026-06-30', timeFrom: '13:00', timeTo: '15:00', type: 'montage' },
  ];
}

function defaultNotifications(lang: Lang): NotificationItem[] {
  return [
    { id: makeId('not'), icon: '⚠️', title: T[lang].productionRule, text: lang === 'de' ? 'Neue Vorschrift für Fensterprofil 88mm.' : 'Nieuw voorschrift voor raamprofiel 88mm.', time: '09:55', unread: true, type: 'production' },
  ];
}

function eventTypeLabel(type: EventType, lang: Lang) {
  if (type === 'measurement') return T[lang].measurement;
  if (type === 'montage') return T[lang].montage;
  if (type === 'production') return T[lang].production;
  if (type === 'delivery') return T[lang].delivery;
  return T[lang].typeCustomer;
}

function eventIcon(type: EventType) {
  if (type === 'measurement') return '📐';
  if (type === 'montage') return '🔧';
  if (type === 'production') return '🏭';
  if (type === 'delivery') return '🚚';
  return '👥';
}

const app: React.CSSProperties = { minHeight: '100vh', display: 'grid', gridTemplateColumns: '96px 1fr', background: '#f3f7fc', color: '#0f172a', fontFamily: 'Arial, sans-serif' };
const sidebar: React.CSSProperties = { background: 'linear-gradient(180deg,#071b34,#10263d)', color: '#fff', padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 };
const iconBtn: React.CSSProperties = { width: 56, height: 56, borderRadius: 14, border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 24, display: 'grid', placeItems: 'center' };
const iconActive: React.CSSProperties = { ...iconBtn, background: '#2563eb', boxShadow: '0 12px 24px rgba(37,99,235,.3)' };
const topbar: React.CSSProperties = { background: '#fff', border: '1px solid #e7edf5', borderRadius: 18, padding: '18px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(15,23,42,.06)' };
const card: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,.04)' };
const btn: React.CSSProperties = { border: '1px solid #d7e0ec', background: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' };
const blueBtn: React.CSSProperties = { ...btn, background: '#2563eb', color: '#fff', border: '1px solid #2563eb' };
const input: React.CSSProperties = { height: 42, border: '1px solid #d7e0ec', borderRadius: 12, padding: '0 12px', background: '#fff', boxSizing: 'border-box' };

function CalendarPanel({
  lang,
  events,
  selectedDate,
  setSelectedDate,
  addEventForDate,
}: {
  lang: Lang;
  events: EventItem[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addEventForDate: (date: string) => void;
}) {
  const [monthDate, setMonthDate] = useState(new Date(2026, 5, 30));
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; key: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, key: dateKey(year, month - 1, prevDays - i) });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, key: dateKey(year, month, d) });
  while (cells.length < 42) {
    const d = cells.length - firstDay - daysInMonth + 1;
    cells.push({ day: d, current: false, key: dateKey(year, month + 1, d) });
  }

  const selected = new Date(selectedDate);
  const dayEvents = events.filter((e) => e.date === selectedDate);
  const holiday = nextNlHoliday(selectedDate);

  return (
    <section style={card}>
      <h2 style={{ marginTop: 0 }}>🗓️ {T[lang].calendar}</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <button
          style={btn}
          onClick={() => {
            const tk = todayKey();
            setSelectedDate(tk);
            const d = new Date(tk);
            setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
          }}
        >
          {T[lang].today}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={btn} onClick={() => setMonthDate(new Date(year, month - 1, 1))}>‹</button>
          <button style={btn} onClick={() => setMonthDate(new Date(year, month + 1, 1))}>›</button>
        </div>

        <b>{monthDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { month: 'long', year: 'numeric' })}</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #e2e8f0' }}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Za', 'Zo'].map((d, i) => (
          <div key={d} style={{ padding: 8, textAlign: 'center', color: i >= 5 ? '#dc2626' : '#0f172a', fontWeight: 800 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {cells.map((c, i) => {
          const isWeekend = i % 7 >= 5;
          const isHoliday = nlHolidays2026.some((h) => h.date === c.key);
          const isSelected = c.key === selectedDate;
          const hasEvent = events.some((e) => e.date === c.key);

          return (
            <button
              key={`${c.key}-${i}`}
              onClick={() => {
                setSelectedDate(c.key);
                addEventForDate(c.key);
              }}
              title={lang === 'de' ? 'Klicken = Termin erstellen' : 'Klikken = afspraak maken'}
              style={{
                height: 44,
                border: '1px solid #edf2f7',
                background: isSelected ? '#2563eb' : isHoliday ? '#fee2e2' : isWeekend ? '#fff1f2' : '#fff',
                color: isSelected ? '#fff' : isHoliday || isWeekend ? '#dc2626' : c.current ? '#0f172a' : '#94a3b8',
                borderRadius: isSelected ? 10 : 0,
                fontWeight: isSelected ? 900 : 700,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {c.day}
              {hasEvent && !isSelected && <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: 99, background: '#2563eb' }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {T[lang].appointmentsFor}{' '}
          {selected.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </h3>
        <button style={{ ...btn, color: '#2563eb' }} onClick={() => addEventForDate(selectedDate)}>+ {T[lang].newAppointment}</button>
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {dayEvents.map((e) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <b>{e.timeFrom} – {e.timeTo}</b>
            <div>
              <b>{eventIcon(e.type)} {e.title}</b>
              <div style={{ color: '#64748b' }}>{eventTypeLabel(e.type, lang)} · {e.location}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16, color: '#64748b', flexWrap: 'wrap' }}>
        <span><b style={{ background: '#dbeafe', padding: '3px 12px', borderRadius: 5 }} /> {T[lang].today}</span>
        <span><b style={{ background: '#ffe4e6', padding: '3px 12px', borderRadius: 5 }} /> {T[lang].weekend}</span>
        <span><b style={{ background: '#ef4444', padding: '3px 12px', borderRadius: 5 }} /> {T[lang].holidayNl}</span>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        🇳🇱 {T[lang].nextHoliday}: {new Date(holiday.date).toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL')} – {holiday.name}
      </div>
    </section>
  );
}

function TodoPanel({ lang, tasks, setTasks, addNotification }: { lang: Lang; tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; addNotification: (n: Omit<NotificationItem, 'id' | 'time' | 'unread'>) => void }) {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const filtered = tasks.filter((task) => filter === 'all' || task.status === filter);

  function addTask() {
    const title = prompt(lang === 'de' ? 'Neue Aufgabe:' : 'Nieuwe taak:');
    if (!title) return;

    setTasks((prev) => [{ id: makeId('task'), title, status: 'open', priority: 'normal', date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) }, ...prev]);

    addNotification({
      icon: '📋',
      title: lang === 'de' ? 'Neue Aufgabe erstellt' : 'Nieuwe taak aangemaakt',
      text: title,
      type: 'system',
    });
  }

  function toggleTask(task: Task) {
    setTasks((prev) => prev.map((item) => item.id === task.id ? { ...item, status: task.status === 'done' ? 'open' : 'done' } : item));
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>📋 {T[lang].todo}</h2>
        <button style={{ ...btn, color: '#2563eb' }} onClick={addTask}>+ {T[lang].newTask}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          ['all', T[lang].all],
          ['open', T[lang].open],
          ['progress', T[lang].progress],
          ['done', T[lang].done],
        ].map(([id, label]) => <button key={id} style={filter === id ? blueBtn : btn} onClick={() => setFilter(id as any)}>{label}</button>)}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map((task) => (
          <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: 10, alignItems: 'center', padding: 13, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <button onClick={() => toggleTask(task)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #cbd5e1', background: task.status === 'done' ? '#22c55e' : '#fff', color: '#fff', cursor: 'pointer' }}>{task.status === 'done' ? '✓' : ''}</button>
            <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#64748b' : '#0f172a' }}>{task.title}</span>
            <span style={{ fontSize: 12, borderRadius: 6, padding: '4px 8px', background: task.priority === 'important' ? '#fee2e2' : task.status === 'progress' ? '#fef3c7' : task.status === 'done' ? '#dcfce7' : '#dbeafe', color: task.priority === 'important' ? '#ef4444' : task.status === 'progress' ? '#d97706' : task.status === 'done' ? '#16a34a' : '#2563eb', fontWeight: 800 }}>{task.priority === 'important' ? T[lang].important : task.status === 'progress' ? T[lang].progress : task.status === 'done' ? T[lang].done : T[lang].open}</span>
            <span style={{ color: '#64748b' }}>{task.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function NotificationPanel({ lang, notifications, setNotifications }: { lang: Lang; notifications: NotificationItem[]; setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>> }) {
  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>🔔 {T[lang].notifications}</h2>
        <button style={{ border: 0, background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }} onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}>{T[lang].markAllRead}</button>
      </div>

      <div style={{ display: 'grid', gap: 10, maxHeight: 560, overflow: 'auto', paddingRight: 4 }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #e2e8f0', borderRadius: 14, background: n.unread ? '#f8fbff' : '#fff' }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: n.type === 'success' ? '#dcfce7' : n.type === 'production' ? '#fef3c7' : '#e8f2ff', display: 'grid', placeItems: 'center', fontSize: 22 }}>{n.icon}</div>
            <div><b>{n.title}</b><div style={{ color: '#64748b', fontSize: 14 }}>{n.text}</div></div>
            <div style={{ textAlign: 'right', color: '#64748b', fontSize: 13 }}>{n.time}{n.unread && <div style={{ width: 10, height: 10, borderRadius: 99, background: '#2563eb', marginLeft: 'auto', marginTop: 8 }} />}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AppointmentModal({
  lang,
  date,
  onClose,
  onSave,
}: {
  lang: Lang;
  date: string;
  onClose: () => void;
  onSave: (e: EventItem) => void;
}) {
  const [type, setType] = useState<EventType>('measurement');
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [location, setLocation] = useState('');
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('10:00');

  function save() {
    const finalTitle = title || `${eventTypeLabel(type, lang)} ${customer ? '– ' + customer : ''}`;

    onSave({
      id: makeId('ev'),
      title: finalTitle,
      customer,
      location,
      date,
      timeFrom,
      timeTo,
      type,
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
      <div style={{ ...card, width: 520 }}>
        <h2 style={{ marginTop: 0 }}>📅 {T[lang].newAppointment}</h2>
        <p style={{ color: '#64748b' }}>{new Date(date).toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            <b>{T[lang].selectType}</b>
            <select style={{ ...input, width: '100%' }} value={type} onChange={(e) => setType(e.target.value as EventType)}>
              <option value="measurement">{T[lang].measurement}</option>
              <option value="montage">{T[lang].montage}</option>
              <option value="production">{T[lang].production}</option>
              <option value="delivery">{T[lang].delivery}</option>
              <option value="customer">{T[lang].typeCustomer}</option>
            </select>
          </label>

          <label>
            <b>{T[lang].appointmentTitle}</b>
            <input style={{ ...input, width: '100%' }} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label>
            <b>{T[lang].customer}</b>
            <input style={{ ...input, width: '100%' }} value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </label>

          <label>
            <b>{T[lang].location}</b>
            <input style={{ ...input, width: '100%' }} value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label><b>{T[lang].from}</b><input type="time" style={{ ...input, width: '100%' }} value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} /></label>
            <label><b>{T[lang].to}</b><input type="time" style={{ ...input, width: '100%' }} value={timeTo} onChange={(e) => setTimeTo(e.target.value)} /></label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button style={btn} onClick={onClose}>{T[lang].cancel}</button>
          <button style={blueBtn} onClick={save}>✓ {T[lang].save}</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardModule({ lang = 'de', setModule, setLang }: { lang?: Lang; setModule: (m: Module) => void; setLang: (l: Lang) => void }) {
  const [now, setNow] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-06-30');
  const [modalDate, setModalDate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTasks(readArray<Task>(TASK_KEY, defaultTasks(lang)));
    setEvents(readArray<EventItem>(EVENT_KEY, defaultEvents(lang)));
    setNotifications(readArray<NotificationItem>(NOTIFICATION_KEY, defaultNotifications(lang)));
  }, [lang]);

  useEffect(() => { if (tasks.length) writeArray(TASK_KEY, tasks); }, [tasks]);
  useEffect(() => { if (events.length) writeArray(EVENT_KEY, events); }, [events]);
  useEffect(() => { if (notifications.length) writeArray(NOTIFICATION_KEY, notifications); }, [notifications]);

  function addNotification(n: Omit<NotificationItem, 'id' | 'time' | 'unread'>) {
    setNotifications((prev) => [{ ...n, id: makeId('not'), time: nowTime(), unread: true }, ...prev]);
  }

  useEffect(() => {
    const orders: any[] = readArray<any>(ORDER_KEY, []);
    const notified: string[] = readArray<string>(NOTIFIED_ORDERS_KEY, []);
    const newOrders = orders.filter((o) => o?.id && !notified.includes(o.id));

    if (newOrders.length > 0) {
      const created = newOrders.map((o) => o.id);
      localStorage.setItem(NOTIFIED_ORDERS_KEY, JSON.stringify([...notified, ...created]));

      setNotifications((prev) => [
        ...newOrders.map((o) => ({
          id: makeId('not'),
          icon: '🏠',
          title: T[lang].createdOrder,
          text: `${o.nummer || ''} ${o.kunde ? '– ' + o.kunde : ''}`,
          time: nowTime(),
          unread: true,
          type: 'order' as const,
        })),
        ...prev,
      ]);
    }
  }, [lang]);

  function saveEvent(e: EventItem) {
    setEvents((prev) => [...prev, e]);
    setModalDate(null);

    addNotification({
      icon: eventIcon(e.type),
      title: T[lang].eventCreated,
      text: `${e.title} · ${e.date} · ${e.timeFrom}`,
      type: 'calendar',
    });
  }

  return (
    <div style={app}>
      <aside style={sidebar}>
        <div style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid rgba(255,255,255,.75)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 22, marginBottom: 10 }}>D&I</div>
        {(Object.keys(moduleLabels) as Module[]).map((id) => (
          <button key={id} title={moduleLabels[id][lang]} style={id === 'dashboard' ? iconActive : iconBtn} onClick={() => setModule(id)}>
            {moduleLabels[id].icon}
          </button>
        ))}
      </aside>

      <main style={{ padding: '0 28px 18px 28px' }}>
        <header style={{ ...topbar, marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>D&I</div>
            <div><div style={{ fontSize: 30, fontWeight: 900 }}>Kunststoff Kozijnen</div><div style={{ fontSize: 17, fontWeight: 700 }}>und Rollläden</div></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900 }}>
                {now.toLocaleTimeString(lang === 'de' ? 'de-DE' : 'nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ color: '#475569' }}>
                {now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div><b>{T[lang].office}</b><div style={{ color: '#16a34a' }}>● {T[lang].online}</div></div>
            <input style={{ ...input, width: 250 }} placeholder={T[lang].search} />
            <button style={blueBtn} onClick={() => setLang(lang === "de" ? "nl" : "de")}>{lang === "de" ? "DE" : "NL"}</button>
          </div>
        </header>

        <section style={{ padding: '24px 0 18px' }}>
          <h1 style={{ margin: 0 }}>D&I Kozijnen ERP</h1>
          <p style={{ color: '#475569', marginTop: 6 }}>{T[lang].subtitle}</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.1fr 1.1fr', gap: 18, alignItems: 'start' }}>
          <CalendarPanel lang={lang} events={events} selectedDate={selectedDate} setSelectedDate={setSelectedDate} addEventForDate={(date) => setModalDate(date)} />
          <TodoPanel lang={lang} tasks={tasks} setTasks={setTasks} addNotification={addNotification} />
          <NotificationPanel lang={lang} notifications={notifications} setNotifications={setNotifications} />
        </section>

        <footer style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: 20, padding: '0 6px' }}>
          <span>© 2026 D&I Kunststoff Kozijnen B.V.</span>
          <span style={{ display: 'flex', gap: 28 }}>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{T[lang].privacy}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{T[lang].imprint}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{T[lang].settings}</button>
            <button style={{ border: 0, background: 'transparent', color: '#64748b' }}>{T[lang].help}</button>
          </span>
        </footer>
      </main>

      {modalDate && <AppointmentModal lang={lang} date={modalDate} onClose={() => setModalDate(null)} onSave={saveEvent} />}
    </div>
  );
}

