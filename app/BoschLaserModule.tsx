'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Lang = 'de' | 'nl';

type Props = {
  lang?: Lang;
  activeFieldLabel?: string;
  onMeasure?: (millimeters: number, rawText?: string) => void;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

type MeasureItem = {
  id: string;
  value: number;
  raw: string;
  time: string;
};

const TXT = {
  de: {
    title: 'Bosch UniversalDistance',
    sub: 'Messgerät vorbereiten, Werte übernehmen und später per Android-Bluetooth verbinden.',
    statusDisconnected: 'Nicht verbunden',
    statusConnecting: 'Verbinde...',
    statusConnected: 'Verbunden',
    device: 'Gerät',
    battery: 'Akku',
    active: 'Aktives Feld',
    last: 'Letzte Messung',
    connect: 'Verbinden',
    disconnect: 'Trennen',
    single: 'Einzelmessung',
    live: 'Live-Messung',
    stop: 'Stoppen',
    repeat: 'Erneut übernehmen',
    manual: 'Manuell übernehmen',
    history: 'Messhistorie',
    noHistory: 'Noch keine Messung.',
    placeholder: 'z.B. 1234',
    webInfo:
      'Web-Modus: echte Bluetooth-Verbindung ist im Browser eingeschränkt. Die echte Bosch-Verbindung bauen wir später in der Android-App ein.',
    saved: 'Messwert wurde ins aktive Feld übernommen.',
  },
  nl: {
    title: 'Bosch UniversalDistance',
    sub: 'Meetapparaat voorbereiden, waarden overnemen en later via Android-Bluetooth verbinden.',
    statusDisconnected: 'Niet verbonden',
    statusConnecting: 'Verbinden...',
    statusConnected: 'Verbonden',
    device: 'Apparaat',
    battery: 'Accu',
    active: 'Actief veld',
    last: 'Laatste meting',
    connect: 'Verbinden',
    disconnect: 'Verbreken',
    single: 'Enkele meting',
    live: 'Live-meting',
    stop: 'Stoppen',
    repeat: 'Opnieuw overnemen',
    manual: 'Handmatig overnemen',
    history: 'Meethistorie',
    noHistory: 'Nog geen meting.',
    placeholder: 'bijv. 1234',
    webInfo:
      'Webmodus: echte Bluetooth-verbinding is in de browser beperkt. De echte Bosch-verbinding bouwen wij later in de Android-app.',
    saved: 'Meetwaarde is in het actieve veld overgenomen.',
  },
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe6f0',
  borderRadius: 16,
  padding: 14,
  margin: 0,
  boxShadow: '0 6px 18px rgba(15,23,42,.05)',
  minWidth: 0,
  overflow: 'hidden',
};

const btn: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: 10,
  padding: '9px 10px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 13,
};

const blueBtn: React.CSSProperties = {
  ...btn,
  borderColor: '#2563eb',
  background: '#2563eb',
  color: '#fff',
};

const greenBtn: React.CSSProperties = {
  ...btn,
  borderColor: '#16a34a',
  background: '#16a34a',
  color: '#fff',
};

const redBtn: React.CSSProperties = {
  ...btn,
  borderColor: '#ef4444',
  background: '#ef4444',
  color: '#fff',
};

const input: React.CSSProperties = {
  width: '100%',
  height: 38,
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '0 10px',
  boxSizing: 'border-box',
  background: '#fff',
};

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomMeasure() {
  const values = [650, 720, 865, 980, 1050, 1234, 1450, 1487, 1620, 1920, 2100];
  return values[Math.floor(Math.random() * values.length)];
}

