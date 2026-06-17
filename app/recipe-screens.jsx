// recipe-screens.jsx — all screens & cards. Depends on Icon/Toast/Chip/ImagePlaceholder
// + data helpers (all on window). Exports: catTint, TopBar, RecipeCard, PlaceholderCard,
//   HomeScreen, CategoryScreen, SearchScreen, RecipeDetail, AddScreen, UnitToggle

// Subtle per-category accents — same chroma/lightness, varied hue (stays in the soft palette)
const CAT_TINT = {
  appetizers: { dot: 'oklch(0.62 0.09 145)', bg: 'oklch(0.95 0.035 145)', ink: 'oklch(0.42 0.07 145)' },
  breads:     { dot: 'oklch(0.66 0.09 80)',  bg: 'oklch(0.95 0.04 80)',   ink: 'oklch(0.45 0.07 80)' },
  mains:      { dot: 'oklch(0.6 0.11 35)',   bg: 'oklch(0.95 0.04 35)',   ink: 'oklch(0.44 0.09 35)' },
  soups:      { dot: 'oklch(0.62 0.08 230)', bg: 'oklch(0.95 0.03 230)',  ink: 'oklch(0.43 0.06 230)' },
  desserts:   { dot: 'oklch(0.62 0.1 350)',  bg: 'oklch(0.95 0.035 350)', ink: 'oklch(0.45 0.09 350)' },
};
const catTint = (id) => CAT_TINT[id] || CAT_TINT.appetizers;

// ── Sticky top bar (clears the status bar) ────────────────────
function TopBar({ title, onBack, right, scrolled }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
      background: scrolled ? 'var(--bar-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '0.5px solid var(--border)' : '0.5px solid transparent',
      transition: 'background .2s, border-color .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 10px', minHeight: 44 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back" style={{
            width: 38, height: 38, borderRadius: 999, cursor: 'pointer',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', flexShrink: 0,
          }}><Icon name="back" size={20} /></button>
        )}
        <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: 'var(--ink)', opacity: scrolled ? 1 : 0, transition: 'opacity .2s', letterSpacing: '-0.02em', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{right}</div>
      </div>
    </div>
  );
}

function HeartBtn({ on, onClick, size = 36 }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label="Favorite" style={{
      width: size, height: size, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: on ? 'var(--heart)' : 'var(--ink-mute)', transition: 'color .15s, transform .1s',
    }}><Icon name="heart" size={size * 0.52} fill={on ? 'var(--heart)' : 'none'} /></button>
  );
}

// ── Cards ─────────────────────────────────────────────────────
function MetaRow({ r, small }) {
  const fs = small ? 12 : 13;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: 'var(--ink-mute)', fontSize: fs, fontWeight: 500 }}>
      {r.total ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={fs + 2} sw={1.7} />{r.total}</span>
      ) : r.cook ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={fs + 2} sw={1.7} />{r.cook}</span>
      ) : null}
      {r.yield && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="users" size={fs + 2} sw={1.7} />{r.yield}</span>}
    </div>
  );
}

function RecipeCard({ r, onOpen, onFav }) {
  const t = catTint(r.cat);
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(r)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(r); }} style={{
      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      padding: 18, fontFamily: 'inherit', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <Kicker tint={t.dot}>{CATEGORIES.find(c => c.id === r.cat)?.name}</Kicker>
        <HeartBtn on={r.fav} onClick={() => onFav(r.id)} size={32} />
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', marginTop: 9, lineHeight: 1.12, textWrap: 'balance' }}>{r.title}</div>
      {r.blurb && <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.45, textWrap: 'pretty' }}>{r.blurb}</div>}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}><MetaRow r={r} /></div>
    </div>
  );
}

