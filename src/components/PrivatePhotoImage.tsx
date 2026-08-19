import { useEffect, useRef, useState } from 'react';
import { getBlob, ref as storageRef } from 'firebase/storage';
import { storage } from '../lib/firebase';
import type { BabyPhoto } from '../types';
import { Icon } from './Icon';

interface PrivatePhotoImageProps {
  photo: BabyPhoto;
  variant: 'thumbnail' | 'full';
  alt: string;
  className?: string;
}

export function PrivatePhotoImage({ photo, variant, alt, className = '' }: PrivatePhotoImageProps) {
  const directUrl = variant === 'thumbnail' ? photo.demoThumbnailUrl : photo.demoUrl;
  const path = variant === 'thumbnail' ? photo.thumbnailPath : photo.storagePath;
  const [url, setUrl] = useState(directUrl || '');
  const [failed, setFailed] = useState(false);
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
    setFailed(false);
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
    getBlob(storageRef(storage, path), 2 * 1024 * 1024)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [directUrl, path, shouldLoad]);

  return (
    <span ref={holderRef} className={`private-photo ${failed ? 'failed' : ''} ${className}`.trim()}>
      {url ? <img src={url} alt={alt} /> : failed ? (
        <span className="photo-load-message"><Icon name="image" size={24} />載入失敗</span>
      ) : (
        <span className="photo-skeleton" aria-label="載入相片中" />
      )}
    </span>
  );
}
