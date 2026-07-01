'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Lang = 'de' | 'nl';
type MeasureKey = 'breite' | 'hoehe' | 'tiefe' | 'links' | 'rechts' | 'oben' | 'unten' | 'diagonal1' | 'diagonal2';
type WindowType = 'unknown' | 'dreh_kipp' | 'fest' | 'schiebetuer' | 'haustuer' | 'balkontuer';

type AufmassPhoto = { id: string; src: string; label: string };

type AufmassElement = {
  id: string;
  number: number;
  name: string;
  room: string;
  type: WindowType;
  selected: boolean;
  photos: AufmassPhoto[];
  measures: Record<MeasureKey, number>;
  aiSketchReady: boolean;
  aiHint: string;
  opening: string;
  profileNumber: string;
  colorInside: string;
  colorOutside: string;
  rollerShutter: boolean;
  insectScreen: boolean;
  note: string;
};

type Props = {
  lang?: Lang;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  onSave?: (elements: AufmassElement[]) => void;
};

const STORAGE_PREFIX = 'di_aufmass_photo_first_';

const T = {
  de: {
    title: 'Aufmaß Pro',
    subtitle: 'Erst Foto, dann Fenster wählen, Bosch messen und KI-Skizze erzeugen.',
    step1: '1. Fenster fotografieren',
    step2: '2. Fenster auswählen',
    step3: '3. Bosch messen',
    step4: '4. KI-Skizze',
    addWindow: 'Fenster hinzufügen',
    takePhoto: 'Foto aufnehmen',
    uploadPhoto: 'Foto hochladen',
    selected: 'Ausgewählt',
    room: 'Raum',
    name: 'Name',
    type: 'Fensterart',
    unknown: 'KI erkennt später',
    drehKipp: 'Dreh-Kipp',
    fest: 'Festverglasung',
    schiebetuer: 'Schiebetür',
    haustuer: 'Haustür',
    balkontuer: 'Balkontür',
    activeField: 'Aktives Messfeld',
    lastMeasure: 'Letzte Messung',
    testMeasure: 'Testmessung übernehmen',
    width: 'Breite',
    height: 'Höhe',
    depth: 'Tiefe',
    left: 'Links',
    right: 'Rechts',
    top: 'Oben',
    bottom: 'Unten',
    diagonal1: 'Diagonal 1',
    diagonal2: 'Diagonal 2',
    aiGenerate: 'KI-Skizze generieren',
    aiReady: 'KI-Skizze erstellt',
    aiWaiting: 'Noch keine Skizze',
    aiHint: 'KI-Hinweis',
    opening: 'Öffnungsrichtung',
    profile: 'Profilnummer',
    colorInside: 'Farbe innen',
    colorOutside: 'Farbe außen',
    roller: 'Rollladen',
    insect: 'Insektenschutz',
    note: 'Notiz',
    save: 'Aufmaß speichern',
    browserInfo: 'Web-Version: Bosch ist vorbereitet. Echte Live-Bluetooth-Messung kommt in der Android-App.',
    photos: 'Fotos',
    noPhoto: 'Noch kein Foto',
    allMeasures: 'Maße komplett',
  },
  nl: {
    title: 'Inmeting Pro',
    subtitle: 'Eerst foto, daarna raam kiezen, Bosch meten en AI-schets maken.',
    step1: '1. Raam fotograferen',
    step2: '2. Raam kiezen',
    step3: '3. Bosch meten',
    step4: '4. AI-schets',
    addWindow: 'Raam toevoegen',
    takePhoto: 'Foto maken',
    uploadPhoto: 'Foto uploaden',
    selected: 'Gekozen',
    room: 'Ruimte',
    name: 'Naam',
    type: 'Raamtype',
    unknown: 'AI herkent later',
    drehKipp: 'Draai-kiep',
    fest: 'Vast glas',
    schiebetuer: 'Schuifpui',
    haustuer: 'Voordeur',
    balkontuer: 'Balkondeur',
    activeField: 'Actief meetveld',
    lastMeasure: 'Laatste meting',
    testMeasure: 'Testmeting overnemen',
    width: 'Breedte',
    height: 'Hoogte',
    depth: 'Diepte',
    left: 'Links',
    right: 'Rechts',
    top: 'Boven',
    bottom: 'Onder',
    diagonal1: 'Diagonaal 1',
    diagonal2: 'Diagonaal 2',
    aiGenerate: 'AI-schets genereren',
    aiReady: 'AI-schets gemaakt',
    aiWaiting: 'Nog geen schets',
    aiHint: 'AI-opmerking',
    opening: 'Openingsrichting',
    profile: 'Profielnummer',
    colorInside: 'Kleur binnen',
    colorOutside: 'Kleur buiten',
    roller: 'Rolluik',
    insect: 'Insectenhor',
    note: 'Notitie',
    save: 'Inmeting opslaan',
    browserInfo: 'Webversie: Bosch is voorbereid. Echte live Bluetooth-meting komt in de Android-app.',
    photos: 'Foto’s',
    noPhoto: 'Nog geen foto',
    allMeasures: 'Maten compleet',
  },
};

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dfe6f0', borderRadius: 16, padding: 16, boxShadow: '0 6px 18px rgba(15,23,42,.05)' };
const input: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #d7dde8', borderRadius: 10, padding: '0 10px', boxSizing: 'border-box', background: '#fff' };
const textarea: React.CSSProperties = { ...input, height: 90, padding: 10, resize: 'vertical' };
const btn: React.CSSProperties = { border: '1px solid #d7dde8', background: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 800, cursor: 'pointer' };
const blueBtn: React.CSSProperties = { ...btn, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
const greenBtn: React.CSSProperties = { ...btn, background: '#16a34a', borderColor: '#16a34a', color: '#fff' };

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMeasures(): Record<MeasureKey, number> {
  return { breite: 0, hoehe: 0, tiefe: 0, links: 0, rechts: 0, oben: 0, unten: 0, diagonal1: 0, diagonal2: 0 };
}

function emptyElement(lang: Lang, number: number): AufmassElement {
  return {
    id: makeId('win'),
    number,
    name: `${lang === 'de' ? 'Fenster' : 'Raam'} ${number}`,
    room: lang === 'de' ? 'Raum' : 'Ruimte',
    type: 'unknown',
    selected: false,
    photos: [],
    measures: emptyMeasures(),
    aiSketchReady: false,
    aiHint: '',
    opening: '',
    profileNumber: '',
    colorInside: '9016',
    colorOutside: '7016',
    rollerShutter: false,
    insectScreen: false,
    note: '',
  };
}

function measureRows(t: any): [MeasureKey, string, string][] {
  return [
    ['breite', '↔️', t.width],
    ['hoehe', '↕️', t.height],
    ['tiefe', '📏', t.depth],
    ['links', '⬅️', t.left],
    ['rechts', '➡️', t.right],
    ['oben', '⬆️', t.top],
    ['unten', '⬇️', t.bottom],
    ['diagonal1', '📐', t.diagonal1],
    ['diagonal2', '📐', t.diagonal2],
  ];
}

function typeLabel(type: WindowType, lang: Lang) {
  const t = T[lang];
  if (type === 'dreh_kipp') return t.drehKipp;
  if (type === 'fest') return t.fest;
  if (type === 'schiebetuer') return t.schiebetuer;
  if (type === 'haustuer') return t.haustuer;
  if (type === 'balkontuer') return t.balkontuer;
  return t.unknown;
}

async function filesToBase64(files: File[]) {
  return Promise.all(files.map(file => new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  })));
}

