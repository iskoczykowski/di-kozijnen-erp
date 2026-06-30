'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import BoschLaserModule from "./BoschLaserModule";

<BoschLaserModule
  lang={lang}
  activeFieldLabel={measureRows(t).find(([key]) => key === measureTarget)?.[2]}
  onMeasure={(mm) => updateMeasure(measureTarget, mm)}
/>



type Lang = 'de' | 'nl';
type Tab = 'overview' | 'aufmass' | 'photos' | 'documents' | 'notes';
type OrderStatus = 'draft' | 'measurement' | 'offer' | 'production' | 'montage' | 'done';
type MeasureKey = 'breite' | 'hoehe' | 'tiefe' | 'rahmenLinks' | 'rahmenRechts' | 'rahmenOben' | 'rahmenUnten' | 'fensterbankTiefe';

type ElementItem = {
  id: string;
  name: string;
  typ: string;
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
  elements: ElementItem[];
};

const STORAGE_KEY = 'di_orders_professional_v2';

const T = {
  de: {
    title: 'Aufträge',
    newOrder: 'Neuer Auftrag',
    search: 'Auftrag suchen...',
    order: 'Auftrag',
    customer: 'Kunde',
    reference: 'Referenz',
    address: 'Adresse',
    zip: 'PLZ',
    city: 'Ort',
    phone: 'Telefon',
    email: 'E-Mail',
    fitter: 'Monteur',
    created: 'Erstellt am',
    deliveryDate: 'Lieferdatum',
    montageDate: 'Montagedatum',
    product: 'Produkt / Artikel',
    status: 'Status',
    overview: 'Übersicht',
    measurement: 'Aufmaß',
    photos: 'Fotos',
    documents: 'Dokumente',
    notes: 'Notizen',
    save: 'Speichern',
    delete: 'Löschen',
    duplicate: 'Kopieren',
    print: 'PDF drucken',
    export: 'Export',
    device: 'Bosch UniversalDistance 40 C',
    connected: 'Verbunden',
    disconnected: 'Nicht verbunden',
    battery: 'Batterie',
    serial: 'Seriennummer',
    connect: 'Gerät verbinden',
    disconnect: 'Trennen',
    changeDevice: 'Gerät wechseln',
    measures: 'Maße erfassen',
    width: 'Breite',
    height: 'Höhe',
    depth: 'Tiefe',
    frameLeft: 'Rahmenbreite links',
    frameRight: 'Rahmenbreite rechts',
    frameTop: 'Rahmenbreite oben',
    frameBottom: 'Rahmenbreite unten',
    sillDepth: 'Fensterbank Tiefe',
    measure: 'Messen',
    measureInfo: 'Jetzt ist es vorbereitet. Später verbinden wir hier den Bosch-Laser direkt per Bluetooth.',
    photo: 'Foto',
    takePhoto: 'Foto aufnehmen',
    gallery: 'Aus Galerie wählen',
    sketch: 'Skizze',
    elements: 'Elemente im Aufmaß',
    addElement: 'Element hinzufügen',
    nr: 'Nr.',
    element: 'Element',
    type: 'Typ',
    widthMm: 'Breite (mm)',
    heightMm: 'Höhe (mm)',
    depthMm: 'Tiefe (mm)',
    actions: 'Aktionen',
    allInOrder: 'Fotos, Maße, Skizze und Dokumente bleiben direkt im Auftrag gespeichert.',
    noDocs: 'Noch keine Dokumente hochgeladen.',
    noPhotos: 'Noch keine Fotos hochgeladen.',
    uploadPhotos: 'Fotos hochladen',
    uploadDocs: 'Dokumente / Zeichnungen hochladen',
  },
  nl: {
    title: 'Orders',
    newOrder: 'Nieuwe order',
    search: 'Order zoeken...',
    order: 'Order',
    customer: 'Klant',
    reference: 'Referentie',
    address: 'Adres',
    zip: 'Postcode',
    city: 'Plaats',
    phone: 'Telefoon',
    email: 'E-mail',
    fitter: 'Monteur',
    created: 'Aangemaakt op',
    deliveryDate: 'Leverdatum',
    montageDate: 'Montagedatum',
    product: 'Product / Artikel',
    status: 'Status',
    overview: 'Overzicht',
    measurement: 'Inmeting',
    photos: 'Foto’s',
    documents: 'Documenten',
    notes: 'Notities',
    save: 'Opslaan',
    delete: 'Verwijderen',
    duplicate: 'Kopiëren',
    print: 'PDF afdrukken',
    export: 'Export',
    device: 'Bosch UniversalDistance 40 C',
    connected: 'Verbonden',
    disconnected: 'Niet verbonden',
    battery: 'Batterij',
    serial: 'Serienummer',
    connect: 'Apparaat verbinden',
    disconnect: 'Verbreken',
    changeDevice: 'Apparaat wisselen',
    measures: 'Maten invoeren',
    width: 'Breedte',
    height: 'Hoogte',
    depth: 'Diepte',
    frameLeft: 'Kozijnbreedte links',
    frameRight: 'Kozijnbreedte rechts',
    frameTop: 'Kozijnbreedte boven',
    frameBottom: 'Kozijnbreedte onder',
    sillDepth: 'Vensterbank diepte',
    measure: 'Meten',
    measureInfo: 'Dit is voorbereid. Later koppelen wij de Bosch laser direct via Bluetooth.',
    photo: 'Foto',
    takePhoto: 'Foto maken',
    gallery: 'Uit galerij kiezen',
    sketch: 'Schets',
    elements: 'Elementen in inmeting',
    addElement: 'Element toevoegen',
    nr: 'Nr.',
    element: 'Element',
    type: 'Type',
    widthMm: 'Breedte (mm)',
    heightMm: 'Hoogte (mm)',
    depthMm: 'Diepte (mm)',
    actions: 'Acties',
    allInOrder: 'Foto’s, maten, schets en documenten blijven direct in deze order opgeslagen.',
    noDocs: 'Nog geen documenten geüpload.',
    noPhotos: 'Nog geen foto’s geüpload.',
    uploadPhotos: 'Foto’s uploaden',
    uploadDocs: 'Documenten / tekeningen uploaden',
  },
};

