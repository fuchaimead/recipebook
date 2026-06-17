// recipe-ui.jsx — icon set + shared primitives. Exports to window: Icon, Toast, Chip, ImagePlaceholder

// ── Line icon set (24×24 stroke glyphs) ───────────────────────
function Icon({ name, size = 22, stroke = 'currentColor', sw = 1.8, fill = 'none', style }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke,
    strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const P = {
    search:   <><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.6-3.6" /></>,
    plus:     <><path d="M12 5v14M5 12h14" /></>,
    back:     <><path d="M15 5l-7 7 7 7" /></>,
    x:        <><path d="M6 6l12 12M18 6L6 18" /></>,
    clock:    <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    users:    <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.2a3.2 3.2 0 010 5.8M17.5 19c0-2.2-1-3.8-2.4-4.7" /></>,
    copy:     <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M5.5 15.5A2 2 0 014 13.6V6a2 2 0 012-2h7.6A2 2 0 0115.5 5.5" /></>,
    share:    <><path d="M12 15V4" /><path d="M8.5 7.5L12 4l3.5 3.5" /><path d="M6 11.5H5.5A1.5 1.5 0 004 13v6a1.5 1.5 0 001.5 1.5h13A1.5 1.5 0 0020 19v-6a1.5 1.5 0 00-1.5-1.5H18" /></>,
    heart:    <><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.5 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.5 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z" /></>,
    list:     <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1.3" fill={stroke} stroke="none" /><circle cx="4" cy="12" r="1.3" fill={stroke} stroke="none" /><circle cx="4" cy="18" r="1.3" fill={stroke} stroke="none" /></>,
    grid:     <><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></>,
    camera:   <><path d="M3.5 8.5A2 2 0 015.5 6.5h1.2l1-1.8h4.6l1 1.8h1.2a2 2 0 012 2V17a2 2 0 01-2 2H5.5a2 2 0 01-2-2z" /><circle cx="10.5" cy="12.5" r="3" /></>,
    chevron:  <><path d="M9 6l6 6-6 6" /></>,
    scale:    <><path d="M12 4v16" /><path d="M7 7l-3.5 6h7L7 7zM17 7l-3.5 6h7L17 7z" /><path d="M5 20h14" /><path d="M9.5 7h5" /></>,
    book:     <><path d="M5 4.5h9a2 2 0 012 2V20l-5-2.2L6 20a1 1 0 01-1-1z" /></>,
    check:    <><path d="M5 12.5l4.5 4.5L19 7" /></>,
    home:     <><path d="M4 11l8-6.5 8 6.5" /><path d="M6 9.5V19h12V9.5" /></>,
    leaf:     <><path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 13.5" /><path d="M8 16c2.5-3.5 5.5-6 9-7.5" /></>,
    tag:      <><path d="M4 12.7V5.5A1.5 1.5 0 015.5 4h7.2a2 2 0 011.4.6l5.3 5.3a2 2 0 010 2.8l-6.9 6.9a2 2 0 01-2.8 0l-5.3-5.3A2 2 0 014 12.7z" /><circle cx="8.5" cy="8.5" r="1.2" fill={stroke} stroke="none" /></>,
    edit:     <><path d="M4 20h4l10-10a2.1 2.1 0 00-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></>,
    trash:    <><path d="M4 7h16" /><path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" /><path d="M6 7l1 12.5A1.5 1.5 0 008.5 21h7a1.5 1.5 0 001.5-1.5L18 7" /><path d="M10 11v6M14 11v6" /></>,
    settings: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3" /></>,
    sliders:  <><path d="M4 8h8M16 8h4" /><path d="M4 16h4M12 16h8" /><circle cx="14" cy="8" r="2.3" /><circle cx="10" cy="16" r="2.3" /></>,
    link:     <><path d="M9.5 14.5l5-5" /><path d="M8 11l-2 2a3.2 3.2 0 004.5 4.5l2-2" /><path d="M16 13l2-2a3.2 3.2 0 00-4.5-4.5l-2 2" /></>,
    download: <><path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M5 19h14" /></>,
    upload:   <><path d="M12 16V5" /><path d="M8 9l4-4 4 4" /><path d="M5 19h14" /></>,
    image:    <><rect x="3.5" y="5" width="17" height="14" rx="2.2" /><circle cx="8.5" cy="10" r="1.6" /><path d="M5 17l4.5-4 3 2.5L16 11l3 3.5" /></>,
    more:     <><circle cx="5" cy="12" r="1.4" fill={stroke} stroke="none" /><circle cx="12" cy="12" r="1.4" fill={stroke} stroke="none" /><circle cx="19" cy="12" r="1.4" fill={stroke} stroke="none" /></>,
    install:  <><rect x="6" y="3" width="12" height="18" rx="2.4" /><path d="M10.5 18h3" /></>,
  };
  return <svg {...common}>{P[name]}</svg>;
}

// ── Toast (auto-dismiss, bottom of phone) ─────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 46, transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px',
      borderRadius: 999, fontSize: 14.5, fontWeight: 600, zIndex: 200,
      boxShadow: '0 8px 24px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center',
      gap: 8, whiteSpace: 'nowrap', maxWidth: '88%', animation: 'toastIn .25s ease',
    }}>
      <Icon name="check" size={17} sw={2.4} />
      {msg}
    </div>
  );
}

// ── Category kicker (editorial eyebrow: dot + uppercase letterspaced) ──
function Kicker({ tint, children, color, size = 11 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: size, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase', color: color || 'var(--ink-mute)', lineHeight: 1, whiteSpace: 'nowrap' }}>
      {tint && <span style={{ width: 6, height: 6, borderRadius: 999, background: tint, flexShrink: 0 }} />}
      {children}
    </div>
  );
}

// ── Hairline rule ─────────────────────────────────────────────
function Rule({ strong, style }) {
  return <div style={{ height: 0, borderTop: `${strong ? 1 : 0.5}px solid ${strong ? 'var(--hair)' : 'var(--border)'}`, ...style }} />;
}

// ── Category chip (squared editorial filter) ──────────────────
function Chip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, cursor: 'pointer',
      padding: '7px 13px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
      fontFamily: 'inherit', letterSpacing: '-0.005em', transition: 'all .15s',
      background: active ? 'var(--primary)' : 'transparent',
      color: active ? 'var(--on-primary)' : 'var(--ink-soft)',
      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
    }}>
      {label}{count != null && <span style={{ opacity: .55, marginLeft: 6 }}>{count}</span>}
    </button>
  );
}

// ── Striped image placeholder (for "drop a photo here") ───────
function ImagePlaceholder({ label = 'photo', height = 150, radius = 'var(--r-lg)' }) {
  return (
    <div style={{
      height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: 'var(--surface-2)',
      backgroundImage: 'repeating-linear-gradient(45deg, var(--stripe) 0 1px, transparent 1px 11px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, border: '1.5px dashed var(--border-strong)', color: 'var(--ink-mute)',
    }}>
      <Icon name="camera" size={26} stroke="var(--ink-mute)" sw={1.6} />
      <span style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 11.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

Object.assign(window, { Icon, Toast, Chip, Kicker, Rule, ImagePlaceholder });
