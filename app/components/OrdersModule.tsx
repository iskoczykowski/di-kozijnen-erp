'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  projectName: string;
  status: 'Offen' | 'In Bearbeitung' | 'Produktion' | 'Montage' | 'Fertig';
  contactName: string;
  phone: string;
  email: string;
  notes: string;
};

const emptyOrder: Order = {
  id: '',
  orderNumber: '',
  customerName: '',
  projectName: '',
  status: 'Offen',
  contactName: '',
  phone: '',
  email: '',
  notes: '',
};

export default function OrdersModule() {
  const [lang, setLangState] = useState<Lang>('de');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order>(emptyOrder);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLangState(getLang());
    const update = () => setLangState(getLang());
    window.addEventListener('language-change', update);
    return () => window.removeEventListener('language-change', update);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => JSON.stringify(o).toLowerCase().includes(q));
  }, [orders, search]);

  function newOrder() {
    setSelected({
      ...emptyOrder,
      orderNumber: `AUF-${new Date().getFullYear()}-${orders.length + 1}`,
    });
  }

  function saveOrder() {
    const order = {
      ...selected,
      id: selected.id || crypto.randomUUID(),
    };

    setOrders((old) => {
      const exists = old.some((o) => o.id === order.id);
      return exists ? old.map((o) => (o.id === order.id ? order : o)) : [order, ...old];
    });

    setSelected(order);
  }

  function deleteOrder() {
    if (!selected.id) return;
    setOrders((old) => old.filter((o) => o.id !== selected.id));
    setSelected(emptyOrder);
  }

  return (
    <div className="text-slate-900">
      <h2 className="mb-6 text-3xl font-black">{t('orders', lang)}</h2>

      <p className="text-slate-500">
        Das vollständige Auftragsmodul ist jetzt angelegt. Im nächsten Schritt
        verbinden wir es mit Kunden, Projektakte, Produktion und Supabase.
      </p>
    </div>
  );
}
