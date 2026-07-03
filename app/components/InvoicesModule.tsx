'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import { getCustomers, type Customer } from '../../lib/storage';
import {
  calculateInvoiceTotal,
  createInvoiceNumber,
  deleteInvoice,
  getInvoices,
  saveInvoice,
  type Invoice,
  type InvoiceItem,
} from '../../lib/invoices';
import { saveNotification } from '../../lib/notifications';

const emptyInvoice: Invoice = {
  id: '',
  number: '',
  customerId: '',
  offerId: '',
  title: '',
  items: [],
  status: 'draft',
  vat: 19,
  notes: '',
  dueDate: '',
  createdAt: '',
};

export default function InvoicesModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState<Invoice>(emptyInvoice);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());
    setCustomers(getCustomers());
    setInvoices(getInvoices());
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customerId);
      return `${invoice.number} ${invoice.title} ${customer?.companyName || ''} ${customer?.contactName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [invoices, customers, search]);

  const totals = calculateInvoiceTotal(form);

  function resetForm() {
    setForm(emptyInvoice);
  }

  function addItem() {
    const item: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };

    setForm({ ...form, items: [...form.items, item] });
  }

  function updateItem(id: string, data: Partial<InvoiceItem>) {
    setForm({
      ...form,
      items: form.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    });
  }

  function removeItem(id: string) {
    setForm({
      ...form,
      items: form.items.filter((item) => item.id !== id),
    });
  }

  function handleSave() {
    if (!form.customerId || !form.title.trim()) return;

    const invoice: Invoice = {
      ...form,
      id: form.id || crypto.randomUUID(),
      number: form.number || createInvoiceNumber(),
      createdAt: form.createdAt || new Date().toISOString(),
    };

    const updated = saveInvoice(invoice);
    setInvoices(updated);

    saveNotification({
      title: `${t(lang, 'invoices')}: ${t(lang, 'save')}`,
      text: `${invoice.number} - ${invoice.title}`,
      type: 'customer',
    });

    resetForm();
  }

  function money(value: number) {
    return new Intl.NumberFormat(
      lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : lang === 'pl' ? 'pl-PL' : 'en-US',
      { style: 'currency', currency: 'EUR' }
    ).format(value);
  }

  function getCustomerName(id: string) {
    const customer = customers.find((c) => c.id === id);
    return customer?.companyName || customer?.contactName || '-';
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">{t(lang, 'invoices')}</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border p-3"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="">{t(lang, 'selectCustomer')}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.contactName}
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
              setForm({ ...form, status: e.target.value as Invoice['status'] })
            }
          >
            <option value="draft">{t(lang, 'draft')}</option>
            <option value="sent">{t(lang, 'sent')}</option>
            <option value="paid">Bezahlt</option>
            <option value="overdue">Überfällig</option>
            <option value="cancelled">Storniert</option>
          </select>

          <input
            className="rounded-xl border p-3"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <input
            className="rounded-xl border p-3"
            type="number"
            placeholder={t(lang, 'vat')}
            value={form.vat}
            onChange={(e) => setForm({ ...form, vat: Number(e.target.value) })}
          />

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder={t(lang, 'notes')}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">{t(lang, 'items')}</h3>
            <button
              onClick={addItem}
              className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              {t(lang, 'addItem')}
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-xl bg-gray-50 p-3 md:grid-cols-4">
                <input
                  className="rounded-lg border p-2 md:col-span-2"
                  placeholder={t(lang, 'description')}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />

                <input
                  className="rounded-lg border p-2"
                  type="number"
                  placeholder={t(lang, 'quantity')}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                />

                <input
                  className="rounded-lg border p-2"
                  type="number"
                  placeholder={t(lang, 'unitPrice')}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                />

                <div className="flex justify-between md:col-span-4">
                  <span className="font-semibold">{money(item.quantity * item.unitPrice)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg bg-red-600 px-3 py-1 text-white"
                  >
                    {t(lang, 'delete')}
                  </button>
                </div>
              </div>
            ))}

            {form.items.length === 0 && <p className="text-sm text-gray-500">-</p>}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p>{t(lang, 'subtotal')}: {money(totals.subtotal)}</p>
          <p>{t(lang, 'vat')}: {money(totals.vat)}</p>
          <p className="text-xl font-bold">{t(lang, 'total')}: {money(totals.total)}</p>
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
          {filtered.map((invoice) => {
            const total = calculateInvoiceTotal(invoice);

            return (
              <div key={invoice.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">
                      {invoice.number} - {invoice.title}
                    </h3>
                    <p className="text-sm text-gray-500">{getCustomerName(invoice.customerId)}</p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {invoice.status}
                  </span>
                </div>

                <p className="mt-2 font-bold">{money(total.total)}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setForm(invoice)}
                    className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                  >
                    {t(lang, 'edit')}
                  </button>

                  <button
                    onClick={() => setInvoices(deleteInvoice(invoice.id))}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white"
                  >
                    {t(lang, 'delete')}
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && <p className="text-gray-500">-</p>}
        </div>
      </div>
    </div>
  );
}
