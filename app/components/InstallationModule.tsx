'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

export default function InstallationModule() {
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    return () =>
      window.removeEventListener('language-change', update);
  }, []);

  return (
    <div className="space-y-6">

      <div className="rounded-3xl bg-white p-6 shadow">

        <div className="flex items-center justify-between">

          <h1 className="text-3xl font-black">
            {t('montage', lang)}
          </h1>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            +
          </button>

        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-4">

        <div className="rounded-3xl bg-red-50 p-6">
          <h2 className="text-xl font-black">{t('planned', lang)}</h2>
          <div className="mt-4 text-5xl">0</div>
        </div>

        <div className="rounded-3xl bg-yellow-50 p-6">
          <h2 className="text-xl font-black">
            {t('inProgress', lang)}
          </h2>
          <div className="mt-4 text-5xl">0</div>
        </div>

        <div className="rounded-3xl bg-blue-50 p-6">
          <h2 className="text-xl font-black">
            {t('messages', lang)}
          </h2>
          <div className="mt-4 text-5xl">0</div>
        </div>

        <div className="rounded-3xl bg-green-50 p-6">
          <h2 className="text-xl font-black">
            {t('done', lang)}
          </h2>
          <div className="mt-4 text-5xl">0</div>
        </div>

      </div>

    </div>
  );
}
