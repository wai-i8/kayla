import type {
  GuideAgeTarget,
  GuideMediaItem,
  GuideSourceItem,
  GuideTopicContent,
} from '../../components/guide/types';

export type {
  GuideAgeRange,
  GuideAgeTarget,
  GuideBlock,
  GuideMediaItem,
  GuidePriority,
  GuideReview,
  GuideSearchResult,
  GuideSourceItem,
  GuideTopicContent,
  GuideTopicSummary,
} from '../../components/guide/types';

export type GuideRegion = 'England' | 'UK' | 'England · Warwickshire';

/** Source metadata kept by the data layer. It is a superset of the UI contract. */
export interface GuideSource extends GuideSourceItem {
  publisher: string;
  region: GuideRegion;
  checkedAt: '2026-08-20';
  reviewedAt?: string;
  note?: string;
}

/** Raw media catalogue entry. index.ts adapts it to GuideMediaItem. */
export interface GuideMediaReference {
  id: string;
  title: string;
  kind: 'video' | 'web-page' | 'image-placeholder' | 'image';
  usage: 'official-link-only' | 'original-placeholder' | 'local-licensed';
  sourceId?: string;
  url?: string;
  originUrl?: string;
  assetRef?: string;
  posterRef?: string;
  alt: string;
  note: string;
  credit?: string;
  licence?: string;
  licenceUrl?: string;
  width?: number;
  height?: number;
}

/** JSON topics use UI blocks and reference the central media catalogue by ID. */
export interface RawGuideTopic extends Omit<GuideTopicContent, 'media'> {
  mediaIds?: string[];
}

/** Timeline navigation target; extra text is useful to TodayPage adapters. */
export interface GuideTimelineEntry extends GuideAgeTarget {
  summary: string;
  topicIds: string[];
}

export type GuideTopicAliases = Record<string, string>;

/** Public adapter return type, documented here to keep index.ts compact. */
export type LoadedGuideTopic = GuideTopicContent & { media?: GuideMediaItem[] };
