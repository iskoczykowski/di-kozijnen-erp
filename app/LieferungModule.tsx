"use client";

export default function LieferungModule({ lang = "de" }: { lang?: "de" | "nl" }) {
  return (
    <section>
      <h2>🚚 {lang === "de" ? "Lieferung" : "Levering"}</h2>
      <div style={{ background:"#fff", border:"1px solid #dfe3eb", borderRadius:16, padding:20 }}>
        {lang === "de" ? "Liefermodul wird als Nächstes erweitert." : "Leveringsmodule wordt als volgende uitgebreid."}
      </div>
    </section>
  );
}

