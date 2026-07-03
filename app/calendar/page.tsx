'use client';

import AppHeader from '../components/AppHeader';
import CalendarModule from '../components/CalendarModule';

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <CalendarModule />
      </div>
    </main>
  );
}
