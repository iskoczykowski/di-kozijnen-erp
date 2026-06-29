// MontageModule.tsx
// Neue komplette Montage-Komponente für D&I Kozijnen ERP.
// In app/MontageModule.tsx speichern.
// In page.tsx importieren mit: import MontageModule from "./MontageModule";
// Deinen alten Montage-Block ersetzen durch:
// {module === 'montage' && <MontageModule lang={lang} />}

"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

type Lang = "de" | "nl";
type Row3 = { a: string; b: string; qty: string };

type MontageList = {
  id: string;
  klant: string;
  referentie: string;
  adres: string;
  plaats: string;
  telefoon: string;
  opmerkingen: string;
  production: Row3[];
  raam: Row3[];
  extras: Row3[];
  benodigdheden: Row3[];
  glas: string[];
  photos: File[];
  excelName: string;
};

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

function emptyList(lang: Lang): MontageList {
  return {
    id: Date.now().toString(),
    klant: lang === "de" ? "Neuer Kunde" : "Nieuwe klant",
    referentie: "",
    adres: "",
    plaats: "",
    telefoon: "",
    opmerkingen: "",
    production: productionTypes.map((a) => ({ a, b: "", qty: "" })),
    raam: ["Horren","Raamdecoratie","Rolluiken","Horren","Horren"].map((a) => ({ a, b: "", qty: "1" })),
    extras: ["Vensterbank","Dakraam vervangen","Waterslagdorpels","Voetvastzetter",""].map((a) => ({ a, b: "", qty: "" })),
    benodigdheden: ["Kraan Pieter","Steiger",""].map((a) => ({ a, b: "", qty: "" })),
    glas: ["Triple zonwerend","HR++ veiligheidsglas"],
    photos: [],
    excelName: "",
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

export default function MontageModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyList(lang), []);
  const [lists, setLists] = useState<MontageList[]>([first]);
  const [activeId, setActiveId] = useState<string>(first.id);

  const active = lists.find((x) => x.id === activeId) || lists[0];

  function patchActive(patch: Partial<MontageList>) {
    setLists((old) => old.map((m) => (m.id === active.id ? { ...m, ...patch } : m)));
  }

  function updateRow(group: "production" | "raam" | "extras" | "benodigdheden", i: number, key: keyof Row3, value: string) {
    const rows = [...active[group]];
    rows[i] = { ...rows[i], [key]: value };
    patchActive({ [group]: rows } as any);
  }

  function addList() {
    const item = emptyList(lang);
    setLists((old) => [...old, item]);
    setActiveId(item.id);
  }

  function deleteList() {
    if (lists.length <= 1) return;
    const filtered = lists.filter((m) => m.id !== active.id);
    setLists(filtered);
    setActiveId(filtered[0].id);
  }

  async function importExcel(file: File) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const cell = (r: number, c: number) => rows?.[r]?.[c] || "";

    patchActive({
      excelName: file.name,
      klant: cell(3, 0),
      referentie: cell(4, 0),
      adres: cell(5, 0),
      plaats: cell(6, 0),
      telefoon: cell(7, 0),
      opmerkingen: cell(26, 0),
      production: active.production.map((row, i) => ({
        ...row,
        a: cell(10 + i, 0) || row.a,
        b: cell(10 + i, 1) || row.b,
        qty: cell(10 + i, 2) || row.qty,
      })),
      glas: [cell(24, 0) || active.glas[0], cell(25, 0) || active.glas[1]],
    });

    alert(lang === "de" ? "Excel wurde importiert." : "Excel is geïmporteerd.");
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
        }
      `}</style>

      <div className="no-print" style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center" }}>
        <button style={primary} onClick={addList}>➕ {lang === "de" ? "Neue Montageliste" : "Nieuwe montagelijst"}</button>
        <select style={{ ...inputStyle, width:320 }} value={activeId} onChange={(e) => setActiveId(e.target.value)}>
          {lists.map((m) => <option key={m.id} value={m.id}>{m.klant || "Kunde"} {m.referentie ? `- ${m.referentie}` : ""}</option>)}
        </select>
        <button style={{ ...primary, background:"#dc2626" }} onClick={deleteList}>🗑️ {lang === "de" ? "Liste löschen" : "Lijst verwijderen"}</button>
      </div>

      <div className="montage-print" style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #dfe3eb", boxShadow:"0 8px 24px rgba(0,0,0,.08)", overflowX:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", borderBottom:"1px solid #dfe3eb", paddingBottom:14 }}>
          <div>
            <div className="montage-title" style={{ fontSize:28, fontWeight:900 }}>D&I ◆ Kunststof Kozijnen B.V.</div>
            <div style={{ fontWeight:700 }}>{lang === "de" ? "Bestell- / Montageliste" : "Bestel- / Montagelijst"}</div>
          </div>
          <div style={{ width:270 }}>
            <div style={{ display:"grid", gridTemplateColumns:"70px 1fr", gap:8, alignItems:"center" }}>
              <b>Datum</b><input type="date" style={inputStyle} />
            </div>
            <div style={{ marginTop:8 }}>
              <b>{lang === "de" ? "Arbeit fertig" : "Werk gereed"}:</b>
              <label style={{ marginLeft:8 }}>Ja <input type="radio" name="ready" /></label>
              <label style={{ marginLeft:8 }}>Nein <input type="radio" name="ready" /></label>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"520px 560px", gap:34, alignItems:"start", marginTop:18 }}>
          <div>
            {[
              ["klant", lang === "de" ? "Kunde" : "Klant"],
              ["referentie", lang === "de" ? "Referenz" : "Referentie"],
              ["adres", lang === "de" ? "Adresse" : "Adres"],
              ["plaats", lang === "de" ? "Ort" : "Plaats"],
              ["telefoon", lang === "de" ? "Telefon" : "Tel.nr"],
            ].map(([key, label]) => (
              <div key={key} style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:8, marginBottom:6 }}>
                <b>{label}:</b>
                <input style={inputStyle} value={(active as any)[key] || ""} onChange={(e) => patchActive({ [key]: e.target.value } as any)} />
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Bestellliste Produktion" : "Bestellijst productie"}</h3>
            {active.production.map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"90px 230px 90px", gap:7, marginBottom:6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("production", i, "a", e.target.value)}>{productionTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("production", i, "b", e.target.value)}>{productionOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <input type="date" style={smallInputStyle} />
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Glas / Füllung" : "Glas / Vulling"}</h3>
            {active.glas.map((g, i) => (
              <select key={i} style={{ ...inputStyle, marginBottom:6 }} value={g} onChange={(e) => { const glas = [...active.glas]; glas[i] = e.target.value; patchActive({ glas }); }}>
                {glasOptions.map((x) => <option key={x}>{x}</option>)}
              </select>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Bemerkungen" : "Opmerkingen"}</h3>
            <textarea style={{ ...inputStyle, height:90, paddingTop:8 }} value={active.opmerkingen} onChange={(e) => patchActive({ opmerkingen:e.target.value })} />
          </div>

          <div style={{ borderLeft:"1px solid #dfe3eb", paddingLeft:24 }}>
            <h3 style={sectionTitle}>Raamdecoratie / Rolluiken enz</h3>
            {active.raam.map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"220px 260px 50px", gap:7, marginBottom:6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("raam", i, "a", e.target.value)}>{raamTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("raam", i, "b", e.target.value)}>{raamOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("raam", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <h3 style={sectionTitle}>Extra&apos;s</h3>
            {active.extras.map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"220px 260px 50px", gap:7, marginBottom:6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("extras", i, "a", e.target.value)}>{extraTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={inputStyle} value={row.b} onChange={(e) => updateRow("extras", i, "b", e.target.value)}>{extraOptions.map((x) => <option key={x}>{x}</option>)}</select>
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("extras", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <h3 style={sectionTitle}>{lang === "de" ? "Benötigt" : "Benodigdheden"}</h3>
            {active.benodigdheden.map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"220px 260px 50px", gap:7, marginBottom:6 }}>
                <select style={inputStyle} value={row.a} onChange={(e) => updateRow("benodigdheden", i, "a", e.target.value)}>{neededTypes.map((x) => <option key={x}>{x}</option>)}</select>
                <input style={inputStyle} value={row.b} onChange={(e) => updateRow("benodigdheden", i, "b", e.target.value)} />
                <select style={smallInputStyle} value={row.qty} onChange={(e) => updateRow("benodigdheden", i, "qty", e.target.value)}>{qty.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            ))}

            <div className="no-print">
              <h3 style={sectionTitle}>{lang === "de" ? "Fotos / Excel" : "Foto’s / Excel"}</h3>
              <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => patchActive({ photos:Array.from(e.target.files || []) })} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
                {active.photos.map((file:any, i:number) => <img key={i} src={URL.createObjectURL(file)} style={{ width:90, height:70, objectFit:"cover", borderRadius:8 }} />)}
              </div>
              <input type="file" accept=".xlsx,.xls" style={{ marginTop:14 }} onChange={(e) => { const file = e.target.files?.[0]; if (file) importExcel(file); }} />
              {active.excelName && <div style={{ marginTop:8, fontSize:13 }}>📊 {lang === "de" ? "Excel gewählt" : "Excel gekozen"}: {active.excelName}</div>}
            </div>
          </div>
        </div>

        <div className="no-print" style={{ display:"flex", gap:16, marginTop:24, borderTop:"1px solid #ddd", paddingTop:18 }}>
          <button onClick={() => window.print()} style={primary}>🖨️ {lang === "de" ? "PDF drucken" : "PDF afdrukken"}</button>
          <button style={{ ...primary, background:"#16a34a" }}>📊 {lang === "de" ? "Excel exportieren" : "Excel export"}</button>
        </div>
      </div>
    </section>
  );
}

