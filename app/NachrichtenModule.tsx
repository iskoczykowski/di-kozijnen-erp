"use client";

import React, { useEffect, useState } from "react";

type Lang = "de" | "nl";
type Message = { id: string; sender: string; receiver: string; text: string; createdAt: string; };

const STORAGE_KEY = "di_messages_v1";
function newId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

const input: React.CSSProperties = { width: "100%", height: 38, border: "1px solid #d7dde8", borderRadius: 10, padding: "0 10px", background: "#fff", boxSizing: "border-box" };
const primary: React.CSSProperties = { border: 0, borderRadius: 10, background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

export default function NachrichtenModule({ lang = "de" }: { lang?: Lang }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sender, setSender] = useState("Büro");
  const [receiver, setReceiver] = useState("Produktion");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    setMessages([{ id: newId(), sender, receiver, text, createdAt: new Date().toLocaleString() }, ...messages]);
    setText("");
  }

  return (
    <section>
      <h2>💬 {lang === "de" ? "Nachrichten" : "Berichten"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 16 }}>
          <label><b>{lang === "de" ? "Absender" : "Afzender"}</b><select style={input} value={sender} onChange={e => setSender(e.target.value)}><option>Büro</option><option>Produktion</option><option>Montage</option><option>Lager</option></select></label>
          <br/><br/>
          <label><b>{lang === "de" ? "Empfänger" : "Ontvanger"}</b><select style={input} value={receiver} onChange={e => setReceiver(e.target.value)}><option>Büro</option><option>Produktion</option><option>Montage</option><option>Lager</option></select></label>
          <br/><br/>
          <textarea style={{ ...input, height: 120, paddingTop: 10 }} value={text} onChange={e => setText(e.target.value)} placeholder={lang === "de" ? "Nachricht schreiben..." : "Bericht schrijven..."} />
          <br/><br/>
          <button style={primary} onClick={send}>{lang === "de" ? "Senden" : "Verzenden"}</button>
        </div>
        <div style={{ background: "#fff", border: "1px solid #dfe3eb", borderRadius: 16, padding: 16 }}>
          {messages.map(m => (
            <div key={m.id} style={{ borderBottom: "1px solid #e5e7eb", padding: "10px 0" }}>
              <b>{m.sender} → {m.receiver}</b>
              <div>{m.text}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{m.createdAt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