const input: React.CSSProperties = { width:'100%', minHeight:38, border:'1px solid #d7dde8', borderRadius:10, padding:'0 10px', background:'#fff', boxSizing:'border-box' };
const textarea: React.CSSProperties = { ...input, minHeight:120, padding:12, resize:'vertical' };
const card: React.CSSProperties = { background:'#fff', border:'1px solid #dfe6f0', borderRadius:16, boxShadow:'0 5px 16px rgba(15,23,42,0.05)' };
const btn: React.CSSProperties = { border:'1px solid #cbd7e8', background:'#fff', borderRadius:10, padding:'10px 14px', fontWeight:800, cursor:'pointer' };
const blueBtn: React.CSSProperties = { ...btn, background:'#0b73ff', color:'#fff', border:'1px solid #0b73ff' };
const greenBtn: React.CSSProperties = { ...btn, background:'#16a34a', color:'#fff', border:'1px solid #16a34a' };
const redBtn: React.CSSProperties = { ...btn, color:'#ef4444', border:'1px solid #ffb4b4' };

function makeId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function today(){ return new Date().toISOString().slice(0,10); }
function orderNo(){ return `A-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`; }

function emptyElement(i=1): ElementItem {
  return { id:makeId(), name:i===1?'Wohnzimmer Fenster':`Fenster ${i}`, typ:i===1?'Hauptfenster':'Nebenfenster', fluegel:i===1?'2-flügelig':'1-flügelig', breite:i===1?1234:890, hoehe:i===1?1487:1200, tiefe:72 };
}

function emptyOrder(lang: Lang): Order {
  return {
    id: makeId(), nummer: orderNo(), kunde: lang==='de'?'Neuer Kunde':'Nieuwe klant', referenz:'', adresse:'', plz:'', ort:'', telefon:'', email:'', status:'measurement',
    monteur:'Ireneusz Skoczykowski', erstelltAm:today(), lieferdatum:'', montageDatum:'', produkt:'', foto:'', fotos:[], dokumente:[], notizen:'', deviceConnected:false,
    measures:{ breite:1234, hoehe:1487, tiefe:72, rahmenLinks:65, rahmenRechts:65, rahmenOben:65, rahmenUnten:85, fensterbankTiefe:280 },
    elements:[emptyElement(1)]
  };
}

function statusLabel(status: OrderStatus, lang: Lang) {
  const de:any = { draft:'Entwurf', measurement:'Aufmaß läuft', offer:'Angebot', production:'Produktion', montage:'Montage', done:'Fertig' };
  const nl:any = { draft:'Concept', measurement:'Inmeting loopt', offer:'Offerte', production:'Productie', montage:'Montage', done:'Klaar' };
  return (lang==='de'?de:nl)[status];
}

function measureRows(t:any) {
  return [
    ['breite','↔️',t.width], ['hoehe','↕️',t.height], ['tiefe','↔️',t.depth], ['rahmenLinks','↕️',t.frameLeft],
    ['rahmenRechts','↔️',t.frameRight], ['rahmenOben','↔️',t.frameTop], ['rahmenUnten','↔️',t.frameBottom], ['fensterbankTiefe','📐',t.sillDepth],
  ] as [MeasureKey,string,string][];
}

async function filesToBase64(files: File[]) {
  return Promise.all(files.map(file => new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  })));
}


