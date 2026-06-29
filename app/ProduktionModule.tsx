"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type Status = "open" | "progress" | "done";

type ProductionItem = {
  id: string;
  customer: string;
  reference: string;
  article: string;
  status: Status;
  note: string;
  drawingName: string;
  drawingUrl: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "di_production_v1";

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowText() {
  return new Date().toLocaleString();
}

function emptyItem(lang: Lang): ProductionItem {
  const now = nowText();
  return {
    id: newId(),
    customer: lang === "de" ? "Neuer Kunde" : "Nieuwe klant",
    reference: "",
    article: "",
    status: "open",
    note: "",
    drawingName: "",
    drawingUrl: "",
    createdAt: now,
    updatedAt: now,
  };
}

const input: React.CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid #d7dde8",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  boxSizing: "border-box",
};

const primary: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

function statusLabel(s: Status, lang: Lang) {
  if (lang === "de") {
    return s === "open" ? "🔴 Offen" : s === "progress" ? "🟡 In Bearbeitung" : "🟢 Fertig";
  }
  return s === "open" ? "🔴 Open" : s === "progress" ? "🟡 Bezig" : "🟢 Klaar";
}

export default function ProduktionModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyItem(lang), []);
  const [items, setItems] = useState<ProductionItem[]>([first]);
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

  const filtered = items.filter(x =>
    `${x.customer} ${x.reference} ${x.article}`.toLowerCase().includes(query.toLowerCase())
  );

  function patch(p: Partial<ProductionItem>) {
    setItems(old => old.map(x => x.id === active.id ? { ...x, ...p, updatedAt: nowText() } : x));
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

  async function addDrawing(file?: File) {
    if (!file) return;
    const url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
    patch({ drawingName: file.name, drawingUrl: url });
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={primary} onClick={add}>➕ {lang === "de" ? "Neue Produktion" : "Nieuwe productie"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={del}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>
        <input style={{ ...input, width: 280 }} placeholder={lang === "de" ? "Suchen..." : "Zoeken..."} value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2>🏭 {lang === "de" ? "Produktion" : "Productie"}</h2>
          {filtered.map(x => (
            <button key={x.id} onClick={() => setActiveId(x.id)} style={{
              width: "100%", textAlign: "left", padding: 12, borderRadius: 12,
              border: x.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: x.id === active.id ? "#eff6ff" : "#fff",
              marginBottom: 8, cursor: "pointer"
            }}>
              <b>{x.customer}</b>
              <div style={{ fontSize: 12, color: "#64748b" }}>{x.article || "-"} · {statusLabel(x.status, lang)}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <h2>{lang === "de" ? "Produktionsauftrag" : "Productieopdracht"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label><b>{lang === "de" ? "Kunde" : "Klant"}</b><input style={input} value={active.customer} onChange={e => patch({ customer: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Referenz" : "Referentie"}</b><input style={input} value={active.reference} onChange={e => patch({ reference: e.target.value })} /></label>
            <label><b>{lang === "de" ? "Artikel" : "Artikel"}</b><input style={input} value={active.article} onChange={e => patch({ article: e.target.value })} /></label>
            <label><b>Status</b><select style={input} value={active.status} onChange={e => patch({ status: e.target.value as Status })}>
              <option value="open">{statusLabel("open", lang)}</option>
              <option value="progress">{statusLabel("progress", lang)}</option>
              <option value="done">{statusLabel("done", lang)}</option>
            </select></label>
            <label style={{ gridColumn: "1 / 3" }}><b>{lang === "de" ? "Notizen" : "Notities"}</b><textarea style={{ ...input, height: 100, paddingTop: 10 }} value={active.note} onChange={e => patch({ note: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / 3" }}><b>{lang === "de" ? "Zeichnung / Foto" : "Tekening / foto"}</b><br/><input type="file" accept="image/*,.pdf" onChange={e => addDrawing(e.target.files?.[0])} /></label>
          </div>
          {active.drawingUrl && (
            <div style={{ marginTop: 14 }}>
              <b>{active.drawingName}</b><br/>
              {active.drawingUrl.startsWith("data:image") ? <img src={active.drawingUrl} style={{ maxWidth: 280, borderRadius: 12, border: "1px solid #ddd" }} /> : <a href={active.drawingUrl} download={active.drawingName}>Download</a>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

