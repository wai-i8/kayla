export type ViewKey = 'today' | 'records' | 'guide' | 'calendar' | 'photos' | 'settings';

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

export type MedicineActiveUnit = 'mg' | 'µg' | 'IU';

export type MedicineAdministrationUnit = 'mL' | '滴';

export interface MedicineQuickValue {
  medicineName: string;
  concentration?: string;
  /** Legacy property name retained for Firebase Rules compatibility; unit is read from concentration. */
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

export type BabyEventKey = 'umbilicalCordDetachedAt' | 'firstToothDate' | 'startedSolidsAt' | 'firstRollAt';

export interface BabyEvents {
  umbilicalCordDetachedAt?: string;
  firstToothDate?: string;
  startedSolidsAt?: string;
  firstRollAt?: string;
}

export interface BabyProfile {
  name: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  gestationalWeeks?: number;
  birthWeightKg?: number;
  feedingMethod?: 'breast' | 'formula' | 'mixed' | '';
  events?: BabyEvents;
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
  status?: 'draft';
  updatedAt?: number;
  updatedBy?: string;
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
    /** Legacy property name retained for existing data and Firebase Rules compatibility. */
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

export interface BabyPhoto {
  id: string;
  storagePath: string;
  thumbnailPath: string;
  capturedAt: number;
  createdAt: number;
  createdBy: string;
  createdByLabel?: string;
  caption?: string;
  width: number;
  height: number;
  /** Demo-mode object URLs are never written to Firebase. */
  demoUrl?: string;
  demoThumbnailUrl?: string;
}

export interface NewPhotoInput {
  file: File;
  capturedAt: number;
  caption?: string;
  signal?: AbortSignal;
}

export type ScheduleItemStatus = 'pending' | 'booked' | 'completed' | 'not-applicable';

/**
 * Per-family state for a built-in health schedule definition. The medical
 * definition itself stays in the app; Firebase only stores the family's
 * appointment details and progress.
 */
export interface ScheduleItemState {
  id: string;
  status: ScheduleItemStatus;
  appointmentDate?: string;
  appointmentTime?: string;
  location?: string;
  notes?: string;
  completedAt?: number;
  updatedAt: number;
  updatedBy: string;
  updatedByLabel?: string;
}

export type ScheduleItemStates = Record<string, ScheduleItemState>;

export interface ScheduleItemStateInput {
  status: ScheduleItemStatus;
  appointmentDate?: string;
  appointmentTime?: string;
  location?: string;
  notes?: string;
}

export interface FamilyTask {
  id: string;
  title: string;
  dueDate?: string;
  dueTime?: string;
  location?: string;
  notes?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  createdBy: string;
  createdByLabel?: string;
  updatedAt?: number;
  updatedBy?: string;
  updatedByLabel?: string;
}

export interface FamilyTaskInput {
  title: string;
  dueDate?: string;
  dueTime?: string;
  location?: string;
  notes?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  isDemo?: boolean;
}
