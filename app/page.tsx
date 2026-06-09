'use client';
import { useMemo, useState, useEffect } from 'react';
import { Home, Users, FolderKanban, Factory, Truck, Package, CalendarDays, Clock, FileText, Receipt, QrCode, Camera, MessageCircle, Settings, Bell, Search, Plus, Warehouse, UserCog, Bot, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
type Module = 'dashboard'|'kunden'|'projekte'|'produktion'|'lager'|'wareneingang'|'bestellliste'|'montage'|'kalender'|'mitarbeiter'|'zeit'|'angebote'|'rechnungen'|'qr'|'whatsapp'|'ki'|'settings';
type Lang='de'|'nl'|'en'|'pl';

const labels:any={
 de:{dashboard:'Dashboard',kunden:'Kunden',projekte:'Projekte',produktion:'Produktion',lager:'Lager',wareneingang:'Wareneingang',bestellliste:'Bestellliste',montage:'Montage',kalender:'Kalender',mitarbeiter:'Mitarbeiter',zeit:'Zeiterfassung',angebote:'Angebote',rechnungen:'Rechnungen',qr:'QR-Codes',whatsapp:'WhatsApp',ki:'KI-Assistent',settings:'Einstellungen',search:'Suchen...',newProject:'Neues Projekt',activeProjects:'Aktive Projekte',tasks:'Aufgaben',stock:'Vorrat Artikel',users:'Mitarbeiter',welcome:'Willkommen zurück bei D&I Kozijnen ERP'},
 nl:{dashboard:'Dashboard',kunden:'Klanten',projekte:'Projecten',produktion:'Productie',lager:'Magazijn',wareneingang:'Goederenontvangst',bestellliste:'Bestellijst',montage:'Montage',kalender:'Kalender',mitarbeiter:'Medewerkers',zeit:'Tijdregistratie',angebote:'Offertes',rechnungen:'Facturen',qr:'QR-codes',whatsapp:'WhatsApp',ki:'AI-assistent',settings:'Instellingen',search:'Zoeken...',newProject:'Nieuw project',activeProjects:'Actieve projecten',tasks:'Taken',stock:'Voorraad artikelen',users:'Medewerkers',welcome:'Welkom terug bij D&I Kozijnen ERP'},
 en:{dashboard:'Dashboard',kunden:'Customers',projekte:'Projects',produktion:'Production',lager:'Stock',wareneingang:'Goods receipt',bestellliste:'Order list',montage:'Installation',kalender:'Calendar',mitarbeiter:'Employees',zeit:'Time tracking',angebote:'Quotes',rechnungen:'Invoices',qr:'QR Codes',whatsapp:'WhatsApp',ki:'AI Assistant',settings:'Settings',search:'Search...',newProject:'New project',activeProjects:'Active projects',tasks:'Tasks',stock:'Stock items',users:'Employees',welcome:'Welcome back to D&I Kozijnen ERP'},
 pl:{dashboard:'Panel',kunden:'Klienci',projekte:'Projekty',produktion:'Produkcja',lager:'Magazyn',wareneingang:'Przyjęcie towaru',bestellliste:'Lista zamówień',montage:'Montaż',kalender:'Kalendarz',mitarbeiter:'Pracownicy',zeit:'Czas pracy',angebote:'Oferty',rechnungen:'Faktury',qr:'Kody QR',whatsapp:'WhatsApp',ki:'Asystent AI',settings:'Ustawienia',search:'Szukaj...',newProject:'Nowy projekt',activeProjects:'Aktywne projekty',tasks:'Zadania',stock:'Artykuły magazynowe',users:'Pracownicy',welcome:'Witamy w D&I Kozijnen ERP'}
};

const nav: {id:Module; icon:any}[]=[
 {id:'dashboard',icon:Home},{id:'kunden',icon:Users},{id:'projekte',icon:FolderKanban},{id:'produktion',icon:Factory},{id:'lager',icon:Package},{id:'wareneingang',icon:Warehouse},{id:'bestellliste',icon:FileText},{id:'montage',icon:Truck},{id:'kalender',icon:CalendarDays},{id:'mitarbeiter',icon:UserCog},{id:'zeit',icon:Clock},{id:'angebote',icon:FileText},{id:'rechnungen',icon:Receipt},{id:'qr',icon:QrCode},{id:'whatsapp',icon:MessageCircle},{id:'ki',icon:Bot},{id:'settings',icon:Settings}
];

export default function Page(){
 const [mod,setMod]=useState<Module>('dashboard');
 const [lang,setLang]=useState<Lang>('de');
 const [dark,setDark]=useState(false);
 const t=labels[lang];
 const [customers,setCustomers]=useState<any[]>([]);
 useEffect(() => {
  async function loadCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    setCustomers(data || []);
  }

  loadCustomers();
}, []);
 const [projects,setProjects]=useState([{nr:'P-10045',name:'Fensteranlage',customer:'Schmidt GmbH',status:'Produktion',price:'18.950 €'},{nr:'P-10046',name:'Schiebetür',customer:'Müller Privatkunde',status:'Montage',price:'6.750 €'}]);
 const [stock,setStock]=useState([{item:'Kunststoffprofil Anthrazit',qty:42,min:20},{item:'HR++ Glas 1200x900',qty:18,min:25},{item:'Beschläge Set',qty:75,min:30}]);
 const addCustomer=()=>setCustomers([{name:'Neuer Kunde',phone:'-',city:'-',status:'Neu'},...customers]);
 const addProject=()=>setProjects([{nr:'P-'+Math.floor(10000+Math.random()*89999),name:'Neues Projekt',customer:'Neuer Kunde',status:'Anfrage',price:'0 €'},...projects]);
 return <div className={dark?'app darkPreview':'app'}>
  <aside className="rail"><div className="brandDot"/>{nav.slice(0,12).map(n=>{const I=n.icon;return <button key={n.id} className={'iconBtn '+(mod===n.id?'active':'')} onClick={()=>setMod(n.id)}><I size={19}/></button>})}</aside>
  <aside className="side"><div className="logo">D&I Kozijnen ERP</div>{nav.map(n=>{const I=n.icon;return <div key={n.id} onClick={()=>setMod(n.id)} className={'navItem '+(mod===n.id?'active':'')}><I size={18}/>{t[n.id]}</div>})}</aside>
  <main className="main">
   <div className="top"><input className="search" placeholder={t.search}/><button className="pill"><Bell size={16}/> 3</button><select className="pill" value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="de">DE</option><option value="nl">NL</option><option value="en">EN</option><option value="pl">PL</option></select><button className="primary" onClick={addProject}><Plus size={16}/> {t.newProject}</button></div>
   <section className="content">
    <h1 className="h1">{t[mod]}</h1><div className="crumb">D&I Kozijnen / {t[mod]} · {t.welcome}</div>
    {mod==='dashboard'&&<Dashboard t={t} projects={projects.length} customers={customers.length} stock={stock.length}/>} 
    {mod==='kunden'&&<DataModule title={t.kunden} button="Kunde hinzufügen" onAdd={addCustomer} rows={customers.map(c=>[c.name,c.phone,c.city,c.status])} headers={['Kunde','Telefon','Ort','Status']}/>} 
    {mod==='projekte'&&<Projects projects={projects} addProject={addProject}/>} 
    {mod==='produktion'&&<Production/>}
    {mod==='lager'&&<Stock stock={stock} setStock={setStock}/>} 
    {mod==='wareneingang'&&<Simple title="Wareneingang" text="Lieferungen erfassen, Menge erhöhen, Foto vom Lieferschein hochladen und QR/Barcode zuordnen."/>}
    {mod==='bestellliste'&&<Simple title="Bestellliste" text="Automatische Liste für Artikel unter Mindestbestand, Lieferanten und Status der Bestellung."/>}
    {mod==='montage'&&<Simple title="Montage" text="Teams planen, Adresse öffnen, Checklisten abhaken, Fotos vorher/nachher und digitale Unterschrift speichern."/>}
    {mod==='kalender'&&<CalendarView/>}
    {mod==='mitarbeiter'&&<DataModule title="Mitarbeiter" button="Mitarbeiter hinzufügen" onAdd={()=>{}} rows={[['Jan','Monteur','Aktiv','Heute 08:00'],['Anna','Büro','Aktiv','Heute 09:00'],['Piotr','Produktion','Aktiv','Heute 07:30']]} headers={['Name','Rolle','Status','Start']}/>} 
    {mod==='zeit'&&<Simple title="Zeiterfassung" text="Kommen, Gehen, Pause, Urlaub und Stundenzettel für Admin, Büro, Produktion, Lager und Montage."/>}
    {mod==='angebote'&&<Simple title="Angebote" text="PDF-Angebote mit Logo, Projektdaten, Positionen, Preisen und Versand per E-Mail oder WhatsApp."/>}
    {mod==='rechnungen'&&<Simple title="Rechnungen" text="Rechnungen, Zahlungsstatus, offene Beträge, Mahnungen und PDF-Export."/>}
    {mod==='qr'&&<Simple title="QR-Codes" text="QR-Codes für Projekte, Lagerartikel, Produktion und Montage. Mitarbeiter scannen und öffnen direkt den richtigen Datensatz."/>}
    {mod==='whatsapp'&&<Simple title="WhatsApp" text="Kunden direkt kontaktieren: Terminbestätigung, Angebot senden, Montage-Erinnerung und Status-Updates."/>}
    {mod==='ki'&&<Simple title="KI-Assistent" text="Angebote vorbereiten, E-Mails schreiben, Kundendaten suchen und Produktionsinformationen schneller finden."/>}
    {mod==='settings'&&<div className="card"><h2>Einstellungen</h2><div className="actions"><button className="primary" onClick={()=>setDark(!dark)}>Dark Mode wechseln</button><button className="pill"><Languages size={16}/> Sprache</button></div></div>}
   </section>
  </main>
  <div className="mobileBar">{nav.slice(0,5).map(n=>{const I=n.icon;return <button key={n.id} onClick={()=>setMod(n.id)}><I size={18}/><br/>{t[n.id]}</button>})}</div>
 </div>
}

