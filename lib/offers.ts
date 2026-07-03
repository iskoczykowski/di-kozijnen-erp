export type OfferStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected';

export type OfferItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Offer = {
  id: string;
  number: string;
  customerId: string;
  title: string;
  items: OfferItem[];
  status: OfferStatus;
  vat: number;
  notes: string;
  createdAt: string;
};

const STORAGE = 'firmaflow_offers';

export function getOffers(): Offer[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE) || '[]');
  } catch {
    return [];
  }
}

export function createOfferNumber() {
  const year = new Date().getFullYear();
  const nr = getOffers().length + 1;

  return `ANG-${year}-${String(nr).padStart(4, '0')}`;
}

export function saveOffer(offer: Offer) {
  const list = getOffers();

  const exists = list.some((o) => o.id === offer.id);

  const updated = exists
    ? list.map((o) => (o.id === offer.id ? offer : o))
    : [offer, ...list];

  localStorage.setItem(STORAGE, JSON.stringify(updated));

  return updated;
}

export function deleteOffer(id: string) {
  const updated = getOffers().filter((o) => o.id !== id);

  localStorage.setItem(STORAGE, JSON.stringify(updated));

  return updated;
}

export function calculateOfferTotal(offer: Offer) {
  const subtotal = offer.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const vat = subtotal * (offer.vat / 100);

  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}
