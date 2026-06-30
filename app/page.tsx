'use client';

import React, { useState } from 'react';

import DashboardModule from './DashboardModule';
import KundenModule from './KundenModule';
import AuftraegeModule from './AuftraegeModule';
import MontageModule from './MontageModule';
import ProduktionModule from './ProduktionModule';
import LagerModule from './LagerModule';
import LieferungModule from './LieferungModule';
import KalenderModule from './KalenderModule';
import MitarbeiterModule from './MitarbeiterModule';
import NachrichtenModule from './NachrichtenModule';

type Lang = 'de' | 'nl';

type Module =
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

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f3f7fc',
  color: '#0f172a',
  fontFamily: 'Arial, sans-serif',
};

const shell: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '96px 1fr',
  minHeight: '100vh',
};

const side: React.CSSProperties = {
  background: 'linear-gradient(180deg,#071b34,#10263d)',
  color: '#fff',
  padding: '18px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const logo: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 16,
  border: '2px solid rgba(255,255,255,.75)',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 900,
  fontSize: 22,
  marginBottom: 10,
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

const content: React.CSSProperties = {
  padding: '0 28px 28px',
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
  marginBottom: 22,
};

const input: React.CSSProperties = {
  height: 42,
  border: '1px solid #d7e0ec',
  borderRadius: 12,
  padding: '0 12px',
  background: '#fff',
};

const blueBtn: React.CSSProperties = {
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: '#fff',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const titles: Record<Module, { de: string; nl: string; icon: string }> = {
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

function Header({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header style={topbar}>
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
          <div style={{ color: '#475569' }}>
            {lang === 'de' ? 'Dienstag, 30. Juni 2026' : 'Dinsdag, 30 juni 2026'}
          </div>
        </div>

        <div>
          <b>{lang === 'de' ? 'Büro' : 'Kantoor'}</b>
          <div style={{ color: '#16a34a' }}>● Online</div>
        </div>

        <input style={{ ...input, width: 250 }} placeholder={lang === 'de' ? 'Suchen...' : 'Zoeken...'} />

        <button style={blueBtn} onClick={() => setLang(lang === 'de' ? 'nl' : 'de')}>
          {lang === 'de' ? 'DE' : 'NL'}
        </button>
      </div>
    </header>
  );
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');

  if (module === 'dashboard') {
    return <DashboardModule lang={lang} setModule={setModule} />;
  }

  return (
    <div style={page}>
      <div style={shell}>
        <aside style={side}>
          <div style={logo}>D&I</div>

          {(Object.keys(titles) as Module[]).map((id) => (
            <button
              key={id}
              title={titles[id][lang]}
              style={module === id ? iconActive : iconBtn}
              onClick={() => setModule(id)}
            >
              {titles[id].icon}
            </button>
          ))}
        </aside>

        <main style={content}>
          <Header lang={lang} setLang={setLang} />

          {module === 'customers' && <KundenModule lang={lang} />}
          {module === 'orders' && <AuftraegeModule lang={lang} />}
          {module === 'montage' && <MontageModule lang={lang} />}
          {module === 'production' && <ProduktionModule lang={lang} />}
          {module === 'stock' && <LagerModule lang={lang} />}
          {module === 'delivery' && <LieferungModule lang={lang} />}
          {module === 'calendar' && <KalenderModule lang={lang} />}
          {module === 'employees' && <MitarbeiterModule lang={lang} />}
          {module === 'messages' && <NachrichtenModule lang={lang} />}
        </main>
      </div>
    </div>
  );
}

