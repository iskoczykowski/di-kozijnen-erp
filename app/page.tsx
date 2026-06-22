'use client';

import { useState, useEffect } from 'react';
import { Home, Users, FolderKanban, Factory, Truck, Package, CalendarDays, Clock, FileText, Receipt, QrCode, Camera, MessageCircle, Settings, Bell, Plus, Warehouse, UserCog, Bot, Languages, Trash2, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Module = 'dashboard'|'kunden'|'projekte'|'produktion'|'lager'|'wareneingang'|'bestellliste'|'montage'|'kalender'|'mitarbeiter'|'zeit'|'angebote'|'rechnungen'|'qr'|'whatsapp'|'ki'|'settings';
type Lang='de'|'nl'|'en'|'pl';

const labels:any={
 de:{dashboard:'Dashboard',kunden:'Kunden',projekte:'Projekte',produktion:'Produktion',lager:'Lager',wareneingang:'Wareneingang',bestellliste:'Bestellliste',montage:'Montage',kalender:'Kalender',mitarbeiter:'Mitarbeiter',zeit:'Zeiterfassung',angebote:'Angebote',rechnungen:'Rechnungen',qr:'QR-Codes',whatsapp:'WhatsApp',ki:'KI-Assistent',settings:'Einstellungen',search:'Suchen...',newProject:'Neues Projekt',activeProjects:'Aktive Projekte',tasks:'Aufgaben',stock:'Vorrat Artikel',users:'Mitarbeiter',welcome:'Willkommen zurück bei D&I Kozijnen ERP'},
 nl:{dashboard:'Dashboard',kunden:'Klanten',projekte:'Projecten',produktion:'Productie',lager:'Magazijn',wareneingang:'Goederenontvangst',bestellliste:'Bestellijst',montage:'Montage',kalender:'Kalender',mitarbeiter:'Medewerkers',zeit:'Tijdregistratie',angebote:'Offertes',rechnungen:'Facturen',qr:'QR-codes',whatsapp:'WhatsApp',ki:'AI-assistent',settings:'Instellingen',search:'Zoeken...',newProject:'Nieuw project',activeProjects:'Actieve projecten',tasks:'Taken',stock:'Voorraad artikelen',users:'Medewerkers',welcome:'Welkom terug bij D&I Kozijnen ERP'},
 en:{dashboard:'Dashboard',kunden:'Customers',projekte:'Projects',produktion:'Production',lager:'Stock',wareneingang:'Goods receipt',bestellliste:'Order list',montage:'Installation',kalender:'Calendar',mitarbeiter:'Employees',zeit:'Time tracking',angebote:'Quotes',rechnungen:'Invoices',qr:'QR Codes',whatsapp:'WhatsApp',ki:'AI Assistant',settings:'Settings',search:'Search...',newProject:'New project',activeProjects:'Active projects',tasks:'Tasks',stock:'Stock items',users:'Employees',welcome:'Welcome back to D&I Kozijnen ERP'},
 pl:{dashboard:'Panel',kunden:'Klienci',projekte:'Projekty',produktion:'Produkcja',lager:'Magazyn',wareneingang:'Przyjęcie towaru',bestellliste:'Lista zamówień',montage:'Montaż',kalender:'Kalendarz',mitarbeiter:'Pracownicy',zeit:'Czas pracy',angebote:'Oferty',rechnungen:'Faktury',qr:'Kody QR',whatsapp:'WhatsApp',ki:'Asystent AI',settings:'Ustawienia',search:'Szukaj...',newProject:'Nowy projekt',activeProjects:'Aktywne projekty',tasks:'Zadania',stock:'Artykuły magazynowe',users:'Pracownicy',welcome:'Witamy w D&I Kozijnen ERP'}
};

const nav:{id:Module;icon:any}[]=[
 {id:'dashboard',icon:Home},{id:'kunden',icon:Users},{id:'projekte',icon:FolderKanban},{id:'produktion',icon:Factory},{id:'lager',icon:Package},{id:'wareneingang',icon:Warehouse},{id:'bestellliste',icon:FileText},{id:'montage',icon:Truck},{id:'kalender',icon:CalendarDays},{id:'mitarbeiter',icon:UserCog},{id:'zeit',icon:Clock},{id:'angebote',icon:FileText},{id:'rechnungen',icon:Receipt},{id:'qr',icon:QrCode},{id:'whatsapp',icon:MessageCircle},{id:'ki',icon:Bot},{id:'settings',icon:Settings}
];

export default function Page(){
 const [mod,setMod]=useState<Module>('dashboard');
 const [lang,setLang]=useState<Lang>('de');
 const [dark,setDark]=useState(false);
 const t=labels[lang];
 const [customers,setCustomers]=useState<any[]>([]);
 const [projects,setProjects]=useState<any[]>([]);
 const [stock,setStock]=useState<any[]>([]);
 async function loadStock(){
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    alert('Fehler beim Laden: '+error.message);
    return;
  }

  setStock(data || []);
}
 async function loadProjects(){
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    alert('Fehler beim Laden der Projekte: '+error.message);
    return;
  }

  setProjects(data || []);
}

