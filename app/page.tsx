'use client';

import React, { useEffect, useState } from 'react';

import KundenModule from './KundenModule';
import MontageModule from './MontageModule';
import ProduktionModule from './ProduktionModule';
import AuftraegeModule from './AuftraegeModule';
import KalenderModule from './KalenderModule';
import LagerModule from './LagerModule';
import NachrichtenModule from './NachrichtenModule';
import MitarbeiterModule from './MitarbeiterModule';
import LieferungModule from './LieferungModule';

type Lang = 'de' | 'nl';

type Module =
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'production'
  | 'stock'
  | 'delivery'
  | 'montage'
  | 'calendar'
  | 'employees'
  | 'messages';

const app: React.CSSProperties = {
  minHeight: '100vh',
  background: '#eef2f7',
  display: 'grid',
  gridTemplateColumns: '82px 1fr',
  fontFamily: 'Arial, sans-serif',
  color: '#0f172a',
};

const side: React.CSSProperties = {
  background: '#111827',
  color: '#fff',
  padding: '18px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 14,
  position: 'sticky',
  top: 0,
  height: '100vh',
};

const logo: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 14,
  border: '2px solid #fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: 20,
  marginBottom: 8,
};

const iconBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  border: 0,
  borderRadius: 14,
  background: 'transparent',
  color: '#fff',
  fontSize: 22,
  cursor: 'pointer',
};

const main: React.CSSProperties = {
  padding: 24,
  overflowX: 'auto',
};

const header: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe3eb',
  borderRadius: 22,
  padding: '18px 22px',
  marginBottom: 22,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe3eb',
  borderRadius: 18,
  padding: 20,
  boxShadow: '0 6px 18px rgba(15,23,42,0.05)',
};

const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))',
  gap: 16,
  marginBottom: 18,
};

const statCard: React.CSSProperties = {
  ...card,
  minHeight: 92,
};

const search: React.CSSProperties = {
  height: 38,
  border: '1px solid #d7dde8',
  borderRadius: 12,
  padding: '0 12px',
  background: '#f8fafc',
  minWidth: 230,
};

const smallBtn: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '9px 12px',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

