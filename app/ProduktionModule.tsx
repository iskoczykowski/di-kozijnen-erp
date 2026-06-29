{module === 'production' && (
  <section style={card}>
    <div style={topRow}>
      <h2>🏭 {lang==='de' ? 'Produktion' : 'Productie'}</h2>
    </div>

    <table style={table}>
      <thead>
        <tr>
          <th style={th}>{lang==='de' ? 'Projekt' : 'Project'}</th>
          <th style={th}>{lang==='de' ? 'Teil' : 'Onderdeel'}</th>
          <th style={th}>{lang==='de' ? 'Menge' : 'Aantal'}</th>
          <th style={th}>Status</th>
          <th style={th}>{lang==='de' ? 'Notizen' : 'Notities'}</th>
          <th style={th}>{lang==='de' ? 'Zeichnung' : 'Tekening'}</th>
          <th style={th}>{lang==='de' ? 'Aktion' : 'Actie'}</th>
        </tr>
      </thead>

      <tbody>
        {production.map((p:any)=>(
          <tr key={p.id}>
            <td style={td}>{p.project}</td>
            <td style={td}>{p.item}</td>
            <td style={td}>{p.qty}</td>

            <td style={td}>
              <button
                onClick={()=>changeProductionStatus(p)}
                style={{
                  background:
                    p.status === 'done'
                      ? '#22c55e'
                      : p.status === 'working'
                      ? '#eab308'
                      : '#ef4444',
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  padding:'6px 12px'
                }}
              >
                {
                  p.status === 'done'
                    ? (lang==='de' ? 'Fertig' : 'Klaar')
                    : p.status === 'working'
                    ? (lang==='de' ? 'In Bearbeitung' : 'In behandeling')
                    : (lang==='de' ? 'Offen' : 'Open')
                }
              </button>
            </td>

            <td style={td}>{p.notes}</td>

            <td style={td}>
              {drawingsFor(p.id).length ? (
                drawingsFor(p.id).map((d:any)=>(
                  <div key={d.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      📄 {d.name || (lang==='de' ? 'Zeichnung' : 'Tekening')}
                    </a>
                    <button onClick={()=>deleteProductionDrawing(d)}>
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                "-"
              )}
            </td>

            <td style={td}>
              <label
                style={{
                  background:"#2563eb",
                  color:"#fff",
                  padding:"6px 12px",
                  borderRadius:8,
                  cursor:"pointer",
                  display:"inline-block"
                }}
              >
                📁 {lang==="de" ? "Zeichnung hinzufügen" : "Tekening toevoegen"}

                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg,.doc,.docx,.dwg,.dxf"
                  style={{display:"none"}}
                  onChange={(e)=>uploadProductionDrawing(p,e)}
                />
              </label>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
)}
