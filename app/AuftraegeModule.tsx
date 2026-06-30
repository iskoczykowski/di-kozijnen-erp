'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AufmassProModule from './AufmassProModule';

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
    <section>
      <div className="no-print" style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <button style={blueBtn} onClick={addOrder}>+ {t.newOrder}</button>
        <button style={btn} onClick={duplicateOrder}>{t.duplicate}</button>
        <button style={btn} onClick={()=>window.print()}>🖨️ {t.print}</button>
        <button style={btn} onClick={exportJson}>⬇️ {t.export}</button>
        <button style={redBtn} onClick={deleteOrder}>🗑️ {t.delete}</button>
        <input style={{...input,maxWidth:280}} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/>
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

          {tab==='aufmass' && (
            <AufmassProModule
              lang={lang}
              orderId={active.id}
              orderNumber={active.nummer}
              customerName={active.kunde}
              onSave={(elements) => {
                updateOrder({
                  notizen: active.notizen
                });
                localStorage.setItem(`di_aufmass_pro_${active.id}`, JSON.stringify(elements));
              }}
            />
          )}

          {tab==='photos' && <div style={{padding:22}}><h2>{t.photos}</h2><button style={blueBtn} onClick={()=>photoRef.current?.click()}>+ {t.uploadPhotos}</button><input ref={photoRef} type="file" accept="image/*" capture="environment" multiple style={{display:'none'}} onChange={handlePhotos}/>{active.fotos.length===0?<p style={{color:'#64748b'}}>{t.noPhotos}</p>:null}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:12,marginTop:18}}>{active.fotos.map((src,i)=><img key={i} src={src} alt={`Foto ${i+1}`} style={{width:'100%',height:140,objectFit:'cover',borderRadius:12,border:'1px solid #dfe6f0'}}/>)}</div></div>}

          {tab==='documents' && <div style={{padding:22}}><h2>{t.documents}</h2><button style={blueBtn} onClick={()=>docsRef.current?.click()}>+ {t.uploadDocs}</button><input ref={docsRef} type="file" accept="image/*,.pdf,.xlsx,.xls,.doc,.docx" multiple style={{display:'none'}} onChange={handleDocs}/>{active.dokumente.length===0?<p style={{color:'#64748b'}}>{t.noDocs}</p>:null}<div style={{display:'grid',gap:10,marginTop:18}}>{active.dokumente.map((doc,i)=><a key={i} href={doc} target="_blank" style={{...btn,textDecoration:'none',color:'#0f172a'}}>📎 Dokument {i+1}</a>)}</div></div>}

          {tab==='notes' && <div style={{padding:22}}><h2>{t.notes}</h2><textarea style={textarea} value={active.notizen} onChange={e=>updateOrder({notizen:e.target.value})}/></div>}
        </main>
      </div>

      <style jsx global>{`@media print{.no-print{display:none!important;}}`}</style>
    </section>
  );
}

