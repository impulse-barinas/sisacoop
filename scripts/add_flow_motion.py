from pathlib import Path
import re

home = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = home.read_text()
old = '''function ParticipantOrb({ position, active, accountNumber, amount, registeredAt, onClick }: { position: number; active: boolean; accountNumber?: string | null; amount?: number; registeredAt?: Date | string | null; onClick?: () => void }) {
  return <button onClick={onClick} className={`participant-orb ${active ? "is-active" : "is-inactive"}`} aria-label={`Participante número ${position}`}>
    <span className="orb-top"><span className="orb-amount">{active ? formatMoney(amount) : "—"}</span></span>
    <span className="orb-center"><span className="orb-position">N°{String(position).padStart(2, "0")}</span></span>
    <span className="orb-orange"><span className="orb-account">{active ? `Cnta: ${accountNumber || "0001"}` : "Disponible"}</span></span>
    <span className="orb-info"><span>{active && registeredAt ? formatDate(registeredAt) : "Sin registro"}</span><span>{active ? "Activo ahora" : "Esperando"}</span></span>
  </button>;
}'''
new = '''function ParticipantOrb({ position, active, accountNumber, amount, registeredAt, onClick }: { position: number; active: boolean; accountNumber?: string | null; amount?: number; registeredAt?: Date | string | null; onClick?: () => void }) {
  const gridIndex = SPIRAL_POSITIONS.indexOf(position);
  const gridColumn = gridIndex % 3;
  const gridRow = Math.floor(gridIndex / 3);
  const entryX = gridColumn === 0 ? "-72px" : gridColumn === 2 ? "72px" : "0px";
  const entryY = gridRow < 2 ? "42px" : gridRow > 2 ? "-42px" : "0px";
  const entryDelay = `${Math.max(0, gridIndex) * 55}ms`;
  return <button onClick={onClick} className={`participant-orb ${active ? "is-active" : "is-inactive"}`} style={{ "--entry-x": entryX, "--entry-y": entryY, "--entry-delay": entryDelay } as React.CSSProperties} aria-label={`Participante número ${position}`}>
    <span className="orb-top"><span className="orb-amount">{active ? formatMoney(amount) : "—"}</span></span>
    <span className="orb-center"><span className="orb-position">N°{String(position).padStart(2, "0")}</span></span>
    <span className="orb-orange"><span className="orb-account">{active ? `Cnta: ${accountNumber || "0001"}` : "Disponible"}</span></span>
    <span className="orb-info"><span>{active && registeredAt ? formatDate(registeredAt) : "Sin registro"}</span><span>{active ? "Activo ahora" : "Esperando"}</span></span>
  </button>;
}'''
if old not in s:
    raise SystemExit('participant function not found')
home.write_text(s.replace(old, new, 1))

css_path = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
css = css_path.read_text()
old_css = '.participant-orb.is-active { animation: orbActivate .72s cubic-bezier(.22, 1, .36, 1) both, orbGlow 1.2s ease-out .18s both; }'
new_css = '.participant-orb.is-active { animation: orbEnter .86s cubic-bezier(.22, 1, .36, 1) var(--entry-delay) both, orbGlow 1.2s ease-out calc(var(--entry-delay) + .18s) both; }'
if old_css not in css:
    raise SystemExit('activation animation not found')
css = css.replace(old_css, new_css, 1)
keyframes = '@keyframes orbEnter { 0% { transform: translate3d(var(--entry-x), var(--entry-y), 0) scale(.42); opacity: .08; filter: saturate(.3) blur(2px); } 52% { transform: translate3d(0, 0, 0) scale(1.08); opacity: 1; filter: saturate(1.12) blur(0); } 76% { transform: translate3d(0, 0, 0) scale(.97); } 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; filter: saturate(1) blur(0); } } '
css = css.replace('@keyframes orbActivate {', keyframes + '@keyframes orbActivate {', 1)
css = css.replace('@media (prefers-reduced-motion: reduce) { .participant-orb.is-active, .participant-orb.is-active .orb-top, .participant-orb.is-active .orb-center, .participant-orb.is-active .orb-orange, .participant-orb.is-active .orb-info { animation: none; } }', '@media (prefers-reduced-motion: reduce) { .participant-orb.is-active, .participant-orb.is-active .orb-top, .participant-orb.is-active .orb-center, .participant-orb.is-active .orb-orange, .participant-orb.is-active .orb-info { animation: none; } }')
css_path.write_text(css)
