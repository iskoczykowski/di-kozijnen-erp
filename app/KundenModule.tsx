'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Lang = 'de' | 'nl';

type Customer = {
  id: string;
  name: string;
  referenz: string;
  email: string;
  telefon: string;
  adresse: string;
  plz: string;
  plaats: string;
  notizen: string;
  fotos: string[];
  dokumente: string[];
};

type OrderStatus = 'draft' | 'measurement' | 'offer' | 'production' | 'montage' | 'done';

type MeasureKey =
  | 'breite'
  | 'hoehe'
  | 'tiefe'
  | 'rahmenLinks'
  | 'rahmenRechts'
  | 'rahmenOben'
  | 'rahmenUnten'
  | 'fensterbankTiefe';

type Order = {
  id: string;
  nummer: string;
  kunde: string;
  referenz: string;
  adresse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  monteur: string;
  status: OrderStatus;
  erstelltAm: string;
  lieferdatum: string;
  montageDatum: string;
  produkt: string;
  foto: string;
  fotos: string[];
  dokumente: string[];
  notizen: string;
  deviceConnected: boolean;
  measures: Record<MeasureKey, number>;
  elements: {
    id: string;
    name: string;
    typ: string;
    fluegel: string;
    breite: number;
    hoehe: number;
    tiefe: number;
  }[];
};

const CUSTOMER_KEY = 'di_customers_v1';

// WICHTIG: Das ist der gleiche Speicher-Key wie im neuen AuftraegeModule.tsx
const ORDER_KEY = 'di_orders_professional_v2';

const input: React.CSSProperties = {
  width: '100%',
  minHeight: 40,
  border: '1px solid #d7dde8',
  borderRadius: 12,
  padding: '0 12px',
  background: '#fff',
  boxSizing: 'border-box',
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 100,
  padding: 12,
  resize: 'vertical',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe3eb',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 6px 18px rgba(15,23,42,0.05)',
};

const primary: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '10px 14px',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
};

const ghost: React.CSSProperties = {
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '10px 14px',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 800,
  cursor: 'pointer',
};

const danger: React.CSSProperties = {
  ...primary,
  background: '#dc2626',
};

function makeId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeOrderNumber() {
  const y = new Date().getFullYear();
  const n = String(Date.now()).slice(-4);
  return `A-${y}-${n}`;
}

function emptyCustomer(lang: Lang): Customer {
  return {
    id: makeId('cus'),
    name: lang === 'de' ? 'Neuer Kunde' : 'Nieuwe klant',
    referenz: '',
    email: '',
    telefon: '',
    adresse: '',
    plz: '',
    plaats: '',
    notizen: '',
    fotos: [],
    dokumente: [],
  };
}

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createOrderFromCustomer(customer: Customer): Order {
  return {
    id: makeId('ord'),
    nummer: makeOrderNumber(),

    // Kundendaten werden hier sauber übernommen
    kunde: customer.name || '',
    referenz: customer.referenz || '',
    adresse: customer.adresse || '',
    plz: customer.plz || '',
    ort: customer.plaats || '',
    telefon: customer.telefon || '',
    email: customer.email || '',

    monteur: 'Ireneusz Skoczykowski',
    status: 'measurement',
    erstelltAm: today(),
    lieferdatum: '',
    montageDatum: '',
    produkt: '',

    // Fotos/Dokumente vom Kunden werden direkt in den Auftrag übernommen
    foto: customer.fotos?.[0] || '',
    fotos: customer.fotos || [],
    dokumente: customer.dokumente || [],

    notizen: customer.notizen || '',
    deviceConnected: false,

    measures: {
      breite: 0,
      hoehe: 0,
      tiefe: 0,
      rahmenLinks: 0,
      rahmenRechts: 0,
      rahmenOben: 0,
      rahmenUnten: 0,
      fensterbankTiefe: 0,
    },

    elements: [
      {
        id: makeId('el'),
        name: 'Fenster 1',
        typ: 'Hauptfenster',
        fluegel: '1-flügelig',
        breite: 0,
        hoehe: 0,
        tiefe: 0,
      },
    ],
  };
}

