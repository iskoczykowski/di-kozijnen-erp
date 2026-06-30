'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Lang = 'de' | 'nl';

type MeasureKey =
  | 'breite'
  | 'hoehe'
  | 'tiefe'
  | 'rahmenLinks'
  | 'rahmenRechts'
  | 'rahmenOben'
  | 'rahmenUnten'
  | 'fensterbankInnen'
  | 'fensterbankAussen'
  | 'diagonal1'
  | 'diagonal2';

type WindowType =
  | 'dreh_kipp'
  | 'fest'
  | 'schiebetuer'
  | 'haustuer'
  | 'balkontuer';

type AufmassElement = {
  id: string;
  name: string;
  room: string;
  type: WindowType;
  profileNumber: string;
  material: string;
  colorInside: string;
  colorOutside: string;
  glass: string;
  rollerShutter: boolean;
  insectScreen: boolean;
  measures: Record<MeasureKey, number>;
  photos: string[];
  note: string;
};

type ProfileItem = {
  id: string;
  nummer: string;
  name: string;
  lagerplatz: string;
  bestandMeter: number;
  farbeInnen: string;
  farbeAussen: string;
};

type Props = {
  lang?: Lang;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  onSave?: (elements: AufmassElement[]) => void;
};

const STORAGE_PREFIX = 'di_aufmass_pro_';
const PROFILE_KEY = 'di_profiles_v1';

