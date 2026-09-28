import type { BabyProfile } from '../types';
import type { BabyAge } from './babyAge';
import { getBabyAge, isValidDateKey } from './babyAge';
import type { BabyReminder } from '../data/babyReminders';
import { babyReminders } from '../data/babyReminders';

export { getBabyAge } from './babyAge';
export { babyReminders } from '../data/babyReminders';

export interface DailyBabyRemindersResult {
  age: BabyAge;
  reminders: BabyReminder[];
}

const PRIORITY_SCORE = {
  important: 400,
  action: 300,
  development: 200,
  tip: 100,
} as const;

const EDITORIAL_VALUE_SCORE = {
  essential: 90,
  high: 60,
  helpful: 30,
} as const;

const KIND_SCORE = {
  screening: 40,
  preparation: 35,
  milestone_check: 34,
  milestone: 30,
  care_check: 20,
} as const;

function reminderScore(reminder: BabyReminder) {
  return PRIORITY_SCORE[reminder.priority]
    + EDITORIAL_VALUE_SCORE[reminder.editorialValue]
    + KIND_SCORE[reminder.kind];
}

function feedingMethodMatches(reminder: BabyReminder, profile: BabyProfile) {
  if (!reminder.feedingMethods?.length) return true;
  const method = profile.feedingMethod ?? '';
  return reminder.feedingMethods.includes(method);
}

function eventReminderMatches(reminder: BabyReminder, profile: BabyProfile, timestamp: number) {
  if (!reminder.eventKey) return false;
  const eventDate = profile.events?.[reminder.eventKey];
  if (!isValidDateKey(eventDate)) return false;

  const ageSinceEvent = getBabyAge(eventDate, timestamp);
  if (!ageSinceEvent.valid || ageSinceEvent.future) return false;
  return ageSinceEvent.babyAgeDays === (reminder.eventOffsetDays ?? 0);
}

function ageWindowMatches(reminder: BabyReminder, age: BabyAge) {
  if (!Number.isInteger(reminder.startDay) || !Number.isInteger(reminder.endDay)) return false;
  return age.babyAgeDays >= (reminder.startDay as number)
    && age.babyAgeDays <= (reminder.endDay as number);
}

/**
 * Exact-day reminders remain one-shot. Age-window reminders are a curated pool
 * for the baby's current stage, so blank days still teach something useful
 * without reviving old reminders as a backlog.
 */
export function reminderMatchesAge(
  reminder: BabyReminder,
  age: BabyAge,
  profile: BabyProfile,
  timestamp = Date.now(),
) {
  if (!age.valid || age.future) return false;
  if (!feedingMethodMatches(reminder, profile)) return false;

  if (reminder.triggerType === 'event_based') {
    return eventReminderMatches(reminder, profile, timestamp);
  }
  if (reminder.triggerType === 'age_window') {
    return ageWindowMatches(reminder, age);
  }
  return Number.isInteger(reminder.startDay) && age.babyAgeDays === reminder.startDay;
}

