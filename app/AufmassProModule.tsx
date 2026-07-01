'use client';

import React, { useEffect, useRef, useState } from 'react';

type Lang = 'de' | 'nl';

type MeasureKey =
  | 'breite'
  | 'hoehe'
  | 'tiefe'
  | 'links'
  | 'rechts'
  | 'oben'
  | 'unten'
  | 'diagonal1'
  | 'diagonal2';

type WindowType =
  | 'unknown'
  | 'dreh_kipp'
  | 'fest'
  | 'schiebetuer'
  | 'haustuer'
  | 'balkontuer';

type PhotoItem = {
  id: string;
  src: string;
};

type ElementItem = {
  id: string;
  nr: number;
  name: string;
  room: string;
  type: WindowType;
  wings: number;
  opening: string;
  profile: string;
  colorIn: string;
  colorOut: string;
  roller: boolean;
  sill: boolean;
  insect: boolean;
  note: string;
  photos: PhotoItem[];
  measures: Record<MeasureKey, number>;
  aiDone: boolean;
  aiText: string;
};

type Props = {
  lang?: Lang;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  onSave?: (elements: ElementItem[]) => void;
};

const STORAGE_PREFIX = 'di_safe_aufmass_v1_';

const TXT = {
  de: {
    title: 'Aufmaß Pro',
    sub: 'Foto machen, Fenster wählen, Maße übernehmen und Skizze erzeugen.',
    add: 'Fenster hinzufügen',
    photo: 'Foto aufnehmen',
    photos: 'Fotos',
    upload: 'Foto hochladen',
    noPhoto: 'Noch kein Foto',
    analyse: 'KI-Fotoanalyse starten',
    apply: 'Vorschlag übernehmen',
    sketch: 'Skizze erzeugen',
    save: 'Speichern',
    windows: 'Fenster / Elemente',
    active: 'Aktives Messfeld',
    test: 'Testwert übernehmen',
    last: 'Letzte Messung',
    name: 'Name',
    room: 'Raum',
    type: 'Fensterart',
    wings: 'Flügel',
    opening: 'Öffnungsrichtung',
    profile: 'Profil',
    colorIn: 'Farbe innen',
    colorOut: 'Farbe außen',
    roller: 'Rollladen',
    sill: 'Fensterbank',
    insect: 'Insektenschutz',
    note: 'Notiz',
    width: 'Breite',
    height: 'Höhe',
    depth: 'Tiefe',
    left: 'Links',
    right: 'Rechts',
    top: 'Oben',
    bottom: 'Unten',
    d1: 'Diagonal 1',
    d2: 'Diagonal 2',
    unknown: 'Noch nicht erkannt',
    dreh: 'Dreh-Kipp',
    fest: 'Festverglasung',
    schiebe: 'Schiebetür',
    tuer: 'Haustür',
    balkon: 'Balkontür',
    bosch: 'Bosch Web-Modus',
    boschText: 'Live-Bluetooth kommt in der Android-App. In der Web-Version kannst du Testwert oder manuelle Eingabe nutzen.',
    aiHint: 'Noch keine KI-Analyse gestartet.',
    aiText: 'KI-Vorschlag: 2-flügeliges Fenster, links Dreh-Kipp, rechts fest, Fensterbank vorhanden.',
    storageWarn: 'Hinweis: Browser-Speicher war voll. Foto wurde angezeigt, aber eventuell nicht dauerhaft gespeichert.',
  },
  nl: {
    title: 'Inmeting Pro',
    sub: 'Foto maken, raam kiezen, maten overnemen en schets maken.',
    add: 'Raam toevoegen',
    photo: 'Foto maken',
    photos: 'Foto’s',
    upload: 'Foto uploaden',
    noPhoto: 'Nog geen foto',
    analyse: 'AI-fotoanalyse starten',
    apply: 'Voorstel overnemen',
    sketch: 'Schets maken',
    save: 'Opslaan',
    windows: 'Ramen / elementen',
    active: 'Actief meetveld',
    test: 'Testwaarde overnemen',
    last: 'Laatste meting',
    name: 'Naam',
    room: 'Ruimte',
    type: 'Raamtype',
    wings: 'Vleugels',
    opening: 'Openingsrichting',
    profile: 'Profiel',
    colorIn: 'Kleur binnen',
    colorOut: 'Kleur buiten',
    roller: 'Rolluik',
    sill: 'Vensterbank',
    insect: 'Insectenhor',
    note: 'Notitie',
    width: 'Breedte',
    height: 'Hoogte',
    depth: 'Diepte',
    left: 'Links',
    right: 'Rechts',
    top: 'Boven',
    bottom: 'Onder',
    d1: 'Diagonaal 1',
    d2: 'Diagonaal 2',
    unknown: 'Nog niet herkend',
    dreh: 'Draai-kiep',
    fest: 'Vast glas',
    schiebe: 'Schuifpui',
    tuer: 'Voordeur',
    balkon: 'Balkondeur',
    bosch: 'Bosch webmodus',
    boschText: 'Live-Bluetooth komt in de Android-app. In de webversie kun je testwaarde of handmatige invoer gebruiken.',
    aiHint: 'Nog geen AI-analyse gestart.',
    aiText: 'AI-voorstel: 2-vleugelig raam, links draai-kiep, rechts vast, vensterbank aanwezig.',
    storageWarn: 'Opmerking: browseropslag was vol. Foto is getoond, maar mogelijk niet blijvend opgeslagen.',
  },
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe6f0',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 6px 18px rgba(15,23,42,.05)',
};

