'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Lang = 'de' | 'nl';

type MeasurementKey =
  | 'breite'
  | 'hoehe'
  | 'tiefe'
  | 'rahmenLinks'
  | 'rahmenRechts'
  | 'rahmenOben'
  | 'rahmenUnten'
  | 'fensterbankTiefe';

type OrderStatus = 'measurement' | 'production' | 'montage' | 'done';

type ElementType = 'hauptfenster' | 'nebenfenster' | 'tuer' | 'schiebetuer';

type MeasureElement = {
  id: string;
  name: string;
  typ: ElementType;
  fluegel: string;
  breite: number;
  hoehe: number;
  tiefe: number;
};

type Order = {
  id: string;
  nummer: string;
  kunde: string;
  referenz: string;
  adresse: string;
  ort: string;
  telefon: string;
  monteur: string;
  status: OrderStatus;
  erstelltAm: string;
  activeArea: string;
  measures: Record<MeasurementKey, number>;
  elements: MeasureElement[];
  photo: string;
  notes: string;
  deviceConnected: boolean;
};

const STORAGE_KEY = 'di_orders_v2';

const labels = {
  de: {
    orders: 'Aufträge', measurement: 'Aufmaß', sketch: 'Skizze', summary: 'Zusammenfassung', customer: 'Kunde', address: 'Adresse',
    status: 'Status', created: 'Erstellt am', fitter: 'Monteur', areas: 'Bereiche im Auftrag', overview: 'Übersicht', photos: 'Fotos',
    drawings: 'Zeichnungen', production: 'Produktion', montage: 'Montage', invoice: 'Rechnung', notes: 'Notizen', files: 'Aufmaß Dateien',
    pdf: 'PDF Bericht erstellen', export: 'Aufmaß exportieren', connected: 'Verbunden', disconnected: 'Nicht verbunden', deviceConnected: 'Gerät verbunden',
    changeDevice: 'Gerät wechseln', disconnect: 'Trennen', measureValues: 'Maße erfassen', width: 'Breite', height: 'Höhe', depth: 'Tiefe',
    frameLeft: 'Rahmenbreite links', frameRight: 'Rahmenbreite rechts', frameTop: 'Rahmenbreite oben', frameBottom: 'Rahmenbreite unten',
    sillDepth: 'Fensterbank tiefe', measure: 'Messen', info: 'Drücken Sie auf „Messen“ und messen Sie mit dem Bosch. Der Wert wird automatisch übernommen.',
    photo: 'Foto', takePhoto: 'Foto aufnehmen', gallery: 'Aus Galerie wählen', elements: 'Elemente im Aufmaß', addElement: 'Element hinzufügen',
    order: 'Auftrag', reorder: 'Reihenfolge ändern', nr: 'Nr.', element: 'Element', type: 'Typ', widthMm: 'Breite (mm)',
    heightMm: 'Höhe (mm)', depthMm: 'Tiefe (mm)', actions: 'Aktionen', save: 'Aufmaß speichern', newOrder: 'Neuer Auftrag',
    searchOrder: 'Auftrag suchen...', running: 'Aufmaß läuft', battery: 'Batterie', serial: 'Seriennummer', darkMode: 'Dunkelmodus',
    settings: 'Einstellungen', timeTracking: 'Zeiterfassung', statistics: 'Statistiken', messages: 'Nachrichten', warehouse: 'Lager',
    employees: 'Mitarbeiter', delete: 'Löschen', edit: 'Bearbeiten', duplicate: 'Kopieren',
  },
  nl: {
    orders: 'Orders', measurement: 'Inmeten', sketch: 'Schets', summary: 'Samenvatting', customer: 'Klant', address: 'Adres',
    status: 'Status', created: 'Aangemaakt op', fitter: 'Monteur', areas: 'Onderdelen in order', overview: 'Overzicht', photos: 'Foto’s',
    drawings: 'Tekeningen', production: 'Productie', montage: 'Montage', invoice: 'Factuur', notes: 'Notities', files: 'Inmeet bestanden',
    pdf: 'PDF rapport maken', export: 'Inmeting exporteren', connected: 'Verbonden', disconnected: 'Niet verbonden', deviceConnected: 'Apparaat verbonden',
    changeDevice: 'Apparaat wisselen', disconnect: 'Verbreken', measureValues: 'Maten invoeren', width: 'Breedte', height: 'Hoogte', depth: 'Diepte',
    frameLeft: 'Kozijnbreedte links', frameRight: 'Kozijnbreedte rechts', frameTop: 'Kozijnbreedte boven', frameBottom: 'Kozijnbreedte onder',
    sillDepth: 'Vensterbank diepte', measure: 'Meten', info: 'Druk op „Meten“ en meet met de Bosch. De waarde wordt automatisch overgenomen.',
    photo: 'Foto', takePhoto: 'Foto maken', gallery: 'Uit galerij kiezen', elements: 'Elementen in inmeting', addElement: 'Element toevoegen',
    order: 'Order', reorder: 'Volgorde wijzigen', nr: 'Nr.', element: 'Element', type: 'Type', widthMm: 'Breedte (mm)',
    heightMm: 'Hoogte (mm)', depthMm: 'Diepte (mm)', actions: 'Acties', save: 'Inmeting opslaan', newOrder: 'Nieuwe order',
    searchOrder: 'Order zoeken...', running: 'Inmeting loopt', battery: 'Batterij', serial: 'Serienummer', darkMode: 'Donkere modus',
    settings: 'Instellingen', timeTracking: 'Tijdregistratie', statistics: 'Statistieken', messages: 'Berichten', warehouse: 'Magazijn',
    employees: 'Medewerkers', delete: 'Verwijderen', edit: 'Bewerken', duplicate: 'Kopiëren',
  },
};

