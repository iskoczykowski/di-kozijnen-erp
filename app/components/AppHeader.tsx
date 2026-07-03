'use client';

import LanguageSwitcher from './LanguageSwitcher';
import { getLang, t } from '../../lib/i18n';

export default function AppHeader() {
  const lang = getLang();

  return (
    <div className="mb-6 flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-4xl font-black text-slate-900">
          D&I Kozijnen ERP
        </h1>

        <p className="mt-2 text-slate-600">
          {t('customers', lang)} · {t('orders', lang)} · {t('production', lang)} · {t('montage', lang)}
        </p>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
