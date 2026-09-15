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
  eligibleCount: number;
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

/**
 * A reminder must be relevant TODAY, not merely something that became true in
 * the past. Age-based cards are exact-day one-shots. Event-based cards are
 * shown only on the event day (or an explicit offset), so nothing builds into
 * a 40-item backlog as the baby grows.
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

  if (reminder.triggerType === 'day_range') {
    return Number.isInteger(reminder.startDay)
      && Number.isInteger(reminder.endDay)
      && age.babyAgeDays >= reminder.startDay!
      && age.babyAgeDays <= reminder.endDay!;
  }

  return Number.isInteger(reminder.startDay) && age.babyAgeDays === reminder.startDay;
}

function rankEligible(reminders: BabyReminder[]) {
  return [...reminders].sort((left, right) => {
    const leftScore = PRIORITY_SCORE[left.priority]
      + EDITORIAL_VALUE_SCORE[left.editorialValue]
      + KIND_SCORE[left.kind];
    const rightScore = PRIORITY_SCORE[right.priority]
      + EDITORIAL_VALUE_SCORE[right.editorialValue]
      + KIND_SCORE[right.kind];
    return rightScore - leftScore;
  });
}

export function getEligibleBabyReminders(profile: BabyProfile, timestamp = Date.now()) {
  const age = getBabyAge(profile.dateOfBirth, timestamp);
  const matched = babyReminders.filter((reminder) => reminderMatchesAge(reminder, age, profile, timestamp));

  // If an actual family event happened today (for example the cord detached),
  // prefer that real event over a generic age-based card from the same category.
  const eventCategories = new Set(
    matched.filter((reminder) => reminder.triggerType === 'event_based').map((reminder) => reminder.category),
  );
  const deDuplicated = matched.filter(
    (reminder) => reminder.triggerType === 'event_based' || !eventCategories.has(reminder.category),
  );
  const eligible = rankEligible(deDuplicated);
  return { age, eligible };
}

export function getDailyBabyReminders(
  profile: BabyProfile,
  timestamp = Date.now(),
  limit = 3,
): DailyBabyRemindersResult {
  const { age, eligible } = getEligibleBabyReminders(profile, timestamp);
  if (!age.valid || age.future) return { age, reminders: [], eligibleCount: 0 };

  // Keep the home card deliberately short. Quality and timing beat volume.
  return { age, reminders: eligible.slice(0, limit), eligibleCount: eligible.length };
}
