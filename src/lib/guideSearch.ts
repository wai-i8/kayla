import type {
  GuideBlock,
  GuideSearchResult,
  GuideTopicContent,
} from '../components/guide/types';

function normalize(value: string) {
  return value.toLocaleLowerCase('zh-HK').replace(/\s+/g, ' ').trim();
}

function blockTitle(block: GuideBlock, topicTitle: string) {
  if (block.type === 'heading') return block.text;
  if (block.type === 'warning' || block.type === 'callout') return block.title;
  if (block.type === 'official-link') return block.title;
  if (block.type === 'table') return block.caption || topicTitle;
  return topicTitle;
}

function blockText(block: GuideBlock) {
  if (block.type === 'heading' || block.type === 'paragraph') return block.text;
  if (block.type === 'bullets') return block.items.join(' · ');
  if (block.type === 'steps') {
    return block.items.map((item) => typeof item === 'string'
      ? item
      : [item.title, item.body].filter(Boolean).join('：')).join(' · ');
  }
  if (block.type === 'table') {
    const columns = block.columns.map((column) => typeof column === 'string' ? column : column.label);
    const rows = block.rows.flatMap((row) => Array.isArray(row) ? row : Object.values(row));
    return [block.caption, ...columns, ...rows].filter(Boolean).join(' · ');
  }
  if (block.type === 'warning' || block.type === 'callout') {
    return [block.title, block.body, ...(block.items || [])].filter(Boolean).join(' · ');
  }
  if (block.type === 'official-link') return [block.title, block.description].filter(Boolean).join(' · ');
  return '';
}

function snippet(text: string, query: string) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= 132) return compact;
  const index = normalize(compact).indexOf(query);
  const start = Math.max(0, index > -1 ? index - 36 : 0);
  const end = Math.min(compact.length, start + 132);
  return `${start ? '…' : ''}${compact.slice(start, end)}${end < compact.length ? '…' : ''}`;
}

export function searchGuideTopics(
  topics: GuideTopicContent[],
  rawQuery: string,
  limit = 40,
): GuideSearchResult[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const results: Array<GuideSearchResult & { score: number }> = [];

  for (const topic of topics) {
    const topicHaystack = normalize([
      topic.title,
      topic.shortTitle,
      topic.summary,
      ...(topic.keywords || []),
      ...(topic.aliases || []),
    ].filter(Boolean).join(' '));

    if (topicHaystack.includes(query)) {
      results.push({
        id: `${topic.id}-topic`,
        topicId: topic.id,
        title: topic.title,
        topicTitle: topic.title,
        snippet: topic.summary,
        priority: topic.priority,
        score: normalize(`${topic.title} ${topic.shortTitle || ''}`).includes(query) ? 4 : 2,
      });
    }

    for (const block of topic.blocks) {
      const text = blockText(block);
      if (!text || !normalize(text).includes(query)) continue;
      results.push({
        id: `${topic.id}-${block.id}`,
        topicId: topic.id,
        blockId: block.id,
        anchor: block.id,
        title: blockTitle(block, topic.title),
        topicTitle: topic.title,
        snippet: snippet(text, query),
        priority: topic.priority,
        score: normalize(blockTitle(block, topic.title)).includes(query) ? 3 : 1,
      });
    }
  }

  return results
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ score: _score, ...result }) => result);
}
