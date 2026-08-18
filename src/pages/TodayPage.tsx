import { ageInDays, describeAge, formatLongDate, formatTime, startOfToday, ukHour } from '../lib/date';
import { ageTimelineSections } from '../data/guideSections';
import type { BabyProfile, BabyRecord, RecordType } from '../types';
import { Icon } from '../components/Icon';
import { RecordCard } from '../components/RecordCard';

interface TodayPageProps {
  profile: BabyProfile | null;
  records: BabyRecord[];
  onAdd: () => void;
  onQuickAdd: (type: RecordType) => void;
  onOpenGuide: (sectionId?: string) => void;
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

function latest(records: BabyRecord[], type: BabyRecord['type']) {
  return records.find((record) => record.type === type);
}

export function TodayPage({ profile, records, onAdd, onQuickAdd, onOpenGuide, onOpenSettings }: TodayPageProps) {
  const todayRecords = records.filter((record) => record.occurredAt >= startOfToday());
  const feeds = todayRecords.filter((record) => record.type === 'feed');
  const nappies = todayRecords.filter((record) => record.type === 'nappy');
  const wetNappies = nappies.filter((record) => record.details.nappyType !== 'dirty');
  const dirtyNappies = nappies.filter((record) => record.details.nappyType !== 'wet');
  const lastFeed = latest(records, 'feed');
  const lastTemperature = latest(records, 'temperature');
  const ageDays = ageInDays(profile?.dateOfBirth);
  const guide = ageTimelineSections[currentGuideIndex(ageDays)];
  const hour = ukHour();
  const greeting = hour < 12 ? '早晨' : hour < 18 ? '午安' : '晚上好';

  return (
    <div className="page today-page">
      <header className="mobile-page-header">
        <div>
          <p className="eyebrow">{formatLongDate(Date.now())}</p>
          <h1>{greeting}，{profile?.name || '屋企人'}</h1>
        </div>
        <button className="avatar-button" onClick={onOpenSettings} aria-label="開啟設定"><Icon name="user" /></button>
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
              <p>{feeds.length || nappies.length ? `今日已經有 ${todayRecords.length} 項紀錄` : '今日未有紀錄，慢慢嚟。'}</p>
            </div>
            <button className="hero-add" onClick={onAdd}><Icon name="plus" size={19} />記一筆</button>
          </section>

          <section className="stat-grid" aria-label="今日摘要快捷記錄">
            <button type="button" className="stat-card" data-testid="quick-add-feed" aria-haspopup="dialog" aria-label={`新增餵奶紀錄；今日已有 ${feeds.length} 次；${lastFeed ? `最近 ${formatTime(lastFeed.occurredAt)}` : '未有紀錄'}`} onClick={() => onQuickAdd('feed')}>
              <span className="stat-top"><span className="record-icon tone-peach"><Icon name="bottle" size={19} /></span><span>餵奶</span><span className="stat-action" aria-hidden="true"><Icon name="plus" size={15} /></span></span>
              <strong>{feeds.length}<small> 次</small></strong>
              <span className="stat-detail">{lastFeed ? `最近 ${formatTime(lastFeed.occurredAt)}` : '未有紀錄'}</span>
            </button>
            <button type="button" className="stat-card" data-testid="quick-add-nappy" aria-haspopup="dialog" aria-label={`新增尿片紀錄；今日已有 ${nappies.length} 塊；${wetNappies.length} 濕、${dirtyNappies.length} 便`} onClick={() => onQuickAdd('nappy')}>
              <span className="stat-top"><span className="record-icon tone-sage"><Icon name="nappy" size={19} /></span><span>尿片</span><span className="stat-action" aria-hidden="true"><Icon name="plus" size={15} /></span></span>
              <strong>{nappies.length}<small> 塊</small></strong>
              <span className="stat-detail">{wetNappies.length} 濕 · {dirtyNappies.length} 便</span>
            </button>
            <button type="button" className="stat-card wide-mobile" data-testid="quick-add-temperature" aria-haspopup="dialog" aria-label={`新增體溫紀錄；最近體溫 ${lastTemperature?.details.valueCelsius?.toFixed(1) || '未有紀錄'}${lastTemperature ? ' 度' : ''}；${lastTemperature?.details.measurementSite || '未有量度位置'}`} onClick={() => onQuickAdd('temperature')}>
              <span className="stat-top"><span className="record-icon tone-rose"><Icon name="temperature" size={19} /></span><span>最近體溫</span><span className="stat-action" aria-hidden="true"><Icon name="plus" size={15} /></span></span>
              <strong>{lastTemperature?.details.valueCelsius?.toFixed(1) || '—'}<small>{lastTemperature ? ' °C' : ''}</small></strong>
              <span className="stat-detail">{lastTemperature?.details.measurementSite || '未有紀錄'}</span>
            </button>
          </section>

          <section className="guide-feature">
            <div className="guide-feature-badge"><Icon name="book" size={18} /> 今週指南</div>
            <p className="eyebrow">{guide.ageLabel}</p>
            <h2>{guide.title}</h2>
            <p>根據《初生 BB 由第 1 日到半歲》2026–27 英國版整理。</p>
            <button onClick={() => onOpenGuide(guide.id)}>睇今週重點 <Icon name="chevron" size={17} /></button>
          </section>

          <section className="emergency-strip">
            <div className="emergency-icon"><Icon name="alert" /></div>
            <div><strong>唔肯定 BB 情況？</strong><p>生命危險 call 999；急需判斷 call NHS 111。</p></div>
            <button onClick={() => onOpenGuide('emergency')} aria-label="開啟緊急判斷"><Icon name="chevron" /></button>
          </section>

          <section className="section-block recent-block">
            <div className="section-heading"><div><p className="eyebrow">TODAY</p><h2>最近紀錄</h2></div>{records.length > 0 && <span>{records.length} 項</span>}</div>
            {records.length ? (
              <div className="record-list">{records.slice(0, 4).map((record) => <RecordCard key={record.id} record={record} compact />)}</div>
            ) : (
              <div className="empty-list"><Icon name="clock" /><p>第一項紀錄會喺呢度出現。</p><button className="secondary-button" onClick={onAdd}>新增紀錄</button></div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
