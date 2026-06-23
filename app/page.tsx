'use client';

import { useState } from 'react';

export default function Page() {
  const [lang, setLang] = useState<'de' | 'nl'>('de');

  const t:any = {
    de: {
      search:'Suchen...',
      today:'Heute',
      calendar:'Kalender',
      info:'Informationen',
      notes:'Notizen',
      important:'Wichtige Ereignisse',
      upcoming:'Kommende Termine',
      active:'Aktive Projekte',
      open:'Offene Aufträge',
      done:'Fertige Aufträge',
      next:'Nächster Termin',
      add:'Hinzufügen'
    },
    nl: {
      search:'Zoeken...',
      today:'Vandaag',
      calendar:'Kalender',
      info:'Informatie',
      notes:'Notities',
      important:'Belangrijke gebeurtenissen',
      upcoming:'Aankomende afspraken',
      active:'Actieve projecten',
      open:'Openstaande opdrachten',
      done:'Afgeronde opdrachten',
      next:'Volgende afspraak',
      add:'Toevoegen'
    }
  }[lang];

  const days = ['MO','TU','WE','TH','FR','SA','SU'];
  const nums = Array.from({length:35},(_,i)=>i+1);

  return (
    <div style={{minHeight:'100vh',background:'#f4f7fb',fontFamily:'Arial',display:'flex'}}>
      
      <aside style={{width:90,background:'#fff',padding:20,boxShadow:'0 20px 60px #0001'}}>
        <div style={{width:44,height:44,borderRadius:14,background:'#2563eb',marginBottom:30}}></div>
        {['🏠','👥','📁','🏭','📦','🚚','📋','🔧','📅','👷','⏰','📄','💶','🔳','💬','🤖'].map((x,i)=>(
          <div key={i} style={{fontSize:22,margin:'22px 0',textAlign:'center'}}>{x}</div>
        ))}
      </aside>

      <main style={{flex:1,padding:30}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25}}>
          <h1 style={{fontSize:34,margin:0}}>D&I Kozijnen ERP</h1>

          <div style={{display:'flex',gap:15,alignItems:'center'}}>
            <input placeholder={t.search} style={{padding:14,borderRadius:18,border:'0',width:260}} />
            <select value={lang} onChange={(e)=>setLang(e.target.value as any)} style={{padding:12,borderRadius:14}}>
              <option value="de">DE</option>
              <option value="nl">NL</option>
            </select>
            <span style={{fontSize:22}}>🔔</span>
            <span style={{fontSize:26}}>👤</span>
          </div>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr .8fr',gap:24}}>
          
          <section style={card}>
            <h2>{t.today}</h2>
            <Event color="#ec4899" title="Montage Müller" time="08:30" />
            <Event color="#22c55e" title="Kundentermin" time="11:40" />
            <Event color="#06b6d4" title="Lieferung Glas" time="14:00" />
            <Event color="#f97316" title="Produktion Projekt A" time="16:30" />
          </section>

          <section style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button>{'<'}</button>
              <h2>{t.calendar} 2026</h2>
              <button>{'>'}</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10,textAlign:'center'}}>
              {days.map(d=><b key={d}>{d}</b>)}
              {nums.map(n=>(
                <div key={n} style={{
                  padding:10,
                  borderRadius:12,
                  background:n===12?'#22c55e':n===23?'#06b6d4':n===7?'#ec4899':'#f8fafc',
                  color:[7,12,23].includes(n)?'#fff':'#111'
                }}>
                  {n}
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h2>{t.info}</h2>
            <BigStat title={t.active} value="128" />
            <BigStat title={t.done} value="57" />
            <BigStat title={t.next} value="3h 12m" />
            <BigStat title={t.open} value="12" />
          </section>

          <section style={card}>
            <h2>{t.notes}</h2>
            <Note title="Glas bestellen" text="Lieferant kontaktieren" />
            <Note title="Kunde anrufen" text="Termin bestätigen" />
            <Note title="Rechnung senden" text="Projekt Müller" />
          </section>

          <section style={card}>
            <h2>{t.important}</h2>
            <Event color="#ec4899" title="Montage Team 1" time="23 Jun 08:30" />
            <Event color="#f97316" title="Material Lieferung" time="07 Jul 08:50" />
            <Event color="#6366f1" title="Urlaub Mitarbeiter" time="14 Jul 10:00" />
          </section>

          <section style={card}>
            <h2>{t.upcoming}</h2>
            <Event color="#ec4899" title="Kundentermin" time="Heute 08:30" />
            <Event color="#22c55e" title="Montage" time="Heute 11:40" />
            <Event color="#06b6d4" title="Produktion" time="Heute 14:00" />
          </section>

        </div>
      </main>
    </div>
  );
}

const card:any = {
  background:'#fff',
  borderRadius:24,
  padding:24,
  boxShadow:'0 20px 50px #00000012'
};

function Event({color,title,time}:any){
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #eee'}}>
      <div>
        <span style={{display:'inline-block',width:10,height:10,borderRadius:99,background:color,marginRight:10}}></span>
        <b>{title}</b>
      </div>
      <small>{time}</small>
    </div>
  );
}

function Note({title,text}:any){
  return (
    <div style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>
      <b>☐ {title}</b>
      <p style={{margin:'4px 0',color:'#666'}}>{text}</p>
    </div>
  );
}

function BigStat({title,value}:any){
  return (
    <div style={{marginBottom:18}}>
      <small>{title}</small>
      <div style={{fontSize:32,fontWeight:800,color:'#0ea5e9'}}>{value}</div>
    </div>
  );
}
