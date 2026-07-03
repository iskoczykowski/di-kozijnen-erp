'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

type MenuItem = {
  key: string;
  icon: string;
};

const menu: MenuItem[] = [
  { key: 'dashboard', icon: '🏠' },
  { key: 'customers', icon: '👥' },
  { key: 'orders', icon: '📋' },
  { key: 'measure', icon: '📐' },
  { key: 'production', icon: '🏭' },
  { key: 'montage', icon: '🚚' },
  { key: 'warehouse', icon: '📦' },
  { key: 'calendar', icon: '📅' },
  { key: 'employees', icon: '👷' },
  { key: 'messages', icon: '💬' },
  { key: 'settings', icon: '⚙️' },
];

type Props = {
  active: string;
  onSelect: (key: string) => void;
};

export default function Sidebar({ active, onSelect }: Props) {
  const [lang, setLangState] = useState<Lang>('de');

  useEffect(() => {
    setLangState(getLang());

    const update = () => setLangState(getLang());
    window.addEventListener('language-change', update);

    return () => window.removeEventListener('language-change', update);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-24 flex-col items-center bg-slate-950 py-6">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 text-xl font-black text-white">
        D&I
      </div>

      <nav className="flex flex-1 flex-col gap-3">
        {menu.map((item) => {
          const selected = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={t(item.key, lang)}
              className={
                selected
                  ? 'flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg'
                  : 'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-slate-300 hover:bg-slate-800'
              }
            >
              {item.icon}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
