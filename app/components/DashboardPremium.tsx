'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

type Stats = {
  customers: number;
  orders: number;
  production: number;
  montage: number;
};

export default function DashboardPremium() {
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());
    window.addEventListener('language-change', update);

    return () => window.removeEventListener('language-change', update);
  }, []);

  const stats: Stats = {
    customers: 0,
    orders: 0,
    production: 0,
    montage: 0,
  };

  const cards = [
    { key: 'customers', icon: '👥', value: stats.customers, color: 'bg-green-600' },
    { key: 'orders', icon: '📋', value: stats.orders, color: 'bg-amber-500' },
    { key: 'production', icon: '🏭', value: stats.production, color: 'bg-indigo-600' },
    { key: 'montage', icon: '🚚', value: stats.montage, color: 'bg-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.color} text-2xl`}>
              {card.icon}
            </div>

            <div className="mt-5 text-sm font-bold text-slate-500">
              {t(card.key, lang)}
            </div>

            <div className="mt-2 text-4xl font-black text-slate-900">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            {t('orders', lang)}
          </h2>
          <p className="mt-2 text-slate-500">
            {t('open', lang)} · {t('inProgress', lang)} · {t('done', lang)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            {t('calendar', lang)}
          </h2>
          <p className="mt-2 text-slate-500">
            Planning · Montage · Productie
          </p>
        </div>
      </div>
    </div>
  );
}
