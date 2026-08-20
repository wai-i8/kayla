import coreTopicsData from './topics-core.json';
import careTopicsData from './topics-care.json';
import supportTopicsData from './topics-support.json';
import mediaData from './media.json';
import sourcesData from './sources.json';
import { searchGuideTopics } from '../../lib/guideSearch';
import { ageTimelineSections } from './timeline';
import type {
  GuideMediaItem,
  GuideSearchResult,
  GuideTopicContent,
  GuideTopicSummary,
} from '../../components/guide/types';
import type {
  GuideMediaReference,
  GuideSource,
  GuideTimelineEntry,
  GuideTopicAliases,
  RawGuideTopic,
} from './schema';

export const GUIDE_CHECKED_AT = '2026-08-20' as const;

export const guideSources = sourcesData as GuideSource[];
export const guideMediaCatalogue = mediaData as GuideMediaReference[];

const sourceIdSet = new Set(guideSources.map((source) => source.id));
const mediaById = new Map(guideMediaCatalogue.map((media) => [media.id, media]));

function adaptMedia(media: GuideMediaReference): GuideMediaItem {
  const isLocalImage = media.kind === 'image' && Boolean(media.assetRef);
  return {
    id: media.id,
    kind: isLocalImage ? 'image' : 'external-video',
    assetRef: isLocalImage ? media.assetRef : undefined,
    posterRef: media.posterRef,
    href: isLocalImage ? undefined : media.url,
    originUrl: media.originUrl,
    alt: media.alt,
    caption: `${media.title}。${media.note}`,
    credit: media.credit,
    licence: media.licence,
    licenceUrl: media.licenceUrl,
    sourceId: media.sourceId,
    width: media.width,
    height: media.height,
  };
}

const rawTopics = [
  ...(coreTopicsData as RawGuideTopic[]),
  ...(careTopicsData as RawGuideTopic[]),
  ...(supportTopicsData as RawGuideTopic[]),
];

export const guideTopics: GuideTopicContent[] = rawTopics.map((rawTopic) => {
  const { mediaIds = [], ...topic } = rawTopic;
  const media = mediaIds
    .map((id) => mediaById.get(id))
    .filter((item): item is GuideMediaReference => Boolean(item))
    .map(adaptMedia);
  const sourceIds = [...new Set([
    ...(topic.sourceIds || []),
    ...topic.blocks.flatMap((block) => block.sourceIds || []),
    ...media.flatMap((item) => item.sourceId ? [item.sourceId] : []),
  ])].filter((id) => sourceIdSet.has(id));
  return { ...topic, sourceIds, media };
});

export const guideTopicAliases = {
  checklists: 'timeline',
  'sources-and-version': 'using-and-recording',
} as const satisfies GuideTopicAliases;

export const legacyGuideTopicIds = [
  'emergency',
  'timeline',
  'feeding',
  'sleep',
  'first-aid',
  'symptoms',
  'safety',
  'caregiver-wellbeing',
  'checklists',
  'vaccinations',
  'local-help',
  'using-and-recording',
  'sources-and-version',
] as const;

export const requiredAgeTimelineIds = [
  'birth-2-hours',
  'day-1',
  'days-2-3',
  'days-3-7',
  'weeks-1-2',
  'weeks-3-4',
  'weeks-5-8',
  'months-2-3',
  'months-3-4',
  'months-4-5',
  'months-5-6',
] as const;

export { ageTimelineSections } from './timeline';

const topicById = new Map(guideTopics.map((topic) => [topic.id, topic]));

export function resolveGuideTopicId(id: string) {
  return guideTopicAliases[id as keyof typeof guideTopicAliases] || id;
}

export function getGuideTopic(id: string) {
  return topicById.get(resolveGuideTopicId(id));
}

export function loadGuideTopic(id: string): GuideTopicContent {
  const topic = getGuideTopic(id);
  if (!topic) throw new Error(`Unknown guide topic: ${id}`);
  return topic;
}

export const guideTopicSummaries: GuideTopicSummary[] = guideTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  shortTitle: topic.shortTitle || topic.title,
  summary: topic.summary,
  description: topic.summary,
  priority: topic.priority,
  ageRanges: topic.ageRanges,
}));

export function searchGuide(query: string): GuideSearchResult[] {
  return searchGuideTopics(guideTopics, query);
}

export const guideData = {
  checkedAt: GUIDE_CHECKED_AT,
  topics: guideTopics,
  topicSummaries: guideTopicSummaries,
  timeline: ageTimelineSections,
  sources: guideSources,
  media: guideMediaCatalogue,
  aliases: guideTopicAliases,
};

export type {
  GuideMediaReference,
  GuideSource,
  GuideTimelineEntry,
  RawGuideTopic,
} from './schema';