function rank(reminders: BabyReminder[]) {
  return [...reminders].sort((left, right) => reminderScore(right) - reminderScore(left));
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dayShuffle(reminders: BabyReminder[], ageDays: number, dob: string) {
  return [...reminders].sort((left, right) => {
    const leftKey = stableHash(`${dob}|${ageDays}|${left.id}`);
    const rightKey = stableHash(`${dob}|${ageDays}|${right.id}`);
    if (leftKey !== rightKey) return leftKey - rightKey;
    return reminderScore(right) - reminderScore(left);
  });
}

function pushWithCategoryDiversity(
  selected: BabyReminder[],
  candidates: BabyReminder[],
  limit: number,
) {
  const selectedIds = new Set(selected.map((item) => item.id));
  const selectedCategories = new Set(selected.map((item) => item.category));

  for (const candidate of candidates) {
    if (selected.length >= limit) break;
    if (selectedIds.has(candidate.id) || selectedCategories.has(candidate.category)) continue;
    selected.push(candidate);
    selectedIds.add(candidate.id);
    selectedCategories.add(candidate.category);
  }

  for (const candidate of candidates) {
    if (selected.length >= limit) break;
    if (selectedIds.has(candidate.id)) continue;
    selected.push(candidate);
    selectedIds.add(candidate.id);
  }
}

export function getEligibleBabyReminders(profile: BabyProfile, timestamp = Date.now()) {
  const age = getBabyAge(profile.dateOfBirth, timestamp);
  const matched = babyReminders.filter((reminder) => reminderMatchesAge(reminder, age, profile, timestamp));
  const eventCategories = new Set(
    matched.filter((reminder) => reminder.triggerType === 'event_based').map((reminder) => reminder.category),
  );
  const deDuplicated = matched.filter(
    (reminder) => reminder.triggerType === 'event_based'
      || reminder.triggerType === 'age_window'
      || !eventCategories.has(reminder.category),
  );
  return { age, eligible: rank(deDuplicated) };
}

export function getDailyBabyReminders(
  profile: BabyProfile,
  timestamp = Date.now(),
  limit = 3,
  excludedIds: Iterable<string> = [],
): DailyBabyRemindersResult {
  const age = getBabyAge(profile.dateOfBirth, timestamp);
  if (!age.valid || age.future) return { age, reminders: [] };

  const excluded = new Set(excludedIds);
  const direct = rank(
    babyReminders.filter(
      (item) =>
        item.triggerType !== 'age_window'
        && reminderMatchesAge(item, age, profile, timestamp),
    ),
  );

  const windows = babyReminders.filter(
    (item) =>
      item.triggerType === 'age_window'
      && reminderMatchesAge(item, age, profile, timestamp),
  );

  const selected: BabyReminder[] = direct.slice(0, limit);

  // Fill blank/quiet days from a researched stage pool. Prefer reminders this
  // household has not already seen on earlier dates.
  if (selected.length < limit && windows.length) {
    const unseen = dayShuffle(windows.filter((item) => !excluded.has(item.id)), age.babyAgeDays, profile.dateOfBirth);
    const seenFallback = dayShuffle(windows.filter((item) => excluded.has(item.id)), age.babyAgeDays, profile.dateOfBirth);

    // In the first 12 weeks, a quiet day should still surface up to 2 genuinely
    // useful stage items. After that, 1 stage item is enough unless an exact
    // milestone/appointment adds more.
    const stageTarget = age.babyAgeDays < 84
      ? Math.min(limit, selected.length >= 2 ? selected.length + 1 : 2)
      : Math.min(limit, selected.length >= 1 ? selected.length + 1 : 1);
    pushWithCategoryDiversity(selected, unseen, stageTarget);
    if (selected.length < stageTarget) pushWithCategoryDiversity(selected, seenFallback, stageTarget);
  }

  // Timely look-ahead: preparation items may appear up to 10 days before their
  // exact scheduled day, but old reminders never carry forward.
  if (selected.length < limit) {
    const upcoming = rank(
      babyReminders.filter((item) => {
        if (item.triggerType !== 'exact_day' || item.kind !== 'preparation') return false;
        if (!feedingMethodMatches(item, profile) || !Number.isInteger(item.startDay)) return false;
        const delta = (item.startDay as number) - age.babyAgeDays;
        if (delta <= 0) return false;

        // Only pull forward genuinely time-sensitive appointments/preparation.
        // Do not turn every future care fact into an early reminder.
        if (item.category === 'vaccination') return delta <= 10;
        if (item.id.includes('postnatal-check') || item.id.includes('six-week-check')) return delta <= 7;
        return false;
      }),
    );
    pushWithCategoryDiversity(selected, upcoming, limit);
  }

  return { age, reminders: selected.slice(0, limit) };
}
