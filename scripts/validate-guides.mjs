import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkedAt = '2026-08-20';
const errors = [];

function readJson(relativePath) {
  const path = resolve(root, relativePath);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${relativePath}: invalid JSON (${error.message})`);
    return [];
  }
}

function unique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (!item?.id) errors.push(`${label}: item without id`);
    else if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`);
    else seen.add(item.id);
  }
  return seen;
}

const sources = readJson('src/data/guides/sources.json');
const media = readJson('src/data/guides/media.json');
const timeline = readJson('src/data/guides/timeline.json');
const topics = [
  ...readJson('src/data/guides/topics-core.json'),
  ...readJson('src/data/guides/topics-care.json'),
  ...readJson('src/data/guides/topics-support.json'),
];

const sourceIds = unique(sources, 'sources');
const mediaIds = unique(media, 'media');
const topicIds = unique(topics, 'topics');
unique(timeline, 'timeline');

const aliases = {
  checklists: 'timeline',
  'sources-and-version': 'using-and-recording',
};
const resolveTopic = (id) => aliases[id] || id;
const legacyTopicIds = [
  'emergency', 'timeline', 'feeding', 'sleep', 'first-aid', 'symptoms', 'safety',
  'caregiver-wellbeing', 'checklists', 'vaccinations', 'local-help',
  'using-and-recording', 'sources-and-version',
];
const requiredTimelineIds = [
  'birth-2-hours', 'day-1', 'days-2-3', 'days-3-7', 'weeks-1-2', 'weeks-3-4',
  'weeks-5-8', 'months-2-3', 'months-3-4', 'months-4-5', 'months-5-6',
];

if (topics.length !== 12) errors.push(`topics: expected 12, found ${topics.length}`);

for (const id of legacyTopicIds) {
  if (!topicIds.has(resolveTopic(id))) errors.push(`legacy topic id does not resolve: ${id}`);
}

const actualTimelineIds = timeline.map((entry) => entry.id);
if (JSON.stringify(actualTimelineIds) !== JSON.stringify(requiredTimelineIds)) {
  errors.push(`timeline: required order/ids changed (${actualTimelineIds.join(', ')})`);
}

