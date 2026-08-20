import type { BabyRecord, RecordType } from '../types';
import { formatTime } from '../lib/date';
import {
  calculateStoredMedicineActiveAmount,
  formatMedicineAdministration,
  formatMedicineConcentration,
  formatMedicineNumber,
} from '../lib/medicine';
import { isRecordDraft } from '../lib/records';
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
    const method = details.method === 'breast'
      ? '母乳'
      : details.method === 'formula'
        ? '配方奶'
        : details.method === 'expressed'
          ? '泵奶'
          : '餵奶';
    const parts = [method];
    if (details.method === 'breast') {
      const side = details.side === 'left' ? '左邊' : details.side === 'right' ? '右邊' : details.side === 'both' ? '兩邊' : '';
      if (side) parts.push(side);
    }
    if (typeof details.amountMl === 'number') parts.push(`${details.amountMl} mL`);
    if (typeof details.durationMinutes === 'number') parts.push(`${details.durationMinutes} 分鐘`);
    return parts.join(' · ');
  }
  if (record.type === 'nappy') {
    return details.nappyType === 'both'
      ? '濕片＋便便'
      : details.nappyType === 'dirty'
        ? '便便'
        : details.nappyType === 'wet'
          ? '濕片'
          : '尿片';
  }
  if (record.type === 'temperature') {
    const parts = [
      typeof details.valueCelsius === 'number' ? `${details.valueCelsius.toFixed(1)}°C` : '',
      details.measurementSite,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : '體溫';
  }
  if (record.type === 'sleep') return typeof details.sleepMinutes === 'number' ? `瞓咗 ${details.sleepMinutes} 分鐘` : '睡眠';
  if (record.type === 'medicine') {
    const administration = details.concentration || !isRecordDraft(record)
      ? formatMedicineAdministration(details)
      : '';
    return [details.medicineName || '藥物', administration].filter(Boolean).join(' · ');
  }
  if (record.type === 'weight') return typeof details.weightKg === 'number' ? `${details.weightKg.toFixed(2)} kg` : '體重';
  return details.note || '備註';
}

interface RecordCardProps {
  record: BabyRecord;
  compact?: boolean;
  onEdit?: (record: BabyRecord) => void;
  onDelete?: (record: BabyRecord) => void;
}

export function RecordCard({ record, compact, onEdit, onDelete }: RecordCardProps) {
  const item = meta[record.type] || meta.note;
  const details = record.details || {};
  const draft = isRecordDraft(record);
  const medicineConcentration = record.type === 'medicine'
    ? formatMedicineConcentration(details)
    : '';
  const medicineActiveAmount = record.type === 'medicine'
    ? calculateStoredMedicineActiveAmount(details)
    : null;
  const medicineDetail = [
    medicineConcentration,
    medicineActiveAmount
      ? `實際劑量：${formatMedicineNumber(medicineActiveAmount.amount)} ${medicineActiveAmount.unit}`
      : '',
  ].filter(Boolean).join(' · ');
  return (
    <article
      className={`record-card ${compact ? 'compact' : ''}`}
      data-record-id={record.id}
      data-record-type={record.type}
      data-record-status={draft ? 'draft' : 'complete'}
    >
      <div className={`record-icon tone-${item.tone}`}><Icon name={item.icon} size={20} /></div>
      <div className="record-copy">
        <div className="record-heading">
          <span>{item.label}</span><time>{formatTime(record.occurredAt)}</time>
        </div>
        <div className="record-title-row">
          <strong>{recordTitle(record)}</strong>
          {draft && <span className="record-draft-badge">待補資料</span>}
        </div>
        {!compact && medicineDetail && <p>{medicineDetail}</p>}
        {!compact && record.type === 'nappy' && details.stoolColour && (
          <p>便便顏色：{details.stoolColour}</p>
        )}
        {!compact && record.type !== 'note' && details.note && <p>{details.note}</p>}
        {!compact && <small>由 {record.createdByLabel || '家庭成員'} 記錄</small>}
      </div>
      {(onEdit || onDelete) && (
        <div className="record-actions">
          {onEdit && (
            <button type="button" className="icon-button record-edit" onClick={() => onEdit(record)} aria-label={`編輯 ${item.label} 紀錄`}>
              <Icon name="edit" size={18} />
            </button>
          )}
          {onDelete && (
            <button type="button" className="icon-button record-delete" onClick={() => onDelete(record)} aria-label={`刪除 ${item.label} 紀錄`}>
              <Icon name="trash" size={18} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
