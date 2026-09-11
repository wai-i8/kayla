import type { BabyProfile } from '../types';
import type { BabyAge } from './babyAge';
import { addCalendarDays, getBabyAge, isValidDateKey } from './babyAge';
import type { BabyReminder } from '../data/babyReminders';
import { babyReminders } from '../data/babyReminders';

export { getBabyAge } from './babyAge';
export { babyReminders } from '../data/babyReminders';

export interface DailyBabyRemindersResult {
  age: BabyAge;
  reminders: BabyReminder[];
  eligible: BabyReminder[];
  eligibleCount: number;
}

const PRIORITY_SCORE = {
  important: 400,
  action: 300,
  development: 200,
  tip: 100,
} as const;

function inRange(value: number, start?: number, end?: number) {
  return (start === undefined || value >= start) && (end === undefined || value <= end);
}

function eventIsSet(profile: BabyProfile, eventKey: NonNullable<BabyReminder['eventKey']>) {
  const value = profile.events?.[eventKey];
  return isValidDateKey(value);
}

export function reminderMatchesAge(reminder: BabyReminder, age: BabyAge, profile: BabyProfile) {
  if (!age.valid || age.future) return false;
  if (reminder.feedingMethods?.length && (!profile.feedingMethod || !reminder.feedingMethods.includes(profile.feedingMethod))) return false;

  if (reminder.eventKey && reminder.eventCondition) {
    if (eventIsSet(profile, reminder.eventKey) !== (reminder.eventCondition === 'set')) return false;
  }

  switch (reminder.triggerType) {
    case 'exact_day':
      return age.babyAgeDays === reminder.startDay;
    case 'day_range':
      return inRange(age.babyAgeDays, reminder.startDay, reminder.endDay);
    case 'exact_week':
      return age.babyAgeWeeks === reminder.startWeek;
    case 'week_range':
      return inRange(age.babyAgeWeeks, reminder.startWeek, reminder.endWeek);
    case 'exact_month':
      return age.babyAgeMonths === reminder.startMonth;
    case 'month_range':
      return inRange(age.babyAgeMonths, reminder.startMonth, reminder.endMonth);
    case 'recurring': {
      const recurrence = reminder.recurrenceDays || 0;
      return recurrence > 0
        && age.babyAgeDays >= (reminder.startDay || 0)
        && (age.babyAgeDays - (reminder.startDay || 0)) % recurrence === 0;
    }
    case 'event_based':
      return inRange(age.babyAgeDays, reminder.startDay, reminder.endDay);
    default:
      return false;
  }
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rankReminder(reminder: BabyReminder, age: BabyAge) {
  // Exact-day/week/month items are time-sensitive (vaccines are the main
  // example), so they must remain visible even when several safety items are
  // also eligible.
  const exactTrigger = reminder.triggerType.startsWith('exact_') ? 100_000 : 0;
  const eventTrigger = reminder.triggerType === 'event_based' ? 35 : 0;
  const deterministicTieBreaker = stableHash(`${age.dateOfBirth}|${age.asOfDate}|${reminder.id}`) % 100;
  return PRIORITY_SCORE[reminder.priority] * 1000 + exactTrigger + eventTrigger + deterministicTieBreaker;
}

function rankEligible(reminders: BabyReminder[], age: BabyAge) {
  return [...reminders].sort((left, right) => rankReminder(right, age) - rankReminder(left, age));
}

function selectForDay(
  eligible: BabyReminder[],
  age: BabyAge,
  limit: number,
  recentlyShown = new Set<string>(),
) {
  const deferred = eligible.filter((reminder) => (
    recentlyShown.has(reminder.id)
    && (reminder.cooldownDays || 0) > 0
  ));
  const available = eligible.filter((reminder) => !deferred.includes(reminder));
  const ordered = rankEligible(available, age);
  const selected: BabyReminder[] = [];
  const usedCategories = new Set<string>();

  const addFrom = (candidates: BabyReminder[], requireNewCategory: boolean) => {
    candidates.forEach((reminder) => {
      if (selected.length >= limit || selected.some((item) => item.id === reminder.id)) return;
      if (requireNewCategory && usedCategories.has(reminder.category)) return;
      selected.push(reminder);
      usedCategories.add(reminder.category);
    });
  };

  // First pass keeps the homepage balanced, while the score always means the
  // highest-priority health/safety item is considered first.
  addFrom(ordered, true);
  addFrom(ordered, false);
  if (selected.length < limit) addFrom(rankEligible(deferred, age), true);
  if (selected.length < limit) addFrom(rankEligible(deferred, age), false);
  return selected;
}

function timestampForDateKey(dateKey: string) {
  return Date.parse(`${dateKey}T12:00:00Z`);
}

function getRecentRotationIds(profile: BabyProfile, age: BabyAge, limit: number) {
  const recent = new Set<string>();
  const cooldownDays = 21;
  for (let offset = 1; offset <= cooldownDays && age.babyAgeDays - offset >= 0; offset += 1) {
    const previousDate = addCalendarDays(age.asOfDate, -offset);
    const previousAge = getBabyAge(profile.dateOfBirth, timestampForDateKey(previousDate));
    const eligible = babyReminders.filter((reminder) => reminderMatchesAge(reminder, previousAge, profile));
    selectForDay(eligible, previousAge, limit).forEach((reminder) => {
      if ((reminder.cooldownDays || 0) > 0) {
        recent.add(reminder.id);
      }
    });
  }
  return recent;
}

export function getEligibleBabyReminders(profile: BabyProfile, timestamp = Date.now()) {
  const age = getBabyAge(profile.dateOfBirth, timestamp);
  const eligible = rankEligible(
    babyReminders.filter((reminder) => reminderMatchesAge(reminder, age, profile)),
    age,
  );
  return { age, eligible };
}

export function getDailyBabyReminders(
  profile: BabyProfile,
  timestamp = Date.now(),
  limit = 3,
): DailyBabyRemindersResult {
  const { age, eligible } = getEligibleBabyReminders(profile, timestamp);
  if (!age.valid || age.future) return { age, reminders: [], eligible, eligibleCount: eligible.length };
  const recent = getRecentRotationIds(profile, age, limit);
  const reminders = selectForDay(eligible, age, limit, recent);
  return { age, reminders, eligible, eligibleCount: eligible.length };
}