const input: React.CSSProperties = {
  width: '100%',
  height: 38,
  border: '1px solid #d7dde8',
  borderRadius: 10,
  padding: '0 10px',
  boxSizing: 'border-box',
  background: '#fff',
};

const textarea: React.CSSProperties = {
  ...input,
  height: 88,
  padding: 10,
};

const btn: React.CSSProperties = {
  border: '1px solid #d7dde8',
  background: '#fff',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const blueBtn: React.CSSProperties = {
  ...btn,
  background: '#2563eb',
  borderColor: '#2563eb',
  color: '#fff',
};

const greenBtn: React.CSSProperties = {
  ...btn,
  background: '#16a34a',
  borderColor: '#16a34a',
  color: '#fff',
};

const purpleBtn: React.CSSProperties = {
  ...btn,
  background: '#7c3aed',
  borderColor: '#7c3aed',
  color: '#fff',
};

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMeasures(): Record<MeasureKey, number> {
  return {
    breite: 0,
    hoehe: 0,
    tiefe: 0,
    links: 0,
    rechts: 0,
    oben: 0,
    unten: 0,
    diagonal1: 0,
    diagonal2: 0,
  };
}

function emptyElement(lang: Lang, nr: number): ElementItem {
  return {
    id: id('el'),
    nr,
    name: lang === 'de' ? `Fenster ${nr}` : `Raam ${nr}`,
    room: lang === 'de' ? 'Raum' : 'Ruimte',
    type: 'unknown',
    wings: 1,
    opening: '',
    profile: '',
    colorIn: '9016',
    colorOut: '7016',
    roller: false,
    sill: false,
    insect: false,
    note: '',
    photos: [],
    measures: emptyMeasures(),
    aiDone: false,
    aiText: '',
  };
}

function safeNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalize(raw: any, lang: Lang, index: number): ElementItem {
  const base = emptyElement(lang, index + 1);

  const photos: PhotoItem[] = Array.isArray(raw?.photos)
    ? raw.photos
        .map((p: any) => {
          if (typeof p === 'string') return { id: id('ph'), src: p };
          if (p && typeof p.src === 'string') return { id: p.id || id('ph'), src: p.src };
          return null;
        })
        .filter((p: PhotoItem | null): p is PhotoItem => Boolean(p))
    : [];

  const m = raw?.measures || {};

  return {
    ...base,
    id: raw?.id || base.id,
    nr: safeNumber(raw?.nr || raw?.number || index + 1),
    name: String(raw?.name || base.name),
    room: String(raw?.room || base.room),
    type: (raw?.type || 'unknown') as WindowType,
    wings: safeNumber(raw?.wings || 1) || 1,
    opening: String(raw?.opening || ''),
    profile: String(raw?.profile || raw?.profileNumber || ''),
    colorIn: String(raw?.colorIn || raw?.colorInside || '9016'),
    colorOut: String(raw?.colorOut || raw?.colorOutside || '7016'),
    roller: Boolean(raw?.roller || raw?.rollerShutter),
    sill: Boolean(raw?.sill || raw?.windowSill),
    insect: Boolean(raw?.insect || raw?.insectScreen),
    note: String(raw?.note || ''),
    photos,
    measures: {
      breite: safeNumber(m.breite),
      hoehe: safeNumber(m.hoehe),
      tiefe: safeNumber(m.tiefe),
      links: safeNumber(m.links),
      rechts: safeNumber(m.rechts),
      oben: safeNumber(m.oben),
      unten: safeNumber(m.unten),
      diagonal1: safeNumber(m.diagonal1),
      diagonal2: safeNumber(m.diagonal2),
    },
    aiDone: Boolean(raw?.aiDone || raw?.aiAnalyzed || raw?.aiSketchReady),
    aiText: String(raw?.aiText || raw?.aiHint || ''),
  };
}

function measureRows(t: typeof TXT.de): [MeasureKey, string][] {
  return [
    ['breite', t.width],
    ['hoehe', t.height],
    ['tiefe', t.depth],
    ['links', t.left],
    ['rechts', t.right],
    ['oben', t.top],
    ['unten', t.bottom],
    ['diagonal1', t.d1],
    ['diagonal2', t.d2],
  ];
}

function typeText(type: WindowType, t: typeof TXT.de) {
  if (type === 'dreh_kipp') return t.dreh;
  if (type === 'fest') return t.fest;
  if (type === 'schiebetuer') return t.schiebe;
  if (type === 'haustuer') return t.tuer;
  if (type === 'balkontuer') return t.balkon;
  return t.unknown;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('reader'));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('image'));

      img.onload = () => {
        const max = 900;
        const scale = Math.min(max / img.width, max / img.height, 1);

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };

      img.src = String(reader.result || '');
    };

    reader.readAsDataURL(file);
  });
}

