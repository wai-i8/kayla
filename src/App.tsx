import { lazy, Suspense, useCallback, useRef, useState, type ChangeEvent } from 'react';
import { useAuth } from './hooks/useAuth';
import { useKaylaData } from './hooks/useKaylaData';
import { useKaylaPhotos } from './hooks/useKaylaPhotos';
import { useOwnerRole } from './hooks/useOwnerRole';
import type { RecordFilter, ViewKey } from './types';
import { LoginScreen } from './components/LoginScreen';
import { BottomNavigation, SideNavigation } from './components/Navigation';
import { QuickAddSheet } from './components/QuickAddSheet';
import { Icon } from './components/Icon';
import { TodayPage } from './pages/TodayPage';

const RecordsPage = lazy(() => import('./pages/RecordsPage').then((module) => ({ default: module.RecordsPage })));
const GuidePageView = lazy(() => import('./pages/GuidePage').then((module) => ({ default: module.GuidePageView })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const PhotosPage = lazy(() => import('./pages/PhotosPage').then((module) => ({ default: module.PhotosPage })));

export default function App() {
  const authState = useAuth();
  const data = useKaylaData(authState.user);
  const album = useKaylaPhotos(authState.user);
  const isOwner = useOwnerRole(authState.user, authState.isDemo);
  const previewParams = new URLSearchParams(window.location.search);
  const previewView = previewParams.get('view');
  const allowedViews: ViewKey[] = ['today', 'records', 'guide', 'calendar', 'photos', 'settings'];
  const [view, setView] = useState<ViewKey>(
    import.meta.env.DEV && allowedViews.includes(previewView as ViewKey) ? (previewView as ViewKey) : 'today',
  );
  const [quickAddOpen, setQuickAddOpen] = useState(import.meta.env.DEV && previewParams.has('add'));
  const [recordsFilter, setRecordsFilter] = useState<RecordFilter>({ type: 'all', date: null });
  const [guideFocus, setGuideFocus] = useState<string | null>(
    import.meta.env.DEV ? previewParams.get('section') : null,
  );
  const [cameraFile, setCameraFile] = useState<File | null>(null);
  const quickCameraInput = useRef<HTMLInputElement>(null);

  const openQuickCamera = () => {
    if (quickCameraInput.current) quickCameraInput.current.value = '';
    quickCameraInput.current?.click();
  };

  const receiveCameraPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null;
    event.target.value = '';
    if (!nextFile) return;
    setCameraFile(nextFile);
    setView('photos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const consumeCameraFile = useCallback(() => setCameraFile(null), []);

  const changeView = (nextView: ViewKey) => {
    if (nextView === 'records') setRecordsFilter({ type: 'all', date: null });
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFilteredRecords = (filter: RecordFilter) => {
    setRecordsFilter(filter);
    setView('records');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGuide = (sectionId?: string) => {
    setGuideFocus(sectionId || null);
    changeView('guide');
  };

  const clearGuideFocus = useCallback(() => setGuideFocus(null), []);

  const openQuickAdd = () => setQuickAddOpen(true);
  const closeQuickAdd = () => setQuickAddOpen(false);

  if (authState.loading) {
    return <div className="app-loading"><span className="brand-mark">K</span><p>正在確認私人登入…</p></div>;
  }

  if (!authState.user) return <LoginScreen onLogin={authState.login} />;

  return (
    <div className="app-shell">
      <SideNavigation active={view} onChange={changeView} onAdd={openQuickAdd} />
      <div className="app-content">
        <header className="desktop-topbar">
          <div><strong>{data.profile?.name || 'KAYLA Family'}</strong><span>{authState.isDemo ? '示範模式' : '私人家庭空間'}</span></div>
          <button className={`album-button ${view === 'photos' ? 'active' : ''}`} onClick={() => changeView('photos')} aria-label="開啟私人相簿" aria-current={view === 'photos' ? 'page' : undefined} data-testid="desktop-open-photos"><img src={`${import.meta.env.BASE_URL}kayla-album.webp`} alt="" /></button>
          <button className="header-camera-button" type="button" onClick={openQuickCamera} aria-label="快捷影相"><Icon name="camera" /></button>
          <button className="avatar-button" onClick={() => changeView('settings')} aria-label="開啟設定"><Icon name="user" /></button>
        </header>

        {data.error && <div className="global-error" role="alert"><Icon name="alert" />{data.error}</div>}

        <main className="main-content">
          {data.loading ? (
            <div className="content-loading"><span /><p>載入家庭資料…</p></div>
          ) : (
            <Suspense fallback={<div className="content-loading page-loading"><span /><p>載入頁面…</p></div>}>
              {view === 'today' && <TodayPage profile={data.profile} records={data.records} onAdd={openQuickAdd} onOpenRecords={openFilteredRecords} onOpenGuide={openGuide} onOpenPhotos={() => changeView('photos')} onQuickCamera={openQuickCamera} onOpenSettings={() => changeView('settings')} />}
              {view === 'records' && <RecordsPage records={data.records} filter={recordsFilter} onFilterChange={setRecordsFilter} currentUserId={authState.user.uid} canManageAll={isOwner} onAdd={openQuickAdd} onDelete={data.deleteRecord} />}
              {view === 'guide' && <GuidePageView initialSectionId={guideFocus} onSectionOpened={clearGuideFocus} />}
              {view === 'calendar' && <CalendarPage profile={data.profile} onOpenSettings={() => changeView('settings')} />}
              {view === 'photos' && <PhotosPage photos={album.photos} loading={album.loading} error={album.error} onAdd={album.addPhoto} onDelete={album.deletePhoto} initialFile={cameraFile} onInitialFileConsumed={consumeCameraFile} />}
              {view === 'settings' && <SettingsPage user={authState.user} profile={data.profile} isDemo={authState.isDemo} canEditProfile={isOwner} onSaveProfile={data.saveProfile} onLogout={authState.logout} />}
            </Suspense>
          )}
        </main>
      </div>

      <BottomNavigation active={view} onChange={changeView} onAdd={openQuickAdd} />
      <QuickAddSheet
        open={quickAddOpen}
        quickOptions={data.quickOptions}
        onClose={closeQuickAdd}
        onSave={data.addRecord}
        onDeleteQuickOption={data.deleteQuickOption}
      />
      <input ref={quickCameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={receiveCameraPhoto} tabIndex={-1} aria-hidden="true" />
    </div>
  );
}
