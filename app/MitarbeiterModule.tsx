"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type Employee = { id: string; name: string; role: string; phone: string; email: string; active: boolean; hours: number; };

const STORAGE_KEY = "di_employees_v1";
function newId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function emptyEmployee(lang: Lang): Employee { return { id: newId(), name: lang === "de" ? "Neuer Mitarbeiter" : "Nieuwe medewerker", role: "Monteur", phone: "", email: "", active: true, hours: 0 }; }

const input: React.CSSProperties = { width: "100%", height: 38, border: "1px solid #d7dde8", borderRadius: 10, padding: "0 10px", background: "#fff", boxSizing: "border-box" };
const primary: React.CSSProperties = { border: 0, borderRadius: 10, background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function MitarbeiterModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyEmployee(lang), []);
  const [employees, setEmployees] = useState<Employee[]>([first]);
  const [activeId, setActiveId] = useState(first.id);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setEmployees(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); } catch {}
  }, [employees]);

  const active = employees.find(x => x.id === activeId) || employees[0];

  function patch(p: Partial<Employee>) {
    setEmployees(old => old.map(x => x.id === active.id ? { ...x, ...p } : x));
  }

  function add() {
    const e = emptyEmployee(lang);
    setEmployees(old => [e, ...old]);
    setActiveId(e.id);
  }

  function del() {
    if (employees.length <= 1) return;
    const rest = employees.filter(x => x.id !== active.id);
    setEmployees(rest);
    setActiveId(rest[0].id);
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button style={primary} onClick={add}>➕ {lang === "de" ? "Neuer Mitarbeiter" : "Nieuwe medewerker"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={del}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2>👷 {lang === "de" ? "Mitarbeiter" : "Medewerkers"}</h2>
          {employees.map(e => (
            <button key={e.id} onClick={() => setActiveId(e.id)} style={{
              width: "100%", textAlign: "left", padding: 12, borderRadius: 12,
              border: e.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: e.id === active.id ? "#eff6ff" : "#fff", marginBottom: 8, cursor: "pointer"
            }}>
              <b>{e.name}</b>
              <div style={{ fontSize: 12, color: "#64748b" }}>{e.role} · {e.active ? "Online" : "Inaktiv"}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <h2>{lang === "de" ? "Mitarbeiter bearbeiten" : "Medewerker bewerken"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><b>Name</b><input style={input} value={active.name} onChange={e => patch({ name: e.target.value })} /></label>
            <label><b>Rolle</b><select style={input} value={active.role} onChange={e => patch({ role: e.target.value })}><option>Büro</option><option>Monteur</option><option>Produktion</option><option>Lager</option></select></label>
            <label><b>Telefon</b><input style={input} value={active.phone} onChange={e => patch({ phone: e.target.value })} /></label>
            <label><b>E-Mail</b><input style={input} value={active.email} onChange={e => patch({ email: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Stunden" : "Uren"}</b><input type="number" style={input} value={active.hours} onChange={e => patch({ hours: Number(e.target.value) })} /></label>
            <label><b>Status</b><select style={input} value={String(active.active)} onChange={e => patch({ active: e.target.value === "true" })}><option value="true">Aktiv</option><option value="false">Inaktiv</option></select></label>
          </div>
        </div>
      </div>
    </section>
  );
}