function PlaceholderCard({ r, onOpen }) {
  const t = catTint(r.cat);
  return (
    <button onClick={() => onOpen(r)} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'var(--surface)', border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--r-lg)',
      padding: 16, fontFamily: 'inherit',
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', flexShrink: 0, background: 'var(--surface-2)', color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
        <Icon name="camera" size={22} sw={1.7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{r.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace', textTransform: 'uppercase', letterSpacing: '0.03em' }}>To add · tap to fill in</div>
      </div>
      <Icon name="chevron" size={18} stroke="var(--ink-mute)" />
    </button>
  );
}

// ── Compact list row + group (modern list view) ───────────────
function RowGroup({ children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
      {children}
    </div>
  );
}

function RecipeRow({ r, onOpen, onFav, divider, showCat }) {
  const t = catTint(r.cat);
  const cat = CATEGORIES.find(c => c.id === r.cat);
  const rowBase = {
    display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
    padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
    borderTop: divider ? '0.5px solid var(--border)' : 'none', background: 'transparent',
  };
  if (r.placeholder) {
    return (
      <div role="button" tabIndex={0} onClick={() => onOpen(r)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(r); }} style={rowBase}>
        <span style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', flexShrink: 0, background: 'var(--surface-2)', color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
          <Icon name="camera" size={17} sw={1.7} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 1, fontWeight: 600, fontFamily: 'ui-monospace, Menlo, monospace', textTransform: 'uppercase', letterSpacing: '0.03em' }}>To add · tap to fill in</div>
        </div>
        <Icon name="chevron" size={17} stroke="var(--ink-mute)" />
      </div>
    );
  }
  const meta = [showCat ? cat?.name : null, r.total || r.cook, r.yield].filter(Boolean).join('  ·  ');
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(r)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(r); }} style={rowBase}>
      {r.photo
        ? <img src={r.photo} alt="" style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
        : <span style={{ width: 10, height: 10, borderRadius: 999, background: t.dot, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
        {meta && <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</div>}
      </div>
      <HeartBtn on={r.fav} onClick={() => onFav(r.id)} size={30} />
    </div>
  );
}

function SearchPill({ onClick, placeholder = 'Search recipes & ingredients' }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer',
      background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
      padding: '13px 15px', color: 'var(--ink-mute)', fontFamily: 'inherit', fontSize: 15,
    }}>
      <Icon name="search" size={19} stroke="var(--ink-mute)" /> {placeholder}
    </button>
  );
}

