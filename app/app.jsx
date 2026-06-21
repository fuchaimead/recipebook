// app.jsx — main controller: persistence, navigation, sharing/import, install.

const { useState, useEffect, useRef } = React;

const newId = () => 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);

function formToRecipe(form, base) {
  const ingredients = form.ingredients.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => ({ q: null, u: '', item: l.replace(/^[-•*•·]\s*/, '') }));
  const steps = form.steps.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => l.replace(/^(?:step\s*)?\d+\s*[.):-]\s*/i, ''));
  return {
    ...(base || {}),
    id: (base && base.id) || newId(),
    cat: form.cat, title: form.title.trim(),
    prep: form.prep.trim(), cook: form.cook.trim(), yield: form.yield.trim(), source: form.source.trim(),
    notes: form.notes.trim(), photo: form.photo || '',
    blurb: (base && base.blurb) || '',
    ingredients, steps,
    fav: (base && base.fav) || false,
    placeholder: false,
  };
}

const FAB_STYLE = {
  position: 'fixed', right: 'calc(var(--gutter, 0px) + 18px)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)',
  zIndex: 55, width: 58, height: 58, borderRadius: 999, border: 'none', cursor: 'pointer',
  background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 6px 18px var(--primary-glow), 0 2px 6px rgba(0,0,0,0.15)',
};

function ImportSheet({ recipe, onAdd, onCancel }) {
  const cat = CATEGORIES.find(c => c.id === recipe.cat);
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(20,18,16,0.42)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'toastIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: 'var(--bg)', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '14px 18px calc(env(safe-area-inset-bottom, 0px) + 22px)', boxShadow: '0 -12px 44px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <Kicker tint={catTint(recipe.cat).dot}>{cat ? cat.name : 'Shared recipe'}</Kicker>
        <h2 style={{ margin: '10px 0 6px', fontFamily: 'var(--serif)', fontSize: 27, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.012em', lineHeight: 1.08, textWrap: 'balance' }}>{recipe.title}</h2>
        <div style={{ fontSize: 13.5, color: 'var(--ink-mute)' }}>
          {(recipe.ingredients || []).length} ingredient{(recipe.ingredients || []).length === 1 ? '' : 's'} · {(recipe.steps || []).length} step{(recipe.steps || []).length === 1 ? '' : 's'}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '13px', borderRadius: 'var(--r-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-soft)' }}>Not now</button>
          <button onClick={onAdd} style={{ flex: 1.4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 'var(--r-md)', background: 'var(--primary)', border: 'none', color: 'var(--on-primary)' }}>Add to my book</button>
        </div>
      </div>
    </div>
  );
}