async function loadCustomers(){
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    alert('Fehler beim Laden: '+error.message);
    return;
  }

  setCustomers(data || []);
}

 useEffect(()=>{ loadCustomers(); loadProjects(); loadStock(); },[]);

 const addCustomer=async()=>{
  const company_name=prompt('Firmenname / Kundenname?');
  if(!company_name)return;
  const contact_person=prompt('Ansprechpartner?')||'';
  const phone=prompt('Telefon?')||'';
  const email=prompt('E-Mail?')||'';
  const city=prompt('Ort?')||'';
  const address=prompt('Adresse?')||'';
  const notes=prompt('Notizen?')||'';

  const { error } = await supabase.from('customers').insert([{company_name,contact_person,phone,email,city,address,notes}]);
  if(error){ alert('Fehler beim Speichern: '+error.message); return; }
  await loadCustomers();
 };

 const editCustomer=async(c:any)=>{
  const company_name=prompt('Firmenname / Kundenname?',c.company_name||'');
  if(!company_name)return;
  const phone=prompt('Telefon?',c.phone||'')||'';
  const city=prompt('Ort?',c.city||'')||'';
  const email=prompt('E-Mail?',c.email||'')||'';

  const { error } = await supabase.from('customers').update({company_name,phone,city,email}).eq('id',c.id);
  if(error){ alert('Fehler beim Bearbeiten: '+error.message); return; }
  await loadCustomers();
 };

 const deleteCustomer=async(c:any)=>{
  if(!confirm('Kunde wirklich löschen?'))return;
  const { error } = await supabase.from('customers').delete().eq('id',c.id);
  if(error){ alert('Fehler beim Löschen: '+error.message); return; }
  await loadCustomers();
 };

 const addProject=async()=>{

  const project_name=prompt('Projektname?');
  if(!project_name)return;

  const customer=prompt('Kunde?')||'';
  const price=prompt('Preis?')||'';

  const project_number='P-'+Math.floor(10000+Math.random()*89999);

  const { error } = await supabase
    .from('projects')
    .insert([{
      project_number,
      project_name,
      customer,
      status:'Anfrage',
      price
    }]);

  if(error){
    alert(error.message);
    return;
  }

  await loadProjects();
};
const editProject = async (p:any) => {
  const project_name = prompt('Projektname?', p.project_name || '');
  if (!project_name) return;

  const customer = prompt('Kunde?', p.customer || '') || '';
  const status = prompt('Status?', p.status || 'Anfrage') || 'Anfrage';
  const price = prompt('Preis?', p.price || '') || '';

  const { error } = await supabase
    .from('projects')
    .update({
      project_name,
      customer,
      status,
      price
    })
    .eq('id', p.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadProjects();
};

const deleteProject = async (p:any) => {
  if (!confirm('Projekt löschen?')) return;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', p.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadProjects();
};
 return <div className={dark?'app darkPreview':'app'}>
  <aside className="rail"><div className="brandDot"/>{nav.slice(0,12).map(n=>{const I=n.icon;return <button key={n.id} className={'iconBtn '+(mod===n.id?'active':'')} onClick={()=>setMod(n.id)}><I size={19}/></button>})}</aside>
  <aside className="side"><div className="logo">D&I Kozijnen ERP</div>{nav.map(n=>{const I=n.icon;return <div key={n.id} onClick={()=>setMod(n.id)} className={'navItem '+(mod===n.id?'active':'')}><I size={18}/>{t[n.id]}</div>})}</aside>
  <main className="main">
   <div className="top"><input className="search" placeholder={t.search}/><button className="pill"><Bell size={16}/> 3</button><select className="pill" value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="de">DE</option><option value="nl">NL</option><option value="en">EN</option><option value="pl">PL</option></select><button className="primary" onClick={addProject}><Plus size={16}/> {t.newProject}</button></div>
   <section className="content">
    <h1 className="h1">{t[mod]}</h1><div className="crumb">D&I Kozijnen / {t[mod]} · {t.welcome}</div>
    {mod==='dashboard'&&<Dashboard t={t} projects={projects.length} customers={customers.length} stock={stock.length}/>}
    {mod==='kunden'&&<CustomersModule customers={customers} addCustomer={addCustomer} editCustomer={editCustomer} deleteCustomer={deleteCustomer}/>}
    {mod==='projekte'&&
<Projects
projects={projects}
addProject={addProject}
editProject={editProject}
deleteProject={deleteProject}
/>}
    {mod==='produktion'&&<Production/>}
    {mod==='lager'&&<Stock stock={stock} setStock={setStock}/>}
    {mod==='wareneingang'&&<IncomingGoods stock={stock} setStock={setStock}/>}
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
 </div>
}

