import { useState, type FormEvent } from 'react';
import { Icon } from './Icon';

interface LoginScreenProps {
  onLogin: (loginId: string, password: string, remember: boolean) => Promise<void>;
}

function friendlyAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return '登入資料唔正確，請再檢查 ID 同密碼。';
  }
  if (code.includes('too-many-requests')) return '嘗試次數太多，請稍後再試。';
  if (code.includes('network-request-failed')) return '暫時連唔到網絡，請檢查連線。';
  return '暫時未能登入，請稍後再試。';
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!loginId.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      await onLogin(loginId, password, remember);
    } catch (nextError) {
      setError(friendlyAuthError(nextError));
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="KAYLA 簡介">
        <div className="login-brand"><span className="brand-mark">K</span>KAYLA</div>
        <div className="login-intro-copy">
          <p className="eyebrow">PRIVATE FAMILY SPACE</p>
          <h1>每個小日子，<br />都安心記低。</h1>
          <p>英國初生照顧指南、日常紀錄同重要日子，集中喺屋企人嘅私人空間。</p>
        </div>
        <div className="login-trust"><Icon name="shield" size={18} /> 只有指定家庭帳戶可以進入</div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand"><span className="brand-mark">K</span>KAYLA</div>
          <p className="eyebrow">歡迎返嚟</p>
          <h2>登入家庭空間</h2>
          <p className="form-intro">請使用由管理員建立嘅登入 ID。</p>

          <label className="field">
            <span>登入 ID</span>
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              autoComplete="username"
              placeholder="輸入家庭登入 ID"
              data-testid="login-id"
            />
          </label>

          <label className="field">
            <span>密碼</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="輸入密碼"
              data-testid="login-password"
            />
          </label>

          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            <span>喺呢部裝置保持登入</span>
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="primary-button login-button" disabled={submitting || !loginId.trim() || !password}>
            {submitting ? '登入中…' : '安全登入'}
          </button>

          <p className="login-help">無公開註冊。如果忘記密碼，請由家庭管理員在 Firebase Console 重新設定帳戶。</p>
        </form>
      </section>
    </main>
  );
}
