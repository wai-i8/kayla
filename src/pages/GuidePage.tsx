import { useEffect, useMemo, useState } from 'react';
import guideBook from '../data/guidePages.json';
import { ageTimelineSections, guideSections, guideSourceContext, type GuideSection } from '../data/guideSections';
import type { GuidePage } from '../types';
import { Icon } from '../components/Icon';

interface GuidePageProps {
  initialSectionId?: string | null;
  onSectionOpened?: () => void;
}

const pages = guideBook.pages as GuidePage[];
const guideDomainPattern = /((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
const wholeGuideDomainPattern = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s]*)?$/i;

function GuideText({ text }: { text: string }) {
  return (
    <div className="extracted-copy">
      {text.split(guideDomainPattern).map((part, index) => (
        wholeGuideDomainPattern.test(part)
          ? <a key={`${part}-${index}`} href={part.startsWith('http') ? part : `https://${part}`} target="_blank" rel="noreferrer">{part}</a>
          : part
      ))}
    </div>
  );
}

function sectionPages(section: GuideSection) {
  const pageNumbers = new Set<number>();
  section.pageRanges.forEach((range) => {
    for (let page = range.from; page <= range.to; page += 1) pageNumbers.add(page);
  });
  return pages.filter((page) => pageNumbers.has(page.page));
}

function priorityMeta(priority?: GuideSection['priority']) {
  if (priority === 'urgent') return { label: '安全優先', className: 'urgent', icon: 'alert' as const };
  if (priority === 'important') return { label: '重要', className: 'important', icon: 'shield' as const };
  return { label: '參考', className: 'reference', icon: 'book' as const };
}

export function GuidePageView({ initialSectionId, onSectionOpened }: GuidePageProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<GuideSection | null>(null);
  const [focusedPage, setFocusedPage] = useState<number | null>(null);

  useEffect(() => {
    if (!initialSectionId) return;
    const section = guideSections.find((item) => item.id === initialSectionId);
    if (section) {
      setFocusedPage(null);
      setSelected(section);
    } else {
      const ageSection = ageTimelineSections.find((item) => item.id === initialSectionId);
      const timeline = guideSections.find((item) => item.id === 'timeline');
      if (ageSection && timeline) {
        setFocusedPage(null);
        setSelected({
          ...timeline,
          id: ageSection.id,
          title: ageSection.title,
          shortTitle: ageSection.ageLabel,
          description: `${ageSection.ageLabel}嘅照顧重點；內容來自完整 0–6 個月時間線。`,
          pageRanges: ageSection.pageRanges,
        });
      }
    }
    onSectionOpened?.();
  }, [initialSectionId, onSectionOpened]);

  const searchResults = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return pages
      .filter((page) => page.text.toLowerCase().includes(clean))
      .slice(0, 12);
  }, [query]);

  useEffect(() => {
    if (!selected || focusedPage === null) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(`guide-page-${focusedPage}`)?.scrollIntoView({ block: 'start' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selected, focusedPage]);

  if (selected) {
    const naturalPages = sectionPages(selected);
    const detailPages = focusedPage === null
      ? naturalPages
      : [...naturalPages].sort((left, right) => {
          if (left.page === focusedPage) return -1;
          if (right.page === focusedPage) return 1;
          return left.page - right.page;
        });
    const priority = priorityMeta(selected.priority);
    return (
      <div className="page guide-detail-page">
        <button className="back-button" onClick={() => { setSelected(null); setFocusedPage(null); }}>← 返回所有指南</button>
        <header className="guide-detail-header">
          <span className={`priority-pill ${priority.className}`}><Icon name={priority.icon} size={15} />{priority.label}</span>
          <p className="eyebrow">NEWBORN CARE · ENGLAND</p>
          <h1>{selected.title}</h1>
          <p>{selected.description}</p>
        </header>
        <div className="medical-notice"><Icon name="shield" /><p><strong>安全導航，不係個別診斷。</strong>{guideSourceContext.notice}</p></div>
        <div className="guide-article">
          {detailPages.map((page) => (
            <section id={`guide-page-${page.page}`} key={page.page} className={`guide-page-copy ${focusedPage === page.page ? 'search-focus' : ''}`}>
              <div className="page-number">原書第 {page.page} 頁</div>
              <GuideText text={page.text} />
            </section>
          ))}
        </div>
        <footer className="guide-source-footer">資料查核：{guideSourceContext.checkedAt} · {guideSourceContext.edition} · {guideSourceContext.region}</footer>
      </div>
    );
  }

  return (
    <div className="page guide-page">
      <header className="page-header guide-main-header">
        <div><p className="eyebrow">2026–27 英國版</p><h1>照顧指南</h1><p>由 PDF 整理成可以搜尋同按主題閱讀嘅版本。</p></div>
        <div className="edition-chip">資料查核<br /><strong>18 Aug 2026</strong></div>
      </header>

      <div className="guide-search">
        <Icon name="search" size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋發燒、餵奶、安全睡眠…" aria-label="搜尋指南" />
        {query && <button onClick={() => setQuery('')} aria-label="清除搜尋"><Icon name="close" size={17} /></button>}
      </div>

      {query.trim() ? (
        <section className="search-results">
          <div className="section-heading"><div><p className="eyebrow">SEARCH</p><h2>搜尋結果</h2></div><span>{searchResults.length} 頁</span></div>
          {searchResults.length ? searchResults.map((page) => (
            <button className="search-result-card" key={page.page} onClick={() => {
              const matching = guideSections.find((section) => section.pageRanges.some((range) => page.page >= range.from && page.page <= range.to));
              if (matching) {
                setFocusedPage(page.page);
                setSelected(matching);
              }
            }}>
              <span>第 {page.page} 頁</span>
              <p>{page.text.replace(/\n/g, ' ').slice(0, 180)}…</p>
              <Icon name="chevron" />
            </button>
          )) : <div className="large-empty compact-empty"><Icon name="search" /><h2>搵唔到相關內容</h2><p>可以試下用較短嘅關鍵字，例如「黃疸」或「尿片」。</p></div>}
        </section>
      ) : (
        <>
          <button className="emergency-guide-card" onClick={() => { setFocusedPage(null); setSelected(guideSections[0]); }}>
            <span className="emergency-guide-icon"><Icon name="alert" /></span>
            <span><small>30 秒緊急判斷</small><strong>幾時要 call 999 或 NHS 111？</strong></span>
            <Icon name="chevron" />
          </button>

          <section className="guide-section-list">
            <div className="section-heading"><div><p className="eyebrow">BROWSE BY TOPIC</p><h2>按主題瀏覽</h2></div><span>{guideSections.length} 個主題</span></div>
            <div className="guide-grid">
              {guideSections.slice(1).map((section, index) => {
                const priority = priorityMeta(section.priority);
                const tones = ['sage', 'peach', 'blue', 'gold', 'rose'];
                return (
                  <button className="guide-topic-card" key={section.id} onClick={() => { setFocusedPage(null); setSelected(section); }}>
                    <span className={`topic-art tone-${tones[index % tones.length]}`}><Icon name={priority.icon} /></span>
                    <span className="topic-copy"><small>{section.shortTitle}</small><strong>{section.title}</strong><p>{section.description}</p></span>
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
