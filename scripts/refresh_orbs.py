from pathlib import Path
import re

home = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = home.read_text()
s = s.replace('const SPIRAL_POSITIONS = [1, 8, 9, 12, 2, 7, 10, 11, 3, 6, 5, 4];', 'const SPIRAL_POSITIONS = [1, 8, 9, 2, 7, 10, 3, 6, 11, 4, 5, 12];')

new_orb = '''function ParticipantOrb({ position, active, accountNumber, amount, registeredAt, onClick }: { position: number; active: boolean; accountNumber?: string | null; amount?: number; registeredAt?: Date | string | null; onClick?: () => void }) {
  return <button onClick={onClick} className={`participant-orb ${active ? "is-active" : "is-inactive"}`} aria-label={`Participante número ${position}`}>
    <span className="orb-top"><span className="orb-amount">{active ? formatMoney(amount) : "—"}</span></span>
    <span className="orb-center"><span className="orb-position">N°{String(position).padStart(2, "0")}</span></span>
    <span className="orb-orange"><span className="orb-account">{active ? `Cnta: ${accountNumber || "0001"}` : "Disponible"}</span></span>
    <span className="orb-info"><span>{active && registeredAt ? formatDate(registeredAt) : "Sin registro"}</span><span>{active ? "Activo ahora" : "Esperando"}</span></span>
  </button>;
}'''
s, count = re.subn(r'function ParticipantOrb\([\s\S]*?\n\}\n\nfunction LevelFlow', new_orb + '\n\nfunction LevelFlow', s, count=1)
if count != 1:
    raise SystemExit('participant component not found')
s = s.replace('accountNumber={own?.accountNumber} amount={level.cultivationAmount} onClick={onSelect}', 'accountNumber={own?.accountNumber} amount={level.cultivationAmount} registeredAt={own?.registeredAt} onClick={onSelect}')
home.write_text(s)

css_path = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
css = css_path.read_text()
css = css.replace('grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr; gap: 8px; padding: 15px 7%;', 'grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr)); gap: 12px 16px; padding: 15px 14%;')
old_css = '''.participant-orb { min-width: 0; min-height: 46px; z-index: 1; border: 1px solid #cfd9e6; background: #fff; border-radius: 50% / 45%; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform .2s, box-shadow .2s, background .2s; }.participant-orb:hover { transform: scale(1.04); box-shadow: 0 6px 15px #24345112; }.participant-orb.is-active { background: linear-gradient(145deg, #ffba82, #f36d21); border: 2px solid #fff; outline: 2px solid #f36d21; color: white; box-shadow: 0 7px 18px #f36d2140; }.orb-amount { font-size: 9px; font-weight: 800; }.orb-position { font-size: 11px; font-weight: 800; color: #536478; }.is-active .orb-position { color: white; margin-top: 1px; }.orb-account, .orb-time { font-family: "DM Mono", monospace; font-size: 7px; color: #a1acbb; }.is-active .orb-account, .is-active .orb-time { color: #fff8; }.orb-time { font-size: 6px; }.level-footer'''
new_css = '''.participant-orb { width: min(100%, 116px); aspect-ratio: 1; justify-self: center; min-width: 0; min-height: 0; z-index: 1; padding: 0; overflow: hidden; border: 1px solid #cfd7e1; background: #eef1f4; border-radius: 50%; display: grid; grid-template-rows: 28% 27% 23% 22%; align-items: stretch; color: #8e99a8; transition: transform .2s, box-shadow .2s, filter .2s; }.participant-orb:hover { transform: scale(1.04); box-shadow: 0 7px 18px #24345118; }.participant-orb.is-active { border: 2px solid #fff; outline: 2px solid #159bd5; box-shadow: 0 8px 19px #159bd548; color: #18212f; }.participant-orb.is-inactive { filter: saturate(.12); opacity: .68; }.orb-top, .orb-center, .orb-orange, .orb-info { display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }.orb-top { background: #159bd5; color: white; }.orb-center { background: white; color: #101820; }.orb-orange { background: #f58220; color: white; }.orb-info { flex-direction: column; gap: 1px; background: #bfc3c6; color: #38414a; font-family: "DM Mono", monospace; font-size: clamp(5px, .55vw, 7px); line-height: 1.05; }.is-active .orb-info { background: linear-gradient(#bfc3c6 62%, #111820 62%); color: #27313a; }.is-active .orb-info span:last-child { color: white; width: 100%; padding-top: 1px; }.orb-amount { font-size: clamp(8px, 1vw, 12px); font-weight: 800; }.orb-position { font-size: clamp(16px, 2vw, 25px); line-height: 1; font-weight: 500; letter-spacing: -.08em; }.orb-account { font-size: clamp(8px, 1vw, 12px); font-weight: 500; white-space: nowrap; }.level-footer'''
if old_css not in css:
    raise SystemExit('orb css block not found')
css = css.replace(old_css, new_css)
css = css.replace('.flow-board { min-height: 200px;', '.flow-board { min-height: 390px;')
css = css.replace('.flow-board { padding: 12px 3%; min-height: 180px;', '.flow-board { padding: 14px 5%; min-height: 390px; gap: 10px 7px;')
css_path.write_text(css)
