// recipe-detail.jsx — RecipeDetail + AddScreen (real app). Depends on window globals.

const SECONDARY_BTN = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, padding: '11px 6px', borderRadius: 'var(--r-md)',
  background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-soft)', whiteSpace: 'nowrap',
};

function ActionBtn({ icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
      border: primary ? 'none' : '1px solid var(--border)', fontFamily: 'inherit', padding: '14px 4px', borderRadius: 'var(--r-md)',
      background: primary ? 'var(--primary)' : 'var(--surface)',
      color: primary ? 'var(--on-primary)' : 'var(--ink)',
    }}>
      <Icon name={icon} size={19} sw={1.9} />
      <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

function RecipeDetail({ r, system, setSystem, onBack, onFav, onToast, scrolled, onEdit, onDelete }) {
  const [checked, setChecked] = React.useState({});
  const t = catTint(r.cat);
  const cat = CATEGORIES.find(c => c.id === r.cat);

  const shareText = async () => {
    const text = recipeToText(r, system);
    if (navigator.share) { try { await navigator.share({ title: r.title, text }); return; } catch (e) {} }
    try { await navigator.clipboard.writeText(text); onToast('Copied — ready to paste & send'); } catch (e) { onToast('Could not copy'); }
  };
  const shareLink = async () => {
    const url = location.origin + location.pathname + '#add=' + encodeRecipeToParam(r);
    if (navigator.share) { try { await navigator.share({ title: r.title, text: `${r.title} — open in Recipe Book`, url }); return; } catch (e) {} }
    try { await navigator.clipboard.writeText(url); onToast('Import link copied'); } catch (e) { onToast('Could not copy link'); }
  };

  // ── Placeholder (to-fill-in) detail ──
  if (r.placeholder) {
    return (
      <>
        <TopBar title={r.title} onBack={onBack} scrolled={scrolled} />
        <div style={{ padding: '4px 16px calc(env(safe-area-inset-bottom, 0px) + 60px)' }}>
          <Kicker tint={t.dot}>{cat?.name}</Kicker>
          <h1 style={{ margin: '12px 0 6px', fontFamily: 'var(--serif)', fontSize: 33, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.08, textWrap: 'balance' }}>{r.title}</h1>
          {r.source && <div style={{ fontSize: 14, color: 'var(--ink-mute)', marginBottom: 18, fontStyle: 'italic' }}>From: {r.source}</div>}
          <ImagePlaceholder label="add a photo of the card" height={170} />
          <div style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 22, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>This one&rsquo;s on the to-do list</div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 7, lineHeight: 1.5, textWrap: 'pretty' }}>You saved a spot for it. Add the ingredients and method whenever you&rsquo;re ready.</div>
            <button onClick={() => onEdit(r)} style={{ marginTop: 18, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, fontSize: 14.5, padding: '12px 22px', borderRadius: 'var(--r-md)' }}>Add the details</button>
          </div>
          <div style={{ marginTop: 22 }}>
            <button onClick={() => onDelete(r)} style={{ ...SECONDARY_BTN, color: 'var(--heart)', width: '100%', flex: 'none' }}>
              <Icon name="trash" size={17} sw={1.9} /> Delete
            </button>
          </div>
        </div>
      </>
    );
  }

  const ings = r.ingredients || [];
  return (
    <>
      <TopBar title={r.title} onBack={onBack} scrolled={scrolled}
        right={<HeartBtn on={r.fav} onClick={() => onFav(r.id)} />} />
      <div style={{ padding: '2px 16px calc(env(safe-area-inset-bottom, 0px) + 150px)' }}>
        {/* header */}
        <Kicker tint={t.dot}>{cat?.name}</Kicker>
        <h1 style={{ margin: '12px 0 8px', fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.018em', lineHeight: 1.04, textWrap: 'balance' }}>{r.title}</h1>
        {r.blurb && <p style={{ margin: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.45, textWrap: 'pretty' }}>{r.blurb}</p>}

        {/* photo */}
        {r.photo && (
          <img src={r.photo} alt={r.title} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginTop: 18, display: 'block' }} />
        )}

        {/* meta strip */}
        <div style={{ display: 'flex', marginTop: 18, borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)' }}>
          {[['Prep', r.prep], ['Cook', r.cook], ['Yield', r.yield]].filter(x => x[1]).map(([lab, val], i) => (
            <div key={i} style={{ flex: 1, padding: '11px 6px 12px', borderLeft: i ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{lab}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginTop: 4, lineHeight: 1.1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* ingredients */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Ingredients</h2>
          {ings.some(i => i.q != null) && <UnitToggle system={system} setSystem={setSystem} />}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {ings.map((ing, i) => {
            const on = checked[i];
            const { amount, unit } = convertIng(ing, system);
            const head = [amount, unit].filter(Boolean).join('\u2009');
            return (
              <button key={i} onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                background: 'transparent', border: 'none', borderTop: i ? '0.5px solid var(--border)' : 'none', padding: '13px 16px',
              }}>
                <span style={{ width: 21, height: 21, borderRadius: 6, flexShrink: 0, marginTop: 1, border: on ? 'none' : '1.5px solid var(--border-strong)', background: on ? 'var(--primary)' : 'transparent', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>
                  {on && <Icon name="check" size={14} sw={3} />}
                </span>
                <span style={{ flex: 1, fontSize: 15.5, lineHeight: 1.4, color: on ? 'var(--ink-mute)' : 'var(--ink)', textDecoration: on ? 'line-through' : 'none' }}>
                  {head && <strong style={{ fontWeight: 700, color: on ? 'var(--ink-mute)' : 'var(--primary-deep)', marginRight: 7, whiteSpace: 'nowrap' }}>{head}</strong>}
                  <span>{ing.item}{ing.note ? <span style={{ color: 'var(--ink-mute)' }}>, {ing.note}</span> : ''}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(ingredientsToText(r, system)); onToast('Ingredients copied — paste into your list'); }}
          style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '11px', color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14 }}>
          <Icon name="copy" size={17} /> Copy ingredients as a shopping list
        </button>

        {/* method */}
        <h2 style={{ margin: '30px 0 16px', fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Method</h2>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
          {(r.steps || []).map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: 16, padding: '15px 0', borderTop: i ? '0.5px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, lineHeight: 1, color: 'var(--primary)', flexShrink: 0, width: 30, fontVariantNumeric: 'tabular-nums', paddingTop: 1 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink)', textWrap: 'pretty' }}>{convertText(s, system)}</span>
            </li>
          ))}
        </ol>

        {/* notes */}
        {r.notes && (
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--hair)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 9 }}>Notes &amp; tips</div>
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', lineHeight: 1.55, color: 'var(--ink-soft)', textWrap: 'pretty' }}>{r.notes}</p>
          </div>
        )}

        {r.source && <div style={{ marginTop: 22, fontSize: 13.5, color: 'var(--ink-mute)', fontStyle: 'italic' }}>Source · {r.source}</div>}

        {/* manage row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          <button onClick={() => onEdit(r)} style={SECONDARY_BTN}><Icon name="edit" size={17} sw={1.9} /> Edit</button>
          <button onClick={shareLink} style={SECONDARY_BTN}><Icon name="link" size={17} sw={1.9} /> Share link</button>
          <button onClick={() => onDelete(r)} style={{ ...SECONDARY_BTN, color: 'var(--heart)' }}><Icon name="trash" size={17} sw={1.9} /> Delete</button>
        </div>
      </div>

      {/* sticky action bar */}
      <div style={{ position: 'fixed', left: 'var(--gutter, 0px)', right: 'var(--gutter, 0px)', bottom: 0, padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)', display: 'flex', gap: 10, background: 'linear-gradient(to top, var(--bg) 68%, transparent)', zIndex: 40 }}>
        <ActionBtn icon="copy" label="Copy recipe" primary onClick={() => { navigator.clipboard?.writeText(recipeToText(r, system)); onToast('Recipe copied to clipboard'); }} />
        <ActionBtn icon="share" label="Share" onClick={shareText} />
      </div>
    </>
  );
}

// ── ADD / EDIT RECIPE ─────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 7, letterSpacing: '-0.01em' }}>{label}{hint && <span style={{ color: 'var(--ink-mute)', fontWeight: 500 }}>  ·  {hint}</span>}</div>
      {children}
    </label>
  );
}
const inputStyle = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16,
  color: 'var(--ink)', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', padding: '13px 14px', outline: 'none', resize: 'none',
};
const linkBtnStyle = { border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' };

function ingToLine(i) {
  const amt = [i.q != null ? i.q : '', i.u || ''].filter(Boolean).join(' ');
  return ([amt, i.item].filter(Boolean).join(' ') + (i.note ? ', ' + i.note : '')).trim();
}
function recipeToForm(r) {
  return {
    title: r.title || '', cat: r.cat || 'desserts', prep: r.prep || '', cook: r.cook || '', yield: r.yield || '',
    source: r.source || '', notes: r.notes || '', photo: r.photo || '',
    ingredients: (r.ingredients || []).map(ingToLine).join('\n'),
    steps: (r.steps || []).join('\n'),
  };
}
const BLANK_FORM = { title: '', cat: 'desserts', prep: '', cook: '', yield: '', source: '', ingredients: '', steps: '', notes: '', photo: '' };

function AddScreen({ onBack, onSave, onToast, initial }) {
  const editing = !!(initial && !initial.placeholder && (initial.ingredients || initial.steps));
  const [f, setF] = React.useState(() => initial ? { ...BLANK_FORM, ...recipeToForm(initial) } : { ...BLANK_FORM });
  const photoRef = React.useRef(null);
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const canSave = f.title.trim().length > 0;

  const onPhoto = async (e) => {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    try { const data = await resizeImage(file); setF(s => ({ ...s, photo: data })); }
    catch (err) { onToast('Could not read that image'); }
  };

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)', background: 'var(--bar-bg)', backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'none', color: 'var(--ink-soft)', fontWeight: 500, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{editing ? 'Edit recipe' : 'New recipe'}</div>
          <button disabled={!canSave} onClick={() => onSave(f)} style={{ border: 'none', background: 'none', color: canSave ? 'var(--primary)' : 'var(--ink-mute)', fontWeight: 700, fontSize: 16, cursor: canSave ? 'pointer' : 'default', fontFamily: 'inherit', opacity: canSave ? 1 : 0.5 }}>Save</button>
        </div>
      </div>
      <div style={{ padding: '16px 16px calc(env(safe-area-inset-bottom, 0px) + 90px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" onClick={() => photoRef.current && photoRef.current.click()} style={{
            width: 66, height: 66, borderRadius: 'var(--r-md)', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', padding: 0,
            border: f.photo ? '1px solid var(--border)' : '1.5px dashed var(--border-strong)', background: 'var(--surface-2)', color: 'var(--ink-mute)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
          }}>{f.photo ? <img src={f.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="camera" size={24} sw={1.7} />}</button>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink-soft)' }}>{f.photo ? 'Photo added' : 'Add a photo'}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
              <button type="button" onClick={() => photoRef.current && photoRef.current.click()} style={linkBtnStyle}>{f.photo ? 'Replace' : 'Choose photo'}</button>
              {f.photo && <button type="button" onClick={() => setF(s => ({ ...s, photo: '' }))} style={{ ...linkBtnStyle, color: 'var(--ink-mute)' }}>Remove</button>}
            </div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhoto} />
        </div>
        <Field label="Title"><input value={f.title} onChange={set('title')} placeholder="e.g. Olive oil banana bread" style={inputStyle} /></Field>
        <Field label="Category">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => <Chip key={c.id} label={c.name} active={f.cat === c.id} onClick={() => setF(s => ({ ...s, cat: c.id }))} />)}
          </div>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Prep"><input value={f.prep} onChange={set('prep')} placeholder="15 min" style={inputStyle} /></Field>
          <Field label="Cook"><input value={f.cook} onChange={set('cook')} placeholder="30 min" style={inputStyle} /></Field>
          <Field label="Yield"><input value={f.yield} onChange={set('yield')} placeholder="Serves 4" style={inputStyle} /></Field>
        </div>
        <Field label="Ingredients" hint="one per line"><textarea value={f.ingredients} onChange={set('ingredients')} rows={6} placeholder={'2 cups flour\n1 tsp salt\n…'} style={inputStyle} /></Field>
        <Field label="Method" hint="one step per line · auto-numbered"><textarea value={f.steps} onChange={set('steps')} rows={6} placeholder={'Preheat the oven…\nMix the dry ingredients…'} style={inputStyle} /></Field>
        <Field label="Notes & tips" hint="optional"><textarea value={f.notes} onChange={set('notes')} rows={2} placeholder="What makes it work" style={inputStyle} /></Field>
        <Field label="Source" hint="optional"><input value={f.source} onChange={set('source')} placeholder="Where it came from" style={inputStyle} /></Field>
        <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', textAlign: 'center', lineHeight: 1.5 }}>Saved on this device. Paste an ingredients block and a steps block — numbers and bullets are tidied automatically.</div>
      </div>
    </>
  );
}

Object.assign(window, { RecipeDetail, AddScreen });
