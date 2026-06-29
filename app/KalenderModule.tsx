"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type CalendarEvent = {
  id: string;
  title: string;
  customer: string;
  date: string;
  time: string;
  type: string;
  note: string;
};

const STORAGE_KEY = "di_calendar_v1";
function newId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function today() { return new Date().toISOString().slice(0, 10); }

function emptyEvent(lang: Lang): CalendarEvent {
  return { id: newId(), title: lang === "de" ? "Neuer Termin" : "Nieuwe afspraak", customer: "", date: today(), time: "09:00", type: "Klant", note: "" };
}

const input: React.CSSProperties = { width: "100%", height: 38, border: "1px solid #d7dde8", borderRadius: 10, padding: "0 10px", background: "#fff", boxSizing: "border-box" };
const primary: React.CSSProperties = { border: 0, borderRadius: 10, background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function KalenderModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyEvent(lang), []);
  const [events, setEvents] = useState<CalendarEvent[]>([first]);
  const [activeId, setActiveId] = useState(first.id);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setEvents(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {}
  }, [events]);

  const active = events.find(e => e.id === activeId) || events[0];
  const sorted = [...events].sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  function patch(p: Partial<CalendarEvent>) {
    setEvents(old => old.map(e => e.id === active.id ? { ...e, ...p } : e));
  }

  function add() {
    const e = emptyEvent(lang);
    setEvents(old => [e, ...old]);
    setActiveId(e.id);
  }

  function del() {
    if (events.length <= 1) return;
    const rest = events.filter(e => e.id !== active.id);
    setEvents(rest);
    setActiveId(rest[0].id);
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button style={primary} onClick={add}>➕ {lang === "de" ? "Neuer Termin" : "Nieuwe afspraak"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={del}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2>🗓️ {lang === "de" ? "Kalender" : "Kalender"}</h2>
          {sorted.map(e => (
            <button key={e.id} onClick={() => setActiveId(e.id)} style={{
              width: "100%", textAlign: "left", padding: 12, borderRadius: 12,
              border: e.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: e.id === active.id ? "#eff6ff" : "#fff", marginBottom: 8, cursor: "pointer"
            }}>
              <b>{e.date} · {e.time}</b>
              <div>{e.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{e.customer || "-"}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <h2>{lang === "de" ? "Termin bearbeiten" : "Afspraak bewerken"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><b>{lang === "de" ? "Titel" : "Titel"}</b><input style={input} value={active.title} onChange={e => patch({ title: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Kunde" : "Klant"}</b><input style={input} value={active.customer} onChange={e => patch({ customer: e.target.value })} /></label>
            <label><b>Datum</b><input type="date" style={input} value={active.date} onChange={e => patch({ date: e.target.value })} /></label>
            <label><b>Zeit</b><input type="time" style={input} value={active.time} onChange={e => patch({ time: e.target.value })} /></label>
            <label><b>Typ</b><select style={input} value={active.type} onChange={e => patch({ type: e.target.value })}>
              <option>Klant</option><option>Montage</option><option>Levering</option><option>Belangrijk</option>
            </select></label>
            <label style={{ gridColumn: "1 / 3" }}><b>{lang === "de" ? "Notizen" : "Notities"}</b><textarea style={{ ...input, height: 100, paddingTop: 10 }} value={active.note} onChange={e => patch({ note: e.target.value })} /></label>
          </div>
        </div>
      </div>
    </section>
  );
}

