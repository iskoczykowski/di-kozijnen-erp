'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLang, t, type Lang } from '../../lib/i18n';
import {
  getMessages,
  saveMessage,
  deleteMessage,
  type Message,
} from '../../lib/messages';

const emptyMessage: Message = {
  title: '',
  message: '',
  sender: '',
  receiver: '',
  status: 'Neu',
};

export default function MessagesModule() {
  const [lang, setLang] = useState<Lang>('de');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message>(emptyMessage);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLang(getLang());

    const update = () => setLang(getLang());

    window.addEventListener('language-change', update);

    load();

    return () =>
      window.removeEventListener('language-change', update);
  }, []);

  async function load() {
    try {
      setMessages(await getMessages());
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return messages.filter((m) =>
      JSON.stringify(m).toLowerCase().includes(q)
    );
  }, [messages, search]);

  async function save() {
    const saved = await saveMessage(selected);
    setSelected(saved);
    await load();
  }

  async function remove() {
    if (!selected.id) return;

    await deleteMessage(selected.id);

    setSelected(emptyMessage);

    await load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

      <div className="rounded-3xl bg-white p-6 shadow">

        <div className="mb-4 flex gap-3">

          <button
            onClick={() => setSelected(emptyMessage)}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white"
          >
            + {t('messages', lang)}
          </button>

          <button
            onClick={save}
            className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white"
          >
            {t('save', lang)}
          </button>

        </div>

        <input
          className="mb-4 w-full rounded-2xl border px-4 py-3"
          value={search}
          placeholder={t('search', lang)}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">

          {filtered.map((message) => (

            <button
              key={message.id}
              onClick={() => setSelected(message)}
              className={
                selected.id === message.id
                  ? 'w-full rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 text-left'
                  : 'w-full rounded-2xl border p-4 text-left'
              }
            >
              <div className="font-black">
                {message.title}
              </div>

              <div className="text-slate-500">
                {message.sender}
              </div>

            </button>

          ))}

        </div>

      </div>

      <div className="rounded-3xl bg-white p-6 shadow xl:col-span-2">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-3xl font-black">
            {t('messages', lang)}
          </h2>

          <button
            onClick={remove}
            className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
          >
            {t('delete', lang)}
          </button>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <Field
            label={t('messages', lang)}
            value={selected.title}
            onChange={(v) => setSelected({ ...selected, title: v })}
          />

          <Field
            label={t('status', lang)}
            value={selected.status}
            onChange={(v) => setSelected({ ...selected, status: v })}
          />

          <Field
            label={t('employees', lang)}
            value={selected.sender || ''}
            onChange={(v) => setSelected({ ...selected, sender: v })}
          />

          <Field
            label={t('contactName', lang)}
            value={selected.receiver || ''}
            onChange={(v) => setSelected({ ...selected, receiver: v })}
          />

        </div>

        <textarea
          className="mt-5 min-h-40 w-full rounded-2xl border p-4"
          value={selected.message}
          placeholder={t('description', lang)}
          onChange={(e) =>
            setSelected({
              ...selected,
              message: e.target.value,
            })
          }
        />

      </div>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>

      <span className="mb-2 block font-bold">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3"
      />

    </label>
  );
}
