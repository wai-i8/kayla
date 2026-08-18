const UK_TIME_ZONE = 'Europe/London';

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}

export function formatLongDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-HK', {
    timeZone: UK_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(timestamp);
}

export function dateInputValue(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: UK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function timeInputValue(timestamp = Date.now()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}

export function inputsToTimestamp(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  const offsetAt = (timestamp: number) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: UK_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(timestamp);
    const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
    return Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second) - timestamp;
  };

  const firstPass = wallClockAsUtc - offsetAt(wallClockAsUtc);
  return wallClockAsUtc - offsetAt(firstPass);
}

export function startOfUkDay(dayOffset = 0, timestamp = Date.now()) {
  const [year, month, day] = dateInputValue(timestamp).split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, day + dayOffset, 12));
  const targetDate = [
    target.getUTCFullYear(),
    String(target.getUTCMonth() + 1).padStart(2, '0'),
    String(target.getUTCDate()).padStart(2, '0'),
  ].join('-');
  return inputsToTimestamp(targetDate, '00:00');
}

export function startOfToday() {
  return startOfUkDay();
}

function calendarDayNumber(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function describeAge(dateOfBirth?: string) {
  if (!dateOfBirth) return '尚未設定出生日期';
  const days = Math.max(0, calendarDayNumber(dateInputValue()) - calendarDayNumber(dateOfBirth));
  if (days === 0) return '出生第 1 日';
  if (days < 14) return `出生第 ${days + 1} 日`;
  if (days < 56) return `${Math.floor(days / 7)} 週 ${days % 7} 日`;
  const months = Math.floor(days / 30.4375);
  const remainingDays = Math.max(0, Math.round(days - months * 30.4375));
  return `${months} 個月 ${remainingDays} 日`;
}

export function ageInDays(dateOfBirth?: string) {
  if (!dateOfBirth) return 0;
  return Math.max(0, calendarDayNumber(dateInputValue()) - calendarDayNumber(dateOfBirth));
}

export function dateFromBirth(dateOfBirth: string, weeks: number) {
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + weeks * 7, 12));
}

export function ukHour(timestamp = Date.now()) {
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(timestamp));
}
