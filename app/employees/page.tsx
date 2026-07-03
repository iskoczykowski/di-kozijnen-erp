'use client';

import AppHeader from '../components/AppHeader';
import EmployeesModule from '../components/EmployeesModule';

export default function EmployeesPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <EmployeesModule />
      </div>
    </main>
  );
}