function moduleTitle(module: Module, lang: Lang) {
  const de: Record<Module, string> = {
    dashboard: 'Dashboard',
    customers: 'Kunden',
    orders: 'Aufträge',
    production: 'Produktion',
    stock: 'Lager',
    delivery: 'Lieferung',
    montage: 'Montage',
    calendar: 'Kalender',
    employees: 'Mitarbeiter',
    messages: 'Nachrichten',
  };

  const nl: Record<Module, string> = {
    dashboard: 'Dashboard',
    customers: 'Klanten',
    orders: 'Orders',
    production: 'Productie',
    stock: 'Magazijn',
    delivery: 'Levering',
    montage: 'Montage',
    calendar: 'Kalender',
    employees: 'Medewerkers',
    messages: 'Berichten',
  };

  return lang === 'de' ? de[module] : nl[module];
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateText = clock.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const timeText = clock.toLocaleTimeString(lang === 'de' ? 'de-DE' : 'nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={app}>
      <aside style={side} className="no-print">
        <div style={logo}>D&I</div>

        <button title="Dashboard" onClick={() => setModule('dashboard')} style={iconBtn}>🏠</button>
        <button title={lang === 'de' ? 'Kunden' : 'Klanten'} onClick={() => setModule('customers')} style={iconBtn}>👥</button>
        <button title={lang === 'de' ? 'Aufträge' : 'Orders'} onClick={() => setModule('orders')} style={iconBtn}>📋</button>
        <button title={lang === 'de' ? 'Produktion' : 'Productie'} onClick={() => setModule('production')} style={iconBtn}>🏭</button>
        <button title={lang === 'de' ? 'Lager' : 'Magazijn'} onClick={() => setModule('stock')} style={iconBtn}>📦</button>
        <button title={lang === 'de' ? 'Lieferung' : 'Levering'} onClick={() => setModule('delivery')} style={iconBtn}>🚚</button>
        <button title="Montage" onClick={() => setModule('montage')} style={iconBtn}>🔧</button>
        <button title={lang === 'de' ? 'Kalender' : 'Kalender'} onClick={() => setModule('calendar')} style={iconBtn}>📅</button>
        <button title={lang === 'de' ? 'Mitarbeiter' : 'Medewerkers'} onClick={() => setModule('employees')} style={iconBtn}>👷</button>
        <button title={lang === 'de' ? 'Nachrichten' : 'Berichten'} onClick={() => setModule('messages')} style={iconBtn}>💬</button>
      </aside>

      <main style={main}>
        <header style={header} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 42, fontWeight: 900 }}>D&I</div>
            <div>
              <div style={{ fontSize: 25, fontWeight: 900 }}>Kunststoff Kozijnen</div>
              <div style={{ color: '#64748b', fontWeight: 700 }}>
                {lang === 'de' ? 'und Rollläden' : 'en rolluiken'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{timeText}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{dateText}</div>
            </div>

            <div>
              <div style={{ fontWeight: 900 }}>{lang === 'de' ? 'Büro' : 'Kantoor'}</div>
              <div style={{ color: '#16a34a', fontSize: 13 }}>● Online</div>
            </div>

            <input style={search} placeholder={lang === 'de' ? 'Suchen...' : 'Zoeken...'} />

            <button style={smallBtn} onClick={() => setLang(lang === 'de' ? 'nl' : 'de')}>
              {lang === 'de' ? 'NL' : 'DE'}
            </button>
          </div>
        </header>

        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0 }}>
            {module === 'dashboard' ? 'D&I Kozijnen ERP' : moduleTitle(module, lang)}
          </h1>
          <div style={{ color: '#64748b', marginTop: 4 }}>
            {lang === 'de'
              ? 'Professionelle Verwaltung für Kunden, Aufträge, Produktion, Montage und Planung.'
              : 'Professioneel beheer voor klanten, orders, productie, montage en planning.'}
          </div>
        </div>

        {module === 'dashboard' && (
          <section>
            <div style={statGrid}>
              <div style={statCard}>
                <div style={{ fontSize: 28 }}>👥</div>
                <h3>{lang === 'de' ? 'Kunden' : 'Klanten'}</h3>
                <p style={{ color: '#64748b' }}>
                  {lang === 'de' ? 'Kundenverwaltung öffnen' : 'Klantenbeheer openen'}
                </p>
                <button style={smallBtn} onClick={() => setModule('customers')}>
                  {lang === 'de' ? 'Öffnen' : 'Openen'}
                </button>
              </div>

              <div style={statCard}>
                <div style={{ fontSize: 28 }}>📋</div>
                <h3>{lang === 'de' ? 'Aufträge' : 'Orders'}</h3>
                <p style={{ color: '#64748b' }}>
                  {lang === 'de' ? 'Aufträge verwalten' : 'Orders beheren'}
                </p>
                <button style={smallBtn} onClick={() => setModule('orders')}>
                  {lang === 'de' ? 'Öffnen' : 'Openen'}
                </button>
              </div>

              <div style={statCard}>
                <div style={{ fontSize: 28 }}>🔧</div>
                <h3>Montage</h3>
                <p style={{ color: '#64748b' }}>
                  {lang === 'de' ? 'Montagelisten pro Kunde' : 'Montagelijsten per klant'}
                </p>
                <button style={smallBtn} onClick={() => setModule('montage')}>
                  {lang === 'de' ? 'Öffnen' : 'Openen'}
                </button>
              </div>

              <div style={statCard}>
                <div style={{ fontSize: 28 }}>🏭</div>
                <h3>{lang === 'de' ? 'Produktion' : 'Productie'}</h3>
                <p style={{ color: '#64748b' }}>
                  {lang === 'de' ? 'Status und Zeichnungen' : 'Status en tekeningen'}
                </p>
                <button style={smallBtn} onClick={() => setModule('production')}>
                  {lang === 'de' ? 'Öffnen' : 'Openen'}
                </button>
              </div>
            </div>

            <div style={card}>
              <h2>{lang === 'de' ? 'Schnellstart' : 'Snelstart'}</h2>
              <p>
                {lang === 'de'
                  ? 'Wähle links ein Modul aus. Projekte wurden durch Aufträge ersetzt.'
                  : 'Kies links een module. Projecten zijn vervangen door orders.'}
              </p>
            </div>
          </section>
        )}

        {module === 'customers' && <KundenModule lang={lang} />}
        {module === 'orders' && <AuftraegeModule lang={lang} />}
        {module === 'production' && <ProduktionModule lang={lang} />}
        {module === 'stock' && <LagerModule lang={lang} />}
        {module === 'delivery' && <LieferungModule lang={lang} />}
        {module === 'montage' && <MontageModule lang={lang} />}
        {module === 'calendar' && <KalenderModule lang={lang} />}
        {module === 'employees' && <MitarbeiterModule lang={lang} />}
        {module === 'messages' && <NachrichtenModule lang={lang} />}
      </main>
    </div>
  );
}

