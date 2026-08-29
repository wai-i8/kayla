import { ageInDays, dateInputValue, describeAge, formatLongDate, formatTime, startOfUkDay, ukHour } from '../lib/date';
import { ageTimelineSections } from '../data/guides/timeline';
import { getDailyGuideTip } from '../data/guides/dailyTips';
import type { BabyProfile, BabyRecord, RecordFilter } from '../types';
import { Icon } from '../components/Icon';
import { formatMedicineAdministration } from '../lib/medicine';
import { isRecordDraft } from '../lib/records';

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

function currentGuideFor(days: number) {
  const safeDays = Math.max(0, days);
  return ageTimelineSections.find((entry) => safeDays >= entry.fromDays && safeDays <= entry.toDays);
}

function summariseDay(records: BabyRecord[]) {
  const ordered = [...records].sort((a, b) => b.occurredAt - a.occurredAt);
  const feeds = ordered.filter((record) => record.type === 'feed');
  const nappies = ordered.filter((record) => record.type === 'nappy');
  return {
    records: ordered,
    feeds,
    nappies,
    wetNappies: nappies.filter((record) => record.details?.nappyType === 'wet' || record.details?.nappyType === 'both'),
    dirtyNappies: nappies.filter((record) => record.details?.nappyType === 'dirty' || record.details?.nappyType === 'both'),
    pendingNappies: nappies.filter((record) => !record.details?.nappyType),
    lastFeed: feeds[0],
    lastTemperature: ordered.find((record) => record.type === 'temperature' && !isRecordDraft(record) && typeof record.details?.valueCelsius === 'number'),
    lastSleep: ordered.find((record) => record.type === 'sleep' && !isRecordDraft(record) && typeof record.details?.sleepMinutes === 'number'),
    lastMedicine: ordered.find((record) => record.type === 'medicine' && !isRecordDraft(record) && Boolean(record.details?.medicineName)),
    lastWeight: ordered.find((record) => record.type === 'weight' && !isRecordDraft(record) && typeof record.details?.weightKg === 'number'),
  };
}

