import type {
  BabyRecord,
  MedicineActiveUnit,
  MedicineAdministrationUnit,
  MedicineQuickValue,
} from '../types';

type MedicineDetails = BabyRecord['details'];

export interface StructuredMedicineValue {
  medicineConcentrationAmount: number;
  medicineConcentrationUnit: MedicineActiveUnit;
  medicineConcentrationPerAmount: number;
  medicineConcentrationPerUnit: MedicineAdministrationUnit;
  medicineAmount: number;
  medicineAmountUnit: MedicineAdministrationUnit;
}

const activeUnits = new Set<MedicineActiveUnit>(['mg', 'µg', 'IU']);
const administrationUnits = new Set<MedicineAdministrationUnit>(['mL', '滴']);

function positiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isMedicineActiveUnit(value: unknown): value is MedicineActiveUnit {
  return typeof value === 'string' && activeUnits.has(value as MedicineActiveUnit);
}

export function isMedicineAdministrationUnit(value: unknown): value is MedicineAdministrationUnit {
  return typeof value === 'string' && administrationUnits.has(value as MedicineAdministrationUnit);
}

export function hasStructuredMedicineValue(
  value: Partial<StructuredMedicineValue>,
): value is StructuredMedicineValue {
  return positiveFinite(value.medicineConcentrationAmount)
    && isMedicineActiveUnit(value.medicineConcentrationUnit)
    && positiveFinite(value.medicineConcentrationPerAmount)
    && isMedicineAdministrationUnit(value.medicineConcentrationPerUnit)
    && (value.medicineConcentrationPerUnit !== '滴' || Number.isInteger(value.medicineConcentrationPerAmount))
    && positiveFinite(value.medicineAmount)
    && isMedicineAdministrationUnit(value.medicineAmountUnit)
    && (value.medicineAmountUnit !== '滴' || Number.isInteger(value.medicineAmount));
}

export function calculateMedicineActiveAmount(
  value: Partial<StructuredMedicineValue>,
): { amount: number; unit: MedicineActiveUnit } | null {
  if (!hasStructuredMedicineValue(value)) return null;
  if (value.medicineConcentrationPerUnit !== value.medicineAmountUnit) return null;
  const amount = (value.medicineConcentrationAmount / value.medicineConcentrationPerAmount)
    * value.medicineAmount;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return { amount, unit: value.medicineConcentrationUnit };
}

export function formatMedicineNumber(value: number) {
  return new Intl.NumberFormat('zh-HK', { maximumSignificantDigits: 6, useGrouping: false }).format(value);
}

export function canonicalMedicineConcentration(value: StructuredMedicineValue) {
  return `${String(value.medicineConcentrationAmount)} ${value.medicineConcentrationUnit} / ${String(value.medicineConcentrationPerAmount)} ${value.medicineConcentrationPerUnit}`;
}

/** Converts common old and canonical labels such as "120 mg/5 ml" into structured values. */
export function parseMedicineConcentration(value: string | undefined): Omit<StructuredMedicineValue, 'medicineAmount' | 'medicineAmountUnit'> | null {
  if (!value) return null;
  const numeric = '(\\d+(?:\\.\\d+)?)';
  const match = value.trim().match(new RegExp(`^${numeric}\\s*(mg|mcg|µg|μg|ug|iu)\\s*\\/\\s*${numeric}\\s*(ml|滴|drops?)$`, 'i'));
  if (!match) return null;

  const concentrationAmount = Number(match[1]);
  const perAmount = Number(match[3]);
  if (
    !positiveFinite(concentrationAmount)
    || concentrationAmount > 1_000_000
    || !positiveFinite(perAmount)
    || perAmount > 1_000
  ) return null;

  const rawActiveUnit = match[2].toLocaleLowerCase('en-GB');
  const activeUnit: MedicineActiveUnit = rawActiveUnit === 'mg'
    ? 'mg'
    : rawActiveUnit === 'iu'
      ? 'IU'
      : 'µg';
  const rawAdministrationUnit = match[4].toLocaleLowerCase('en-GB');
  const administrationUnit: MedicineAdministrationUnit = rawAdministrationUnit === 'ml' ? 'mL' : '滴';
  if (administrationUnit === '滴' && !Number.isInteger(perAmount)) return null;

  return {
    medicineConcentrationAmount: concentrationAmount,
    medicineConcentrationUnit: activeUnit,
    medicineConcentrationPerAmount: perAmount,
    medicineConcentrationPerUnit: administrationUnit,
  };
}

export function formatMedicineConcentration(value: Partial<MedicineDetails & MedicineQuickValue>) {
  const parsed = parseMedicineConcentration(value.concentration);
  return parsed
    ? canonicalMedicineConcentration({ ...parsed, medicineAmount: 1, medicineAmountUnit: parsed.medicineConcentrationPerUnit })
    : value.concentration?.trim() || '';
}

export function formatMedicineAdministration(value: Partial<MedicineDetails & MedicineQuickValue>) {
  if (!positiveFinite(value.doseMl)) return '';
  const unit = parseMedicineConcentration(value.concentration)?.medicineConcentrationPerUnit || 'mL';
  return `${formatMedicineNumber(value.doseMl)} ${unit}`;
}

export function calculateStoredMedicineActiveAmount(value: Partial<MedicineDetails & MedicineQuickValue>) {
  if (!positiveFinite(value.doseMl)) return null;
  const concentration = parseMedicineConcentration(value.concentration);
  if (!concentration) return null;
  return calculateMedicineActiveAmount({
    ...concentration,
    medicineAmount: value.doseMl,
    medicineAmountUnit: concentration.medicineConcentrationPerUnit,
  });
}
