'use client';

import AppHeader from '../components/AppHeader';
import DashboardPremium from '../components/DashboardPremium';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <DashboardPremium />
      </div>
    </main>
  );
}