const samplePhoto =
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayDe() {
  return new Date().toLocaleDateString('de-DE');
}

function makeOrderNumber() {
  const y = new Date().getFullYear();
  const n = String(Date.now()).slice(-4);
  return `A-${y}-${n}`;
}

function createElement(i = 1): MeasureElement {
  return {
    id: makeId(),
    name: i === 1 ? 'Wohnzimmer Fenster' : `Fenster ${i}`,
    typ: i === 1 ? 'hauptfenster' : 'nebenfenster',
    fluegel: i === 1 ? '2-flügelig' : '1-flügelig',
    breite: i === 1 ? 1234 : 890,
    hoehe: i === 1 ? 1487 : 1200,
    tiefe: 72,
  };
}

function createOrder(lang: Lang): Order {
  return {
    id: makeId(),
    nummer: makeOrderNumber(),
    kunde: 'Familie Jansen',
    referenz: '',
    adresse: 'Mittelweg 28A',
    ort: '47551 Bedburg-Hau',
    telefon: '',
    monteur: 'Ireneusz Skoczykowski',
    status: 'measurement',
    erstelltAm: todayDe(),
    activeArea: 'measurement',
    deviceConnected: true,
    photo: samplePhoto,
    notes: '',
    measures: {
      breite: 1234,
      hoehe: 1487,
      tiefe: 72,
      rahmenLinks: 65,
      rahmenRechts: 65,
      rahmenOben: 65,
      rahmenUnten: 85,
      fensterbankTiefe: 280,
    },
    elements: [createElement(1), { ...createElement(2), name: 'Küche Fenster', breite: 890, hoehe: 1200 }],
  };
}

const page: React.CSSProperties = { minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: '#f3f6fb', color: '#0f172a', fontFamily: 'Arial, sans-serif' };
const sidebar: React.CSSProperties = { background: 'linear-gradient(180deg,#061a36,#00152c)', color: '#fff', padding: '24px 18px', display: 'flex', flexDirection: 'column', minHeight: '100vh' };
const navBtn: React.CSSProperties = { border: 0, borderRadius: 9, background: 'transparent', color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, cursor: 'pointer', textAlign: 'left' };
const navActive: React.CSSProperties = { ...navBtn, background: '#0b73ff' };
const topbar: React.CSSProperties = { height: 68, background: '#fff', borderBottom: '1px solid #e5eaf2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' };
const content: React.CSSProperties = { padding: 22 };
const card: React.CSSProperties = { background: '#fff', border: '1px solid #dfe6f0', borderRadius: 12, boxShadow: '0 5px 16px rgba(15,23,42,0.05)' };
const btn: React.CSSProperties = { border: '1px solid #cbd7e8', background: '#fff', borderRadius: 8, padding: '10px 14px', fontWeight: 800, cursor: 'pointer' };
const blueBtn: React.CSSProperties = { ...btn, background: '#0b73ff', color: '#fff', border: '1px solid #0b73ff' };
const greenBtn: React.CSSProperties = { ...btn, background: '#11a847', color: '#fff', border: '1px solid #11a847' };
const redBtn: React.CSSProperties = { ...btn, color: '#ef4444', border: '1px solid #ffb4b4' };
const input: React.CSSProperties = { height: 40, width: '100%', border: '1px solid #dbe3ef', borderRadius: 9, padding: '0 10px', boxSizing: 'border-box' };

