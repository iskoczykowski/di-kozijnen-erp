// MontageModule.tsx
// D&I Kozijnen ERP - Montage Modul V2
// Einbauen:
// 1) Datei speichern unter: app/MontageModule.tsx
// 2) In page.tsx oben: import MontageModule from "./MontageModule";
// 3) Alten Montage-Block ersetzen durch: {module === 'montage' && <MontageModule lang={lang} />}
// 4) package.json braucht: "xlsx": "^0.18.5"

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

type Lang = "de" | "nl";
type Status = "open" | "progress" | "done" | "accepted";
type Row3 = { a: string; b: string; qty: string };

type PhotoItem = {
  id: string;
  name: string;
  url: string;
};

type MontageList = {
  id: string;
  klant: string;
  referentie: string;
  adres: string;
  plaats: string;
  telefoon: string;
  opmerkingen: string;
  status: Status;
  date: string;
  ready: "ja" | "nee" | "";
  production: Row3[];
  raam: Row3[];
  extras: Row3[];
  benodigdheden: Row3[];
  glas: string[];
  photos: PhotoItem[];
  excelName: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "di_montage_lists_v2";

const productionTypes = ["Profiel","Dorpel","Cilinders","Deurgreep","Roosters","Paneel","Rabat","Schuifpui","Afwerking"];

const productionOptions = [
  "",
  "Wit kunststof vensterbank",
  "Steenlook vensterbank",
  "Crème kunststof vensterbank",
  "Aluminium deurknop met cilinder kerntrek beveiliging",
  "Zwarte deurknop met cilinder kerntrek beveiliging",
  "RVS 400 mm greep met cilinder kerntrek beveiliging",
  "RVS 600 mm greep met cilinder kerntrek beveiliging",
  "RVS 800 mm greep met cilinder kerntrek beveiliging",
  "RVS 1000 mm greep met cilinder kerntrek beveiliging",
  "RVS 1200 mm greep met cilinder kerntrek beveiliging",
  "RVS 1400 mm greep met cilinder kerntrek beveiliging",
  "RVS 1600 mm greep met cilinder kerntrek beveiliging",
  "RVS 1800 mm greep met cilinder kerntrek beveiliging",
  "Euro cilinder met 3 sleutels",
  "Euro cilinder met 6 sleutels",
  "Euro cilinder met 9 sleutels",
  "Eurocilinder gelijksluitend",
  "Knopcilinder",
  "Knopcilinder met 3 sleutels",
  "Knopcilinder met 6 sleutels",
  "Knopcilinder met 9 sleutels",
];

const raamTypes = ["Horren","Raamdecoratie","Rolluiken","Screens","Zonwering"];
const raamOptions = ["","Aluminium inzet hor","Plissé","Plissé hordeur","Rolhor","Schuifhordeur","Lamellen","Jaloezie","Rolgordijn","Rolluik hand","Rolluik elektrisch","Rolluik Solar","Screen hand","Screen elektrisch","Screen Solar","Zonnescherm","Uitvalscherm"];
const extraTypes = ["","Vensterbank","Dakraam nieuw","Dakraam vervangen","Waterslagdorpels","Voetvastzetter","Extra cilinder","Rabat","Boeidelen","Paneel","Afwerking"];
const extraOptions = ["","Wit kunststof vensterbank","Steenlook vensterbank","Crème kunststof vensterbank","Aluminium","Zwart","Verzinkt"];
const neededTypes = ["","Kraan Pieter","Kraan Rutten","Steiger","Ladder","Container","Hoogwerker","Glaslift"];
const glasOptions = ["Triple","HR++","Triple MAT","HR++ MAT","Triple veiligheidsglas","HR++ veiligheidsglas","Triple zonwerend","HR++ zonwerend","Triple met roeden","HR++ met roeden","Triple Melk","HR++ Melk"];
const qty = ["","1","2","3","4","5","6","7","8","9","10"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowText() {
  return new Date().toLocaleString();
}

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyList(lang: Lang): MontageList {
  const created = nowText();
  return {
    id: newId(),
    klant: lang === "de" ? "Neuer Kunde" : "Nieuwe klant",
    referentie: "",
    adres: "",
    plaats: "",
    telefoon: "",
    opmerkingen: "",
    status: "open",
    date: today(),
    ready: "",
    production: productionTypes.map((a) => ({ a, b: "", qty: "" })),
    raam: ["Horren","Raamdecoratie","Rolluiken","Horren","Horren"].map((a) => ({ a, b: "", qty: "1" })),
    extras: ["Vensterbank","Dakraam vervangen","Waterslagdorpels","Voetvastzetter",""].map((a) => ({ a, b: "", qty: "" })),
    benodigdheden: ["Kraan Pieter","Steiger",""].map((a) => ({ a, b: "", qty: "" })),
    glas: ["Triple zonwerend","HR++ veiligheidsglas"],
    photos: [],
    excelName: "",
    signature: "",
    createdAt: created,
    updatedAt: created,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  border: "1px solid #d7dde8",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  fontSize: 13,
  boxSizing: "border-box",
};

const smallInputStyle: React.CSSProperties = {
  ...inputStyle,
  textAlign: "center",
  padding: "0 4px",
};

const sectionTitle: React.CSSProperties = {
  margin: "18px 0 10px",
  fontSize: 18,
  fontWeight: 800,
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

const secondary: React.CSSProperties = {
  ...primary,
  background: "#475569",
};

function statusLabel(status: Status, lang: Lang) {
  const de: Record<Status, string> = {
    open: "🔴 Offen",
    progress: "🟡 In Arbeit",
    done: "🟢 Fertig",
    accepted: "🔵 Abgenommen",
  };
  const nl: Record<Status, string> = {
    open: "🔴 Open",
    progress: "🟡 Bezig",
    done: "🟢 Klaar",
    accepted: "🔵 Geaccepteerd",
  };
  return (lang === "de" ? de : nl)[status];
}

export default function MontageModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyList(lang), []);
  const [lists, setLists] = useState<MontageList[]>([first]);
  const [activeId, setActiveId] = useState<string>(first.id);
  const [query, setQuery] = useState("");
  const [showOverview, setShowOverview] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLists(parsed);
        setActiveId(parsed[0].id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {}
  }, [lists]);

  const active = lists.find((x) => x.id === activeId) || lists[0];

  const filtered = lists.filter((m) => {
    const s = `${m.klant} ${m.referentie} ${m.adres} ${m.plaats} ${m.telefoon}`.toLowerCase();
    return s.includes(query.toLowerCase());
  });

  function patchActive(patch: Partial<MontageList>) {
    setLists((old) => old.map((m) => (m.id === active.id ? { ...m, ...patch, updatedAt: nowText() } : m)));
  }

  function updateRow(group: "production" | "raam" | "extras" | "benodigdheden", i: number, key: keyof Row3, value: string) {
    const rows = [...active[group]];
    rows[i] = { ...rows[i], [key]: value };
    patchActive({ [group]: rows } as any);
  }

  function addList() {
    const item = emptyList(lang);
    setLists((old) => [item, ...old]);
    setActiveId(item.id);
    setShowOverview(false);
  }

  function duplicateList() {
    const item = { ...active, id: newId(), klant: `${active.klant} Kopie`, createdAt: nowText(), updatedAt: nowText() };
    setLists((old) => [item, ...old]);
    setActiveId(item.id);
  }

  function deleteList(id = active.id) {
    if (lists.length <= 1) return;
    if (!confirm(lang === "de" ? "Diese Montageliste löschen?" : "Deze montagelijst verwijderen?")) return;
    const filteredLists = lists.filter((m) => m.id !== id);
    setLists(filteredLists);
    setActiveId(filteredLists[0].id);
  }

  async function filesToPhotos(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const converted: PhotoItem[] = [];
    for (const file of arr) {
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
      });
      converted.push({ id: newId(), name: file.name, url });
    }
    patchActive({ photos: [...active.photos, ...converted] });
  }

  function removePhoto(id: string) {
    patchActive({ photos: active.photos.filter((p) => p.id !== id) });
  }

  async function importExcel(file: File) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const cell = (r: number, c: number) => rows?.[r]?.[c] || "";

    patchActive({
      excelName: file.name,
      klant: cell(3, 0) || active.klant,
      referentie: cell(4, 0) || active.referentie,
      adres: cell(5, 0) || active.adres,
      plaats: cell(6, 0) || active.plaats,
      telefoon: cell(7, 0) || active.telefoon,
      opmerkingen: cell(26, 0) || active.opmerkingen,
      production: active.production.map((row, i) => ({
        ...row,
        a: cell(10 + i, 0) || row.a,
        b: cell(10 + i, 1) || row.b,
        qty: cell(10 + i, 2) || row.qty,
      })),
      glas: [cell(24, 0) || active.glas[0], cell(25, 0) || active.glas[1]],
      raam: active.raam.map((row, i) => ({
        ...row,
        a: cell(4 + i, 4) || row.a,
        b: cell(4 + i, 5) || row.b,
        qty: cell(4 + i, 6) || row.qty,
      })),
      extras: active.extras.map((row, i) => ({
        ...row,
        a: cell(12 + i, 4) || row.a,
        b: cell(12 + i, 5) || row.b,
        qty: cell(12 + i, 6) || row.qty,
      })),
      benodigdheden: active.benodigdheden.map((row, i) => ({
        ...row,
        a: cell(21 + i, 4) || row.a,
        b: cell(21 + i, 5) || row.b,
        qty: cell(21 + i, 6) || row.qty,
      })),
    });

    alert(lang === "de" ? "Excel wurde importiert." : "Excel is geïmporteerd.");
  }

  function exportExcel() {
    const data = [
      ["D&I Kunststof Kozijnen B.V."],
      [lang === "de" ? "Bestell- / Montageliste" : "Bestel- / Montagelijst"],
      [],
      ["Klant", active.klant],
      ["Referentie", active.referentie],
      ["Adres", active.adres],
      ["Plaats", active.plaats],
      ["Tel.nr", active.telefoon],
      ["Status", statusLabel(active.status, lang)],
      ["Datum", active.date],
      [],
      ["Bestellijst productie"],
      ["Type", "Omschrijving", "Besteldatum"],
      ...active.production.map((r) => [r.a, r.b, r.qty]),
      [],
      ["Glas / Vulling"],
      ...active.glas.map((g) => [g]),
      [],
      ["Raamdecoratie / Rolluiken enz"],
      ["Type", "Omschrijving", "Aantal"],
      ...active.raam.map((r) => [r.a, r.b, r.qty]),
      [],
      ["Extra's"],
      ["Type", "Omschrijving", "Aantal"],
      ...active.extras.map((r) => [r.a, r.b, r.qty]),
      [],
      ["Benodigdheden"],
      ["Type", "Omschrijving", "Aantal"],
      ...active.benodigdheden.map((r) => [r.a, r.b, r.qty]),
      [],
      ["Opmerkingen", active.opmerkingen],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Montagelijst");
    XLSX.writeFile(wb, `montagelijst-${active.klant || "kunde"}.xlsx`);
  }

  function canvasPoint(e: any) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e: any) {
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const p = canvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function moveDraw(e: any) {
    if (!drawing.current) return;
    e.preventDefault?.();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const p = canvasPoint(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw() {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) patchActive({ signature: canvas.toDataURL("image/png") });
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    patchActive({ signature: "" });
  }

  return (
    <section>
      <style>{`
        @media print {
          aside, header, nav, .no-print, .sidebar, .topbar, .search { display:none !important; }
          body { background:white !important; margin:0 !important; padding:0 !important; }
          .montage-print { width:277mm !important; min-height:190mm !important; margin:0 auto !important; padding:8mm !important; box-shadow:none !important; border:none !important; }
          .montage-print * { font-size:11px !important; }
          .montage-title { font-size:22px !important; }
          .print-photos { display:flex !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button style={primary} onClick={addList}>➕ {lang === "de" ? "Neue Montageliste" : "Nieuwe montagelijst"}</button>
        <button style={secondary} onClick={() => setShowOverview(!showOverview)}>📂 {lang === "de" ? "Übersicht" : "Overzicht"}</button>
        <button style={secondary} onClick={duplicateList}>📄 {lang === "de" ? "Kopieren" : "Kopiëren"}</button>
        <button style={{ ...primary, background: "#dc2626" }} onClick={() => deleteList()}>🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}</button>

        <select style={{ ...inputStyle, width: 320 }} value={active.id} onChange={(e) => setActiveId(e.target.value)}>
          {lists.map((m) => (
            <option key={m.id} value={m.id}>
              {m.klant || "Kunde"} {m.referentie ? `- ${m.referentie}` : ""}
            </option>
          ))}
        </select>

        <input
          style={{ ...inputStyle, width: 260 }}
          placeholder={lang === "de" ? "Kunde / Referenz suchen" : "Klant / referentie zoeken"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {showOverview && (
        <div className="no-print" style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>{lang === "de" ? "Montagelisten" : "Montagelijsten"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 110px", gap: 8, fontWeight: 800, marginBottom: 8 }}>
            <div>Kunde</div><div>Referenz</div><div>Status</div><div>Geändert</div><div>Aktion</div>
          </div>
          {filtered.map((m) => (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 110px", gap: 8, padding: "8px 0", borderTop: "1px solid #edf0f5" }}>
              <div>{m.klant}</div>
              <div>{m.referentie || "-"}</div>
              <div>{statusLabel(m.status, lang)}</div>
              <div>{m.updatedAt}</div>
              <button style={{ ...primary, padding: "6px 10px" }} onClick={() => { setActiveId(m.id); setShowOverview(false); }}>
                Öffnen
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="montage-print" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #dfe3eb", boxShadow: "0 8px 24px rgba(0,0,0,.08)", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #dfe3eb", paddingBottom: 14 }}>
          <div>
            <div className="montage-title" style={{ fontSize: 28, fontWeight: 900 }}>D&I ◆ Kunststof Kozijnen B.V.</div>
            <div style={{ fontWeight: 700 }}>{lang === "de" ? "Bestell- / Montageliste" : "Bestel- / Montagelijst"}</div>
          </div>

          <div style={{ width: 310 }}>
            <div style={{ display: "grid", gridTemplateColumns: "85px 1fr", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <b>Status</b>
              <select style={inputStyle} value={active.status} onChange={(e) => patchActive({ status: e.target.value as Status })}>
                <option value="open">{statusLabel("open", lang)}</option>
                <option value="progress">{statusLabel("progress", lang)}</option>
                <option value="done">{statusLabel("done", lang)}</option>
                <option value="accepted">{statusLabel("accepted", lang)}</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "85px 1fr", gap: 8, alignItems: "center" }}>
              <b>Datum</b>
              <input type="date" style={inputStyle} value={active.date} onChange={(e) => patchActive({ date: e.target.value })} />
            </div>
            <div style={{ marginTop: 8 }}>
              <b>{lang === "de" ? "Arbeit fertig" : "Werk gereed"}:</b>
              <label style={{ marginLeft: 8 }}>Ja <input type="radio" name={`ready-${active.id}`} checked={active.ready === "ja"} onChange={() => patchActive({ ready: "ja" })} /></label>
              <label style={{ marginLeft: 8 }}>Nein <input type="radio" name={`ready-${active.id}`} checked={active.ready === "nee"} onChange={() => patchActive({ ready: "nee" })} /></label>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "520px 500px", gap: 34, alignItems: "start", marginTop: 18 }}>
          <div>
            {[
              ["klant", lang === "de" ? "Kunde" : "Klant"],
              ["referentie", lang === "de" ? "Referenz" : "Referentie"],
              ["adres", lang === "de" ? "Adresse" : "Adres"],
              ["plaats", lang === "de" ? "Ort" : "Plaats"],
              ["telefoon", lang === "de" ? "Telefon" : "Tel.nr"],
            ].map(([key, label]) => (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8, marginBottom: 6 }}>
                <b>{label}:</b>
                <input style={inputStyle} value={(active as any)[key] || ""} onChange={(e) => patchActive({ [key]: e.target.value } as any)} />
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Bestellliste Produktion" : "Bestellijst productie"}</h3>
            {active.production.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 230px 90px", gap: 7, marginBottom: 6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("production", i, "a", e.target.value)}>{productionTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("production", i, "b", e.target.value)}>{productionOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <input type="date" style={smallInputStyle} />
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Glas / Füllung" : "Glas / Vulling"}</h3>
            {active.glas.map((g, i) => (
              <select key={i} style={{ ...inputStyle, marginBottom: 6 }} value={g} onChange={(e) => { const glas = [...active.glas]; glas[i] = e.target.value; patchActive({ glas }); }}>
                {glasOptions.map((x) => <option key={x}>{x}</option>)}
              </select>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Bemerkungen" : "Opmerkingen"}</h3>
            <textarea style={{ ...inputStyle, height: 90, paddingTop: 8 }} value={active.opmerkingen} onChange={(e) => patchActive({ opmerkingen: e.target.value })} />
          </div>

          <div style={{ borderLeft: "1px solid #dfe3eb", paddingLeft: 24 }}>
            <h3 style={sectionTitle}>Raamdecoratie / Rolluiken enz</h3>
            {active.raam.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 210px 45px", gap: 7, marginBottom: 6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("raam", i, "a", e.target.value)}>{raamTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("raam", i, "b", e.target.value)}>{raamOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("raam", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <h3 style={sectionTitle}>Extra&apos;s</h3>
            {active.extras.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 210px 45px", gap: 7, marginBottom: 6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("extras", i, "a", e.target.value)}>{extraTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("extras", i, "b", e.target.value)}>{extraOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("extras", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Benötigt" : "Benodigdheden"}</h3>
            {active.benodigdheden.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 210px 45px", gap: 7, marginBottom: 6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("benodigdheden", i, "a", e.target.value)}>{neededTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <input style={inputStyle} value={row.b} onChange={(e) => updateRow("benodigdheden", i, "b", e.target.value)} />
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("benodigdheden", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Unterschrift" : "Handtekening"}</h3>
            <div className="no-print">
              <canvas
                ref={canvasRef}
                width={420}
                height={120}
                style={{ border: "1px solid #d7dde8", borderRadius: 10, width: "100%", height: 120, touchAction: "none" }}
                onMouseDown={startDraw}
                onMouseMove={moveDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={moveDraw}
                onTouchEnd={endDraw}
              />
              <button style={{ ...secondary, marginTop: 8 }} onClick={clearSignature}>{lang === "de" ? "Unterschrift löschen" : "Handtekening wissen"}</button>
            </div>
            {active.signature && <img src={active.signature} style={{ maxWidth: "100%", height: 90, border: "1px solid #d7dde8", borderRadius: 8 }} />}

            <div className="no-print">
              <h3 style={sectionTitle}>{lang === "de" ? "Fotos / Excel" : "Foto’s / Excel"}</h3>
              <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => filesToPhotos(e.target.files)} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {active.photos.map((p) => (
                  <div key={p.id} style={{ position: "relative" }}>
                    <img src={p.url} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 8 }} />
                    <button onClick={() => removePhoto(p.id)} style={{ position: "absolute", top: -6, right: -6, border: 0, borderRadius: 20, background: "#dc2626", color: "#fff", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>

              <input type="file" accept=".xlsx,.xls" style={{ marginTop: 14 }} onChange={(e) => { const file = e.target.files?.[0]; if (file) importExcel(file); }} />
              {active.excelName && <div style={{ marginTop: 8, fontSize: 13 }}>📊 {lang === "de" ? "Excel gewählt" : "Excel gekozen"}: {active.excelName}</div>}
            </div>
          </div>
        </div>

        {active.photos.length > 0 && (
          <div className="print-photos" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            {active.photos.slice(0, 8).map((p) => (
              <img key={p.id} src={p.url} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #d7dde8" }} />
            ))}
          </div>
        )}

        <div className="no-print" style={{ display: "flex", gap: 16, marginTop: 24, borderTop: "1px solid #ddd", paddingTop: 18 }}>
          <button onClick={() => window.print()} style={primary}>🖨️ {lang === "de" ? "PDF drucken" : "PDF afdrukken"}</button>
          <button style={{ ...primary, background: "#16a34a" }} onClick={exportExcel}>📊 {lang === "de" ? "Excel exportieren" : "Excel export"}</button>
        </div>
      </div>
    </section>
  );
}

