'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

export default function ProjectsModule() {
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    return () => window.removeEventListener('language-change', update);
  }, []);

  return (
    <div className="space-y-6">

      <div className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-3xl font-black">
            {t('projects', lang)}
          </h2>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            + {t('newProject', lang)}
          </button>

        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">📐</div>
          <h3 className="mt-4 text-2xl font-black">
            {t('measure', lang)}
          </h3>
        </button>

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">📷</div>
          <h3 className="mt-4 text-2xl font-black">
            {t('photos', lang)}
          </h3>
        </button>

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">📄</div>
          <h3 className="mt-4 text-2xl font-black">
            {t('documents', lang)}
          </h3>
        </button>

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">🤖</div>
          <h3 className="mt-4 text-2xl font-black">
            KI
          </h3>
        </button>

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">🏭</div>
          <h3 className="mt-4 text-2xl font-black">
            {t('production', lang)}
          </h3>
        </button>

        <button className="rounded-3xl bg-white p-8 text-left shadow hover:shadow-lg">
          <div className="text-5xl">🚚</div>
          <h3 className="mt-4 text-2xl font-black">
            {t('montage', lang)}
          </h3>
        </button>

      </div>

    </div>
  );
}
