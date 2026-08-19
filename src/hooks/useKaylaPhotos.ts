import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onValue, ref as databaseRef, remove, set } from 'firebase/database';
import {
  deleteObject,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage';
import { database, storage } from '../lib/firebase';
import { makePhotoId, preparePhoto } from '../lib/photo';
import type { AuthUser, BabyPhoto, NewPhotoInput } from '../types';

const PHOTO_ROOT = 'kayla/photos';

function expectedPaths(id: string) {
  return {
    storagePath: `${PHOTO_ROOT}/bb_${id}.jpg`,
    thumbnailPath: `${PHOTO_ROOT}/bb_${id}_thumb.jpg`,
  };
}

function validPhoto(id: string, value: unknown): BabyPhoto | null {
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(id) || !value || typeof value !== 'object') return null;
  const candidate = value as Partial<Omit<BabyPhoto, 'id'>>;
  const paths = expectedPaths(id);
  if (
    candidate.storagePath !== paths.storagePath
    || candidate.thumbnailPath !== paths.thumbnailPath
    || typeof candidate.capturedAt !== 'number'
    || !Number.isFinite(candidate.capturedAt)
    || typeof candidate.createdAt !== 'number'
    || !Number.isFinite(candidate.createdAt)
    || typeof candidate.createdBy !== 'string'
    || typeof candidate.width !== 'number'
    || typeof candidate.height !== 'number'
  ) return null;

  return { id, ...candidate } as BabyPhoto;
}

function isMissingObject(error: unknown) {
  return Boolean(
    error
    && typeof error === 'object'
    && 'code' in error
    && (error as { code?: string }).code === 'storage/object-not-found',
  );
}

async function deleteIfPresent(path: string) {
  try {
    await deleteObject(storageRef(storage, path));
  } catch (error) {
    if (!isMissingObject(error)) throw error;
  }
}

function uploadPhotoFile(path: string, blob: Blob, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('已取消上傳。'));
      return;
    }
    const task = uploadBytesResumable(storageRef(storage, path), blob, {
      contentType: 'image/jpeg',
      cacheControl: 'private,max-age=3600',
    });
    const abort = () => task.cancel();
    const cleanup = () => signal?.removeEventListener('abort', abort);
    signal?.addEventListener('abort', abort, { once: true });
    task.on(
      'state_changed',
      undefined,
      (error) => {
        cleanup();
        reject(signal?.aborted ? new Error('已取消上傳。') : error);
      },
      () => {
        cleanup();
        resolve();
      },
    );
  });
}

