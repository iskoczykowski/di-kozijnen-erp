'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  addOrder,
  deleteOrder,
  getCustomers,
  getOrders,
  saveOrders,
  type Customer,
  type Order,
} from '../../lib/storage';
import { saveNotification } from '../../lib/notifications';

const emptyOrder: Omit<Order, 'id' | 'createdAt' | 'orderNumber'> = {
  customerId: '',
  title: '',
  description: '',
  status: 'open',
  measurements: '',
  photos: [],
};

export default function OrdersModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] =
    useState<Omit<Order, 'id' | 'createdAt' | 'orderNumber'>>(emptyOrder);
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());
    setCustomers(getCustomers());
    setOrders(getOrders());
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const customer = customers.find((c) => c.id === order.customerId);

      return `${order.orderNumber} ${order.title} ${order.description} ${
        customer?.companyName || ''
      } ${customer?.contactName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [orders, customers, search]);

  function resetForm() {
    setForm(emptyOrder);
    setEditId('');
  }

  function handleSave() {
    if (!form.customerId || !form.title.trim()) return;

    if (editId) {
      const updated = orders.map((order) =>
        order.id === editId ? { ...order, ...form } : order
      );

      saveOrders(updated);
      setOrders(updated);
    } else {
      const order = addOrder(form);
      setOrders(getOrders());

      saveNotification({
        title: `${t(lang, 'orders')}: ${t(lang, 'save')}`,
        text: `${order.orderNumber} - ${order.title}`,
        type: 'order',
      });
    }

    resetForm();
  }

  function handleEdit(order: Order) {
    setEditId(order.id);
    setForm({
      customerId: order.customerId,
      title: order.title,
      description: order.description,
      status: order.status,
      measurements: order.measurements,
      photos: order.photos,
    });
  }

  function handleDelete(id: string) {
    deleteOrder(id);
    setOrders(getOrders());
  }

  function getCustomerName(id: string) {
    const customer = customers.find((c) => c.id === id);
    return customer?.companyName || customer?.contactName || '-';
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, 'orders')}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border p-3"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="">{t(lang, 'selectCustomer')}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName || customer.contactName}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border p-3"
            placeholder={t(lang, 'title')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="rounded-xl border p-3"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as Order['status'],
              })
            }
          >
            <option value="open">Offen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="done">Fertig</option>
          </select>

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder={t(lang, 'description')}
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder="Aufmaß / Maße"
            rows={3}
            value={form.measurements}
            onChange={(e) =>
              setForm({ ...form, measurements: e.target.value })
            }
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            {t(lang, 'save')}
          </button>

          <button
            onClick={resetForm}
            className="rounded-xl bg-gray-200 px-5 py-3 font-semibold"
          >
            {t(lang, 'clear')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <input
          className="mb-4 w-full rounded-xl border p-3"
          placeholder={`${t(lang, 'search')}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold">
                    {order.orderNumber} - {order.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getCustomerName(order.customerId)}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {order.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap">{order.description}</p>

              {order.measurements && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                  {order.measurements}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(order)}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                >
                  {t(lang, 'edit')}
                </button>

                <button
                  onClick={() => handleDelete(order.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  {t(lang, 'delete')}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-500">{t(lang, 'noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
