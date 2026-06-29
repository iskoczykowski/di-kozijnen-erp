"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type StockItem = { id: string; article: string; number: string; qty: number; location: string; note: string; };

const STORAGE_KEY = "di_stock_v1";
function newId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function emptyItem(lang: Lang): StockItem { return { id: newId(), article: lang === "de" ? "Neuer Artikel" : "Nieuw artikel", number: "", qty: 0, location: "", note: "" }; }

const input: React.CSSProperties = { width: "100%", height: 38, border: "1px solid #d7dde8", borderRadius: 10, padding: "0 10px", background: "#fff", boxSizing: "border-box" };
const primary: React.CSSProperties = { border: 0, borderRadius: 10, background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function LagerModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyItem(lang), []);
  const [items, setItems] = useState<StockItem[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setItems(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const active = items.find(x => x.id === activeId) || items[0];
  const filtered = items.filter(x => `${x.article} ${x.number} ${x.location}`.toLowerCase().includes(query.toLowerCase()));

  function patch(p: Partial<StockItem>) {
    setItems(old => old.map(x => x.id === active.id ? { ...x, ...p } : x));
  }

  function add() {
    const item = emptyItem(lang);
    setItems(old => [item, ...old]);
    setActiveId(item.id);
  }

  function del() {
    if (items.length <= 1) return;
    const rest = items.filter(x => x.id !== active.id);
    setItems(rest);
    setActiveId(rest[0].id);
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={primary} onClick={add}>➕ {lang === "de" ? "Neuer Artikel" : "Nieuw artikel"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={del}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>
        <input style={{ ...input, width: 280 }} placeholder={lang === "de" ? "Artikel suchen..." : "Artikel zoeken..."} value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2>📦 {lang === "de" ? "Lager" : "Magazijn"}</h2>
          {filtered.map(x => (
            <button key={x.id} onClick={() => setActiveId(x.id)} style={{
              width: "100%", textAlign: "left", padding: 12, borderRadius: 12,
              border: x.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: x.id === active.id ? "#eff6ff" : "#fff", marginBottom: 8, cursor: "pointer"
            }}>
              <b>{x.article}</b>
              <div style={{ fontSize: 12, color: "#64748b" }}>Menge: {x.qty} · {x.location || "-"}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <h2>{lang === "de" ? "Artikel bearbeiten" : "Artikel bewerken"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><b>Artikel</b><input style={input} value={active.article} onChange={e => patch({ article: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Artikelnummer" : "Artikelnummer"}</b><input style={input} value={active.number} onChange={e => patch({ number: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Menge" : "Aantal"}</b><input type="number" style={input} value={active.qty} onChange={e => patch({ qty: Number(e.target.value) })} /></label>
            <label><b>{lang === "de" ? "Lagerplatz" : "Locatie"}</b><input style={input} value={active.location} onChange={e => patch({ location: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / 3" }}><b>{lang === "de" ? "Notizen" : "Notities"}</b><textarea style={{ ...input, height: 100, paddingTop: 10 }} value={active.note} onChange={e => patch({ note: e.target.value })} /></label>
          </div>
        </div>
      </div>
    </section>
  );
}

