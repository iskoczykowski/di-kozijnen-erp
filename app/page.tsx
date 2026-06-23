'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Lang = 'de' | 'nl';
type Module = 'dashboard' | 'customers';

export default function Page() {
  const [lang, setLang] = useState<Lang>('de');
  const [module, setModule] = useState<Module>('dashboard');
  const [customers, setCustomers] = useState<any[]>([]);

  const t:any = {
    de: {
      title:'D&I Kozijnen ERP',
      dashboard:'Dashboard',
      customers:'Kunden',
      addCustomer:'Kunde hinzufügen',
      edit:'Bearbeiten',
      delete:'Löschen',
      name:'Name',
      phone:'Telefon',
      email:'E-Mail',
      address:'Adresse',
      city:'Ort',
      status:'Status',
      active:'Aktiv',
      calendar:'Kalender',
      tasks:'Offene Aufträge',
      messages:'Nachrichten',
      search:'Suchen...'
    },
    nl: {
      title:'D&I Kozijnen ERP',
      dashboard:'Dashboard',
      customers:'Klanten',
      addCustomer:'Klant toevoegen',
      edit:'Bewerken',
      delete:'Verwijderen',
      name:'Naam',
      phone:'Telefoon',
      email:'E-mail',
      address:'Adres',
      city:'Plaats',
      status:'Status',
      active:'Actief',
      calendar:'Kalender',
      tasks:'Openstaande opdrachten',
      messages:'Berichten',
      search:'Zoeken...'
    }
  }[lang];

  async function loadCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending:false });

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers(data || []);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function addCustomer() {
    const company_name = prompt(t.name + '?');
    if (!company_name) return;

    const phone = prompt(t.phone + '?') || '';
    const email = prompt(t.email + '?') || '';
    const address = prompt(t.address + '?') || '';
    const city = prompt(t.city + '?') || '';

    const { error } = await supabase.from('customers').insert([{
      company_name,
      phone,
      email,
      address,
      city
    }]);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCustomers();
  }

  async function editCustomer(c:any) {
    const company_name = prompt(t.name + '?', c.company_name || '');
    if (!company_name) return;

    const phone = prompt(t.phone + '?', c.phone || '') || '';
    const email = prompt(t.email + '?', c.email || '') || '';
    const address = prompt(t.address + '?', c.address || '') || '';
    const city = prompt(t.city + '?', c.city || '') || '';

    const { error } = await supabase
      .from('customers')
      .update({ company_name, phone, email, address, city })
      .eq('id', c.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCustomers();
  }

  async function deleteCustomer(c:any) {
    if (!confirm(t.delete + '?')) return;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', c.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCustomers();
  }

  return (
    <div style={{minHeight:'100vh',background:'#f4f7fb',fontFamily:'Arial',display:'flex'}}>

      <aside style={{width:230,background:'#fff',padding:24,boxShadow:'0 20px 60px #0001'}}>
        <h2>D&I Kozijnen</h2>

        <button onClick={()=>setModule('dashboard')} style={navBtn}>
          🏠 {t.dashboard}
        </button>

        <button onClick={()=>setModule('customers')} style={navBtn}>
          👥 {t.customers}
        </button>
      </aside>

      <main style={{flex:1,padding:30}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25}}>
          <h1>{t.title}</h1>

          <div style={{display:'flex',gap:12}}>
            <input placeholder={t.search} style={inputStyle}/>
            <select value={lang} onChange={(e)=>setLang(e.target.value as Lang)} style={inputStyle}>
              <option value="de">DE</option>
              <option value="nl">NL</option>
            </select>
          </div>
        </header>

        {module === 'dashboard' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
            <div style={{...card,borderTop:'6px solid #2563eb'}}>
              <h2>📅 {t.calendar}</h2>
              <p>Montage Müller 08:00</p>
              <p>Kundentermin 10:00</p>
              <p>Lieferung 14:00</p>
            </div>

            <div style={{...card,borderTop:'6px solid #dc2626'}}>
              <h2>📋 {t.tasks}</h2>
              <p>Produktion offen</p>
              <p>Montage offen</p>
              <p>Lager prüfen</p>
            </div>

            <div style={{...card,borderTop:'6px solid #9333ea'}}>
              <h2>🔔 {t.messages}</h2>
              <p>WhatsApp</p>
              <p>E-Mail</p>
              <p>Push</p>
            </div>
          </div>
        )}

        {module === 'customers' && (
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2>{t.customers}</h2>
              <button onClick={addCustomer} style={primaryBtn}>
                + {t.addCustomer}
              </button>
            </div>

            <table style={{width:'100%',borderCollapse:'collapse',marginTop:20}}>
              <thead>
                <tr>
                  <th style={th}>{t.name}</th>
                  <th style={th}>{t.phone}</th>
                  <th style={th}>{t.email}</th>
                  <th style={th}>{t.address}</th>
                  <th style={th}>{t.city}</th>
                  <th style={th}>{t.status}</th>
                  <th style={th}>Aktion</th>
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
                      <button onClick={()=>editCustomer(c)} style={smallBtn}>{t.edit}</button>
                      <button onClick={()=>deleteCustomer(c)} style={smallBtn}>{t.delete}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

const card:any = {
  background:'#fff',
  borderRadius:22,
  padding:24,
  boxShadow:'0 20px 50px #00000012'
};

const navBtn:any = {
  display:'block',
  width:'100%',
  padding:14,
  marginBottom:12,
  border:'0',
  borderRadius:14,
  background:'#eef2ff',
  textAlign:'left',
  cursor:'pointer'
};

const primaryBtn:any = {
  padding:'12px 18px',
  border:'0',
  borderRadius:14,
  background:'#2563eb',
  color:'#fff',
  cursor:'pointer'
};

const smallBtn:any = {
  padding:'8px 10px',
  marginRight:6,
  border:'0',
  borderRadius:10,
  background:'#eef2ff',
  cursor:'pointer'
};

const inputStyle:any = {
  padding:12,
  borderRadius:14,
  border:'1px solid #ddd'
};

const th:any = {
  textAlign:'left',
  padding:12,
  borderBottom:'1px solid #ddd'
};

const td:any = {
  padding:12,
  borderBottom:'1px solid #eee'
};
