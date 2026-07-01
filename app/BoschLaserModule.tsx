'use client';

import React from 'react';

type Lang = 'de' | 'nl';

type Props = {
  lang?: Lang;
  activeFieldLabel?: string;
  onMeasure?: (millimeters: number, rawText?: string) => void;
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe6f0',
  borderRadius: 16,
  padding: 16,
  margin: '10px 0',
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

const greyBtn: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

export default function BoschLaserModule({
  lang = 'de',
  activeFieldLabel = '-',
  onMeasure,
}: Props) {
  const isDe = lang === 'de';

  function testMeasure() {
    onMeasure?.(1234, '1234 mm');
  }

  return (
    <section style={card}>
      <h3 style={{ marginTop: 0 }}>📏 Bosch UniversalDistance 40 C</h3>

      <p style={{ color: '#64748b' }}>
        {isDe
          ? 'Web-Version: direkte Bluetooth-Verbindung ist hier deaktiviert. Die echte Bosch-Verbindung bauen wir in der Android-App.'
          : 'Webversie: directe Bluetooth-verbinding is hier uitgeschakeld. De echte Bosch-verbinding bouwen wij in de Android-app.'}
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <div>
          <b>{isDe ? 'Status' : 'Status'}:</b>{' '}
          <span style={{ color: '#d97706', fontWeight: 800 }}>
            ● {isDe ? 'Web-Modus' : 'Web-modus'}
          </span>
        </div>

        <div>
          <b>{isDe ? 'Aktives Feld' : 'Actief veld'}:</b> {activeFieldLabel}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          style={blueBtn}
          onClick={() =>
            alert(
              isDe
                ? 'Bluetooth kommt in die Android-App. In der Web-Version kannst du Maße manuell oder per Testwert übernehmen.'
                : 'Bluetooth komt in de Android-app. In de webversie kun je maten handmatig of via testwaarde overnemen.'
            )
          }
        >
          {isDe ? 'Android-Bluetooth vorbereiten' : 'Android-Bluetooth voorbereiden'}
        </button>

        <button style={greyBtn} onClick={testMeasure}>
          {isDe ? 'Testwert 1234 mm übernehmen' : 'Testwaarde 1234 mm overnemen'}
        </button>
      </div>
    </section>
  );
}