export function useKaylaPhotos(user: AuthUser | null) {
  const userId = user?.uid;
  const isDemo = Boolean(user?.isDemo);
  const [photos, setPhotos] = useState<BabyPhoto[]>([]);
  const [loading, setLoading] = useState(Boolean(userId && !isDemo));
  const [error, setError] = useState<string | null>(null);
  const [dataUserId, setDataUserId] = useState<string | undefined>(isDemo ? userId : undefined);
  const demoUrls = useRef(new Set<string>());

  const revokeDemoUrls = useCallback(() => {
    demoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    demoUrls.current.clear();
  }, []);

  useEffect(() => revokeDemoUrls, [revokeDemoUrls]);

  useEffect(() => {
    setError(null);
    setPhotos([]);
    revokeDemoUrls();

    if (!userId) {
      setDataUserId(undefined);
      setLoading(false);
      return undefined;
    }

    setDataUserId(userId);
    if (isDemo) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const stop = onValue(
      databaseRef(database, 'kayla/photos'),
      (snapshot) => {
        const value = snapshot.val() as Record<string, unknown> | null;
        const nextPhotos = value
          ? Object.entries(value)
              .flatMap(([id, stored]) => {
                const photo = validPhoto(id, stored);
                return photo ? [photo] : [];
              })
              .sort((a, b) => b.capturedAt - a.capturedAt || b.createdAt - a.createdAt)
          : [];
        setPhotos(nextPhotos);
        setLoading(false);
      },
      () => {
        setPhotos([]);
        setError('未能讀取相簿，請將新版 /kayla/photos Rules 合併並發布。');
        setLoading(false);
      },
    );

    return stop;
  }, [userId, isDemo, revokeDemoUrls]);

  const addPhoto = useCallback(async (input: NewPhotoInput) => {
    if (!user) throw new Error('需要先登入');
    const caption = input.caption?.trim() || undefined;
    if (caption && caption.length > 500) throw new Error('相片說明最多 500 字。');
    if (!Number.isFinite(input.capturedAt) || input.capturedAt > Date.now() + 600_000) {
      throw new Error('相片日期或時間唔正確。');
    }

    const prepared = await preparePhoto(input.file);
    if (input.signal?.aborted) throw new Error('已取消上傳。');
    const id = makePhotoId();
    const paths = expectedPaths(id);
    const createdAt = Date.now();
    const photo: BabyPhoto = {
      id,
      ...paths,
      capturedAt: input.capturedAt,
      createdAt,
      createdBy: user.uid,
      createdByLabel: user.email?.split('@')[0] || '家庭成員',
      caption,
      width: prepared.width,
      height: prepared.height,
    };

    if (isDemo) {
      const demoUrl = URL.createObjectURL(prepared.main);
      const demoThumbnailUrl = URL.createObjectURL(prepared.thumbnail);
      demoUrls.current.add(demoUrl);
      demoUrls.current.add(demoThumbnailUrl);
      setPhotos((current) => [
        { ...photo, demoUrl, demoThumbnailUrl },
        ...current,
      ].sort((a, b) => b.capturedAt - a.capturedAt || b.createdAt - a.createdAt));
      return;
    }

    const uploaded: string[] = [];
    try {
      await uploadPhotoFile(paths.storagePath, prepared.main, input.signal);
      uploaded.push(paths.storagePath);
      await uploadPhotoFile(paths.thumbnailPath, prepared.thumbnail, input.signal);
      uploaded.push(paths.thumbnailPath);
      if (input.signal?.aborted) throw new Error('已取消上傳。');

      const { id: _id, demoUrl: _demoUrl, demoThumbnailUrl: _demoThumbnailUrl, ...stored } = photo;
      await set(databaseRef(database, `kayla/photos/${id}`), JSON.parse(JSON.stringify(stored)));
    } catch (uploadError) {
      await Promise.allSettled(uploaded.map(deleteIfPresent));
      throw uploadError;
    }
  }, [user, isDemo]);

  const deletePhoto = useCallback(async (photo: BabyPhoto) => {
    if (!user) throw new Error('需要先登入');
    const paths = expectedPaths(photo.id);
    if (photo.storagePath !== paths.storagePath || photo.thumbnailPath !== paths.thumbnailPath) {
      throw new Error('相片路徑唔正確。');
    }

    if (isDemo) {
      if (photo.demoUrl) {
        URL.revokeObjectURL(photo.demoUrl);
        demoUrls.current.delete(photo.demoUrl);
      }
      if (photo.demoThumbnailUrl) {
        URL.revokeObjectURL(photo.demoThumbnailUrl);
        demoUrls.current.delete(photo.demoThumbnailUrl);
      }
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      return;
    }

    // Storage and Realtime Database cannot share one atomic transaction.
    // Keep metadata until both files are gone so a failed delete can be retried.
    await deleteIfPresent(paths.thumbnailPath);
    await deleteIfPresent(paths.storagePath);
    await remove(databaseRef(database, `kayla/photos/${photo.id}`));
  }, [user, isDemo]);

  const belongsToCurrentUser = Boolean(userId && dataUserId === userId);
  return useMemo(() => ({
    photos: belongsToCurrentUser ? photos : [],
    loading: Boolean(userId && !isDemo && !belongsToCurrentUser) || loading,
    error,
    addPhoto,
    deletePhoto,
  }), [belongsToCurrentUser, photos, userId, isDemo, loading, error, addPhoto, deletePhoto]);
}
