import { lazy, Suspense, useCallback, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useKaylaData } from './hooks/useKaylaData';
import { useOwnerRole } from './hooks/useOwnerRole';
import type { ViewKey } from './types';
import { LoginScreen } from './components/LoginScreen';
import { BottomNavigation, SideNavigation } from './components/Navigation';
import { QuickAddSheet } from './components/QuickAddSheet';
import { Icon } from './components/Icon';
import { TodayPage } from './pages/TodayPage';

const RecordsPage = lazy(() => import('./pages/RecordsPage').then((module) => ({ default: module.RecordsPage })));
const GuidePageView = lazy(() => import('./pages/GuidePage').then((module) => ({ default: module.GuidePageView })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));

export default function App() {
  const authState = useAuth();
  const data = useKaylaData(authState.user);
  const isOwner = useOwnerRole(authState.user, authState.isDemo);
  const previewParams = new URLSearchParams(window.location.search);
  const previewView = previewParams.get('view');
  const allowedViews: ViewKey[] = ['today', 'records', 'guide', 'calendar', 'settings'];
  const [view, setView] = useState<ViewKey>(
    import.meta.env.DEV && allowedViews.includes(previewView as ViewKey) ? (previewView as ViewKey) : 'today',
  );
  const [quickAddOpen, setQuickAddOpen] = useState(import.meta.env.DEV && previewParams.has('add'));
  const [guideFocus, setGuideFocus] = useState<string | null>(
    import.meta.env.DEV ? previewParams.get('section') : null,
  );

  const changeView = (nextView: ViewKey) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGuide = (sectionId?: string) => {
    setGuideFocus(sectionId || null);
    changeView('guide');
  };

  const clearGuideFocus = useCallback(() => setGuideFocus(null), []);

  if (authState.loading) {
    return <div className="app-loading"><span className="brand-mark">K</span><p>正在確認私人登入…</p></div>;
  }

  if (!authState.user) return <LoginScreen onLogin={authState.login} />;

  return (
    <div className="app-shell">
      <SideNavigation active={view} onChange={changeView} onAdd={() => setQuickAddOpen(true)} />
      <div className="app-content">
        <header className="desktop-topbar">
          <div><strong>{data.profile?.name || 'KAYLA Family'}</strong><span>{authState.isDemo ? '示範模式' : '私人家庭空間'}</span></div>
          <button className="avatar-button" onClick={() => changeView('settings')} aria-label="開啟設定"><Icon name="user" /></button>
        </header>

        {data.error && <div className="global-error" role="alert"><Icon name="alert" />{data.error}</div>}

        <main className="main-content">
          {data.loading ? (
            <div className="content-loading"><span /><p>載入家庭資料…</p></div>
          ) : (
            <Suspense fallback={<div className="content-loading page-loading"><span /><p>載入頁面…</p></div>}>
              {view === 'today' && <TodayPage profile={data.profile} records={data.records} onAdd={() => setQuickAddOpen(true)} onOpenGuide={openGuide} onOpenSettings={() => changeView('settings')} />}
              {view === 'records' && <RecordsPage records={data.records} currentUserId={authState.user.uid} canManageAll={isOwner} onAdd={() => setQuickAddOpen(true)} onDelete={data.deleteRecord} />}
              {view === 'guide' && <GuidePageView initialSectionId={guideFocus} onSectionOpened={clearGuideFocus} />}
              {view === 'calendar' && <CalendarPage profile={data.profile} onOpenSettings={() => changeView('settings')} />}
              {view === 'settings' && <SettingsPage user={authState.user} profile={data.profile} isDemo={authState.isDemo} canEditProfile={isOwner} onSaveProfile={data.saveProfile} onLogout={authState.logout} />}
            </Suspense>
          )}
        </main>
      </div>

      <BottomNavigation active={view} onChange={changeView} onAdd={() => setQuickAddOpen(true)} />
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSave={data.addRecord} />
    </div>
  );
}
