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

type OrderLite = {
  id: string;
  nummer: string;
  kunde: string;
  referenz: string;
  adresse: string;
  ort: string;
  telefon: string;
  email?: string;
  status?: string;
  bestelldatum?: string;
  lieferdatum?: string;
  montageDatum?: string;
};

const CUSTOMER_KEY = 'di_customers_v1';
const ORDER_KEY = 'di_orders_v1';
const MONTAGE_KEY = 'di_montage_lists_v1';

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

function makeId() {
  return 'cus_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const n = String(Date.now()).slice(-5);
  return `AU-${y}${m}-${n}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyCustomer(lang: Lang): Customer {
  return {
    id: makeId(),
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

  const orders = readArray<OrderLite>(ORDER_KEY).filter(
    (o) => o.kunde === active?.name || o.telefon === active?.telefon || o.referenz === active?.referenz
  );

  const montageLists = readArray<any>(MONTAGE_KEY).filter(
    (m) => m.kunde === active?.name || m.telefon === active?.telefon || m.referenz === active?.referenz
  );

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
    const order: OrderLite = {
      id: 'ord_' + Date.now(),
      nummer: makeOrderNumber(),
      kunde: active.name,
      referenz: active.referenz,
      adresse: active.adresse,
      ort: `${active.plz} ${active.plaats}`.trim(),
      telefon: active.telefon,
      email: active.email,
      status: 'open',
      bestelldatum: today(),
      lieferdatum: '',
      montageDatum: '',
    };

    const old = readArray<OrderLite>(ORDER_KEY);
    writeArray(ORDER_KEY, [order, ...old]);

    alert(lang === 'de' ? 'Auftrag wurde erstellt.' : 'Order is aangemaakt.');
  }

  function createMontage() {
    const montage = {
      id: 'mon_' + Date.now(),
      kunde: active.name,
      referenz: active.referenz,
      adresse: active.adresse,
      ort: `${active.plz} ${active.plaats}`.trim(),
      telefon: active.telefon,
      createdAt: new Date().toISOString(),
    };

    const old = readArray<any>(MONTAGE_KEY);
    writeArray(MONTAGE_KEY, [montage, ...old]);

    alert(lang === 'de' ? 'Montageliste wurde erstellt.' : 'Montagelijst is aangemaakt.');
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

        <button style={ghost} onClick={createMontage}>
          🔧 {lang === 'de' ? 'Montageliste erstellen' : 'Montagelijst maken'}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 22 }}>
            <div style={card}>
              <h3>📋 {lang === 'de' ? 'Auftrag' : 'Order'}</h3>
              <p style={{ color: '#64748b' }}>
                {orders.length
                  ? `${orders.length} ${lang === 'de' ? 'verknüpft' : 'gekoppeld'}`
                  : lang === 'de'
                  ? 'Noch nicht verknüpft'
                  : 'Nog niet gekoppeld'}
              </p>
              <button style={ghost} onClick={createOrder}>
                {lang === 'de' ? 'Erstellen' : 'Maken'}
              </button>
            </div>

            <div style={card}>
              <h3>🏭 {lang === 'de' ? 'Produktion' : 'Productie'}</h3>
              <p style={{ color: '#64748b' }}>
                {orders.some((o) => o.status === 'production')
                  ? lang === 'de'
                    ? 'In Produktion'
                    : 'In productie'
                  : lang === 'de'
                  ? 'Noch nicht gestartet'
                  : 'Nog niet gestart'}
              </p>
            </div>

            <div style={card}>
              <h3>🔧 Montage</h3>
              <p style={{ color: '#64748b' }}>
                {montageLists.length
                  ? `${montageLists.length} ${lang === 'de' ? 'Liste(n)' : 'lijst(en)'}`
                  : lang === 'de'
                  ? 'Noch nicht verknüpft'
                  : 'Nog niet gekoppeld'}
              </p>
              <button style={ghost} onClick={createMontage}>
                {lang === 'de' ? 'Erstellen' : 'Maken'}
              </button>
            </div>

            <div style={card}>
              <h3>🧾 {lang === 'de' ? 'Rechnung' : 'Factuur'}</h3>
              <p style={{ color: '#64748b' }}>
                {lang === 'de' ? 'Später' : 'Later'}
              </p>
            </div>
          </div>

          {active.fotos.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>📷 {lang === 'de' ? 'Fotos' : 'Foto’s'}</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {active.fotos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Foto ${i + 1}`}
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid #d7dde8' }}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

