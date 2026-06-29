'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Lang = 'de' | 'nl';

type OrderStatus = 'open' | 'production' | 'montage' | 'done';

type Order = {
  id: string;
  nummer: string;
  kunde: string;
  referenz: string;
  adresse: string;
  ort: string;
  telefon: string;
  email: string;
  status: OrderStatus;
  bestelldatum: string;
  lieferdatum: string;
  montageDatum: string;
  produkt: string;
  beschreibung: string;
  notizen: string;
  fotos: string[];
};

const STORAGE_KEY = 'di_orders_v1';

const input: React.CSSProperties = {
  width: '100%',
  minHeight: 38,
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '0 10px',
  background: '#fff',
  boxSizing: 'border-box',
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 90,
  padding: 10,
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
  fontWeight: 700,
  cursor: 'pointer',
};

const danger: React.CSSProperties = {
  ...primary,
  background: '#dc2626',
};

const ghost: React.CSSProperties = {
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '10px 14px',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId() {
  return 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const n = String(Date.now()).slice(-5);
  return `AU-${y}${m}-${n}`;
}

function emptyOrder(lang: Lang): Order {
  return {
    id: makeId(),
    nummer: makeOrderNumber(),
    kunde: lang === 'de' ? 'Neuer Kunde' : 'Nieuwe klant',
    referenz: '',
    adresse: '',
    ort: '',
    telefon: '',
    email: '',
    status: 'open',
    bestelldatum: today(),
    lieferdatum: '',
    montageDatum: '',
    produkt: '',
    beschreibung: '',
    notizen: '',
    fotos: [],
  };
}

function statusLabel(status: OrderStatus, lang: Lang) {
  if (lang === 'de') {
    return status === 'open'
      ? '🔴 Offen'
      : status === 'production'
      ? '🟡 Produktion'
      : status === 'montage'
      ? '🔵 Montage'
      : '🟢 Fertig';
  }

  return status === 'open'
    ? '🔴 Open'
    : status === 'production'
    ? '🟡 Productie'
    : status === 'montage'
    ? '🔵 Montage'
    : '🟢 Klaar';
}

export default function AuftraegeModule({ lang = 'de' }: { lang?: Lang }) {
  const first = useMemo(() => emptyOrder(lang), [lang]);

  const [orders, setOrders] = useState<Order[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setOrders(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {
      // localStorage Fehler ignorieren
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const activeOrder = orders.find((o) => o.id === activeId) || orders[0];

  const filtered = orders.filter((o) => {
    const text = `${o.nummer} ${o.kunde} ${o.referenz} ${o.adresse} ${o.ort} ${o.telefon}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  function addOrder() {
    const order = emptyOrder(lang);
    setOrders((prev) => [order, ...prev]);
    setActiveId(order.id);
  }

  function updateOrder(key: keyof Order, value: any) {
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrder.id ? { ...o, [key]: value } : o))
    );
  }

  function deleteOrder() {
    if (!activeOrder) return;

    const ok = confirm(
      lang === 'de'
        ? 'Diesen Auftrag wirklich löschen?'
        : 'Deze order echt verwijderen?'
    );

    if (!ok) return;

    const next = orders.filter((o) => o.id !== activeOrder.id);

    if (!next.length) {
      const order = emptyOrder(lang);
      setOrders([order]);
      setActiveId(order.id);
      return;
    }

    setOrders(next);
    setActiveId(next[0].id);
  }

  function duplicateOrder() {
    if (!activeOrder) return;

    const copy: Order = {
      ...activeOrder,
      id: makeId(),
      nummer: makeOrderNumber(),
      kunde: activeOrder.kunde + (lang === 'de' ? ' Kopie' : ' Kopie'),
    };

    setOrders((prev) => [copy, ...prev]);
    setActiveId(copy.id);
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    );

    updateOrder('fotos', [...activeOrder.fotos, ...urls]);
  }

  function createMontageList() {
    const montage = {
      id: makeId(),
      kunde: activeOrder.kunde,
      referenz: activeOrder.referenz,
      adresse: activeOrder.adresse,
      ort: activeOrder.ort,
      telefon: activeOrder.telefon,
      orderNumber: activeOrder.nummer,
      createdAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem('di_montage_lists_v1');
    const old = raw ? JSON.parse(raw) : [];
    localStorage.setItem('di_montage_lists_v1', JSON.stringify([montage, ...old]));

    alert(
      lang === 'de'
        ? 'Montageliste wurde aus Auftrag erstellt.'
        : 'Montagelijst is gemaakt vanuit de order.'
    );
  }

  function printOrder() {
    window.print();
  }

  if (!activeOrder) return null;

  return (
    <section>
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={primary} onClick={addOrder}>
          + {lang === 'de' ? 'Neuer Auftrag' : 'Nieuwe order'}
        </button>

        <button style={ghost} onClick={duplicateOrder}>
          {lang === 'de' ? 'Kopieren' : 'Kopiëren'}
        </button>

        <button style={ghost} onClick={createMontageList}>
          🔧 {lang === 'de' ? 'Montageliste erstellen' : 'Montagelijst maken'}
        </button>

        <button style={ghost} onClick={printOrder}>
          🖨️ PDF
        </button>

        <button style={danger} onClick={deleteOrder}>
          {lang === 'de' ? 'Löschen' : 'Verwijderen'}
        </button>

        <input
          style={{ ...input, maxWidth: 260 }}
          placeholder={lang === 'de' ? 'Auftrag suchen...' : 'Order zoeken...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 18 }}>
        <aside className="no-print" style={card}>
          <h2 style={{ marginTop: 0 }}>{lang === 'de' ? 'Aufträge' : 'Orders'}</h2>

          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => setActiveId(o.id)}
                style={{
                  textAlign: 'left',
                  border: o.id === activeId ? '2px solid #2563eb' : '1px solid #d7dde8',
                  borderRadius: 12,
                  padding: 12,
                  background: o.id === activeId ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <b>{o.nummer}</b>
                <div>{o.kunde}</div>
                <small style={{ color: '#64748b' }}>{statusLabel(o.status, lang)}</small>
              </button>
            ))}
          </div>
        </aside>

        <main style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0 }}>
                {lang === 'de' ? 'Auftrag' : 'Order'} {activeOrder.nummer}
              </h2>
              <div style={{ color: '#64748b', marginTop: 4 }}>
                {statusLabel(activeOrder.status, lang)}
              </div>
            </div>

            <select
              style={{ ...input, maxWidth: 230 }}
              value={activeOrder.status}
              onChange={(e) => updateOrder('status', e.target.value as OrderStatus)}
            >
              <option value="open">{lang === 'de' ? 'Offen' : 'Open'}</option>
              <option value="production">{lang === 'de' ? 'Produktion' : 'Productie'}</option>
              <option value="montage">Montage</option>
              <option value="done">{lang === 'de' ? 'Fertig' : 'Klaar'}</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label>
              <b>{lang === 'de' ? 'Auftragsnummer' : 'Ordernummer'}</b>
              <input style={input} value={activeOrder.nummer} onChange={(e) => updateOrder('nummer', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Kunde' : 'Klant'}</b>
              <input style={input} value={activeOrder.kunde} onChange={(e) => updateOrder('kunde', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Referenz' : 'Referentie'}</b>
              <input style={input} value={activeOrder.referenz} onChange={(e) => updateOrder('referenz', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Telefon' : 'Telefoon'}</b>
              <input style={input} value={activeOrder.telefon} onChange={(e) => updateOrder('telefon', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Adresse' : 'Adres'}</b>
              <input style={input} value={activeOrder.adresse} onChange={(e) => updateOrder('adresse', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Ort' : 'Plaats'}</b>
              <input style={input} value={activeOrder.ort} onChange={(e) => updateOrder('ort', e.target.value)} />
            </label>

            <label>
              <b>E-Mail</b>
              <input style={input} value={activeOrder.email} onChange={(e) => updateOrder('email', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Produkt / Artikel' : 'Product / Artikel'}</b>
              <input style={input} value={activeOrder.produkt} onChange={(e) => updateOrder('produkt', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Bestelldatum' : 'Besteldatum'}</b>
              <input type="date" style={input} value={activeOrder.bestelldatum} onChange={(e) => updateOrder('bestelldatum', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Lieferdatum' : 'Leverdatum'}</b>
              <input type="date" style={input} value={activeOrder.lieferdatum} onChange={(e) => updateOrder('lieferdatum', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Montagedatum' : 'Montagedatum'}</b>
              <input type="date" style={input} value={activeOrder.montageDatum} onChange={(e) => updateOrder('montageDatum', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Fotos / Zeichnungen' : 'Foto’s / Tekeningen'}</b>
              <input type="file" accept="image/*,.pdf" multiple style={input} onChange={handlePhotos} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <label>
              <b>{lang === 'de' ? 'Beschreibung' : 'Beschrijving'}</b>
              <textarea style={textarea} value={activeOrder.beschreibung} onChange={(e) => updateOrder('beschreibung', e.target.value)} />
            </label>

            <label>
              <b>{lang === 'de' ? 'Notizen' : 'Notities'}</b>
              <textarea style={textarea} value={activeOrder.notizen} onChange={(e) => updateOrder('notizen', e.target.value)} />
            </label>
          </div>

          {activeOrder.fotos.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3>{lang === 'de' ? 'Anhänge' : 'Bijlagen'}</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {activeOrder.fotos.map((src, i) => (
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

