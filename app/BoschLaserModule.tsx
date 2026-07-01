'use client';

import React, { useMemo, useState } from 'react';

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

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe6f0',
  borderRadius: 16,
  padding: 16,
  margin: '10px 0',
  boxShadow: '0 6px 18px rgba(15,23,42,.05)',
};

const btn: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const blueBtn: React.CSSProperties = {
  ...btn,
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: '#fff',
};

const greenBtn: React.CSSProperties = {
  ...btn,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
};

const redBtn: React.CSSProperties = {
  ...btn,
  border: '1px solid #ef4444',
  background: '#ef4444',
  color: '#fff',
};

const input: React.CSSProperties = {
  width: '100%',
  height: 40,
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '0 10px',
  boxSizing: 'border-box',
  background: '#fff',
};

const TXT = {
  de: {
    title: 'Bosch UniversalDistance',
    subtitle: 'Messgerät vorbereiten, Werte übernehmen und später per Android-Bluetooth verbinden.',
    status: 'Status',
    device: 'Gerät',
    battery: 'Akku',
    active: 'Aktives Feld',
    last: 'Letzte Messung',
    history: 'Messhistorie',
    noHistory: 'Noch keine Messung.',
    connect: 'Bosch verbinden',
    connecting: 'Verbinde...',
    disconnect: 'Trennen',
    single: 'Einzelmessung',
    live: 'Live-Messung simulieren',
    stopLive: 'Live stoppen',
    repeat: 'Erneut übernehmen',
    manual: 'Manuellen Wert übernehmen',
    manualPlaceholder: 'z.B. 1234',
    webMode:
      'Web-Modus: echte Bluetooth-Verbindung ist im Browser eingeschränkt. Die echte Verbindung bauen wir später in der Android-App ein.',
    disconnected: 'Nicht verbunden',
    connected: 'Verbunden',
    connectingState: 'Verbindung läuft',
    saved: 'Wert wurde ins aktive Feld übernommen.',
  },
  nl: {
    title: 'Bosch UniversalDistance',
    subtitle: 'Meetapparaat voorbereiden, waarden overnemen en later via Android-Bluetooth verbinden.',
    status: 'Status',
    device: 'Apparaat',
    battery: 'Accu',
    active: 'Actief veld',
    last: 'Laatste meting',
    history: 'Meethistorie',
    noHistory: 'Nog geen meting.',
    connect: 'Bosch verbinden',
    connecting: 'Verbinden...',
    disconnect: 'Verbreken',
    single: 'Enkele meting',
    live: 'Live-meting simuleren',
    stopLive: 'Live stoppen',
    repeat: 'Opnieuw overnemen',
    manual: 'Handmatige waarde overnemen',
    manualPlaceholder: 'bijv. 1234',
    webMode:
      'Webmodus: echte Bluetooth-verbinding is in de browser beperkt. De echte verbinding bouwen wij later in de Android-app.',
    disconnected: 'Niet verbonden',
    connected: 'Verbonden',
    connectingState: 'Verbinding loopt',
    saved: 'Waarde is in het actieve veld overgenomen.',
  },
};

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowTime(lang: Lang) {
  return new Date().toLocaleTimeString(lang === 'de' ? 'de-DE' : 'nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function randomMeasure() {
  const values = [650, 720, 865, 980, 1050, 1234, 1450, 1487, 1620, 1920, 2100];
  return values[Math.floor(Math.random() * values.length)];
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

  const statusView = useMemo(() => {
    if (status === 'connected') {
      return {
        text: t.connected,
        color: '#16a34a',
        bg: '#dcfce7',
        icon: '🟢',
      };
    }

    if (status === 'connecting') {
      return {
        text: t.connectingState,
        color: '#d97706',
        bg: '#fef3c7',
        icon: '🟠',
      };
    }

    return {
      text: t.disconnected,
      color: '#b91c1c',
      bg: '#fee2e2',
      icon: '🔴',
    };
  }, [status, t]);

  function saveMeasure(value: number, rawText?: string) {
    const clean = Number(value);

    if (!Number.isFinite(clean) || clean <= 0) return;

    const raw = rawText || `${clean} mm`;

    setLastValue(clean);
    setBattery((prev) => Math.max(15, prev - 1));
    setInfo(t.saved);

    setHistory((prev) => [
      {
        id: makeId(),
        value: clean,
        raw,
        time: nowTime(lang),
      },
      ...prev.slice(0, 9),
    ]);

    onMeasure?.(clean, raw);
  }

  function connect() {
    setStatus('connecting');
    setInfo('');

    window.setTimeout(() => {
      setStatus('connected');
      setBattery(88);
      setInfo(t.webMode);
    }, 900);
  }

  function disconnect() {
    setStatus('disconnected');
    setLive(false);
    setInfo('');
  }

  function singleMeasure() {
    const value = randomMeasure();
    saveMeasure(value, `${value} mm`);
  }

  function manualMeasure() {
    const value = Number(String(manualValue).replace(',', '.'));

    if (!Number.isFinite(value) || value <= 0) return;

    saveMeasure(value, `${value} mm`);
    setManualValue('');
  }

  function repeatLast() {
    if (!lastValue) return;
    saveMeasure(lastValue, `${lastValue} mm`);
  }

  function toggleLive() {
    const next = !live;
    setLive(next);

    if (!next) return;

    const value = randomMeasure();
    saveMeasure(value, `${value} mm`);
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0 }}>📏 {t.title}</h3>
          <p style={{ color: '#64748b', marginBottom: 0 }}>{t.subtitle}</p>
        </div>

        <div
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            background: statusView.bg,
            color: statusView.color,
            fontWeight: 900,
            height: 38,
          }}
        >
          {statusView.icon} {statusView.text}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 10,
        }}
      >
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 12 }}>
          <b>{t.device}</b>
          <div style={{ color: '#0f172a', fontWeight: 900 }}>Bosch UniversalDistance</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>Bluetooth vorbereitet</div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 12 }}>
          <b>{t.battery}</b>
          <div style={{ color: battery > 25 ? '#16a34a' : '#ef4444', fontWeight: 900 }}>{battery}%</div>
          <div
            style={{
              height: 8,
              background: '#e2e8f0',
              borderRadius: 99,
              overflow: 'hidden',
              marginTop: 6,
            }}
          >
            <div
              style={{
                width: `${battery}%`,
                height: '100%',
                background: battery > 25 ? '#16a34a' : '#ef4444',
              }}
            />
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 12 }}>
          <b>{t.active}</b>
          <div style={{ color: '#2563eb', fontWeight: 900 }}>{activeFieldLabel}</div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 12 }}>
          <b>{t.last}</b>
          <div style={{ fontSize: 26, fontWeight: 900 }}>
            {lastValue !== null ? `${lastValue} mm` : '-'}
          </div>
        </div>
      </div>

      {info && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 12,
            background: '#eff6ff',
            color: '#1d4ed8',
            fontWeight: 800,
          }}
        >
          {info}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        {status === 'connected' ? (
          <button style={redBtn} onClick={disconnect}>
            🔌 {t.disconnect}
          </button>
        ) : (
          <button style={blueBtn} onClick={connect} disabled={status === 'connecting'}>
            🔵 {status === 'connecting' ? t.connecting : t.connect}
          </button>
        )}

        <button style={greenBtn} onClick={singleMeasure}>
          📐 {t.single}
        </button>

        <button style={btn} onClick={toggleLive}>
          {live ? `⏹️ ${t.stopLive}` : `📡 ${t.live}`}
        </button>

        <button style={btn} onClick={repeatLast} disabled={!lastValue}>
          🔁 {t.repeat}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
          marginTop: 12,
        }}
      >
        <input
          style={input}
          value={manualValue}
          inputMode="decimal"
          placeholder={t.manualPlaceholder}
          onChange={(e) => setManualValue(e.target.value)}
        />

        <button style={blueBtn} onClick={manualMeasure}>
          {t.manual}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 8 }}>🧾 {t.history}</h4>

        {history.length === 0 ? (
          <div style={{ color: '#64748b' }}>{t.noHistory}</div>
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
                  gap: 12,
                }}
                onClick={() => saveMeasure(item.value, item.raw)}
              >
                <span>
                  <b>{item.raw}</b>
                  <span style={{ color: '#64748b' }}> · {item.time}</span>
                </span>
                <span>↩ übernehmen</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
