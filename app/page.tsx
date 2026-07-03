'use client';

import { useState } from 'react';

import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import DashboardPremium from './components/DashboardPremium';

export default function HomePage() {
  const [active, setActive] = useState('dashboard');

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar active={active} onSelect={setActive} />

      <div className="ml-24 p-6">
        <AppHeader />

        {active === 'dashboard' && <DashboardPremium />}

        {active !== 'dashboard' && (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900">
              {active}
            </h2>
            <p className="mt-2 text-slate-500">
              Modul wird jetzt aufgebaut.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
