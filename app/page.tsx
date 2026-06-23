'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Lang = 'de' | 'nl';
type Module = 'dashboard' | 'customers';

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');
  const [customers, setCustomers] = useState<any[]>([]);

  const text:any = {
    de: {
      search:'Suchen...',
      today:'Heute',
      info:'Informationen',
      notes:'Notizen',
      important:'Wichtige Ereignisse',
      upcoming:'Kommende Termine',
      calendar:'Kalender',
      customers:'Kunden',
      addCustomer:'Kunde hinzufügen',
      edit:'Bearbeiten',
      del:'Löschen',
      name:'Name',
      phone:'Telefon',
      email:'E-Mail',
      address:'Adresse',
      city:'Ort',
      status:'Status',
      active:'Aktiv',
      activeProjects:'Aktive Projekte',
      doneOrders:'Fertige Aufträge',
      nextEvent:'Nächster Termin',
      openOrders:'Offene Aufträge',
      productionOpen:'Produktion offen',
      montageOpen:'Montage offen',
      stockCheck:'Lager prüfen',
      customerAppointment:'Kundentermin',
      glassDelivery:'Lieferung Glas',
      productionProject:'Produktion Projekt A',
      supplierCall:'Lieferant kontaktieren',
      invoiceSend:'Rechnung senden',
      confirmDate:'Termin bestätigen',
    },
    nl: {
      search:'Zoeken...',
      today:'Vandaag',
      info:'Informatie',
      notes:'Notities',
      important:'Belangrijke gebeurtenissen',
      upcoming:'Aankomende afspraken',
      calendar:'Kalender',
      customers:'Klanten',
      addCustomer:'Klant toevoegen',
      edit:'Bewerken',
      del:'Verwijderen',
      name:'Naam',
      phone:'Telefoon',
      email:'E-mail',
      address:'Adres',
      city:'Plaats',
      status:'Status',
      active:'Actief',
      activeProjects:'Actieve projecten',
      doneOrders:'Afgeronde opdrachten',
      nextEvent:'Volgende afspraak',
      openOrders:'Openstaande opdrachten',
      productionOpen:'Productie open',
      montageOpen:'Montage open',
      stockCheck:'Magazijn controleren',
      customerAppointment:'Klantafspraak',
      glassDelivery:'Glaslevering',
      productionProject:'Productie Project A',
      supplierCall:'Leverancier contacteren',
      invoiceSend:'Factuur sturen',
      confirmDate:'Afspraak bevestigen',
    }
  }[lang];

  async function loadCustomers(){
    const { data } = await supabase.from('customers').select('*').order('created_at',{ascending:false});
    setCustomers(data || []);
  }

  useEffect(()=>{ loadCustomers(); },[]);

  async function addCustomer(){
    const company_name = prompt(text.name + '?');
    if(!company_name)return;
    const phone = prompt(text.phone + '?') || '';
    const email = prompt(text.email + '?') || '';
    const address = prompt(text.address + '?') || '';
    const city = prompt(text.city + '?') || '';

    const { error } = await supabase.from('customers').insert([{company_name,phone,email,address,city}]);
    if(error){ alert(error.message); return; }
    await loadCustomers();
  }

  async function editCustomer(c:any){
    const company_name = prompt(text.name + '?', c.company_name || '');
    if(!company_name)return;
    const phone = prompt(text.phone + '?', c.phone || '') || '';
    const email = prompt(text.email + '?', c.email || '') || '';
    const address = prompt(text.address + '?', c.address || '') || '';
    const city = prompt(text.city + '?', c.city || '') || '';

    const { error } = await supabase.from('customers').update({company_name,phone,email,address,city}).eq('id',c.id);
    if(error){ alert(error.message); return; }
    await loadCustomers();
  }

  async function deleteCustomer(c:any){
    if(!confirm(text.del + '?'))return;
    const { error } = await supabase.from('customers').delete().eq('id',c.id);
    if(error){ alert(error.message); return; }
    await loadCustomers();
  }

  return (
    <div style={app}>
      <aside style={side}>
        <div style={logo}></div>
        <button onClick={()=>setModule('dashboard')} style={iconBtn}>🏠</button>
        <button onClick={()=>setModule('customers')} style={iconBtn}>👥</button>
        <button style={iconBtn}>📁</button>
        <button style={iconBtn}>🏭</button>
        <button style={iconBtn}>📦</button>
        <button style={iconBtn}>🚚</button>
        <button style={iconBtn}>📋</button>
        <button style={iconBtn}>🔧</button>
        <button style={iconBtn}>📅</button>
        <button style={iconBtn}>👷</button>
        <button style={iconBtn}>💬</button>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1>D&I Kozijnen ERP</h1>
          <div style={{display:'flex',gap:15}}>
            <input placeholder={text.search} style={search}/>
            <select value={lang} onChange={(e)=>setLang(e.target.value as Lang)} style={select}>
              <option value="de">DE</option>
              <option value="nl">NL</option>
            </select>
            <span>🔔</span>
            <span>👤</span>
          </div>
        </header>

        {module==='dashboard' && (
          <div style={grid}>
            <section style={card}>
              <h2>{text.today}</h2>
              <Event color="#ec4899" title="Montage Müller" time="08:30"/>
              <Event color="#22c55e" title={text.customerAppointment} time="11:40"/>
              <Event color="#06b6d4" title={text.glassDelivery} time="14:00"/>
              <Event color="#f97316" title={text.productionProject} time="16:30"/>
            </section>

            <section style={card}>
              <h2>{text.calendar} 2026</h2>
              <Calendar/>
            </section>

            <section style={card}>
              <h2>{text.info}</h2>
              <Stat title={text.activeProjects} value="128"/>
              <Stat title={text.doneOrders} value="57"/>
              <Stat title={text.nextEvent} value="3h 12m"/>
              <Stat title={text.openOrders} value="12"/>
            </section>

            <section style={card}>
              <h2>{text.notes}</h2>
              <Note title="Glas bestellen" text={text.supplierCall}/>
              <Note title={text.invoiceSend} text="Projekt Müller"/>
              <Note title={text.customerAppointment} text={text.confirmDate}/>
            </section>

            <section style={card}>
              <h2>{text.important}</h2>
              <Event color="#ec4899" title="Montage Team 1" time="23 Jun 08:30"/>
              <Event color="#f97316" title={text.glassDelivery} time="07 Jul 08:50"/>
              <Event color="#6366f1" title="Urlaub / Verlof" time="14 Jul 10:00"/>
            </section>

            <section style={card}>
              <h2>{text.upcoming}</h2>
              <Event color="#ec4899" title={text.customerAppointment} time="Heute 08:30"/>
              <Event color="#22c55e" title="Montage" time="Heute 11:40"/>
              <Event color="#06b6d4" title={text.productionProject} time="Heute 14:00"/>
            </section>
          </div>
        )}

        {module==='customers' && (
          <section style={cardWide}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2>👥 {text.customers}</h2>
              <button onClick={addCustomer} style={primary}>+ {text.addCustomer}</button>
            </div>

            <table style={{width:'100%',borderCollapse:'collapse',marginTop:20}}>
              <thead>
                <tr>
                  <th style={th}>{text.name}</th>
                  <th style={th}>{text.phone}</th>
                  <th style={th}>{text.email}</th>
                  <th style={th}>{text.address}</th>
                  <th style={th}>{text.city}</th>
                  <th style={th}>{text.status}</th>
                  <th style={th}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c=>(
                  <tr key={c.id}>
                    <td style={td}>{c.company_name}</td>
                    <td style={td}>{c.phone}</td>
                    <td style={td}>{c.email}</td>
                    <td style={td}>{c.address}</td>
                    <td style={td}>{c.city}</td>
                    <td style={td}>✅ {text.active}</td>
                    <td style={td}>
                      <button onClick={()=>editCustomer(c)}>{text.edit}</button>
                      <button onClick={()=>deleteCustomer(c)}>{text.del}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

function Calendar(){
  const nums = Array.from({length:35},(_,i)=>i+1);
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10,textAlign:'center'}}>
      {['MO','TU','WE','TH','FR','SA','SU'].map(d=><b key={d}>{d}</b>)}
      {nums.map(n=>(
        <div key={n} style={{
          padding:10,
          borderRadius:12,
          background:n===7?'#ec4899':n===12?'#22c55e':n===23?'#06b6d4':'#f8fafc',
          color:[7,12,23].includes(n)?'#fff':'#111'
        }}>{n}</div>
      ))}
    </div>
  )
}

function Event({color,title,time}:any){
  return <div style={event}><span><b style={{color}}>●</b> {title}</span><small>{time}</small></div>
}

function Note({title,text}:any){
  return <div style={event}><span>☐ <b>{title}</b><br/><small>{text}</small></span></div>
}

function Stat({title,value}:any){
  return <div style={{marginBottom:18}}><small>{title}</small><div style={{fontSize:34,fontWeight:800,color:'#0ea5e9'}}>{value}</div></div>
}

const app:any={minHeight:'100vh',background:'#f4f7fb',fontFamily:'Arial',display:'flex'};
const side:any={width:82,background:'#fff',padding:18,boxShadow:'0 20px 60px #0001'};
const logo:any={width:44,height:44,borderRadius:14,background:'#2563eb',marginBottom:24};
const iconBtn:any={display:'block',width:'100%',border:0,background:'transparent',fontSize:24,margin:'18px 0',cursor:'pointer'};
const main:any={flex:1,padding:32};
const header:any={display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28};
const search:any={padding:14,borderRadius:18,border:0,width:260};
const select:any={padding:12,borderRadius:14};
const grid:any={display:'grid',gridTemplateColumns:'1.2fr 1.4fr .8fr',gap:24};
const card:any={background:'#fff',borderRadius:24,padding:24,boxShadow:'0 20px 50px #00000012'};
const cardWide:any={...card};
const event:any={display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'};
const primary:any={padding:'12px 18px',border:0,borderRadius:14,background:'#2563eb',color:'#fff'};
const th:any={textAlign:'left',padding:12,borderBottom:'1px solid #ddd'};
const td:any={padding:12,borderBottom:'1px solid #eee'};
