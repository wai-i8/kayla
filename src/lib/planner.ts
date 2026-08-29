import type {
  FamilyTask,
  FamilyTaskInput,
  ScheduleItemState,
  ScheduleItemStateInput,
  ScheduleItemStates,
  ScheduleItemStatus,
} from '../types';

const SCHEDULE_ITEM_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const FIREBASE_PUSH_ID = /^[A-Za-z0-9_-]{1,128}$/;
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;
const TIME_INPUT = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const SCHEDULE_STATUSES: ReadonlySet<ScheduleItemStatus> = new Set([
  'pending',
  'booked',
  'completed',
  'not-applicable',
]);

const TITLE_MAX = 160;
const LOCATION_MAX = 160;
const NOTES_MAX = 2_000;
const USER_ID_MAX = 256;
const USER_LABEL_MAX = 80;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validDateInput(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_INPUT.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function optionalStoredString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned && cleaned.length <= maxLength ? cleaned : undefined;
}

function requiredStoredString(value: unknown, maxLength: number) {
  return optionalStoredString(value, maxLength) || null;
}

function optionalInputString(value: string | undefined, label: string, maxLength: number) {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;
  if (cleaned.length > maxLength) throw new Error(`${label}太長`);
  return cleaned;
}

function requireValidDate(value: string | undefined, label: string) {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;
  if (!validDateInput(cleaned)) throw new Error(`${label}格式無效`);
  return cleaned;
}

function requireValidTime(value: string | undefined, label: string) {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;
  if (!TIME_INPUT.test(cleaned)) throw new Error(`${label}格式無效`);
  return cleaned;
}

export function isScheduleItemId(value: string) {
  return SCHEDULE_ITEM_ID.test(value);
}

export function isFamilyTaskId(value: string) {
  return FIREBASE_PUSH_ID.test(value);
}

export function parseScheduleItemStates(value: unknown): ScheduleItemStates {
  if (!isObject(value)) return {};
  const parsed: ScheduleItemStates = {};

  Object.entries(value).forEach(([id, stored]) => {
    if (!isScheduleItemId(id) || !isObject(stored)) return;
    if (typeof stored.status !== 'string' || !SCHEDULE_STATUSES.has(stored.status as ScheduleItemStatus)) return;
    if (!finiteTimestamp(stored.updatedAt)) return;
    const updatedBy = requiredStoredString(stored.updatedBy, USER_ID_MAX);
    if (!updatedBy) return;

    const appointmentDate = validDateInput(stored.appointmentDate) ? stored.appointmentDate : undefined;
    const appointmentTime = typeof stored.appointmentTime === 'string' && TIME_INPUT.test(stored.appointmentTime)
      ? stored.appointmentTime
      : undefined;
    const completedAt = finiteTimestamp(stored.completedAt) ? stored.completedAt : undefined;

    parsed[id] = {
      id,
      status: stored.status as ScheduleItemStatus,
      appointmentDate,
      appointmentTime,
      location: optionalStoredString(stored.location, LOCATION_MAX),
      notes: optionalStoredString(stored.notes, NOTES_MAX),
      completedAt: stored.status === 'completed' ? completedAt : undefined,
      updatedAt: stored.updatedAt,
      updatedBy,
      updatedByLabel: optionalStoredString(stored.updatedByLabel, USER_LABEL_MAX),
    };
  });

  return parsed;
}

export function parseFamilyTasks(value: unknown): FamilyTask[] {
  if (!isObject(value)) return [];

  return Object.entries(value)
    .flatMap(([id, stored]) => {
      if (!isFamilyTaskId(id) || !isObject(stored)) return [];
      const title = requiredStoredString(stored.title, TITLE_MAX);
      const createdBy = requiredStoredString(stored.createdBy, USER_ID_MAX);
      if (!title || !createdBy || !finiteTimestamp(stored.createdAt)) return [];

      const completed = stored.completed === true;
      const dueDate = validDateInput(stored.dueDate) ? stored.dueDate : undefined;
      const dueTime = typeof stored.dueTime === 'string' && TIME_INPUT.test(stored.dueTime)
        ? stored.dueTime
        : undefined;

      return [{
        id,
        title,
        dueDate,
        dueTime,
        location: optionalStoredString(stored.location, LOCATION_MAX),
        notes: optionalStoredString(stored.notes, NOTES_MAX),
        completed,
        completedAt: completed && finiteTimestamp(stored.completedAt) ? stored.completedAt : undefined,
        createdAt: stored.createdAt,
        createdBy,
        createdByLabel: optionalStoredString(stored.createdByLabel, USER_LABEL_MAX),
        updatedAt: finiteTimestamp(stored.updatedAt) ? stored.updatedAt : undefined,
        updatedBy: optionalStoredString(stored.updatedBy, USER_ID_MAX),
        updatedByLabel: optionalStoredString(stored.updatedByLabel, USER_LABEL_MAX),
      } satisfies FamilyTask];
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aDue = `${a.dueDate || '9999-99-99'}T${a.dueTime || '99:99'}`;
      const bDue = `${b.dueDate || '9999-99-99'}T${b.dueTime || '99:99'}`;
      return aDue.localeCompare(bDue) || b.createdAt - a.createdAt;
    });
}

export function cleanScheduleItemStateInput(input: ScheduleItemStateInput): ScheduleItemStateInput {
  if (!SCHEDULE_STATUSES.has(input.status)) throw new Error('無效日程狀態');
  const appointmentDate = requireValidDate(input.appointmentDate, '預約日期');
  const appointmentTime = requireValidTime(input.appointmentTime, '預約時間');
  if (appointmentTime && !appointmentDate) throw new Error('請先填預約日期');

  return {
    status: input.status,
    appointmentDate,
    appointmentTime,
    location: optionalInputString(input.location, '地點', LOCATION_MAX),
    notes: optionalInputString(input.notes, '備註', NOTES_MAX),
  };
}

export function cleanFamilyTaskInput(input: FamilyTaskInput): FamilyTaskInput {
  const title = optionalInputString(input.title, '待辦名稱', TITLE_MAX);
  if (!title) throw new Error('請填待辦名稱');
  const dueDate = requireValidDate(input.dueDate, '到期日期');
  const dueTime = requireValidTime(input.dueTime, '到期時間');
  if (dueTime && !dueDate) throw new Error('請先填到期日期');

  return {
    title,
    dueDate,
    dueTime,
    location: optionalInputString(input.location, '地點', LOCATION_MAX),
    notes: optionalInputString(input.notes, '備註', NOTES_MAX),
  };
}
