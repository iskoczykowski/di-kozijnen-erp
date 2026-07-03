'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  saveCustomers,
  type Customer,
} from '../../lib/storage';
import { saveNotification } from '../../lib/notifications';

const emptyCustomer: Omit<Customer, 'id' | 'createdAt'> = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  street: '',
  zip: '',
  city: '',
  country: '',
  notes: '',
};

export default function CustomersModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Omit<Customer, 'id' | 'createdAt'>>(
    emptyCustomer
  );
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());
    setCustomers(getCustomers());
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((customer) =>
      `${customer.companyName} ${customer.contactName} ${customer.phone} ${customer.email} ${customer.city}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  function resetForm() {
    setForm(emptyCustomer);
    setEditId('');
  }

  function handleSave() {
    if (!form.companyName.trim() && !form.contactName.trim()) return;

    if (editId) {
      const updated = customers.map((customer) =>
        customer.id === editId ? { ...customer, ...form } : customer
      );

      saveCustomers(updated);
      setCustomers(updated);
    } else {
      const customer = addCustomer(form);
      setCustomers(getCustomers());

      saveNotification({
        title: `${t(lang, 'customers')}: ${t(lang, 'save')}`,
        text: customer.companyName || customer.contactName,
        type: 'customer',
      });
    }

    resetForm();
  }

  function handleEdit(customer: Customer) {
    setEditId(customer.id);
    setForm({
      companyName: customer.companyName,
      contactName: customer.contactName,
      phone: customer.phone,
      email: customer.email,
      street: customer.street,
      zip: customer.zip,
      city: customer.city,
      country: customer.country,
      notes: customer.notes,
    });
  }

  function handleDelete(id: string) {
    deleteCustomer(id);
    setCustomers(getCustomers());
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, 'customers')}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border p-3"
            placeholder="Firma"
            value={form.companyName}
            onChange={(e) =>
              setForm({ ...form, companyName: e.target.value })
            }
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Kontakt"
            value={form.contactName}
            onChange={(e) =>
              setForm({ ...form, contactName: e.target.value })
            }
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Straße"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="PLZ"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Stadt"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Land"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder={t(lang, 'notes')}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
          {filtered.map((customer) => (
            <div key={customer.id} className="rounded-xl border p-4">
              <h3 className="text-lg font-bold">
                {customer.companyName || customer.contactName}
              </h3>

              <p className="text-sm text-gray-500">{customer.contactName}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              <p className="text-sm text-gray-500">{customer.email}</p>
              <p className="text-sm text-gray-500">
                {customer.street}, {customer.zip} {customer.city},{' '}
                {customer.country}
              </p>

              {customer.notes && (
                <p className="mt-3 whitespace-pre-wrap">{customer.notes}</p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                >
                  {t(lang, 'edit')}
                </button>

                <button
                  onClick={() => handleDelete(customer.id)}
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
