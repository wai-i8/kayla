import { useState } from 'react';
import type { BabyProfile } from '../types';
import { dateInputValue } from '../lib/date';
import { getDailyBabyReminders, getEligibleBabyReminders } from '../lib/reminderEngine';
import type { BabyReminder } from '../data/babyReminders';
import { Icon } from './Icon';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface DailyBabyRemindersProps {
  profile: BabyProfile | null;
  onSaveProfile: (profile: BabyProfile) => Promise<void>;
  onOpenGuide: (sectionId?: string) => void;
}

function ageLabel(days: number, weeks: number, months: number) {
  if (days === 0) return '出生第 1 日';
  if (days < 14) return `出生第 ${days + 1} 日`;
  if (days < 56) return `${weeks} 週 ${days % 7} 日`;
  return `${months} 個月${days % 30 ? ` ${days % 30} 日` : ''}`;
}

function ReminderRow({ reminder, onOpenDetail, onOpenGuide }: { reminder: BabyReminder; onOpenDetail: (reminder: BabyReminder) => void; onOpenGuide: (sectionId?: string) => void }) {
  return (
    <article className={`daily-reminder-row priority-${reminder.priority}`} data-testid={`daily-reminder-${reminder.id}`}>
      <div className="daily-reminder-emoji" aria-hidden="true">{reminder.emoji}</div>
      <div className="daily-reminder-copy">
        <div className="daily-reminder-title-line"><h3>{reminder.title}</h3><span className={`reminder-priority priority-${reminder.priority}`}>{reminder.priority === 'important' ? '重要' : reminder.priority === 'action' ? '今日做' : ''}</span></div>
        <p>{reminder.shortText}</p>
        <div className="daily-reminder-actions">
          <button type="button" className="text-button" onClick={() => onOpenDetail(reminder)}>了解多啲</button>
          {reminder.guideTargetId && <button type="button" className="text-button reminder-guide-link" onClick={() => onOpenGuide(reminder.guideTargetId)}>開啟指南 <Icon name="chevron" size={13} /></button>}
        </div>
      </div>
    </article>
  );
}

function ReminderDialog({ reminder, onClose, onOpenGuide }: { reminder: BabyReminder; onClose: () => void; onOpenGuide: (sectionId?: string) => void }) {
  const dialogRef = useDialogFocus(true, onClose);
  return (
    <div className="modal-backdrop reminder-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="reminder-dialog" role="dialog" aria-modal="true" aria-labelledby="reminder-detail-title">
        <header className="reminder-dialog-header">
          <div><span className="daily-reminder-dialog-emoji" aria-hidden="true">{reminder.emoji}</span><div><p className="eyebrow">今日提醒</p><h2 id="reminder-detail-title">{reminder.title}</h2></div></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="關閉提醒詳情"><Icon name="close" size={20} /></button>
        </header>
        <div className="reminder-dialog-content">
          <p>{reminder.detailText}</p>
          <div className="reminder-disclaimer"><Icon name="shield" size={16} /><span>一般育兒資訊，不取代 midwife、health visitor 或醫生按你 BB 情況提供嘅個別建議。</span></div>
          <div className="reminder-dialog-actions">
            {reminder.guideTargetId && <button type="button" className="primary-button" onClick={() => { onClose(); onOpenGuide(reminder.guideTargetId); }}>開啟相關指南 <Icon name="chevron" size={16} /></button>}
            {reminder.sourceUrl && <a className="secondary-button" href={reminder.sourceUrl} target="_blank" rel="noreferrer">參考：{reminder.sourceName || '官方資料'}</a>}
          </div>
        </div>
      </section>
    </div>
  );
}

