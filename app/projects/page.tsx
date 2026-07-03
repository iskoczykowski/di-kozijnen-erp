'use client';

import AppHeader from '../components/AppHeader';
import ProjectsModule from '../components/ProjectsModule';

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <AppHeader />
        <ProjectsModule />
      </div>
    </main>
  );
}
