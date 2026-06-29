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
  const [notes,setNotes]=useState<any[]>([]);
  const [productionDrawings,setProductionDrawings]=useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
const [chatText, setChatText] = useState('');
  const [chatReceiver, setChatReceiver] = useState("office");
  const [chatFile, setChatFile] = useState<any>(null);
  const [chatSender, setChatSender] = useState("office");
  const [selectedMontageCustomer, setSelectedMontageCustomer] = useState<any>(null);

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
  loadNotes();
  loadMessages();  
  loadEvents();
  loadProductionDrawings();
}, []);
  
  async function addCustomer() {
  const company_name = prompt(t.name + '?');
  if (!company_name) return;

  const phone = prompt(t.phone + '?') || '';
  const email = prompt(t.email + '?') || '';
  const address = prompt(t.address + '?') || '';
  const city = prompt(t.city + '?') || '';

  const { error } = await supabase
    .from('customers')
    .insert([{
      company_name,
      phone,
      email,
      address,
      city,
      status: 'working',
      payment_status: 'open'
    }]);

  if (error) return alert(error.message);

  loadCustomers();
}

  async function deleteCustomer(c:any) {
    if (!confirm(t.deleteAsk)) return;
    const { error } = await supabase.from('customers').delete().eq('id', c.id);
    if (error) return alert(error.message);
    loadCustomers();
  }

  async function editCustomer(c:any) {
    const company_name = prompt(t.name + '?', c.company_name) || c.company_name;
    const phone = prompt(t.phone + '?', c.phone) || c.phone;
    const email = prompt(t.email + '?', c.email) || c.email;
    const address = prompt(t.address + '?', c.address) || c.address;
    const city = prompt(t.city + '?', c.city) || c.city;

    const { error } = await supabase
      .from('customers')
      .update({ company_name, phone, email, address, city })
      .eq('id', c.id);

    if (error) return alert(error.message);

    loadCustomers();
  }
  async function changeCustomerStatus(c:any){

  let next = "working";

  if(c.status === "working"){
    next = "approved";
  }else if(c.status === "approved"){
    next = "rejected";
  }else{
    next = "working";
  }

  const { error } = await supabase
    .from("customers")
    .update({ status: next })
    .eq("id", c.id);

  if(error) return alert(error.message);

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
 async function changeProjectStatus(p:any){
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

  if(error) return alert(error.message);

  loadProjects();
} 
async function loadProductionDrawings() {
  const { data } = await supabase
    .from('production_drawings')
    .select('*')
    .order('created_at',{ascending:false});

  setProductionDrawings(data || []);
}

function drawingsFor(productionId:any) {
  return productionDrawings.filter((d:any)=>String(d.production_id) === String(productionId));
}

async function uploadProductionDrawing(p:any,e:any){
  const file = e.target.files?.[0];
  if(!file) return;

  const path = `${p.id}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('production-files')
    .upload(path,file);

  if(error){
    alert(error.message);
    return;
  }

  const { data } = supabase.storage
    .from('production-files')
    .getPublicUrl(path);

  const { error:insertError } = await supabase
    .from('production_drawings')
    .insert({
      production_id:p.id,
      name:file.name,
      url:data.publicUrl
    });

  if(insertError){
    alert(insertError.message);
    return;
  }

  e.target.value = '';
  loadProductionDrawings();
}

async function deleteProductionDrawing(d:any){
  if(!confirm(lang==='de' ? 'Zeichnung löschen?' : 'Tekening verwijderen?')) return;

  const { error } = await supabase
    .from('production_drawings')
    .delete()
    .eq('id', d.id);

  if(error) return alert(error.message);

  loadProductionDrawings();
}
  async function deleteProject(id:any) {
    if (!confirm(t.deleteAsk)) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return alert(error.message);
    loadProjects();
  }
  async function changeCustomerPaymentStatus(c:any){

  let next = "open";

  if(c.payment_status === "open"){
    next = "paid";
  }else if(c.payment_status === "paid"){
    next = "unpaid";
  }else{
    next = "open";
  }

  const { error } = await supabase
    .from("customers")
    .update({ payment_status: next })
    .eq("id", c.id);

  if(error) return alert(error.message);

  loadCustomers();
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
  async function loadNotes(){
  const { data } = await supabase
    .from('notes')
    .select('*')
    .order('created_at',{ascending:false});

  setNotes(data || []);
}
async function loadMessages(){
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending:false })
    .limit(20);

  if(error) return alert(error.message);

  setMessages(data || []);
}

async function sendMessage(){
  if(!chatText.trim()) return;

  const { error } = await supabase
    .from('messages')
    .insert({
    sender: chatSender,
    receiver: chatReceiver,
    message: chatText,
    fileName: chatFile?.name || null,
    fileUrl: null,
    is_read: false
})

  if(error) return alert(error.message);

  setChatText('');
  setChatFile(null);
  loadMessages();
}  

async function addNote(){
  const text = prompt(lang==='de' ? 'Neue Notiz?' : 'Nieuwe notitie?');
  if(!text) return;

  const { error } = await supabase
    .from('notes')
    .insert({ text, done:false });

  if(error) return alert(error.message);

  loadNotes();
}

async function editNote(n:any){
  const text = prompt(lang==='de' ? 'Notiz bearbeiten?' : 'Notitie bewerken?', n.text);
  if(!text) return;

  const { error } = await supabase
    .from('notes')
    .update({ text })
    .eq('id', n.id);

  if(error) return alert(error.message);

  loadNotes();
}

async function toggleNote(n:any){
  const { error } = await supabase
    .from('notes')
    .update({ done: !n.done })
    .eq('id', n.id);

  if(error) return alert(error.message);

  loadNotes();
}

async function deleteNote(id:number){
  if(!confirm(lang==='de' ? 'Notiz löschen?' : 'Notitie verwijderen?')) return;

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if(error) return alert(error.message);

  loadNotes();
}
 async function loadEvents(){
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('date',{ascending:true});

  setEvents(data || []);
} 
 async function changeProductionStatus(p:any){
  const nextStatus =
    p.status === 'open'
      ? 'working'
      : p.status === 'working'
      ? 'done'
      : 'open';

  const { error } = await supabase
    .from('production')
    .update({ status: nextStatus })
    .eq('id', p.id);

  if(error) return alert(error.message);

  loadProduction();
} 
 
  return (
    <div style={app}>
      <aside style={side}>
        <div style={logo}>D&amp;I</div>
        <button onClick={()=>setModule('dashboard')} style={iconBtn}>🏠</button>
        <button onClick={()=>setModule('customers')} style={iconBtn}>👥</button>
        <button onClick={()=>setModule('projects')} style={iconBtn}>📁</button>
        <button onClick={() => setModule('production')} style={iconBtn}>🏭</button>
        <button onClick={() => setModule('stock')} style={iconBtn}>📦</button>
        <button onClick={() => setModule('delivery')} style={iconBtn}>🚚</button>
        <button onClick={() => setModule('montage')} style={iconBtn}>🔧</button>
        <button onClick={() => setModule('employees')} style={iconBtn}>👷</button>
        
      </aside>

      <main style={main}>
       <header
  style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    background:'#fff',
    padding:20,
    borderRadius:18,
    marginBottom:20,
    boxShadow:'0 4px 12px rgba(0,0,0,.08)'
  }}
>
  <div style={{display:'flex',alignItems:'center',gap:18}}>

  <div
    style={{
      display:'flex',
      alignItems:'center',
      gap:18
    }}
  >

    <div
      style={{
        fontFamily:'Georgia',
        fontSize:48,
        fontWeight:700
      }}
    >
      D&I
    </div>

    <div
      style={{
        width:42,
        height:42,
        background:'#7b7b7b',
        transform:'rotate(45deg)',
        borderRadius:3
      }}
    />

    <div>
      <div style={{fontSize:28,fontWeight:700}}>
        {lang==='de'
          ? 'Kunststoff Kozijnen'
          : 'Kunststof Kozijnen'}
      </div>

      <div style={{fontSize:22,color:'#666'}}>
        {lang==='de'
          ? 'und Rollläden'
          : 'en Rolluiken'}
      </div>
    </div>

  </div>

    <div>
      <div style={{fontSize:34,fontWeight:800}}>
        {new Date().toLocaleTimeString(lang==='de'?'de-DE':'nl-NL',{hour:'2-digit',minute:'2-digit'})}
      </div>
      <div style={{color:'#666'}}>
        {new Date().toLocaleDateString(lang==='de'?'de-DE':'nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
      </div>
    </div>

    <div>
      <div style={{fontSize:24,fontWeight:800}}>
        {lang==='de'?'Büro':'Kantoor'}
      </div>
      <div style={{color:'#16a34a',fontWeight:700}}>
        ● Online
      </div>
    </div>
  </div>

  <div style={{display:'flex',gap:12}}>
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
              <h2>{lang==='de'?'Heute':'Vandaag'}</h2>

{events
  .filter((e:any)=>e.date === new Date().toISOString().slice(0,10))
  .map((e:any)=>(
    <Event
      key={e.id}
      color={
        e.type === 'montage' ? '#22c55e' :
        e.type === 'delivery' ? '#eab308' :
        e.type === 'production' ? '#6366f1' :
        '#2563eb'
      }
      title={e.title}
      time={e.time}
    />
  ))}
            </section>

            <section style={card}>
  <Calendar
  events={events}
  setEvents={setEvents}
  lang={lang}
  loadEvents={loadEvents}
/>
</section>

            <section style={cardSmall}>

<h2>{lang === 'de' ? '💬 Team-Chat' : '💬 Teamchat'}</h2>
              <div style={{ marginBottom:12 }}>
  <label style={{ fontWeight:"bold" }}>
    {lang==="de" ? "Absender" : "Afzender"}
  </label>

  <select
    value={chatSender}
    onChange={(e)=>setChatSender(e.target.value)}
    style={{
      width:"100%",
      padding:10,
      borderRadius:10,
      marginTop:6
    }}
  >
    <option value="office">{lang==="de"?"🏢 Büro":"🏢 Kantoor"}</option>
    <option value="orders">{lang==="de"?"📦 Bestellungen":"📦 Bestellingen"}</option>
    <option value="production">{lang==="de"?"🏭 Produktion":"🏭 Productie"}</option>
    <option value="montage">🔧 Montage</option>
    <option value="bus1">🚌 Bus 1</option>
    <option value="bus2">🚌 Bus 2</option>
  </select>
</div>
<div style={{ marginBottom: 12 }}>
  <label style={{ fontWeight: 700 }}>
    {lang === "de" ? "Empfänger" : "Ontvanger"}
  </label>

  <select
    value={chatReceiver}
    onChange={(e)=>setChatReceiver(e.target.value)}
    style={{
      width:"100%",
      padding:12,
      marginTop:6,
      borderRadius:10,
      border:"1px solid #ddd"
    }}
  >
    <option value="office">{lang==="de"?"🏢 Büro":"🏢 Kantoor"}</option>
    <option value="orders">{lang==="de"?"📦 Bestellungen":"📦 Bestellingen"}</option>
    <option value="production">{lang==="de"?"🏭 Produktion":"🏭 Productie"}</option>
    <option value="montage">🔧 Montage</option>
    <option value="bus1">🚌 Bus 1</option>
    <option value="bus2">🚌 Bus 2</option>
  </select>
</div>
<textarea
value={chatText}
onChange={(e)=>setChatText(e.target.value)}
placeholder={
lang === 'de'
? 'Nachricht schreiben...'
: 'Bericht schrijven...'
}
style={{
width:'100%',
height:120,
padding:12,
borderRadius:10,
border:'1px solid #ddd',
resize:'none'
}}
/>
              <input
  type="file"
  accept="image/*,.pdf,.xlsx,.xls"
  onChange={(e)=>setChatFile(e.target.files?.[0] || null)}
  style={{
    marginTop:10,
    marginBottom:10,
    width:"100%"
  }}
/>

{chatFile && (
  <div style={{
    fontSize:13,
    color:"#666",
    marginBottom:10
  }}>
    {lang==="de"
      ? "📎 Datei ausgewählt: "
      : "📎 Bestand gekozen: "}
    {chatFile.name}
  </div>
)}

<div
style={{
height:250,
overflowY:'auto',
border:'1px solid #ddd',
borderRadius:10,
padding:10,
marginTop:12,
marginBottom:12,
background:'#fafafa'
}}
>

{messages.length===0 && (
<p style={{color:'#888'}}>
{lang==='de'
?'Noch keine Nachrichten'
:'Nog geen berichten'}
</p>
)}

{messages
  .filter((m:any)=>m.receiver === chatReceiver || m.receiver === 'all')
  .map((m:any)=>(
<div
key={m.id}
style={{
background:'#fff',
padding:12,
borderRadius:10,
marginBottom:10,
boxShadow:'0 1px 4px rgba(0,0,0,.08)'
}}
>

<div
style={{
fontWeight:'bold',
marginBottom:4
}}
>
{m.sender}
</div>

<div style={{whiteSpace:'pre-wrap'}}>
{m.message}
</div>

<div
style={{
fontSize:12,
color:'#777',
marginTop:6
}}
>
{new Date(m.created_at).toLocaleString()}
</div>

</div>
))}

</div>

<button
onClick={sendMessage}
style={{
marginTop:5,
width:'100%',
padding:12,
border:'none',
borderRadius:10,
background:'#2563eb',
color:'#fff',
cursor:'pointer'
}}
>
{lang==='de'?'Senden':'Verzenden'}
</button>

</section>

            <section style={card}>
              <h2>{lang==='de' ? 'Notizen' : 'Notities'}</h2>

<button
  onClick={addNote}
  style={primary}
>
  ➕ {lang==='de' ? 'Neue Notiz' : 'Nieuwe notitie'}
</button>

{notes.map((n:any)=>(
  <div
    key={n.id}
    style={{
      display:'flex',
      alignItems:'center',
      gap:10,
      marginTop:10
    }}
  >
    <input
      type="checkbox"
      checked={n.done}
      onChange={()=>toggleNote(n)}
    />

    <span
      style={{
        flex:1,
        textDecoration:n.done ? 'line-through' : 'none'
      }}
    >
      {n.text}
    </span>

    <button onClick={()=>editNote(n)}>✏️</button>
    <button onClick={()=>deleteNote(n.id)}>🗑️</button>
  </div>
))}
            </section>

            <section style={card}>
  <MiniCalendar
    events={events}
    lang={lang}
  />
</section>

            <section style={cardSmall}>
              <h2>{lang==='de'?'Kommende Termine':'Komende afspraken'}</h2>

{events
  .filter((e:any)=>e.date >= new Date().toISOString().slice(0,10))
  .sort((a:any,b:any)=>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  )
  .slice(0,5)
  .map((e:any)=>(
    <Event
      key={e.id}
      color={
        e.type === 'montage' ? '#22c55e' :
        e.type === 'delivery' ? '#eab308' :
        e.type === 'production' ? '#6366f1' :
        '#c93670'
      }
      title={e.title}
      time={`${e.date} ${e.time}`}
    />
  ))}
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
      <th style={th}>{lang==='de'?'Bezahlung':'Betaling'}</th>
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

        <td style={td}>
  <button
    onClick={()=>changeCustomerStatus(c)}
    style={{
      background:
        c.status==='approved'
          ? '#22c55e'
          : c.status==='working'
          ? '#eab308'
          : '#ef4444',
      color:'#fff',
      border:'none',
      borderRadius:8,
      padding:'6px 12px',
      margin:3,
      fontWeight:'bold'
    }}
  >
    {c.status==='approved'
      ? (lang==='de'?'Genehmigt':'Goedgekeurd')
      : c.status==='working'
      ? (lang==='de'?'In Bearbeitung':'In behandeling')
      : (lang==='de'?'Nicht genehmigt':'Afgekeurd')}
  </button>
</td>
<td style={td}>
  <button
    onClick={()=>changeCustomerPaymentStatus(c)}
    style={{
      background:
        c.payment_status === 'paid'
          ? '#22c55e'
          : c.payment_status === 'unpaid'
          ? '#ef4444'
          : '#eab308',
      color:'#fff',
      border:'none',
      borderRadius:8,
      padding:'6px 12px',
      fontWeight:'bold'
    }}
  >
    {c.payment_status === 'paid'
      ? (lang==='de'?'Bezahlt':'Betaald')
      : c.payment_status === 'unpaid'
      ? (lang==='de'?'Nicht bezahlt':'Niet betaald')
      : (lang==='de'?'Noch offen':'Nog open')}
  </button>
</td>
        <td style={td}>
          <button onClick={()=>editCustomer(c)} style={{marginRight:6}}>
            {lang==='de' ? 'Bearbeiten' : 'Bewerken'}
          </button>
          <button onClick={()=>deleteCustomer(c)}>
            {t.del}
          </button>
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
    onClick={() => changeProjectStatus(p)}
    style={{
      background:
        p.status === 'done'
          ? '#22c55e'
          : p.status === 'working'
          ? '#eab308'
          : '#ef4444',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '6px 12px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    {
      p.status === 'done'
        ? (lang === 'de' ? 'Fertig' : 'Klaar')
        : p.status === 'working'
        ? (lang === 'de' ? 'In Bearbeitung' : 'In behandeling')
        : (lang === 'de' ? 'Nicht fertig' : 'Niet klaar')
    }
  </button>
</td>
                    <td style={td}>{p.price}</td>
                    <td style={td}>
                      <button onClick={()=>editProject(p)} style={{marginRight:6}}>
                        {lang==='de' ? 'Bearbeiten' : 'Bewerken'}
                      </button>

                      <button onClick={()=>deleteProject(p.id)}>
                        {lang==='de' ? 'Löschen' : 'Verwijderen'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {module === 'production' && (
  <section style={card}>
    <div style={topRow}>
      <h2>🏭 {lang==='de' ? 'Produktion' : 'Productie'}</h2>
    </div>

    <table style={table}>
      <thead>
        <tr>
          <th style={th}>{lang==='de' ? 'Projekt' : 'Project'}</th>
          <th style={th}>{lang==='de' ? 'Teil' : 'Onderdeel'}</th>
          <th style={th}>{lang==='de' ? 'Menge' : 'Aantal'}</th>
          <th style={th}>Status</th>
          <th style={th}>{lang==='de' ? 'Notizen' : 'Notities'}</th>
          <th style={th}>{lang==='de' ? 'Zeichnung' : 'Tekening'}</th>
          <th style={th}>{lang==='de' ? 'Aktion' : 'Actie'}</th>
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
                onClick={()=>changeProductionStatus(p)}
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

            <td style={td}>{p.notes}</td>

            <td style={td}>
              {drawingsFor(p.id).length ? (
                drawingsFor(p.id).map((d:any)=>(
                  <div key={d.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      📄 {d.name || (lang==='de' ? 'Zeichnung' : 'Tekening')}
                    </a>
                    <button onClick={()=>deleteProductionDrawing(d)}>
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                "-"
              )}
            </td>

            <td style={td}>
              <label
                style={{
                  background:"#2563eb",
                  color:"#fff",
                  padding:"6px 12px",
                  borderRadius:8,
                  cursor:"pointer",
                  display:"inline-block"
                }}
              >
                📁 {lang==="de" ? "Zeichnung hinzufügen" : "Tekening toevoegen"}

                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg,.doc,.docx,.dwg,.dxf"
                  style={{display:"none"}}
                  onChange={(e)=>uploadProductionDrawing(p,e)}
                />
              </label>
            </td>
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
  <section style={card}>
    <h2>{lang === 'de' ? '🔧 Montage' : '🔧 Montage'}</h2>

    <div style={{
      background:'#fff',
      border:'1px solid #ddd',
      padding:20,
      borderRadius:12
    }}>

      <div style={{display:'flex',justifyContent:'space-between',gap:20}}>
        <div style={{fontSize:34,fontWeight:800}}>
          D&I ◆
          <span style={{fontSize:22,marginLeft:12}}>
            Kunststoff Kozijnen B.V.
          </span>
        </div>

        <div>
          <label>{lang==='de'?'Datum':'Datum'}</label>
          <input type="date" style={search}/>
          <div style={{marginTop:10}}>
            {lang==='de'?'Arbeit fertig':'Werk gereed'}:
            <label style={{marginLeft:10}}>Ja <input type="radio" name="ready"/></label>
            <label style={{marginLeft:10}}>Nein <input type="radio" name="ready"/></label>
          </div>
        </div>
      </div>

      <hr/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div>
          {['Klant','Referentie','Adres','Plaats','Tel.nr'].map((x)=>(
            <div key={x} style={{display:'grid',gridTemplateColumns:'120px 1fr',marginBottom:6}}>
              <b>{x}:</b>
              <input style={search}/>
            </div>
          ))}

          <h3>Bestellijst productie</h3>
          {['Profiel','Dorpel','Deurgreep','Cilinders','Roosters','','',''].map((x,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 120px',gap:6,marginBottom:4}}>
              <select style={search}><option>{x}</option></select>
              <input style={search}/>
              <input type="date" style={search}/>
            </div>
          ))}

          <h3>Glas / Vulling</h3>
          {['Triple zonwerend','HR++ veiligheidsglas'].map((x)=>(
            <select key={x} style={{...search,width:'100%',marginBottom:4}}>
              <option>{x}</option>
            </select>
          ))}

          <h3>{lang==='de'?'Bemerkungen':'Opmerkingen'}</h3>
          <textarea style={{...search,width:'100%',height:90}}/>
        </div>

        <div>
          <h3>Raamdecoratie / Rolluiken enz</h3>
          {[
  'Horren',
  'Raamdecoratie',
  'Rolluiken',
  '',
  '',
  ''
].map((x,i)=>(
<div
  key={i}
  style={{
    display:'grid',
    gridTemplateColumns:'1fr 1.4fr 100px',
    gap:6,
    marginBottom:4
  }}
>

<select style={search} defaultValue={x}>
  <option>Horren</option>
  <option>Raamdecoratie</option>
  <option>Rolluiken</option>
  <option>Screens</option>
  <option>Zonwering</option>
</select>

<select style={search}>
  <option></option>

  <option>Aluminium inzet hor</option>
  <option>Plissé</option>
  <option>Plissé hordeur</option>
  <option>Rolhor</option>
  <option>Schuifhordeur</option>

  <option>Lamellen</option>
  <option>Jaloezie</option>
  <option>Rolgordijn</option>

  <option>Rolluik hand</option>
  <option>Rolluik elektrisch</option>
  <option>Rolluik Solar</option>

  <option>Screen hand</option>
  <option>Screen elektrisch</option>
  <option>Screen Solar</option>

  <option>Zonnescherm</option>
  <option>Uitvalscherm</option>
</select>

<select style={search}>
  {[1,2,3,4,5,6,7,8,9,10].map(n=>(
    <option key={n}>{n}</option>
  ))}
</select>

</div>
))}
            <div key={x} style={{display:'grid',gridTemplateColumns:'1fr 1fr 100px',gap:6,marginBottom:4}}>
              <select style={search}><option>{x}</option></select>
              <select style={search}>
                <option>Aluminium inzet hor</option>
                <option>Plissé</option>
                <option>Rolluik elektrisch schakelaar</option>
                <option>Rolluik Solar</option>
              </select>
              <select style={search}>
                <option>1</option><option>2</option><option>3</option>
                <option>1 meter</option><option>2 meter</option><option>3 meter</option>
              </select>
            </div>
          ))}

          <h3>Extra's</h3>
          {['Vensterbank','Dakraam vervangen','Waterslagdorpels','Voetvastzetter','',''].map((x,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 100px',gap:6,marginBottom:4}}>
              <select style={search}><option>{x}</option></select>
              <input style={search}/>
              <select style={search}><option>1</option><option>2</option><option>3</option></select>
            </div>
          ))}

          <h3>Benodigdheden</h3>
          {['Kraan Pieter','Steiger','',''].map((x,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 100px',gap:6,marginBottom:4}}>
              <select style={search}><option>{x}</option><option>Ladder</option><option>Container</option></select>
              <input style={search}/>
              <input style={search}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:20,marginTop:20}}>
        <button onClick={()=>window.print()} style={primary}>
          🖨️ {lang==='de'?'PDF drucken':'PDF afdrukken'}
        </button>

        <button style={{...primary,background:'#16a34a'}}>
          📊 Excel export
        </button>
      </div>
    </div>
  </section>
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

function Calendar({events,setEvents,lang,loadEvents}:any) {
  const addEvent = async () => {
  const title = prompt(lang==='nl' ? 'Afspraak?' : 'Termin?');
  if (!title) return;

  const date = prompt(lang==='nl' ? 'Datum? bijv. 2026-06-24' : 'Datum? z.B. 2026-06-24');
  if (!date) return;

  const time = prompt(lang==='nl' ? 'Tijd?' : 'Uhrzeit?') || '';

  const typeChoice = prompt(
  lang==='nl'
    ? 'Soort afspraak?\n1 = Klant\n2 = Montage\n3 = Levering\n4 = Productie\n5 = Belangrijk'
    : 'Terminart?\n1 = Kunde\n2 = Montage\n3 = Lieferung\n4 = Produktion\n5 = Wichtig'
) || '1';

const typeMap:any = {
  '1': lang==='nl' ? 'Klant' : 'Kunde',
  '2': 'Montage',
  '3': lang==='nl' ? 'Levering' : 'Lieferung',
  '4': lang==='nl' ? 'Productie' : 'Produktion',
  '5': lang==='nl' ? 'Belangrijk' : 'Wichtig'
};

const type = typeMap[typeChoice] || typeMap['1'];

  const { error } = await supabase
    .from('events')
    .insert({ title, date, time, type });

  if (error) return alert(error.message);

  loadEvents();
};
  const editEvent = async (ev:any) => {
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

    const { error } = await supabase
  .from('events')
  .update({ title, date, time, type })
  .eq('id', ev.id);

if (error) return alert(error.message);

loadEvents();
  };

  const deleteEvent = async (id:number) => {
    if(!confirm(lang==='nl'?'Afspraak verwijderen?':'Termin löschen?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if(error) return alert(error.message);

    loadEvents();
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
const side:any = {
  width:92,
  background:'#050505',
  padding:18,
  boxShadow:'6px 0 20px rgba(0,0,0,.15)'
}
const logo:any = {
  width:54,
  height:54,
  borderRadius:14,
  background:'#050505',
  color:'#fff',
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  fontWeight:'900',
  fontSize:20,
  border:'2px solid #fff',
  boxShadow:'0 6px 18px rgba(0,0,0,.25)'
}
const iconBtn:any = {
  display:'block',
  width:'100%',
  height:54,
  marginBottom:14,
  border:0,
  borderRadius:14,
  background:'transparent',
  color:'#fff',
  fontSize:24,
  cursor:'pointer'
}
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
