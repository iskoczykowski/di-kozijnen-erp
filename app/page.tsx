'use client';

export default function Page() {
  return (
    <div style={{ padding: 40 }}>
      <h1>D&I Kozijnen ERP</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20
        }}
      >
        {/* Kalender */}
        <div
          style={{
            background: '#dbeafe',
            borderRadius: 20,
            padding: 20,
            minHeight: 300
          }}
        >
          <h2>📅 Kalender / Kalender</h2>

          <p>• Terminvergabe</p>
          <p>• Montageplanung</p>
          <p>• Erinnerung 1 Tag vorher</p>

          <button>Neuer Termin</button>
        </div>

        {/* Offene Aufträge */}
        <div
          style={{
            background: '#fee2e2',
            borderRadius: 20,
            padding: 20,
            minHeight: 300
          }}
        >
          <h2>📋 Offene Aufträge / Openstaande opdrachten</h2>

          <p>Produktion</p>
          <p>Montage</p>
          <p>Lager</p>

          <button>Neue Aufgabe</button>
        </div>

        {/* Nachrichten */}
        <div
          style={{
            background: '#f3e8ff',
            borderRadius: 20,
            padding: 20,
            minHeight: 300
          }}
        >
          <h2>🔔 Nachrichten / Berichten</h2>

          <p>E-Mail</p>
          <p>WhatsApp</p>
          <p>Push-Benachrichtigungen</p>

          <button>Öffnen</button>
        </div>
      </div>
    </div>
  );
}
