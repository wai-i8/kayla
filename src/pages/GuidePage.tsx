import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ageTimelineSections,
  guideSources,
  guideTopicSummaries,
  loadGuideTopic,
  resolveGuideTopicId,
  searchGuide,
} from '../data/guides/index';
import { GuideBlockRenderer } from '../components/guide/GuideBlockRenderer';
import { GuideSourceList } from '../components/guide/GuideSources';
import type {
  GuideAgeTarget,
  GuideMediaItem,
  GuidePriority,
  GuideSearchResult,
  GuideSourceItem,
  GuideTopicContent,
  GuideTopicSummary,
} from '../components/guide/types';
import { Icon } from '../components/Icon';

interface GuidePageProps {
  initialSectionId?: string | null;
  onSectionOpened?: () => void;
}

const topicSummaries = (guideTopicSummaries as unknown as Array<GuideTopicSummary & { description?: string }>).map((item) => ({
  ...item,
  summary: item.summary || item.description || '',
}));
const ageTargets = ageTimelineSections as unknown as GuideAgeTarget[];

function sourceArray(value: unknown): GuideSourceItem[] {
  if (Array.isArray(value)) return value as GuideSourceItem[];
  if (value && typeof value === 'object') return Object.values(value) as GuideSourceItem[];
  return [];
}

const sourceItems = sourceArray(guideSources);
const sourceMap = new Map(sourceItems.map((source) => [source.id, source]));

function priorityMeta(priority?: GuidePriority) {
  if (priority === 'urgent') return { label: '安全優先', className: 'urgent', icon: 'alert' as const };
  if (priority === 'important') return { label: '重要', className: 'important', icon: 'shield' as const };
  return { label: '參考', className: 'reference', icon: 'book' as const };
}

