'use client';

import { useState } from 'react';

export default function Page() {
  const [lang,setLang]=useState<'de'|'nl'>('de');

  const t:any={
    de:{
      title:'D&I Kozijnen ERP',
      calendar:'Kalender',
      newEvent:'Neuer Termin',
      reminders:'Erinnerung 1 Tag vorher',
      tasks:'Offene Aufträge',
      messages:'Nachrichten',
      production:'Produktion',
      montage:'Montage',
      stock:'Lager',
      email:'E-Mail',
      whatsapp:'WhatsApp',
      push:'Push-Benachrichtigungen'
    },
    nl:{
      title:'D&I Kozijnen ERP',
      calendar:'Kalender',
      newEvent:'Nieuwe afspraak',
      reminders:'Herinnering 1 dag vooraf',
      tasks:'Openstaande opdrachten',
      messages:'Berichten',
      production:'Productie',
      montage:'Montage',
      stock:'Magazijn',
      email:'E-mail',
      whatsapp:'WhatsApp',
      push:'Pushmeldingen'
    }
  }[lang];

  const [events,setEvents]=useState<any[]>([
    {day:3,time:'09:00',title:'Montage Müller'},
    {day:8,time:'10:30',title:'Productie Project A'},
    {day:14,time:'08:00',title:'Levering Glas'},
  ]);

  const addEvent=()=>{
    const day=Number(prompt(lang==='nl'?'Dag van maand?':'Tag im Monat?')||0);
    if(!day)return;
    const time=prompt(lang==='nl'?'Tijd?':'Uhrzeit?')||'';
    const title=prompt(lang==='nl'?'Titel?':'Titel?')||'';
    if(!title)return;

    setEvents([{day,time,title},...events]);
  };

  const days=Array.from({length:30},(_,i)=>i+1);

  return (
    <div style={{padding:40,fontFamily:'Arial'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>{t.title}</h1>
        <select value={lang} onChange={(e)=>setLang(e.target.value as any)}>
          <option value="de">DE</option>
          <option value="nl">NL</option>
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:20}}>
        <div style={{background:'#dbeafe',borderRadius:20,padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h2>📅 {t.calendar}</h2>
            <button onClick={addEvent}>{t.newEvent}</button>
          </div>

          <p>{t.reminders}</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
            {days.map(day=>(
              <div key={day} style={{background:'white',borderRadius:12,padding:10,minHeight:90}}>
                <b>{day}</b>
                {events.filter(e=>e.day===day).map((e,i)=>(
                  <div key={i} style={{marginTop:8,background:'#bfdbfe',borderRadius:8,padding:6,fontSize:12}}>
                    <b>{e.time}</b><br/>
                    {e.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'#fee2e2',borderRadius:20,padding:20}}>
          <h2>📋 {t.tasks}</h2>
          <p>• {t.production}</p>
          <p>• {t.montage}</p>
          <p>• {t.stock}</p>
        </div>

        <div style={{background:'#f3e8ff',borderRadius:20,padding:20}}>
          <h2>🔔 {t.messages}</h2>
          <p>• {t.email}</p>
          <p>• {t.whatsapp}</p>
          <p>• {t.push}</p>
        </div>
      </div>
    </div>
  );
}
