// cloud.jsx — Supabase auth + per-user recipe sync for BestEats.
// The publishable key is safe to ship in the browser; Row-Level Security
// (set up in SQL) is what actually protects each user's data.

const SUPABASE_URL = 'https://tzonoviifzlyyyofkhwd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Da6sSwcUDczdnTn653Nipg_yc2Sx3ad';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// ── Auth ──────────────────────────────────────────────────────
async function cloudGetSession() {
  try { const { data } = await sb.auth.getSession(); return data.session || null; }
  catch (e) { console.warn('getSession', e); return null; }
}
function cloudOnAuth(cb) {
  const { data } = sb.auth.onAuthStateChange((_evt, session) => cb(session || null));
  return () => { try { data.subscription.unsubscribe(); } catch (e) {} };
}
async function cloudSignIn(email, password) {
  return sb.auth.signInWithPassword({ email, password });
}
async function cloudSignUp(email, password) {
  return sb.auth.signUp({ email, password });
}
async function cloudSignOut() { try { await sb.auth.signOut(); } catch (e) {} }

// ── Per-user book (recipes + prefs) stored as one jsonb row ────
// Returns: the stored object | null (no row yet) | undefined (network/error)
async function cloudLoadBook(userId) {
  try {
    const { data, error } = await sb.from('recipe_books')
      .select('data').eq('user_id', userId).maybeSingle();
    if (error) { console.warn('cloudLoadBook', error); return undefined; }
    return data ? data.data : null;
  } catch (e) { console.warn('cloudLoadBook', e); return undefined; }
}
async function cloudSaveBook(userId, data) {
  try {
    const { error } = await sb.from('recipe_books')
      .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
    if (error) { console.warn('cloudSaveBook', error); return false; }
    return true;
  } catch (e) { console.warn('cloudSaveBook', e); return false; }
}

Object.assign(window, {
  sb, cloudGetSession, cloudOnAuth, cloudSignIn, cloudSignUp, cloudSignOut,
  cloudLoadBook, cloudSaveBook,
});
