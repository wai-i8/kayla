import { useEffect, useState, type FormEvent } from 'react';
import type { AuthUser, BabyProfile } from '../types';
import { Icon } from '../components/Icon';
import { dateInputValue } from '../lib/date';

interface SettingsPageProps {
  user: AuthUser;
  profile: BabyProfile | null;
  isDemo: boolean;
  canEditProfile: boolean;
  onSaveProfile: (profile: BabyProfile) => Promise<void>;
  onLogout: () => Promise<void>;
}

const emptyProfile: BabyProfile = {
  name: '',
  dateOfBirth: '',
  timeOfBirth: '',
  gestationalWeeks: 40,
  feedingMethod: '',
  gpName: '',
  notes: '',
};

export function SettingsPage({ user, profile, isDemo, canEditProfile, onSaveProfile, onLogout }: SettingsPageProps) {
  const [form, setForm] = useState<BabyProfile>(profile || emptyProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setForm(profile || emptyProfile), [profile]);

  const update = <K extends keyof BabyProfile>(key: K, value: BabyProfile[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEditProfile) return;
    if (!form.name.trim() || !form.dateOfBirth) {
      setMessage('請填寫 BB 名稱同出生日期。');
      return;
    }
    if (form.dateOfBirth > dateInputValue()) {
      setMessage('出生日期唔可以係未來日期。');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await onSaveProfile({ ...form, name: form.name.trim() });
      setMessage('BB 資料已經儲存。');
    } catch {
      setMessage('未能儲存，請檢查 Firebase 權限。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page settings-page">
      <header className="page-header"><div><p className="eyebrow">FAMILY SPACE</p><h1>設定</h1><p>管理 BB 基本資料同目前登入帳戶。</p></div></header>

      <div className="settings-layout">
        <form className="settings-card profile-form" onSubmit={submit}>
          <div className="settings-card-heading"><span className="settings-icon"><Icon name="user" /></span><div><h2>BB 基本資料</h2><p>出生日期會用嚟計算日齡同疫苗參考日期。</p></div></div>
          {!canEditProfile && <div className="read-only-notice"><Icon name="shield" size={18} />屋企人帳戶可以查看資料，但 BB 基本資料只可以由主要帳戶修改。</div>}
          <fieldset className="profile-fields" disabled={!canEditProfile}>
            <label className="field"><span>BB 顯示名稱</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="例如 Kayla" maxLength={80} required /></label>
            <div className="form-row two-columns">
              <label className="field"><span>出生日期</span><input type="date" max={dateInputValue()} value={form.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} required /></label>
              <label className="field"><span>出生時間</span><input type="time" value={form.timeOfBirth || ''} onChange={(event) => update('timeOfBirth', event.target.value)} /></label>
            </div>
            <div className="form-row two-columns">
              <label className="field"><span>出生週數</span><input type="number" inputMode="numeric" min="20" max="45" value={form.gestationalWeeks || ''} onChange={(event) => update('gestationalWeeks', Number(event.target.value) || undefined)} placeholder="40" /></label>
              <label className="field"><span>出生體重（kg）</span><input type="number" inputMode="decimal" min="0.3" max="30" step="0.01" value={form.birthWeightKg || ''} onChange={(event) => update('birthWeightKg', Number(event.target.value) || undefined)} placeholder="3.28" /></label>
            </div>
            <label className="field"><span>主要餵養方式</span><select value={form.feedingMethod || ''} onChange={(event) => update('feedingMethod', event.target.value as BabyProfile['feedingMethod'])}><option value="">未設定</option><option value="breast">母乳</option><option value="formula">配方奶</option><option value="mixed">混合餵養</option></select></label>
            <label className="field"><span>GP／診所（可留空）</span><input value={form.gpName || ''} onChange={(event) => update('gpName', event.target.value)} placeholder="診所名稱" maxLength={200} /></label>
            <label className="field"><span>重要備註（可留空）</span><textarea rows={3} value={form.notes || ''} onChange={(event) => update('notes', event.target.value)} placeholder="例如出院時醫護提供嘅個別安排" maxLength={2000} /></label>
            {message && <div className={message.includes('已經') ? 'form-success' : 'form-error'} role="status">{message}</div>}
            <button className="primary-button" disabled={saving}>{saving ? '儲存中…' : '儲存 BB 資料'}</button>
          </fieldset>
        </form>

        <div className="settings-side">
          <section className="settings-card account-card">
            <div className="settings-card-heading"><span className="settings-icon"><Icon name="shield" /></span><div><h2>登入帳戶</h2><p>每位照顧者應該使用獨立帳戶。</p></div></div>
            <div className="account-row"><span className="account-avatar">{(user.email || 'K').slice(0, 1).toUpperCase()}</span><div><strong>{user.email?.split('@')[0] || '家庭成員'}</strong><small>{isDemo ? '本機示範模式' : user.email}</small></div><span className="status-dot">已登入</span></div>
            {isDemo && <div className="demo-notice">示範模式唔會讀寫正式 Firebase，重新整理後資料會重設。</div>}
            <button className="secondary-button logout-button" type="button" onClick={onLogout}><Icon name="logout" size={18} />登出</button>
          </section>

          <section className="settings-card privacy-card">
            <p className="eyebrow">PRIVACY</p><h2>私人資料位置</h2>
            <ul><li><Icon name="check" />私人紀錄只存放於 Firebase `/kayla`</li><li><Icon name="check" />未登入前唔會讀取任何 BB 資料</li><li><Icon name="check" />網站冇公開註冊入口</li></ul>
            <p className="small-print">家庭登入 ID 只存放於本機設定；正式使用前需要將 `/kayla` 權限合併入 Firebase 現有 Rules。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
