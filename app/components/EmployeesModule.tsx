'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

export default function EmployeesModule() {
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
            {t('employees', lang)}
          </h1>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            +
          </button>

        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-4">

        <div className="rounded-3xl bg-blue-50 p-6">
          <div className="text-5xl">👷</div>
          <h2 className="mt-4 text-xl font-black">
            {t('employees', lang)}
          </h2>
        </div>

        <div className="rounded-3xl bg-green-50 p-6">
          <div className="text-5xl">🏭</div>
          <h2 className="mt-4 text-xl font-black">
            {t('production', lang)}
          </h2>
        </div>

        <div className="rounded-3xl bg-orange-50 p-6">
          <div className="text-5xl">🚚</div>
          <h2 className="mt-4 text-xl font-black">
            {t('montage', lang)}
          </h2>
        </div>

        <div className="rounded-3xl bg-slate-100 p-6">
          <div className="text-5xl">📅</div>
          <h2 className="mt-4 text-xl font-black">
            {t('calendar', lang)}
          </h2>
        </div>

      </div>

    </div>
  );
}
