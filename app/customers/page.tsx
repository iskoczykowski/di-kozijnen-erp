'use client';

import CustomersModule from '../components/CustomersModule';
import AppHeader from '../components/AppHeader';

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />

        <CustomersModule />
      </div>
    </main>
  );
}
