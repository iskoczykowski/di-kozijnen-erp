'use client';

import AppHeader from '../components/AppHeader';
import MessagesModule from '../components/MessagesModule';

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <MessagesModule />
      </div>
    </main>
  );
}