function reviewDate(date?: string) {
  if (!date) return '待查核';
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('zh-HK', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

function topicFromModule(value: unknown): GuideTopicContent {
  const candidate = value && typeof value === 'object' && 'default' in value
    ? (value as { default: unknown }).default
    : value;
  return candidate as GuideTopicContent;
}

function searchResultsFrom(value: unknown): GuideSearchResult[] {
  return Array.isArray(value) ? value as GuideSearchResult[] : [];
}

export function GuidePageView({ initialSectionId, onSectionOpened }: GuidePageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GuideSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [targetAnchor, setTargetAnchor] = useState<string | null>(null);
  const [topic, setTopic] = useState<GuideTopicContent | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [loadRequest, setLoadRequest] = useState(0);
  const articleTitleRef = useRef<HTMLHeadingElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const openTopic = useCallback((topicId: string, anchor?: string | null, trigger?: HTMLElement | null) => {
    if (trigger) lastTriggerRef.current = trigger;
    setSelectedTopicId(topicId);
    setTargetAnchor(anchor || null);
    setTopic(null);
    setTopicError('');
    setLoadRequest((request) => request + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTopic = () => {
    setSelectedTopicId(null);
    setTargetAnchor(null);
    setTopic(null);
    setTopicError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!initialSectionId) return;
    const resolvedSectionId = resolveGuideTopicId(initialSectionId);
    const directTopic = topicSummaries.find((item) => item.id === resolvedSectionId);
    const ageTarget = ageTargets.find((item) => item.id === initialSectionId);
    if (directTopic) {
      openTopic(directTopic.id);
    } else if (ageTarget) {
      openTopic(ageTarget.topicId || 'timeline', ageTarget.anchor || ageTarget.id);
    }
    onSectionOpened?.();
  }, [initialSectionId, onSectionOpened, openTopic]);

  useEffect(() => {
    if (!selectedTopicId) return undefined;
    let cancelled = false;
    setLoadingTopic(true);
    setTopicError('');

    Promise.resolve()
      .then(() => loadGuideTopic(selectedTopicId))
      .then((loaded) => {
        if (!cancelled) setTopic(topicFromModule(loaded));
      })
      .catch(() => {
        if (!cancelled) setTopicError('暫時載入唔到呢篇指南，請再試一次。');
      })
      .finally(() => {
        if (!cancelled) setLoadingTopic(false);
      });

    return () => { cancelled = true; };
  }, [selectedTopicId, loadRequest]);

  useEffect(() => {
    if (!topic) return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (targetAnchor) {
        const rawAnchor = targetAnchor.startsWith('guide-block-') ? targetAnchor : `guide-block-${targetAnchor}`;
        const target = document.getElementById(rawAnchor);
        if (target) {
          target.scrollIntoView({ block: 'start' });
          target.focus({ preventScroll: true });
          return;
        }
      }
      articleTitleRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [topic, targetAnchor]);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      Promise.resolve()
        .then(() => searchGuide(clean))
        .then((value) => {
          if (!cancelled) setResults(searchResultsFrom(value));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const selectedSummary = useMemo(
    () => topicSummaries.find((item) => item.id === selectedTopicId),
    [selectedTopicId],
  );

  if (selectedTopicId) {
    const visibleTopic = topic || selectedSummary;
    const priority = priorityMeta(topic?.priority || selectedSummary?.priority);
    const mediaMap = new Map((topic?.media || []).map((item: GuideMediaItem) => [item.id, item]));
    const allSourceIds = topic
      ? [
          ...(topic.sourceIds || []),
          ...topic.blocks.flatMap((block) => block.sourceIds || []),
          ...(topic.media || []).flatMap((item) => item.sourceId ? [item.sourceId] : []),
        ]
      : [];

    return (
      <div className="page guide-detail-page">
        <button className="back-button" onClick={closeTopic}>← 返回所有指南</button>

        {loadingTopic && !topic ? (
          <div className="guide-loading" role="status" aria-live="polite">
            <span className="guide-loading-mark" />
            <div><strong>載入指南…</strong><p>整理緊重點同官方資料來源。</p></div>
          </div>
        ) : topicError && !topic ? (
          <div className="large-empty compact-empty guide-load-error" role="alert">
            <Icon name="alert" />
            <h2>載入唔到指南</h2>
            <p>{topicError}</p>
            <button className="primary-button" onClick={() => setLoadRequest((request) => request + 1)}>再試一次</button>
          </div>
        ) : visibleTopic ? (
          <>
            <header className="guide-detail-header">
              <span className={`priority-pill ${priority.className}`}><Icon name={priority.icon} size={15} />{priority.label}</span>
              <p className="eyebrow">BABY CARE · ENGLAND</p>
              <h1 ref={articleTitleRef} tabIndex={-1}>{visibleTopic.title}</h1>
              <p>{visibleTopic.summary}</p>
              {topic?.ageRanges?.length ? <div className="guide-age-pills" aria-label="適用月齡">{topic.ageRanges.map((age) => <span key={age.label}>{age.label}</span>)}</div> : null}
              {topic?.review && (
                <div className={`guide-review-meta ${topic.review.status === 'needs-review' ? 'needs-review' : ''}`}>
                  <Icon name={topic.review.status === 'needs-review' ? 'alert' : 'check'} size={14} />
                  <span>{topic.review.status === 'needs-review' ? '呢篇資料需要重新查核' : `最後查核：${reviewDate(topic.review.reviewedAt)}`}</span>
                </div>
              )}
            </header>

            <div className="medical-notice">
              <Icon name="shield" />
              <p><strong>安全導航，唔係個別診斷。</strong>生命危險請即刻 call 999；急需判斷請 call NHS 111。早產、低出生體重或有特別醫療需要嘅 BB，應以醫護人員嘅個別指示為先。</p>
            </div>

            {topic && (
              <article className="guide-structured-article" aria-label={topic.title}>
                {topic.blocks.map((block) => (
                  <GuideBlockRenderer key={block.id} block={block} media={mediaMap} sources={sourceMap} />
                ))}
              </article>
            )}

            {topic && <GuideSourceList sourceIds={allSourceIds} sources={sourceMap} />}
            <footer className="guide-source-footer">
              資料最後查核：{reviewDate(topic?.review?.reviewedAt)}
              {topic?.review?.region ? ` · ${topic.review.region}` : ' · 英格蘭'}
            </footer>
          </>
        ) : null}
      </div>
    );
  }

  const emergencyTopic = topicSummaries.find((item) => item.id === 'emergency');

  return (
    <div className="page guide-page">
      <header className="page-header guide-main-header">
        <div>
          <p className="eyebrow">英國可信資料 · 英格蘭安排</p>
          <h1>照顧指南</h1>
          <p>PDF 留作參考；內容重新按主題整理，方便電話閱讀同查找官方來源。</p>
        </div>
        <div className="edition-chip">資料查核<br /><strong>逐篇顯示</strong></div>
      </header>

      <div className="guide-search">
        <Icon name="search" size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋發燒、餵奶、安全睡眠…" aria-label="搜尋指南" />
        {searching ? <span className="guide-search-spinner" aria-label="搜尋緊" /> : query && <button onClick={() => setQuery('')} aria-label="清除搜尋"><Icon name="close" size={17} /></button>}
      </div>

      {query.trim() ? (
        <section className="search-results" aria-live="polite" aria-busy={searching}>
          <div className="section-heading"><div><p className="eyebrow">SEARCH</p><h2>搜尋結果</h2></div><span>{searching ? '搜尋緊…' : `${results.length} 項`}</span></div>
          {!searching && results.length ? results.map((result, index) => (
            <button
              className="search-result-card structured-search-result"
              key={result.id || `${result.topicId}-${result.blockId || result.anchor || index}`}
              onClick={(event) => openTopic(result.topicId, result.blockId || result.anchor, event.currentTarget)}
            >
              <span>{result.topicTitle || topicSummaries.find((item) => item.id === result.topicId)?.shortTitle || '指南'}</span>
              <span className="search-result-copy"><strong>{result.title}</strong><p>{result.snippet || result.text || ''}</p></span>
              <Icon name="chevron" />
            </button>
          )) : !searching ? (
            <div className="large-empty compact-empty"><Icon name="search" /><h2>搵唔到相關內容</h2><p>可以試下較短嘅字，或者中英文名稱，例如「黃疸」或「jaundice」。</p></div>
          ) : null}
        </section>
      ) : (
        <>
          {emergencyTopic && (
            <button className="emergency-guide-card" onClick={(event) => openTopic(emergencyTopic.id, null, event.currentTarget)}>
              <span className="emergency-guide-icon"><Icon name="alert" /></span>
              <span><small>緊急判斷</small><strong>{emergencyTopic.title}</strong></span>
              <Icon name="chevron" />
            </button>
          )}

          <section className="guide-section-list">
            <div className="section-heading"><div><p className="eyebrow">BROWSE BY TOPIC</p><h2>按主題瀏覽</h2></div><span>{topicSummaries.length} 個主題</span></div>
            <div className="guide-grid">
              {topicSummaries.filter((item) => item.id !== 'emergency').map((item, index) => {
                const priority = priorityMeta(item.priority);
                const tones = ['sage', 'peach', 'blue', 'gold', 'rose'];
                return (
                  <button className="guide-topic-card" key={item.id} onClick={(event) => openTopic(item.id, null, event.currentTarget)}>
                    <span className={`topic-art tone-${tones[index % tones.length]}`}><Icon name={priority.icon} /></span>
                    <span className="topic-copy">
                      <small>{item.shortTitle}</small>
                      <strong>{item.title}</strong>
                      <p>{item.summary}</p>
                    </span>
                    <Icon name="chevron" size={18} />
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
