import timelineData from './timeline.json';
import type { GuideTimelineEntry } from './schema';

/** Lightweight age navigation used by TodayPage without loading every guide topic. */
export const ageTimelineSections = timelineData as GuideTimelineEntry[];
