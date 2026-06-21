// auth-ui.jsx — email + password login screen for BestEats. Exports LoginScreen to window.

function LoginScreen() {
  const [mode, setMode] = React.useState('signin'); // signin | signup
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [status, setStatus] = React.useState('idle'); // idle | working | confirm | error
  const [err, setErr] = React.useState('');

  const validEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

  // Map raw Supabase errors to friendly copy.
  const friendly = (message) => {
    const m = (message || '').toLowerCase();
    if (m.includes('invalid login')) return 'That email and password don\u2019t match. Check both and try again.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Switch to Sign in.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts \u2014 wait a minute and try again.';
    if (m.includes('password')) return 'Password must be at least 6 characters.';
    if (m.includes('email not confirmed')) return 'Please confirm your email first \u2014 check your inbox.';
    return message || 'Something went wrong. Try again.';
  };

  const submit = async (e) => {
    e.preventDefault();
    const addr = email.trim();
    if (!validEmail(addr)) { setErr('Enter a valid email address.'); setStatus('error'); return; }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); setStatus('error'); return; }
    setStatus('working'); setErr('');
    const fn = mode === 'signup' ? cloudSignUp : cloudSignIn;
    const { data, error } = await fn(addr, pw);
    if (error) { setErr(friendly(error.message)); setStatus('error'); return; }
    // Sign-up with email confirmation on → no session yet.
    if (mode === 'signup' && data && !data.session) { setStatus('confirm'); return; }
    // Otherwise onAuthStateChange in app.jsx takes over.
  };

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setStatus('idle'); setErr('');
  };

  const wrap = {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 'calc(env(safe-area-inset-top,0px) + 32px) 26px calc(env(safe-area-inset-bottom,0px) + 32px)',
    background: 'var(--bg)', color: 'var(--ink)', textAlign: 'center',
  };
  const card = { width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const inputStyle = {
    width: '100%', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)', textAlign: 'left',
    padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--surface)',
    border: '1px solid var(--border-strong)', outline: 'none',
  };
  const primaryBtn = {
    width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
    padding: '14px', borderRadius: 'var(--r-md)', border: 'none', color: '#FBF9F5',
    background: '#A8492F', boxShadow: '0 8px 22px -10px rgba(168,73,47,.7)',
  };
  const linkBtn = {
    cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)',
    background: 'none', border: 'none', textDecoration: 'underline', textUnderlineOffset: 3,
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <img src="bestEats-mark.svg" alt="" width="68" height="68"
          style={{ borderRadius: 16, display: 'block', boxShadow: '0 12px 28px -14px rgba(168,73,47,.65)' }} />
        <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 22 }}>
          Best<span style={{ fontStyle: 'italic', fontWeight: 500 }}>Eats</span>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 9 }}>
          Recipes Worth Keeping
        </div>

        {status === 'confirm' ? (
          <div style={{ marginTop: 34 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Confirm your email</div>
            <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 22px', textWrap: 'pretty' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--ink)' }}>{email.trim()}</strong>. Tap it, then come back and sign in.
            </p>
            <button onClick={() => { setMode('signin'); setStatus('idle'); setErr(''); }} style={linkBtn}>Back to sign in</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ width: '100%', marginTop: 34, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 4px', textWrap: 'pretty' }}>
              {mode === 'signup'
                ? 'Create an account to keep your recipes synced and private.'
                : 'Sign in to open your recipe book.'}
            </p>
            <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              style={inputStyle} />
            <div style={{ position: 'relative', width: '100%' }}>
              <input type={showPw ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="Password"
                value={pw} onChange={(e) => { setPw(e.target.value); if (status === 'error') setStatus('idle'); }}
                style={{ ...inputStyle, paddingRight: 60 }} />
              <button type="button" onClick={() => setShowPw((v) => !v)} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em',
                color: 'var(--ink-mute)', background: 'none', border: 'none', padding: '6px 8px', textTransform: 'uppercase',
              }}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
            {status === 'error' && <div style={{ fontSize: 13, color: '#9c2c2c', fontWeight: 600, textAlign: 'left' }}>{err}</div>}
            <button type="submit" disabled={status === 'working'} style={{ ...primaryBtn, opacity: status === 'working' ? 0.65 : 1 }}>
              {status === 'working' ? (mode === 'signup' ? 'Creating\u2026' : 'Signing in\u2026') : (mode === 'signup' ? 'Create account' : 'Sign in')}
            </button>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
              {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
              <button type="button" onClick={switchMode} style={{ ...linkBtn, fontSize: 14 }}>
                {mode === 'signup' ? 'Sign in' : 'Create one'}
              </button>
            </div>
          </form>
        )}

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.6, marginTop: 30, maxWidth: 300 }}>
          Your recipes sync privately to your account and stay available offline on this device.
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