function App({ session }) {
  const userId = session.user.id;
  const [recipes, setRecipes] = useState(() => (loadCachedBook(userId) || {}).recipes || []);
  const [ideas, setIdeas] = useState(() => (loadCachedBook(userId) || {}).ideas || []);
  const [system, setSystem] = useState('us');
  const [syncing, setSyncing] = useState(true);
  const [screen, setScreen] = useState({ name: 'home' });
  const [stack, setStack] = useState([]);
  const [toast, setToast] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [installEvt, setInstallEvt] = useState(null);

  // Latest book + a dirty flag, so pull-on-focus never clobbers unsaved edits.
  const dirtyRef = useRef(false);
  const bookRef = useRef({ recipes, ideas });
  bookRef.current = { recipes, ideas };

  const showToast = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(''), 2400); };

  // ── Cloud sync ────────────────────────────────────────────────
  // Pull this user's book from Supabase on login; seed a brand-new account.
  useEffect(() => {
    let alive = true;
    (async () => {
      const book = await cloudLoadBook(userId); // {recipes,ideas,prefs} | null (none) | undefined (offline)
      if (!alive) return;
      if (book === undefined) { setSyncing(false); return; }      // offline → keep local cache
      if (book && Array.isArray(book.recipes)) {
        setRecipes(book.recipes);
        setIdeas(Array.isArray(book.ideas) ? book.ideas : []);
        if (book.prefs && book.prefs.units) setSystem(book.prefs.units);
      } else {
        const seedR = (typeof STARTER_RECIPES !== 'undefined' ? STARTER_RECIPES : SEED_RECIPES).map(r => ({ ...r }));   // new account → generic samples, not the family book
        const seedI = (typeof STARTER_IDEAS !== 'undefined' ? STARTER_IDEAS : []).map(i => ({ ...i }));
        setRecipes(seedR); setIdeas(seedI);
        cloudSaveBook(userId, { recipes: seedR, ideas: seedI, prefs: { units: system } });
      }
      setSyncing(false);
    })();
    return () => { alive = false; };
  }, [userId]);

  // Cache instantly, push to cloud (debounced) on any change.
  useEffect(() => {
    if (syncing) return;
    saveCachedBook(userId, { recipes, ideas });
    dirtyRef.current = true;
    clearTimeout(window.__cloudSave);
    window.__cloudSave = setTimeout(async () => {
      await cloudSaveBook(userId, { recipes, ideas, prefs: { units: system } });
      dirtyRef.current = false;
    }, 800);
  }, [recipes, ideas, system, syncing, userId]);

  // Pull-on-focus: when the app regains focus, re-fetch the shared book so a
  // partner's changes appear. Skips while syncing or when local edits are
  // pending (dirty), and no-ops when nothing changed — so it never clobbers.
  useEffect(() => {
    const pull = async () => {
      if (document.visibilityState !== 'visible') return;
      if (syncing || dirtyRef.current) return;
      const book = await cloudLoadBook(userId);
      if (!book || !Array.isArray(book.recipes)) return;
      const incoming = JSON.stringify({ r: book.recipes, i: book.ideas || [] });
      const current = JSON.stringify({ r: bookRef.current.recipes, i: bookRef.current.ideas });
      if (incoming === current) return;
      setRecipes(book.recipes);
      setIdeas(Array.isArray(book.ideas) ? book.ideas : []);
      if (book.prefs && book.prefs.units) setSystem(book.prefs.units);
    };
    document.addEventListener('visibilitychange', pull);
    window.addEventListener('focus', pull);
    return () => {
      document.removeEventListener('visibilitychange', pull);
      window.removeEventListener('focus', pull);
    };
  }, [syncing, userId]);

  // scroll → translucent bars
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); setScrolled(false); }, [screen]);

  // installable?
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  // import a recipe shared via link (#add=…)
  useEffect(() => {
    const tryHash = () => {
      const m = location.hash.match(/[#&]add=([^&]+)/);
      if (!m) return;
      const obj = decodeRecipeFromParam(m[1]);
      history.replaceState(null, '', location.pathname + location.search);
      if (obj) setPendingImport(obj); else showToast('That link could not be read');
    };
    tryHash();
    window.addEventListener('hashchange', tryHash);
    return () => window.removeEventListener('hashchange', tryHash);
  }, []);

  const go = (s) => { setStack(st => [...st, screen]); setScreen(s); };
  const back = () => setStack(st => {
    if (!st.length) { setScreen({ name: 'home' }); return st; }
    setScreen(st[st.length - 1]); return st.slice(0, -1);
  });
  const home = () => { setStack([]); setScreen({ name: 'home' }); };

  const toggleFav = (id) => setRecipes(rs => rs.map(r => r.id === id ? { ...r, fav: !r.fav } : r));

  const saveRecipeForm = (form) => {
    const editId = screen.editId;
    if (editId) {
      setRecipes(rs => rs.map(r => r.id === editId ? formToRecipe(form, r) : r));
      setStack([{ name: 'home' }]);
      setScreen({ name: 'recipe', recipeId: editId });
      showToast('Recipe updated');
    } else {
      const rec = formToRecipe(form);
      setRecipes(rs => [...rs, rec]);
      if (screen.fromIdea) setIdeas(xs => xs.filter(x => x.id !== screen.fromIdea));
      setStack([{ name: 'home' }]);
      setScreen({ name: 'recipe', recipeId: rec.id });
      showToast('Recipe added');
    }
  };

  const editRecipe = (r) => go({ name: 'add', editId: r.id });
  const deleteRecipe = (r) => {
    if (!window.confirm(`Delete "${r.title}"? This can't be undone.`)) return;
    setRecipes(rs => rs.filter(x => x.id !== r.id));
    home();
    showToast('Recipe deleted');
  };

  const importBackupFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arr = parseBackup(reader.result);
      if (!arr) { showToast('That file isn't a valid backup'); return; }
      if (!window.confirm(`Replace your library with ${arr.length} recipe(s) from this backup?`)) return;
      setRecipes(arr.map(r => ({ ...r, id: r.id || newId() })));
      home();
      showToast('Backup restored');
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const obj = pendingImport; setPendingImport(null);
    if (!obj) return;
    const rec = { ...obj, id: newId(), fav: false, placeholder: false };
    setRecipes(rs => [...rs, rec]);
    setStack([{ name: 'home' }]);
    setScreen({ name: 'recipe', recipeId: rec.id });
    showToast('Recipe added to your book');
  };

  const doInstall = async () => {
    if (!installEvt) { showToast('Open your browser menu → "Add to Home Screen"'); return; }
    installEvt.prompt();
    try { await installEvt.userChoice; } catch (e) {}
    setInstallEvt(null);
  };

  const handleSignOut = async () => { await cloudSignOut(); };

  // ── Recipe ideas ──
  const addIdea = (title, cat = '') => { setIdeas(xs => [{ id: 'i-' + Date.now(), title: title.trim(), note: '', cat }, ...xs]); showToast('Idea saved'); };
  const saveIdea = (idea) => setIdeas(xs => xs.map(x => x.id === idea.id ? idea : x));
  const deleteIdea = (id) => { setIdeas(xs => xs.filter(x => x.id !== id)); showToast('Idea removed'); };
  const promoteIdea = (idea) => go({ name: 'add', promote: { title: idea.title, cat: idea.cat || 'desserts', source: idea.note || '' }, fromIdea: idea.id });

  const counts = {};
  recipes.forEach(r => { counts[r.cat] = (counts[r.cat] || 0) + 1; });
  const curRecipe = screen.recipeId ? recipes.find(r => r.id === screen.recipeId) : null;
  const editInitial = screen.editId ? recipes.find(r => r.id === screen.editId) : (screen.promote || null);

  let bodyEl;
  if (screen.name === 'home')
    bodyEl = <HomeScreen layout="categories" recipes={recipes} counts={counts} ideas={ideas}
      onOpenCat={c => go({ name: 'category', catId: c })}
      onOpenRecipe={r => go({ name: 'recipe', recipeId: r.id })}
      onSearch={() => go({ name: 'search' })} onFav={toggleFav}
      onOpenSettings={() => go({ name: 'settings' })}
      onAddIdea={addIdea} onSaveIdea={saveIdea} onDeleteIdea={deleteIdea} onPromoteIdea={promoteIdea} />;
  else if (screen.name === 'category')
    bodyEl = <CategoryScreen catId={screen.catId} recipes={recipes} ideas={ideas} scrolled={scrolled}
      onBack={back} onOpenRecipe={r => go({ name: 'recipe', recipeId: r.id })} onFav={toggleFav}
      onAddIdea={addIdea} onSaveIdea={saveIdea} onDeleteIdea={deleteIdea} onPromoteIdea={promoteIdea} />;
  else if (screen.name === 'recipe' && curRecipe)
    bodyEl = <RecipeDetail r={curRecipe} system={system} setSystem={setSystem} scrolled={scrolled}
      onBack={back} onFav={toggleFav} onToast={showToast} onEdit={editRecipe} onDelete={deleteRecipe} />;
  else if (screen.name === 'search')
    bodyEl = <SearchScreen recipes={recipes} onBack={back} onOpenRecipe={r => go({ name: 'recipe', recipeId: r.id })} onFav={toggleFav} />;
  else if (screen.name === 'add')
    bodyEl = <AddScreen onBack={back} onSave={saveRecipeForm} onToast={showToast} initial={editInitial} />;
  else if (screen.name === 'settings')
    bodyEl = <SettingsScreen recipes={recipes} scrolled={scrolled} onBack={back} onImport={importBackupFile} onToast={showToast} canInstall={!!installEvt} onInstall={doInstall} userEmail={session.user.email} onSignOut={handleSignOut} />;
  else
    bodyEl = <HomeScreen layout="categories" recipes={recipes} counts={counts} ideas={ideas} onOpenCat={() => {}} onOpenRecipe={() => {}} onSearch={() => {}} onFav={toggleFav} onOpenSettings={() => go({ name: 'settings' })} onAddIdea={addIdea} onSaveIdea={saveIdea} onDeleteIdea={deleteIdea} onPromoteIdea={promoteIdea} />;

  const showFab = screen.name === 'home' || screen.name === 'category';

  return (
    <div style={{ minHeight: '100%', position: 'relative', background: 'var(--bg)', color: 'var(--ink)' }} key={screen.name + (screen.recipeId || screen.catId || screen.editId || '')}>
      {bodyEl}
      {showFab && (
        <button onClick={() => go({ name: 'add' })} aria-label="Add recipe" style={FAB_STYLE}>
          <Icon name="plus" size={26} sw={2.2} />
        </button>
      )}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 30px)', background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: 999, fontSize: 14.5, fontWeight: 600, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', maxWidth: '88%', animation: 'toastIn .25s ease' }}>
          <Icon name="check" size={17} sw={2.4} />{toast}
        </div>
      )}
      {pendingImport && <ImportSheet recipe={pendingImport} onAdd={confirmImport} onCancel={() => setPendingImport(null)} />}
    </div>
  );
}

function Root() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  useEffect(() => {
    let off;
    (async () => {
      setSession(await cloudGetSession());
      off = cloudOnAuth((s) => setSession(s));
    })();
    return () => { if (off) off(); };
  }, []);
  // hide splash once auth state is known
  useEffect(() => {
    if (session === undefined) return;
    const s = document.getElementById('splash');
    if (s) { s.style.opacity = '0'; setTimeout(() => s.remove(), 280); }
  }, [session]);

  if (session === undefined) return null;        // splash still covering screen
  if (!session) return <LoginScreen />;
  return <App key={session.user.id} session={session} />;
}

ReactDOM.createRoot(document.getElementById('app')).render(<Root />);
