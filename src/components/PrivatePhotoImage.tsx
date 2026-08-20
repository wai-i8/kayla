import { useEffect, useRef, useState } from 'react';
import { getBlob, getBytes, getMetadata, ref as storageRef } from 'firebase/storage';
import { storage } from '../lib/firebase';
import type { BabyPhoto } from '../types';
import { Icon } from './Icon';

interface PrivatePhotoImageProps {
  photo: BabyPhoto;
  variant: 'thumbnail' | 'full';
  alt: string;
  className?: string;
}

interface PhotoLoadFailure {
  short: string;
  detail: string;
}

const MAX_PRIVATE_PHOTO_BYTES = 2 * 1024 * 1024;

function storageErrorCode(error: unknown) {
  return error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';
}

function explainLoadFailure(error: unknown, downloadStarted: boolean): PhotoLoadFailure {
  const code = storageErrorCode(error);
  if (code.includes('object-not-found')) {
    return { short: '搵唔到相片', detail: 'Firebase Storage 入面搵唔到呢個相片路徑。' };
  }
  if (code.includes('unauthenticated')) {
    return { short: '請重新登入', detail: '登入狀態已經過期，請登出後再登入。' };
  }
  if (code.includes('unauthorized') || code.includes('unauthorized-app')) {
    return { short: '冇讀取權限', detail: '目前帳戶未獲 Firebase Storage Rules 允許讀取相片。' };
  }
  if (code.includes('quota-exceeded')) {
    return { short: '儲存服務暫停', detail: 'Firebase Storage 配額已用完或服務暫停。' };
  }
  if (downloadStarted && (code.includes('retry-limit-exceeded') || code.includes('unknown') || !code)) {
    return {
      short: '下載未設定',
      detail: '相片存在而且帳戶有權限，但瀏覽器下載被攔截；請發布 Firebase Storage bucket CORS 設定。',
    };
  }
  return {
    short: '載入失敗',
    detail: code ? `Firebase 回傳：${code}` : '未能讀取相片，請檢查網絡後再試。',
  };
}

export function PrivatePhotoImage({ photo, variant, alt, className = '' }: PrivatePhotoImageProps) {
  const directUrl = variant === 'thumbnail' ? photo.demoThumbnailUrl : photo.demoUrl;
  const path = variant === 'thumbnail' ? photo.thumbnailPath : photo.storagePath;
  const [url, setUrl] = useState(directUrl || '');
  const [failure, setFailure] = useState<PhotoLoadFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(variant === 'full' || Boolean(directUrl));
  const holderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (variant === 'full' || directUrl) {
      setShouldLoad(true);
      return undefined;
    }
    if (!holderRef.current || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(holderRef.current);
    return () => observer.disconnect();
  }, [variant, directUrl, path]);

  useEffect(() => {
    setFailure(null);
    if (!shouldLoad) {
      setUrl('');
      return undefined;
    }
    if (directUrl) {
      setUrl(directUrl);
      return undefined;
    }

    let active = true;
    let objectUrl = '';
    setUrl('');
    const reference = storageRef(storage, path);
    void (async () => {
      let downloadStarted = false;
      try {
        // Metadata uses the authenticated Firebase endpoint. Checking it first
        // distinguishes a missing path/Rules problem from a browser media
        // download (CORS) problem, and avoids downloading an unexpected file.
        const metadata = await getMetadata(reference);
        if (metadata.size > MAX_PRIVATE_PHOTO_BYTES) {
          throw new Error('private-photo-too-large');
        }
        if (metadata.contentType && !metadata.contentType.startsWith('image/')) {
          throw new Error('private-photo-invalid-type');
        }

        downloadStarted = true;
        let blob: Blob;
        try {
          // Size was verified above, so omitting Range keeps the CORS request
          // as simple as possible.
          blob = await getBlob(reference);
        } catch (blobError) {
          // getBlob is unavailable in a small number of WebViews. getBytes has
          // the same Firebase Auth/Rules protection and creates no public URL.
          if (!storageErrorCode(blobError).includes('unsupported-environment')) throw blobError;
          const bytes = await getBytes(reference, MAX_PRIVATE_PHOTO_BYTES);
          blob = new Blob([bytes], { type: metadata.contentType || 'image/jpeg' });
        }

        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (error) {
        if (!active) return;
        console.error('Private photo download failed', {
          path,
          stage: downloadStarted ? 'media-download' : 'metadata',
          code: storageErrorCode(error),
          error,
        });
        if (error instanceof Error && error.message === 'private-photo-too-large') {
          setFailure({ short: '相片太大', detail: '相片超過私人相簿嘅 2 MB 下載上限。' });
        } else if (error instanceof Error && error.message === 'private-photo-invalid-type') {
          setFailure({ short: '格式錯誤', detail: 'Firebase 入面嘅檔案唔係可顯示嘅相片格式。' });
        } else {
          setFailure(explainLoadFailure(error, downloadStarted));
        }
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attempt, directUrl, path, shouldLoad]);

  const imageDecodeFailed = () => {
    setUrl('');
    setFailure({ short: '相片已損壞', detail: '檔案下載成功，但瀏覽器無法解碼呢張相。' });
  };

  return (
    <span ref={holderRef} className={`private-photo ${failure ? 'failed' : ''} ${className}`.trim()}>
      {url ? <img src={url} alt={alt} onError={imageDecodeFailed} /> : failure ? (
        <span className="photo-load-message" title={failure.detail} role={variant === 'full' ? 'alert' : undefined}>
          <Icon name="image" size={24} />
          <span>{failure.short}</span>
          {variant === 'full' && (
            <button type="button" className="photo-load-retry" onClick={() => setAttempt((current) => current + 1)}>
              重新載入
            </button>
          )}
        </span>
      ) : (
        <span className="photo-skeleton" aria-label="載入相片中" />
      )}
    </span>
  );
}