function measureRows(t: any) {
  return [
    ['breite', '↔️', t.width], ['hoehe', '↕️', t.height], ['tiefe', '↔️', t.depth], ['rahmenLinks', '↕️', t.frameLeft],
    ['rahmenRechts', '↔️', t.frameRight], ['rahmenOben', '↔️', t.frameTop], ['rahmenUnten', '↔️', t.frameBottom], ['fensterbankTiefe', '📐', t.sillDepth],
  ] as [MeasurementKey, string, string][];
}

export default function AuftraegeModule({ lang = 'de' }: { lang?: Lang }) {
  const t = labels[lang];
  const fileRef = useRef<HTMLInputElement | null>(null);
  const first = useMemo(() => createOrder(lang), [lang]);
  const [orders, setOrders] = useState<Order[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'measurement' | 'sketch' | 'summary'>('measurement');
  const [manualMeasure, setManualMeasure] = useState<MeasurementKey>('breite');

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
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const active = orders.find((o) => o.id === activeId) || orders[0];
  const filteredOrders = orders.filter((o) => `${o.nummer} ${o.kunde} ${o.adresse} ${o.ort}`.toLowerCase().includes(query.toLowerCase()));

  function updateOrder(patch: Partial<Order>) { setOrders((prev) => prev.map((o) => (o.id === active.id ? { ...o, ...patch } : o))); }
  function updateMeasure(key: MeasurementKey, value: number) { updateOrder({ measures: { ...active.measures, [key]: value } }); }

  function fakeMeasure(key: MeasurementKey) {
    const base: Record<MeasurementKey, number> = {
      breite: 900 + Math.round(Math.random() * 900), hoehe: 900 + Math.round(Math.random() * 900), tiefe: 60 + Math.round(Math.random() * 40),
      rahmenLinks: 55 + Math.round(Math.random() * 25), rahmenRechts: 55 + Math.round(Math.random() * 25), rahmenOben: 55 + Math.round(Math.random() * 25),
      rahmenUnten: 70 + Math.round(Math.random() * 35), fensterbankTiefe: 180 + Math.round(Math.random() * 160),
    };
    updateMeasure(key, base[key]);
  }

  function addOrder() { const o = createOrder(lang); setOrders((prev) => [o, ...prev]); setActiveId(o.id); }
  function addElement() { const next = createElement(active.elements.length + 1); next.breite = active.measures.breite; next.hoehe = active.measures.hoehe; next.tiefe = active.measures.tiefe; updateOrder({ elements: [...active.elements, next] }); }
  function updateElement(id: string, patch: Partial<MeasureElement>) { updateOrder({ elements: active.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)) }); }
  function deleteElement(id: string) { updateOrder({ elements: active.elements.filter((el) => el.id !== id) }); }
  function duplicateElement(el: MeasureElement) { updateOrder({ elements: [...active.elements, { ...el, id: makeId(), name: el.name + ' Kopie' }] }); }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); });
    updateOrder({ photo: url });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.nummer}-aufmass.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!active) return null;
  const half = Math.round(active.measures.breite / 2);

  return (
    <div style={page}>
      <aside style={sidebar} className="no-print">
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>D&I</div><div style={{ fontSize: 18, fontWeight: 800, marginBottom: 28 }}>Kozijnen</div>
        <button style={navBtn}>🏠 Dashboard</button><button style={navBtn}>👥 Kunden</button><button style={navActive}>📋 {t.orders}</button><button style={navBtn}>🏭 {t.production}</button><button style={navBtn}>🔧 Montage</button><button style={navBtn}>📅 Kalender</button><button style={navBtn}>✉️ {t.messages}</button><button style={navBtn}>⏱️ {t.timeTracking}</button><button style={navBtn}>👷 {t.employees}</button><button style={navBtn}>📦 {t.warehouse}</button><button style={navBtn}>📈 {t.statistics}</button><button style={navBtn}>⚙️ {t.settings}</button>
        <div style={{ marginTop: 'auto', fontSize: 13 }}><div style={{ marginBottom: 14 }}>🌙 {t.darkMode} <span style={{ float: 'right' }}>⚪</span></div><b>D&I Kozijnen ERP</b><div>Version 1.0.0</div></div>
      </aside>

      <main>
        <div style={topbar} className="no-print"><div style={{ fontWeight: 900, fontSize: 20 }}>{t.orders} <span style={{ color: '#64748b' }}>›</span> {active.nummer} <span style={{ color: '#64748b' }}>›</span> {t.measurement}</div><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><button style={btn}>🌐 DE</button><button style={btn}>NL</button><span>🔔 <b style={{ color: 'red' }}>3</b></span><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 38, height: 38, borderRadius: 99, background: '#0b73ff', color: '#fff', display: 'grid', placeItems: 'center' }}>👤</div><div><b>Ireneusz</b><div style={{ fontSize: 12, color: '#64748b' }}>Administrator</div></div></div></div></div>

        <div style={content}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
            <aside style={{ display: 'grid', gap: 14 }} className="no-print">
              <div style={{ ...card, padding: 20 }}><h3 style={{ marginTop: 0 }}>{t.order}</h3><div style={{ display: 'grid', gap: 13, fontSize: 14 }}><div>{lang === 'de' ? 'Auftragsnummer' : 'Ordernummer'}<br /><b style={{ color: '#0b73ff' }}>{active.nummer}</b></div><div>{t.customer}<br /><b>{active.kunde}</b></div><div>{t.address}<br /><b>{active.adresse}<br />{active.ort}</b></div><div>{t.status}<br /><b style={{ background: '#fde68a', borderRadius: 999, padding: '5px 9px', display: 'inline-block' }}>{t.running}</b></div><div>{t.created}<br /><b>{active.erstelltAm}</b></div><div>{t.fitter}<br /><b>{active.monteur}</b></div></div></div>
              <div style={{ ...card, padding: 20 }}><h3 style={{ marginTop: 0 }}>{t.areas}</h3>{[['overview','❖',t.overview],['measurement','📝',t.measurement],['photos','📷',t.photos],['drawings','🖊️',t.drawings],['production','🏭',t.production],['montage','🔧',t.montage],['invoice','🧾',t.invoice],['notes','📝',t.notes]].map(([id, icon, label]) => (<button key={id} onClick={() => updateOrder({ activeArea: id })} style={{ ...navBtn, color: '#0f172a', background: active.activeArea === id ? '#e8f2ff' : 'transparent', width: '100%' }}><span>{icon}</span>{label}</button>))}</div>
              <div style={{ ...card, padding: 20 }}><h3 style={{ marginTop: 0 }}>{t.files}</h3><button style={{ ...btn, width: '100%', color: '#0b73ff' }} onClick={() => window.print()}>📄 {t.pdf}</button><button style={{ ...btn, width: '100%', marginTop: 10 }} onClick={exportJson}>⬇️ {t.export}</button></div>
              <div style={{ ...card, padding: 20 }}><h3 style={{ marginTop: 0 }}>{t.orders}</h3><button style={{ ...blueBtn, width: '100%', marginBottom: 10 }} onClick={addOrder}>+ {t.newOrder}</button><input style={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchOrder} /><div style={{ display: 'grid', gap: 8, marginTop: 10 }}>{filteredOrders.slice(0, 5).map((o) => (<button key={o.id} onClick={() => setActiveId(o.id)} style={{ ...btn, textAlign: 'left', background: o.id === active.id ? '#e8f2ff' : '#fff', borderColor: o.id === active.id ? '#0b73ff' : '#cbd7e8' }}><b>{o.nummer}</b><br /><small>{o.kunde}</small></button>))}</div></div>
            </aside>

            <section style={card}>
              <div style={{ padding: 22 }}>
                <h2 style={{ marginTop: 0 }}>{t.measurement}</h2>
                <div style={{ border: '1px solid #dfe6f0', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}><div style={{ display: 'flex', gap: 20, alignItems: 'center' }}><div style={{ width: 74, height: 120, borderRadius: 10, background: 'linear-gradient(180deg,#133b25,#0a2017)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 28 }}>📏</div><div><h2 style={{ margin: 0 }}>Bosch UniversalDistance 40 C</h2><p><b>Status:</b> <span style={{ color: active.deviceConnected ? '#16a34a' : '#ef4444', fontWeight: 900 }}>● {active.deviceConnected ? t.connected : t.disconnected}</span></p><p><b>{t.battery}:</b> <span style={{ color: '#16a34a', fontWeight: 900 }}>● 80% 🔋</span></p><p><b>{t.serial}:</b> 123456789</p></div></div><div style={{ display: 'grid', gap: 10, minWidth: 260 }}><button style={{ ...btn, color: '#16a34a', borderColor: '#86efac' }} onClick={() => updateOrder({ deviceConnected: true })}>✓ {t.deviceConnected}</button><button style={btn}>⇄ {t.changeDevice}</button><button style={redBtn} onClick={() => updateOrder({ deviceConnected: false })}>⏻ {t.disconnect}</button></div></div>
                <div style={{ display: 'flex', gap: 22, borderBottom: '1px solid #dfe6f0', marginTop: 16 }}>{[['measurement',t.measurement],['sketch',t.sketch],['summary',t.summary]].map(([id,label]) => (<button key={id} onClick={() => setTab(id as any)} style={{ border: 0, background: 'transparent', padding: '14px 8px', borderBottom: tab === id ? '3px solid #0b73ff' : '3px solid transparent', color: tab === id ? '#0b73ff' : '#334155', fontWeight: 900, cursor: 'pointer' }}>{label}</button>))}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr 420px', gap: 0, borderBottom: '1px solid #e5eaf2' }}>
                  <div style={{ padding: 20, borderRight: '1px solid #e5eaf2' }}><h3>{t.measureValues} ⓘ</h3><div style={{ display: 'grid', gap: 8 }}>{measureRows(t).map(([key, icon, label]) => (<div key={key} style={{ display: 'grid', gridTemplateColumns: '42px 1fr 110px 98px', alignItems: 'center', gap: 8, border: '1px solid #e5eaf2', borderRadius: 9, padding: 8 }}><div style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center' }}>{icon}</div><b>{label}</b><input style={{ ...input, textAlign: 'right', fontWeight: 900, fontSize: 18 }} value={active.measures[key]} onChange={(e) => updateMeasure(key, Number(e.target.value) || 0)} /><button style={{ ...btn, color: '#0b73ff' }} onClick={() => fakeMeasure(key)}>⌁ {t.measure}</button></div>))}</div><div style={{ marginTop: 12, padding: 12, borderRadius: 9, background: '#eaf4ff', border: '1px solid #9cc9ff', color: '#0f4c81', fontSize: 14 }}>ℹ️ {t.info}</div><div style={{ marginTop: 12, display: 'flex', gap: 8 }}><select style={input} value={manualMeasure} onChange={(e) => setManualMeasure(e.target.value as MeasurementKey)}>{measureRows(t).map(([key,,label]) => <option key={key} value={key}>{label}</option>)}</select><button style={blueBtn} onClick={() => fakeMeasure(manualMeasure)}>{t.measure}</button></div></div>
                  <div style={{ padding: 20, borderRight: '1px solid #e5eaf2' }}><h3>{t.photo}</h3><div style={{ position: 'relative' }}><img src={active.photo} alt="Fenster" style={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 9, border: '1px solid #dfe6f0' }} /><button style={{ ...btn, position: 'absolute', right: 10, top: 10 }}>⛶</button></div><div style={{ display: 'flex', gap: 10, marginTop: 14 }}><input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onPhoto} /><button style={btn} onClick={() => fileRef.current?.click()}>📷 {t.takePhoto}</button><button style={btn} onClick={() => fileRef.current?.click()}>🖼️ {t.gallery}</button></div></div>
                  <div style={{ padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{t.sketch}</h3><button style={btn}>✎</button></div><div style={{ height: 390, display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid #e5eaf2', borderRadius: 9 }}><svg width="340" height="310" viewBox="0 0 340 310"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f7df6" /></marker></defs><line x1="55" y1="30" x2="285" y2="30" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" /><text x="170" y="24" textAnchor="middle" fontWeight="700">{active.measures.breite}</text><line x1="35" y1="60" x2="35" y2="245" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" /><text x="25" y="155" textAnchor="middle" fontWeight="700" transform="rotate(-90 25 155)">{active.measures.hoehe}</text><line x1="305" y1="60" x2="305" y2="245" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" /><text x="317" y="155" textAnchor="middle" fontWeight="700" transform="rotate(90 317 155)">{active.measures.hoehe}</text><rect x="60" y="58" width="220" height="190" fill="#fff" stroke="#333" strokeWidth="3" /><rect x="75" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2" /><rect x="177" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2" /><line x1="170" y1="58" x2="170" y2="248" stroke="#333" strokeWidth="2" /><line x1="78" y1="78" x2="160" y2="228" stroke="#eee" /><line x1="262" y1="78" x2="180" y2="228" stroke="#eee" /><circle cx="164" cy="155" r="3" fill="#333" /><circle cx="176" cy="155" r="3" fill="#333" /><line x1="75" y1="270" x2="163" y2="270" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" /><text x="119" y="292" textAnchor="middle" fontWeight="700">{half}</text><line x1="177" y1="270" x2="265" y2="270" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" /><text x="221" y="292" textAnchor="middle" fontWeight="700">{half}</text></svg></div></div>
                </div>

                <div style={{ padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><h3 style={{ margin: 0 }}>{t.elements}</h3><div style={{ display: 'flex', gap: 10 }}><button style={blueBtn} onClick={addElement}>+ {t.addElement}</button><button style={btn}>☷ {t.reorder}</button></div></div><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}><thead><tr style={{ textAlign: 'left', color: '#475569' }}><th style={{ padding: 10 }}>{t.nr}</th><th>{t.element}</th><th>{t.type}</th><th>{t.widthMm}</th><th>{t.heightMm}</th><th>{t.depthMm}</th><th>{t.actions}</th></tr></thead><tbody>{active.elements.map((el, i) => (<tr key={el.id} style={{ borderTop: '1px solid #e5eaf2' }}><td style={{ padding: 10 }}>{i + 1}</td><td><input style={{ ...input, height: 32 }} value={el.name} onChange={(e) => updateElement(el.id, { name: e.target.value })} /></td><td><select style={{ ...input, height: 32 }} value={el.typ} onChange={(e) => updateElement(el.id, { typ: e.target.value as ElementType })}><option value="hauptfenster">Hauptfenster</option><option value="nebenfenster">Nebenfenster</option><option value="tuer">Tür</option><option value="schiebetuer">Schiebetür</option></select></td><td><input style={{ ...input, height: 32, width: 90 }} value={el.breite} onChange={(e) => updateElement(el.id, { breite: Number(e.target.value) || 0 })} /></td><td><input style={{ ...input, height: 32, width: 90 }} value={el.hoehe} onChange={(e) => updateElement(el.id, { hoehe: Number(e.target.value) || 0 })} /></td><td><input style={{ ...input, height: 32, width: 90 }} value={el.tiefe} onChange={(e) => updateElement(el.id, { tiefe: Number(e.target.value) || 0 })} /></td><td><button title={t.edit} style={btn}>✎</button>{' '}<button title={t.duplicate} style={btn} onClick={() => duplicateElement(el)}>⧉</button>{' '}<button title={t.delete} style={redBtn} onClick={() => deleteElement(el.id)}>🗑</button></td></tr>))}</tbody></table><div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button style={greenBtn} onClick={() => alert(lang === 'de' ? 'Aufmaß gespeichert.' : 'Inmeting opgeslagen.')}>✓ {t.save}</button></div></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx global>{`@media print {.no-print { display: none !important; } body { background: white !important; } main { padding: 0 !important; }}`}</style>
    </div>
  );
}

