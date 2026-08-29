import { useCallback, useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, remove, runTransaction, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import {
  cleanFamilyTaskInput,
  cleanScheduleItemStateInput,
  isFamilyTaskId,
  isScheduleItemId,
  parseFamilyTasks,
  parseScheduleItemStates,
} from '../lib/planner';
import { isQuickOptionField, isQuickOptionValue, quickOptionEntries, quickOptionId } from '../lib/quickOptions';
import { isRecordComplete } from '../lib/records';
import type {
  AuthUser,
  BabyProfile,
  BabyRecord,
  FamilyTask,
  FamilyTaskInput,
  NewRecordInput,
  QuickOption,
  QuickOptionField,
  QuickOptionsByField,
  ScheduleItemState,
  ScheduleItemStateInput,
  ScheduleItemStates,
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
  {
    id: 'demo-sleep-1',
    type: 'sleep',
    occurredAt: now - 7.25 * 3_600_000,
    createdAt: now - 7.2 * 3_600_000,
    createdBy: 'demo-family',
    createdByLabel: '屋企人',
    details: { sleepMinutes: 80 },
  },
  {
    id: 'demo-medicine-1',
    type: 'medicine',
    occurredAt: now - 22 * 3_600_000,
    createdAt: now - 21.9 * 3_600_000,
    createdBy: 'demo-owner',
    createdByLabel: '你',
    details: { medicineName: '維他命 D', concentration: '400 IU / 1 滴', doseMl: 1 },
  },
  {
    id: 'demo-weight-1',
    type: 'weight',
    occurredAt: now - 3 * 86_400_000,
    createdAt: now - 3 * 86_400_000 + 60_000,
    createdBy: 'demo-owner',
    createdByLabel: '你',
    details: { weightKg: 3.54 },
  },
];

const demoScheduleItemStates: ScheduleItemStates = {
  'newborn-physical-exam': {
    id: 'newborn-physical-exam',
    status: 'completed',
    completedAt: now - 17 * 86_400_000,
    updatedAt: now - 17 * 86_400_000,
    updatedBy: 'demo-owner',
    updatedByLabel: '你',
  },
  'newborn-blood-spot': {
    id: 'newborn-blood-spot',
    status: 'completed',
    completedAt: now - 13 * 86_400_000,
    updatedAt: now - 13 * 86_400_000,
    updatedBy: 'demo-family',
    updatedByLabel: '屋企人',
  },
  'health-visitor-new-baby-review': {
    id: 'health-visitor-new-baby-review',
    status: 'completed',
    completedAt: now - 6 * 86_400_000,
    updatedAt: now - 6 * 86_400_000,
    updatedBy: 'demo-owner',
    updatedByLabel: '你',
  },
};

const demoFamilyTasks: FamilyTask[] = [
  {
    id: 'demo-task-red-book',
    title: '下次覆診帶埋 Red Book',
    dueDate: new Date(now + 3 * 86_400_000).toISOString().slice(0, 10),
    completed: false,
    createdAt: now - 2 * 86_400_000,
    createdBy: 'demo-owner',
    createdByLabel: '你',
  },
  {
    id: 'demo-task-gp',
    title: '幫 BB 登記 GP',
    completed: true,
    completedAt: now - 10 * 86_400_000,
    createdAt: now - 16 * 86_400_000,
    createdBy: 'demo-family',
    createdByLabel: '屋企人',
  },
];

function sortedFamilyTasks(tasks: FamilyTask[]) {
  return parseFamilyTasks(Object.fromEntries(tasks.map(({ id, ...task }) => [id, task])));
}

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
  const [scheduleItemStates, setScheduleItemStates] = useState<ScheduleItemStates>(isDemo ? demoScheduleItemStates : {});
  const [familyTasks, setFamilyTasks] = useState<FamilyTask[]>(isDemo ? demoFamilyTasks : []);
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
      setScheduleItemStates({});
      setFamilyTasks([]);
      setLoading(false);
      return undefined;
    }

    if (isDemo) {
      setDataUserId(userId);
      setProfile(demoProfile);
      setRecords(demoRecords);
      setQuickOptions({});
      setScheduleItemStates(demoScheduleItemStates);
      setFamilyTasks(demoFamilyTasks);
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
    setScheduleItemStates({});
    setFamilyTasks([]);
    setLoading(true);
    let profileReady = false;
    let recordsReady = false;
    let scheduleReady = false;
    let tasksReady = false;
    const finish = () => {
      if (profileReady && recordsReady && scheduleReady && tasksReady) setLoading(false);
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
        // Realtime Database removes empty objects. Draft records can therefore
        // arrive without a `details` child even though the app always exposes
        // a normalized object to the UI.
        const value = snapshot.val() as Record<string, Omit<Omit<BabyRecord, 'id'>, 'details'> & {
          details?: BabyRecord['details'];
        }> | null;
        const nextRecords = value
          ? Object.entries(value)
              .map(([id, record]) => ({ ...record, id, details: record.details || {} }))
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

    const stopSchedule = onValue(
      ref(database, 'kayla/planner/schedule'),
      (snapshot) => {
        setScheduleItemStates(parseScheduleItemStates(snapshot.val()));
        scheduleReady = true;
        finish();
      },
      () => {
        setScheduleItemStates({});
        setError('未能讀取健康日程，請檢查帳戶權限。');
        scheduleReady = true;
        finish();
      },
    );

    const stopFamilyTasks = onValue(
      ref(database, 'kayla/planner/tasks'),
      (snapshot) => {
        setFamilyTasks(parseFamilyTasks(snapshot.val()));
        tasksReady = true;
        finish();
      },
      () => {
        setFamilyTasks([]);
        setError('未能讀取家庭待辦，請檢查帳戶權限。');
        tasksReady = true;
        finish();
      },
    );

    return () => {
      stopProfile();
      stopRecords();
      stopQuickOptions();
      stopSchedule();
      stopFamilyTasks();
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
      const details = withoutUndefined(input.details);
      const value = withoutUndefined<Omit<BabyRecord, 'id'>>({
        ...input,
        details,
        status: isRecordComplete(input.type, details) ? undefined : 'draft',
        createdAt: Date.now(),
        createdBy: user.uid,
        createdByLabel: user.email?.split('@')[0] || '家庭成員',
      });
      if (isDemo) {
        setRecords((current) => [
          { ...value, id: `demo-${Date.now()}`, details: value.details || {} },
          ...current,
        ].sort((a, b) => b.occurredAt - a.occurredAt));
        try {
          const additions = await preparedQuickOptions(input, user.uid);
          setQuickOptions((current) => mergeQuickOptions(current, additions));
        } catch {
          // Remembered values are optional; the demo record is already saved.
        }
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

  const updateRecord = useCallback(
    async (recordId: string, input: NewRecordInput) => {
      if (!user) throw new Error('需要先登入');
      const existing = records.find((record) => record.id === recordId);
      if (!existing) throw new Error('搵唔到要修改嘅紀錄');

      const details = withoutUndefined(input.details);
      const value = withoutUndefined<Omit<BabyRecord, 'id'>>({
        ...input,
        details,
        status: isRecordComplete(input.type, details) ? undefined : 'draft',
        createdAt: existing.createdAt,
        createdBy: existing.createdBy,
        createdByLabel: existing.createdByLabel,
        updatedAt: Date.now(),
        updatedBy: user.uid,
      });

      if (isDemo) {
        setRecords((current) => current
          .map((record) => (record.id === recordId
            ? { ...value, id: recordId, details: value.details || {} }
            : record))
          .sort((a, b) => b.occurredAt - a.occurredAt));
        try {
          const additions = await preparedQuickOptions(input, user.uid);
          setQuickOptions((current) => mergeQuickOptions(current, additions));
        } catch {
          // Remembered values are optional; the demo record is already saved.
        }
        return;
      }

      // Replace the whole node so clearing an old optional field actually
      // removes it instead of leaving stale values behind.
      await set(ref(database, `kayla/records/${recordId}`), value);

      try {
        const additions = await preparedQuickOptions(input, user.uid);
        const changes: Record<string, unknown> = {};
        additions.forEach(({ field, option }) => {
          const { id, ...storedOption } = option;
          changes[`kayla/quickOptions/${field}/${id}`] = storedOption;
        });
        if (Object.keys(changes).length) await update(ref(database), changes);
      } catch {
        // The record update succeeded; leave quick values unchanged.
      }
    },
    [isDemo, records, user],
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

  const saveScheduleItemState = useCallback(
    async (scheduleItemId: string, input: ScheduleItemStateInput) => {
      if (!user) throw new Error('需要先登入');
      if (!isScheduleItemId(scheduleItemId)) throw new Error('無效健康日程項目');
      const cleaned = cleanScheduleItemStateInput(input);
      const existing = scheduleItemStates[scheduleItemId];
      const updatedAt = Date.now();
      const clearsAppointment = cleaned.status === 'not-applicable' || cleaned.status === 'pending';
      const clearsLocation = cleaned.status === 'not-applicable';
      const value = withoutUndefined<Omit<ScheduleItemState, 'id'>>({
        ...cleaned,
        appointmentDate: clearsAppointment ? undefined : cleaned.appointmentDate,
        appointmentTime: clearsAppointment ? undefined : cleaned.appointmentTime,
        location: clearsLocation ? undefined : cleaned.location,
        completedAt: cleaned.status === 'completed'
          ? existing?.completedAt || updatedAt
          : undefined,
        updatedAt,
        updatedBy: user.uid,
        updatedByLabel: user.email?.split('@')[0] || '家庭成員',
      });

      if (isDemo) {
        setScheduleItemStates((current) => ({
          ...current,
          [scheduleItemId]: { ...value, id: scheduleItemId },
        }));
        return;
      }

      // Replace the whole state node so clearing an appointment field does
      // not leave a stale value in Realtime Database.
      await set(ref(database, `kayla/planner/schedule/${scheduleItemId}`), value);
    },
    [isDemo, scheduleItemStates, user],
  );

  const addFamilyTask = useCallback(
    async (input: FamilyTaskInput) => {
      if (!user) throw new Error('需要先登入');
      const cleaned = cleanFamilyTaskInput(input);
      const createdAt = Date.now();
      const value = withoutUndefined<Omit<FamilyTask, 'id'>>({
        ...cleaned,
        completed: false,
        createdAt,
        createdBy: user.uid,
        createdByLabel: user.email?.split('@')[0] || '家庭成員',
      });

      if (isDemo) {
        const id = `demo-task-${createdAt}`;
        setFamilyTasks((current) => sortedFamilyTasks([...current, { ...value, id }]));
        return id;
      }

      const taskRef = push(ref(database, 'kayla/planner/tasks'));
      if (!taskRef.key) throw new Error('未能建立家庭待辦');
      await set(taskRef, value);
      return taskRef.key;
    },
    [isDemo, user],
  );

  const updateFamilyTask = useCallback(
    async (taskId: string, input: FamilyTaskInput) => {
      if (!user) throw new Error('需要先登入');
      if (!isFamilyTaskId(taskId)) throw new Error('無效家庭待辦');
      const existing = familyTasks.find((task) => task.id === taskId);
      if (!existing) throw new Error('搵唔到要修改嘅家庭待辦');
      const cleaned = cleanFamilyTaskInput(input);
      const updatedAt = Date.now();
      const updatedByLabel = user.email?.split('@')[0] || '家庭成員';
      const value = withoutUndefined<Omit<FamilyTask, 'id'>>({
        ...cleaned,
        completed: existing.completed,
        completedAt: existing.completedAt,
        createdAt: existing.createdAt,
        createdBy: existing.createdBy,
        createdByLabel: existing.createdByLabel,
        updatedAt,
        updatedBy: user.uid,
        updatedByLabel,
      });

      if (isDemo) {
        setFamilyTasks((current) => sortedFamilyTasks(current.map((task) => (
          task.id === taskId ? { ...value, id: taskId } : task
        ))));
        return;
      }

      const taskRef = ref(database, `kayla/planner/tasks/${taskId}`);
      const result = await runTransaction(taskRef, (current) => {
        if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
        return {
          ...current,
          title: cleaned.title,
          dueDate: cleaned.dueDate ?? null,
          dueTime: cleaned.dueTime ?? null,
          location: cleaned.location ?? null,
          notes: cleaned.notes ?? null,
          updatedAt,
          updatedBy: user.uid,
          updatedByLabel,
        };
      });
      if (!result.committed) throw new Error('待辦已被刪除，請重新整理。');
    },
    [familyTasks, isDemo, user],
  );

  const toggleFamilyTask = useCallback(
    async (taskId: string, completed?: boolean) => {
      if (!user) throw new Error('需要先登入');
      if (!isFamilyTaskId(taskId)) throw new Error('無效家庭待辦');
      const existing = familyTasks.find((task) => task.id === taskId);
      if (!existing) throw new Error('搵唔到要修改嘅家庭待辦');
      const updatedAt = Date.now();
      const nextCompleted = completed ?? !existing.completed;
      const updatedByLabel = user.email?.split('@')[0] || '家庭成員';
      const { id: _id, ...stored } = existing;
      const value = withoutUndefined<Omit<FamilyTask, 'id'>>({
        ...stored,
        completed: nextCompleted,
        completedAt: nextCompleted ? existing.completedAt || updatedAt : undefined,
        updatedAt,
        updatedBy: user.uid,
        updatedByLabel,
      });

      if (isDemo) {
        setFamilyTasks((current) => sortedFamilyTasks(current.map((task) => (
          task.id === taskId ? { ...value, id: taskId } : task
        ))));
        return;
      }

      const taskRef = ref(database, `kayla/planner/tasks/${taskId}`);
      const result = await runTransaction(taskRef, (current) => {
        if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
        const currentCompletedAt = typeof current.completedAt === 'number' && Number.isFinite(current.completedAt)
          ? current.completedAt
          : undefined;
        return {
          ...current,
          completed: nextCompleted,
          completedAt: nextCompleted ? currentCompletedAt || updatedAt : null,
          updatedAt,
          updatedBy: user.uid,
          updatedByLabel,
        };
      });
      if (!result.committed) throw new Error('待辦已被刪除，請重新整理。');
    },
    [familyTasks, isDemo, user],
  );

  const deleteFamilyTask = useCallback(
    async (taskId: string) => {
      if (!isFamilyTaskId(taskId)) throw new Error('無效家庭待辦');
      if (isDemo) {
        setFamilyTasks((current) => current.filter((task) => task.id !== taskId));
        return;
      }
      if (!user) throw new Error('需要先登入');
      await remove(ref(database, `kayla/planner/tasks/${taskId}`));
    },
    [isDemo, user],
  );

  const dataBelongsToCurrentUser = Boolean(userId && dataUserId === userId);
  return useMemo(() => ({
    profile: dataBelongsToCurrentUser ? profile : null,
    records: dataBelongsToCurrentUser ? records : [],
    quickOptions: dataBelongsToCurrentUser ? quickOptions : {},
    scheduleItemStates: dataBelongsToCurrentUser ? scheduleItemStates : {},
    familyTasks: dataBelongsToCurrentUser ? familyTasks : [],
    loading: Boolean(userId && !isDemo && !dataBelongsToCurrentUser) || loading,
    error,
    saveProfile,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteQuickOption,
    saveScheduleItemState,
    addFamilyTask,
    updateFamilyTask,
    toggleFamilyTask,
    deleteFamilyTask,
  }), [dataBelongsToCurrentUser, profile, records, quickOptions, scheduleItemStates, familyTasks, userId, isDemo, loading, error, saveProfile, addRecord, updateRecord, deleteRecord, deleteQuickOption, saveScheduleItemState, addFamilyTask, updateFamilyTask, toggleFamilyTask, deleteFamilyTask]);
}
