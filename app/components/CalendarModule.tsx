'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

export default function CalendarModule() {
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    return () => window.removeEventListener('language-change', update);
  }, []);

  return (
    <div className="space-y-6">

      <div className="rounded-3xl bg-white p-6 shadow">

        <div className="flex items-center justify-between">

          <h1 className="text-3xl font-black">
            {t('calendar', lang)}
          </h1>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            +
          </button>

        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="text-5xl">📅</div>
          <h2 className="mt-4 text-2xl font-black">
            {t('appointment', lang)}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="text-5xl">🏭</div>
          <h2 className="mt-4 text-2xl font-black">
            {t('production', lang)}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="text-5xl">🚚</div>
          <h2 className="mt-4 text-2xl font-black">
            {t('montage', lang)}
          </h2>
        </div>

      </div>

    </div>
  );
}
