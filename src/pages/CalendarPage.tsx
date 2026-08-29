import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  AuthUser,
  BabyProfile,
  FamilyTask,
  FamilyTaskInput,
  ScheduleItemState,
  ScheduleItemStateInput,
  ScheduleItemStates,
  ScheduleItemStatus,
} from '../types';
import { HEALTH_SCHEDULE, type HealthScheduleDefinition } from '../data/healthSchedule';
import { Icon } from '../components/Icon';

interface CalendarPageProps {
  profile: BabyProfile | null;
  scheduleItemStates: ScheduleItemStates;
  familyTasks: FamilyTask[];
  currentUser: AuthUser;
  onOpenSettings: () => void;
  onSaveScheduleItemState: (id: string, input: ScheduleItemStateInput) => Promise<void>;
  onAddFamilyTask: (input: FamilyTaskInput) => Promise<unknown>;
  onUpdateFamilyTask: (id: string, input: FamilyTaskInput) => Promise<void>;
  onToggleFamilyTask: (id: string, completed?: boolean) => Promise<void>;
  onDeleteFamilyTask: (id: string) => Promise<void>;
}

type ScheduleFilter = 'all' | 'next' | 'booked' | 'completed' | 'conditional';

const UK_TIME_ZONE = 'Europe/London';
const MS_PER_DAY = 86_400_000;
const longDateFormatter = new Intl.DateTimeFormat('zh-HK', {
  timeZone: UK_TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('zh-HK', {
  timeZone: UK_TIME_ZONE,
  day: 'numeric',
  month: 'short',
});

const statusLabels: Record<ScheduleItemStatus, string> = {
  pending: '待安排',
  booked: '已預約',
  completed: '已完成',
  'not-applicable': '不適用',
};

const categoryLabels: Record<HealthScheduleDefinition['category'], string> = {
  check: '檢查／篩查',
  visit: '健康跟進',
  vaccine: '疫苗',
  admin: '家庭安排',
  treatment: '預防護理',
};

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function addDays(dateOfBirth: string, days: number) {
  const date = parseIsoDate(dateOfBirth);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function referenceDateLabel(item: HealthScheduleDefinition, dateOfBirth: string) {
  if (item.timingMode === 'seasonal') return '足 6 個月後嘅流感季（以 GP／NHS 邀請為準）';
  const start = addDays(dateOfBirth, item.startDay);
  const end = addDays(dateOfBirth, item.endDay);
  if (item.startDay === item.endDay) return longDateFormatter.format(start);
  return `${shortDateFormatter.format(start)} 至 ${longDateFormatter.format(end)}`;
}

function referenceTimestamp(item: HealthScheduleDefinition, dateOfBirth: string) {
  return addDays(dateOfBirth, item.startDay).getTime();
}

function daysFromToday(timestamp: number) {
  const nowParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: UK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(Date.now());
  const values = Object.fromEntries(nowParts.map((part) => [part.type, part.value]));
  const today = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12);
  return Math.ceil((timestamp - today) / MS_PER_DAY);
}

function dueText(days: number) {
  if (days === 0) return '今日';
  if (days === 1) return '聽日';
  if (days > 1) return `${days} 日後`;
  if (days === -1) return '昨日';
  return `已過 ${Math.abs(days)} 日`;
}

function stateFor(item: HealthScheduleDefinition, states: ScheduleItemStates): ScheduleItemState | undefined {
  return states[item.id];
}

function isAutomaticallyApplicable(item: HealthScheduleDefinition, profile: BabyProfile | null) {
  return typeof item.autoApplicableGestationalWeeksBelow === 'number'
    && typeof profile?.gestationalWeeks === 'number'
    && profile.gestationalWeeks < item.autoApplicableGestationalWeeksBelow;
}

function scheduleTimestamp(item: HealthScheduleDefinition, state: ScheduleItemState | undefined, dateOfBirth: string) {
  return state?.appointmentDate ? parseIsoDate(state.appointmentDate).getTime() : referenceTimestamp(item, dateOfBirth);
}

function displayScheduleDate(item: HealthScheduleDefinition, state: ScheduleItemState | undefined, dateOfBirth: string) {
  if (state?.appointmentDate) {
    const appointment = longDateFormatter.format(parseIsoDate(state.appointmentDate));
    return state.appointmentTime ? `${appointment} · ${state.appointmentTime}` : appointment;
  }
  return referenceDateLabel(item, dateOfBirth);
}

function summaryTimingText(item: HealthScheduleDefinition, state: ScheduleItemState | undefined, dateOfBirth: string) {
  if (state?.appointmentDate) return dueText(daysFromToday(parseIsoDate(state.appointmentDate).getTime()));
  const untilStart = daysFromToday(addDays(dateOfBirth, item.startDay).getTime());
  if (item.timingMode === 'seasonal') return untilStart > 0 ? dueText(untilStart) : '等 GP／NHS 按流感季確認';
  const untilEnd = daysFromToday(addDays(dateOfBirth, item.endDay).getTime());
  if (untilStart <= 0 && untilEnd >= 0) return '現正適合安排';
  return untilStart > 0 ? dueText(untilStart) : '參考時段已過';
}

export function CalendarPage({
  profile,
  scheduleItemStates,
  familyTasks,
  currentUser,
  onOpenSettings,
  onSaveScheduleItemState,
  onAddFamilyTask,
  onUpdateFamilyTask,
  onToggleFamilyTask,
  onDeleteFamilyTask,
}: CalendarPageProps) {
  const [filter, setFilter] = useState<ScheduleFilter>('next');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<HealthScheduleDefinition | null>(null);
  const [editingTask, setEditingTask] = useState<FamilyTask | 'new' | null>(null);
  const [taskActionId, setTaskActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const dateOfBirth = profile?.dateOfBirth;
  const universalItems = HEALTH_SCHEDULE.filter((item) => item.audience === 'universal');
  const completedCount = universalItems.filter((item) => stateFor(item, scheduleItemStates)?.status === 'completed').length;
  const progress = universalItems.length ? Math.round((completedCount / universalItems.length) * 100) : 0;

  const nextItem = useMemo(() => {
    if (!dateOfBirth) return null;
    const candidates = HEALTH_SCHEDULE
      .filter((item) => {
        const state = stateFor(item, scheduleItemStates);
        if (state?.status === 'completed' || state?.status === 'not-applicable') return false;
        return item.audience === 'universal' || Boolean(state) || isAutomaticallyApplicable(item, profile);
      });
    const overdue = candidates
      .filter((item) => {
        const state = stateFor(item, scheduleItemStates);
        return state?.status !== 'booked'
          && item.timingMode !== 'seasonal'
          && addDays(dateOfBirth, item.endDay).getTime() < Date.now() - MS_PER_DAY;
      })
      .sort((a, b) => addDays(dateOfBirth, b.endDay).getTime() - addDays(dateOfBirth, a.endDay).getTime());
    if (overdue.length) return overdue[0];

    return candidates
      .sort((a, b) => scheduleTimestamp(a, stateFor(a, scheduleItemStates), dateOfBirth) - scheduleTimestamp(b, stateFor(b, scheduleItemStates), dateOfBirth))[0] || null;
  }, [dateOfBirth, profile, scheduleItemStates]);

  const visibleSchedule = useMemo(() => {
    if (!dateOfBirth) return [];
    return HEALTH_SCHEDULE
      .filter((item) => {
        const state = stateFor(item, scheduleItemStates);
        if (filter === 'booked') return state?.status === 'booked';
        if (filter === 'completed') return state?.status === 'completed';
        if (filter === 'conditional') return item.audience === 'conditional';
        if (filter === 'next') return (item.audience === 'universal' || Boolean(state) || isAutomaticallyApplicable(item, profile)) && state?.status !== 'completed' && state?.status !== 'not-applicable';
        return true;
      })
      .sort((a, b) => scheduleTimestamp(a, stateFor(a, scheduleItemStates), dateOfBirth) - scheduleTimestamp(b, stateFor(b, scheduleItemStates), dateOfBirth));
  }, [dateOfBirth, filter, profile, scheduleItemStates]);

  const sortedTasks = useMemo(() => [...familyTasks].sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt - a.createdAt;
  }), [familyTasks]);

  const toggleTask = async (task: FamilyTask) => {
    setTaskActionId(task.id);
    setActionError('');
    try {
      await onToggleFamilyTask(task.id, !task.completed);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '未能更新待辦，請再試。');
    } finally {
      setTaskActionId(null);
    }
  };

  const deleteTask = async (task: FamilyTask) => {
    if (!window.confirm(`確定刪除「${task.title}」？`)) return;
    setTaskActionId(task.id);
    setActionError('');
    try {
      await onDeleteFamilyTask(task.id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '未能刪除待辦，請再試。');
    } finally {
      setTaskActionId(null);
    }
  };

  return (
    <div className="page calendar-page">
      <header className="page-header calendar-page-header">
        <div>
          <p className="eyebrow">HEALTH SCHEDULE & FAMILY TO-DOS</p>
          <h1>健康日程</h1>
          <p>將英格蘭初生 BB 嘅常規檢查、疫苗同屋企安排放埋一齊；實際預約仍以 NHS／GP 通知為準。</p>
        </div>
        <span className="calendar-sync-note"><Icon name="shield" size={16} />已同步私人家庭空間</span>
      </header>

      {!dateOfBirth ? (
        <div className="large-empty calendar-empty">
          <span className="large-empty-icon"><Icon name="calendar" /></span>
          <h2>先設定 BB 出生日期</h2>
          <p>設定後會自動計出健康檢查同疫苗參考日期，之後可以填返診所實際安排。</p>
          <button className="primary-button" onClick={onOpenSettings}>設定 BB 資料</button>
        </div>
      ) : (
        <>
          <section className="health-summary-card" aria-label="健康日程摘要">
            <div className="health-summary-copy">
              <span className="health-summary-icon"><Icon name={nextItem?.category === 'vaccine' || nextItem?.category === 'treatment' ? 'medicine' : 'calendar'} /></span>
              <div>
                <p className="eyebrow">NEXT FOR {profile?.name?.toUpperCase() || 'BABY'}</p>
                {nextItem ? (
                  <>
                    <h2>{nextItem.title}</h2>
                    <p>{displayScheduleDate(nextItem, stateFor(nextItem, scheduleItemStates), dateOfBirth)} · {summaryTimingText(nextItem, stateFor(nextItem, scheduleItemStates), dateOfBirth)}</p>
                  </>
                ) : (
                  <><h2>暫時冇待辦常規項目</h2><p>已完成嘅項目仍可喺「全部」入面查看同修改。</p></>
                )}
              </div>
            </div>
            <div className="health-progress">
              <div><span>常規進度</span><strong>{completedCount} / {universalItems.length}</strong></div>
              <div className="health-progress-track" role="progressbar" aria-label="常規健康日程完成進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
              {nextItem && <button className="secondary-button" onClick={() => { setExpandedId(nextItem.id); setEditingSchedule(nextItem); }}>查看／安排</button>}
            </div>
          </section>

          <section className="health-schedule-panel">
            <div className="section-heading health-section-heading">
              <div><p className="eyebrow">BIRTH TO 6 MONTHS</p><h2>BB 健康時間線</h2></div>
              <span>{visibleSchedule.length} 個項目</span>
            </div>
            <div className="health-filter-scroller" aria-label="篩選健康日程">
              {([
                ['next', '待處理'],
                ['all', '全部'],
                ['booked', '已預約'],
                ['completed', '已完成'],
                ['conditional', '部分 BB'],
              ] as const).map(([value, label]) => (
                <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>
              ))}
            </div>

            {visibleSchedule.length === 0 ? (
              <div className="health-empty-filter"><Icon name="check" /><strong>呢個分類暫時冇項目</strong><button className="text-button" onClick={() => setFilter('all')}>查看全部日程</button></div>
            ) : (
              <div className="health-timeline">
                {visibleSchedule.map((item) => {
                  const state = stateFor(item, scheduleItemStates);
                  const status = state?.status || 'pending';
                  const expanded = expandedId === item.id;
                  const awaitingEligibility = item.audience === 'conditional' && !state && !isAutomaticallyApplicable(item, profile);
                  const overdue = status === 'pending' && !awaitingEligibility && item.timingMode !== 'seasonal' && addDays(dateOfBirth, item.endDay).getTime() < Date.now() - MS_PER_DAY;
                  return (
                    <article key={item.id} className={`health-event-card ${expanded ? 'expanded' : ''} status-${status}`}>
                      <span className="health-timeline-marker" aria-hidden="true"><span /></span>
                      <button className="health-event-summary" onClick={() => setExpandedId(expanded ? null : item.id)} aria-expanded={expanded}>
                        <span className={`health-category-icon category-${item.category}`}><Icon name={item.category === 'vaccine' || item.category === 'treatment' ? 'medicine' : item.category === 'admin' ? 'note' : item.category === 'visit' ? 'user' : 'shield'} size={20} /></span>
                        <span className="health-event-main">
                          <span className="health-event-badges">
                            <span className={`health-audience ${item.audience}`}>{item.audience === 'universal' ? '所有 BB' : '只適用部分 BB'}</span>
                            <span>{categoryLabels[item.category]}</span>
                            {overdue && <span className="health-overdue">待核對</span>}
                          </span>
                          <strong>{item.title}</strong>
                          <span>{state?.appointmentDate ? '實際安排：' : '參考時間：'}{displayScheduleDate(item, state, dateOfBirth)}</span>
                        </span>
                        <span className={`health-status status-${status}`}><Icon name={status === 'completed' || status === 'not-applicable' ? 'check' : status === 'booked' ? 'calendar' : 'clock'} size={14} />{awaitingEligibility ? '待確認是否適用' : statusLabels[status]}</span>
                        <Icon className="health-event-chevron" name="chevron" size={18} />
                      </button>

                      {expanded && (
                        <div className="health-event-details">
                          <p className="health-event-summary-text">{item.summary}</p>
                          <div className="health-event-facts">
                            <div><span>官方參考時間</span><strong>{item.displayTiming}</strong><small>{referenceDateLabel(item, dateOfBirth)}</small></div>
                            {state?.location && <div><span>地點</span><strong>{state.location}</strong></div>}
                            {state?.notes && <div><span>家庭備註</span><strong>{state.notes}</strong></div>}
                          </div>
                          {item.conditionalNote && <div className="health-conditional-note"><Icon name="alert" size={17} /><span><strong>適用情況</strong>{item.conditionalNote}</span></div>}
                          <div className="health-detail-grid">
                            <div><h4>點解要做</h4><p>{item.why}</p></div>
                            <div><h4>當日會做咩</h4><ul>{item.whatToExpect.map((point) => <li key={point}>{point}</li>)}</ul></div>
                            <div><h4>事前準備</h4><ul>{item.prepare.map((point) => <li key={point}>{point}</li>)}</ul></div>
                            {item.followUp && <div><h4>之後留意</h4><ul>{item.followUp.map((point) => <li key={point}>{point}</li>)}</ul></div>}
                          </div>
                          <div className="health-event-footer">
                            <div className="health-source-links">{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
                            <button className="primary-button" onClick={() => setEditingSchedule(item)}><Icon name="edit" size={17} />{status === 'pending' ? '安排／記錄' : '修改安排'}</button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            <div className="calendar-disclaimer"><Icon name="shield" size={17} /><span><strong>參考日期唔等於預約。</strong> 等 GP、midwife 或 health visitor 通知後，請填返實際日期；BB 身體不適時唔好等下一個日程，應聯絡 NHS 111／GP，緊急情況打 999。</span></div>
          </section>

          <section className="family-tasks-card">
            <div className="section-heading health-section-heading">
              <div><p className="eyebrow">SHARED FAMILY TO-DOS</p><h2>家庭待辦</h2></div>
              <button className="secondary-button family-add-task" onClick={() => setEditingTask('new')}><Icon name="plus" size={17} />新增</button>
            </div>
            <p className="family-task-intro">記低登記出生、覆診要問嘅問題、帶 Red Book 等私人安排；兩個家庭帳戶都會睇到更新。</p>
            {actionError && <div className="form-error" role="alert">{actionError}</div>}
            {sortedTasks.length === 0 ? (
              <div className="family-task-empty"><span><Icon name="check" /></span><strong>未有家庭待辦</strong><p>加低下一次要做嘅事，屋企人就唔使靠記憶。</p><button className="text-button" onClick={() => setEditingTask('new')}>新增第一項</button></div>
            ) : (
              <div className="family-task-list">
                {sortedTasks.map((task) => (
                  <article key={task.id} className={task.completed ? 'completed' : ''}>
                    <button className="family-task-check" onClick={() => toggleTask(task)} disabled={taskActionId === task.id} aria-label={`${task.completed ? '標記未完成' : '標記完成'}：${task.title}`} aria-pressed={task.completed}><Icon name="check" size={16} /></button>
                    <button className="family-task-copy" onClick={() => setEditingTask(task)}>
                      <strong>{task.title}</strong>
                      <span>{task.dueDate ? `${longDateFormatter.format(parseIsoDate(task.dueDate))}${task.dueTime ? ` · ${task.dueTime}` : ''}` : '未設定日期'}{task.location ? ` · ${task.location}` : ''}</span>
                      {task.notes && <small>{task.notes}</small>}
                    </button>
                    <button className="icon-button family-task-edit" onClick={() => setEditingTask(task)} aria-label={`修改：${task.title}`}><Icon name="edit" size={17} /></button>
                    <button className="icon-button family-task-delete" onClick={() => deleteTask(task)} disabled={taskActionId === task.id} aria-label={`刪除：${task.title}`}><Icon name="trash" size={17} /></button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {editingSchedule && dateOfBirth && (
        <ScheduleEditor item={editingSchedule} state={stateFor(editingSchedule, scheduleItemStates)} referenceLabel={referenceDateLabel(editingSchedule, dateOfBirth)} onClose={() => setEditingSchedule(null)} onSave={(input) => onSaveScheduleItemState(editingSchedule.id, input)} />
      )}
      {editingTask && (
        <TaskEditor task={editingTask === 'new' ? null : editingTask} currentUserLabel={currentUser.email?.split('@')[0] || '家庭成員'} onClose={() => setEditingTask(null)} onSave={(input) => editingTask === 'new' ? onAddFamilyTask(input) : onUpdateFamilyTask(editingTask.id, input)} />
      )}
    </div>
  );
}

interface ScheduleEditorProps {
  item: HealthScheduleDefinition;
  state?: ScheduleItemState;
  referenceLabel: string;
  onClose: () => void;
  onSave: (input: ScheduleItemStateInput) => Promise<void>;
}

function ScheduleEditor({ item, state, referenceLabel, onClose, onSave }: ScheduleEditorProps) {
  const [status, setStatus] = useState<ScheduleItemStatus>(state?.status || 'pending');
  const [appointmentDate, setAppointmentDate] = useState(state?.appointmentDate || '');
  const [appointmentTime, setAppointmentTime] = useState(state?.appointmentTime || '');
  const [location, setLocation] = useState(state?.location || '');
  const [notes, setNotes] = useState(state?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useDialog(onClose);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'booked' && !appointmentDate) {
      setError('已預約項目需要填實際日期。');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ status, appointmentDate: appointmentDate || undefined, appointmentTime: appointmentDate && appointmentTime ? appointmentTime : undefined, location: location.trim() || undefined, notes: notes.trim() || undefined });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '未能儲存安排，請再試。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop health-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="health-editor-sheet" role="dialog" aria-modal="true" aria-labelledby="schedule-editor-title">
        <div className="sheet-handle" />
        <header className="health-editor-header"><div><p className="eyebrow">HEALTH SCHEDULE</p><h2 id="schedule-editor-title">{item.title}</h2><p>官方參考：{item.displayTiming}（{referenceLabel}）</p></div><button className="icon-button" onClick={onClose} aria-label="關閉"><Icon name="close" /></button></header>
        <form className="health-editor-form" onSubmit={submit}>
          <fieldset className="choice-group"><legend>目前狀態</legend><div className="health-status-options">
            {(['pending', 'booked', 'completed', ...(item.audience === 'conditional' ? ['not-applicable'] : [])] as ScheduleItemStatus[]).map((value) => <button type="button" key={value} className={status === value ? 'selected' : ''} onClick={() => { setStatus(value); if (value === 'pending' || value === 'not-applicable') { setAppointmentDate(''); setAppointmentTime(''); } }} aria-pressed={status === value}>{statusLabels[value]}</button>)}
          </div></fieldset>
          <div className="form-row two-columns health-date-fields">
            <label className="field">實際日期<input type="date" value={appointmentDate} onChange={(event) => { setAppointmentDate(event.target.value); if (event.target.value && status === 'pending') setStatus('booked'); }} /></label>
            <label className="field">時間（可留空）<input type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} disabled={!appointmentDate} /></label>
          </div>
          <label className="field">地點（可留空）<input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={100} placeholder="例如：GP surgery／醫院" /></label>
          <label className="field">家庭備註（可留空）<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={600} placeholder="例如：要帶 Red Book、想問醫生嘅問題" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="health-editor-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>取消</button><button className="primary-button" disabled={saving}>{saving ? '儲存中…' : '儲存安排'}</button></div>
        </form>
      </section>
    </div>
  );
}

interface TaskEditorProps {
  task: FamilyTask | null;
  currentUserLabel: string;
  onClose: () => void;
  onSave: (input: FamilyTaskInput) => Promise<unknown>;
}

function TaskEditor({ task, currentUserLabel, onClose, onSave }: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  const [location, setLocation] = useState(task?.location || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useDialog(onClose);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('請填待辦名稱。');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), dueDate: dueDate || undefined, dueTime: dueDate && dueTime ? dueTime : undefined, location: location.trim() || undefined, notes: notes.trim() || undefined });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '未能儲存待辦，請再試。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop health-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="health-editor-sheet compact" role="dialog" aria-modal="true" aria-labelledby="task-editor-title">
        <div className="sheet-handle" />
        <header className="health-editor-header"><div><p className="eyebrow">FAMILY TO-DO</p><h2 id="task-editor-title">{task ? '修改家庭待辦' : '新增家庭待辦'}</h2><p>儲存後會同步俾家庭成員；今次由 {currentUserLabel} 更新。</p></div><button className="icon-button" onClick={onClose} aria-label="關閉"><Icon name="close" /></button></header>
        <form className="health-editor-form" onSubmit={submit}>
          <label className="field">待辦名稱<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="例如：登記出生／帶 Red Book" /></label>
          <div className="form-row two-columns health-date-fields"><label className="field">日期（可留空）<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label className="field">時間（可留空）<input type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} disabled={!dueDate} /></label></div>
          <label className="field">地點（可留空）<input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={100} placeholder="例如：Register Office／GP surgery" /></label>
          <label className="field">備註（可留空）<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={600} /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="health-editor-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>取消</button><button className="primary-button" disabled={saving}>{saving ? '儲存中…' : task ? '儲存修改' : '新增待辦'}</button></div>
        </form>
      </section>
    </div>
  );
}

function useDialog(onClose: () => void) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);
}
