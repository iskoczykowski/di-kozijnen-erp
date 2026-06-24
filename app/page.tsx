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
  const [montageFiles,setMontageFiles] = useState<any[]>([]);

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
  useEffect(() => {
  const saved = localStorage.getItem('erp_events');

  if (saved) {
    setEvents(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    'erp_events',
    JSON.stringify(events)
  );
}, [events]);

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
  status: 'open',
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
  async function changeProjectStatus(p:any) {

  const nextStatus =
    p.status === 'open'
      ? 'working'
      : p.status === 'working'
      ? 'done'
      : 'open';

  const { error } = await supabase
    .from('projects')
    .update({ status: nextStatus })
    .eq('id', p.id);

  if (error) {
    alert(error.message);
    return;
  }

  loadProjects();
}
async function editProject(p:any) {

  const project_name =
    prompt(lang==='de' ? 'Projektname?' : 'Projectnaam?', p.project_name)
    || p.project_name;

  const customer =
    prompt(lang==='de' ? 'Kunde?' : 'Klant?', p.customer)
    || p.customer;

  const price =
    prompt(lang==='de' ? 'Preis?' : 'Prijs?', p.price)
    || p.price;

  const { error } = await supabase
    .from('projects')
    .update({
      project_name,
      customer,
      price
    })
    .eq('id', p.id);

  if (error) return alert(error.message);

  loadProjects();
}
 function addMontageFile(){
  const name = prompt(lang==='de'?'Name der Datei?':'Naam van bestand?');
  if(!name)return;

  const url = prompt(lang==='de'?'Excel-Link einfügen?':'Excel-link invoegen?');
  if(!url)return;

  setMontageFiles([{id:Date.now(),name,url},...montageFiles]);
}

function editMontageFile(f:any){
  const name = prompt(lang==='de'?'Name der Datei?':'Naam van bestand?',f.name) || f.name;
  const url = prompt(lang==='de'?'Excel-Link?':'Excel-link?',f.url) || f.url;

  setMontageFiles(
    montageFiles.map((x:any)=>
      x.id===f.id ? {...x,name,url} : x
    )
  );
}

function deleteMontageFile(id:number){
  if(!confirm(lang==='de'?'Datei löschen?':'Bestand verwijderen?')) return;

  setMontageFiles(
    montageFiles.filter((x:any)=>x.id!==id)
  );
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
  <Calendar
    events={events}
    setEvents={setEvents}
    lang={lang}
  />
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
  <MiniCalendar
    events={events}
    lang={lang}
  />
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
                    <td style={td}>
  <button
    onClick={()=>changeProjectStatus(p)}
    style={{
      background:
        p.status === 'done'
          ? '#22c55e'
          : p.status === 'working'
          ? '#eab308'
          : '#ef4444',
      color:'#fff',
      border:'none',
      borderRadius:8,
      padding:'6px 12px'
    }}
  >
    {
      p.status === 'done'
        ? (lang==='de' ? 'Fertig' : 'Klaar')
        : p.status === 'working'
        ? (lang==='de' ? 'In Bearbeitung' : 'In behandeling')
        : (lang==='de' ? 'Offen' : 'Open')
    }
  </button>
</td>
                    <td style={td}>{p.price}</td>
                    <td style={td}>
                      <td style={td}>
  <button onClick={()=>editProject(p)}>
    {lang==='de' ? 'Bearbeiten' : 'Bewerken'}
  </button>

  <button onClick={()=>deleteProject(p.id)}>
    {lang==='de' ? 'Löschen' : 'Verwijderen'}
  </button>
</td>
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
<td style={td}>
  <button
    style={{
      background:
        p.status === 'done'
          ? '#22c55e'
          : p.status === 'working'
          ? '#eab308'
          : '#ef4444',
      color:'#fff',
      border:'none',
      borderRadius:8,
      padding:'6px 12px'
    }}
  >
    {
      p.status === 'done'
        ? (lang==='nl' ? 'Klaar' : 'Fertig')
        : p.status === 'working'
        ? (lang==='nl' ? 'In behandeling' : 'In Bearbeitung')
        : (lang==='nl' ? 'Open' : 'Offen')
    }
  </button>
</td>
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

function addMontageFile(){
  const name = prompt(lang==='de'?'Name der Datei?':'Naam van bestand?');
  if(!name)return;

  const url = prompt(lang==='de'?'Excel-Link einfügen?':'Excel-link invoegen?');
  if(!url)return;

  setMontageFiles([{id:Date.now(),name,url},...montageFiles]);
}

function editMontageFile(f:any){
  const name = prompt(lang==='de'?'Name der Datei?':'Naam van bestand?',f.name) || f.name;
  const url = prompt(lang==='de'?'Excel-Link?':'Excel-link?',f.url) || f.url;

  setMontageFiles(
    montageFiles.map((x:any)=>
      x.id===f.id ? {...x,name,url} : x
    )
  );
}

function deleteMontageFile(id:number){
  if(!confirm(lang==='de'?'Datei löschen?':'Bestand verwijderen?')) return;

  setMontageFiles(
    montageFiles.filter((x:any)=>x.id!==id)
  );
}

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
  const addEvent = () => {
    const title = prompt(lang==='nl'?'Afspraak?':'Termin?');
    if(!title) return;

    const date = prompt(lang==='nl'?'Datum? bijv. 2026-06-24':'Datum? z.B. 2026-06-24') || '';
    const time = prompt(lang==='nl'?'Tijd?':'Uhrzeit?') || '';

    const typeChoice = prompt(
      lang==='nl'
        ? 'Soort afspraak?\n1 = Klant\n2 = Montage\n3 = Levering\n4 = Productie\n5 = Belangrijk'
        : 'Terminart?\n1 = Kunde\n2 = Montage\n3 = Lieferung\n4 = Produktion\n5 = Wichtig'
    ) || '1';

    const typeMap:any = {
      '1': lang==='nl'?'Klant':'Kunde',
      '2': 'Montage',
      '3': lang==='nl'?'Levering':'Lieferung',
      '4': lang==='nl'?'Productie':'Produktion',
      '5': lang==='nl'?'Belangrijk':'Wichtig'
    };

    const type = typeMap[typeChoice] || typeMap['1'];

    setEvents([
      {id:Date.now(),title,date,time,type},
      ...(events || [])
    ]);
  };

  const editEvent = (ev:any) => {
    const title = prompt(lang==='nl'?'Afspraak?':'Termin?',ev.title) || ev.title;
    const date = prompt(lang==='nl'?'Datum?':'Datum?',ev.date) || ev.date;
    const time = prompt(lang==='nl'?'Tijd?':'Uhrzeit?',ev.time) || ev.time;

    const typeChoice = prompt(
      lang==='nl'
        ? 'Soort afspraak?\n1 = Klant\n2 = Montage\n3 = Levering\n4 = Productie\n5 = Belangrijk'
        : 'Terminart?\n1 = Kunde\n2 = Montage\n3 = Lieferung\n4 = Produktion\n5 = Wichtig'
    ) || '1';

    const typeMap:any = {
      '1': lang==='nl'?'Klant':'Kunde',
      '2': 'Montage',
      '3': lang==='nl'?'Levering':'Lieferung',
      '4': lang==='nl'?'Productie':'Produktion',
      '5': lang==='nl'?'Belangrijk':'Wichtig'
    };

    const type = typeMap[typeChoice] || ev.type || typeMap['1'];

    setEvents((events || []).map((e:any)=>
      e.id===ev.id ? {...e,title,date,time,type} : e
    ));
  };

  const deleteEvent = (id:number) => {
    if(!confirm(lang==='nl'?'Afspraak verwijderen?':'Termin löschen?')) return;
    setEvents((events || []).filter((e:any)=>e.id!==id));
  };

  const eventColor=(type:string)=>{
  if(type==='Montage')return '#22c55e';
  if(type==='Lieferung' || type==='Levering')return '#eab308';
  if(type==='Kunde' || type==='Klant')return '#2563eb';
  if(type==='Produktion' || type==='Productie')return '#9333ea';
  if(type==='Wichtig' || type==='Belangrijk')return '#dc2626';

  return '#2563eb';
};
  return (
    <section style={card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>📅 {lang==='nl'?'Kalender':'Kalender'}</h2>
        <button onClick={addEvent} style={primary}>
          {lang==='nl'?'+ Afspraak toevoegen':'+ Termin hinzufügen'}
        </button>
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>{lang==='nl'?'Datum':'Datum'}</th>
            <th style={th}>{lang==='nl'?'Tijd':'Uhrzeit'}</th>
            <th style={th}>{lang==='nl'?'Soort':'Art'}</th>
            <th style={th}>{lang==='nl'?'Afspraak':'Termin'}</th>
            <th style={th}>{lang==='nl'?'Actie':'Aktion'}</th>
          </tr>
        </thead>

        <tbody>
          {(events || []).map((ev:any)=>(
            <tr key={ev.id}>
              <td style={td}>{ev.date}</td>
              <td style={td}>{ev.time}</td>
              <td style={td}>
                <span style={{
                  background:eventColor(ev.type || ev.title),
                  color:'#fff',
                  padding:'4px 8px',
                  borderRadius:8
                }}>
                  {ev.type}
                </span>
              </td>
              <td style={td}>{ev.title}</td>
              <td style={td}>
                <button onClick={()=>editEvent(ev)}>
                  {lang==='nl'?'Bewerken':'Bearbeiten'}
                </button>
                <button onClick={()=>deleteEvent(ev.id)}>
                  {lang==='nl'?'Verwijderen':'Löschen'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
function MiniCalendar({events,lang}:any){
  const [date,setDate]=useState(new Date(2026,0,1));
  const year=date.getFullYear();
  const month=date.getMonth();

  const names=lang==='nl'
    ? ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
    : ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  const days=new Date(year,month+1,0).getDate();
  const today=new Date();

  const move=(n:number)=>{
    const next=new Date(year,month+n,1);
    if(next.getFullYear()>=2026 && next.getFullYear()<=2030)setDate(next);
  };

  const eventColor=(title:string)=>{
    const x=(title||'').toLowerCase();

    if(x.includes('montage'))return '#22c55e';
    if(x.includes('liefer') || x.includes('lever'))return '#eab308';
    if(x.includes('kunde') || x.includes('klant'))return '#2563eb';
    if(x.includes('produktion') || x.includes('productie'))return '#9333ea';
    if(x.includes('wichtig') || x.includes('belangrijk'))return '#dc2626';

    return '#2563eb';
  };

  return (
    <div>
      <div style={topRow}>
        <button onClick={()=>move(-1)}>←</button>
        <h2>📅 {names[month]} {year}</h2>
        <button onClick={()=>move(1)}>→</button>
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(7,1fr)',
        gap:8,
        marginBottom:8,
        fontWeight:700
      }}>
        {(lang==='nl'
          ? ['Ma','Di','Wo','Do','Vr','Za','Zo']
          : ['Mo','Di','Mi','Do','Fr','Sa','So']
        ).map((d:string)=>(
          <div key={d} style={{textAlign:'center'}}>{d}</div>
        ))}
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(7,1fr)',
        gap:8
      }}>
        {Array.from({length:days}).map((_,i)=>{
          const day=i+1;
          const current=new Date(year,month,day);
          const weekDay=current.getDay();
          const isWeekend=weekDay===0 || weekDay===6;
          const isToday=
            today.getFullYear()===year &&
            today.getMonth()===month &&
            today.getDate()===day;

          const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const list=(events||[]).filter((e:any)=>e.date===d);

          return (
            <div
              key={day}
              style={{
                background:isToday
                  ? '#dcfce7'
                  : list.length
                    ? '#dbeafe'
                    : isWeekend
                      ? '#f1f5f9'
                      : '#fff',
                border:isToday
                  ? '3px solid #22c55e'
                  : list.length
                    ? '2px solid #2563eb'
                    : '1px solid #ddd',
                borderRadius:10,
                padding:8,
                minHeight:85
              }}
            >
              <b>
                {isToday ? '🟢 ' : ''}
                {day}
              </b>

              {list.map((ev:any)=>(
                <div
                  key={ev.id}
                  style={{
                    fontSize:11,
                    marginTop:4,
                    background:eventColor(ev.type || ev.title),
                    color:'#fff',
                    padding:'3px 6px',
                    borderRadius:6
                  }}
                >
                  🕗 {ev.time}<br/>
                  <b>📌 {ev.title}</b>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{marginTop:14,fontSize:12,color:'#555'}}>
        🟢 {lang==='nl'?'Vandaag':'Heute'} · 
        🟢 Montage · 
        🟡 {lang==='nl'?'Levering':'Lieferung'} · 
        🔵 {lang==='nl'?'Klant':'Kunde'} · 
        🟣 {lang==='nl'?'Productie':'Produktion'} · 
        🔴 {lang==='nl'?'Belangrijk':'Wichtig'}
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