const allowedRegions = new Set(['England', 'UK', 'England · Warwickshire']);
for (const source of sources) {
  if (!/^https:\/\//.test(source.url || '')) errors.push(`source ${source.id}: URL must be HTTPS`);
  if (source.checkedAt !== checkedAt) errors.push(`source ${source.id}: checkedAt must be ${checkedAt}`);
  if (!allowedRegions.has(source.region)) errors.push(`source ${source.id}: invalid region ${source.region}`);
}

for (const item of media) {
  if (item.sourceId && !sourceIds.has(item.sourceId)) errors.push(`media ${item.id}: unknown source ${item.sourceId}`);
  if (item.usage === 'official-link-only') {
    if (!/^https:\/\//.test(item.url || '')) errors.push(`media ${item.id}: official link must be HTTPS`);
    if (item.assetRef) errors.push(`media ${item.id}: link-only media must not have a local asset`);
  } else if (item.usage === 'local-licensed') {
    if (!/^guide-media\/[A-Za-z0-9._-]+$/.test(item.assetRef || '')) {
      errors.push(`media ${item.id}: local assetRef must stay inside public/guide-media`);
    }
    if (!item.assetRef || !existsSync(resolve(root, 'public', item.assetRef))) {
      errors.push(`media ${item.id}: missing public/${item.assetRef || '(assetRef)'}`);
    }
    if (!item.credit || !/^https:\/\//.test(item.originUrl || '')) {
      errors.push(`media ${item.id}: local image needs credit and HTTPS originUrl`);
    }
    if (!item.licence || !/^https:\/\//.test(item.licenceUrl || '')) {
      errors.push(`media ${item.id}: local image needs a named licence and HTTPS licenceUrl`);
    }
  } else if (item.usage === 'original-placeholder') {
    if (item.assetRef || item.url) errors.push(`media ${item.id}: placeholder unexpectedly has an asset/URL`);
  } else {
    errors.push(`media ${item.id}: invalid usage ${item.usage}`);
  }
}

for (const topic of topics) {
  if (topic.review?.reviewedAt !== checkedAt) errors.push(`topic ${topic.id}: review date must be ${checkedAt}`);
  if (!allowedRegions.has(topic.review?.region)) errors.push(`topic ${topic.id}: invalid/missing review region`);
  if (!Array.isArray(topic.blocks) || !topic.blocks.length) errors.push(`topic ${topic.id}: no blocks`);

  for (const sourceId of topic.sourceIds || []) {
    if (!sourceIds.has(sourceId)) errors.push(`topic ${topic.id}: unknown source ${sourceId}`);
  }
  for (const mediaId of topic.mediaIds || []) {
    if (!mediaIds.has(mediaId)) errors.push(`topic ${topic.id}: unknown media ${mediaId}`);
  }

  const blockIds = unique(topic.blocks || [], `topic ${topic.id} blocks`);
  const referencedMediaIds = new Set();
  for (const block of topic.blocks || []) {
    const requiresCitation = block.type !== 'heading';
    if (requiresCitation && (!Array.isArray(block.sourceIds) || !block.sourceIds.length)) {
      errors.push(`topic ${topic.id}/${block.id}: content block has no direct sourceIds`);
    }
    for (const sourceId of block.sourceIds || []) {
      if (!sourceIds.has(sourceId)) errors.push(`topic ${topic.id}/${block.id}: unknown source ${sourceId}`);
    }
    if (block.type === 'media') {
      referencedMediaIds.add(block.mediaId);
      if (!mediaIds.has(block.mediaId)) errors.push(`topic ${topic.id}/${block.id}: unknown media ${block.mediaId}`);
      if (!(topic.mediaIds || []).includes(block.mediaId)) errors.push(`topic ${topic.id}/${block.id}: media not injected by topic.mediaIds`);
    }
    if (block.type === 'steps') {
      for (const step of block.items || []) {
        if (typeof step !== 'object' || !step.mediaId) continue;
        referencedMediaIds.add(step.mediaId);
        if (!mediaIds.has(step.mediaId)) errors.push(`topic ${topic.id}/${block.id}: unknown step media ${step.mediaId}`);
        if (!(topic.mediaIds || []).includes(step.mediaId)) errors.push(`topic ${topic.id}/${block.id}: step media not injected by topic.mediaIds`);
      }
    }
    if (block.type === 'official-link' && !/^https:\/\//.test(block.href || '')) {
      errors.push(`topic ${topic.id}/${block.id}: official link must use HTTPS`);
    }
    if (block.action && !/^(?:https:\/\/|tel:(?:999|111)$)/.test(block.action.href || '')) {
      errors.push(`topic ${topic.id}/${block.id}: unsafe action URL`);
    }
    if (block.type === 'table') {
      const columnKeys = (block.columns || []).map((column, index) => typeof column === 'string' ? String(index) : column.key);
      for (const [rowIndex, row] of (block.rows || []).entries()) {
        if (Array.isArray(row) && row.length !== columnKeys.length) errors.push(`topic ${topic.id}/${block.id}: row ${rowIndex} has wrong column count`);
        if (!Array.isArray(row) && columnKeys.some((key) => !(key in row))) errors.push(`topic ${topic.id}/${block.id}: row ${rowIndex} is missing a column key`);
      }
    }
  }
  for (const mediaId of topic.mediaIds || []) {
    if (!referencedMediaIds.has(mediaId)) errors.push(`topic ${topic.id}: injected media is never rendered: ${mediaId}`);
  }

  if (topic.id === 'timeline') {
    for (const id of requiredTimelineIds) {
      if (!blockIds.has(id)) errors.push(`timeline topic: missing anchor block ${id}`);
    }
  }
}

for (const entry of timeline) {
  if (entry.topicId !== 'timeline' || entry.anchor !== entry.id) {
    errors.push(`timeline ${entry.id}: topicId/anchor contract changed`);
  }
  for (const topicId of entry.topicIds || []) {
    if (!topicIds.has(resolveTopic(topicId))) errors.push(`timeline ${entry.id}: unknown topic ${topicId}`);
  }
}

const allText = JSON.stringify(topics);
const bannedStalePhrases = [
  '兩指在胸骨下半部',
  'NHS 官方頁有完整嬰兒 CPR',
  '網站唔會自動換算或建議藥物劑量',
  '唔會自動計劑量',
  '2026 年 1 月起',
];
for (const phrase of bannedStalePhrases) {
  if (allText.includes(phrase)) errors.push(`content: stale/unsafe phrase remains: ${phrase}`);
}
if (!allText.includes('至少 1 litre 新鮮凍水喉水')) errors.push('feeding: >=1 litre fresh cold tap-water formula step missing');
if (!allText.includes('nhs-urgent-under-five-2026')) errors.push('routing: canonical Aug 2026 NHS under-5 source is not used');
if (!allText.includes('rcuk-baby-cpr-2025') || !allText.includes('rcuk-choking-2025')) errors.push('first aid: current RCUK sources are not used');
if (!allText.includes('兩隻拇指並排') || !allText.includes('5 次人工呼吸')) errors.push('first aid: complete current infant choking escalation is missing');
if (!allText.includes('超過 15 個月')) errors.push('car seat: R129 rear-facing threshold is missing');
if (!allText.includes('重濕／明顯濕尿片')) errors.push('feeding: heavy wet nappy wording is missing');
if (allText.includes('photo-skin-to-skin')) errors.push('media: unsafe skin-to-skin photograph must not be rendered');

const jaundiceBlocks = topics.flatMap((topic) => (topic.blocks || []).filter((block) => block.id === 'jaundice' || block.id === 'days-2-3'));
if (JSON.stringify(jaundiceBlocks).includes('12 小時')) errors.push('jaundice: must not wait 12 hours for a wet nappy');

if (errors.length) {
  console.error(`Guide validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Guide validation OK: ${topics.length} topics, ${timeline.length} age targets, ${sources.length} sources, ${media.length} media entries.`);
}
