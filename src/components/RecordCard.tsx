import type { BabyRecord, RecordType } from '../types';
import { formatTime } from '../lib/date';
import { Icon, type IconName } from './Icon';

const meta: Record<RecordType, { label: string; icon: IconName; tone: string }> = {
  feed: { label: '餵奶', icon: 'bottle', tone: 'peach' },
  nappy: { label: '尿片', icon: 'nappy', tone: 'sage' },
  temperature: { label: '體溫', icon: 'temperature', tone: 'rose' },
  sleep: { label: '睡眠', icon: 'moon', tone: 'blue' },
  medicine: { label: '藥物', icon: 'medicine', tone: 'gold' },
  weight: { label: '體重', icon: 'weight', tone: 'blue' },
  note: { label: '備註', icon: 'note', tone: 'sage' },
};

export function recordTitle(record: BabyRecord) {
  const details = record.details || {};
  if (record.type === 'feed') {
    const method = details.method === 'breast' ? '母乳' : details.method === 'expressed' ? '泵奶' : '配方奶';
    if (details.amountMl) return `${method} ${details.amountMl} ml`;
    if (details.durationMinutes) return `${method} ${details.durationMinutes} 分鐘`;
    return method;
  }
  if (record.type === 'nappy') {
    return details.nappyType === 'both' ? '濕片＋便便' : details.nappyType === 'dirty' ? '便便' : '濕片';
  }
  if (record.type === 'temperature') return `${details.valueCelsius?.toFixed(1)}°C · ${details.measurementSite || '腋下'}`;
  if (record.type === 'sleep') return `睡咗 ${details.sleepMinutes || 0} 分鐘`;
  if (record.type === 'medicine') return `${details.medicineName || '藥物'} ${details.doseMl || ''}${details.doseMl ? ' ml' : ''}`;
  if (record.type === 'weight') return `${details.weightKg?.toFixed(2)} kg`;
  return details.note || '一般備註';
}

interface RecordCardProps {
  record: BabyRecord;
  compact?: boolean;
  onDelete?: (record: BabyRecord) => void;
}

export function RecordCard({ record, compact, onDelete }: RecordCardProps) {
  const item = meta[record.type] || meta.note;
  return (
    <article className={`record-card ${compact ? 'compact' : ''}`}>
      <div className={`record-icon tone-${item.tone}`}><Icon name={item.icon} size={20} /></div>
      <div className="record-copy">
        <div className="record-heading">
          <span>{item.label}</span><time>{formatTime(record.occurredAt)}</time>
        </div>
        <strong>{recordTitle(record)}</strong>
        {!compact && (record.details.note || record.details.stoolColour) && (
          <p>{record.details.note || `便便顏色：${record.details.stoolColour}`}</p>
        )}
        {!compact && <small>由 {record.createdByLabel || '家庭成員'} 記錄</small>}
      </div>
      {onDelete && (
        <button className="icon-button record-delete" onClick={() => onDelete(record)} aria-label={`刪除 ${item.label} 紀錄`}>
          <Icon name="trash" size={18} />
        </button>
      )}
    </article>
  );
}
