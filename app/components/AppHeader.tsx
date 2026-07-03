'use client';

import { useEffect, useState } from 'react';
import { getLang, setLang, t, type Lang } from '../../lib/i18n';
import NotificationsBell from './NotificationsBell';

export default function AppHeader() {
  const [lang, setLanguage] = useState<Lang>('de');

  useEffect(() => {
    setLanguage(getLang());
  }, []);

  function changeLang(value: Lang) {
    setLanguage(value);
    setLang(value);
    window.location.reload();
  }

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">D&I Kozijnen ERP</h1>

        <p className="mt-2 text-slate-600">
          {t(lang, 'customers')} · {t(lang, 'orders')} · {t(lang, 'projects')} ·{' '}
          {t(lang, 'warehouse')} · {t(lang, 'calendar')} · {t(lang, 'messages')} ·{' '}
          {t(lang, 'offers')} · {t(lang, 'invoices')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          className="rounded-xl border p-3"
          value={lang}
          onChange={(e) => changeLang(e.target.value as Lang)}
        >
          <option value="de">DE</option>
          <option value="nl">NL</option>
          <option value="en">EN</option>
          <option value="pl">PL</option>
        </select>

        <NotificationsBell />
      </div>
    </header>
  );
}