function BoschLaserPanel({ lang, onMeasure, selectedLabel }: { lang: Lang; onMeasure: (mm: number) => void; selectedLabel: string }) {
  const [supported, setSupported] = useState(true);
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('Bosch UniversalDistance 40 C');
  const [battery, setBattery] = useState<string>('?');
  const [lastValue, setLastValue] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [server, setServer] = useState<any>(null);

  const boschService = '02a6c0d0-0451-4000-b000-fb3210111989';

  function addLog(text: string) {
    setLog((prev) => [text, ...prev].slice(0, 6));
  }

  function decodeMeasure(view: DataView): number | null {
    const bytes = Array.from(new Uint8Array(view.buffer)).map((b) => b.toString(16).padStart(2, '0')).join(' ');

    try {
      const text = new TextDecoder().decode(view.buffer);
      const match = text.match(/([0-9]+[\.,]?[0-9]*)\s*(mm|cm|m)?/i);
      if (match) {
        let value = Number(match[1].replace(',', '.'));
        const unit = (match[2] || 'm').toLowerCase();
        if (unit === 'm') value = value * 1000;
        if (unit === 'cm') value = value * 10;
        if (unit === 'mm') value = value;
        if (value > 0 && value < 100000) return Math.round(value);
      }
    } catch {}

    try {
      if (view.byteLength >= 4) {
        const f = view.getFloat32(0, true);
        if (f > 0 && f < 100) return Math.round(f * 1000);
        const u32 = view.getUint32(0, true);
        if (u32 > 0 && u32 < 100000) return u32;
        const i32 = view.getInt32(0, true);
        if (i32 > 0 && i32 < 100000) return i32;
      }
      if (view.byteLength >= 2) {
        const u16 = view.getUint16(0, true);
        if (u16 > 0 && u16 < 100000) return u16;
      }
    } catch {}

    addLog('Rohdaten: ' + bytes);
    return null;
  }

  async function connect() {
    try {
      if (!(navigator as any).bluetooth) {
        setSupported(false);
        alert(lang === 'de' ? 'Web Bluetooth wird in diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.' : 'Web Bluetooth wordt niet ondersteund. Gebruik Chrome of Edge.');
        return;
      }

      addLog(lang === 'de' ? 'Bluetooth Suche gestartet...' : 'Bluetooth zoeken gestart...');

      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'battery_service',
          'device_information',
          boschService,
          '0000180f-0000-1000-8000-00805f9b34fb',
          '0000180a-0000-1000-8000-00805f9b34fb'
        ],
      });

      setDeviceName(device.name || 'Bosch Laser');
      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false);
        addLog(lang === 'de' ? 'Gerät getrennt' : 'Apparaat verbroken');
      });

      const gattServer = await device.gatt.connect();
      setServer(gattServer);
      setConnected(true);
      addLog(lang === 'de' ? 'Verbunden' : 'Verbonden');

      try {
        const batService = await gattServer.getPrimaryService('battery_service');
        const batChar = await batService.getCharacteristic('battery_level');
        const batVal = await batChar.readValue();
        setBattery(String(batVal.getUint8(0)) + '%');
      } catch {
        setBattery('?');
      }

      const services = await gattServer.getPrimaryServices();
      addLog((lang === 'de' ? 'Dienste gefunden: ' : 'Services gevonden: ') + services.length);

      for (const service of services) {
        let chars: any[] = [];
        try { chars = await service.getCharacteristics(); } catch { continue; }
        for (const char of chars) {
          try {
            if (char.properties.notify || char.properties.indicate) {
              await char.startNotifications();
              char.addEventListener('characteristicvaluechanged', (event: any) => {
                const value = event.target.value as DataView;
                const mm = decodeMeasure(value);
                if (mm) {
                  setLastValue(mm);
                  onMeasure(mm);
                  addLog((lang === 'de' ? 'Messwert übernommen: ' : 'Meetwaarde overgenomen: ') + mm + ' mm');
                }
              });
              addLog(lang === 'de' ? 'Messwert-Kanal aktiv' : 'Meetkanaal actief');
            }
          } catch {}

          try {
            if (char.properties.read) {
              const value = await char.readValue();
              const mm = decodeMeasure(value);
              if (mm) {
                setLastValue(mm);
                onMeasure(mm);
              }
            }
          } catch {}
        }
      }
    } catch (e: any) {
      addLog(e?.message || String(e));
      alert((lang === 'de' ? 'Bluetooth Fehler: ' : 'Bluetooth fout: ') + (e?.message || e));
    }
  }

  function disconnect() {
    try { server?.device?.gatt?.disconnect(); } catch {}
    setConnected(false);
  }

  function manualTest() {
    const mm = Number(prompt(lang === 'de' ? 'Test-Messwert in mm:' : 'Test meetwaarde in mm:', '1234'));
    if (mm > 0) {
      setLastValue(mm);
      onMeasure(mm);
      addLog((lang === 'de' ? 'Testwert übernommen: ' : 'Testwaarde overgenomen: ') + mm + ' mm');
    }
  }

  return (
    <div style={{border:'1px solid #dfe6f0',borderRadius:12,padding:18,display:'flex',justifyContent:'space-between',gap:18,background:'#fff'}}>
      <div style={{display:'flex',gap:18,alignItems:'center'}}>
        <div style={{width:72,height:110,borderRadius:10,background:'#111827',color:'#fff',display:'grid',placeItems:'center',fontSize:30}}>📏</div>
        <div>
          <h2 style={{margin:'0 0 6px'}}>{deviceName}</h2>
          <p><b>Status:</b> <span style={{color:connected?'#16a34a':'#ef4444',fontWeight:900}}>● {connected ? (lang==='de'?'Verbunden':'Verbonden') : (lang==='de'?'Nicht verbunden':'Niet verbonden')}</span></p>
          <p><b>{lang==='de'?'Batterie':'Batterij'}:</b> <span style={{color:'#16a34a',fontWeight:900}}>● {battery} 🔋</span></p>
          <p><b>{lang==='de'?'Aktives Feld':'Actief veld'}:</b> {selectedLabel}</p>
          <p><b>{lang==='de'?'Letzter Wert':'Laatste waarde'}:</b> {lastValue ? `${lastValue} mm` : '-'}</p>
          {!supported && <p style={{color:'#ef4444'}}>{lang==='de'?'Bitte Chrome oder Edge benutzen.':'Gebruik Chrome of Edge.'}</p>}
        </div>
      </div>
      <div style={{display:'grid',gap:10,minWidth:260}}>
        <button style={{...btn,color:'#16a34a'}} onClick={connect}>✓ {lang==='de'?'Laser verbinden':'Laser verbinden'}</button>
        <button style={btn} onClick={manualTest}>⌁ {lang==='de'?'Testwert übernehmen':'Testwaarde overnemen'}</button>
        <button style={redBtn} onClick={disconnect}>⏻ {lang==='de'?'Trennen':'Verbreken'}</button>
        <div style={{fontSize:12,color:'#64748b',lineHeight:1.4}}>
          {log.map((l,i)=><div key={i}>• {l}</div>)}
        </div>
      </div>
    </div>
  );
}