const T = {
  de: {
    title: 'Aufmaß Pro',
    subtitle: 'Fotos, Maße, Skizze, Profile und Material direkt im Auftrag.',
    bosch: 'Bosch UniversalDistance 40 C',
    browserMode: 'Browser-Modus',
    browserInfo:
      'Im Browser ist die echte Bluetooth-Verbindung je nach Gerät eingeschränkt. Für echte direkte Bosch-Verbindung bauen wir danach die Android-APK. Heute kannst du Aufmaß, Foto, Skizze und Material schon vollständig nutzen.',
    androidReady: 'Android-BLE vorbereitet',
    activeField: 'Aktives Messfeld',
    lastMeasure: 'Letzte Messung',
    testMeasure: 'Testmessung übernehmen',
    connectBrowser: 'Browser-Bluetooth testen',
    elements: 'Fenster / Elemente',
    addElement: 'Element hinzufügen',
    save: 'Aufmaß speichern',
    room: 'Raum',
    type: 'Fensterart',
    profile: 'Profil',
    material: 'Material',
    colorInside: 'Farbe innen',
    colorOutside: 'Farbe außen',
    glass: 'Glas',
    roller: 'Rollladen',
    insect: 'Insektenschutz',
    photos: 'Fotos',
    addPhoto: 'Foto hinzufügen',
    sketch: 'Skizze',
    materialList: 'Materialliste',
    note: 'Notiz',
    width: 'Breite',
    height: 'Höhe',
    depth: 'Tiefe',
    frameLeft: 'Rahmen links',
    frameRight: 'Rahmen rechts',
    frameTop: 'Rahmen oben',
    frameBottom: 'Rahmen unten',
    sillInside: 'Fensterbank innen',
    sillOutside: 'Fensterbank außen',
    diagonal1: 'Diagonal 1',
    diagonal2: 'Diagonal 2',
    noProfile: 'Kein Profil gewählt',
    stock: 'Bestand',
    location: 'Lagerplatz',
    needed: 'Benötigt',
    warning: 'Achtung: Bestand nicht ausreichend',
    ok: 'Bestand ausreichend',
    drehKipp: 'Dreh-Kipp',
    fest: 'Festverglasung',
    schiebetuer: 'Schiebetür',
    haustuer: 'Haustür',
    balkontuer: 'Balkontür',
  },
  nl: {
    title: 'Inmeting Pro',
    subtitle: 'Foto’s, maten, schets, profielen en materiaal direct in de order.',
    bosch: 'Bosch UniversalDistance 40 C',
    browserMode: 'Browser-modus',
    browserInfo:
      'In de browser is directe Bluetooth afhankelijk van het apparaat. Voor echte directe Bosch-verbinding bouwen we daarna de Android-APK. Vandaag kun je inmeting, foto, schets en materiaal al volledig gebruiken.',
    androidReady: 'Android-BLE voorbereid',
    activeField: 'Actief meetveld',
    lastMeasure: 'Laatste meting',
    testMeasure: 'Testmeting overnemen',
    connectBrowser: 'Browser-Bluetooth testen',
    elements: 'Ramen / elementen',
    addElement: 'Element toevoegen',
    save: 'Inmeting opslaan',
    room: 'Ruimte',
    type: 'Raamtype',
    profile: 'Profiel',
    material: 'Materiaal',
    colorInside: 'Kleur binnen',
    colorOutside: 'Kleur buiten',
    glass: 'Glas',
    roller: 'Rolluik',
    insect: 'Insectenhor',
    photos: 'Foto’s',
    addPhoto: 'Foto toevoegen',
    sketch: 'Schets',
    materialList: 'Materiaallijst',
    note: 'Notitie',
    width: 'Breedte',
    height: 'Hoogte',
    depth: 'Diepte',
    frameLeft: 'Kozijn links',
    frameRight: 'Kozijn rechts',
    frameTop: 'Kozijn boven',
    frameBottom: 'Kozijn onder',
    sillInside: 'Vensterbank binnen',
    sillOutside: 'Vensterbank buiten',
    diagonal1: 'Diagonaal 1',
    diagonal2: 'Diagonaal 2',
    noProfile: 'Geen profiel gekozen',
    stock: 'Voorraad',
    location: 'Locatie',
    needed: 'Nodig',
    warning: 'Let op: voorraad onvoldoende',
    ok: 'Voorraad voldoende',
    drehKipp: 'Draai-kiep',
    fest: 'Vast glas',
    schiebetuer: 'Schuifpui',
    haustuer: 'Voordeur',
    balkontuer: 'Balkondeur',
  },
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
  height: 86,
  padding: 10,
  resize: 'vertical',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #dfe6f0',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 6px 18px rgba(15,23,42,.05)',
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

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMeasures(): Record<MeasureKey, number> {
  return {
    breite: 0,
    hoehe: 0,
    tiefe: 0,
    rahmenLinks: 0,
    rahmenRechts: 0,
    rahmenOben: 0,
    rahmenUnten: 0,
    fensterbankInnen: 0,
    fensterbankAussen: 0,
    diagonal1: 0,
    diagonal2: 0,
  };
}

function emptyElement(lang: Lang, index: number): AufmassElement {
  return {
    id: makeId('aufmass'),
    name: `${lang === 'de' ? 'Fenster' : 'Raam'} ${index}`,
    room: lang === 'de' ? 'Wohnzimmer' : 'Woonkamer',
    type: 'dreh_kipp',
    profileNumber: '',
    material: 'PVC',
    colorInside: '9016',
    colorOutside: '7016',
    glass: lang === 'de' ? 'HR++ / 2-fach' : 'HR++ / dubbel',
    rollerShutter: false,
    insectScreen: false,
    measures: emptyMeasures(),
    photos: [],
    note: '',
  };
}

function defaultProfiles(): ProfileItem[] {
  return [
    {
      id: makeId('profile'),
      nummer: '101332',
      name: 'Kozijnstijl met aanslag',
      lagerplatz: '2.4',
      bestandMeter: 6.5,
      farbeInnen: '7016',
      farbeAussen: '7016',
    },
    {
      id: makeId('profile'),
      nummer: '101333',
      name: 'Kozijndorpel',
      lagerplatz: '2.5',
      bestandMeter: 8.2,
      farbeInnen: '9016',
      farbeAussen: '7016',
    },
    {
      id: makeId('profile'),
      nummer: '201120',
      name: 'Glaslat profiel',
      lagerplatz: '3.1',
      bestandMeter: 14.0,
      farbeInnen: '9016',
      farbeAussen: '9016',
    },
  ];
}

function readProfiles(): ProfileItem[] {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {}
  return defaultProfiles();
}

function measureRows(t: any): [MeasureKey, string, string][] {
  return [
    ['breite', '↔️', t.width],
    ['hoehe', '↕️', t.height],
    ['tiefe', '↔️', t.depth],
    ['rahmenLinks', '↕️', t.frameLeft],
    ['rahmenRechts', '↔️', t.frameRight],
    ['rahmenOben', '↔️', t.frameTop],
    ['rahmenUnten', '↔️', t.frameBottom],
    ['fensterbankInnen', '📐', t.sillInside],
    ['fensterbankAussen', '📐', t.sillOutside],
    ['diagonal1', '📏', t.diagonal1],
    ['diagonal2', '📏', t.diagonal2],
  ];
}

function typeLabel(type: WindowType, lang: Lang) {
  const t = T[lang];
  if (type === 'dreh_kipp') return t.drehKipp;
  if (type === 'fest') return t.fest;
  if (type === 'schiebetuer') return t.schiebetuer;
  if (type === 'haustuer') return t.haustuer;
  return t.balkontuer;
}

async function filesToBase64(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function AufmassProModule({
  lang = 'de',
  orderId = 'default',
  orderNumber = '',
  customerName = '',
  onSave,
}: Props) {
  const t = T[lang];
  const storageKey = `${STORAGE_PREFIX}${orderId}`;
  const profiles = useMemo(() => readProfiles(), []);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [elements, setElements] = useState<AufmassElement[]>([
    emptyElement(lang, 1),
  ]);
  const [activeId, setActiveId] = useState(elements[0].id);
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

  const active = elements.find((e) => e.id === activeId) || elements[0];
  const selectedProfile = profiles.find((p) => p.nummer === active.profileNumber);

  const neededMeter = Math.round(
    ((active.measures.breite * 2 + active.measures.hoehe * 2) / 1000) * 100
  ) / 100;

  function updateActive(patch: Partial<AufmassElement>) {
    setElements((prev) =>
      prev.map((el) => (el.id === active.id ? { ...el, ...patch } : el))
    );
  }

  function updateMeasure(key: MeasureKey, value: number) {
    updateActive({
      measures: {
        ...active.measures,
        [key]: value,
      },
    });
  }

  function addElement() {
    const next = emptyElement(lang, elements.length + 1);
    setElements((prev) => [...prev, next]);
    setActiveId(next.id);
  }

  async function addPhoto(files: File[]) {
    const urls = await filesToBase64(files);
    updateActive({
      photos: [...active.photos, ...urls],
    });
  }

  function testMeasure() {
    const value =
      activeField === 'breite'
        ? 1234
        : activeField === 'hoehe'
        ? 1487
        : activeField === 'tiefe'
        ? 72
        : activeField.includes('diagonal')
        ? 1920
        : 65;

    setLastMeasure(value);
    updateMeasure(activeField, value);
  }

  async function browserBluetoothTest() {
    const navAny = navigator as any;
    if (!navAny.bluetooth) {
      alert(
        lang === 'de'
          ? 'Browser unterstützt Web Bluetooth nicht. Bitte Chrome/Edge nutzen oder später APK verwenden.'
          : 'Browser ondersteunt Web Bluetooth niet. Gebruik Chrome/Edge of later de APK.'
      );
      return;
    }

    try {
      await navAny.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });
      alert(lang === 'de' ? 'Gerät wurde ausgewählt.' : 'Apparaat gekozen.');
    } catch {
      alert(lang === 'de' ? 'Keine Verbindung hergestellt.' : 'Geen verbinding gemaakt.');
    }
  }

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>📐 {t.title}</h2>
            <p style={{ color: '#64748b', marginBottom: 0 }}>
              {t.subtitle}
              {orderNumber ? ` · ${orderNumber}` : ''}
              {customerName ? ` · ${customerName}` : ''}
            </p>
          </div>
          <button style={greenBtn} onClick={() => onSave?.(elements)}>
            ✓ {t.save}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 16 }}>
        <aside style={card}>
          <h3 style={{ marginTop: 0 }}>🪟 {t.elements}</h3>
          <button style={{ ...blueBtn, width: '100%', marginBottom: 12 }} onClick={addElement}>
            + {t.addElement}
          </button>

          <div style={{ display: 'grid', gap: 8 }}>
            {elements.map((el, i) => (
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
                <b>{i + 1}. {el.name}</b>
                <div style={{ color: '#64748b' }}>{el.room} · {typeLabel(el.type, lang)}</div>
                <small>
                  {el.measures.breite || 0} × {el.measures.hoehe || 0} mm
                </small>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📏 {t.bosch}</h3>
              <div style={{ padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, color: '#1e40af' }}>
                <b>{t.browserMode}</b>
                <br />
                {t.browserInfo}
                <br />
                <b>✅ {t.androidReady}</b>
              </div>

              <label style={{ display: 'block', marginTop: 12 }}>
                <b>{t.activeField}</b>
                <select
                  style={input}
                  value={activeField}
                  onChange={(e) => setActiveField(e.target.value as MeasureKey)}
                >
                  {measureRows(t).map(([key, , label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>

              <div style={{ marginTop: 12 }}>
                <b>{t.lastMeasure}: </b>
                {lastMeasure !== null ? `${lastMeasure} mm` : '-'}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button style={blueBtn} onClick={testMeasure}>⌁ {t.testMeasure}</button>
                <button style={btn} onClick={browserBluetoothTest}>🔵 {t.connectBrowser}</button>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📷 {t.photos}</h3>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => addPhoto(Array.from(e.target.files || []))}
              />

              <button style={blueBtn} onClick={() => fileRef.current?.click()}>
                + {t.addPhoto}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginTop: 12 }}>
                {active.photos.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Foto ${i + 1}`}
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid #d7dde8' }}
                  />
                ))}
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>✏️ {t.sketch}</h3>
              <div style={{ height: 260, display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <svg width="260" height="220" viewBox="0 0 260 220">
                  <rect x="40" y="35" width="180" height="140" fill="#fff" stroke="#111827" strokeWidth="3" />
                  <line x1="130" y1="35" x2="130" y2="175" stroke="#111827" strokeWidth="2" />
                  <rect x="55" y="50" width="65" height="110" fill="#fff" stroke="#64748b" />
                  <rect x="140" y="50" width="65" height="110" fill="#fff" stroke="#64748b" />
                  <text x="130" y="25" textAnchor="middle" fontWeight="700">{active.measures.breite || 0} mm</text>
                  <text x="26" y="110" textAnchor="middle" fontWeight="700" transform="rotate(-90 26 110)">{active.measures.hoehe || 0} mm</text>
                  <circle cx="124" cy="105" r="3" fill="#111827" />
                  <circle cx="136" cy="105" r="3" fill="#111827" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📋 {t.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label><b>{t.elements}</b><input style={input} value={active.name} onChange={(e) => updateActive({ name: e.target.value })} /></label>
                <label><b>{t.room}</b><input style={input} value={active.room} onChange={(e) => updateActive({ room: e.target.value })} /></label>
                <label>
                  <b>{t.type}</b>
                  <select style={input} value={active.type} onChange={(e) => updateActive({ type: e.target.value as WindowType })}>
                    <option value="dreh_kipp">{t.drehKipp}</option>
                    <option value="fest">{t.fest}</option>
                    <option value="schiebetuer">{t.schiebetuer}</option>
                    <option value="haustuer">{t.haustuer}</option>
                    <option value="balkontuer">{t.balkontuer}</option>
                  </select>
                </label>
                <label>
                  <b>{t.profile}</b>
                  <select style={input} value={active.profileNumber} onChange={(e) => updateActive({ profileNumber: e.target.value })}>
                    <option value="">{t.noProfile}</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.nummer}>
                        {p.nummer} · {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label><b>{t.material}</b><input style={input} value={active.material} onChange={(e) => updateActive({ material: e.target.value })} /></label>
                <label><b>{t.glass}</b><input style={input} value={active.glass} onChange={(e) => updateActive({ glass: e.target.value })} /></label>
                <label><b>{t.colorInside}</b><input style={input} value={active.colorInside} onChange={(e) => updateActive({ colorInside: e.target.value })} /></label>
                <label><b>{t.colorOutside}</b><input style={input} value={active.colorOutside} onChange={(e) => updateActive({ colorOutside: e.target.value })} /></label>
                <label><input type="checkbox" checked={active.rollerShutter} onChange={(e) => updateActive({ rollerShutter: e.target.checked })} /> {t.roller}</label>
                <label><input type="checkbox" checked={active.insectScreen} onChange={(e) => updateActive({ insectScreen: e.target.checked })} /> {t.insect}</label>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>📦 {t.materialList}</h3>
              {selectedProfile ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div><b>{selectedProfile.nummer}</b> · {selectedProfile.name}</div>
                  <div>{t.location}: <b>{selectedProfile.lagerplatz}</b></div>
                  <div>{t.stock}: <b>{selectedProfile.bestandMeter} m</b></div>
                  <div>{t.needed}: <b>{neededMeter} m</b></div>
                  <div style={{
                    padding: 12,
                    borderRadius: 12,
                    background: selectedProfile.bestandMeter >= neededMeter ? '#dcfce7' : '#fee2e2',
                    color: selectedProfile.bestandMeter >= neededMeter ? '#166534' : '#991b1b',
                    fontWeight: 900,
                  }}>
                    {selectedProfile.bestandMeter >= neededMeter ? `✅ ${t.ok}` : `⚠️ ${t.warning}`}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>{t.noProfile}</p>
              )}

              <label style={{ display: 'block', marginTop: 14 }}>
                <b>{t.note}</b>
                <textarea style={textarea} value={active.note} onChange={(e) => updateActive({ note: e.target.value })} />
              </label>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>📐 {t.title} – Maße</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {measureRows(t).map(([key, icon, label]) => (
                <label key={key}>
                  <b>{icon} {label}</b>
                  <input
                    style={input}
                    type="number"
                    value={active.measures[key]}
                    onChange={(e) => updateMeasure(key, Number(e.target.value) || 0)}
                    onFocus={() => setActiveField(key)}
                  />
                </label>
              ))}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

