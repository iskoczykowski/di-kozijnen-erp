export type Lang = 'de' | 'nl' | 'en' | 'pl';

const KEY = 'di_kozijnen_erp_lang';

export const languages: { code: Lang; label: string; name: string }[] = [
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'nl', label: 'NL', name: 'Nederlands' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'pl', label: 'PL', name: 'Polski' },
];

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'de';
  return (localStorage.getItem(KEY) as Lang) || 'de';
}

export function setLang(lang: Lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, lang);
  window.dispatchEvent(new Event('language-change'));
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
    employees: 'Mitarbeiter',

    save: 'Speichern',
    delete: 'Löschen',
    search: 'Suchen',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',

    newCustomer: 'Neuer Kunde',
    customerData: 'Kundendaten',
    companyName: 'Firma / Name',
    contactName: 'Ansprechpartner',
    phone: 'Telefon',
    email: 'E-Mail',
    street: 'Straße',
    zip: 'PLZ',
    city: 'Ort',
    country: 'Land',
    notes: 'Notizen',
    openMaps: 'Google Maps öffnen',
    createOrder: 'Auftrag erstellen',
    noCustomers: 'Noch keine Kunden vorhanden',

    newOrder: 'Neuer Auftrag',
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
    employees: 'Medewerkers',

    save: 'Opslaan',
    delete: 'Verwijderen',
    search: 'Zoeken',
    cancel: 'Annuleren',
    edit: 'Bewerken',

    newCustomer: 'Nieuwe klant',
    customerData: 'Klantgegevens',
    companyName: 'Bedrijf / Naam',
    contactName: 'Contactpersoon',
    phone: 'Telefoon',
    email: 'E-mail',
    street: 'Straat',
    zip: 'Postcode',
    city: 'Plaats',
    country: 'Land',
    notes: 'Notities',
    openMaps: 'Google Maps openen',
    createOrder: 'Opdracht maken',
    noCustomers: 'Nog geen klanten aanwezig',

    newOrder: 'Nieuwe opdracht',
    status: 'Status',
    open: 'Open',
    inProgress: 'In behandeling',
    done: 'Klaar',
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
    employees: 'Employees',

    save: 'Save',
    delete: 'Delete',
    search: 'Search',
    cancel: 'Cancel',
    edit: 'Edit',

    newCustomer: 'New customer',
    customerData: 'Customer data',
    companyName: 'Company / Name',
    contactName: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    street: 'Street',
    zip: 'ZIP',
    city: 'City',
    country: 'Country',
    notes: 'Notes',
    openMaps: 'Open Google Maps',
    createOrder: 'Create order',
    noCustomers: 'No customers yet',

    newOrder: 'New order',
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
    employees: 'Pracownicy',

    save: 'Zapisz',
    delete: 'Usuń',
    search: 'Szukaj',
    cancel: 'Anuluj',
    edit: 'Edytuj',

    newCustomer: 'Nowy klient',
    customerData: 'Dane klienta',
    companyName: 'Firma / Nazwa',
    contactName: 'Osoba kontaktowa',
    phone: 'Telefon',
    email: 'E-mail',
    street: 'Ulica',
    zip: 'Kod pocztowy',
    city: 'Miasto',
    country: 'Kraj',
    notes: 'Notatki',
    openMaps: 'Otwórz Google Maps',
    createOrder: 'Utwórz zlecenie',
    noCustomers: 'Brak klientów',

    newOrder: 'Nowe zlecenie',
    status: 'Status',
    open: 'Otwarte',
    inProgress: 'W trakcie',
    done: 'Gotowe',
  },
};

export function t(key: string, lang: Lang = getLang()): string {
  return dict[lang]?.[key] || dict.de[key] || key;
}