export default function AuftraegeModule({ lang='de' }: { lang?: Lang }) {
  const t = T[lang];
  const first = useMemo(()=>emptyOrder(lang), [lang]);
  const photoRef = useRef<HTMLInputElement|null>(null);
  const docsRef = useRef<HTMLInputElement|null>(null);

  const [orders,setOrders] = useState<Order[]>([first]);
  const [activeId,setActiveId] = useState(first.id);
  const [query,setQuery] = useState('');
  const [tab,setTab] = useState<Tab>('overview');
  const [measureTarget,setMeasureTarget] = useState<MeasureKey>('breite');

  useEffect(()=>{ try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw){ const p=JSON.parse(raw); if(Array.isArray(p)&&p.length){ setOrders(p); setActiveId(p[0].id); } } }catch{} },[]);
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); },[orders]);

  const active = orders.find(o=>o.id===activeId) || orders[0];
  const filtered = orders.filter(o => `${o.nummer} ${o.kunde} ${o.adresse} ${o.ort} ${o.telefon}`.toLowerCase().includes(query.toLowerCase()));

  function updateOrder(patch:Partial<Order>){ setOrders(prev=>prev.map(o=>o.id===active.id?{...o,...patch}:o)); }
  function updateMeasure(key:MeasureKey, value:number){ updateOrder({ measures:{...active.measures,[key]:value} }); }
  function fakeMeasure(key:MeasureKey){
    const values:Record<MeasureKey,number> = { breite:900+Math.round(Math.random()*900), hoehe:900+Math.round(Math.random()*900), tiefe:60+Math.round(Math.random()*50), rahmenLinks:55+Math.round(Math.random()*30), rahmenRechts:55+Math.round(Math.random()*30), rahmenOben:55+Math.round(Math.random()*30), rahmenUnten:70+Math.round(Math.random()*40), fensterbankTiefe:180+Math.round(Math.random()*180) };
    updateMeasure(key, values[key]);
  }
  function addOrder(){ const o=emptyOrder(lang); setOrders(prev=>[o,...prev]); setActiveId(o.id); }
  function deleteOrder(){ if(!confirm(lang==='de'?'Auftrag wirklich löschen?':'Order echt verwijderen?')) return; const next=orders.filter(o=>o.id!==active.id); if(!next.length){ const o=emptyOrder(lang); setOrders([o]); setActiveId(o.id); } else { setOrders(next); setActiveId(next[0].id); } }
  function duplicateOrder(){ const copy={...active,id:makeId(),nummer:orderNo(),kunde:active.kunde+' Kopie'}; setOrders(prev=>[copy,...prev]); setActiveId(copy.id); }
  function addElement(){ updateOrder({ elements:[...active.elements, emptyElement(active.elements.length+1)] }); }
  function updateElement(id:string, patch:Partial<ElementItem>){ updateOrder({ elements:active.elements.map(e=>e.id===id?{...e,...patch}:e) }); }
  function deleteElement(id:string){ updateOrder({ elements:active.elements.filter(e=>e.id!==id) }); }
  async function handlePhotos(e:React.ChangeEvent<HTMLInputElement>){ const urls=await filesToBase64(Array.from(e.target.files||[])); updateOrder({ fotos:[...active.fotos,...urls], foto:active.foto || urls[0] || '' }); }
  async function handleDocs(e:React.ChangeEvent<HTMLInputElement>){ const urls=await filesToBase64(Array.from(e.target.files||[])); updateOrder({ dokumente:[...active.dokumente,...urls] }); }

  function exportJson(){ const blob=new Blob([JSON.stringify(active,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${active.nummer}-auftrag.json`; a.click(); URL.revokeObjectURL(url); }

  if(!active) return null;
  const half=Math.round(active.measures.breite/2);

  return (
    <section className="orders-root">
      <div className="no-print" style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <button style={blueBtn} onClick={addOrder}>+ {t.newOrder}</button>
        <button style={btn} onClick={duplicateOrder}>{t.duplicate}</button>
        <button style={btn} onClick={()=>window.print()}>🖨️ {t.print}</button>
        <button style={btn} onClick={exportJson}>⬇️ {t.export}</button>
        <button style={redBtn} onClick={deleteOrder}>🗑️ {t.delete}</button>
        <input style={{...input,maxWidth:280}} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/>
      </div>

      <div className="pdf-only">
        <div className="pdf-head">
          <div>
            <div className="pdf-logo">D&I</div>
            <h1>D&I Kunststoff Kozijnen B.V.</h1>
            <p>Kunststoff Kozijnen und Rollläden</p>
          </div>
          <div className="pdf-meta">
            <b>{lang==='de'?'Aufmaß / Auftrag':'Inmeting / Order'}</b>
            <span>{active.nummer}</span>
            <span>{lang==='de'?'Datum':'Datum'}: {active.erstelltAm}</span>
            <span>{lang==='de'?'Status':'Status'}: {statusLabel(active.status,lang)}</span>
          </div>
        </div>

        <div className="pdf-grid pdf-customer">
          <div>
            <h2>{lang==='de'?'Kundendaten':'Klantgegevens'}</h2>
            <p><b>{t.customer}:</b> {active.kunde}</p>
            <p><b>{t.reference}:</b> {active.referenz || '-'}</p>
            <p><b>{t.address}:</b> {active.adresse}</p>
            <p><b>{t.zip} / {t.city}:</b> {active.plz} {active.ort}</p>
            <p><b>{t.phone}:</b> {active.telefon}</p>
            <p><b>{t.email}:</b> {active.email}</p>
          </div>
          <div>
            <h2>{lang==='de'?'Auftragsdaten':'Ordergegevens'}</h2>
            <p><b>{t.fitter}:</b> {active.monteur}</p>
            <p><b>{t.deliveryDate}:</b> {active.lieferdatum || '-'}</p>
            <p><b>{t.montageDate}:</b> {active.montageDatum || '-'}</p>
            <p><b>{t.product}:</b> {active.produkt || '-'}</p>
          </div>
        </div>

        <h2>{t.measures}</h2>
        <table className="pdf-table">
          <tbody>
            {measureRows(t).map(([key,,label])=>(
              <tr key={key}><td>{label}</td><td><b>{active.measures[key]} mm</b></td></tr>
            ))}
          </tbody>
        </table>

        <div className="pdf-grid pdf-media">
          <div>
            <h2>{t.photo}</h2>
            <div className="pdf-photo">{active.foto ? <img src={active.foto} alt="Foto"/> : <span>{t.noPhotos}</span>}</div>
          </div>
          <div>
            <h2>{t.sketch}</h2>
            <div className="pdf-sketch">
              <svg width="300" height="245" viewBox="0 0 340 310"><defs><marker id="pdfArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#111827"/></marker></defs><line x1="55" y1="30" x2="285" y2="30" stroke="#111827" strokeWidth="2" markerStart="url(#pdfArrow)" markerEnd="url(#pdfArrow)"/><text x="170" y="24" textAnchor="middle" fontWeight="700">{active.measures.breite}</text><line x1="35" y1="60" x2="35" y2="245" stroke="#111827" strokeWidth="2" markerStart="url(#pdfArrow)" markerEnd="url(#pdfArrow)"/><text x="25" y="155" textAnchor="middle" fontWeight="700" transform="rotate(-90 25 155)">{active.measures.hoehe}</text><rect x="60" y="58" width="220" height="190" fill="#fff" stroke="#333" strokeWidth="3"/><rect x="75" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2"/><rect x="177" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2"/><line x1="170" y1="58" x2="170" y2="248" stroke="#333" strokeWidth="2"/><circle cx="164" cy="155" r="3" fill="#333"/><circle cx="176" cy="155" r="3" fill="#333"/></svg>
            </div>
          </div>
        </div>

        <h2>{t.elements}</h2>
        <table className="pdf-table">
          <thead><tr><th>{t.nr}</th><th>{t.element}</th><th>{t.type}</th><th>{t.widthMm}</th><th>{t.heightMm}</th><th>{t.depthMm}</th></tr></thead>
          <tbody>{active.elements.map((el,i)=><tr key={el.id}><td>{i+1}</td><td>{el.name}</td><td>{el.typ}</td><td>{el.breite}</td><td>{el.hoehe}</td><td>{el.tiefe}</td></tr>)}</tbody>
        </table>

        <div className="pdf-notes">
          <h2>{t.notes}</h2>
          <p>{active.notizen || '-'}</p>
        </div>

        <div className="pdf-sign">
          <div>{lang==='de'?'Unterschrift Kunde':'Handtekening klant'}</div>
          <div>{lang==='de'?'Unterschrift Monteur':'Handtekening monteur'}</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
        <aside className="no-print" style={{display:'grid',gap:14}}>
          <div style={{...card,padding:18}}>
            <h2 style={{marginTop:0}}>{t.title}</h2>
            <div style={{display:'grid',gap:8}}>
              {filtered.map(o=>(
                <button key={o.id} onClick={()=>setActiveId(o.id)} style={{...btn,textAlign:'left',background:o.id===active.id?'#eff6ff':'#fff',borderColor:o.id===active.id?'#0b73ff':'#cbd7e8'}}>
                  <b>{o.nummer}</b><div>{o.kunde}</div><small style={{color:'#64748b'}}>{statusLabel(o.status,lang)}</small>
                </button>
              ))}
            </div>
          </div>
          <div style={{...card,padding:18}}>
            <h3 style={{marginTop:0}}>{t.order}</h3>
            <div style={{display:'grid',gap:12}}>
              <div><small>{lang==='de'?'Auftragsnummer':'Ordernummer'}</small><br/><b style={{color:'#0b73ff'}}>{active.nummer}</b></div>
              <div><small>{t.customer}</small><br/><b>{active.kunde}</b></div>
              <div><small>{t.address}</small><br/><b>{active.adresse}<br/>{active.plz} {active.ort}</b></div>
              <div><small>{t.status}</small><br/><b style={{background:'#fde68a',borderRadius:999,padding:'5px 9px',display:'inline-block'}}>{statusLabel(active.status,lang)}</b></div>
              <div><small>{t.fitter}</small><br/><b>{active.monteur}</b></div>
            </div>
          </div>
          <div style={{...card,padding:18}}>
            <h3 style={{marginTop:0}}>{lang==='de'?'Bereiche im Auftrag':'Onderdelen in order'}</h3>
            {[
              ['overview','❖',t.overview], ['aufmass','📐',t.measurement], ['photos','📷',t.photos], ['documents','📎',t.documents], ['notes','📝',t.notes],
            ].map(([id,icon,label])=>(
              <button key={id} onClick={()=>setTab(id as Tab)} style={{...btn,width:'100%',textAlign:'left',marginBottom:8,background:tab===id?'#e8f2ff':'#fff',borderColor:tab===id?'#0b73ff':'#cbd7e8'}}>{icon} {label}</button>
            ))}
          </div>
        </aside>

        <main style={{...card,padding:0,overflow:'hidden'}}>
          <div style={{padding:22,borderBottom:'1px solid #e5eaf2',display:'flex',justifyContent:'space-between',gap:18}}>
            <div><h2 style={{margin:0}}>{t.order} {active.nummer}</h2><p style={{color:'#64748b',marginBottom:0}}>{t.allInOrder}</p></div>
            <select style={{...input,maxWidth:220}} value={active.status} onChange={e=>updateOrder({status:e.target.value as OrderStatus})}>
              <option value="draft">{lang==='de'?'Entwurf':'Concept'}</option><option value="measurement">{lang==='de'?'Aufmaß läuft':'Inmeting loopt'}</option><option value="offer">{lang==='de'?'Angebot':'Offerte'}</option><option value="production">{lang==='de'?'Produktion':'Productie'}</option><option value="montage">Montage</option><option value="done">{lang==='de'?'Fertig':'Klaar'}</option>
            </select>
          </div>

          {tab==='overview' && <div style={{padding:22}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <label><b>{t.customer}</b><input style={input} value={active.kunde} onChange={e=>updateOrder({kunde:e.target.value})}/></label>
              <label><b>{t.reference}</b><input style={input} value={active.referenz} onChange={e=>updateOrder({referenz:e.target.value})}/></label>
              <label><b>{t.address}</b><input style={input} value={active.adresse} onChange={e=>updateOrder({adresse:e.target.value})}/></label>
              <label><b>{t.zip}</b><input style={input} value={active.plz} onChange={e=>updateOrder({plz:e.target.value})}/></label>
              <label><b>{t.city}</b><input style={input} value={active.ort} onChange={e=>updateOrder({ort:e.target.value})}/></label>
              <label><b>{t.phone}</b><input style={input} value={active.telefon} onChange={e=>updateOrder({telefon:e.target.value})}/></label>
              <label><b>{t.email}</b><input style={input} value={active.email} onChange={e=>updateOrder({email:e.target.value})}/></label>
              <label><b>{t.fitter}</b><input style={input} value={active.monteur} onChange={e=>updateOrder({monteur:e.target.value})}/></label>
              <label><b>{t.created}</b><input type="date" style={input} value={active.erstelltAm} onChange={e=>updateOrder({erstelltAm:e.target.value})}/></label>
              <label><b>{t.deliveryDate}</b><input type="date" style={input} value={active.lieferdatum} onChange={e=>updateOrder({lieferdatum:e.target.value})}/></label>
              <label><b>{t.montageDate}</b><input type="date" style={input} value={active.montageDatum} onChange={e=>updateOrder({montageDatum:e.target.value})}/></label>
              <label><b>{t.product}</b><input style={input} value={active.produkt} onChange={e=>updateOrder({produkt:e.target.value})}/></label>
            </div>
          </div>}

          {tab==='aufmass' && <div>
            <div style={{padding:22}}>
              <BoschLaserPanel
                lang={lang}
                selectedLabel={measureRows(t).find(([key]) => key === measureTarget)?.[2] || ''}
                onMeasure={(mm) => updateMeasure(measureTarget, mm)}
              />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'420px 1fr 420px',borderTop:'1px solid #e5eaf2',borderBottom:'1px solid #e5eaf2'}}>
              <div style={{padding:20,borderRight:'1px solid #e5eaf2'}}>
                <h3>{t.measures} ⓘ</h3>
                <div style={{display:'grid',gap:8}}>
                  {measureRows(t).map(([key,icon,label])=>(
                    <div key={key} style={{display:'grid',gridTemplateColumns:'36px 1fr 95px 88px',gap:8,alignItems:'center',border:'1px solid #e5eaf2',borderRadius:9,padding:8}}>
                      <span>{icon}</span><b>{label}</b><input style={{...input,textAlign:'right',fontWeight:900}} value={active.measures[key]} onChange={e=>updateMeasure(key,Number(e.target.value)||0)}/><button style={{...btn,color:'#0b73ff',padding:'8px 10px'}} onClick={()=>fakeMeasure(key)}>⌁ {t.measure}</button>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,padding:12,borderRadius:9,background:'#eaf4ff',border:'1px solid #9cc9ff',color:'#0f4c81',fontSize:14}}>ℹ️ {t.measureInfo}</div>
                <div style={{marginTop:12,display:'flex',gap:8}}><select style={input} value={measureTarget} onChange={e=>setMeasureTarget(e.target.value as MeasureKey)}>{measureRows(t).map(([key,,label])=><option key={key} value={key}>{label}</option>)}</select><button style={blueBtn} onClick={()=>fakeMeasure(measureTarget)}>{t.measure}</button></div>
              </div>
              <div style={{padding:20,borderRight:'1px solid #e5eaf2'}}>
                <h3>{t.photo}</h3><div style={{height:330,background:'#f8fafc',border:'1px solid #dfe6f0',borderRadius:10,display:'grid',placeItems:'center',overflow:'hidden'}}>{active.foto?<img src={active.foto} alt="Aufmaß Foto" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{color:'#64748b',textAlign:'center'}}>📷<br/>{t.noPhotos}</div>}</div>
                <input ref={photoRef} type="file" accept="image/*" capture="environment" multiple style={{display:'none'}} onChange={handlePhotos}/><div style={{display:'flex',gap:10,marginTop:14}}><button style={btn} onClick={()=>photoRef.current?.click()}>📷 {t.takePhoto}</button><button style={btn} onClick={()=>photoRef.current?.click()}>🖼️ {t.gallery}</button></div>
              </div>
              <div style={{padding:20}}>
                <h3>{t.sketch}</h3><div style={{height:390,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #e5eaf2',borderRadius:10}}>
                  <svg width="340" height="310" viewBox="0 0 340 310"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f7df6"/></marker></defs><line x1="55" y1="30" x2="285" y2="30" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="170" y="24" textAnchor="middle" fontWeight="700">{active.measures.breite}</text><line x1="35" y1="60" x2="35" y2="245" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="25" y="155" textAnchor="middle" fontWeight="700" transform="rotate(-90 25 155)">{active.measures.hoehe}</text><rect x="60" y="58" width="220" height="190" fill="#fff" stroke="#333" strokeWidth="3"/><rect x="75" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2"/><rect x="177" y="75" width="88" height="155" fill="#fff" stroke="#777" strokeWidth="2"/><line x1="170" y1="58" x2="170" y2="248" stroke="#333" strokeWidth="2"/><circle cx="164" cy="155" r="3" fill="#333"/><circle cx="176" cy="155" r="3" fill="#333"/><line x1="75" y1="270" x2="163" y2="270" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="119" y="292" textAnchor="middle" fontWeight="700">{half}</text><line x1="177" y1="270" x2="265" y2="270" stroke="#2f7df6" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="221" y="292" textAnchor="middle" fontWeight="700">{half}</text></svg>
                </div>
              </div>
            </div>
            <div style={{padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><h3 style={{margin:0}}>{t.elements}</h3><button style={blueBtn} onClick={addElement}>+ {t.addElement}</button></div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}><thead><tr style={{textAlign:'left',color:'#475569'}}><th style={{padding:10}}>{t.nr}</th><th>{t.element}</th><th>{t.type}</th><th>{t.widthMm}</th><th>{t.heightMm}</th><th>{t.depthMm}</th><th>{t.actions}</th></tr></thead><tbody>{active.elements.map((el,i)=><tr key={el.id} style={{borderTop:'1px solid #e5eaf2'}}><td style={{padding:10}}>{i+1}</td><td><input style={{...input,height:32}} value={el.name} onChange={e=>updateElement(el.id,{name:e.target.value})}/></td><td><input style={{...input,height:32}} value={el.typ} onChange={e=>updateElement(el.id,{typ:e.target.value})}/></td><td><input style={{...input,height:32,width:90}} value={el.breite} onChange={e=>updateElement(el.id,{breite:Number(e.target.value)||0})}/></td><td><input style={{...input,height:32,width:90}} value={el.hoehe} onChange={e=>updateElement(el.id,{hoehe:Number(e.target.value)||0})}/></td><td><input style={{...input,height:32,width:90}} value={el.tiefe} onChange={e=>updateElement(el.id,{tiefe:Number(e.target.value)||0})}/></td><td><button style={redBtn} onClick={()=>deleteElement(el.id)}>🗑</button></td></tr>)}</tbody></table>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}><button style={greenBtn} onClick={()=>alert(lang==='de'?'Auftrag gespeichert.':'Order opgeslagen.')}>✓ {t.save}</button></div>
            </div>
          </div>}

          {tab==='photos' && <div style={{padding:22}}><h2>{t.photos}</h2><button style={blueBtn} onClick={()=>photoRef.current?.click()}>+ {t.uploadPhotos}</button><input ref={photoRef} type="file" accept="image/*" capture="environment" multiple style={{display:'none'}} onChange={handlePhotos}/>{active.fotos.length===0?<p style={{color:'#64748b'}}>{t.noPhotos}</p>:null}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:12,marginTop:18}}>{active.fotos.map((src,i)=><img key={i} src={src} alt={`Foto ${i+1}`} style={{width:'100%',height:140,objectFit:'cover',borderRadius:12,border:'1px solid #dfe6f0'}}/>)}</div></div>}

          {tab==='documents' && <div style={{padding:22}}><h2>{t.documents}</h2><button style={blueBtn} onClick={()=>docsRef.current?.click()}>+ {t.uploadDocs}</button><input ref={docsRef} type="file" accept="image/*,.pdf,.xlsx,.xls,.doc,.docx" multiple style={{display:'none'}} onChange={handleDocs}/>{active.dokumente.length===0?<p style={{color:'#64748b'}}>{t.noDocs}</p>:null}<div style={{display:'grid',gap:10,marginTop:18}}>{active.dokumente.map((doc,i)=><a key={i} href={doc} target="_blank" style={{...btn,textDecoration:'none',color:'#0f172a'}}>📎 Dokument {i+1}</a>)}</div></div>}

          {tab==='notes' && <div style={{padding:22}}><h2>{t.notes}</h2><textarea style={textarea} value={active.notizen} onChange={e=>updateOrder({notizen:e.target.value})}/></div>}
        </main>
      </div>

      <style jsx global>{`
        .pdf-only{display:none;}
        @media print{
          @page{size:A4 portrait;margin:10mm;}
          html,body{background:#fff!important;margin:0!important;padding:0!important;overflow:visible!important;}
          body *{visibility:hidden!important;}
          .pdf-only,.pdf-only *{visibility:visible!important;}
          .pdf-only{display:block!important;position:absolute!important;left:0!important;top:0!important;width:190mm!important;background:#fff!important;color:#111827!important;font-family:Arial,sans-serif!important;font-size:11px!important;line-height:1.25!important;}
          .no-print{display:none!important;}
          .pdf-head{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;border-bottom:2px solid #111827!important;padding-bottom:8px!important;margin-bottom:10px!important;}
          .pdf-logo{font-size:24px!important;font-weight:900!important;letter-spacing:-1px!important;}
          .pdf-head h1{font-size:18px!important;margin:2px 0!important;}
          .pdf-head p{margin:0!important;color:#374151!important;}
          .pdf-meta{display:grid!important;gap:3px!important;text-align:right!important;}
          .pdf-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;margin:8px 0!important;}
          .pdf-customer{border:1px solid #d1d5db!important;border-radius:8px!important;padding:8px!important;}
          .pdf-only h2{font-size:14px!important;margin:9px 0 5px!important;}
          .pdf-only p{margin:3px 0!important;}
          .pdf-table{width:100%!important;border-collapse:collapse!important;margin:6px 0 10px!important;page-break-inside:auto!important;}
          .pdf-table th,.pdf-table td{border:1px solid #d1d5db!important;padding:5px!important;text-align:left!important;}
          .pdf-table th{background:#f3f4f6!important;font-weight:800!important;}
          .pdf-media{page-break-inside:avoid!important;}
          .pdf-photo,.pdf-sketch{border:1px solid #d1d5db!important;border-radius:8px!important;height:175px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;background:#fff!important;}
          .pdf-photo img{width:100%!important;height:100%!important;object-fit:cover!important;}
          .pdf-notes{border:1px solid #d1d5db!important;border-radius:8px!important;padding:8px!important;min-height:45px!important;page-break-inside:avoid!important;}
          .pdf-sign{display:grid!important;grid-template-columns:1fr 1fr!important;gap:30px!important;margin-top:22px!important;page-break-inside:avoid!important;}
          .pdf-sign div{border-top:1px solid #111827!important;padding-top:6px!important;text-align:center!important;}
        }
      `}</style>
    </section>
  );
}