// ── HOME — three layouts ──────────────────────────────────────
function SectionLabel({ children, action }) {
  return (
    <div style={{ margin: '6px 2px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 8, borderBottom: '1px solid var(--hair)' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>{children}</div>
        {action}
      </div>
    </div>
  );
}

// ── Recipe ideas ─ jot a title, edit/delete later, promote to a full recipe ─
const ideaInput = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15.5,
  color: 'var(--ink)', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', padding: '11px 13px', outline: 'none',
};

function IdeaQuickAdd({ onAdd }) {
  const [v, setV] = React.useState('');
  const add = () => { const t = v.trim(); if (!t) return; onAdd(t); setV(''); };
  return (
    <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: 'flex', gap: 8 }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Jot down a recipe to add later…"
        style={{ ...ideaInput, flex: 1, borderStyle: 'dashed', borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }} />
      <button type="submit" aria-label="Add idea" disabled={!v.trim()} style={{
        flexShrink: 0, width: 46, borderRadius: 'var(--r-md)', border: 'none', cursor: v.trim() ? 'pointer' : 'default',
        background: 'var(--primary)', color: 'var(--on-primary)', opacity: v.trim() ? 1 : 0.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name="plus" size={22} sw={2.2} /></button>
    </form>
  );
}

function IdeaRow({ idea, onSave, onDelete, onPromote }) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(idea.title);
  const [note, setNote] = React.useState(idea.note || '');
  const [cat, setCat] = React.useState(idea.cat || '');
  React.useEffect(() => { setTitle(idea.title); setNote(idea.note || ''); setCat(idea.cat || ''); }, [idea.id]);

  if (editing) {
    const save = () => { const t = title.trim(); if (!t) return; onSave({ ...idea, title: t, note: note.trim(), cat }); setEditing(false); };
    return (
      <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--r-lg)', background: 'var(--surface)', padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recipe title" style={ideaInput} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note — where it's from, a reminder (optional)" style={{ ...ideaInput, fontSize: 14 }} />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <Chip label="No category" active={!cat} onClick={() => setCat('')} />
          {CATEGORIES.map(c => <Chip key={c.id} label={c.name} active={cat === c.id} onClick={() => setCat(c.id)} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <button onClick={save} disabled={!title.trim()} style={{ border: 'none', cursor: title.trim() ? 'pointer' : 'default', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, padding: '10px 18px', borderRadius: 'var(--r-md)', background: 'var(--primary)', color: 'var(--on-primary)', opacity: title.trim() ? 1 : 0.5 }}>Save</button>
          <button onClick={() => { setTitle(idea.title); setNote(idea.note || ''); setCat(idea.cat || ''); setEditing(false); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: 'var(--ink-mute)' }}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => onDelete(idea.id)} aria-label="Delete idea" style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13.5, color: 'var(--heart)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="x" size={15} sw={2.2} />Delete</button>
        </div>
        <button onClick={() => onPromote(idea)} style={{ border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: 'var(--primary)', padding: '11px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="book" size={17} sw={1.8} /> Turn into a full recipe
        </button>
      </div>
    );
  }

  const t = idea.cat ? catTint(idea.cat) : null;
  const catName = idea.cat ? CATEGORIES.find(c => c.id === idea.cat)?.name : null;
  return (
    <div role="button" tabIndex={0} onClick={() => setEditing(true)} onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '13px 15px',
    }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, flexShrink: 0, background: t ? t.dot : 'var(--border-strong)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idea.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {[catName, idea.note].filter(Boolean).join('  ·  ') || 'Tap to edit'}
        </div>
      </div>
      <Icon name="chevron" size={17} stroke="var(--ink-mute)" />
    </div>
  );
}

function IdeasSection({ ideas, onAdd, onSave, onDelete, onPromote, label = 'Recipe ideas' }) {
  return (
    <>
      <SectionLabel action={ideas.length > 0 ? <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{ideas.length}</span> : null}>{label}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <IdeaQuickAdd onAdd={onAdd} />
        {ideas.length === 0
          ? <div style={{ color: 'var(--ink-mute)', fontSize: 13.5, lineHeight: 1.5, padding: '4px 2px', textWrap: 'pretty' }}>Nothing jotted yet. Add a title above and fill in the details whenever you get a minute.</div>
          : ideas.map(idea => <IdeaRow key={idea.id} idea={idea} onSave={onSave} onDelete={onDelete} onPromote={onPromote} />)}
      </div>
    </>
  );
}

function HomeScreen({ layout, recipes, counts, ideas, onOpenCat, onOpenRecipe, onSearch, onFav, onOpenSettings, onAddIdea, onSaveIdea, onDeleteIdea, onPromoteIdea }) {
  const [listFilter, setListFilter] = React.useState('all');
  const real = recipes.filter(r => !r.placeholder);
  const favs = real.filter(r => r.fav);
  const placeholders = recipes.filter(r => r.placeholder);
  const recent = real.slice().reverse();

  const bigTitle = (
    <div style={{ padding: '2px 2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--hair)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="bestEats-mark.svg" alt="" width="22" height="22" style={{ borderRadius: 6, display: 'block', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Best<span style={{ fontStyle: 'italic', fontWeight: 500 }}>Eats</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{real.length} recipes</div>
          <button onClick={onOpenSettings} aria-label="Settings" style={{ width: 34, height: 34, borderRadius: 999, cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', flexShrink: 0 }}><Icon name="sliders" size={18} /></button>
        </div>
      </div>
      <h1 style={{ margin: '16px 0 2px', fontFamily: 'var(--serif)', fontSize: 35, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1, textWrap: 'balance' }}>
        {layout === 'recent' ? 'Welcome back' : layout === 'list' ? 'All recipes' : 'What are we making?'}
      </h1>
    </div>
  );

  // Layout A — browse by category
  const categoriesGrid = (
    <>
      <SectionLabel>Categories</SectionLabel>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {CATEGORIES.map((c, i) => {
          const t = catTint(c.id);
          return (
            <button key={c.id} onClick={() => onOpenCat(c.id)} style={{
              display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '15px 4px',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600, color: 'var(--ink-mute)', width: 20, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: t.dot, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{c.name}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{counts[c.id] || 0}</span>
              <Icon name="chevron" size={16} stroke="var(--ink-mute)" />
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 16px calc(env(safe-area-inset-bottom, 0px) + 128px)' }}>
      {bigTitle}
      <SearchPill onClick={onSearch} />

      {layout === 'categories' && (
        <>
          {categoriesGrid}
          {favs.length > 0 && (
            <>
              <SectionLabel>Favorites</SectionLabel>
              <RowGroup>
                {favs.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpenRecipe} onFav={onFav} divider={i > 0} showCat />)}
              </RowGroup>
            </>
          )}
        </>
      )}

      {layout === 'list' && (() => {
        const shown = recipes.filter(r => listFilter === 'all' || r.cat === listFilter);
        return (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 2px' }}>
              <Chip label="All" active={listFilter === 'all'} onClick={() => setListFilter('all')} count={recipes.length} />
              {CATEGORIES.map(c => <Chip key={c.id} label={c.name} active={listFilter === c.id} onClick={() => setListFilter(c.id)} count={counts[c.id] || 0} />)}
            </div>
            {shown.length === 0
              ? <div style={{ color: 'var(--ink-mute)', textAlign: 'center', padding: 30, fontSize: 15 }}>Nothing here yet.</div>
              : <RowGroup>{shown.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpenRecipe} onFav={onFav} divider={i > 0} showCat={listFilter === 'all'} />)}</RowGroup>}
          </>
        );
      })()}

      {layout === 'recent' && (
        <>
          {favs.length > 0 && (
            <>
              <SectionLabel>Favorites</SectionLabel>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px', scrollSnapType: 'x mandatory' }}>
                {favs.map(r => {
                  const t = catTint(r.cat);
                  return (
                    <button key={r.id} onClick={() => onOpenRecipe(r)} style={{
                      flexShrink: 0, width: 210, scrollSnapAlign: 'start', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16,
                    }}>
                      <Kicker tint={t.dot}>{CATEGORIES.find(c => c.id === r.cat)?.name}</Kicker>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.12, marginTop: 10, minHeight: 44, textWrap: 'balance' }}>{r.title}</div>
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}><MetaRow r={r} small /></div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <SectionLabel>Browse by category</SectionLabel>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {CATEGORIES.map((c, i) => {
              const t = catTint(c.id);
              return (
                <button key={c.id} onClick={() => onOpenCat(c.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '14px 4px',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: t.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontWeight: 500, marginTop: 3 }}>{c.blurb}</div>
                  </div>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-mute)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{counts[c.id] || 0}</span>
                  <Icon name="chevron" size={16} stroke="var(--ink-mute)" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {layout !== 'list' && placeholders.length > 0 && (
        <>
          <SectionLabel>To upload later</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {placeholders.map(r => <PlaceholderCard key={r.id} r={r} onOpen={onOpenRecipe} />)}
          </div>
        </>
      )}

      <IdeasSection ideas={ideas || []} onAdd={onAddIdea} onSave={onSaveIdea} onDelete={onDeleteIdea} onPromote={onPromoteIdea} />
    </div>
  );
}

// ── CATEGORY ──────────────────────────────────────────────────
function CategoryScreen({ catId, recipes, ideas, onBack, onOpenRecipe, onFav, scrolled, onAddIdea, onSaveIdea, onDeleteIdea, onPromoteIdea }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const list = recipes.filter(r => r.cat === catId);
  const real = list.filter(r => !r.placeholder);
  const ph = list.filter(r => r.placeholder);
  const ideasAll = (ideas || []).filter(i => i.cat === catId);
  const t = catTint(catId);
  return (
    <>
      <TopBar title={cat.name} onBack={onBack} scrolled={scrolled} />
      <div style={{ padding: '0 16px calc(env(safe-area-inset-bottom, 0px) + 120px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '2px 2px 6px' }}>
          <Kicker tint={t.dot}>{list.length} recipe{list.length === 1 ? '' : 's'}{ideasAll.length ? `  ·  ${ideasAll.length} idea${ideasAll.length === 1 ? '' : 's'}` : ''}</Kicker>
          <h1 style={{ margin: '12px 0 4px', fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.05 }}>{cat.name}</h1>
          <div style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{cat.blurb}</div>
        </div>
        {list.length > 0 && (
          <RowGroup>
            {list.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpenRecipe} onFav={onFav} divider={i > 0} />)}
          </RowGroup>
        )}
        <IdeasSection label="Recipe ideas" ideas={ideasAll}
          onAdd={(title) => onAddIdea(title, catId)} onSave={onSaveIdea} onDelete={onDeleteIdea} onPromote={onPromoteIdea} />
      </div>
    </>
  );
}

// ── SEARCH ────────────────────────────────────────────────────
function SearchScreen({ recipes, onBack, onOpenRecipe, onFav }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 250); return () => clearTimeout(t); }, []);
  const query = q.trim().toLowerCase();
  const results = !query ? [] : recipes.filter(r => {
    const hay = [r.title, r.blurb, r.source, CATEGORIES.find(c => c.id === r.cat)?.name,
      ...(r.ingredients || []).map(i => i.item)].join(' ').toLowerCase();
    return hay.includes(query);
  });
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)', background: 'var(--bar-bg)', backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 12px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
            <Icon name="search" size={19} stroke="var(--ink-mute)" />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes & ingredients"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)' }} />
            {q && <button onClick={() => setQ('')} aria-label="Clear" style={{ border: 'none', background: 'var(--border-strong)', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--surface)' }}><Icon name="x" size={13} sw={2.4} /></button>}
          </div>
          <button onClick={onBack} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 15.5, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        </div>
      </div>
      <div style={{ padding: '14px 16px calc(env(safe-area-inset-bottom, 0px) + 120px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!query && (
          <div style={{ textAlign: 'center', color: 'var(--ink-mute)', paddingTop: 50 }}>
            <Icon name="search" size={40} stroke="var(--border-strong)" sw={1.5} />
            <div style={{ marginTop: 14, fontSize: 15 }}>Search by name, ingredient,<br />category or source.</div>
          </div>
        )}
        {query && results.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-mute)', paddingTop: 50, fontSize: 15 }}>No matches for “{q}”.</div>
        )}
        {results.length > 0 && <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600 }}>{results.length} result{results.length === 1 ? '' : 's'}</div>}
        {results.length > 0 && (
          <RowGroup>
            {results.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpenRecipe} onFav={onFav} divider={i > 0} showCat />)}
          </RowGroup>
        )}
      </div>
    </>
  );
}

function UnitToggle({ system, setSystem }) {
  const opts = [['us', 'US cups'], ['metric', 'Metric · g']];
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: 3, gap: 2 }}>
      {opts.map(([v, label]) => (
        <button key={v} onClick={() => setSystem(v)} style={{
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
          padding: '6px 13px', borderRadius: 999, whiteSpace: 'nowrap',
          background: system === v ? 'var(--surface)' : 'transparent',
          color: system === v ? 'var(--primary)' : 'var(--ink-mute)',
          boxShadow: system === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}>{label}</button>
      ))}
    </div>
  );
}

// ── SETTINGS (backup / install / about) ───────────────────────
function SettingsScreen({ recipes, onBack, onImport, onToast, canInstall, onInstall, scrolled, userEmail, onSignOut }) {
  const fileRef = React.useRef(null);
  const count = recipes.filter(r => !r.placeholder).length;
  const Btn = ({ icon, label, onClick, primary }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '13px', borderRadius: 'var(--r-md)',
      background: primary ? 'var(--primary)' : 'var(--surface)', color: primary ? 'var(--on-primary)' : 'var(--ink)',
      border: primary ? 'none' : '1px solid var(--border)',
    }}><Icon name={icon} size={19} sw={1.9} />{label}</button>
  );
  return (
    <>
      <TopBar title="Settings" onBack={onBack} scrolled={scrolled} />
      <div style={{ padding: '0 16px calc(env(safe-area-inset-bottom, 0px) + 60px)' }}>
        <div style={{ padding: '2px 2px 6px' }}>
          <Kicker>Your library</Kicker>
          <h1 style={{ margin: '12px 0 4px', fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em' }}>Settings</h1>
          <div style={{ fontSize: 14.5, color: 'var(--ink-soft)' }}>{count} recipe{count === 1 ? '' : 's'} in your collection, synced to your account.</div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Account</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '13px 15px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Signed in</div>
              <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            </div>
            <button onClick={onSignOut} style={{ flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, padding: '9px 14px', borderRadius: 'var(--r-md)', background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--ink-soft)' }}>Sign out</button>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Backup</SectionLabel>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '12px 2px 14px', textWrap: 'pretty' }}>
            Your recipes sync to your account automatically. Export a backup file for extra safety, or to hand the whole collection to someone else.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn icon="download" label="Export backup (.json)" primary onClick={() => { exportBackup(recipes); onToast('Backup downloaded'); }} />
            <Btn icon="upload" label="Restore from backup" onClick={() => fileRef.current && fileRef.current.click()} />
            <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files[0]; if (f) onImport(f); e.target.value = ''; }} />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel>Install</SectionLabel>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '12px 2px 14px', textWrap: 'pretty' }}>
            Add BestEats to your home screen for a full-screen app that works offline.
          </p>
          {canInstall
            ? <Btn icon="install" label="Add to home screen" onClick={onInstall} />
            : <div style={{ fontSize: 13.5, color: 'var(--ink-mute)', lineHeight: 1.65, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '13px 15px' }}>
                On iPhone &amp; iPad: tap the <strong style={{ color: 'var(--ink-soft)' }}>Share</strong> button in Safari, then <strong style={{ color: 'var(--ink-soft)' }}>Add to Home Screen</strong>.
              </div>}
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel>About</SectionLabel>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-mute)', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>BestEats · v1.0</div>
            <div>Your collection of tried-and-true recipes worth keeping — synced privately to your account and available offline on this device.</div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { catTint, TopBar, HeartBtn, MetaRow, RecipeCard, PlaceholderCard, RecipeRow, RowGroup, SearchPill, SectionLabel, HomeScreen, CategoryScreen, SearchScreen, SettingsScreen, UnitToggle });
