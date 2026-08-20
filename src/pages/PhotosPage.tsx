import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { dateInputValue, formatLongDate, formatTime, inputsToTimestamp, startOfUkDay, timeInputValue } from '../lib/date';
import type { BabyPhoto, NewPhotoInput } from '../types';
import { Icon } from '../components/Icon';
import { PrivatePhotoImage } from '../components/PrivatePhotoImage';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface PhotosPageProps {
  photos: BabyPhoto[];
  loading: boolean;
  error: string | null;
  onAdd: (input: NewPhotoInput) => Promise<void>;
  onDelete: (photo: BabyPhoto) => Promise<void>;
  initialFile?: File | null;
  onInitialFileConsumed?: () => void;
}

function photoAlt(photo: BabyPhoto) {
  const when = `${formatLongDate(photo.capturedAt)} ${formatTime(photo.capturedAt)}`;
  return photo.caption ? `${photo.caption}，${when}` : `Kayla 家庭相片，${when}`;
}

function groupPhotos(photos: BabyPhoto[]) {
  const groups = new Map<string, BabyPhoto[]>();
  photos.forEach((photo) => {
    const date = dateInputValue(photo.capturedAt);
    groups.set(date, [...(groups.get(date) || []), photo]);
  });
  return [...groups.entries()];
}

