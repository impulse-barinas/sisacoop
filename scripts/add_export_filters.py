from pathlib import Path
p = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = p.read_text()
old = '  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");\n'
new = '''  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [exportLevel, setExportLevel] = useState("all");
  const [exportStatus, setExportStatus] = useState("all");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
'''
if old not in s:
    raise SystemExit('filter state not found')
s = s.replace(old, new, 1)
old2 = '  const pendingCount = (data?.payments || []).filter(payment => payment.status === "pending").length;\n'
new2 = '''  const pendingCount = (data?.payments || []).filter(payment => payment.status === "pending").length;
  const inExportRange = (date: Date | string | null | undefined) => {
    const timestamp = date ? new Date(date).getTime() : 0;
    const from = exportFrom ? new Date(`${exportFrom}T00:00:00`).getTime() : -Infinity;
    const to = exportTo ? new Date(`${exportTo}T23:59:59.999`).getTime() : Infinity;
    return timestamp >= from && timestamp <= to;
  };
  const filteredPayments = (data?.payments || []).filter(payment =>
    (exportLevel === "all" || String(payment.levelId) === exportLevel) &&
    (exportStatus === "all" || payment.status === exportStatus) && inExportRange(payment.createdAt)
  );
  const filteredParticipants = (data?.participants || []).filter(participant =>
    (exportLevel === "all" || String(participant.levelId) === exportLevel) &&
    (exportStatus === "all" || (exportStatus === "active" ? participant.status !== "withdrawn" : participant.status === exportStatus)) && inExportRange(participant.registeredAt)
  );
'''
if old2 not in s:
    raise SystemExit('pending count not found')
s = s.replace(old2, new2, 1)
s = s.replace('const rows = (data?.payments || []).map(payment => {', 'const rows = filteredPayments.map(payment => {', 1)
s = s.replace('const rows = (data?.participants || []).map(participant => {', 'const rows = filteredParticipants.map(participant => {', 1)
needle = '<div className="admin-export-actions"><Button size="sm" variant="outline" className="outline-action" onClick={exportParticipants}'
filter_bar = '''<div className="export-filter-bar"><div><label>Nivel</label><select value={exportLevel} onChange={event => setExportLevel(event.target.value)}><option value="all">Todos los niveles</option>{(data?.levels || []).map(level => <option key={level.id} value={level.id}>Nivel {level.levelNumber}</option>)}</select></div><div><label>Estado</label><select value={exportStatus} onChange={event => setExportStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="verified">Aprobado</option><option value="rejected">Rechazado</option><option value="active">Activo</option><option value="withdrawn">Inactivo</option><option value="paid">Pagado</option></select></div><div><label>Desde</label><input type="date" value={exportFrom} onChange={event => setExportFrom(event.target.value)} /></div><div><label>Hasta</label><input type="date" value={exportTo} onChange={event => setExportTo(event.target.value)} /></div><button className="clear-export-filters" onClick={() => { setExportLevel("all"); setExportStatus("all"); setExportFrom(""); setExportTo(""); }}>Limpiar</button><span className="export-count">{filteredPayments.length} pagos · {filteredParticipants.length} participantes</span></div>'''
if needle not in s:
    raise SystemExit('export actions not found')
s = s.replace(needle, filter_bar + needle, 1)
css = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
styles = '''\n.export-filter-bar { display: flex; flex-wrap: wrap; align-items: end; gap: 9px; padding: 12px; margin: 0 0 14px; background: #f7f9fb; border: 1px solid #edf0f4; border-radius: 12px; }.export-filter-bar div { display: grid; gap: 4px; }.export-filter-bar label { color: #98a4b2; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }.export-filter-bar select, .export-filter-bar input { height: 32px; min-width: 112px; padding: 0 8px; border: 1px solid #dce3ec; border-radius: 7px; background: #fff; color: #53647a; font-size: 10px; }.clear-export-filters { height: 32px; padding: 0 10px; border: 1px solid #dce3ec; border-radius: 7px; background: #fff; color: #718095; font-size: 10px; }.export-count { margin-left: auto; color: #98a4b2; font-size: 9px; white-space: nowrap; padding-bottom: 8px; }\n@media (max-width: 720px) { .export-filter-bar > div { flex: 1 1 45%; }.export-filter-bar select, .export-filter-bar input { width: 100%; }.clear-export-filters { flex: 1; }.export-count { width: 100%; margin-left: 0; padding-bottom: 0; } }\n'''
current = css.read_text()
if '.export-filter-bar' not in current:
    css.write_text(current + styles)
p.write_text(s)
