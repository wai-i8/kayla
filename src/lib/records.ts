import type { BabyRecord, RecordType } from '../types';
import { canonicalMedicineConcentration, parseMedicineConcentration } from './medicine';

type RecordDetails = BabyRecord['details'];

function isNumberInRange(value: unknown, minimum: number, maximum: number) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum;
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasCanonicalMedicineConcentration(value: unknown) {
  if (typeof value !== 'string') return false;
  const parsed = parseMedicineConcentration(value);
  if (!parsed) return false;

  return value === canonicalMedicineConcentration({
    ...parsed,
    medicineAmount: 1,
    medicineAmountUnit: parsed.medicineConcentrationPerUnit,
  });
}

/**
 * Determines whether a record contains the minimum useful information for its
 * type. Optional fields (such as notes and feed duration) do not affect this
 * result unless the record type explicitly allows duration in place of amount.
 */
export function isRecordComplete(type: RecordType, details: RecordDetails = {}) {
  if (type === 'feed') {
    if (details.method === 'breast') {
      return details.side === 'left' || details.side === 'right' || details.side === 'both';
    }
    if (details.method === 'formula' || details.method === 'expressed') {
      return isNumberInRange(details.amountMl, 1, 1000)
        || isNumberInRange(details.durationMinutes, 1, 300);
    }
    return false;
  }

  if (type === 'nappy') {
    return details.nappyType === 'wet'
      || details.nappyType === 'dirty'
      || details.nappyType === 'both';
  }
  if (type === 'temperature') return isNumberInRange(details.valueCelsius, 30, 45);
  if (type === 'sleep') return isNumberInRange(details.sleepMinutes, 1, 1440);
  if (type === 'medicine') {
    return hasText(details.medicineName)
      && hasCanonicalMedicineConcentration(details.concentration)
      && isNumberInRange(details.doseMl, Number.MIN_VALUE, 100);
  }
  if (type === 'weight') return isNumberInRange(details.weightKg, 0.3, 30);
  return hasText(details.note);
}

/** Treat malformed legacy/in-flight data defensively as a draft in the UI. */
export function isRecordDraft(record: Pick<BabyRecord, 'type' | 'details' | 'status'>) {
  return record.status === 'draft' || !isRecordComplete(record.type, record.details || {});
}
