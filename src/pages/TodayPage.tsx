import { ageInDays, dateInputValue, describeAge, formatLongDate, formatTime, startOfUkDay, ukHour } from '../lib/date';
import { ageTimelineSections } from '../data/guideSections';
import type { BabyProfile, BabyRecord, RecordFilter } from '../types';
import { Icon } from '../components/Icon';

interface TodayPageProps {
  profile: BabyProfile | null;
  records: BabyRecord[];
  onAdd: () => void;
  onOpenRecords: (filter: RecordFilter) => void;
  onOpenGuide: (sectionId?: string) => void;
  onOpenPhotos: () => void;
  onQuickCamera: () => void;
  onOpenSettings: () => void;
}

function currentGuideIndex(days: number) {
  if (days <= 0) return 0;
  if (days === 1) return 1;
  if (days <= 3) return 2;
  if (days <= 7) return 3;
  if (days <= 14) return 4;
  if (days <= 28) return 5;
  if (days <= 56) return 6;
  if (days <= 90) return 7;
  if (days <= 120) return 8;
  if (days <= 150) return 9;
  return 10;
}

function summariseDay(records: BabyRecord[]) {
  const ordered = [...records].sort((a, b) => b.occurredAt - a.occurredAt);
  const feeds = ordered.filter((record) => record.type === 'feed');
  const nappies = ordered.filter((record) => record.type === 'nappy');
  return {
    records: ordered,
    feeds,
    nappies,
    wetNappies: nappies.filter((record) => record.details.nappyType !== 'dirty'),
    dirtyNappies: nappies.filter((record) => record.details.nappyType !== 'wet'),
    lastFeed: feeds[0],
    lastTemperature: ordered.find((record) => record.type === 'temperature'),
    lastSleep: ordered.find((record) => record.type === 'sleep'),
    lastMedicine: ordered.find((record) => record.type === 'medicine'),
    lastWeight: ordered.find((record) => record.type === 'weight'),
  };
}

function formatRecentTime(record: BabyRecord | undefined, now: number) {
  if (!record) return '未有紀錄';
  const recordDate = dateInputValue(record.occurredAt);
  const todayDate = dateInputValue(startOfUkDay(0, now));
  const yesterdayDate = dateInputValue(startOfUkDay(-1, now));
  if (recordDate === todayDate) return `今日 ${formatTime(record.occurredAt)}`;
  if (recordDate === yesterdayDate) return `昨日 ${formatTime(record.occurredAt)}`;
  return `${new Intl.DateTimeFormat('zh-HK', { timeZone: 'Europe/London', month: 'numeric', day: 'numeric' }).format(record.occurredAt)} ${formatTime(record.occurredAt)}`;
}

