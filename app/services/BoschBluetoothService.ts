'use client';

import React, { useEffect, useMemo, useState } from 'react';
import boschBluetoothService, {
  BoschConnectionStatus,
  BoschMeasurement,
} from './services/BoschBluetoothService';

type Lang = 'de' | 'nl';

type Props = {
  lang?: Lang;
  activeFieldLabel?: string;
  onMeasure?: (millimeters: number, rawText?: string) => void;
};

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
  padding: 14,
  margin: 0,
  boxShadow: '0 6px 18px rgba(15,23,42,.05)',
  minWidth: 0,
};

const btn: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: 10,
  padding: '9px 10px',
  fontWeight: 800,
  cursor: 'pointer',
  width: '100%',
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
  height: 38,
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '0 10px',
  boxSizing: 'border-box',
  background: '#fff',
};

const TXT = {
  de: {
    title: 'Bosch UniversalDistance',
    subtitle: 'Messgerät verbinden, Werte übernehmen und direkt ins Aufmaß eintragen.',
    status: 'Status',
    device: 'Gerät',
    battery: 'Akku',
    active: 'Aktives Feld',
    last: 'Letzte Messung',
    history: 'Messhistorie',
    noHistory: 'Noch keine Messung.',
    connect: 'Verbinden',
    connecting: 'Verbinde...',
    disconnect: 'Trennen',
    single: 'Einzelmessung',
    live: 'Live-Messung',
    stopLive: 'Live stoppen',
    repeat: 'Erneut übernehmen',
    manual: 'Manuell übernehmen',
    manualPlaceholder: 'z.B. 1234',
    unsupported:
      'Bluetooth wird von diesem Browser nicht unterstützt. Auf Android/Chrome kann es funktionieren, in der Web-Version bleibt Simulation möglich.',
    disconnected: 'Nicht verbunden',
    connected: 'Verbunden',
    searching: 'Suche Gerät',
    connectingState: 'Verbindung läuft',
    error: 'Fehler',
    idle: 'Bereit',
    saved: 'Wert übernommen.',
    simulation: 'Simulation aktiv. Später ersetzen wir das durch echte Bosch-Messwerte.',
  },
  nl: {
    title: 'Bosch UniversalDistance',
    subtitle: 'Meetapparaat verbinden, waarden overnemen en direct in de inmeting zetten.',
    status: 'Status',
    device: 'Apparaat',
    battery: 'Accu',
    active: 'Actief veld',
    last: 'Laatste meting',
    history: 'Meethistorie',
    noHistory: 'Nog geen meting.',
    connect: 'Verbinden',
    connecting: 'Verbinden...',
    disconnect: 'Verbreken',
    single: 'Enkele meting',
    live: 'Live-meting',
    stopLive: 'Live stoppen',
    repeat: 'Opnieuw overnemen',
    manual: 'Handmatig overnemen',
    manualPlaceholder: 'bijv. 1234',
    unsupported:
      'Bluetooth wordt door deze browser niet ondersteund. Op Android/Chrome kan het werken, in webmodus blijft simulatie mogelijk.',
    disconnected: 'Niet verbonden',
    connected: 'Verbonden',
    searching: 'Apparaat zoeken',
    connectingState: 'Verbinding loopt',
    error: 'Fout',
    idle: 'Klaar',
    saved: 'Waarde overgenomen.',
    simulation: 'Simulatie actief. Later vervangen wij dit door echte Bosch-meetwaarden.',
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

export default function BoschLaserModule({
  lang = 'de',
  activeFieldLabel = '-',
  onMeasure,
}: Props) {
  const t = TXT[lang];

  const [status, setStatus] = useState<BoschConnectionStatus>('idle');
  const [deviceName, setDeviceName] = useState('Bosch UniversalDistance');
  const [battery, setBattery] = useState<number | null>(null);
  const [lastValue, setLastValue] = useState<number | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [history, setHistory] = useState<MeasureItem[]>([]);
  const [live, setLive] = useState(false);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const removeStatus = boschBluetoothService.onStatus((nextStatus, message) => {
      setStatus(nextStatus);
      if (message) setInfo(message);
    });

    const removeMeasurement = boschBluetoothService.onMeasurement((measurement: BoschMeasurement) => {
      saveMeasure(measurement.millimeters, measurement.rawText);
    });

    setStatus(boschBluetoothService.getStatus());

    return () => {
      removeStatus();
      removeMeasurement();
      boschBluetoothService.stopSimulation();
    };
  }, []);

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

    if (status === 'searching') {
      return {
        text: t.searching,
        color: '#2563eb',
        bg: '#dbeafe',
        icon: '🔵',
      };
    }

    if (status === 'unsupported') {
      return {
        text: 'Web-Bluetooth fehlt',
        color: '#b45309',
        bg: '#fef3c7',
        icon: '🟡',
      };
    }

    if (status === 'error') {
      return {
        text: t.error,
        color: '#b91c1c',
        bg: '#fee2e2',
        icon: '🔴',
      };
    }

    if (status === 'disconnected') {
      return {
        text: t.disconnected,
        color: '#b91c1c',
        bg: '#fee2e2',
        icon: '🔴',
      };
    }

    return {
      text: t.idle,
      color: '#334155',
      bg: '#f1f5f9',
      icon: '⚪',
    };
  }, [status, t]);

  function saveMeasure(value: number, rawText?: string) {
    const clean = Math.round(Number(value));

    if (!Number.isFinite(clean) || clean <= 0) return;

    const raw = rawText || `${clean} mm`;

    setLastValue(clean);
    setInfo(t.saved);

    setHistory((prev) => [
      {
        id: makeId(),
        value: clean,
        raw,
        time: nowTime(lang),
      },
      ...prev.slice(0, 7),
    ]);

    onMeasure?.(clean, raw);
  }

  async function connect() {
    setInfo('');

    const device = await boschBluetoothService.connect();

    if (device) {
      setDeviceName(device.name || 'Bosch UniversalDistance');
      setBattery(typeof device.battery === 'number' ? device.battery : 88);
    }
  }

  async function disconnect() {
    setLive(false);
    await boschBluetoothService.disconnect();
  }

  function singleMeasure() {
    boschBluetoothService.simulateSingleMeasurement();
  }

  function manualMeasure() {
    const value = Number(String(manualValue).replace(',', '.'));

    if (!Number.isFinite(value) || value <= 0) return;

    boschBluetoothService.manualMeasurement(value);
    setManualValue('');
  }

  function repeatLast() {
    if (!lastValue) return;
    saveMeasure(lastValue, `${lastValue} mm`);
  }

  function toggleLive() {
    const next = !live;
    setLive(next);

    if (next) {
      setInfo(t.simulation);
      boschBluetoothService.startSimulation();
    } else {
      boschBluetoothService.stopSimulation();
    }
  }

  const isBusy = status === 'connecting' || status === 'searching';
  const isConnected = status === 'connected';

  return (
    <section style={card}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20 }}>📏 {t.title}</h3>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>
            {t.subtitle}
          </p>
        </div>

        <div
          style={{
            padding: '7px 10px',
            borderRadius: 999,
            background: statusView.bg,
            color: statusView.color,
            fontWeight: 900,
            width: 'fit-content',
            fontSize: 13,
          }}
        >
          {statusView.icon} {statusView.text}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 8,
        }}
      >
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
          <b>{t.device}</b>
          <div style={{ color: '#0f172a', fontWeight: 900 }}>{deviceName}</div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}>
          <b>{t.battery}</b>
          <div style={{ color: '#16a34a', fontWeight: 900 }}>
            {battery !== null ? `${battery}%` : '-'}
          </div>
          <div
            style={{
              height: 7,
              background: '#e2e8f0',
              borderRadius: 99,
              overflow: 'hidden',
              marginTop: 6,
            }}
          >
            <div
              style={{
                width: `${battery ?? 0}%`,
                height: '100%',
                background: '#16a34a',
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            {lastValue !== null ? `${lastValue} mm` : '-'}
          </div>
        </div>
      </div>

      {info && (
        <div
          style={{
            marginTop: 10,
            padding: 9,
            borderRadius: 12,
            background: '#eff6ff',
            color: '#1d4ed8',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          {info}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {isConnected ? (
          <button style={redBtn} onClick={disconnect}>
            🔌 {t.disconnect}
          </button>
        ) : (
          <button style={blueBtn} onClick={connect} disabled={isBusy}>
            🔵 {isBusy ? t.connecting : t.connect}
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
          gridTemplateColumns: '1fr',
          gap: 8,
          marginTop: 10,
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

      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
          🧾 {t.history}
        </summary>

        {history.length === 0 ? (
          <div style={{ color: '#64748b', marginTop: 8 }}>{t.noHistory}</div>
        ) : (
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
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
                onClick={() => saveMeasure(item.value, item.raw)}
              >
                <span>
                  <b>{item.raw}</b>
                  <span style={{ color: '#64748b' }}> · {item.time}</span>
                </span>
                <span>↩</span>
              </button>
            ))}
          </div>
        )}
      </details>
    </section>
  );
}
