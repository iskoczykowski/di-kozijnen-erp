'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../lib/dashboard';
import { getLang, t, type Lang } from '../../lib/i18n';

export default function DashboardPremium() {
  const [lang, setLang] = useState<Lang>('de');

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    projects: 0,
    production: 0,
    warehouse: 0,
    employees: 0,
  });

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    load();

    return () =>
      window.removeEventListener('language-change', update);
  }, []);

  async function load() {
    try {
      setStats(await getDashboardStats());
    } catch (e) {
      console.error(e);
    }
  }

  const cards = [
    { key: 'customers', value: stats.customers, icon: '👥', color: 'bg-green-600' },
    { key: 'orders', value: stats.orders, icon: '📋', color: 'bg-blue-600' },
    { key: 'projects', value: stats.projects, icon: '📁', color: 'bg-violet-600' },
    { key: 'production', value: stats.production, icon: '🏭', color: 'bg-orange-600' },
    { key: 'warehouse', value: stats.warehouse, icon: '📦', color: 'bg-cyan-600' },
    { key: 'employees', value: stats.employees, icon: '👷', color: 'bg-red-600' },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-3">

      {cards.map(card => (
        <div
          key={card.key}
          className="rounded-3xl bg-white p-7 shadow"
        >

          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white ${card.color}`}>
            {card.icon}
          </div>

          <div className="mt-5 text-slate-500 font-bold">
            {t(card.key, lang)}
          </div>

          <div className="mt-2 text-5xl font-black">
            {card.value}
          </div>

        </div>
      ))}

    </div>
  );
}
