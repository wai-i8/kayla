import type { BabyProfile } from '../types';
import { dateFromBirth } from '../lib/date';
import { Icon } from '../components/Icon';

interface CalendarPageProps {
  profile: BabyProfile | null;
  onOpenSettings: () => void;
}

const vaccineSchedule = [
  { weeks: 8, label: '8 週疫苗', detail: '6-in-1 第 1 劑 · Rotavirus 第 1 劑 · MenB 第 1 劑' },
  { weeks: 12, label: '12 週疫苗', detail: '6-in-1 第 2 劑 · MenB 第 2 劑 · Rotavirus 第 2 劑' },
  { weeks: 16, label: '16 週疫苗', detail: '6-in-1 第 3 劑 · PCV 第 1 劑' },
];

const formatter = new Intl.DateTimeFormat('zh-HK', { timeZone: 'Europe/London', day: 'numeric', month: 'short', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', day: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: 'short' });

export function CalendarPage({ profile, onOpenSettings }: CalendarPageProps) {
  return (
    <div className="page calendar-page">
      <header className="page-header"><div><p className="eyebrow">DATES & CHECKLISTS</p><h1>重要日子</h1><p>用實際出生日期整理檢查同疫苗參考時間。</p></div></header>

      {!profile?.dateOfBirth ? (
        <div className="large-empty"><span className="large-empty-icon"><Icon name="calendar" /></span><h2>先設定出生日期</h2><p>完成 BB Profile 後，系統先可以計算參考日期。</p><button className="primary-button" onClick={onOpenSettings}>設定 BB 資料</button></div>
      ) : (
        <>
          <section className="calendar-card">
            <div className="section-heading"><div><p className="eyebrow">UPCOMING</p><h2>疫苗參考日曆</h2></div><Icon name="calendar" /></div>
            <div className="timeline-list">
              {vaccineSchedule.map((item) => {
                const date = dateFromBirth(profile.dateOfBirth, item.weeks);
                const past = date.getTime() < Date.now();
                return (
                  <article key={item.weeks} className={past ? 'past' : ''}>
                    <div className="timeline-date"><strong>{dayFormatter.format(date)}</strong><span>{monthFormatter.format(date)}</span></div>
                    <div className="timeline-dot"><span /></div>
                    <div><small>{past ? '日期已過／請核對紀錄' : formatter.format(date)}</small><h3>{item.label}</h3><p>{item.detail}</p></div>
                  </article>
                );
              })}
            </div>
            <div className="calendar-disclaimer"><Icon name="shield" size={17} /> 日期只供準備，實際安排以 GP／診所通知為準。</div>
          </section>

          <section className="checklist-card">
            <div className="section-heading"><div><p className="eyebrow">THIS STAGE</p><h2>屋企人準備清單</h2></div></div>
            {['每一覺都仰睡、同房分床、清空睡床', '所有固定照顧者知道 999／111 分流', '記低餵奶、尿片同體溫趨勢', '下一次覆診問題寫入備註'].map((item, index) => (
              <label className="checklist-row" key={item}><input type="checkbox" defaultChecked={index === 0} /><span className="custom-check"><Icon name="check" size={15} /></span><span>{item}</span></label>
            ))}
            <p className="local-only-note">目前 Checklist 只保留喺畫面；Firebase 同步會喺下一階段加入。</p>
          </section>
        </>
      )}
    </div>
  );
}
