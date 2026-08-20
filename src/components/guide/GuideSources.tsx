import { Icon } from '../Icon';
import type { GuideSourceItem } from './types';

interface GuideSourceChipsProps {
  sourceIds?: string[];
  sources: Map<string, GuideSourceItem>;
  compact?: boolean;
}

function sourcePublisher(source: GuideSourceItem) {
  return source.organisation || source.organization || source.publisher || source.title;
}

export function GuideSourceChips({ sourceIds, sources, compact = true }: GuideSourceChipsProps) {
  const resolved = [...new Set(sourceIds || [])]
    .map((id) => sources.get(id))
    .filter((source): source is GuideSourceItem => Boolean(source));

  if (!resolved.length) return null;

  return (
    <div className={`guide-source-chips ${compact ? 'compact' : ''}`} aria-label="呢段內容嘅資料來源">
      {resolved.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title} aria-label={`資料來源：${source.title}（開新視窗）`}>
          {sourcePublisher(source)}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

interface GuideSourceListProps {
  sourceIds?: string[];
  sources: Map<string, GuideSourceItem>;
}

export function GuideSourceList({ sourceIds, sources }: GuideSourceListProps) {
  const resolved = [...new Set(sourceIds || [])]
    .map((id) => sources.get(id))
    .filter((source): source is GuideSourceItem => Boolean(source));

  if (!resolved.length) return null;

  return (
    <section className="guide-sources" aria-labelledby="guide-sources-heading">
      <div className="guide-sources-heading">
        <span><Icon name="shield" size={17} /></span>
        <div>
          <p className="eyebrow">SOURCES</p>
          <h2 id="guide-sources-heading">可信資料來源</h2>
        </div>
      </div>
      <ul>
        {resolved.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              <strong>{source.title}</strong>
              <span>{sourcePublisher(source)}{source.updatedAt ? ` · 更新 ${source.updatedAt}` : ''}{source.checkedAt || source.accessedAt ? ` · 核對 ${source.checkedAt || source.accessedAt}` : ''}</span>
              <small>開啟官方網頁 <span aria-hidden="true">↗</span></small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
