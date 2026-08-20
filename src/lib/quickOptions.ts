import type {
  MedicineQuickValue,
  NewRecordInput,
  QuickOptionField,
  QuickOptionValue,
} from '../types';
import { formatMedicineConcentration } from './medicine';

export const quickOptionFields: QuickOptionField[] = [
  'feedDurationMinutes',
  'feedAmountMl',
  'feedNote',
  'nappyStoolColour',
  'nappyNote',
  'temperatureCelsius',
  'temperatureNote',
  'sleepMinutes',
  'sleepNote',
  'medicinePreset',
  'medicineNote',
  'weightKg',
  'weightNote',
  'noteContent',
];

const quickOptionFieldSet = new Set<QuickOptionField>(quickOptionFields);

export function isQuickOptionField(value: string): value is QuickOptionField {
  return quickOptionFieldSet.has(value as QuickOptionField);
}

export function isMedicineQuickValue(value: unknown): value is MedicineQuickValue {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MedicineQuickValue>;
  const validName = (
    typeof candidate.medicineName === 'string'
    && candidate.medicineName.trim().length > 0
    && candidate.medicineName.length <= 120
  );
  if (!validName) return false;

  return (
    (candidate.concentration === undefined || (
      typeof candidate.concentration === 'string'
      && candidate.concentration.length <= 120
    ))
    && typeof candidate.doseMl === 'number'
    && Number.isFinite(candidate.doseMl)
    && candidate.doseMl > 0
    && candidate.doseMl <= 100
  );
}

export function isQuickOptionValue(field: QuickOptionField, value: unknown): value is QuickOptionValue {
  if (field === 'medicinePreset') return isMedicineQuickValue(value);
  if (field === 'feedDurationMinutes') return typeof value === 'number' && value >= 1 && value <= 300;
  if (field === 'feedAmountMl') return typeof value === 'number' && value >= 1 && value <= 1000;
  if (field === 'temperatureCelsius') return typeof value === 'number' && value >= 30 && value <= 45;
  if (field === 'sleepMinutes') return typeof value === 'number' && value >= 1 && value <= 1440;
  if (field === 'weightKg') return typeof value === 'number' && value >= 0.3 && value <= 30;
  if (typeof value !== 'string' || !value.trim()) return false;
  return field === 'nappyStoolColour' ? value.length <= 80 : value.length <= 1000;
}

function noteField(type: NewRecordInput['type']): QuickOptionField {
  if (type === 'note') return 'noteContent';
  return `${type}Note` as QuickOptionField;
}

export function quickOptionEntries(input: NewRecordInput): Array<{ field: QuickOptionField; value: QuickOptionValue }> {
  const entries: Array<{ field: QuickOptionField; value: QuickOptionValue }> = [];
  const { details } = input;

  if (input.type === 'feed') {
    if (typeof details.durationMinutes === 'number') entries.push({ field: 'feedDurationMinutes', value: details.durationMinutes });
    if (typeof details.amountMl === 'number') entries.push({ field: 'feedAmountMl', value: details.amountMl });
  }
  if (input.type === 'nappy' && details.stoolColour?.trim()) {
    entries.push({ field: 'nappyStoolColour', value: details.stoolColour.trim() });
  }
  if (input.type === 'temperature' && typeof details.valueCelsius === 'number') {
    entries.push({ field: 'temperatureCelsius', value: details.valueCelsius });
  }
  if (input.type === 'sleep' && typeof details.sleepMinutes === 'number') {
    entries.push({ field: 'sleepMinutes', value: details.sleepMinutes });
  }
  if (
    input.type === 'medicine'
    && details.medicineName?.trim()
    && typeof details.doseMl === 'number'
  ) {
    entries.push({
      field: 'medicinePreset',
      value: {
        medicineName: details.medicineName.trim(),
        concentration: details.concentration?.trim() || undefined,
        doseMl: details.doseMl,
      },
    });
  }
  if (input.type === 'weight' && typeof details.weightKg === 'number') {
    entries.push({ field: 'weightKg', value: details.weightKg });
  }
  if (details.note?.trim()) entries.push({ field: noteField(input.type), value: details.note.trim() });

  return entries;
}

function normalizedText(value: string) {
  return value.trim().replace(/\s+/g, ' ').normalize('NFKC').toLocaleLowerCase('zh-HK');
}

function normalizedValue(value: QuickOptionValue) {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return normalizedText(value);
  return [
    normalizedText(value.medicineName),
    normalizedText(formatMedicineConcentration(value)),
    String(value.doseMl),
  ].join('|');
}

export async function quickOptionId(field: QuickOptionField, value: QuickOptionValue) {
  const bytes = new TextEncoder().encode(`${field}|${normalizedValue(value)}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
