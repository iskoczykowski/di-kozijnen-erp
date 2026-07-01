'use client';

import React, { useEffect, useState } from 'react';

import DashboardModule, { Lang, Module } from './DashboardModule';
import KundenModule from './KundenModule';
import AuftraegeModule from './AuftraegeModule';
import MontageModule from './MontageModule';
import ProduktionModule from './ProduktionModule';
import LagerModule from './LagerModule';
import LieferungModule from './LieferungModule';
import KalenderModule from './KalenderModule';
import MitarbeiterModule from './MitarbeiterModule';
import NachrichtenModule from './NachrichtenModule';

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

function useScreen() {
  const [width, setWidth] = useState(1400);

  useEffect(() => {
    function update() {
      setWidth(window.innerWidth);
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return {
    width,
    isTablet: width <= 1250,
    isMobile: width <= 760,
  };
}

function useClock(lang: Lang) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (!now) {
    return {
      time: '--:--',
      date: '',
    };
  }

  const locale = lang === 'de' ? 'de-DE' : 'nl-NL';

  return {
    time: now.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: now.toLocaleDateString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };
}

function Header({
  lang,
  setLang,
  isTablet,
  isMobile,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  isTablet: boolean;
  isMobile: boolean;
}) {
  const clock = useClock(lang);

  return (
    <header
      style={{
        background: '#fff',
        border: '1px solid #e7edf5',
        borderRadius: isMobile ? 14 : 18,
        padding: isMobile ? '12px' : isTablet ? '14px 16px' : '18px 26px',
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        boxShadow: '0 8px 24px rgba(15,23,42,.06)',
        marginBottom: 18,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 18 }}>
        <div style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2 }}>D&I</div>

        <div>
          <div style={{ fontSize: isMobile ? 20 : isTablet ? 24 : 30, fontWeight: 900 }}>
            Kunststoff Kozijnen
          </div>
          <div style={{ fontSize: isMobile ? 13 : 17, fontWeight: 700 }}>und Rollläden</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 16,
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          width: isMobile ? '100%' : 'auto',
        }}
      >
        <div style={{ textAlign: 'center', minWidth: isMobile ? 95 : 150 }}>
          <div style={{ fontSize: isMobile ? 24 : 34, fontWeight: 900 }}>{clock.time}</div>
          <div style={{ color: '#475569', fontSize: isMobile ? 11 : 14 }}>{clock.date}</div>
        </div>

        <div style={{ fontSize: isMobile ? 12 : 14 }}>
          <b>{lang === 'de' ? 'Büro' : 'Kantoor'}</b>
          <div style={{ color: '#16a34a' }}>● Online</div>
        </div>

        {!isMobile && (
          <input
            style={{
              height: 42,
              border: '1px solid #d7e0ec',
              borderRadius: 12,
              padding: '0 12px',
              background: '#fff',
              width: isTablet ? 170 : 250,
            }}
            placeholder={lang === 'de' ? 'Suchen...' : 'Zoeken...'}
          />
        )}

        <button
          style={{
            border: '1px solid #2563eb',
            background: '#2563eb',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 14px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          onClick={() => setLang(lang === 'de' ? 'nl' : 'de')}
        >
          {lang === 'de' ? 'DE' : 'NL'}
        </button>
      </div>
    </header>
  );
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');
  const { isTablet, isMobile } = useScreen();

  if (module === 'dashboard') {
    return <DashboardModule lang={lang} setLang={setLang} setModule={setModule} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        background: '#f3f7fc',
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '72px 1fr' : '96px 1fr',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {!isMobile && (
          <aside
            style={{
              background: 'linear-gradient(180deg,#071b34,#10263d)',
              color: '#fff',
              padding: isTablet ? '12px 8px' : '18px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                width: isTablet ? 50 : 64,
                height: isTablet ? 50 : 64,
                borderRadius: 16,
                border: '2px solid rgba(255,255,255,.75)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: isTablet ? 18 : 22,
                marginBottom: 10,
              }}
            >
              D&I
            </div>

            {(Object.keys(titles) as Module[]).map((id) => (
              <button
                key={id}
                title={titles[id][lang]}
                style={{
                  width: isTablet ? 48 : 56,
                  height: isTablet ? 48 : 56,
                  borderRadius: 14,
                  border: 0,
                  background: module === id ? '#2563eb' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: isTablet ? 21 : 24,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: module === id ? '0 12px 24px rgba(37,99,235,.3)' : 'none',
                }}
                onClick={() => setModule(id)}
              >
                {titles[id].icon}
              </button>
            ))}
          </aside>
        )}

        <main
          style={{
            padding: isMobile ? '10px 10px 88px' : isTablet ? '10px 12px 24px' : '0 28px 28px',
            minWidth: 0,
            width: '100%',
            overflowX: 'auto',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
          }}
        >
          <Header lang={lang} setLang={setLang} isTablet={isTablet} isMobile={isMobile} />

          <div
            style={{
              minWidth: isMobile ? 360 : isTablet ? 980 : 0,
              width: '100%',
            }}
          >
            {module === 'customers' && <KundenModule lang={lang} />}
            {module === 'orders' && <AuftraegeModule lang={lang} />}
            {module === 'montage' && <MontageModule lang={lang} />}
            {module === 'production' && <ProduktionModule lang={lang} />}
            {module === 'stock' && <LagerModule lang={lang} />}
            {module === 'delivery' && <LieferungModule lang={lang} />}
            {module === 'calendar' && <KalenderModule lang={lang} />}
            {module === 'employees' && <MitarbeiterModule lang={lang} />}
            {module === 'messages' && <NachrichtenModule lang={lang} />}
          </div>
        </main>
      </div>

      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 72,
            background: '#fff',
            borderTop: '1px solid #e7edf5',
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            zIndex: 50,
          }}
        >
          {(['dashboard', 'customers', 'orders', 'montage', 'production'] as Module[]).map((id) => (
            <button
              key={id}
              onClick={() => setModule(id)}
              style={{
                border: 0,
                background: module === id ? '#eff6ff' : '#fff',
                color: module === id ? '#2563eb' : '#334155',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              <div style={{ fontSize: 22 }}>{titles[id].icon}</div>
              {titles[id][lang]}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
