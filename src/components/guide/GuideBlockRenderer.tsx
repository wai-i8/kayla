import { Icon } from '../Icon';
import { GuideMedia } from './GuideMedia';
import { GuideSourceChips } from './GuideSources';
import type { GuideBlock, GuideMediaItem, GuideSourceItem } from './types';

interface GuideBlockRendererProps {
  block: GuideBlock;
  media: Map<string, GuideMediaItem>;
  sources: Map<string, GuideSourceItem>;
}

function blockAnchor(id: string) {
  return `guide-block-${id}`;
}

function BlockSources({ block, sources }: Pick<GuideBlockRendererProps, 'block' | 'sources'>) {
  return <GuideSourceChips sourceIds={block.sourceIds} sources={sources} />;
}

export function GuideBlockRenderer({ block, media, sources }: GuideBlockRendererProps) {
  const anchor = blockAnchor(block.id);

  if (block.type === 'heading') {
    const Heading = block.level === 3 ? 'h3' : 'h2';
    return (
      <div className="guide-content-heading" id={anchor} tabIndex={-1}>
        <Heading>{block.text}</Heading>
        <BlockSources block={block} sources={sources} />
      </div>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <div className="guide-content-block guide-paragraph" id={anchor} tabIndex={-1}>
        <p>{block.text}</p>
        <BlockSources block={block} sources={sources} />
      </div>
    );
  }

  if (block.type === 'bullets') {
    return (
      <div className="guide-content-block guide-bullets" id={anchor} tabIndex={-1}>
        <ul>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</ul>
        <BlockSources block={block} sources={sources} />
      </div>
    );
  }

  if (block.type === 'steps') {
    return (
      <div className="guide-content-block guide-steps" id={anchor} tabIndex={-1}>
        <ol>
          {block.items.map((item, index) => {
            const step = typeof item === 'string' ? { body: item } : item;
            const stepMedia = step.mediaId ? media.get(step.mediaId) : undefined;
            return (
              <li key={`${block.id}-${index}`}>
                <span className="step-number" aria-hidden="true">{index + 1}</span>
                <div>
                  {step.title && <strong>{step.title}</strong>}
                  <p>{step.body}</p>
                  {stepMedia && <GuideMedia media={stepMedia} sources={sources} />}
                </div>
              </li>
            );
          })}
        </ol>
        <BlockSources block={block} sources={sources} />
      </div>
    );
  }

  if (block.type === 'table') {
    const columns = block.columns.map((column, index) => typeof column === 'string' ? { key: String(index), label: column } : column);
    return (
      <div className="guide-content-block guide-table-block" id={anchor} tabIndex={-1}>
        <div className="guide-table-scroll" tabIndex={0} role="region" aria-label={block.caption || '指南資料表'}>
          <table>
            {block.caption && <caption>{block.caption}</caption>}
            <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${block.id}-row-${rowIndex}`}>
                  {columns.map((column, columnIndex) => columnIndex === 0
                    ? <th key={column.key} scope="row">{Array.isArray(row) ? row[columnIndex] : row[column.key]}</th>
                    : <td key={column.key}>{Array.isArray(row) ? row[columnIndex] : row[column.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BlockSources block={block} sources={sources} />
      </div>
    );
  }

  if (block.type === 'warning' || block.type === 'callout') {
    return (
      <aside className={`guide-callout severity-${block.severity}`} id={anchor} tabIndex={-1} aria-labelledby={`${anchor}-title`}>
        <span className="guide-callout-icon"><Icon name={block.severity === 'info' ? 'shield' : 'alert'} /></span>
        <div>
          <h2 id={`${anchor}-title`}>{block.title}</h2>
          {block.body && <p>{block.body}</p>}
          {block.items?.length ? <ul>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}</ul> : null}
          {block.action && <a className="guide-callout-action" href={block.action.href}>{block.action.label}<span aria-hidden="true"> →</span></a>}
          <BlockSources block={block} sources={sources} />
        </div>
      </aside>
    );
  }

  if (block.type === 'media') {
    const item = media.get(block.mediaId);
    if (!item) return null;
    return <div className="guide-content-block" id={anchor} tabIndex={-1}><GuideMedia media={item} sources={sources} /><BlockSources block={block} sources={sources} /></div>;
  }

  if (block.type === 'official-link') {
    return (
      <a className="guide-official-link" id={anchor} href={block.href} target="_blank" rel="noreferrer">
        <span><Icon name="book" /></span>
        <span><small>OFFICIAL GUIDANCE</small><strong>{block.title}</strong>{block.description && <p>{block.description}</p>}</span>
        <span className="official-link-label">{block.label || '開啟'} <span aria-hidden="true">↗</span></span>
      </a>
    );
  }

  return null;
}
