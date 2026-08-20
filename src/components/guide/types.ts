export type GuidePriority = 'urgent' | 'important' | 'reference';

export interface GuideReview {
  reviewedAt: string;
  nextReviewAt?: string;
  region?: string;
  status?: 'reviewed' | 'needs-review';
  reviewedBy?: string;
}

export interface GuideAgeRange {
  label: string;
  fromDays?: number;
  toDays?: number;
}

export interface GuideSourceItem {
  id: string;
  title: string;
  organisation?: string;
  organization?: string;
  publisher?: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  accessedAt?: string;
  checkedAt?: string;
  licence?: string;
  licenceUrl?: string;
}

export interface GuideMediaItem {
  id: string;
  kind: 'image' | 'video' | 'external-video';
  assetRef?: string;
  src?: string;
  href?: string;
  posterRef?: string;
  poster?: string;
  alt: string;
  caption?: string;
  credit?: string;
  licence?: string;
  licenceUrl?: string;
  sourceId?: string;
  originUrl?: string;
  width?: number;
  height?: number;
}

interface GuideBlockBase {
  id: string;
  sourceIds?: string[];
}

export type GuideBlock =
  | (GuideBlockBase & { type: 'heading'; level: 2 | 3; text: string })
  | (GuideBlockBase & { type: 'paragraph'; text: string })
  | (GuideBlockBase & { type: 'bullets'; items: string[] })
  | (GuideBlockBase & {
      type: 'steps';
      items: Array<string | { title?: string; body: string; mediaId?: string }>;
    })
  | (GuideBlockBase & {
      type: 'table';
      caption?: string;
      columns: Array<string | { key: string; label: string }>;
      rows: Array<string[] | Record<string, string>>;
    })
  | (GuideBlockBase & {
      type: 'warning' | 'callout';
      severity: 'emergency' | 'urgent' | 'caution' | 'info';
      title: string;
      body?: string;
      items?: string[];
      action?: { label: string; href: string };
    })
  | (GuideBlockBase & { type: 'media'; mediaId: string })
  | (GuideBlockBase & {
      type: 'official-link';
      title: string;
      description?: string;
      href: string;
      label?: string;
    });

export interface GuideTopicContent {
  schemaVersion?: number;
  id: string;
  title: string;
  shortTitle?: string;
  summary: string;
  priority: GuidePriority;
  keywords?: string[];
  aliases?: string[];
  ageRanges?: GuideAgeRange[];
  review?: GuideReview;
  sourceIds?: string[];
  media?: GuideMediaItem[];
  blocks: GuideBlock[];
}

export interface GuideTopicSummary {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  description?: string;
  priority?: GuidePriority;
  ageRanges?: GuideAgeRange[];
}

export interface GuideAgeTarget {
  id: string;
  ageLabel: string;
  title: string;
  topicId?: string;
  anchor?: string;
}

export interface GuideSearchResult {
  id?: string;
  topicId: string;
  blockId?: string;
  anchor?: string;
  title: string;
  topicTitle?: string;
  snippet?: string;
  text?: string;
  priority?: GuidePriority;
}