function time(lang: Lang) {
  return new Date().toLocaleTimeString(lang === 'de' ? 'de-DE' : 'nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function BoschLaserModule({
  lang = 'de',
  activeFieldLabel = '-',
  onMeasure,
}: Props) {
  const t = TXT[lang];

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [battery, setBattery] = useState(88);
  const [lastValue, setLastValue] = useState<number | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [history, setHistory] = useState<MeasureItem[]>([]);
  const [live, setLive] = useState(false);
  const [info, setInfo] = useState('');

  const statusBox = useMemo(() => {
    if (status === 'connected') {
      return {
        text: t.statusConnected,
        bg: '#dcfce7',
        color: '#15803d',
        icon: '🟢',
      };
    }

    if (status === 'connecting') {
      return {
        text: t.statusConnecting,
        bg: '#fef3c7',
        color: '#b45309',
        icon: '🟠',
      };
    }

    return {
      text: t.statusDisconnected,
      bg: '#fee2e2',
      color: '#b91c1c',
      icon: '🔴',
    };
  }, [status, t]);

  function saveMeasure(value: number) {
    const clean = Number(value);

    if (!Number.isFinite(clean) || clean <= 0) return;

    const raw = `${clean} mm`;

    setLastValue(clean);
    setInfo(t.saved);
    setBattery((old) => Math.max(12, old - 1));

    setHistory((old) => [
      {
        id: makeId(),
        value: clean,
        raw,
        time: time(lang),
      },
      ...old.slice(0, 7),
    ]);

    onMeasure?.(clean, raw);
  }

  function connect() {
    setStatus('connecting');
    setInfo('');

    window.setTimeout(() => {
      setStatus('connected');
      setBattery(88);
      setInfo(t.webInfo);
    }, 700);
  }

  function disconnect() {
    setStatus('disconnected');
    setLive(false);
    setInfo('');
  }

  function singleMeasure() {
    saveMeasure(randomMeasure());
  }

  function manualMeasure() {
    const value = Number(String(manualValue).replace(',', '.'));

    if (!Number.isFinite(value) || value <= 0) return;

    saveMeasure(value);
    setManualValue('');
  }

  function repeatMeasure() {
    if (!lastValue) return;
    saveMeasure(lastValue);
  }

  useEffect(() => {
    if (!live) return;

    const timer = window.setInterval(() => {
      saveMeasure(randomMeasure());
    }, 2500);

    return () => window.clearInterval(timer);
  }, [live, lastValue, lang]);

  return (
    <section style={card}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.15 }}>📏 {t.title}</h3>
          <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: 14, lineHeight: 1.35 }}>{t.sub}</p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            alignItems: 'center',
            gap: 8,
            padding: '7px 11px',
            borderRadius: 999,
            background: statusBox.bg,
            color: statusBox.color,
            fontWeight: 900,
          }}
        >
          {statusBox.icon} {statusBox.text}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
            gap: 8,
          }}
        >
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
            <b>{t.device}</b>
            <div style={{ fontWeight: 900 }}>Bosch</div>
            <div style={{ fontWeight: 900 }}>UniversalDistance</div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
            <b>{t.battery}</b>
            <div style={{ color: battery > 25 ? '#15803d' : '#b91c1c', fontWeight: 900 }}>{battery}%</div>
            <div style={{ height: 7, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
              <div
                style={{
                  width: `${battery}%`,
                  height: '100%',
                  background: battery > 25 ? '#16a34a' : '#ef4444',
                }}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
            <b>{t.active}</b>
            <div style={{ color: '#2563eb', fontWeight: 900 }}>{activeFieldLabel}</div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
            <b>{t.last}</b>
            <div style={{ fontSize: 24, fontWeight: 900 }}>
              {lastValue !== null ? `${lastValue} mm` : '-'}
            </div>
          </div>
        </div>

        {info && (
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 800,
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            {info}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
            gap: 8,
          }}
        >
          {status === 'connected' ? (
            <button style={redBtn} onClick={disconnect}>
              🔌 {t.disconnect}
            </button>
          ) : (
            <button style={blueBtn} onClick={connect} disabled={status === 'connecting'}>
              🔵 {t.connect}
            </button>
          )}

          <button style={greenBtn} onClick={singleMeasure}>
            📐 {t.single}
          </button>

          <button
            style={live ? redBtn : btn}
            onClick={() => setLive((old) => !old)}
          >
            {live ? `⏹️ ${t.stop}` : `📡 ${t.live}`}
          </button>

          <button style={btn} onClick={repeatMeasure} disabled={!lastValue}>
            🔁 {t.repeat}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          <input
            style={input}
            value={manualValue}
            inputMode="decimal"
            placeholder={t.placeholder}
            onChange={(e) => setManualValue(e.target.value)}
          />

          <button style={blueBtn} onClick={manualMeasure}>
            ✍️ {t.manual}
          </button>
        </div>

        <div>
          <h4 style={{ margin: '4px 0 8px' }}>🧾 {t.history}</h4>

          {history.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 14 }}>{t.noHistory}</div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {history.map((item) => (
                <button
                  key={item.id}
                  style={{
                    ...btn,
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    fontSize: 12,
                  }}
                  onClick={() => saveMeasure(item.value)}
                >
                  <span>
                    <b>{item.raw}</b> · {item.time}
                  </span>
                  <span>↩</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