function formatSleep(minutes: number | undefined) {
  if (minutes === undefined) return '—';
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}時${remainder}分` : `${hours}小時`;
}

export function TodayPage({ profile, records, onAdd, onOpenRecords, onOpenGuide, onOpenPhotos, onQuickCamera, onOpenSettings }: TodayPageProps) {
  const now = Date.now();
  const yesterdayStart = startOfUkDay(-1, now);
  const yesterdayDate = dateInputValue(yesterdayStart);
  const todayStart = startOfUkDay(0, now);
  const tomorrowStart = startOfUkDay(1, now);
  const today = summariseDay(records.filter((record) => record.occurredAt >= todayStart && record.occurredAt < tomorrowStart));
  const yesterday = summariseDay(records.filter((record) => record.occurredAt >= yesterdayStart && record.occurredAt < todayStart));
  const latest = summariseDay(records);
  const ageDays = ageInDays(profile?.dateOfBirth);
  const guide = ageTimelineSections[currentGuideIndex(ageDays)];
  const hour = ukHour(now);
  const greeting = hour < 12 ? '早晨' : hour < 18 ? '午安' : '晚上好';

  return (
    <div className="page today-page">
      <header className="mobile-page-header">
        <div>
          <p className="eyebrow">{formatLongDate(now)}</p>
          <h1>{greeting}，{profile?.name || '屋企人'}</h1>
        </div>
        <div className="mobile-header-actions">
          <button className="album-button" onClick={onOpenPhotos} aria-label="開啟私人相簿" data-testid="mobile-open-photos"><img src={`${import.meta.env.BASE_URL}kayla-album.webp`} alt="" /></button>
          <button className="header-camera-button" type="button" onClick={onQuickCamera} aria-label="快捷影相" data-testid="mobile-quick-camera"><Icon name="camera" /></button>
          <button className="avatar-button" onClick={onOpenSettings} aria-label="開啟設定"><Icon name="user" /></button>
        </div>
      </header>

      {!profile ? (
        <section className="empty-profile-card">
          <div className="empty-illustration"><Icon name="user" size={34} /></div>
          <p className="eyebrow">第一步</p>
          <h2>先建立 BB 基本資料</h2>
          <p>設定出生日期後，首頁就會自動顯示日齡、今週指南同疫苗日期。</p>
          <button className="primary-button" onClick={onOpenSettings}>開始設定</button>
        </section>
      ) : (
        <>
          <section className="baby-hero">
            <div className="baby-avatar" aria-hidden="true"><span>{(profile.name || 'B').slice(0, 1).toUpperCase()}</span></div>
            <div className="baby-hero-copy">
              <p className="eyebrow">TODAY WITH {(profile.name || 'BB').toUpperCase()}</p>
              <h2>{describeAge(profile.dateOfBirth)}</h2>
              <p>{today.records.length ? `今日已經有 ${today.records.length} 項紀錄` : '今日未有紀錄，慢慢嚟。'}</p>
            </div>
            <button className="hero-add" onClick={onAdd}><Icon name="plus" size={19} />記一筆</button>
          </section>

          <section className="stat-grid" aria-label="今日摘要；選擇類型查看紀錄">
            <button type="button" className="stat-card" data-testid="open-records-feed" aria-label={`查看餵奶紀錄；今日已有 ${today.feeds.length} 次；${today.lastFeed ? `最近 ${formatTime(today.lastFeed.occurredAt)}` : '未有紀錄'}`} onClick={() => onOpenRecords({ type: 'feed', date: null })}>
              <span className="stat-top"><span className="record-icon tone-peach"><Icon name="bottle" size={19} /></span><span>餵奶</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
              <strong>{today.feeds.length}<small> 次</small></strong>
              <span className="stat-detail">{today.lastFeed ? `最近 ${formatTime(today.lastFeed.occurredAt)}` : '未有紀錄'}</span>
            </button>
            <button type="button" className="stat-card" data-testid="open-records-nappy" aria-label={`查看尿片紀錄；今日已有 ${today.nappies.length} 塊；${today.wetNappies.length} 濕、${today.dirtyNappies.length} 便`} onClick={() => onOpenRecords({ type: 'nappy', date: null })}>
              <span className="stat-top"><span className="record-icon tone-sage"><Icon name="nappy" size={19} /></span><span>尿片</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
              <strong>{today.nappies.length}<small> 塊</small></strong>
              <span className="stat-detail">{today.wetNappies.length} 濕 · {today.dirtyNappies.length} 便</span>
            </button>
            <div className="recent-stat-grid" role="group" data-testid="recent-records" aria-label="最近體溫、睡眠、藥物及體重紀錄">
              <button type="button" className="recent-stat-card" data-testid="open-records-temperature" aria-label={`查看體溫紀錄；最近 ${latest.lastTemperature?.details.valueCelsius?.toFixed(1) || '未有紀錄'}${latest.lastTemperature ? ' 度' : ''}；${formatRecentTime(latest.lastTemperature, now)}`} onClick={() => onOpenRecords({ type: 'temperature', date: null })}>
                <span className="record-icon tone-rose" aria-hidden="true"><Icon name="temperature" size={18} /></span>
                <strong>{latest.lastTemperature?.details.valueCelsius?.toFixed(1) || '—'}<small>{latest.lastTemperature ? '°C' : ''}</small></strong>
                <span>{formatRecentTime(latest.lastTemperature, now)}</span>
              </button>
              <button type="button" className="recent-stat-card" data-testid="open-records-sleep" aria-label={`查看睡眠紀錄；最近 ${latest.lastSleep ? formatSleep(latest.lastSleep.details.sleepMinutes) : '未有紀錄'}；${formatRecentTime(latest.lastSleep, now)}`} onClick={() => onOpenRecords({ type: 'sleep', date: null })}>
                <span className="record-icon tone-blue" aria-hidden="true"><Icon name="moon" size={18} /></span>
                <strong>{formatSleep(latest.lastSleep?.details.sleepMinutes)}</strong>
                <span>{formatRecentTime(latest.lastSleep, now)}</span>
              </button>
              <button type="button" className="recent-stat-card" data-testid="open-records-medicine" aria-label={`查看藥物紀錄；最近 ${latest.lastMedicine?.details.medicineName || '未有紀錄'}${latest.lastMedicine?.details.doseMl !== undefined ? ` ${latest.lastMedicine.details.doseMl} ml` : ''}；${formatRecentTime(latest.lastMedicine, now)}`} onClick={() => onOpenRecords({ type: 'medicine', date: null })}>
                <span className="record-icon tone-gold" aria-hidden="true"><Icon name="medicine" size={18} /></span>
                <strong title={latest.lastMedicine?.details.medicineName}>{latest.lastMedicine?.details.medicineName || '—'}</strong>
                <span>{latest.lastMedicine?.details.doseMl !== undefined ? `${latest.lastMedicine.details.doseMl} ml · ` : ''}{formatRecentTime(latest.lastMedicine, now)}</span>
              </button>
              <button type="button" className="recent-stat-card" data-testid="open-records-weight" aria-label={`查看體重紀錄；最近 ${latest.lastWeight?.details.weightKg?.toFixed(2) || '未有紀錄'}${latest.lastWeight ? ' 公斤' : ''}；${formatRecentTime(latest.lastWeight, now)}`} onClick={() => onOpenRecords({ type: 'weight', date: null })}>
                <span className="record-icon tone-sage" aria-hidden="true"><Icon name="weight" size={18} /></span>
                <strong>{latest.lastWeight?.details.weightKg?.toFixed(2) || '—'}<small>{latest.lastWeight ? 'kg' : ''}</small></strong>
                <span>{formatRecentTime(latest.lastWeight, now)}</span>
              </button>
            </div>
          </section>

          <section className="guide-feature">
            <div className="guide-feature-badge"><Icon name="book" size={18} /> 今週指南</div>
            <p className="eyebrow">{guide.ageLabel}</p>
            <h2>{guide.title}</h2>
            <p>根據《初生 BB 由第 1 日到半歲》2026–27 英國版整理。</p>
            <button onClick={() => onOpenGuide(guide.id)}>睇今週重點 <Icon name="chevron" size={17} /></button>
          </section>

          <section className="section-block yesterday-block" aria-labelledby="yesterday-heading" data-testid="yesterday-summary">
            <div className="section-heading">
              <div><p className="eyebrow">YESTERDAY · {formatLongDate(yesterdayStart)}</p><h2 id="yesterday-heading">昨日紀錄</h2></div>
              <span>{yesterday.records.length} 項</span>
            </div>
            <div className="yesterday-card-grid">
              <button type="button" className="stat-card yesterday-card" data-testid="open-records-yesterday-feed" aria-label={`查看昨日餵奶紀錄；${formatLongDate(yesterdayStart)}；共 ${yesterday.feeds.length} 次；${yesterday.lastFeed ? `最後 ${formatTime(yesterday.lastFeed.occurredAt)}` : '未有紀錄'}`} onClick={() => onOpenRecords({ type: 'feed', date: yesterdayDate })}>
                <span className="stat-top"><span className="record-icon tone-peach"><Icon name="bottle" size={19} /></span><span>餵奶</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
                <strong>{yesterday.feeds.length}<small> 次</small></strong>
                <span className="stat-detail">{yesterday.lastFeed ? `最後 ${formatTime(yesterday.lastFeed.occurredAt)}` : '未有紀錄'}</span>
              </button>
              <button type="button" className="stat-card yesterday-card" data-testid="open-records-yesterday-nappy" aria-label={`查看昨日尿片紀錄；${formatLongDate(yesterdayStart)}；共 ${yesterday.nappies.length} 塊；${yesterday.wetNappies.length} 濕、${yesterday.dirtyNappies.length} 便`} onClick={() => onOpenRecords({ type: 'nappy', date: yesterdayDate })}>
                <span className="stat-top"><span className="record-icon tone-sage"><Icon name="nappy" size={19} /></span><span>尿片</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
                <strong>{yesterday.nappies.length}<small> 塊</small></strong>
                <span className="stat-detail">{yesterday.wetNappies.length} 濕 · {yesterday.dirtyNappies.length} 便</span>
              </button>
            </div>
          </section>

          <section className="emergency-strip">
            <div className="emergency-icon"><Icon name="alert" /></div>
            <div><strong>唔肯定 BB 情況？</strong><p>生命危險 call 999；急需判斷 call NHS 111。</p></div>
            <button onClick={() => onOpenGuide('emergency')} aria-label="開啟緊急判斷"><Icon name="chevron" /></button>
          </section>

        </>
      )}
    </div>
  );
}