export default function KundenModule({ lang = 'de' }: { lang?: Lang }) {
  const first = useMemo(() => emptyCustomer(lang), [lang]);

  const [customers, setCustomers] = useState<Customer[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setCustomers(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
  }, [customers]);

  const active = customers.find((c) => c.id === activeId) || customers[0];

  const filtered = customers.filter((c) => {
    const text = `${c.name} ${c.referenz} ${c.email} ${c.telefon} ${c.adresse} ${c.plz} ${c.plaats}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  function updateCustomer(key: keyof Customer, value: any) {
    setCustomers((prev) => prev.map((c) => (c.id === active.id ? { ...c, [key]: value } : c)));
  }

  function addCustomer() {
    const customer = emptyCustomer(lang);
    setCustomers((prev) => [customer, ...prev]);
    setActiveId(customer.id);
  }

  function deleteCustomer() {
    if (!active) return;
    const ok = confirm(lang === 'de' ? 'Kunde wirklich löschen?' : 'Klant echt verwijderen?');
    if (!ok) return;

    const next = customers.filter((c) => c.id !== active.id);
    if (!next.length) {
      const customer = emptyCustomer(lang);
      setCustomers([customer]);
      setActiveId(customer.id);
      return;
    }

    setCustomers(next);
    setActiveId(next[0].id);
  }

  async function filesToBase64(files: File[]) {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    );
  }

  async function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls = await filesToBase64(files);
    updateCustomer('fotos', [...active.fotos, ...urls]);
  }

  async function addDocuments(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls = await filesToBase64(files);
    updateCustomer('dokumente', [...active.dokumente, ...urls]);
  }

  function createOrder() {
    if (!active) return;

    const newOrder = createOrderFromCustomer(active);
    const oldOrders = readArray<Order>(ORDER_KEY);

    // Auftrag oben in die Liste setzen
    writeArray<Order>(ORDER_KEY, [newOrder, ...oldOrders]);

    alert(
      lang === 'de'
        ? `Auftrag ${newOrder.nummer} wurde für ${active.name} erstellt. Bitte jetzt links auf Aufträge klicken.`
        : `Order ${newOrder.nummer} is aangemaakt voor ${active.name}. Klik nu links op Orders.`
    );
  }

  if (!active) return null;

  return (
    <section>
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={primary} onClick={addCustomer}>
          + {lang === 'de' ? 'Neuer Kunde' : 'Nieuwe klant'}
        </button>

        <button style={ghost} onClick={createOrder}>
          📋 {lang === 'de' ? 'Auftrag erstellen' : 'Order maken'}
        </button>

        <button style={danger} onClick={deleteCustomer}>
          {lang === 'de' ? 'Löschen' : 'Verwijderen'}
        </button>

        <input
          style={{ ...input, maxWidth: 280 }}
          placeholder={lang === 'de' ? 'Kunde suchen...' : 'Klant zoeken...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 18 }}>
        <aside className="no-print" style={card}>
          <h2 style={{ marginTop: 0 }}>{lang === 'de' ? 'Kunden' : 'Klanten'}</h2>

          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                style={{
                  textAlign: 'left',
                  border: c.id === activeId ? '2px solid #2563eb' : '1px solid #d7dde8',
                  borderRadius: 12,
                  padding: 12,
                  background: c.id === activeId ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <b>{c.name}</b>
                <div style={{ color: '#64748b' }}>{c.plz} {c.plaats}</div>
                <small>{c.telefon}</small>
              </button>
            ))}
          </div>
        </aside>

        <main style={card}>
          <h2 style={{ marginTop: 0 }}>{lang === 'de' ? 'Kundendaten' : 'Klantgegevens'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label>
              <b>{lang === 'de' ? 'Name' : 'Naam'}</b>
              <input style={input} value={active.name} onChange={(e) => updateCustomer('name', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Referenz' : 'Referentie'}</b>
              <input style={input} value={active.referenz} onChange={(e) => updateCustomer('referenz', e.target.value)} />
            </label>

            <label>
              <b>E-Mail</b>
              <input style={input} value={active.email} onChange={(e) => updateCustomer('email', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Telefon' : 'Telefoon'}</b>
              <input style={input} value={active.telefon} onChange={(e) => updateCustomer('telefon', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / 3' }}>
              <b>{lang === 'de' ? 'Adresse' : 'Adres'}</b>
              <input style={input} value={active.adresse} onChange={(e) => updateCustomer('adresse', e.target.value)} />
            </label>

            <label>
              <b>PLZ</b>
              <input style={input} value={active.plz} onChange={(e) => updateCustomer('plz', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Ort' : 'Plaats'}</b>
              <input style={input} value={active.plaats} onChange={(e) => updateCustomer('plaats', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / 3' }}>
              <b>{lang === 'de' ? 'Notizen' : 'Notities'}</b>
              <textarea style={textarea} value={active.notizen} onChange={(e) => updateCustomer('notizen', e.target.value)} />
            </label>

            <label>
              <b>📷 {lang === 'de' ? 'Fotos' : 'Foto’s'}</b>
              <input type="file" multiple accept="image/*" style={input} onChange={addPhotos} />
            </label>

            <label>
              <b>📎 {lang === 'de' ? 'Dokumente / Zeichnungen' : 'Documenten / Tekeningen'}</b>
              <input type="file" multiple accept="image/*,.pdf,.xlsx,.xls" style={input} onChange={addDocuments} />
            </label>
          </div>
        </main>
      </div>
    </section>
  );
}

