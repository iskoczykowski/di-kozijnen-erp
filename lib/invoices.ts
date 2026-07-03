export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  offerId?: string;
  title: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  vat: number;
  notes: string;
  dueDate: string;
  createdAt: string;
};

const STORAGE = 'firmaflow_invoices';

export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE) || '[]');
  } catch {
    return [];
  }
}

export function createInvoiceNumber() {
  const year = new Date().getFullYear();
  const nr = getInvoices().length + 1;

  return `RE-${year}-${String(nr).padStart(4, '0')}`;
}

export function saveInvoice(invoice: Invoice) {
  const list = getInvoices();

  const exists = list.some((i) => i.id === invoice.id);

  const updated = exists
    ? list.map((i) => (i.id === invoice.id ? invoice : i))
    : [invoice, ...list];

  localStorage.setItem(STORAGE, JSON.stringify(updated));
  return updated;
}

export function deleteInvoice(id: string) {
  const updated = getInvoices().filter((i) => i.id !== id);

  localStorage.setItem(STORAGE, JSON.stringify(updated));
  return updated;
}

export function calculateInvoiceTotal(invoice: Invoice) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const vat = subtotal * (invoice.vat / 100);

  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}
