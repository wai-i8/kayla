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

function eventIsSet(profile: BabyProfile, eventKey: NonNullable<BabyReminder['eventKey']>) {
  return isValidDateKey(profile.events?.[eventKey]);
}

/**
 * The reminder timeline is intentionally one-shot: a reminder is eligible only
 * on its assigned baby-age day. This prevents old advice from accumulating as
 * the baby grows.
 */
export function reminderMatchesAge(reminder: BabyReminder, age: BabyAge, profile: BabyProfile) {
  if (!age.valid || age.future) return false;
  if (reminder.feedingMethods?.length && (!profile.feedingMethod || !reminder.feedingMethods.includes(profile.feedingMethod))) return false;

  if (reminder.eventKey && reminder.eventCondition) {
    const isSet = eventIsSet(profile, reminder.eventKey);
    if (isSet !== (reminder.eventCondition === 'set')) return false;
  }

  return age.babyAgeDays === reminder.startDay;
}

function rankEligible(reminders: BabyReminder[]) {
  return [...reminders].sort((left, right) => PRIORITY_SCORE[right.priority] - PRIORITY_SCORE[left.priority]);
}

export function getEligibleBabyReminders(profile: BabyProfile, timestamp = Date.now()) {
  const age = getBabyAge(profile.dateOfBirth, timestamp);
  const eligible = rankEligible(babyReminders.filter((reminder) => reminderMatchesAge(reminder, age, profile)));
  return { age, eligible };
}

export function getDailyBabyReminders(
  profile: BabyProfile,
  timestamp = Date.now(),
  limit = 3,
): DailyBabyRemindersResult {
  const { age, eligible } = getEligibleBabyReminders(profile, timestamp);
  if (!age.valid || age.future) return { age, reminders: [] };
  return { age, reminders: eligible.slice(0, limit) };
}
