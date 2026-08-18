import { useCallback, useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import { isQuickOptionField, isQuickOptionValue, quickOptionEntries, quickOptionId } from '../lib/quickOptions';
import type {
  AuthUser,
  BabyProfile,
  BabyRecord,
  NewRecordInput,
  QuickOption,
  QuickOptionField,
  QuickOptionsByField,
} from '../types';

const now = Date.now();
const demoProfile: BabyProfile = {
  name: 'Kayla',
  dateOfBirth: new Date(now - 18 * 86_400_000).toISOString().slice(0, 10),
  timeOfBirth: '09:24',
  gestationalWeeks: 39,
  birthWeightKg: 3.28,
  feedingMethod: 'mixed',
};

const demoRecords: BabyRecord[] = [
  {
    id: 'demo-feed-1',
    type: 'feed',
    occurredAt: now - 52 * 60_000,
    createdAt: now - 50 * 60_000,
    createdBy: 'demo-owner',
    createdByLabel: '你',
    details: { method: 'formula', amountMl: 90, note: '飲完好平靜' },
  },
  {
    id: 'demo-nappy-1',
    type: 'nappy',
    occurredAt: now - 2.2 * 3_600_000,
    createdAt: now - 2.1 * 3_600_000,
    createdBy: 'demo-family',
    createdByLabel: '屋企人',
    details: { nappyType: 'both', stoolColour: '黃色' },
  },
  {
    id: 'demo-temperature-1',
    type: 'temperature',
    occurredAt: now - 5.5 * 3_600_000,
    createdAt: now - 5.4 * 3_600_000,
    createdBy: 'demo-owner',
    createdByLabel: '你',
    details: { valueCelsius: 36.8, measurementSite: '腋下' },
  },
];

function withoutUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseQuickOptions(value: unknown): QuickOptionsByField {
  if (!value || typeof value !== 'object') return {};
  const parsed: QuickOptionsByField = {};

  Object.entries(value as Record<string, unknown>).forEach(([fieldName, storedOptions]) => {
    if (!isQuickOptionField(fieldName) || !storedOptions || typeof storedOptions !== 'object') return;

    const options = Object.entries(storedOptions as Record<string, unknown>)
      .flatMap(([id, stored]) => {
        if (!/^[a-f0-9]{64}$/.test(id) || !stored || typeof stored !== 'object') return [];
        const candidate = stored as Partial<Omit<QuickOption, 'id'>>;
        if (
          !isQuickOptionValue(fieldName, candidate.value)
          || typeof candidate.lastUsedAt !== 'number'
          || !Number.isFinite(candidate.lastUsedAt)
          || typeof candidate.updatedBy !== 'string'
        ) return [];
        return [{
          id,
          value: candidate.value,
          lastUsedAt: candidate.lastUsedAt,
          updatedBy: candidate.updatedBy,
        } satisfies QuickOption];
      })
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt);

    if (options.length) parsed[fieldName] = options;
  });

  return parsed;
}

async function preparedQuickOptions(input: NewRecordInput, userId: string) {
  const lastUsedAt = Date.now();
  return Promise.all(quickOptionEntries(input).map(async ({ field, value }) => ({
    field,
    option: withoutUndefined({
      id: await quickOptionId(field, value),
      value,
      lastUsedAt,
      updatedBy: userId,
    }) as QuickOption,
  })));
}

function mergeQuickOptions(current: QuickOptionsByField, additions: Awaited<ReturnType<typeof preparedQuickOptions>>) {
  const next: QuickOptionsByField = { ...current };
  additions.forEach(({ field, option }) => {
    const others = (next[field] || []).filter((item) => item.id !== option.id);
    next[field] = [option, ...others];
  });
  return next;
}

