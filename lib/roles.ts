export type UserRole =
  | 'admin'
  | 'office'
  | 'production'
  | 'installation'
  | 'warehouse'
  | 'customer';

export type Lang = 'de' | 'nl' | 'en' | 'pl';

export const roles: UserRole[] = [
  'admin',
  'office',
  'production',
  'installation',
  'warehouse',
  'customer',
];

export const roleLabels: Record<Lang, Record<UserRole, string>> = {
  de: {
    admin: 'Admin',
    office: 'Büro',
    production: 'Produktion',
    installation: 'Montage',
    warehouse: 'Lager',
    customer: 'Kunde',
  },
  nl: {
    admin: 'Admin',
    office: 'Kantoor',
    production: 'Productie',
    installation: 'Montage',
    warehouse: 'Magazijn',
    customer: 'Klant',
  },
  en: {
    admin: 'Admin',
    office: 'Office',
    production: 'Production',
    installation: 'Installation',
    warehouse: 'Warehouse',
    customer: 'Customer',
  },
  pl: {
    admin: 'Admin',
    office: 'Biuro',
    production: 'Produkcja',
    installation: 'Montaż',
    warehouse: 'Magazyn',
    customer: 'Klient',
  },
};

export function getRoleLabel(role: UserRole, lang: Lang = 'de') {
  return roleLabels[lang]?.[role] ?? roleLabels.de[role];
}

export function canAccess(role: UserRole, module: string): boolean {
  if (role === 'admin') return true;

  const access: Record<UserRole, string[]> = {
    admin: ['all'],
    office: [
      'dashboard',
      'customers',
      'orders',
      'projects',
      'calendar',
      'messages',
      'pdf',
      'settings',
    ],
    production: ['dashboard', 'production', 'warehouse', 'messages'],
    installation: ['dashboard', 'montage', 'measure', 'orders', 'messages'],
    warehouse: ['dashboard', 'warehouse', 'production', 'messages'],
    customer: ['customerPortal'],
  };

  return access[role]?.includes(module) ?? false;
}
