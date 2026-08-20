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

function MediaCaption({ media, sources }: GuideMediaProps) {
  if (!media.caption && !media.credit && !media.sourceId && !media.originUrl && !media.licenceUrl) return null;
  return (
    <figcaption>
      {media.caption && <span>{media.caption}</span>}
      {media.credit && <small>圖片／影片：{media.credit}</small>}
      {(media.originUrl || media.licenceUrl) && (
        <span className="guide-media-licence-links">
          {media.originUrl && <a href={media.originUrl} target="_blank" rel="noreferrer">原相與作者資料 <span aria-hidden="true">↗</span></a>}
          {media.licenceUrl && <a href={media.licenceUrl} target="_blank" rel="noreferrer">{media.licence || '使用授權'} <span aria-hidden="true">↗</span></a>}
        </span>
      )}
      <GuideSourceChips sourceIds={media.sourceId ? [media.sourceId] : undefined} sources={sources} />
    </figcaption>
  );
}

export function GuideMedia({ media, sources }: GuideMediaProps) {
  const source = media.sourceId ? sources.get(media.sourceId) : undefined;
  const href = media.href || media.originUrl || source?.url;
  const asset = resolveAsset(media.assetRef || media.src);
  const poster = resolveAsset(media.posterRef || media.poster);

  if (media.kind === 'external-video' || (!asset && href)) {
    return (
      <figure className="guide-media guide-official-media">
        {poster && <img src={poster} alt="" width={media.width} height={media.height} loading="lazy" decoding="async" />}
        <div className="official-media-copy">
          <span className="official-media-icon"><Icon name="image" size={21} /></span>
          <div>
            <small>{source ? (source.organisation || source.organization || source.publisher || '官方資料') : '官方示範'}</small>
            <strong>{media.caption || media.alt}</strong>
            {media.credit && <p>{media.credit}</p>}
          </div>
          {href && <a href={href} target="_blank" rel="noreferrer" aria-label={`開啟官方示範：${media.caption || media.alt}`}><Icon name="chevron" /></a>}
        </div>
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

  return (
    <figure className="guide-media">
      <img
        src={asset}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
      />
      <MediaCaption media={media} sources={sources} />
    </figure>
  );
}
