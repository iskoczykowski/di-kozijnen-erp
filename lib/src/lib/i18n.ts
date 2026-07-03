export type Lang = 'de' | 'nl' | 'en' | 'pl';

const KEY = 'firmaflow_lang';

export const languages: { code: Lang; label: string }[] = [
  { code: 'de', label: 'DE' },
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
];

export function getLang(): Lang {
  const saved = localStorage.getItem(KEY) as Lang | null;
  return saved || 'de';
}

export function setLang(lang: Lang) {
  localStorage.setItem(KEY, lang);
  window.dispatchEvent(new Event('firmaflow-language-change'));
}

const dict: Record<Lang, Record<string, string>> = {
  de: {
    dashboard: 'Dashboard',
    customers: 'Kunden',
    orders: 'Aufträge',
    projects: 'Projektakte',
    measure: 'Aufmaß',
    production: 'Produktion',
    montage: 'Montage',
    warehouse: 'Lager',
    calendar: 'Kalender',
    messages: 'Nachrichten',
    settings: 'Einstellungen',
    newCustomer: 'Neuer Kunde',
    newOrder: 'Neuer Auftrag',
    save: 'Speichern',
    delete: 'Löschen',
    search: 'Suchen',
    customer: 'Kunde',
    address: 'Adresse',
    phone: 'Telefon',
    email: 'E-Mail',
    city: 'Ort',
    zip: 'PLZ',
    notes: 'Notizen',
    status: 'Status',
    open: 'Offen',
    inProgress: 'In Bearbeitung',
    done: 'Erledigt',
  },

  nl: {
    dashboard: 'Dashboard',
    customers: 'Klanten',
    orders: 'Opdrachten',
    projects: 'Projectmap',
    measure: 'Inmeten',
    production: 'Productie',
    montage: 'Montage',
    warehouse: 'Magazijn',
    calendar: 'Kalender',
    messages: 'Berichten',
    settings: 'Instellingen',
    newCustomer: 'Nieuwe klant',
    newOrder: 'Nieuwe opdracht',
    save: 'Opslaan',
    delete: 'Verwijderen',
    search: 'Zoeken',
    customer: 'Klant',
    address: 'Adres',
    phone: 'Telefoon',
    email: 'E-mail',
    city: 'Plaats',
    zip: 'Postcode',
    notes: 'Notities',
    status: 'Status',
    open: 'Open',
    inProgress: 'In behandeling',
    done: 'Afgerond',
  },

  en: {
    dashboard: 'Dashboard',
    customers: 'Customers',
    orders: 'Orders',
    projects: 'Project file',
    measure: 'Measurement',
    production: 'Production',
    montage: 'Installation',
    warehouse: 'Warehouse',
    calendar: 'Calendar',
    messages: 'Messages',
    settings: 'Settings',
    newCustomer: 'New customer',
    newOrder: 'New order',
    save: 'Save',
    delete: 'Delete',
    search: 'Search',
    customer: 'Customer',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    city: 'City',
    zip: 'ZIP',
    notes: 'Notes',
    status: 'Status',
    open: 'Open',
    inProgress: 'In progress',
    done: 'Done',
  },

  pl: {
    dashboard: 'Panel',
    customers: 'Klienci',
    orders: 'Zlecenia',
    projects: 'Akta projektu',
    measure: 'Pomiar',
    production: 'Produkcja',
    montage: 'Montaż',
    warehouse: 'Magazyn',
    calendar: 'Kalendarz',
    messages: 'Wiadomości',
    settings: 'Ustawienia',
    newCustomer: 'Nowy klient',
    newOrder: 'Nowe zlecenie',
    save: 'Zapisz',
    delete: 'Usuń',
    search: 'Szukaj',
    customer: 'Klient',
    address: 'Adres',
    phone: 'Telefon',
    email: 'E-mail',
    city: 'Miasto',
    zip: 'Kod pocztowy',
    notes: 'Notatki',
    status: 'Status',
    open: 'Otwarte',
    inProgress: 'W trakcie',
    done: 'Gotowe',
  },
};

export function t(key: string): string {
  const lang = getLang();
  return dict[lang]?.[key] || dict.de[key] || key;
}
