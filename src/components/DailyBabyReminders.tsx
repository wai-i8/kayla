import { useState } from 'react';
import type { BabyProfile } from '../types';
import { getDailyBabyReminders } from '../lib/reminderEngine';
import type { BabyReminder } from '../data/babyReminders';
import { Icon } from './Icon';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface DailyBabyRemindersProps {
  profile: BabyProfile | null;
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
        <div className="daily-reminder-title-line">
          <h3>{reminder.title}</h3>
          {(reminder.priority === 'important' || reminder.priority === 'action') && (
            <span className={`reminder-priority priority-${reminder.priority}`}>{reminder.priority === 'important' ? '重要' : '今日留意'}</span>
          )}
        </div>
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
          <div><span className="daily-reminder-dialog-emoji" aria-hidden="true">{reminder.emoji}</span><div><p className="eyebrow">是日注意事項</p><h2 id="reminder-detail-title">{reminder.title}</h2></div></div>
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

export function DailyBabyReminders({ profile, onOpenGuide }: DailyBabyRemindersProps) {
  const [detail, setDetail] = useState<BabyReminder | null>(null);
  const result = profile ? getDailyBabyReminders(profile) : null;

  if (!profile) return null;

  if (!result?.age.valid || result.age.future) {
    return (
      <section className="daily-reminders-card daily-reminders-empty" aria-labelledby="daily-reminders-title" data-testid="daily-baby-reminders">
        <div className="daily-reminders-heading"><div><p className="eyebrow">TODAY · AGE-AWARE</p><h2 id="daily-reminders-title">是日注意事項</h2></div></div>
        <p>{result?.age.future ? '出生日期似乎係未來日期，請到設定檢查 BB 資料。' : '設定有效出生日期後，呢度會按 BB 日齡顯示是日注意事項。'}</p>
      </section>
    );
  }

  return (
    <>
      <section className="daily-reminders-card" aria-labelledby="daily-reminders-title" data-testid="daily-baby-reminders">
        <div className="daily-reminders-heading">
          <div>
            <p className="eyebrow">TODAY · AGE-AWARE</p>
            <h2 id="daily-reminders-title">是日注意事項</h2>
            <p>BB 而家係 {ageLabel(result.age.babyAgeDays, result.age.babyAgeWeeks, result.age.babyAgeMonths)}。</p>
          </div>
        </div>
        {result.reminders.length ? (
          <div className="daily-reminder-list">
            {result.reminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onOpenDetail={setDetail} onOpenGuide={onOpenGuide} />)}
          </div>
        ) : (
          <p className="daily-reminders-no-results">今日冇特別成長節點要提醒，照平時節奏照顧 BB 就得。</p>
        )}
      </section>
      {detail && <ReminderDialog reminder={detail} onClose={() => setDetail(null)} onOpenGuide={onOpenGuide} />}
    </>
  );
}
