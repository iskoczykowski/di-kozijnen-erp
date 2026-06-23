'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Lang = 'de' | 'nl';
type Module =
  | 'dashboard'
  | 'customers'
  | 'projects'
  | 'production'
  | 'stock'
  | 'delivery'
  | 'orders'
  | 'montage'
  | 'calendar'
  | 'employees'
  | 'messages';

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');
  const [events,setEvents] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [production,setProduction] = useState<any[]>([]);

  const t:any = {
    de: {
      search:'Suchen...', today:'Heute', calendar:'Kalender', info:'Informationen',
      customers:'Kunden', projects:'Projekte', addCustomer:'Kunde hinzufügen',
      addProject:'Projekt hinzufügen', name:'Name', phone:'Telefon', email:'E-Mail',
      address:'Adresse', city:'Ort', status:'Status', active:'Aktiv',
      number:'Nummer', project:'Projekt', customer:'Kunde', price:'Preis',
      action:'Aktion', edit:'Bearbeiten', del:'Löschen',
      activeProjects:'Aktive Projekte', doneOrders:'Fertige Aufträge',
      nextEvent:'Nächster Termin', openOrders:'Offene Aufträge',
      notes:'Notizen', important:'Wichtige Ereignisse', upcoming:'Kommende Termine',
      deleteAsk:'Löschen?'
    },
    nl: {
      search:'Zoeken...', today:'Vandaag', calendar:'Kalender', info:'Informatie',
      customers:'Klanten', projects:'Projecten', addCustomer:'Klant toevoegen',
      addProject:'Project toevoegen', name:'Naam', phone:'Telefoon', email:'E-mail',
      address:'Adres', city:'Plaats', status:'Status', active:'Actief',
      number:'Nummer', project:'Project', customer:'Klant', price:'Prijs',
      action:'Actie', edit:'Bewerken', del:'Verwijderen',
      activeProjects:'Actieve projecten', doneOrders:'Afgeronde opdrachten',
      nextEvent:'Volgende afspraak', openOrders:'Openstaande opdrachten',
      notes:'Notities', important:'Belangrijke gebeurtenissen', upcoming:'Aankomende afspraken',
      deleteAsk:'Verwijderen?'
    }
  }[lang];

  async function loadCustomers() {
    const { data } = await supabase.from('customers').select('*').order('created_at',{ascending:false});
    setCustomers(data || []);
  }

  async function loadProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at',{ascending:false});
    setProjects(data || []);
  }

  useEffect(() => {
  loadCustomers();
  loadProjects();
  loadProduction();
}, []);

  async function addCustomer() {
    const company_name = prompt(t.name + '?');
    if (!company_name) return;
    const phone = prompt(t.phone + '?') || '';
    const email = prompt(t.email + '?') || '';
    const address = prompt(t.address + '?') || '';
    const city = prompt(t.city + '?') || '';

    const { error } = await supabase.from('customers').insert([{company_name, phone, email, address, city}]);
    if (error) return alert(error.message);
    loadCustomers();
  }

  async function deleteCustomer(c:any) {
    if (!confirm(t.deleteAsk)) return;
    const { error } = await supabase.from('customers').delete().eq('id', c.id);
    if (error) return alert(error.message);
    loadCustomers();
  }

  async function addProject() {
    const project_number = prompt(t.number + '?');
    if (!project_number) return;
    const project_name = prompt(t.project + '?');
    if (!project_name) return;
    const customer = prompt(t.customer + '?') || '';
    const price = prompt(t.price + '?') || '';

    const { error } = await supabase.from('projects').insert([{
      project_number,
      project_name,
      customer,
      status: lang === 'de' ? 'Anfrage' : 'Aanvraag',
      price,
      notes: ''
    }]);

    if (error) return alert(error.message);
    loadProjects();
  }

  async function loadProduction() {
  const { data } = await supabase
    .from('production')
    .select('*')
    .order('created_at',{ascending:false});

  setProduction(data || []);
}
  async function deleteProject(id:any) {
    if (!confirm(t.deleteAsk)) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return alert(error.message);
    loadProjects();
  }

  return (
    <div style={app}>
      <aside style={side}>
        <div style={logo}></div>
        <button onClick={()=>setModule('dashboard')} style={iconBtn}>🏠</button>
        <button onClick={()=>setModule('customers')} style={iconBtn}>👥</button>
        <button onClick={()=>setModule('projects')} style={iconBtn}>📁</button>
        <button onClick={() => setModule('production')} style={iconBtn}>🏭</button>
        <button onClick={() => setModule('stock')} style={iconBtn}>📦</button>
        <button onClick={() => setModule('delivery')} style={iconBtn}>🚚</button>
        <button onClick={() => setModule('orders')} style={iconBtn}>📋</button>
        <button onClick={() => setModule('montage')} style={iconBtn}>🔧</button>
        <button onClick={() => setModule('calendar')} style={iconBtn}>📅</button>
        <button onClick={() => setModule('employees')} style={iconBtn}>👷</button>
        <button onClick={() => setModule('messages')} style={iconBtn}>💬</button>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1>D&I Kozijnen ERP</h1>
          <div style={{display:'flex',gap:15}}>
            <input placeholder={t.search} style={search}/>
            <select value={lang} onChange={(e)=>setLang(e.target.value as Lang)} style={select}>
              <option value="de">DE</option>
              <option value="nl">NL</option>
            </select>
          </div>
        </header>

        {module === 'dashboard' && (
          <div style={grid}>
            <section style={card}>
              <h2>{t.today}</h2>
              <Event color="#c93670" title="Montage Müller" time="08:30"/>
              <Event color="#38a852" title={lang==='de'?'Kundentermin':'Klantafspraak'} time="11:40"/>
              <Event color="#29a9c9" title={lang==='de'?'Lieferung Glas':'Glaslevering'} time="14:00"/>
              <Event color="#c85a12" title="Produktion Projekt A" time="16:30"/>
            </section>

            <section style={card}>
              <Calendar events={events} setEvents={setEvents} lang={lang}/>
            </section>

            <section style={cardSmall}>
              <h2>{t.info}</h2>
              <Stat title={t.activeProjects} value="128"/>
              <Stat title={t.doneOrders} value="57"/>
              <Stat title={t.nextEvent} value="3h 12m"/>
              <Stat title={t.openOrders} value="12"/>
            </section>

            <section style={card}>
              <h2>{t.notes}</h2>
              <p>☐ Glas bestellen</p>
              <small>{lang==='de'?'Lieferant kontaktieren':'Leverancier contacteren'}</small>
            </section>

            <section style={card}>
              <h2>{t.important}</h2>
              <Event color="#c93670" title="Montage Team 1" time="23 Jun 08:30"/>
              <Event color="#c85a12" title={lang==='de'?'Material Lieferung':'Materiaal levering'} time="07 Jul 08:50"/>
            </section>

            <section style={cardSmall}>
              <h2>{t.upcoming}</h2>
              <Event color="#c93670" title={lang==='de'?'Kundentermin':'Klantafspraak'} time="Heute 08:30"/>
            </section>
          </div>
        )}

        {module === 'customers' && (
          <section style={cardWide}>
            <div style={topRow}>
              <h2>👥 {t.customers}</h2>
              <button onClick={addCustomer} style={primary}>+ {t.addCustomer}</button>
            </div>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t.name}</th>
                  <th style={th}>{t.phone}</th>
                  <th style={th}>{t.email}</th>
                  <th style={th}>{t.address}</th>
                  <th style={th}>{t.city}</th>
                  <th style={th}>{t.status}</th>
                  <th style={th}>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c:any)=>(
                  <tr key={c.id}>
                    <td style={td}>{c.company_name}</td>
                    <td style={td}>{c.phone}</td>
                    <td style={td}>{c.email}</td>
                    <td style={td}>{c.address}</td>
                    <td style={td}>{c.city}</td>
                    <td style={td}>✅ {t.active}</td>
                    <td style={td}>
                      <button onClick={()=>deleteCustomer(c)}>{t.del}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {module === 'projects' && (
          <section style={cardWide}>
            <div style={topRow}>
              <h2>📁 {t.projects}</h2>
              <button onClick={addProject} style={primary}>+ {t.addProject}</button>
            </div>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t.number}</th>
                  <th style={th}>{t.project}</th>
                  <th style={th}>{t.customer}</th>
                  <th style={th}>{t.status}</th>
                  <th style={th}>{t.price}</th>
                  <th style={th}>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p:any)=>(
                  <tr key={p.id}>
                    <td style={td}>{p.project_number}</td>
                    <td style={td}>{p.project_name}</td>
                    <td style={td}>{p.customer}</td>
                    <td style={td}>{p.status}</td>
                    <td style={td}>{p.price}</td>
                    <td style={td}>
                      <button onClick={()=>deleteProject(p.id)}>{t.del}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {module === 'production' && (
<section style={card}>
<h2>🏭 {t.production}</h2>

<table style={table}>
<thead>
<tr>
<th style={th}>{t.project}</th>
<th style={th}>{t.item}</th>
<th style={th}>{t.qty}</th>
<th style={th}>{t.status}</th>
<th style={th}>{t.notes}</th>
</tr>
</thead>

<tbody>
{production.map((p:any)=>(
<tr key={p.id}>
<td style={td}>{p.project}</td>
<td style={td}>{p.item}</td>
<td style={td}>{p.qty}</td>
<td style={td}>{p.status}</td>
<td style={td}>{p.notes}</td>
</tr>
))}
</tbody>

</table>
</section>
)}

{module === 'stock' && (
  <div>
    <h2>📦 Lager</h2>
  </div>
)}

{module === 'delivery' && (
  <div>
    <h2>🚚 Lieferungen</h2>
  </div>
)}

{module === 'orders' && (
  <div>
    <h2>📋 Aufträge</h2>
  </div>
)}

{module === 'montage' && (
  <div>
    <h2>🔧 Montage</h2>
  </div>
)}

{module === 'calendar' && (
  <div>
    <h2>📅 Kalender</h2>
  </div>
)}

{module === 'employees' && (
  <div>
    <h2>👷 Mitarbeiter</h2>
  </div>
)}

{module === 'messages' && (
  <div>
    <h2>💬 Nachrichten</h2>
  </div>
)}
      </main>
    </div>
  );
}


function Event({color,title,time}:any) {
  return (
    <div style={event}>
      <span><b style={{color}}>●</b> {title}</span>
      <small>{time}</small>
    </div>
  );
}

function Stat({title,value}:any) {
  return (
    <div style={{marginBottom:18}}>
      <small>{title}</small>
      <div style={{fontSize:34,fontWeight:800,color:'#1277bd'}}>{value}</div>
    </div>
  );
}

function Calendar({events,setEvents,lang}:any) {
  const [year,setYear] = useState(2026);

  const months = lang==='nl'
    ? ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
    : ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  const addEvent=(month:number,day:number)=>{
    const title=prompt(lang==='nl'?'Afspraak?':'Termin?');
    if(!title)return;
    const time=prompt(lang==='nl'?'Tijd?':'Uhrzeit?')||'';
    setEvents([{id:Date.now(),year,month,day,title,time},...events]);
  };

  const editEvent=(ev:any)=>{
  const title=prompt(lang==='nl'?'Afspraak?':'Termin?',ev.title)||ev.title;
  const time=prompt(lang==='nl'?'Tijd?':'Uhrzeit?',ev.time)||ev.time;
  setEvents(events.map((e:any)=>e.id===ev.id?{...e,title,time}:e));
};

const deleteEvent=(id:number)=>{
  if(!confirm(lang==='nl'?'Afspraak verwijderen?':'Termin löschen?'))return;
  setEvents(events.filter((e:any)=>e.id!==id));
};

return (
    <div>
      <div style={topRow}>
        <button onClick={()=>setYear(Math.max(2026,year-1))}>{'<'}</button>
        <h2>{lang==='nl'?'Kalender':'Kalender'} {year}</h2>
        <button onClick={()=>setYear(Math.min(2030,year+1))}>{'>'}</button>
      </div>

      <div style={monthsGrid}>
        {months.map((m:string,month:number)=>(
          <div key={m} style={monthBox}>
            <b>{m}</b>

            <div style={daysGrid}>
              {Array.from({length:31},(_,i)=>i+1).map(day=>(
                <div
                  key={day}
                  onDoubleClick={()=>addEvent(month,day)}
                  style={{
                    background:'#fff',
                    borderRadius:8,
                    padding:4,
                    minHeight:42,
                    cursor:'pointer'
                  }}
                >
                  <b>{day}</b>

                  {events
                    .filter((e:any)=>e.year===year && e.month===month && e.day===day)
                    .map((ev:any)=>(
                      <div key={ev.id} style={{fontSize:10,marginTop:4,background:'#dbeafe',borderRadius:6,padding:3}}>
                        {ev.time} {ev.title}
                        <br/>
                        <button onClick={()=>editEvent(ev)}>✏️</button>
                        <button onClick={()=>deleteEvent(ev.id)}>🗑</button>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{marginTop:12}}>
        {lang==='nl'
          ? 'Dubbelklik op een dag om een afspraak toe te voegen.'
          : 'Doppelklick auf einen Tag, um einen Termin hinzuzufügen.'}
      </div>
    </div>
  );
};

  return (
    <div>
      <div style={topRow}>
        <button onClick={()=>setYear(Math.max(2026,year-1))}>{'<'}</button>
        <h2>Kalender {year}</h2>
        <button onClick={()=>setYear(Math.min(2030,year+1))}>{'>'}</button>
      </div>
      <div style={monthsGrid}>
        {months.map((m)=>(
          <div key={m} style={monthBox}>
            <b>{m}</b>
            <div style={daysGrid}>
              {days.map(d=><span key={d}>{d}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const app:any = {minHeight:'100vh',background:'#f4f7fb',fontFamily:'Arial',display:'flex'};
const side:any = {width:82,background:'#fff',padding:18,boxShadow:'0 20px 60px #0001'};
const logo:any = {width:44,height:44,borderRadius:14,background:'#2563eb',marginBottom:24};
const iconBtn:any = {display:'block',width:'100%',border:0,background:'transparent',fontSize:22,padding:14,cursor:'pointer'};
const main:any = {flex:1,padding:32};
const header:any = {display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28};
const search:any = {padding:14,borderRadius:18,border:'1px solid #ddd',width:260};
const select:any = {padding:12,borderRadius:14};
const grid:any = {display:'grid',gridTemplateColumns:'1.2fr 1.4fr .8fr',gap:24};
const card:any = {background:'#fff',borderRadius:24,padding:24,boxShadow:'0 20px 50px #0001',minHeight:220};
const cardSmall:any = {...card};
const cardWide:any = {...card};
const topRow:any = {display:'flex',justifyContent:'space-between',alignItems:'center'};
const event:any = {display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #eee'};
const primary:any = {padding:'12px 18px',border:0,borderRadius:14,background:'#2563eb',color:'#fff',fontWeight:700};
const table:any = {width:'100%',borderCollapse:'collapse',marginTop:20};
const th:any = {textAlign:'left',padding:12,borderBottom:'1px solid #ddd'};
const td:any = {padding:12,borderBottom:'1px solid #eee'};
const monthsGrid:any = {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12};
const monthBox:any = {background:'#f8fafc',borderRadius:14,padding:12};
const daysGrid:any = {display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,fontSize:12,marginTop:8};
