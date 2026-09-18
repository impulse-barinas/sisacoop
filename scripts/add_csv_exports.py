from pathlib import Path
p = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('data?: { payments: any[]; profiles: any[]; levels: any[] }', 'data?: { payments: any[]; profiles: any[]; levels: any[]; participants: any[] }', 1)
needle = '  const pendingCount = (data?.payments || []).filter(payment => payment.status === "pending").length;\n'
insert = '''  const pendingCount = (data?.payments || []).filter(payment => payment.status === "pending").length;
  const exportPayments = () => {
    const rows = (data?.payments || []).map(payment => {
      const profile = profileByUser.get(payment.senderUserId || payment.receiverUserId);
      const level = levelById.get(payment.levelId);
      return [payment.id, profile?.fullName || "", profile?.accountNumber || "", payment.direction === "sent" ? "Realizado" : "Recibido", level?.levelNumber || "", formatMoney(payment.amount), payment.status === "verified" ? "Aprobado" : payment.status === "rejected" ? "Rechazado" : "Pendiente", payment.note || "", formatDate(payment.createdAt)];
    });
    downloadCsv(`historial-pagos-${new Date().toISOString().slice(0, 10)}.csv`, ["ID", "Participante", "Cuenta", "Tipo", "Nivel", "Monto", "Estado", "Nota", "Fecha"], rows);
    toast.success("Historial de pagos exportado.");
  };
  const exportParticipants = () => {
    const profileRows = new Map((data?.profiles || []).map(profile => [profile.userId, profile]));
    const levelRows = new Map((data?.levels || []).map(level => [level.id, level]));
    const rows = (data?.participants || []).map(participant => {
      const profile = profileRows.get(participant.userId);
      const level = levelRows.get(participant.levelId);
      return [participant.id, profile?.fullName || "", profile?.accountNumber || participant.accountNumber || "", profile?.phone || "", level?.levelNumber || "", participant.position, participant.status === "withdrawn" ? "Inactivo" : participant.status === "paid" ? "Pagado" : "Activo", formatMoney(participant.cultivationAmount), formatDate(participant.registeredAt)];
    });
    downloadCsv(`historial-participantes-${new Date().toISOString().slice(0, 10)}.csv`, ["ID", "Participante", "Cuenta", "Teléfono", "Nivel", "Posición", "Estado", "Cultivo", "Fecha de registro"], rows);
    toast.success("Historial de participantes exportado.");
  };
'''
if needle not in s:
    raise SystemExit('pending count not found')
s = s.replace(needle, insert, 1)
old = '<div className="filter-tabs">{(["pending", "verified", "rejected", "all"] as const).map(value => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "pending" ? "Pendientes" : value === "verified" ? "Aprobados" : value === "rejected" ? "Rechazados" : "Todos"}</button>)}</div>'
new = '<div className="admin-export-actions"><Button size="sm" variant="outline" className="outline-action" onClick={exportParticipants}><FileCheck2 className="mr-1 h-3.5 w-3.5" /> Participantes CSV</Button><Button size="sm" variant="outline" className="outline-action" onClick={exportPayments}><FileCheck2 className="mr-1 h-3.5 w-3.5" /> Pagos CSV</Button></div><div className="filter-tabs">{(["pending", "verified", "rejected", "all"] as const).map(value => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "pending" ? "Pendientes" : value === "verified" ? "Aprobados" : value === "rejected" ? "Rechazados" : "Todos"}</button>)}</div>'
if old not in s:
    raise SystemExit('filter tabs not found')
s = s.replace(old, new, 1)
p.write_text(s)

css = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
styles = '''\n.admin-export-actions { display: flex; gap: 7px; margin-left: auto; }.admin-export-actions .outline-action { white-space: nowrap; font-size: 10px; }\n@media (max-width: 720px) { .admin-export-actions { width: 100%; margin-left: 0; } .admin-export-actions button { flex: 1; } }\n'''
current = css.read_text()
if '.admin-export-actions' not in current:
    css.write_text(current + styles)
