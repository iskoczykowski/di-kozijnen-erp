'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getCustomers,
  saveCustomer as saveCustomerDb,
  deleteCustomer as deleteCustomerDb,
  type Customer as DbCustomer,
} from '../../lib/customers';
import { subscribeCustomers, unsubscribe } from '../../lib/realtime';

type Customer = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  notes: string;
};

const emptyCustomer: Customer = {
  id: '',
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

function fromDb(c: any): Customer {
  return {
    id: c.id || '',
    companyName: c.company_name || '',
    contactName: c.contact_name || '',
    phone: c.phone || '',
    email: c.email || '',
    street: c.street || '',
    zip: c.zip || '',
    city: c.city || '',
    country: c.country || '',
    notes: c.notes || '',
  };
}

function toDb(c: Customer): DbCustomer {
  return {
    id: c.id || undefined,
    company_name: c.companyName,
    contact_name: c.contactName,
    phone: c.phone,
    email: c.email,
    street: c.street,
    zip: c.zip,
    city: c.city,
    country: c.country,
    notes: c.notes,
  };
}

export default function CustomersModule() {
  const [lang, setLangState] = useState<Lang>('de');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer>(emptyCustomer);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLangState(getLang());

    const updateLang = () => setLangState(getLang());
    window.addEventListener('language-change', updateLang);

    loadCustomers();

    const channel = subscribeCustomers(loadCustomers);

    return () => {
      window.removeEventListener('language-change', updateLang);
      unsubscribe(channel);
    };
  }, []);

  async function loadCustomers() {
    setLoading(true);

    try {
      const data = await getCustomers();
      const list = data.map(fromDb);
      setCustomers(list);

      setSelected((old) => {
        if (!old.id) return old;
        return list.find((c) => c.id === old.id) || old;
      });
    } catch (error) {
      console.error('CUSTOMERS LOAD ERROR', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => JSON.stringify(c).toLowerCase().includes(q));
  }, [customers, search]);

  function newCustomer() {
    setSelected({ ...emptyCustomer });
  }

  async function saveCustomer() {
    try {
      const saved = await saveCustomerDb(toDb(selected));
      setSelected(fromDb(saved));
      await loadCustomers();
    } catch (error) {
      console.error('CUSTOMER SAVE ERROR', error);
    }
  }

  async function deleteCustomer() {
    if (!selected.id) return;

    try {
      await deleteCustomerDb(selected.id);
      setSelected(emptyCustomer);
      await loadCustomers();
    } catch (error) {
      console.error('CUSTOMER DELETE ERROR', error);
    }
  }

  function update(field: keyof Customer, value: string) {
    setSelected((old) => ({ ...old, [field]: value }));
  }

  function openMaps() {
    const address = `${selected.street} ${selected.zip} ${selected.city} ${selected.country}`;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-1">
        <div className="mb-4 flex gap-3">
          <button onClick={newCustomer} className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white">
            + {t('newCustomer', lang)}
          </button>

          <button onClick={saveCustomer} className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white">
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

          {!loading && filtered.length === 0 && (
            <p className="text-slate-500">{t('noCustomers', lang)}</p>
          )}

          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => setSelected(customer)}
              className={
                selected.id === customer.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border bg-slate-50 p-4 text-left'
              }
            >
              <div className="font-black text-slate-900">{customer.companyName || '-'}</div>
              <div className="text-sm text-slate-500">{customer.contactName || '-'}</div>
              <div className="text-sm text-slate-500">{customer.city || '-'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900">
            {t('customerData', lang)}
          </h2>

          <button onClick={deleteCustomer} className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white">
            {t('delete', lang)}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t('companyName', lang)} value={selected.companyName} onChange={(v) => update('companyName', v)} />
          <Field label={t('contactName', lang)} value={selected.contactName} onChange={(v) => update('contactName', v)} />
          <Field label={t('phone', lang)} value={selected.phone} onChange={(v) => update('phone', v)} />
          <Field label={t('email', lang)} value={selected.email} onChange={(v) => update('email', v)} />
          <Field label={t('street', lang)} value={selected.street} onChange={(v) => update('street', v)} />
          <Field label={t('zip', lang)} value={selected.zip} onChange={(v) => update('zip', v)} />
          <Field label={t('city', lang)} value={selected.city} onChange={(v) => update('city', v)} />
          <Field label={t('country', lang)} value={selected.country} onChange={(v) => update('country', v)} />
        </div>

        <div className="mt-4">
          <Field label={t('notes', lang)} value={selected.notes} onChange={(v) => update('notes', v)} textarea />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={openMaps} className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white">
            📍 {t('openMaps', lang)}
          </button>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            📋 {t('createOrder', lang)}
          </button>
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
