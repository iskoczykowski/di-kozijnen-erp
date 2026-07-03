'use client';

import AppHeader from '../components/AppHeader';
import ProductionModule from '../components/ProductionModule';

export default function ProductionPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <ProductionModule />
      </div>
    </main>
  );
}
