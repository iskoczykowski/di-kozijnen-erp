'use client';

import AppHeader from '../components/AppHeader';
import WarehouseModule from '../components/WarehouseModule';

export default function WarehousePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <WarehouseModule />
      </div>
    </main>
  );
}