export function PhotosPage({ photos, loading, error, onAdd, onDelete, initialFile, onInitialFileConsumed }: PhotosPageProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [date, setDate] = useState(dateInputValue());
  const [time, setTime] = useState(timeInputValue());
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const uploadController = useRef<AbortController | null>(null);

  const ordered = useMemo(
    () => [...photos].sort((a, b) => b.capturedAt - a.capturedAt || b.createdAt - a.createdAt),
    [photos],
  );
  const groups = useMemo(() => groupPhotos(ordered), [ordered]);
  const viewingIndex = viewingId ? ordered.findIndex((photo) => photo.id === viewingId) : -1;
  const viewing = viewingIndex >= 0 ? ordered[viewingIndex] : null;
  const todayDate = dateInputValue();
  const yesterdayDate = dateInputValue(startOfUkDay(-1));

  const resetEditor = () => {
    setFile(null);
    setDate(dateInputValue());
    setTime(timeInputValue());
    setCaption('');
    setFormError('');
  };

  const closeAdd = () => {
    if (saving) return;
    setAddOpen(false);
    resetEditor();
  };
  const addDialogRef = useDialogFocus(addOpen, closeAdd, !saving);

  const closeViewer = () => {
    if (deleting) return;
    setViewingId(null);
    setDeleteConfirm(false);
    setDeleteError('');
  };
  const closeDeleteConfirm = () => {
    if (deleting) return;
    setDeleteConfirm(false);
    setDeleteError('');
  };
  const viewerRef = useDialogFocus(Boolean(viewing) && !deleteConfirm, closeViewer, !deleting);
  const deleteDialogRef = useDialogFocus(Boolean(viewing) && deleteConfirm, closeDeleteConfirm, !deleting);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => uploadController.current?.abort(), []);

  useEffect(() => {
    if (!initialFile) return;
    setFile(initialFile);
    setDate(dateInputValue());
    setTime(timeInputValue());
    setCaption('');
    setFormError('');
    setAddOpen(true);
    onInitialFileConsumed?.();
  }, [initialFile, onInitialFileConsumed]);

  useEffect(() => {
    if (viewingId && !viewing) closeViewer();
  }, [viewingId, viewing]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null;
    event.target.value = '';
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setFormError('請選擇相片檔案。');
      return;
    }
    if (nextFile.size > 25 * 1024 * 1024) {
      setFormError('原相片大過 25 MB，請先縮細再上傳。');
      return;
    }
    setFile(nextFile);
    setFormError('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setFormError('請先影相或者揀一張相。');
      return;
    }
    const capturedAt = inputsToTimestamp(date, time);
    if (!Number.isFinite(capturedAt) || capturedAt < 946_684_800_000 || capturedAt > Date.now() + 600_000) {
      setFormError('相片日期或時間唔正確。');
      return;
    }

    setSaving(true);
    setFormError('');
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      await onAdd({ file, capturedAt, caption, signal: controller.signal });
      setAddOpen(false);
      resetEditor();
    } catch (saveError) {
      setFormError(controller.signal.aborted
        ? '已取消上傳，未有新相片儲存。'
        : saveError instanceof Error && saveError.message
        ? saveError.message
        : '未能上傳相片，請檢查網絡、Storage Rules 同 CORS 設定。');
    } finally {
      if (uploadController.current === controller) uploadController.current = null;
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!viewing) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await onDelete(viewing);
      setViewingId(null);
      setDeleteConfirm(false);
      setDeleteError('');
    } catch {
      setDeleteError('未能完成刪除；部分檔案可能已移除，但相片資料會保留方便你重試。');
    } finally {
      setDeleting(false);
    }
  };

  const moveViewer = (offset: number) => {
    if (viewingIndex < 0) return;
    const next = ordered[viewingIndex + offset];
    if (next) {
      setViewingId(next.id);
      setDeleteConfirm(false);
      setDeleteError('');
    }
  };

  return (
    <div className="page photos-page">
      <header className="page-header photo-page-header">
        <div><p className="eyebrow">PRIVATE FAMILY ALBUM</p><h1>Kayla 相簿</h1><p>相片同照顧紀錄分開，只限登入家庭成員查看。</p></div>
        <button type="button" className="primary-button photo-add-button" onClick={() => setAddOpen(true)} data-testid="open-photo-editor"><Icon name="plus" size={18} />新增相片</button>
      </header>

      <div className="photo-privacy-note"><Icon name="shield" size={18} /><span>相片先喺手機壓縮成私人 JPEG，再上傳到 Firebase Storage；唔會保存公開下載網址。</span></div>

      {error && <div className="form-error photo-page-error" role="alert"><Icon name="alert" size={18} />{error}</div>}

      {loading ? (
        <div className="photo-loading"><span /><p>載入私人相簿…</p></div>
      ) : groups.length ? groups.map(([groupDate, items]) => (
        <section className="photo-day" key={groupDate}>
          <div className="day-heading">
            <h2>{groupDate === todayDate ? '今日' : groupDate === yesterdayDate ? '昨日' : formatLongDate(inputsToTimestamp(groupDate, '12:00'))}</h2>
            <span>{items.length} 張</span>
          </div>
          <div className="photo-grid">
            {items.map((photo) => (
              <button type="button" className="photo-card" key={photo.id} onClick={() => setViewingId(photo.id)} aria-label={`查看${photoAlt(photo)}`}>
                <PrivatePhotoImage photo={photo} variant="thumbnail" alt="" />
                <span className="photo-card-overlay"><time dateTime={new Date(photo.capturedAt).toISOString()}>{formatTime(photo.capturedAt)}</time>{photo.caption && <span>{photo.caption}</span>}</span>
              </button>
            ))}
          </div>
        </section>
      )) : (
        <div className="large-empty photo-empty">
          <img src={`${import.meta.env.BASE_URL}kayla-album.webp`} alt="" />
          <h2>相簿仲係空嘅</h2>
          <p>第一張相會喺你部電話先縮細同移除 EXIF／GPS 資料，之後先私人上傳。</p>
          <button type="button" className="primary-button" onClick={() => setAddOpen(true)}>加入第一張相</button>
        </div>
      )}

      {addOpen && (
        <div className="modal-backdrop photo-editor-backdrop" role="presentation">
          <section ref={addDialogRef} className="photo-editor" role="dialog" aria-modal="true" aria-labelledby="photo-editor-title">
            <div className="sheet-handle" />
            <header className="photo-editor-header">
              <div><p className="eyebrow">NEW PHOTO</p><h2 id="photo-editor-title">新增相片</h2></div>
              <button type="button" className="icon-button" onClick={closeAdd} disabled={saving} aria-label="關閉新增相片"><Icon name="close" /></button>
            </header>

            <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={chooseFile} tabIndex={-1} />
            <input ref={galleryInput} className="sr-only" type="file" accept="image/*" onChange={chooseFile} tabIndex={-1} />

            <form className="photo-form" onSubmit={submit}>
              {file && previewUrl ? (
                <div className="photo-preview"><img src={previewUrl} alt="準備上傳嘅相片預覽" /></div>
              ) : (
                <div className="photo-source-intro"><img src={`${import.meta.env.BASE_URL}kayla-album.webp`} alt="" /><strong>影低開心時刻</strong><span>每次先加入一張，方便改日期同寫說明。</span></div>
              )}

              <div className="photo-source-actions">
                <button type="button" className="photo-source-button" onClick={() => cameraInput.current?.click()} disabled={saving}><Icon name="camera" /><span><strong>即時影相</strong><small>開啟電話相機</small></span></button>
                <button type="button" className="photo-source-button" onClick={() => galleryInput.current?.click()} disabled={saving}><Icon name="image" /><span><strong>相簿選擇</strong><small>{file ? '重新選擇相片' : '由電話揀相'}</small></span></button>
              </div>

              <div className="form-row two-columns photo-date-fields">
                <label className="field"><span>拍攝日期</span><input type="date" min="2000-01-01" max={dateInputValue()} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
                <label className="field"><span>拍攝時間</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
              </div>
              <label className="field"><span>相片說明（可留空）</span><textarea rows={2} maxLength={500} value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="例如：第一次返到屋企" /></label>
              <p className="photo-processing-note">上傳前會自動校正方向、縮至最長邊約 1920px，並移除原相嘅 EXIF／GPS metadata。</p>
              {formError && <div className="form-error" role="alert">{formError}</div>}
              <div className="photo-save-actions">
                {saving && <button type="button" className="secondary-button" onClick={() => uploadController.current?.abort()}>取消上傳</button>}
                <button type="submit" className="primary-button photo-save-button" disabled={saving || !file}>{saving ? '正在壓縮同上傳…' : '儲存到私人相簿'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewing && (
        <div className="photo-viewer-backdrop" role="presentation">
          <section ref={viewerRef} className="photo-viewer" role="dialog" aria-modal="true" aria-label="查看相片">
            <header className="photo-viewer-header">
              <div><strong>{formatLongDate(viewing.capturedAt)}</strong><span>{formatTime(viewing.capturedAt)}</span></div>
              <button type="button" className="icon-button" onClick={closeViewer} disabled={deleting} aria-label="關閉相片"><Icon name="close" /></button>
            </header>
            <PrivatePhotoImage photo={viewing} variant="full" alt={photoAlt(viewing)} className="photo-viewer-image" />
            <button type="button" className="photo-viewer-nav previous" onClick={() => moveViewer(-1)} disabled={viewingIndex <= 0} aria-label="上一張相"><Icon name="chevron" /></button>
            <button type="button" className="photo-viewer-nav next" onClick={() => moveViewer(1)} disabled={viewingIndex >= ordered.length - 1} aria-label="下一張相"><Icon name="chevron" /></button>
            <footer className="photo-viewer-footer">
              <div><p>{viewing.caption || '冇相片說明'}</p><small>由 {viewing.createdByLabel || '家庭成員'} 加入</small></div>
              {!deleteConfirm && <button type="button" className="icon-button photo-delete-button" onClick={() => setDeleteConfirm(true)} aria-label="刪除相片"><Icon name="trash" /></button>}
            </footer>
            {deleteConfirm && (
              <section ref={deleteDialogRef} className="photo-delete-confirm" role="alertdialog" aria-modal="true" aria-label="確認永久刪除相片">
                <p>確定永久刪除呢張相？刪除後無法復原。</p>
                {deleteError && <span className="form-error">{deleteError}</span>}
                <div><button type="button" className="secondary-button" onClick={closeDeleteConfirm} disabled={deleting}>取消</button><button type="button" className="danger-button" onClick={confirmDelete} disabled={deleting}>{deleting ? '刪除中…' : '永久刪除'}</button></div>
              </section>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
