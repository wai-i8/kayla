export type ViewKey = 'today' | 'records' | 'guide' | 'calendar' | 'settings';

export type RecordType = 'feed' | 'nappy' | 'temperature' | 'sleep' | 'medicine' | 'weight' | 'note';

export type RecordTypeFilter = 'all' | RecordType;

export interface RecordFilter {
  type: RecordTypeFilter;
  date: string | null;
}

export type QuickOptionField =
  | 'feedDurationMinutes'
  | 'feedAmountMl'
  | 'feedNote'
  | 'nappyStoolColour'
  | 'nappyNote'
  | 'temperatureCelsius'
  | 'temperatureNote'
  | 'sleepMinutes'
  | 'sleepNote'
  | 'medicinePreset'
  | 'medicineNote'
  | 'weightKg'
  | 'weightNote'
  | 'noteContent';

export interface MedicineQuickValue {
  medicineName: string;
  concentration?: string;
  doseMl: number;
}

export type QuickOptionValue = string | number | MedicineQuickValue;

export interface QuickOption<T extends QuickOptionValue = QuickOptionValue> {
  id: string;
  value: T;
  lastUsedAt: number;
  updatedBy: string;
}

export type QuickOptionsByField = Partial<Record<QuickOptionField, QuickOption[]>>;

export interface BabyProfile {
  name: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  gestationalWeeks?: number;
  birthWeightKg?: number;
  feedingMethod?: 'breast' | 'formula' | 'mixed' | '';
  gpName?: string;
  notes?: string;
  updatedAt?: number;
}

export interface BabyRecord {
  id: string;
  type: RecordType;
  occurredAt: number;
  createdAt: number;
  createdBy: string;
  createdByLabel?: string;
  details: {
    method?: 'breast' | 'formula' | 'expressed';
    side?: 'left' | 'right' | 'both';
    durationMinutes?: number;
    amountMl?: number;
    nappyType?: 'wet' | 'dirty' | 'both';
    stoolColour?: string;
    valueCelsius?: number;
    measurementSite?: string;
    sleepMinutes?: number;
    medicineName?: string;
    concentration?: string;
    doseMl?: number;
    weightKg?: number;
    note?: string;
  };
}

export interface NewRecordInput {
  type: RecordType;
  occurredAt: number;
  details: BabyRecord['details'];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  isDemo?: boolean;
}

export interface GuidePage {
  page: number;
  text: string;
}

export interface GuideSection {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  pages: number[];
  tone: 'sage' | 'peach' | 'blue' | 'rose' | 'gold';
  keywords: string[];
  urgent?: boolean;
}