function Dashboard({t,projects,customers,stock}:any){return <><div className="grid cards"><Stat title={t.activeProjects} value={projects}/><Stat title="Kunden" value={customers}/><Stat title={t.stock} value={stock}/><Stat title={t.users} value="12"/></div><div className="grid two"><div className="card"><h2>Project Overview</h2><div className="chart"/></div><div className="card"><h2>Tasks Status</h2><p className="statNum">54</p><p className="small">Montage, Produktion, Lager, Angebote</p><button className="primary">Create New Task</button></div></div><div className="grid three"><div className="card"><h3>Heute Montage</h3><p>08:00 Schmidt GmbH</p><p>10:30 Müller Privatkunde</p></div><div className="card"><h3>Lager Warnung</h3><p>HR++ Glas unter Mindestbestand</p></div><div className="card"><h3>Offene Rechnungen</h3><p className="statNum">23.650 €</p></div></div></>}
function Stat({title,value}:any){return <div className="card stat"><div className="statIcon"><Package size={22}/></div><div><div className="small">{title}</div><div className="statNum">{value}</div><div className="small" style={{color:'#16a34a'}}>+ 12.5%</div></div></div>}
function DataModule({title,button,onAdd,rows,headers}:any){return <div className="card"><div className="actions" style={{justifyContent:'space-between'}}><h2>{title}</h2><button className="primary" onClick={onAdd}><Plus size={16}/> {button}</button></div><table className="table"><thead><tr>{headers.map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r:any,i:number)=><tr key={i}>{r.map((c:string,j:number)=><td key={j}>{j===3?<span className="badge b-green">{c}</span>:c}</td>)}</tr>)}</tbody></table></div>}
function Projects({projects,addProject}:any){return <div className="card"><div className="actions" style={{justifyContent:'space-between'}}><h2>Projekte</h2><div className="actions"><label className="pill"><Camera size={16}/> Foto machen<input type="file" accept="image/*" capture="environment" hidden/></label><label className="pill">Datei hinzufügen<input type="file" hidden/></label><button className="primary" onClick={addProject}>Projekt hinzufügen</button></div></div><table className="table"><thead><tr><th>Nr.</th><th>Projekt</th><th>Kunde</th><th>Status</th><th>Preis</th></tr></thead><tbody>{projects.map((p:any)=><tr key={p.nr}><td>{p.nr}</td><td>{p.name}</td><td>{p.customer}</td><td><span className="badge b-purple">{p.status}</span></td><td>{p.price}</td></tr>)}</tbody></table></div>}
function Production(){return <div className="grid two"><div className="card"><h2>Produktionsliste</h2><table className="table"><tbody>{['Fensteranlage','Haustür','Schiebetür','Glasfassade'].map((x,i)=><tr key={x}><td>{x}</td><td><span className="badge b-orange">In Arbeit</span></td><td>{25+i*15}%</td></tr>)}</tbody></table></div><div className="card"><h2>Zeichnungen & PDFs</h2><label className="pill">PDF / Zeichnung hochladen<input type="file" accept=".pdf,image/*" hidden/></label><p className="small">Technische Dateien werden später in Supabase Storage gespeichert.</p></div></div>}
function Stock({stock,setStock}:any){return <div className="card"><div className="actions" style={{justifyContent:'space-between'}}><h2>Vorrat / Lager</h2><button className="primary" onClick={()=>setStock([{item:'Neuer Artikel',qty:0,min:10},...stock])}>Artikel hinzufügen</button></div><table className="table"><thead><tr><th>Artikel</th><th>Vorrat</th><th>Mindestbestand</th><th>Status</th></tr></thead><tbody>{stock.map((s:any)=><tr key={s.item}><td>{s.item}</td><td>{s.qty}</td><td>{s.min}</td><td><span className={'badge '+(s.qty<s.min?'b-red':'b-green')}>{s.qty<s.min?'Bestellen':'OK'}</span></td></tr>)}</tbody></table></div>}
function CalendarView(){const days=Array.from({length:30},(_,i)=>i+1);return <div className="card"><h2>Kalender</h2><div className="calendar">{days.map(d=><div className="day" key={d}><b>{d}</b>{[3,8,12,18,24].includes(d)&&<div className="event">Montage 08:00</div>}{[5,15,22].includes(d)&&<div className="event">Produktion</div>}</div>)}</div></div>}
function Simple({title,text}:any){return <div className="grid two"><div className="card"><h2>{title}</h2><p>{text}</p><div className="form"><input className="input" placeholder="Name / Nummer"/><input className="input" placeholder="Status"/><textarea placeholder="Notizen"/></div><br/><button className="primary">Speichern</button></div><div className="card"><h2>Funktionen</h2><p>Diese Seite ist vorbereitet für echte Datenbank-Verbindung mit Supabase.</p><div className="actions"><button className="pill">Anlegen</button><button className="pill">Bearbeiten</button><button className="pill">Löschen</button><button className="pill">Export</button></div></div></div>}
