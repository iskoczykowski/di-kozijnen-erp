'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Lang = 'de' | 'nl';
type MeasureKey = 'breite' | 'hoehe' | 'tiefe' | 'links' | 'rechts' | 'oben' | 'unten' | 'diagonal1' | 'diagonal2';
type WindowType = 'unknown' | 'dreh_kipp' | 'fest' | 'schiebetuer' | 'haustuer' | 'balkontuer';

type AiResult = {
  confidence: number;
  type: WindowType;
  wings: number;
  opening: string;
  rollerShutter: boolean;
  windowSill: boolean;
  notes: string[];
};

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
  aiAnalyzed: boolean;
  aiHint: string;
  aiResult?: AiResult;
  wings: number;
  opening: string;
  profileNumber: string;
  colorInside: string;
  colorOutside: string;
  rollerShutter: boolean;
  windowSill: boolean;
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

const STORAGE_PREFIX = 'di_aufmass_photo_ai_';

const T = {
  de: {
    title: 'Aufmaß Pro',
    subtitle: 'Foto → KI-Analyse → Fenster wählen → Bosch messen → KI-Skizze.',
    step1: '1. Foto',
    step2: '2. KI-Analyse',
    step3: '3. Messen',
    step4: '4. Skizze',
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
    aiAnalyze: 'KI-Fotoanalyse starten',
    aiGenerate: 'KI-Skizze generieren',
    aiReady: 'KI-Skizze erstellt',
    aiWaiting: 'Noch keine Skizze',
    aiResult: 'KI-Ergebnis',
    aiHint: 'KI-Hinweis',
    confidence: 'Sicherheit',
    wings: 'Flügelanzahl',
    opening: 'Öffnungsrichtung',
    profile: 'Profilnummer',
    colorInside: 'Farbe innen',
    colorOutside: 'Farbe außen',
    roller: 'Rollladen',
    sill: 'Fensterbank',
    insect: 'Insektenschutz',
    note: 'Notiz',
    save: 'Aufmaß speichern',
    browserInfo: 'Web-Version: KI-Analyse ist als Vorschlag vorbereitet. Fotos werden komprimiert gespeichert, damit kein weißer Bildschirm mehr kommt.',
    storageWarning: 'Browser-Speicher ist voll. Foto wird angezeigt, aber eventuell nicht dauerhaft gespeichert.',
    photos: 'Fotos',
    noPhoto: 'Noch kein Foto',
    allMeasures: 'Maße komplett',
    noAi: 'Noch keine KI-Analyse',
    applyAi: 'KI-Vorschlag übernehmen',
    aiDemoInfo: 'Demo-Analyse: Die App erzeugt einen realistischen Vorschlag. Später ersetzt echte KI diese Logik.',
  },
  nl: {
    title: 'Inmeting Pro',
    subtitle: 'Foto → AI-analyse → raam kiezen → Bosch meten → AI-schets.',
    step1: '1. Foto',
    step2: '2. AI-analyse',
    step3: '3. Meten',
    step4: '4. Schets',
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
    aiAnalyze: 'AI-fotoanalyse starten',
    aiGenerate: 'AI-schets genereren',
    aiReady: 'AI-schets gemaakt',
    aiWaiting: 'Nog geen schets',
    aiResult: 'AI-resultaat',
    aiHint: 'AI-opmerking',
    confidence: 'Zekerheid',
    wings: 'Aantal vleugels',
    opening: 'Openingsrichting',
    profile: 'Profielnummer',
    colorInside: 'Kleur binnen',
    colorOutside: 'Kleur buiten',
    roller: 'Rolluik',
    sill: 'Vensterbank',
    insect: 'Insectenhor',
    note: 'Notitie',
    save: 'Inmeting opslaan',
    browserInfo: 'Webversie: AI-analyse is als voorstel voorbereid. Foto’s worden gecomprimeerd opgeslagen, zodat geen wit scherm meer komt.',
    storageWarning: 'Browseropslag is vol. Foto wordt getoond, maar mogelijk niet blijvend opgeslagen.',
    photos: 'Foto’s',
    noPhoto: 'Nog geen foto',
    allMeasures: 'Maten compleet',
    noAi: 'Nog geen AI-analyse',
    applyAi: 'AI-voorstel overnemen',
    aiDemoInfo: 'Demo-analyse: De app maakt een realistisch voorstel. Later vervangt echte AI deze logica.',
  },
};

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dfe6f0', borderRadius: 16, padding: 16, boxShadow: '0 6px 18px rgba(15,23,42,.05)' };
const input: React.CSSProperties = { width: '100%', height: 38, border: '1px solid #d7dde8', borderRadius: 10, padding: '0 10px', boxSizing: 'border-box', background: '#fff' };
const textarea: React.CSSProperties = { ...input, height: 90, padding: 10, resize: 'vertical' };
const btn: React.CSSProperties = { border: '1px solid #d7dde8', background: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 800, cursor: 'pointer' };
const blueBtn: React.CSSProperties = { ...btn, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
const greenBtn: React.CSSProperties = { ...btn, background: '#16a34a', borderColor: '#16a34a', color: '#fff' };
const purpleBtn: React.CSSProperties = { ...btn, background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' };

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
    aiAnalyzed: false,
    aiHint: '',
    wings: 1,
    opening: '',
    profileNumber: '',
    colorInside: '9016',
    colorOutside: '7016',
    rollerShutter: false,
    windowSill: false,
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

function resizeImage(file: File, maxSize = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image failed'));
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas failed'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function filesToBase64(files: File[]) {
  const result: string[] = [];
  for (const file of files) {
    try {
      result.push(await resizeImage(file));
    } catch {
      const raw = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      result.push(raw);
    }
  }
  return result;
}

function normalizePhoto(photo: any, index: number): AufmassPhoto | null {
  if (!photo) return null;
  if (typeof photo === 'string') return { id: makeId('photo'), src: photo, label: `Foto ${index + 1}` };
  if (typeof photo === 'object' && typeof photo.src === 'string') {
    return { id: photo.id || makeId('photo'), src: photo.src, label: photo.label || `Foto ${index + 1}` };
  }
  return null;
}

function normalizeMeasures(value: any): Record<MeasureKey, number> {
  return { ...emptyMeasures(), ...(value && typeof value === 'object' ? value : {}) };
}

function normalizeElement(raw: any, lang: Lang, index: number): AufmassElement {
  const base = emptyElement(lang, index + 1);
  const photos = Array.isArray(raw?.photos) ? raw.photos.map((p: any, i: number) => normalizePhoto(p, i)).filter(Boolean) as AufmassPhoto[] : [];
  return {
    ...base,
    ...(raw && typeof raw === 'object' ? raw : {}),
    id: raw?.id || base.id,
    number: Number(raw?.number || index + 1),
    name: raw?.name || base.name,
    room: raw?.room || base.room,
    type: raw?.type || 'unknown',
    photos,
    measures: normalizeMeasures(raw?.measures),
    wings: Number(raw?.wings || 1),
    aiSketchReady: Boolean(raw?.aiSketchReady),
    aiAnalyzed: Boolean(raw?.aiAnalyzed),
    aiHint: raw?.aiHint || '',
    opening: raw?.opening || '',
    profileNumber: raw?.profileNumber || '',
    colorInside: raw?.colorInside || '9016',
    colorOutside: raw?.colorOutside || '7016',
    rollerShutter: Boolean(raw?.rollerShutter),
    windowSill: Boolean(raw?.windowSill),
    insectScreen: Boolean(raw?.insectScreen),
    note: raw?.note || '',
  };
}

function demoAiAnalyze(element: AufmassElement, lang: Lang): AiResult {
  const photoCount = element.photos.length;
  const twoWing = photoCount > 0 || element.measures.breite > 1100;

  return {
    confidence: photoCount > 0 ? 86 : 58,
    type: element.type !== 'unknown' ? element.type : 'dreh_kipp',
    wings: twoWing ? 2 : 1,
    opening: lang === 'de' ? 'links Dreh-Kipp, rechts fest' : 'links draai-kiep, rechts vast',
    rollerShutter: false,
    windowSill: true,
    notes: [
      lang === 'de' ? 'Fensterrahmen erkannt' : 'Raamkozijn herkend',
      lang === 'de' ? 'Wahrscheinlich 2-flügelig' : 'Waarschijnlijk 2-vleugelig',
      lang === 'de' ? 'Fensterbank sichtbar' : 'Vensterbank zichtbaar',
    ],
  };
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
  const [storageWarning, setStorageWarning] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          const normalized = parsed.map((el: any, index: number) => normalizeElement(el, lang, index));
          setElements(normalized);
          setActiveId(normalized[0].id);
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(elements));
      setStorageWarning('');
    } catch {
      setStorageWarning(T[lang].storageWarning);
    }
    onSave?.(elements);
  }, [elements, storageKey, lang]);

  const active = elements.find(el => el.id === activeId) || elements[0] || first;

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
    if (!files.length) return;
    try {
      const urls = await filesToBase64(files);
      const existingPhotos = Array.isArray(active.photos) ? active.photos : [];
      const photos = urls.map((src, index) => ({ id: makeId('photo'), src, label: `${t.photos} ${existingPhotos.length + index + 1}` }));
      updateActive({ photos: [...existingPhotos, ...photos], selected: true });
    } catch {
      setStorageWarning(lang === 'de' ? 'Foto konnte nicht verarbeitet werden.' : 'Foto kon niet verwerkt worden.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
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

  function runAiAnalysis() {
    const result = demoAiAnalyze(active, lang);
    updateActive({
      aiAnalyzed: true,
      aiResult: result,
      aiHint: result.notes.join(' · '),
    });
  }

  function applyAiResult() {
    if (!active.aiResult) return;
    updateActive({
      type: active.aiResult.type,
      wings: active.aiResult.wings,
      opening: active.aiResult.opening,
      rollerShutter: active.aiResult.rollerShutter,
      windowSill: active.aiResult.windowSill,
      aiSketchReady: true,
    });
  }

  function generateAiSketch() {
    if (!active.aiAnalyzed) runAiAnalysis();

    const width = active.measures.breite;
    const height = active.measures.hoehe;
    let hint = active.aiHint || (lang === 'de' ? 'KI-Skizze vorbereitet.' : 'AI-schets voorbereid.');
    if (width > 0 && height > 0) hint += lang === 'de' ? ` Maßbasis: ${width} × ${height} mm.` : ` Maatbasis: ${width} × ${height} mm.`;
    updateActive({ aiSketchReady: true, aiHint: hint, type: active.type === 'unknown' ? 'dreh_kipp' : active.type });
  }

  const mainPhoto = Array.isArray(active.photos) ? active.photos[0]?.src : '';
  const wings = active.aiResult?.wings || active.wings || 1;

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
        {storageWarning && <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: '#fef3c7', color: '#92400e', fontWeight: 800 }}>{storageWarning}</div>}
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
                <small>{Array.isArray(el.photos) ? el.photos.length : 0} {t.photos} · {el.measures.breite || 0} × {el.measures.hoehe || 0} mm</small>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[t.step1, t.step2, t.step3, t.step4].map((s, i) => <div key={s} style={{ ...card, padding: 14, background: i === 1 ? '#f5f3ff' : '#fff' }}><b>{s}</b></div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📷 {t.step1}</h3>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={e => addPhoto(Array.from(e.target.files || []))} />
              <div style={{ height: 300, border: '1px solid #dfe6f0', borderRadius: 12, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#f8fafc' }}>
                {mainPhoto ? <img src={mainPhoto} alt="Fenster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: '#64748b' }}>📷<br />{t.noPhoto}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={blueBtn} onClick={() => fileRef.current?.click()}>📷 {t.takePhoto}</button>
                <button style={btn} onClick={() => fileRef.current?.click()}>🖼️ {t.uploadPhoto}</button>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>🤖 {t.step2}</h3>
              <p style={{ color: '#64748b' }}>{t.browserInfo}</p>
              <div style={{ padding: 10, borderRadius: 10, background: '#f5f3ff', color: '#5b21b6', marginBottom: 10 }}>
                {t.aiDemoInfo}
              </div>
              <button style={purpleBtn} onClick={runAiAnalysis}>✨ {t.aiAnalyze}</button>

              <div style={{ marginTop: 14, padding: 12, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <b>{t.aiResult}</b>
                {active.aiResult ? (
                  <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    <div>{t.confidence}: <b>{active.aiResult.confidence}%</b></div>
                    <div>{t.type}: <b>{typeLabel(active.aiResult.type, lang)}</b></div>
                    <div>{t.wings}: <b>{active.aiResult.wings}</b></div>
                    <div>{t.opening}: <b>{active.aiResult.opening}</b></div>
                    <div>{t.roller}: <b>{active.aiResult.rollerShutter ? 'Ja' : 'Nein'}</b></div>
                    <div>{t.sill}: <b>{active.aiResult.windowSill ? 'Ja' : 'Nein'}</b></div>
                    <button style={{ ...blueBtn, marginTop: 8 }} onClick={applyAiResult}>✓ {t.applyAi}</button>
                  </div>
                ) : (
                  <p style={{ color: '#64748b' }}>{t.noAi}</p>
                )}
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📏 {t.step3}</h3>
              <label><b>{t.activeField}</b><select style={input} value={activeField} onChange={e => setActiveField(e.target.value as MeasureKey)}>{measureRows(t).map(([key,,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
              <div style={{ marginTop: 12 }}><b>{t.lastMeasure}: </b>{lastMeasure !== null ? `${lastMeasure} mm` : '-'}</div>
              <button style={{ ...blueBtn, marginTop: 14 }} onClick={testMeasure}>⌁ {t.testMeasure}</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {measureRows(t).slice(0, 6).map(([key, icon, label]) => <label key={key}><b>{icon} {label}</b><input style={input} type="number" value={active.measures[key]} onFocus={() => setActiveField(key)} onChange={e => updateMeasure(key, Number(e.target.value) || 0)} /></label>)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>✏️ {t.step4}</h3>
              <button style={blueBtn} onClick={generateAiSketch}>✨ {t.aiGenerate}</button>
              <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: active.aiSketchReady ? '#dcfce7' : '#f8fafc', color: active.aiSketchReady ? '#166534' : '#64748b', fontWeight: 800 }}>{active.aiSketchReady ? `✅ ${t.aiReady}` : t.aiWaiting}</div>
              <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 12, height: 260, display: 'grid', placeItems: 'center' }}>
                <svg width="320" height="220" viewBox="0 0 320 220">
                  <rect x="55" y="42" width="210" height="140" fill="#fff" stroke="#111827" strokeWidth="3" />
                  {wings >= 2 && <line x1="160" y1="42" x2="160" y2="182" stroke="#111827" strokeWidth="2" />}
                  {wings >= 2 ? (
                    <>
                      <rect x="70" y="58" width="76" height="108" fill="#fff" stroke="#64748b" />
                      <rect x="174" y="58" width="76" height="108" fill="#fff" stroke="#64748b" />
                      <circle cx="153" cy="112" r="3" fill="#111827" />
                      <circle cx="167" cy="112" r="3" fill="#111827" />
                    </>
                  ) : (
                    <rect x="74" y="58" width="172" height="108" fill="#fff" stroke="#64748b" />
                  )}
                  <text x="160" y="28" textAnchor="middle" fontWeight="700">{active.measures.breite || 0} mm</text>
                  <text x="34" y="112" textAnchor="middle" fontWeight="700" transform="rotate(-90 34 112)">{active.measures.hoehe || 0} mm</text>
                  {active.rollerShutter && <rect x="55" y="22" width="210" height="18" fill="#dbeafe" stroke="#2563eb" />}
                  {active.windowSill && <rect x="45" y="184" width="230" height="12" fill="#f1f5f9" stroke="#94a3b8" />}
                </svg>
              </div>
              <p style={{ color: '#64748b' }}>{active.aiHint || t.aiHint}</p>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📋 {t.step2}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label><b>{t.name}</b><input style={input} value={active.name} onChange={e => updateActive({ name: e.target.value })} /></label>
                <label><b>{t.room}</b><input style={input} value={active.room} onChange={e => updateActive({ room: e.target.value })} /></label>
                <label><b>{t.type}</b><select style={input} value={active.type} onChange={e => updateActive({ type: e.target.value as WindowType })}><option value="unknown">{t.unknown}</option><option value="dreh_kipp">{t.drehKipp}</option><option value="fest">{t.fest}</option><option value="schiebetuer">{t.schiebetuer}</option><option value="haustuer">{t.haustuer}</option><option value="balkontuer">{t.balkontuer}</option></select></label>
                <label><b>{t.wings}</b><input style={input} type="number" value={active.wings} onChange={e => updateActive({ wings: Number(e.target.value) || 1 })} /></label>
                <label><b>{t.opening}</b><input style={input} value={active.opening} onChange={e => updateActive({ opening: e.target.value })} /></label>
                <label><b>{t.profile}</b><input style={input} value={active.profileNumber} onChange={e => updateActive({ profileNumber: e.target.value })} /></label>
                <label><b>{t.colorInside}</b><input style={input} value={active.colorInside} onChange={e => updateActive({ colorInside: e.target.value })} /></label>
                <label><b>{t.colorOutside}</b><input style={input} value={active.colorOutside} onChange={e => updateActive({ colorOutside: e.target.value })} /></label>
                <label><input type="checkbox" checked={active.rollerShutter} onChange={e => updateActive({ rollerShutter: e.target.checked })} /> {t.roller}</label>
                <label><input type="checkbox" checked={active.windowSill} onChange={e => updateActive({ windowSill: e.target.checked })} /> {t.sill}</label>
                <label><input type="checkbox" checked={active.insectScreen} onChange={e => updateActive({ insectScreen: e.target.checked })} /> {t.insect}</label>
              </div>

              <h3>📝 {t.note}</h3>
              <textarea style={textarea} value={active.note} onChange={e => updateActive({ note: e.target.value })} />
            </div>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>📐 {t.allMeasures}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {measureRows(t).map(([key, icon, label]) => <label key={key}><b>{icon} {label}</b><input style={input} type="number" value={active.measures[key]} onFocus={() => setActiveField(key)} onChange={e => updateMeasure(key, Number(e.target.value) || 0)} /></label>)}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

