export type NotificationType =
  | 'order'
  | 'calendar'
  | 'message'
  | 'customer'
  | 'production';

export type Notification = {
  id: string;
  title: string;
  text: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'firmaflow_notifications';

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveNotification(
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
) {
  const list = getNotifications();

  list.unshift({
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function markNotificationRead(id: string) {
  const updated = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteNotification(id: string) {
  const updated = getNotifications().filter((n) => n.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
