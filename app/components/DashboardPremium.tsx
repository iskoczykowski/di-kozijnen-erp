'use client';

import { useEffect, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import { getCustomers, getOrders } from '../../lib/storage';
import { getOffers } from '../../lib/offers';
import { getInvoices } from '../../lib/invoices';
import { getNotifications } from '../../lib/notifications';

export default function DashboardPremium() {
  const [lang, setLang] = useState<Lang>('de');
  const [customers, setCustomers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [offers, setOffers] = useState(0);
  const [invoices, setInvoices] = useState(0);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    setLang(getLang());
    setCustomers(getCustomers().length);
    setOrders(getOrders().length);
    setOffers(getOffers().length);
    setInvoices(getInvoices().length);
    setNotifications(getNotifications().filter((n) => !n.read).length);
  }, []);

  const cards = [
    { label: t(lang, 'customers'), value: customers },
    { label: t(lang, 'orders'), value: orders },
    { label: t(lang, 'offers'), value: offers },
    { label: t(lang, 'invoices'), value: invoices },
    { label: t(lang, 'notifications'), value: notifications },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, 'dashboard')}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
