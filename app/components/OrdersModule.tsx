'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getOrders,
  saveOrder as saveOrderDb,
  deleteOrder as deleteOrderDb,
  type Order as DbOrder,
} from '../../lib/orders';
import { getCustomers } from '../../lib/customers';
import { createProjectFromOrder } from '../../lib/projects';
import { subscribeOrders, unsubscribe } from '../../lib/realtime';

type Order = {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  project_name: string;
  status: string;
  contact_name: string;
  phone: string;
  email: string;
  notes: string;
};

const emptyOrder: Order = {
  id: '',
  order_number: '',
  customer_id: '',
  customer_name: '',
  project_name: '',
  status: 'Offen',
  contact_name: '',
  phone: '',
  email: '',
  notes: '',
};

export default function OrdersModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Order>(emptyOrder);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLang(getLang());

    const updateLang = () => setLang(getLang());
    window.addEventListener('language-change', updateLang);

    loadAll();

    const channel = subscribeOrders(loadAll);

    return () => {
      window.removeEventListener('language-change', updateLang);
      unsubscribe(channel);
    };
  }, []);

  async function loadAll() {
    setLoading(true);

    try {
      const [ordersData, customersData] = await Promise.all([
        getOrders(),
        getCustomers(),
      ]);

      setOrders(ordersData as Order[]);
      setCustomers(customersData || []);
    } catch (error) {
      console.error('ORDERS LOAD ERROR', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => JSON.stringify(o).toLowerCase().includes(q));
  }, [orders, search]);

  function newOrder() {
    const next = orders.length + 1;

    setSelected({
      ...emptyOrder,
      order_number: `AUF-${new Date().getFullYear()}-${String(next).padStart(4, '0')}`,
    });
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((c) => c.id === customerId);

    setSelected((old) => ({
      ...old,
      customer_id: customer?.id || '',
      customer_name: customer?.company_name || '',
      contact_name: customer?.contact_name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
    }));
  }

  async function saveOrder() {
    try {
      const payload: DbOrder = {
        id: selected.id || undefined,
        order_number: selected.order_number,
        customer_id: selected.customer_id || undefined,
        customer_name: selected.customer_name,
        project_name: selected.project_name,
        status: selected.status,
        contact_name: selected.contact_name,
        phone: selected.phone,
        email: selected.email,
        notes: selected.notes,
      };

      const saved = await saveOrderDb(payload);

      if (!selected.id) {
        await createProjectFromOrder({
          id: saved.id,
          customer_id: saved.customer_id,
          customer_name: saved.customer_name,
          project_name: saved.project_name || saved.order_number,
        });
      }

      setSelected(saved as Order);
      await loadAll();
    } catch (error) {
      console.error('ORDER SAVE ERROR', error);
    }
  }

  async function deleteOrder() {
    if (!selected.id) return;

    try {
      await deleteOrderDb(selected.id);
      setSelected(emptyOrder);
      await loadAll();
    } catch (error) {
      console.error('ORDER DELETE ERROR', error);
    }
  }

  function update(field: keyof Order, value: string) {
    setSelected((old) => ({ ...old, [field]: value }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-1">
        <div className="mb-4 flex gap-3">
          <button onClick={newOrder} className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white">
            + {t('newOrder', lang)}
          </button>

          <button onClick={saveOrder} className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white">
            {t('save', lang)}
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search', lang)}
          className="mb-4 w-full rounded-2xl border px-4 py-3 font-semibold"
        />

        <div className="space-y-3">
          {loading && <p className="text-slate-500">{t('inProgress', lang)}...</p>}

          {filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelected(order)}
              className={
                selected.id === order.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border bg-slate-50 p-4 text-left'
              }
            >
              <div className="font-black text-slate-900">
                {order.order_number || '-'}
              </div>
              <div className="text-sm text-slate-500">{order.customer_name || '-'}</div>
              <div className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                {order.status || t('open', lang)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900">
            {t('orders', lang)}
          </h2>

          <button onClick={deleteOrder} className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white">
            {t('delete', lang)}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t('orderNumber', lang)} value={selected.order_number} onChange={(v) => update('order_number', v)} />

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-500">{t('customers', lang)}</span>
            <select
              value={selected.customer_id}
              onChange={(e) => selectCustomer(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 font-semibold"
            >
              <option value="">-</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
          </label>

          <Field label={t('projectName', lang)} value={selected.project_name} onChange={(v) => update('project_name', v)} />

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-500">{t('status', lang)}</span>
            <select
              value={selected.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 font-semibold"
            >
              <option value="Offen">{t('open', lang)}</option>
              <option value="In Bearbeitung">{t('inProgress', lang)}</option>
              <option value="Produktion">{t('production', lang)}</option>
              <option value="Montage">{t('montage', lang)}</option>
              <option value="Fertig">{t('done', lang)}</option>
            </select>
          </label>

          <Field label={t('contactName', lang)} value={selected.contact_name} onChange={(v) => update('contact_name', v)} />
          <Field label={t('phone', lang)} value={selected.phone} onChange={(v) => update('phone', v)} />
          <Field label={t('email', lang)} value={selected.email} onChange={(v) => update('email', v)} />
        </div>

        <div className="mt-4">
          <Field label={t('notes', lang)} value={selected.notes} onChange={(v) => update('notes', v)} textarea />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-500">{label}</span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-28 w-full rounded-2xl border px-4 py-3 font-semibold"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border px-4 py-3 font-semibold"
        />
      )}
    </label>
  );
}
