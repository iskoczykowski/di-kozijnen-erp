export type ModuleKey =
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'projects'
  | 'measure'
  | 'production'
  | 'montage'
  | 'warehouse'
  | 'calendar'
  | 'employees'
  | 'messages'
  | 'settings';

export interface NavigationItem {
  key: ModuleKey;
  icon: string;
  color: string;
}

export const navigation: NavigationItem[] = [
  { key: 'dashboard', icon: '🏠', color: '#2563EB' },
  { key: 'customers', icon: '👥', color: '#16A34A' },
  { key: 'orders', icon: '📋', color: '#F59E0B' },
  { key: 'projects', icon: '📁', color: '#7C3AED' },
  { key: 'measure', icon: '📐', color: '#0EA5E9' },
  { key: 'production', icon: '🏭', color: '#4F46E5' },
  { key: 'montage', icon: '🚚', color: '#EA580C' },
  { key: 'warehouse', icon: '📦', color: '#0891B2' },
  { key: 'calendar', icon: '📅', color: '#DC2626' },
  { key: 'employees', icon: '👷', color: '#059669' },
  { key: 'messages', icon: '💬', color: '#6366F1' },
  { key: 'settings', icon: '⚙️', color: '#475569' },
];
