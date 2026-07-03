'use client';

import { useEffect, useState } from 'react';
import { getLang, setLang, languages, type Lang } from '../../lib/i18n';

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
      className="rounded-xl border bg-white px-4 py-2 font-bold text-slate-700"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label} - {l.name}
        </option>
      ))}
    </select>
  );
}
