import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { GuideSourceChips } from './GuideSources';
import type { GuideMediaItem, GuideSourceItem } from './types';

interface GuideMediaProps {
  media: GuideMediaItem;
  sources: Map<string, GuideSourceItem>;
}

function resolveAsset(asset?: string) {
  if (!asset) return '';
  if (/^(?:https?:|data:|blob:)/i.test(asset)) return asset;
  return `${import.meta.env.BASE_URL}${asset.replace(/^\/+/, '')}`;
}

function safeExternalHref(href?: string) {
  return href && /^https:\/\//i.test(href) ? href : undefined;
}

function MediaCaption({ media, sources }: GuideMediaProps) {
  const originUrl = safeExternalHref(media.originUrl);
  const licenceUrl = safeExternalHref(media.licenceUrl);
  if (!media.caption && !media.credit && !media.sourceId && !media.originUrl && !media.licenceUrl) return null;
  return (
    <figcaption>
      {media.caption && <span>{media.caption}</span>}
      {media.credit && <small>圖片／影片：{media.credit}</small>}
      {(originUrl || licenceUrl) && (
        <span className="guide-media-licence-links">
          {originUrl && <a href={originUrl} target="_blank" rel="noopener noreferrer">原相與作者資料 <span aria-hidden="true">↗</span></a>}
          {licenceUrl && <a href={licenceUrl} target="_blank" rel="noopener noreferrer">{media.licence || '使用授權'} <span aria-hidden="true">↗</span></a>}
        </span>
      )}
      <GuideSourceChips sourceIds={media.sourceId ? [media.sourceId] : undefined} sources={sources} />
    </figcaption>
  );
}

export function GuideMedia({ media, sources }: GuideMediaProps) {
  const source = media.sourceId ? sources.get(media.sourceId) : undefined;
  const href = safeExternalHref(media.href || media.originUrl || source?.url);
  const asset = resolveAsset(media.assetRef || media.src);
  const poster = resolveAsset(media.posterRef || media.poster);

  if (media.kind === 'external-video' || (!asset && href)) {
    return (
      <figure className="guide-media guide-official-media">
        {href ? (
          <a
            className="guide-official-media-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`開啟官方示範：${media.caption || media.alt}（開新視窗）`}
          >
            {poster && (
              <span className="guide-official-media-poster">
                <img src={poster} alt="" width={media.width} height={media.height} loading="lazy" decoding="async" />
                <span>官方影片</span>
              </span>
            )}
            <span className="official-media-copy">
              <span className="official-media-icon"><Icon name="image" size={21} /></span>
              <span>
                <small>{source ? (source.organisation || source.organization || source.publisher || '官方資料') : '官方示範'}</small>
                <strong>{media.caption || media.alt}</strong>
                {media.credit && <span className="official-media-credit">{media.credit}</span>}
              </span>
              <span className="official-media-action">開啟睇 <span aria-hidden="true">↗</span></span>
            </span>
          </a>
        ) : (
          <div className="official-media-copy">
            <span className="official-media-icon"><Icon name="image" size={21} /></span>
            <span><small>官方示範</small><strong>{media.caption || media.alt}</strong></span>
          </div>
        )}
      </figure>
    );
  }

  if (media.kind === 'video') {
    return (
      <figure className="guide-media">
        <video controls preload="metadata" poster={poster || undefined} aria-label={media.alt}>
          <source src={asset} />
          你嘅瀏覽器未能播放呢段影片。
        </video>
        <MediaCaption media={media} sources={sources} />
      </figure>
    );
  }

  return <GuideImage media={media} sources={sources} asset={asset} />;
}

interface GuideImageProps extends GuideMediaProps {
  asset: string;
}

function GuideImage({ media, sources, asset }: GuideImageProps) {
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `guide-image-title-${media.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const displayTitle = media.title || media.alt;

  useEffect(() => {
    if (!expanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setExpanded(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [expanded]);

  return (
    <>
      <figure className="guide-media guide-image-media">
        <button
          ref={triggerRef}
          className="guide-media-image-button"
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`放大圖片：${displayTitle}`}
        >
          <img
            src={asset}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            decoding="async"
          />
          <span className="guide-media-expand-hint"><Icon name="image" size={16} /> 撳圖放大</span>
        </button>
        <MediaCaption media={media} sources={sources} />
      </figure>
      {expanded && createPortal(
        <div
          className="guide-image-lightbox-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setExpanded(false);
          }}
        >
          <div
            ref={dialogRef}
            className="guide-image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="guide-image-lightbox-header">
              <h2 id={titleId}>{displayTitle}</h2>
              <button ref={closeRef} type="button" onClick={() => setExpanded(false)} aria-label="關閉放大圖片">
                <Icon name="close" />
              </button>
            </div>
            <div className="guide-image-lightbox-stage">
              <img src={asset} alt={media.alt} width={media.width} height={media.height} />
            </div>
            {media.caption && <p className="guide-image-lightbox-caption">{media.caption}</p>}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
