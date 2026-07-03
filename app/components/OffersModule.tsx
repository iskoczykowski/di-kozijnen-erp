'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import { getCustomers, type Customer } from '../../lib/storage';
import {
  calculateOfferTotal,
  createOfferNumber,
  deleteOffer,
  getOffers,
  saveOffer,
  type Offer,
  type OfferItem,
} from '../../lib/offers';
import { saveNotification } from '../../lib/notifications';

const emptyOffer: Offer = {
  id: '',
  number: '',
  customerId: '',
  title: '',
  items: [],
  status: 'draft',
  vat: 19,
  notes: '',
  createdAt: '',
};

export default function OffersModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<Offer>(emptyOffer);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());
    setCustomers(getCustomers());
    setOffers(getOffers());
  }, []);

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const customer = customers.find((c) => c.id === offer.customerId);
      return `${offer.number} ${offer.title} ${customer?.companyName || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [offers, customers, search]);

  const totals = calculateOfferTotal(form);

  function resetForm() {
    setForm(emptyOffer);
  }

  function addItem() {
    const item: OfferItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };

    setForm({
      ...form,
      items: [...form.items, item],
    });
  }

  function updateItem(id: string, data: Partial<OfferItem>) {
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

    const offer: Offer = {
      ...form,
      id: form.id || crypto.randomUUID(),
      number: form.number || createOfferNumber(),
      createdAt: form.createdAt || new Date().toISOString(),
    };

    const updated = saveOffer(offer);
    setOffers(updated);

    saveNotification({
      title: 'Angebot erstellt',
      text: `${offer.number} - ${offer.title}`,
      type: 'customer',
    });

    resetForm();
  }

  function handleEdit(offer: Offer) {
    setForm(offer);
  }

  function handleDelete(id: string) {
    setOffers(deleteOffer(id));
  }

  function getCustomerName(id: string) {
    const customer = customers.find((c) => c.id === id);
    return customer?.companyName || customer?.contactName || '-';
  }

  function money(value: number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, 'offers')}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border p-3"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="">Kunde auswählen</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.contactName}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border p-3"
            placeholder="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="rounded-xl border p-3"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as Offer['status'],
              })
            }
          >
            <option value="draft">Entwurf</option>
            <option value="sent">Gesendet</option>
            <option value="accepted">Angenommen</option>
            <option value="rejected">Abgelehnt</option>
          </select>

          <input
            className="rounded-xl border p-3"
            type="number"
            placeholder="MwSt %"
            value={form.vat}
            onChange={(e) =>
              setForm({ ...form, vat: Number(e.target.value) })
            }
          />

          <textarea
            className="rounded-xl border p-3 md:col-span-2"
            placeholder="Notizen"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Positionen</h3>
            <button
              onClick={addItem}
              className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              + Position
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl bg-gray-50 p-3 md:grid-cols-4"
              >
                <input
                  className="rounded-lg border p-2 md:col-span-2"
                  placeholder="Beschreibung"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                />

                <input
                  className="rounded-lg border p-2"
                  type="number"
                  placeholder="Menge"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, { quantity: Number(e.target.value) })
                  }
                />

                <input
                  className="rounded-lg border p-2"
                  type="number"
                  placeholder="Einzelpreis"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(item.id, { unitPrice: Number(e.target.value) })
                  }
                />

                <div className="md:col-span-4 flex justify-between">
                  <span className="font-semibold">
                    {money(item.quantity * item.unitPrice)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg bg-red-600 px-3 py-1 text-white"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ))}

            {form.items.length === 0 && (
              <p className="text-sm text-gray-500">
                Noch keine Positionen vorhanden.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p>Zwischensumme: {money(totals.subtotal)}</p>
          <p>MwSt: {money(totals.vat)}</p>
          <p className="text-xl font-bold">Gesamt: {money(totals.total)}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Speichern
          </button>

          <button
            onClick={resetForm}
            className="rounded-xl bg-gray-200 px-5 py-3 font-semibold"
          >
            Leeren
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <input
          className="mb-4 w-full rounded-xl border p-3"
          placeholder="Angebot suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filtered.map((offer) => {
            const total = calculateOfferTotal(offer);

            return (
              <div key={offer.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">
                      {offer.number} - {offer.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getCustomerName(offer.customerId)}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {offer.status}
                  </span>
                </div>

                <p className="mt-2 font-bold">{money(total.total)}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                  >
                    Bearbeiten
                  </button>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-gray-500">Keine Angebote vorhanden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
