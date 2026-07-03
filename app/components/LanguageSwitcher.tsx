'use client';

import { useEffect, useState } from 'react';
import { getLang, setLang, languages, Lang } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const [lang, setCurrentLang] = useState<Lang>('de');

  useEffect(() => {
    setCurrentLang(getLang());

    const update = () => setCurrentLang(getLang());

    window.addEventListener('language-change', update);

    return () => window.removeEventListener('language-change', update);
  }, []);

  return (
    <select
      value={lang}
      onChange={(e) => {
        const value = e.target.value as Lang;
        setCurrentLang(value);
        setLang(value);
      }}
      style={{
        padding: '10px',
        borderRadius: 10,
        border: '1px solid #d0d7de',
        background: '#fff',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label} - {l.name}
        </option>
      ))}
    </select>
  );
}
