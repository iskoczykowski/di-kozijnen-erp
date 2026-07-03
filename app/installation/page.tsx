'use client';

import AppHeader from '../components/AppHeader';
import InstallationModule from '../components/InstallationModule';

export default function InstallationPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <InstallationModule />
      </div>
    </main>
  );
}
