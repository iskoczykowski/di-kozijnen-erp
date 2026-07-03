export type MessagePriority = 'low' | 'normal' | 'high';
export type MessageStatus = 'open' | 'read' | 'done';

export type Message = {
  id: string;
  title: string;
  message: string;
  sender: string;
  receiver: string;
  priority: MessagePriority;
  status: MessageStatus;
  createdAt: string;
};

const STORAGE_KEY = 'firmaflow_messages';

export function getMessages(): Message[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMessage(message: Message): Message[] {
  const messages = getMessages();

  const exists = messages.some((m) => m.id === message.id);

  const updated = exists
    ? messages.map((m) => (m.id === message.id ? message : m))
    : [message, ...messages];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteMessage(id: string): Message[] {
  const updated = getMessages().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
