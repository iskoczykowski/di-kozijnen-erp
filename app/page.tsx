'use client';

import { useState } from 'react';

export default function Page() {
  return (
    <div style={{padding:'30px'}}>
      <h1>D&I Kozijnen ERP</h1>

      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr 1fr',
        gap:'20px'
      }}>

        <div style={{
          background:'#e6f0ff',
          padding:'20px',
          borderRadius:'20px',
          minHeight:'300px'
        }}>
          <h2>📅 Kalender</h2>
          <p>Termine</p>
          <p>Erinnerungen</p>
          <p>Montageplanung</p>
        </div>

        <div style={{
          background:'#ffe6e6',
          padding:'20px',
          borderRadius:'20px',
          minHeight:'300px'
        }}>
          <h2>📋 Offene Aufträge</h2>
          <p>Produktion</p>
          <p>Montage</p>
          <p>Lager</p>
        </div>

        <div style={{
          background:'#f0e6ff',
          padding:'20px',
          borderRadius:'20px',
          minHeight:'300px'
        }}>
          <h2>🔔 Nachrichten</h2>
          <p>E-Mail</p>
          <p>WhatsApp</p>
          <p>Push-Mitteilungen</p>
        </div>

      </div>
    </div>
  );
}
