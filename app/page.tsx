'use client';

import { useState } from 'react';

export default function Page() {
  const [lang,setLang]=useState<'de'|'nl'>('de');
  const [year,setYear]=useState(new Date().getFullYear());
  const [events,setEvents]=useState<any[]>([]);

  const t:any={
    de:{title:'D&I Kozijnen ERP',calendar:'Jahreskalender',add:'Termin hinzufügen',edit:'Bearbeiten',del:'Löschen',day:'Tag',time:'Uhrzeit',name:'Termin',reminder:'Erinnerung 1 Tag vorher'},
    nl:{title:'D&I Kozijnen ERP',calendar:'Jaarkalender',add:'Afspraak toevoegen',edit:'Bewerken',del:'Verwijderen',day:'Dag',time:'Tijd',name:'Afspraak',reminder:'Herinnering 1 dag vooraf'}
  }[lang];

  const monthsDe=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const monthsNl=['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
  const months=lang==='nl'?monthsNl:monthsDe;

  const daysInMonth=(m:number)=>new Date(year,m+1,0).getDate();

  const addEvent=(month:number,day:number)=>{
    const time=prompt(t.time+'?')||'';
    const title=prompt(t.name+'?')||'';
    if(!title)return;
    setEvents([{id:Date.now(),year,month,day,time,title,reminder:t.reminder},...events]);
  };

  const editEvent=(ev:any)=>{
    const time=prompt(t.time+'?',ev.time)||ev.time;
    const title=prompt(t.name+'?',ev.title)||ev.title;
    setEvents(events.map(e=>e.id===ev.id?{...e,time,title}:e));
  };

  const deleteEvent=(id:number)=>{
    if(confirm(t.del+'?')){
      setEvents(events.filter(e=>e.id!==id));
    }
  };

  return (
    <div style={{padding:30,fontFamily:'Arial',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1>{t.title}</h1>
          <h2>📅 {t.calendar} {year}</h2>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setYear(year-1)}>◀</button>
          <button onClick={()=>setYear(new Date().getFullYear())}>{year}</button>
          <button onClick={()=>setYear(year+1)}>▶</button>

          <select value={lang} onChange={(e)=>setLang(e.target.value as any)}>
            <option value="de">DE</option>
            <option value="nl">NL</option>
          </select>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
        {months.map((monthName:string,month:number)=>(
          <div key={month} style={{background:'white',borderRadius:18,padding:16,boxShadow:'0 10px 30px #0001'}}>
            <h3 style={{marginTop:0}}>{monthName}</h3>

            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
              {Array.from({length:daysInMonth(month)},(_,i)=>i+1).map(day=>(
                <div key={day} onDoubleClick={()=>addEvent(month,day)}
                  style={{
                    minHeight:85,
                    background:'#eef2ff',
                    borderRadius:10,
                    padding:6,
                    fontSize:12,
                    cursor:'pointer'
                  }}>
                  <b>{day}</b>

                  {events.filter(e=>e.year===year&&e.month===month&&e.day===day).map(ev=>(
                    <div key={ev.id} style={{marginTop:5,background:'#dbeafe',borderRadius:6,padding:5}}>
                      <b>{ev.time}</b><br/>
                      {ev.title}<br/>
                      <small>{ev.reminder}</small><br/>
                      <button onClick={()=>editEvent(ev)}>{t.edit}</button>
                      <button onClick={()=>deleteEvent(ev.id)}>{t.del}</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button style={{marginTop:10}} onClick={()=>addEvent(month,1)}>
              + {t.add}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
