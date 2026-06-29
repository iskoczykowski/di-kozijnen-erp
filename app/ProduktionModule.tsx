"use client";

export default function ProduktionModule({ lang = "de" }: { lang?: "de" | "nl" }) {
  return (
    <section>
      <h2>🏭 {lang === "de" ? "Produktion" : "Productie"}</h2>
      <div style={{
        background:"#fff",
        border:"1px solid #dfe3eb",
        borderRadius:16,
        padding:20
      }}>
        {lang === "de"
          ? "Produktionsmodul wird jetzt aufgebaut."
          : "Productiemodule wordt nu opgebouwd."}
      </div>
    </section>
  );
}
