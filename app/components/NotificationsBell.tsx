'use client';

import { useEffect, useState } from 'react';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  type Notification,
} from '../../lib/notifications';

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    setItems(getNotifications());

    const timer = setInterval(() => {
      setItems(getNotifications());
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function read(id: string) {
    setItems(markNotificationRead(id));
  }

  function remove(id: string) {
    setItems(deleteNotification(id));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl bg-white px-4 py-3 shadow"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl bg-white p-4 shadow-xl">
          <h3 className="mb-3 font-bold text-gray-900">Benachrichtigungen</h3>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-sm text-gray-500">Keine Benachrichtigungen.</p>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3 ${
                  n.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-700">{n.text}</p>

                <div className="mt-2 flex gap-2">
                  {!n.read && (
                    <button
                      onClick={() => read(n.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white"
                    >
                      Gelesen
                    </button>
                  )}

                  <button
                    onClick={() => remove(n.id)}
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
