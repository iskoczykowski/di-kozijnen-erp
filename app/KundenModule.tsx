// KundenModule.tsx
// D&I Kozijnen ERP - Kundenmodul
// Speichern unter: app/KundenModule.tsx
// In page.tsx oben einfügen: import KundenModule from "./KundenModule";
// Alten Kunden-Block ersetzen durch: {module === "customers" && <KundenModule lang={lang} />}

"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "de" | "nl";
type CustomerStatus = "active" | "planning" | "production" | "montage" | "done";

type CustomerFile = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type Customer = {
  id: string;
  name: string;
  reference: string;
  contact: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  note: string;
  status: CustomerStatus;
  photos: CustomerFile[];
  docs: CustomerFile[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "di_customers_v1";

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowText() {
  return new Date().toLocaleString();
}

function emptyCustomer(lang: Lang): Customer {
  const now = nowText();
  return {
    id: newId(),
    name: lang === "de" ? "Neuer Kunde" : "Nieuwe klant",
    reference: "",
    contact: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    postalCode: "",
    note: "",
    status: "active",
    photos: [],
    docs: [],
    createdAt: now,
    updatedAt: now,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid #d7dde8",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  fontSize: 13,
  boxSizing: "border-box",
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 90,
  paddingTop: 10,
  resize: "vertical",
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

function statusLabel(status: CustomerStatus, lang: Lang) {
  const de: Record<CustomerStatus, string> = {
    active: "🟢 Aktiv",
    planning: "🔵 Planung",
    production: "🟡 Produktion",
    montage: "🟣 Montage",
    done: "✅ Fertig",
  };
  const nl: Record<CustomerStatus, string> = {
    active: "🟢 Actief",
    planning: "🔵 Planning",
    production: "🟡 Productie",
    montage: "🟣 Montage",
    done: "✅ Klaar",
  };
  return (lang === "de" ? de : nl)[status];
}

async function convertFiles(files: FileList | null): Promise<CustomerFile[]> {
  if (!files) return [];
  const out: CustomerFile[] = [];

  for (const file of Array.from(files)) {
    const url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });

    out.push({
      id: newId(),
      name: file.name,
      url,
      type: file.type,
    });
  }

  return out;
}

export default function KundenModule({ lang = "de" }: { lang?: Lang }) {
  const first = useMemo(() => emptyCustomer(lang), []);
  const [customers, setCustomers] = useState<Customer[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomers(parsed);
        setActiveId(parsed[0].id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch {}
  }, [customers]);

  const active = customers.find((c) => c.id === activeId) || customers[0];

  const filtered = customers.filter((c) => {
    const s = `${c.name} ${c.reference} ${c.contact} ${c.phone} ${c.email} ${c.street} ${c.city}`.toLowerCase();
    return s.includes(query.toLowerCase());
  });

  function patchActive(patch: Partial<Customer>) {
    setCustomers((old) =>
      old.map((c) => (c.id === active.id ? { ...c, ...patch, updatedAt: nowText() } : c))
    );
  }

  function addCustomer() {
    const c = emptyCustomer(lang);
    setCustomers((old) => [c, ...old]);
    setActiveId(c.id);
  }

  function duplicateCustomer() {
    const c = {
      ...active,
      id: newId(),
      name: `${active.name} Kopie`,
      createdAt: nowText(),
      updatedAt: nowText(),
    };
    setCustomers((old) => [c, ...old]);
    setActiveId(c.id);
  }

  function deleteCustomer(id = active.id) {
    if (customers.length <= 1) {
      alert(lang === "de" ? "Mindestens ein Kunde muss bleiben." : "Minimaal één klant moet blijven.");
      return;
    }

    if (!confirm(lang === "de" ? "Kunden wirklich löschen?" : "Klant echt verwijderen?")) return;

    const rest = customers.filter((c) => c.id !== id);
    setCustomers(rest);
    setActiveId(rest[0].id);
  }

  function googleMapsLink() {
    const address = `${active.street} ${active.postalCode} ${active.city}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || active.name)}`;
  }

  async function addPhotos(files: FileList | null) {
    const items = await convertFiles(files);
    patchActive({ photos: [...active.photos, ...items] });
  }

  async function addDocs(files: FileList | null) {
    const items = await convertFiles(files);
    patchActive({ docs: [...active.docs, ...items] });
  }

  function removePhoto(id: string) {
    patchActive({ photos: active.photos.filter((p) => p.id !== id) });
  }

  function removeDoc(id: string) {
    patchActive({ docs: active.docs.filter((p) => p.id !== id) });
  }

  function exportCustomers() {
    const rows = customers.map((c) => ({
      Name: c.name,
      Referenz: c.reference,
      Ansprechpartner: c.contact,
      Telefon: c.phone,
      Email: c.email,
      Adresse: c.street,
      PLZ: c.postalCode,
      Ort: c.city,
      Status: statusLabel(c.status, lang),
      Notiz: c.note,
      Erstellt: c.createdAt,
      Geändert: c.updatedAt,
    }));

    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kunden-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!active) return null;

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button style={primary} onClick={addCustomer}>
          ➕ {lang === "de" ? "Neuer Kunde" : "Nieuwe klant"}
        </button>

        <button style={secondary} onClick={duplicateCustomer}>
          📄 {lang === "de" ? "Kopieren" : "Kopiëren"}
        </button>

        <button style={{ ...primary, background: "#dc2626" }} onClick={() => deleteCustomer()}>
          🗑️ {lang === "de" ? "Löschen" : "Verwijderen"}
        </button>

        <button style={{ ...primary, background: "#16a34a" }} onClick={exportCustomers}>
          📦 Export
        </button>

        <input
          style={{ ...inputStyle, width: 280 }}
          placeholder={lang === "de" ? "Kunden suchen..." : "Klant zoeken..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>👥 {lang === "de" ? "Kunden" : "Klanten"}</h2>

          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 12,
                borderRadius: 12,
                border: c.id === active.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
                background: c.id === active.id ? "#eff6ff" : "#fff",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 800 }}>{c.name || "-"}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {c.reference || "-"} · {statusLabel(c.status, lang)}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{c.city || c.phone || c.email}</div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
            <div>
              <h2 style={{ margin: 0 }}>👤 {active.name}</h2>
              <div style={{ color: "#64748b", marginTop: 4 }}>
                {lang === "de" ? "Geändert" : "Gewijzigd"}: {active.updatedAt}
              </div>
            </div>

            <a
              href={googleMapsLink()}
              target="_blank"
              rel="noreferrer"
              style={{ ...primary, textDecoration: "none", display: "inline-block" }}
            >
              📍 Google Maps
            </a>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "18px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label>
              <b>{lang === "de" ? "Kundenname" : "Klantnaam"}</b>
              <input style={inputStyle} value={active.name} onChange={(e) => patchActive({ name: e.target.value })} />
            </label>

            <label>
              <b>{lang === "de" ? "Referenz" : "Referentie"}</b>
              <input style={inputStyle} value={active.reference} onChange={(e) => patchActive({ reference: e.target.value })} />
            </label>

            <label>
              <b>{lang === "de" ? "Ansprechpartner" : "Contactpersoon"}</b>
              <input style={inputStyle} value={active.contact} onChange={(e) => patchActive({ contact: e.target.value })} />
            </label>

            <label>
              <b>Status</b>
              <select style={inputStyle} value={active.status} onChange={(e) => patchActive({ status: e.target.value as CustomerStatus })}>
                <option value="active">{statusLabel("active", lang)}</option>
                <option value="planning">{statusLabel("planning", lang)}</option>
                <option value="production">{statusLabel("production", lang)}</option>
                <option value="montage">{statusLabel("montage", lang)}</option>
                <option value="done">{statusLabel("done", lang)}</option>
              </select>
            </label>

            <label>
              <b>Telefon</b>
              <input style={inputStyle} value={active.phone} onChange={(e) => patchActive({ phone: e.target.value })} />
            </label>

            <label>
              <b>E-Mail</b>
              <input style={inputStyle} value={active.email} onChange={(e) => patchActive({ email: e.target.value })} />
            </label>

            <label style={{ gridColumn: "1 / 3" }}>
              <b>{lang === "de" ? "Adresse" : "Adres"}</b>
              <input style={inputStyle} value={active.street} onChange={(e) => patchActive({ street: e.target.value })} />
            </label>

            <label>
              <b>PLZ</b>
              <input style={inputStyle} value={active.postalCode} onChange={(e) => patchActive({ postalCode: e.target.value })} />
            </label>

            <label>
              <b>{lang === "de" ? "Ort" : "Plaats"}</b>
              <input style={inputStyle} value={active.city} onChange={(e) => patchActive({ city: e.target.value })} />
            </label>

            <label style={{ gridColumn: "1 / 3" }}>
              <b>{lang === "de" ? "Notizen" : "Notities"}</b>
              <textarea style={textAreaStyle} value={active.note} onChange={(e) => patchActive({ note: e.target.value })} />
            </label>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "18px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <h3>📷 {lang === "de" ? "Fotos" : "Foto’s"}</h3>
              <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => addPhotos(e.target.files)} />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {active.photos.map((p) => (
                  <div key={p.id} style={{ position: "relative" }}>
                    <img src={p.url} style={{ width: 110, height: 82, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
                    <button
                      onClick={() => removePhoto(p.id)}
                      style={{ position: "absolute", top: -6, right: -6, border: 0, borderRadius: 20, background: "#dc2626", color: "#fff", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3>📎 {lang === "de" ? "Dokumente / Zeichnungen" : "Documenten / Tekeningen"}</h3>
              <input type="file" multiple onChange={(e) => addDocs(e.target.files)} />

              <div style={{ marginTop: 10 }}>
                {active.docs.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      marginBottom: 6,
                    }}
                  >
                    <a href={d.url} download={d.name} style={{ color: "#2563eb", fontWeight: 700 }}>
                      📄 {d.name}
                    </a>
                    <button onClick={() => removeDoc(d.id)} style={{ ...primary, background: "#dc2626", padding: "5px 9px" }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "18px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 12, background: "#f8fafc" }}>
              <b>Projekte</b>
              <div style={{ color: "#64748b" }}>Noch nicht verknüpft</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#f8fafc" }}>
              <b>Produktion</b>
              <div style={{ color: "#64748b" }}>Noch nicht verknüpft</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#f8fafc" }}>
              <b>Montage</b>
              <div style={{ color: "#64748b" }}>Wird als Nächstes verbunden</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#f8fafc" }}>
              <b>Rechnung</b>
              <div style={{ color: "#64748b" }}>Später</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

