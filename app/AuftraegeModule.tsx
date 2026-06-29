"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type ProjectStatus = "open" | "progress" | "done";

type Project = {
  id: string;
  customer: string;
  title: string;
  reference: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "di_projects_v1";

function newId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function nowText() { return new Date().toLocaleString(); }
function today() { return new Date().toISOString().slice(0, 10); }

function emptyProject(lang: Lang): Project {
  const now = nowText();
  return {
    id: newId(),
    customer: lang === "de" ? "Neuer Kunde" : "Nieuwe klant",
    title: lang === "de" ? "Neues Projekt" : "Nieuw project",
    reference: "",
    status: "open",
    startDate: today(),
    endDate: "",
    note: "",
    createdAt: now,
    updatedAt: now,
  };
}

const input: React.CSSProperties = {
  width: "100%", height: 38, border: "1px solid #d7dde8",
  borderRadius: 10, padding: "0 10px", background: "#fff", boxSizing: "border-box"
};

const primary: React.CSSProperties = {
  border: 0, borderRadius: 10, background: "#2563eb", color: "#fff",
  padding: "10px 14px", fontWeight: 700, cursor: "pointer"
};

function statusLabel(s: ProjectStatus, lang: Lang) {
  if (lang === "de") return s === "open" ? "🔴 Offen" : s === "progress" ? "🟡 In Bearbeitung" : "🟢 Fertig";
  return s === "open" ? "🔴 Open" : s === "progress" ? "🟡 Bezig" : "🟢 Klaar";
}

export default function ProjekteModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyProject(lang), []);
  const [projects, setProjects] = useState<Project[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setProjects(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch {}
  }, [projects]);

  const active = projects.find(x => x.id === activeId) || projects[0];
  const filtered = projects.filter(x => `${x.customer} ${x.title} ${x.reference}`.toLowerCase().includes(query.toLowerCase()));

  function patch(p: Partial<Project>) {
    setProjects(old => old.map(x => x.id === active.id ? { ...x, ...p, updatedAt: nowText() } : x));
  }

  function add() {
    const p = emptyProject(lang);
    setProjects(old => [p, ...old]);
    setActiveId(p.id);
  }

  function del() {
    if (projects.length <= 1) return;
    const rest = projects.filter(x => x.id !== active.id);
    setProjects(rest);
    setActiveId(rest[0].id);
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={primary} onClick={add}>➕ {lang === "de" ? "Neues Projekt" : "Nieuw project"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={del}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>
        <input style={{ ...input, width: 280 }} placeholder={lang === "de" ? "Projekt suchen..." : "Project zoeken..."} value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2>📁 {lang === "de" ? "Projekte" : "Projecten"}</h2>
          {filtered.map(p => (
            <button key={p.id} onClick={() => setActiveId(p.id)} style={{
              width: "100%", textAlign: "left", padding: 12, borderRadius: 12,
              border: p.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: p.id === active.id ? "#eff6ff" : "#fff", marginBottom: 8, cursor: "pointer"
            }}>
              <b>{p.title}</b>
              <div style={{ fontSize: 12, color: "#64748b" }}>{p.customer} · {statusLabel(p.status, lang)}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <h2>{lang === "de" ? "Projekt bearbeiten" : "Project bewerken"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><b>{lang === "de" ? "Kunde" : "Klant"}</b><input style={input} value={active.customer} onChange={e => patch({ customer: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Titel" : "Titel"}</b><input style={input} value={active.title} onChange={e => patch({ title: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Referenz" : "Referentie"}</b><input style={input} value={active.reference} onChange={e => patch({ reference: e.target.value })} /></label>
            <label><b>Status</b><select style={input} value={active.status} onChange={e => patch({ status: e.target.value as ProjectStatus })}>
              <option value="open">{statusLabel("open", lang)}</option>
              <option value="progress">{statusLabel("progress", lang)}</option>
              <option value="done">{statusLabel("done", lang)}</option>
            </select></label>
            <label><b>Start</b><input type="date" style={input} value={active.startDate} onChange={e => patch({ startDate: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Ende" : "Einde"}</b><input type="date" style={input} value={active.endDate} onChange={e => patch({ endDate: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / 3" }}><b>{lang === "de" ? "Notizen" : "Notities"}</b><textarea style={{ ...input, height: 110, paddingTop: 10 }} value={active.note} onChange={e => patch({ note: e.target.value })} /></label>
          </div>
        </div>
      </div>
    </section>
  );
}