export function useKaylaData(user: AuthUser | null) {
  const isDemo = Boolean(user?.isDemo);
  const userId = user?.uid;
  const [profile, setProfile] = useState<BabyProfile | null>(isDemo ? demoProfile : null);
  const [records, setRecords] = useState<BabyRecord[]>(isDemo ? demoRecords : []);
  const [quickOptions, setQuickOptions] = useState<QuickOptionsByField>({});
  const [loading, setLoading] = useState(Boolean(user && !isDemo));
  const [error, setError] = useState<string | null>(null);
  const [dataUserId, setDataUserId] = useState<string | undefined>(isDemo ? userId : undefined);

  useEffect(() => {
    setError(null);

    if (!userId) {
      setDataUserId(undefined);
      setProfile(null);
      setRecords([]);
      setQuickOptions({});
      setLoading(false);
      return undefined;
    }

    if (isDemo) {
      setDataUserId(userId);
      setProfile(demoProfile);
      setRecords(demoRecords);
      setQuickOptions({});
      setLoading(false);
      return undefined;
    }

    // Clear the previous account immediately, before asking Firebase for the
    // next account's data. This prevents stale private data appearing if a
    // subsequent login is denied by Database Rules.
    setDataUserId(userId);
    setProfile(null);
    setRecords([]);
    setQuickOptions({});
    setLoading(true);
    let profileReady = false;
    let recordsReady = false;
    const finish = () => {
      if (profileReady && recordsReady) setLoading(false);
    };

    const stopProfile = onValue(
      ref(database, 'kayla/baby/profile'),
      (snapshot) => {
        setProfile(snapshot.exists() ? (snapshot.val() as BabyProfile) : null);
        profileReady = true;
        finish();
      },
      () => {
        setProfile(null);
        setError('未能讀取 BB 資料，請檢查 Firebase Rules。');
        profileReady = true;
        finish();
      },
    );

    const stopRecords = onValue(
      ref(database, 'kayla/records'),
      (snapshot) => {
        const value = snapshot.val() as Record<string, Omit<BabyRecord, 'id'>> | null;
        const nextRecords = value
          ? Object.entries(value)
              .map(([id, record]) => ({ ...record, id }))
              .sort((a, b) => b.occurredAt - a.occurredAt)
          : [];
        setRecords(nextRecords);
        recordsReady = true;
        finish();
      },
      () => {
        setRecords([]);
        setError('未能讀取日常紀錄，請檢查帳戶權限。');
        recordsReady = true;
        finish();
      },
    );

    const stopQuickOptions = onValue(
      ref(database, 'kayla/quickOptions'),
      (snapshot) => setQuickOptions(parseQuickOptions(snapshot.val())),
      () => setQuickOptions({}),
    );

    return () => {
      stopProfile();
      stopRecords();
      stopQuickOptions();
    };
  }, [userId, isDemo]);

  const saveProfile = useCallback(
    async (nextProfile: BabyProfile) => {
      const value = withoutUndefined({
        ...nextProfile,
        name: nextProfile.name.trim(),
        timeOfBirth: nextProfile.timeOfBirth?.trim() || undefined,
        feedingMethod: nextProfile.feedingMethod || undefined,
        gpName: nextProfile.gpName?.trim() || undefined,
        notes: nextProfile.notes?.trim() || undefined,
        updatedAt: Date.now(),
      });
      if (isDemo) {
        setProfile(value);
        return;
      }
      if (!user) throw new Error('需要先登入');
      await set(ref(database, 'kayla/baby/profile'), value);
    },
    [isDemo, user],
  );

  const addRecord = useCallback(
    async (input: NewRecordInput) => {
      if (!user) throw new Error('需要先登入');
      const value: Omit<BabyRecord, 'id'> = {
        ...input,
        details: withoutUndefined(input.details),
        createdAt: Date.now(),
        createdBy: user.uid,
        createdByLabel: user.email?.split('@')[0] || '家庭成員',
      };
      if (isDemo) {
        setRecords((current) => [
          { ...value, id: `demo-${Date.now()}` },
          ...current,
        ]);
        const additions = await preparedQuickOptions(input, user.uid);
        setQuickOptions((current) => mergeQuickOptions(current, additions));
        return;
      }
      await push(ref(database, 'kayla/records'), value);

      // The record is already safely stored at this point. Remembering quick
      // values is an optional convenience, so a Rules/network failure here
      // must not make the user retry and accidentally create a duplicate.
      try {
        const additions = await preparedQuickOptions(input, user.uid);
        const changes: Record<string, unknown> = {};
        additions.forEach(({ field, option }) => {
          const { id, ...storedOption } = option;
          changes[`kayla/quickOptions/${field}/${id}`] = storedOption;
        });
        if (Object.keys(changes).length) await update(ref(database), changes);
      } catch {
        // The actual BB record succeeded; leave quick values unchanged.
      }
    },
    [isDemo, user],
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      if (isDemo) {
        setRecords((current) => current.filter((record) => record.id !== recordId));
        return;
      }
      if (!user) throw new Error('需要先登入');
      await remove(ref(database, `kayla/records/${recordId}`));
    },
    [isDemo, user],
  );

  const deleteQuickOption = useCallback(
    async (field: QuickOptionField, optionId: string) => {
      if (!/^[a-f0-9]{64}$/.test(optionId)) throw new Error('無效快捷選項');
      if (isDemo) {
        setQuickOptions((current) => ({
          ...current,
          [field]: (current[field] || []).filter((option) => option.id !== optionId),
        }));
        return;
      }
      if (!user) throw new Error('需要先登入');
      await remove(ref(database, `kayla/quickOptions/${field}/${optionId}`));
    },
    [isDemo, user],
  );

  const dataBelongsToCurrentUser = Boolean(userId && dataUserId === userId);
  return useMemo(() => ({
    profile: dataBelongsToCurrentUser ? profile : null,
    records: dataBelongsToCurrentUser ? records : [],
    quickOptions: dataBelongsToCurrentUser ? quickOptions : {},
    loading: Boolean(userId && !isDemo && !dataBelongsToCurrentUser) || loading,
    error,
    saveProfile,
    addRecord,
    deleteRecord,
    deleteQuickOption,
  }), [dataBelongsToCurrentUser, profile, records, quickOptions, userId, isDemo, loading, error, saveProfile, addRecord, deleteRecord, deleteQuickOption]);
}
