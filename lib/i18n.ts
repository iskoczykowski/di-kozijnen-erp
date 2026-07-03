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
    login: 'Anmelden',
    logout: 'Abmelden',
    save: 'Speichern',
    delete: 'Löschen',
    search: 'Suchen',
    newCustomer: 'Neuer Kunde',
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
    login: 'Inloggen',
    logout: 'Uitloggen',
    save: 'Opslaan',
    delete: 'Verwijderen',
    search: 'Zoeken',
    newCustomer: 'Nieuwe klant',
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
    login: 'Login',
    logout: 'Logout',
    save: 'Save',
    delete: 'Delete',
    search: 'Search',
    newCustomer: 'New customer',
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
    login: 'Logowanie',
    logout: 'Wyloguj',
    save: 'Zapisz',
    delete: 'Usuń',
    search: 'Szukaj',
    newCustomer: 'Nowy klient',
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