function CustomersModule({customers,addCustomer,editCustomer,deleteCustomer}:any){
 return <div className="card">
  <div className="actions" style={{justifyContent:'space-between'}}>
   <h2>Kunden</h2>
   <button className="primary" onClick={addCustomer}><Plus size={16}/> Kunde hinzufügen</button>
  </div>
  <table className="table">
   <thead><tr><th>Kunde</th><th>Telefon</th><th>Ort</th><th>Status</th><th>Aktion</th></tr></thead>
   <tbody>
    {customers.map((c:any)=><tr key={c.id}>
     <td>{c.company_name || '-'}</td>
     <td>{c.phone || '-'}</td>
     <td>{c.city || '-'}</td>
     <td><span className="badge b-green">Aktiv</span></td>
     <td>
      <button className="pill" onClick={()=>editCustomer(c)}><Pencil size={14}/> Bearbeiten</button>
      <button className="pill" onClick={()=>deleteCustomer(c)}><Trash2 size={14}/> Löschen</button>
     </td>
    </tr>)}
   </tbody>
  </table>
 </div>
}

function Dashboard({t,projects,customers,stock}:any){return <><div className="grid cards"><Stat title={t.activeProjects} value={projects}/><Stat title="Kunden" value={customers}/><Stat title={t.stock} value={stock}/><Stat title={t.users} value="12"/></div><div className="grid two"><div className="card"><h2>Project Overview</h2><div className="chart"/></div><div className="card"><h2>Tasks Status</h2><p className="statNum">54</p><p className="small">Montage, Produktion, Lager, Angebote</p><button className="primary">Create New Task</button></div></div></>}
function Stat({title,value}:any){return <div className="card stat"><div className="statIcon"><Package size={22}/></div><div><div className="small">{title}</div><div className="statNum">{value}</div><div className="small" style={{color:'#16a34a'}}>+ 12.5%</div></div></div>}
function DataModule({title,button,onAdd,rows,headers}:any){return <div className="card"><div className="actions" style={{justifyContent:'space-between'}}><h2>{title}</h2><button className="primary" onClick={onAdd}><Plus size={16}/> {button}</button></div><table className="table"><thead><tr>{headers.map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r:any,i:number)=><tr key={i}>{r.map((c:string,j:number)=><td key={j}>{j===2?<span className="badge b-green">{c}</span>:c}</td>)}</tr>)}</tbody></table></div>}
function Projects({projects,addProject,editProject,deleteProject}:any){
 return <div className="card">
  <div className="actions" style={{justifyContent:'space-between'}}>
   <h2>Projekte</h2>
   <button className="primary" onClick={addProject}>Projekt hinzufügen</button>
  </div>
  <table className="table">
   <thead><tr><th>Nr.</th><th>Projekt</th><th>Kunde</th><th>Status</th><th>Preis</th><th>Aktion</th></tr></thead>
   <tbody>
    {projects.map((p:any)=><tr key={p.id}>
     <td>{p.project_number || '-'}</td>
     <td>{p.project_name || '-'}</td>
     <td>{p.customer || '-'}</td>
     <td><span className="badge b-purple">{p.status || 'Anfrage'}</span></td>
     <td>{p.price || '-'}</td>
     <td>
      <button className="pill" onClick={()=>editProject(p)}><Pencil size={14}/> Bearbeiten</button>
      <button className="pill" onClick={()=>deleteProject(p)}><Trash2 size={14}/> Löschen</button>
     </td>
    </tr>)}
   </tbody>
  </table>
 </div>
}
function Production({production,setProduction}:any){
  return (
    <div className="card">

      <h2>Produktion</h2>

      <button
        className="primary"
        onClick={async()=>{

          const project=prompt('Projekt?');
          if(!project)return;

          const item=prompt('Artikel?');
          if(!item)return;

          const qty=Number(prompt('Menge?')||0);
          if(!qty)return;

          const {error}=await supabase
            .from('production')
            .insert([{project,item,qty,status:'Offen'}]);

          if(error){
            alert(error.message);
            return;
          }

          const {data}=await supabase
            .from('production')
            .select('*');

          setProduction(data||[]);
        }}
      >
        Produktionsauftrag anlegen
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>Projekt</th>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {production.map((p:any)=>
            <tr key={p.id}>
              <td>{p.project}</td>
              <td>{p.item}</td>
              <td>{p.qty}</td>
              <td>{p.status}</td>
            </tr>
          )}
        </tbody>

      </table>

    </div>
  )
}
function Stock({stock,setStock}:any){
  return (
    <div className="card">
      <h2>Vorrat / Lager</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Min</th>
            <th>Lagerplatz</th>
            <th>Status</th>
            <th>Aktion</th>
          </tr>
        </thead>

        <tbody>
          {stock.map((s:any)=>(
            <tr key={s.item}>
              <td>{s.item}</td>
              <td>{s.qty}</td>
              <td>{s.min}</td>
              <td>{s.location || '-'}</td>

              <td>
                <span className={s.qty > s.min ? "badge b-green" : "badge b-red"}>
                  {s.qty > s.min ? "OK" : "Niedrig"}
                </span>
              </td>

              <td>
                <button
                  className="pill"
                  onClick={()=>{
                    const item=prompt('Artikel',s.item)||s.item;
                    const qty=Number(prompt('Menge',String(s.qty)))||s.qty;
                    const min=Number(prompt('Mindestbestand',String(s.min)))||s.min;
                    const location=prompt('Lagerplatz',s.location||'')||'';

                    setStock((old:any[])=>
                      old.map((x:any)=>
                        x.item===s.item
                          ? {...x,item,qty,min,location}
                          : x
                      )
                    );
                  }}
                >
                  Bearbeiten
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function IncomingGoods({stock,setStock}:any){
  const receive=async()=>{
    const item=prompt('Artikel?');
    if(!item)return;

    const qty=Number(prompt('Menge?')||0);
    if(!qty)return;
    const location=prompt('Lagerplatz?')||'';
    const existing=stock.find((s:any)=>s.item===item);

    if(existing){
      const newQty=(existing.qty||0)+qty;

      const { error } = await supabase
        .from('stock')
        .update({qty:newQty,location})
        .eq('id',existing.id);

      if(error){ alert(error.message); return; }
    }else{
      const { error } = await supabase
        .from('stock')
        .insert([{item,qty,min:0,location}]);

      if(error){ alert(error.message); return; }
    }

    const { data } = await supabase
      .from('stock')
      .select('*')
      .order('created_at',{ascending:false});

    setStock(data || []);
  };

  return (
    <div className="card">
      <h2>Wareneingang</h2>
      <button className="primary" onClick={receive}>Lieferung erfassen</button>
    </div>
  )
}
function CalendarView(){return <div className="card"><h2>Kalender</h2><p>Kalender vorbereitet.</p></div>}
function Simple({title,text}:any){return <div className="card"><h2>{title}</h2><p>{text}</p><button className="primary">Speichern</button></div>}