export function DailyBabyReminders({ profile, onSaveProfile, onOpenGuide }: DailyBabyRemindersProps) {
  const now = Date.now();
  const [allOpen, setAllOpen] = useState(false);
  const [detail, setDetail] = useState<BabyReminder | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');
  const result = profile ? getDailyBabyReminders(profile, now) : null;
  const allDialogRef = useDialogFocus(allOpen, () => setAllOpen(false));

  if (!profile) return null;

  const markCordDetached = async () => {
    if (savingEvent) return;
    setSavingEvent(true);
    setEventError('');
    try {
      await onSaveProfile({
        ...profile,
        events: { ...profile.events, umbilicalCordDetachedAt: dateInputValue(now) },
      });
    } catch {
      setEventError('未能儲存，請稍後再試或到設定檢查權限。');
    } finally {
      setSavingEvent(false);
    }
  };

  if (!result?.age.valid || result.age.future) {
    return (
      <section className="daily-reminders-card daily-reminders-empty" aria-labelledby="daily-reminders-title" data-testid="daily-baby-reminders">
        <div className="daily-reminders-heading"><div><p className="eyebrow">NEW PARENT CHECK-IN</p><h2 id="daily-reminders-title">今日新手媽媽提醒</h2></div></div>
        <p>{result?.age.future ? '出生日期似乎係未來日期，請到設定檢查 BB 資料。' : '設定有效出生日期後，呢度會按 BB 日齡顯示每日提醒。'}</p>
      </section>
    );
  }

  const all = getEligibleBabyReminders(profile, now).eligible;
  const shownIds = new Set(result.reminders.map((reminder) => reminder.id));

  return (
    <>
      <section className="daily-reminders-card" aria-labelledby="daily-reminders-title" data-testid="daily-baby-reminders">
        <div className="daily-reminders-heading">
          <div><p className="eyebrow">NEW PARENT CHECK-IN</p><h2 id="daily-reminders-title">今日新手媽媽提醒</h2><p>BB 而家係 {ageLabel(result.age.babyAgeDays, result.age.babyAgeWeeks, result.age.babyAgeMonths)}，揀咗幾項今日最實用嘅小提醒。</p></div>
          <span className="daily-reminders-count">{result.eligibleCount} 項合資格</span>
        </div>
        <div className="daily-reminder-list">
          {result.reminders.map((reminder) => (
            <div key={reminder.id}>
              <ReminderRow reminder={reminder} onOpenDetail={setDetail} onOpenGuide={onOpenGuide} />
              {reminder.eventKey === 'umbilicalCordDetachedAt' && reminder.eventCondition === 'unset' && <button type="button" className="reminder-event-button" onClick={markCordDetached} disabled={savingEvent}>{savingEvent ? '儲存中…' : '臍帶已脫落 ✓'}</button>}
            </div>
          ))}
        </div>
        {eventError && <p className="daily-reminders-event-error" role="alert">{eventError}</p>}
        {result.eligibleCount > result.reminders.length && <button type="button" className="daily-reminders-view-all" onClick={() => setAllOpen(true)} data-testid="view-all-baby-reminders">查看今日全部提醒 <span>({result.eligibleCount})</span><Icon name="chevron" size={16} /></button>}
        {!result.reminders.length && <p className="daily-reminders-no-results">今日暫時未有合適提醒，聽日再睇下。</p>}
      </section>

      {allOpen && (
        <div className="modal-backdrop reminder-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAllOpen(false)}>
          <section ref={allDialogRef} className="reminder-dialog reminder-all-dialog" role="dialog" aria-modal="true" aria-labelledby="all-reminders-title">
            <header className="reminder-dialog-header"><div><p className="eyebrow">今日全部提醒</p><h2 id="all-reminders-title">按 BB 而家嘅階段</h2></div><button type="button" className="icon-button" onClick={() => setAllOpen(false)} aria-label="關閉全部提醒"><Icon name="close" size={20} /></button></header>
            <div className="reminder-all-list">
              {all.map((reminder) => <div key={reminder.id} className={shownIds.has(reminder.id) ? 'reminder-all-item shown' : 'reminder-all-item'}><ReminderRow reminder={reminder} onOpenDetail={(item) => { setAllOpen(false); setDetail(item); }} onOpenGuide={(sectionId) => { setAllOpen(false); onOpenGuide(sectionId); }} /></div>)}
            </div>
            <p className="reminder-dialog-footnote">重要安全提醒可能按週期重現；一般內容會用每日固定輪換，重新整理唔會隨機換走今日一組。</p>
          </section>
        </div>
      )}
      {detail && <ReminderDialog reminder={detail} onClose={() => setDetail(null)} onOpenGuide={onOpenGuide} />}
    </>
  );
}