export default function AufmassProModule({ lang = 'de', orderId = 'default', orderNumber = '', customerName = '', onSave }: Props) {
  const t = T[lang];
  const storageKey = `${STORAGE_PREFIX}${orderId}`;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const first = useMemo(() => emptyElement(lang, 1), [lang]);
  const [elements, setElements] = useState<AufmassElement[]>([first]);
  const [activeId, setActiveId] = useState(first.id);
  const [activeField, setActiveField] = useState<MeasureKey>('breite');
  const [lastMeasure, setLastMeasure] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setElements(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(elements));
    onSave?.(elements);
  }, [elements]);

  const active = elements.find(el => el.id === activeId) || elements[0];

  function updateActive(patch: Partial<AufmassElement>) {
    setElements(prev => prev.map(el => el.id === active.id ? { ...el, ...patch } : el));
  }

  function updateMeasure(key: MeasureKey, value: number) {
    updateActive({ measures: { ...active.measures, [key]: value } });
  }

  function addWindow() {
    const next = emptyElement(lang, elements.length + 1);
    setElements(prev => [...prev, next]);
    setActiveId(next.id);
  }

  async function addPhoto(files: File[]) {
    const urls = await filesToBase64(files);
    const photos = urls.map((src, index) => ({ id: makeId('photo'), src, label: `${t.photos} ${active.photos.length + index + 1}` }));
    updateActive({ photos: [...active.photos, ...photos], selected: true });
  }

  function selectWindow(id: string) {
    setActiveId(id);
    setElements(prev => prev.map(el => ({ ...el, selected: el.id === id })));
  }

  function testMeasure() {
    const value = activeField === 'breite' ? 1234 : activeField === 'hoehe' ? 1487 : activeField === 'tiefe' ? 72 : activeField.includes('diagonal') ? 1920 : 65;
    setLastMeasure(value);
    updateMeasure(activeField, value);
  }

  function generateAiSketch() {
    const width = active.measures.breite;
    const height = active.measures.hoehe;
    let hint = lang === 'de' ? 'KI erkennt: Fensterform vorbereitet. Bitte Öffnungsrichtung kontrollieren.' : 'AI herkent: raamvorm voorbereid. Controleer openingsrichting.';
    if (active.photos.length === 0) hint = lang === 'de' ? 'Erst Foto hinzufügen, dann kann die KI genauer eine Skizze erzeugen.' : 'Voeg eerst een foto toe, daarna kan AI nauwkeuriger een schets maken.';
    if (width > 0 && height > 0) hint += lang === 'de' ? ` Maßbasis: ${width} × ${height} mm.` : ` Maatbasis: ${width} × ${height} mm.`;
    updateActive({ aiSketchReady: true, aiHint: hint, type: active.type === 'unknown' ? 'dreh_kipp' : active.type });
  }

  const mainPhoto = active.photos[0]?.src;

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>📐 {t.title}</h2>
            <p style={{ color: '#64748b', marginBottom: 0 }}>{t.subtitle}{orderNumber ? ` · ${orderNumber}` : ''}{customerName ? ` · ${customerName}` : ''}</p>
          </div>
          <button style={greenBtn} onClick={() => onSave?.(elements)}>✓ {t.save}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <aside style={card}>
          <h3 style={{ marginTop: 0 }}>🪟 {t.step2}</h3>
          <button style={{ ...blueBtn, width: '100%', marginBottom: 12 }} onClick={addWindow}>+ {t.addWindow}</button>
          <div style={{ display: 'grid', gap: 8 }}>
            {elements.map(el => (
              <button key={el.id} onClick={() => selectWindow(el.id)} style={{ ...btn, textAlign: 'left', borderColor: el.id === active.id ? '#2563eb' : '#d7dde8', background: el.id === active.id ? '#eff6ff' : '#fff' }}>
                <b>{el.number}. {el.name}</b>
                <div style={{ color: '#64748b' }}>{el.room} · {typeLabel(el.type, lang)}</div>
                <small>{el.photos.length} {t.photos} · {el.measures.breite || 0} × {el.measures.hoehe || 0} mm</small>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[t.step1, t.step2, t.step3, t.step4].map((s, i) => <div key={s} style={{ ...card, padding: 14, background: i === 0 ? '#eff6ff' : '#fff' }}><b>{s}</b></div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr .9fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📷 {t.step1}</h3>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={e => addPhoto(Array.from(e.target.files || []))} />
              <div style={{ height: 310, border: '1px solid #dfe6f0', borderRadius: 12, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#f8fafc' }}>
                {mainPhoto ? <img src={mainPhoto} alt="Fenster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: '#64748b' }}>📷<br />{t.noPhoto}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={blueBtn} onClick={() => fileRef.current?.click()}>📷 {t.takePhoto}</button>
                <button style={btn} onClick={() => fileRef.current?.click()}>🖼️ {t.uploadPhoto}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 10 }}>
                {active.photos.slice(0, 4).map(photo => <img key={photo.id} src={photo.src} alt={photo.label} style={{ width: '100%', height: 62, objectFit: 'cover', borderRadius: 8 }} />)}
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📏 {t.step3}</h3>
              <p style={{ color: '#64748b' }}>{t.browserInfo}</p>
              <label><b>{t.activeField}</b><select style={input} value={activeField} onChange={e => setActiveField(e.target.value as MeasureKey)}>{measureRows(t).map(([key,,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
              <div style={{ marginTop: 12 }}><b>{t.lastMeasure}: </b>{lastMeasure !== null ? `${lastMeasure} mm` : '-'}</div>
              <button style={{ ...blueBtn, marginTop: 14 }} onClick={testMeasure}>⌁ {t.testMeasure}</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {measureRows(t).slice(0, 6).map(([key, icon, label]) => <label key={key}><b>{icon} {label}</b><input style={input} type="number" value={active.measures[key]} onFocus={() => setActiveField(key)} onChange={e => updateMeasure(key, Number(e.target.value) || 0)} /></label>)}
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>🤖 {t.step4}</h3>
              <button style={blueBtn} onClick={generateAiSketch}>✨ {t.aiGenerate}</button>
              <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: active.aiSketchReady ? '#dcfce7' : '#f8fafc', color: active.aiSketchReady ? '#166534' : '#64748b', fontWeight: 800 }}>{active.aiSketchReady ? `✅ ${t.aiReady}` : t.aiWaiting}</div>
              <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 12, height: 220, display: 'grid', placeItems: 'center' }}>
                <svg width="250" height="190" viewBox="0 0 250 190">
                  <rect x="42" y="34" width="166" height="118" fill="#fff" stroke="#111827" strokeWidth="3" />
                  <line x1="125" y1="34" x2="125" y2="152" stroke="#111827" strokeWidth="2" />
                  <rect x="55" y="48" width="58" height="90" fill="#fff" stroke="#64748b" />
                  <rect x="137" y="48" width="58" height="90" fill="#fff" stroke="#64748b" />
                  <circle cx="119" cy="95" r="3" fill="#111827" />
                  <circle cx="131" cy="95" r="3" fill="#111827" />
                  <text x="125" y="22" textAnchor="middle" fontWeight="700">{active.measures.breite || 0} mm</text>
                  <text x="26" y="95" textAnchor="middle" fontWeight="700" transform="rotate(-90 26 95)">{active.measures.hoehe || 0} mm</text>
                </svg>
              </div>
              <p style={{ color: '#64748b' }}>{active.aiHint || t.aiHint}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📋 {t.step2}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label><b>{t.name}</b><input style={input} value={active.name} onChange={e => updateActive({ name: e.target.value })} /></label>
                <label><b>{t.room}</b><input style={input} value={active.room} onChange={e => updateActive({ room: e.target.value })} /></label>
                <label><b>{t.type}</b><select style={input} value={active.type} onChange={e => updateActive({ type: e.target.value as WindowType })}><option value="unknown">{t.unknown}</option><option value="dreh_kipp">{t.drehKipp}</option><option value="fest">{t.fest}</option><option value="schiebetuer">{t.schiebetuer}</option><option value="haustuer">{t.haustuer}</option><option value="balkontuer">{t.balkontuer}</option></select></label>
                <label><b>{t.opening}</b><input style={input} value={active.opening} onChange={e => updateActive({ opening: e.target.value })} /></label>
                <label><b>{t.profile}</b><input style={input} value={active.profileNumber} onChange={e => updateActive({ profileNumber: e.target.value })} /></label>
                <label><b>{t.colorInside}</b><input style={input} value={active.colorInside} onChange={e => updateActive({ colorInside: e.target.value })} /></label>
                <label><b>{t.colorOutside}</b><input style={input} value={active.colorOutside} onChange={e => updateActive({ colorOutside: e.target.value })} /></label>
                <label><input type="checkbox" checked={active.rollerShutter} onChange={e => updateActive({ rollerShutter: e.target.checked })} /> {t.roller}</label>
                <label><input type="checkbox" checked={active.insectScreen} onChange={e => updateActive({ insectScreen: e.target.checked })} /> {t.insect}</label>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📝 {t.note}</h3>
              <textarea style={textarea} value={active.note} onChange={e => updateActive({ note: e.target.value })} />
              <h3>📐 {t.allMeasures}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {measureRows(t).map(([key, icon, label]) => <label key={key}><b>{icon} {label}</b><input style={input} type="number" value={active.measures[key]} onFocus={() => setActiveField(key)} onChange={e => updateMeasure(key, Number(e.target.value) || 0)} /></label>)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

