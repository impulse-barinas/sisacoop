from pathlib import Path
p = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = p.read_text()
needle = '''  const filteredParticipants = (data?.participants || []).filter(participant =>
    (exportLevel === "all" || String(participant.levelId) === exportLevel) &&
    (exportStatus === "all" || (exportStatus === "active" ? participant.status !== "withdrawn" : participant.status === exportStatus)) && inExportRange(participant.registeredAt)
  );
'''
replacement = needle + '''  const totalPayments = filteredPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  const receivedPayments = filteredPayments.filter(payment => payment.direction === "received").reduce((total, payment) => total + (payment.amount || 0), 0);
  const sentPayments = filteredPayments.filter(payment => payment.direction === "sent").reduce((total, payment) => total + (payment.amount || 0), 0);
  const cultivationTotal = filteredParticipants.reduce((total, participant) => total + (participant.cultivationAmount || 0), 0);
'''
if needle not in s:
    raise SystemExit('filtered participants block not found')
s = s.replace(needle, replacement, 1)
needle2 = '<div className="admin-export-actions"><Button size="sm" variant="outline" className="outline-action" onClick={exportParticipants}'
summary = '''<div className="export-summary"><div className="summary-heading"><div><p className="eyebrow">RESUMEN FILTRADO</p><strong>Montos seleccionados</strong></div><span>Se actualiza al cambiar los filtros</span></div><div className="summary-metrics"><div><small>Total movimientos</small><strong>{formatMoney(totalPayments)}</strong><em>{filteredPayments.length} registros</em></div><div><small>Pagos recibidos</small><strong className="received-total">{formatMoney(receivedPayments)}</strong><em>{filteredPayments.filter(payment => payment.direction === "received").length} registros</em></div><div><small>Pagos realizados</small><strong className="sent-total">{formatMoney(sentPayments)}</strong><em>{filteredPayments.filter(payment => payment.direction === "sent").length} registros</em></div><div><small>Cultivo participantes</small><strong className="cultivation-total">{formatMoney(cultivationTotal)}</strong><em>{filteredParticipants.length} participantes</em></div></div></div>'''
if needle2 not in s:
    raise SystemExit('export actions block not found')
s = s.replace(needle2, summary + needle2, 1)
css = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
styles = '''\n.export-summary { margin: 0 0 14px; padding: 15px; border: 1px solid #e8edf2; border-radius: 14px; background: linear-gradient(135deg, #fbfcfd, #f4f8fb); }.summary-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 11px; }.summary-heading strong { color: var(--ink); font-size: 14px; }.summary-heading span { color: #9ca7b4; font-size: 9px; }.summary-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }.summary-metrics > div { padding: 10px 11px; border-radius: 10px; background: #fff; border: 1px solid #edf0f4; }.summary-metrics small, .summary-metrics strong, .summary-metrics em { display: block; }.summary-metrics small { color: #8f9baa; font-size: 9px; }.summary-metrics strong { margin-top: 3px; color: var(--ink); font-size: 18px; letter-spacing: -.04em; }.summary-metrics em { margin-top: 3px; color: #a5afbb; font-size: 8px; font-style: normal; }.summary-metrics .received-total { color: #17a884; }.summary-metrics .sent-total { color: #5e83d6; }.summary-metrics .cultivation-total { color: var(--orange); }\n@media (max-width: 720px) { .summary-metrics { grid-template-columns: repeat(2, 1fr); }.summary-heading { align-items: start; gap: 8px; flex-direction: column; } }\n'''
current = css.read_text()
if '.export-summary' not in current:
    css.write_text(current + styles)
p.write_text(s)
