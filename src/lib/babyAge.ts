import { dateInputValue } from './date';

const DAY_MS = 86_400_000;
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface BabyAge {
  dateOfBirth: string;
  asOfDate: string;
  babyAgeDays: number;
  babyAgeWeeks: number;
  babyAgeMonths: number;
  valid: boolean;
  future: boolean;
}

function dayNumber(dateKey: string) {
  const match = DATE_KEY.exec(dateKey);
  if (!match) return Number.NaN;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return Number.NaN;
  return Math.floor(date.getTime() / DAY_MS);
}

export function isValidDateKey(value?: string): value is string {
  return typeof value === 'string' && Number.isFinite(dayNumber(value));
}

function completeCalendarMonths(dateOfBirth: string, asOfDate: string) {
  const [, birthYear, birthMonth, birthDay] = DATE_KEY.exec(dateOfBirth)!.map(Number);
  const [, todayYear, todayMonth, todayDay] = DATE_KEY.exec(asOfDate)!.map(Number);
  let months = (todayYear - birthYear) * 12 + todayMonth - birthMonth;
  if (todayDay < birthDay) months -= 1;
  return Math.max(0, months);
}

/**
 * Calculate chronological age from date-only values. The app deliberately
 * compares local calendar dates, rather than parsing the DOB as a UTC date,
 * so a phone crossing midnight cannot move the baby one day early or late.
 */
export function getBabyAge(dateOfBirth?: string, timestamp = Date.now()): BabyAge {
  const asOfDate = dateInputValue(Number.isFinite(timestamp) ? timestamp : Date.now());
  const safeDob = dateOfBirth || '';
  const valid = isValidDateKey(safeDob);
  const dobDay = valid ? dayNumber(safeDob) : Number.NaN;
  const todayDay = dayNumber(asOfDate);
  const future = valid && dobDay > todayDay;
  const babyAgeDays = valid && !future ? todayDay - dobDay : 0;

  return {
    dateOfBirth: safeDob,
    asOfDate,
    babyAgeDays,
    babyAgeWeeks: Math.floor(babyAgeDays / 7),
    babyAgeMonths: valid && !future ? completeCalendarMonths(safeDob, asOfDate) : 0,
    valid,
    future,
  };
}

export function addCalendarDays(dateKey: string, offset: number) {
  const day = dayNumber(dateKey);
  if (!Number.isFinite(day)) return dateKey;
  const date = new Date((day + offset) * DAY_MS);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}