function nappyBreakdown(summary: ReturnType<typeof summariseDay>) {
  return [
    `${summary.wetNappies.length} 濕`,
    `${summary.dirtyNappies.length} 便`,
    summary.pendingNappies.length ? `${summary.pendingNappies.length} 待補` : '',
  ].filter(Boolean).join(' · ');
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
  const latestMedicineAdministration = latest.lastMedicine
    ? formatMedicineAdministration(latest.lastMedicine.details)
    : '';
  const todayNappyBreakdown = nappyBreakdown(today);
  const yesterdayNappyBreakdown = nappyBreakdown(yesterday);
  const ageDays = ageInDays(profile?.dateOfBirth);
  const guide = currentGuideFor(ageDays);
  const dailyTip = getDailyGuideTip(ageDays, now);
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
          <p>設定出生日期後，首頁就會自動顯示日齡、本週指南同疫苗日期。</p>
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
            <button type="button" className="stat-card" data-testid="open-records-nappy" aria-label={`查看尿片紀錄；今日已有 ${today.nappies.length} 塊；${todayNappyBreakdown}`} onClick={() => onOpenRecords({ type: 'nappy', date: null })}>
              <span className="stat-top"><span className="record-icon tone-sage"><Icon name="nappy" size={19} /></span><span>尿片</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
              <strong>{today.nappies.length}<small> 塊</small></strong>
              <span className="stat-detail">{todayNappyBreakdown}</span>
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
              <button type="button" className="recent-stat-card" data-testid="open-records-medicine" aria-label={`查看藥物紀錄；最近 ${latest.lastMedicine?.details.medicineName || '未有紀錄'}${latestMedicineAdministration ? ` ${latestMedicineAdministration}` : ''}；${formatRecentTime(latest.lastMedicine, now)}`} onClick={() => onOpenRecords({ type: 'medicine', date: null })}>
                <span className="record-icon tone-gold" aria-hidden="true"><Icon name="medicine" size={18} /></span>
                <strong title={latest.lastMedicine?.details.medicineName}>{latest.lastMedicine?.details.medicineName || '—'}</strong>
                <span>{latestMedicineAdministration ? `${latestMedicineAdministration} · ` : ''}{formatRecentTime(latest.lastMedicine, now)}</span>
              </button>
              <button type="button" className="recent-stat-card" data-testid="open-records-weight" aria-label={`查看體重紀錄；最近 ${latest.lastWeight?.details.weightKg?.toFixed(2) || '未有紀錄'}${latest.lastWeight ? ' 公斤' : ''}；${formatRecentTime(latest.lastWeight, now)}`} onClick={() => onOpenRecords({ type: 'weight', date: null })}>
                <span className="record-icon tone-sage" aria-hidden="true"><Icon name="weight" size={18} /></span>
                <strong>{latest.lastWeight?.details.weightKg?.toFixed(2) || '—'}<small>{latest.lastWeight ? 'kg' : ''}</small></strong>
                <span>{formatRecentTime(latest.lastWeight, now)}</span>
              </button>
            </div>
          </section>

          <section className="home-guide-stack" aria-label="BB 每日小知識及本週重點" data-testid="home-guide-stack">
            <button
              type="button"
              className="guide-feature daily-tip-card"
              onClick={() => onOpenGuide(dailyTip.guideTargetId)}
              data-testid="daily-tip-card"
              aria-label={'每日小知識：' + dailyTip.title + '。' + dailyTip.text + '。開啟相關指南'}
            >
              <span className="guide-feature-badge"><Icon name={dailyTip.icon} size={18} /> 每日小知識</span>
              <span className="eyebrow">TODAY'S LITTLE TIP</span>
              <span className="guide-card-title">{dailyTip.title}</span>
              <span className="guide-card-summary">{dailyTip.text}</span>
              <span className="guide-card-cta" aria-hidden="true">了解多啲 <Icon name="chevron" size={17} /></span>
            </button>

            {guide ? (
              <button
                type="button"
                className="guide-feature weekly-focus-card"
                onClick={() => onOpenGuide(guide.id)}
                data-testid="weekly-focus-card"
                aria-label={'本週重點：' + guide.ageLabel + '，' + guide.title + '。' + guide.highlights.join('；') + '。開啟完整指南'}
              >
                <span className="guide-feature-badge"><Icon name="book" size={18} /> 本週重點</span>
                <span className="eyebrow">{guide.ageLabel}</span>
                <span className="guide-card-title">{guide.title}</span>
                <span className="guide-card-summary">{guide.summary}</span>
                <span className="guide-card-highlights" aria-hidden="true">
                  {guide.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
                </span>
                <span className="guide-card-cta" aria-hidden="true">開啟完整指南 <Icon name="chevron" size={17} /></span>
              </button>
            ) : (
              <button
                type="button"
                className="guide-feature weekly-focus-card"
                onClick={() => onOpenGuide()}
                data-testid="weekly-focus-card"
                aria-label="Kayla 已超過出生至 6 個月時間線；開啟指南首頁"
              >
                <span className="guide-feature-badge"><Icon name="book" size={18} /> 指南</span>
                <span className="eyebrow">6 個月以上</span>
                <span className="guide-card-title">出生至 6 個月時間線已完成</span>
                <span className="guide-card-summary">可到指南首頁查看餵食、安全、急症判斷同本地支援等完整資料。</span>
                <span className="guide-card-cta" aria-hidden="true">開啟指南首頁 <Icon name="chevron" size={17} /></span>
              </button>
            )}
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
              <button type="button" className="stat-card yesterday-card" data-testid="open-records-yesterday-nappy" aria-label={`查看昨日尿片紀錄；${formatLongDate(yesterdayStart)}；共 ${yesterday.nappies.length} 塊；${yesterdayNappyBreakdown}`} onClick={() => onOpenRecords({ type: 'nappy', date: yesterdayDate })}>
                <span className="stat-top"><span className="record-icon tone-sage"><Icon name="nappy" size={19} /></span><span>尿片</span><span className="stat-action" aria-hidden="true"><Icon name="chevron" size={15} /></span></span>
                <strong>{yesterday.nappies.length}<small> 塊</small></strong>
                <span className="stat-detail">{yesterdayNappyBreakdown}</span>
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
