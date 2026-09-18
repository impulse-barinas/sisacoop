from pathlib import Path
p = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/index.css')
s = p.read_text()
needle = '.participant-orb.is-active { border: 2px solid #fff; outline: 2px solid #159bd5; box-shadow: 0 8px 19px #159bd548; color: #18212f; }'
replacement = needle + ' .participant-orb.is-active { animation: orbActivate .72s cubic-bezier(.22, 1, .36, 1) both, orbGlow 1.2s ease-out .18s both; } .participant-orb.is-active .orb-top, .participant-orb.is-active .orb-center, .participant-orb.is-active .orb-orange, .participant-orb.is-active .orb-info { animation: orbStripIn .42s cubic-bezier(.22, 1, .36, 1) both; } .participant-orb.is-active .orb-top { animation-delay: .08s; } .participant-orb.is-active .orb-center { animation-delay: .14s; } .participant-orb.is-active .orb-orange { animation-delay: .2s; } .participant-orb.is-active .orb-info { animation-delay: .26s; }'
if needle not in s:
    raise SystemExit('activation style not found')
s = s.replace(needle, replacement, 1)
keyframes = '@keyframes orbActivate { 0% { transform: scale(.72); opacity: .42; filter: saturate(.2) blur(1px); } 58% { transform: scale(1.08); opacity: 1; filter: saturate(1.15) blur(0); } 78% { transform: scale(.97); } 100% { transform: scale(1); opacity: 1; filter: saturate(1) blur(0); } } @keyframes orbGlow { 0% { box-shadow: 0 0 0 0 #159bd500, 0 8px 19px #159bd500; } 35% { box-shadow: 0 0 0 8px #159bd526, 0 8px 28px #159bd570; } 100% { box-shadow: 0 8px 19px #159bd548; } } @keyframes orbStripIn { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } } '
s = s.replace('@keyframes rise {', keyframes + '@keyframes rise {', 1)
reduced = '@media (prefers-reduced-motion: reduce) { .participant-orb.is-active, .participant-orb.is-active .orb-top, .participant-orb.is-active .orb-center, .participant-orb.is-active .orb-orange, .participant-orb.is-active .orb-info { animation: none; } } '
s = s.replace('@media (max-width: 1000px)', reduced + '@media (max-width: 1000px)', 1)
p.write_text(s)