export default function AufmassProModule({
  lang = 'de',
  orderId = 'default',
  orderNumber = '',
  customerName = '',
  onSave,
}: Props) {
  const t = TXT[lang];
  const fileRef = useRef<HTMLInputElement | null>(null);
  const storageKey = `${STORAGE_PREFIX}${orderId || 'default'}`;

  const [elements, setElements] = useState<ElementItem[]>([emptyElement(lang, 1)]);
  const [activeId, setActiveId] = useState('');
  const [field, setField] = useState<MeasureKey>('breite');
  const [last, setLast] = useState<number | null>(null);
  const [warn, setWarn] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (!raw) {
        const first = emptyElement(lang, 1);
        setElements([first]);
        setActiveId(first.id);
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length) {
        const clean = parsed.map((x, i) => normalize(x, lang, i));
        setElements(clean);
        setActiveId(clean[0].id);
      } else {
        const first = emptyElement(lang, 1);
        setElements([first]);
        setActiveId(first.id);
      }
    } catch {
      localStorage.removeItem(storageKey);
      const first = emptyElement(lang, 1);
      setElements([first]);
      setActiveId(first.id);
    }
  }, [storageKey, lang]);

  const active = elements.find((e) => e.id === activeId) || elements[0];

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(elements));
      setWarn('');
    } catch {
      setWarn(t.storageWarn);
    }

    onSave?.(elements);
  }, [elements, storageKey, t.storageWarn, onSave]);

  function updateActive(patch: Partial<ElementItem>) {
    if (!active) return;

    setElements((prev) =>
      prev.map((el) => (el.id === active.id ? { ...el, ...patch } : el))
    );
  }

  function updateMeasure(key: MeasureKey, value: number) {
    if (!active) return;

    updateActive({
      measures: {
        ...active.measures,
        [key]: safeNumber(value),
      },
    });
  }

  function addElement() {
    const next = emptyElement(lang, elements.length + 1);
    setElements((prev) => [...prev, next]);
    setActiveId(next.id);
  }

  async function addPhotos(files: File[]) {
    if (!files.length || !active) return;

    try {
      const newPhotos: PhotoItem[] = [];

      for (const file of files.slice(0, 4)) {
        const src = await compressImage(file);
        newPhotos.push({ id: id('ph'), src });
      }

      updateActive({
        photos: [...active.photos, ...newPhotos],
      });
    } catch {
      setWarn(lang === 'de' ? 'Foto konnte nicht geladen werden.' : 'Foto kon niet geladen worden.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removePhoto(photoId: string) {
    if (!active) return;

    updateActive({
      photos: active.photos.filter((p) => p.id !== photoId),
    });
  }

  function testValue() {
    const value =
      field === 'breite'
        ? 1234
        : field === 'hoehe'
          ? 1487
          : field === 'tiefe'
            ? 72
            : field.includes('diagonal')
              ? 1920
              : 65;

    setLast(value);
    updateMeasure(field, value);
  }

  function analyse() {
    if (!active) return;

    updateActive({
      aiDone: true,
      aiText: t.aiText,
      type: active.type === 'unknown' ? 'dreh_kipp' : active.type,
      wings: 2,
      opening: lang === 'de' ? 'links Dreh-Kipp, rechts fest' : 'links draai-kiep, rechts vast',
      sill: true,
    });
  }

  function sketch() {
    if (!active) return;

    updateActive({
      aiDone: true,
      aiText: active.aiText || t.aiText,
    });
  }

  if (!active) {
    return <div style={card}>Aufmaß wird geladen...</div>;
  }

  const mainPhoto = active.photos[0]?.src || '';
  const rows = measureRows(t);

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>📐 {t.title}</h2>
            <p style={{ color: '#64748b', marginBottom: 0 }}>
              {t.sub}
              {orderNumber ? ` · ${orderNumber}` : ''}
              {customerName ? ` · ${customerName}` : ''}
            </p>
          </div>

          <button style={greenBtn} onClick={() => onSave?.(elements)}>
            ✓ {t.save}
          </button>
        </div>

        {warn && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: 800,
            }}
          >
            {warn}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <aside style={card}>
          <h3 style={{ marginTop: 0 }}>🪟 {t.windows}</h3>

          <button style={{ ...blueBtn, width: '100%', marginBottom: 12 }} onClick={addElement}>
            + {t.add}
          </button>

          <div style={{ display: 'grid', gap: 8 }}>
            {elements.map((el) => (
              <button
                key={el.id}
                onClick={() => setActiveId(el.id)}
                style={{
                  ...btn,
                  textAlign: 'left',
                  borderColor: el.id === active.id ? '#2563eb' : '#d7dde8',
                  background: el.id === active.id ? '#eff6ff' : '#fff',
                }}
              >
                <b>
                  {el.nr}. {el.name}
                </b>

                <div style={{ color: '#64748b' }}>
                  {el.room} · {typeText(el.type, t)}
                </div>

                <small>
                  {el.photos.length} {t.photos} · {el.measures.breite} × {el.measures.hoehe} mm
                </small>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <section style={card}>
              <h3 style={{ marginTop: 0 }}>📷 {t.photo}</h3>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => addPhotos(Array.from(e.target.files || []))}
              />

              <div
                style={{
                  height: 260,
                  border: '1px solid #dfe6f0',
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  background: '#f8fafc',
                }}
              >
                {mainPhoto ? (
                  <img
                    src={mainPhoto}
                    alt="Fenster"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b' }}>
                    📷
                    <br />
                    {t.noPhoto}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={blueBtn} onClick={() => fileRef.current?.click()}>
                  📷 {t.photo}
                </button>

                <button style={btn} onClick={() => fileRef.current?.click()}>
                  🖼️ {t.upload}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 10 }}>
                {active.photos.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ position: 'relative' }}>
                    <img
                      src={p.src}
                      alt="Foto"
                      style={{ width: '100%', height: 58, objectFit: 'cover', borderRadius: 8 }}
                    />

                    <button
                      onClick={() => removePhoto(p.id)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        border: 0,
                        borderRadius: 99,
                        background: '#ef4444',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <h3 style={{ marginTop: 0 }}>📏 {t.bosch}</h3>

              <p style={{ color: '#64748b' }}>{t.boschText}</p>

              <label>
                <b>{t.active}</b>

                <select style={input} value={field} onChange={(e) => setField(e.target.value as MeasureKey)}>
                  {rows.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ marginTop: 12 }}>
                <b>{t.last}:</b> {last !== null ? `${last} mm` : '-'}
              </div>

              <button style={{ ...blueBtn, marginTop: 14 }} onClick={testValue}>
                ⌁ {t.test}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {rows.slice(0, 6).map(([key, label]) => (
                  <label key={key}>
                    <b>{label}</b>

                    <input
                      style={input}
                      type="number"
                      value={active.measures[key]}
                      onFocus={() => setField(key)}
                      onChange={(e) => updateMeasure(key, Number(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section style={card}>
              <h3 style={{ marginTop: 0 }}>🤖 KI</h3>

              <button style={purpleBtn} onClick={analyse}>
                ✨ {t.analyse}
              </button>

              <button style={{ ...blueBtn, marginTop: 10 }} onClick={sketch}>
                ✏️ {t.sketch}
              </button>

              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 10,
                  background: active.aiDone ? '#dcfce7' : '#f8fafc',
                  color: active.aiDone ? '#166534' : '#64748b',
                  fontWeight: 800,
                }}
              >
                {active.aiDone ? `✅ ${active.aiText}` : t.aiHint}
              </div>

              <div
                style={{
                  marginTop: 12,
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  height: 220,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <svg width="280" height="190" viewBox="0 0 280 190">
                  <rect x="45" y="38" width="190" height="120" fill="#fff" stroke="#111827" strokeWidth="3" />

                  {active.wings >= 2 && (
                    <line x1="140" y1="38" x2="140" y2="158" stroke="#111827" strokeWidth="2" />
                  )}

                  {active.wings >= 2 ? (
                    <>
                      <rect x="60" y="52" width="68" height="92" fill="#fff" stroke="#64748b" />
                      <rect x="152" y="52" width="68" height="92" fill="#fff" stroke="#64748b" />
                      <circle cx="134" cy="98" r="3" fill="#111827" />
                      <circle cx="146" cy="98" r="3" fill="#111827" />
                    </>
                  ) : (
                    <rect x="65" y="52" width="150" height="92" fill="#fff" stroke="#64748b" />
                  )}

                  {active.roller && (
                    <rect x="45" y="20" width="190" height="16" fill="#dbeafe" stroke="#2563eb" />
                  )}

                  {active.sill && (
                    <rect x="35" y="160" width="210" height="10" fill="#f1f5f9" stroke="#94a3b8" />
                  )}

                  <text x="140" y="25" textAnchor="middle" fontWeight="700">
                    {active.measures.breite} mm
                  </text>

                  <text x="27" y="98" textAnchor="middle" fontWeight="700" transform="rotate(-90 27 98)">
                    {active.measures.hoehe} mm
                  </text>
                </svg>
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <section style={card}>
              <h3 style={{ marginTop: 0 }}>📋 Daten</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <b>{t.name}</b>
                  <input style={input} value={active.name} onChange={(e) => updateActive({ name: e.target.value })} />
                </label>

                <label>
                  <b>{t.room}</b>
                  <input style={input} value={active.room} onChange={(e) => updateActive({ room: e.target.value })} />
                </label>

                <label>
                  <b>{t.type}</b>

                  <select style={input} value={active.type} onChange={(e) => updateActive({ type: e.target.value as WindowType })}>
                    <option value="unknown">{t.unknown}</option>
                    <option value="dreh_kipp">{t.dreh}</option>
                    <option value="fest">{t.fest}</option>
                    <option value="schiebetuer">{t.schiebe}</option>
                    <option value="haustuer">{t.tuer}</option>
                    <option value="balkontuer">{t.balkon}</option>
                  </select>
                </label>

                <label>
                  <b>{t.wings}</b>
                  <input
                    style={input}
                    type="number"
                    value={active.wings}
                    onChange={(e) => updateActive({ wings: Number(e.target.value) || 1 })}
                  />
                </label>

                <label>
                  <b>{t.opening}</b>
                  <input style={input} value={active.opening} onChange={(e) => updateActive({ opening: e.target.value })} />
                </label>

                <label>
                  <b>{t.profile}</b>
                  <input style={input} value={active.profile} onChange={(e) => updateActive({ profile: e.target.value })} />
                </label>

                <label>
                  <b>{t.colorIn}</b>
                  <input style={input} value={active.colorIn} onChange={(e) => updateActive({ colorIn: e.target.value })} />
                </label>

                <label>
                  <b>{t.colorOut}</b>
                  <input style={input} value={active.colorOut} onChange={(e) => updateActive({ colorOut: e.target.value })} />
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={active.roller}
                    onChange={(e) => updateActive({ roller: e.target.checked })}
                  />{' '}
                  {t.roller}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={active.sill}
                    onChange={(e) => updateActive({ sill: e.target.checked })}
                  />{' '}
                  {t.sill}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={active.insect}
                    onChange={(e) => updateActive({ insect: e.target.checked })}
                  />{' '}
                  {t.insect}
                </label>
              </div>
            </section>

            <section style={card}>
              <h3 style={{ marginTop: 0 }}>📐 Maße komplett</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {rows.map(([key, label]) => (
                  <label key={key}>
                    <b>{label}</b>

                    <input
                      style={input}
                      type="number"
                      value={active.measures[key]}
                      onFocus={() => setField(key)}
                      onChange={(e) => updateMeasure(key, Number(e.target.value))}
                    />
                  </label>
                ))}
              </div>

              <h3>📝 {t.note}</h3>

              <textarea style={textarea} value={active.note} onChange={(e) => updateActive({ note: e.target.value })} />
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}
