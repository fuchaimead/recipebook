// storage.jsx — on-device persistence + photo resizing. Exports to window:
//   loadRecipes, saveRecipes, loadPrefs, savePrefs, resizeImage, exportBackup, parseBackup

const LS_RECIPES = 'recipebook.recipes.v1';
const LS_PREFS = 'recipebook.prefs.v1';
const LS_SEEDED = 'recipebook.seeded.v1';

// ── Recipes ───────────────────────────────────────────────────
function loadRecipes() {
  try {
    const raw = localStorage.getItem(LS_RECIPES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // First run: seed with the sample recipes so the book isn't empty.
  if (!localStorage.getItem(LS_SEEDED)) {
    const seed = SEED_RECIPES.map(r => ({ ...r }));
    try {
      localStorage.setItem(LS_RECIPES, JSON.stringify(seed));
      localStorage.setItem(LS_SEEDED, '1');
    } catch (e) {}
    return seed;
  }
  return [];
}
function saveRecipes(recipes) {
  try {
    localStorage.setItem(LS_RECIPES, JSON.stringify(recipes));
    return true;
  } catch (e) {
    return false; // most likely quota exceeded (too many / too-large photos)
  }
}

// ── Prefs (units, etc.) ───────────────────────────────────────
function loadPrefs() {
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { units: 'us' };
}
function savePrefs(prefs) {
  try { localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); } catch (e) {}
}

// ── Photo handling: downscale to keep localStorage small ──────
function resizeImage(file, max = 1100, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || file.type.indexOf('image') !== 0) { reject(new Error('not an image')); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width >= height && width > max) { height = Math.round(height * max / width); width = max; }
      else if (height > width && height > max) { width = Math.round(width * max / height); height = max; }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      try { resolve(c.toDataURL('image/jpeg', quality)); }
      catch (e) { reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

// ── Backup ────────────────────────────────────────────────────
function exportBackup(recipes) {
  const payload = { app: 'recipe-book', version: 1, exportedAt: new Date().toISOString(), recipes };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `recipe-book-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function parseBackup(text) {
  try {
    const obj = JSON.parse(text);
    const recipes = Array.isArray(obj) ? obj : obj.recipes;
    if (!Array.isArray(recipes)) return null;
    return recipes;
  } catch (e) { return null; }
}

// ── Per-user offline cache (keyed by Supabase user id) ───────
// Stores the whole book: { recipes, ideas }
function bookCacheKey(uid) { return 'besteats.book.' + uid; }
function loadCachedBook(uid) {
  try { const r = localStorage.getItem(bookCacheKey(uid)); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}
function saveCachedBook(uid, book) {
  try { localStorage.setItem(bookCacheKey(uid), JSON.stringify(book)); return true; } catch (e) { return false; }
}

Object.assign(window, {
  loadRecipes, saveRecipes, loadPrefs, savePrefs, resizeImage, exportBackup, parseBackup,
  loadCachedBook, saveCachedBook,
});
