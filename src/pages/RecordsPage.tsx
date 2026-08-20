import { useMemo, useState } from 'react';
import type { BabyRecord, RecordFilter, RecordType } from '../types';
import { dateInputValue, formatLongDate, inputsToTimestamp, startOfUkDay } from '../lib/date';
import { Icon } from '../components/Icon';
import { RecordCard } from '../components/RecordCard';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface RecordsPageProps {
  records: BabyRecord[];
  filter: RecordFilter;
  onFilterChange: (filter: RecordFilter) => void;
  currentUserId: string;
  canManageAll: boolean;
  onAdd: () => void;
  onEdit: (record: BabyRecord) => void;
  onDelete: (id: string) => Promise<void>;
}

const filters: Array<{ value: 'all' | RecordType; label: string }> = [
  { value: 'all', label: '所有類型' },
  { value: 'feed', label: '餵奶' },
  { value: 'nappy', label: '尿片' },
  { value: 'temperature', label: '體溫' },
  { value: 'sleep', label: '睡眠' },
  { value: 'medicine', label: '藥物' },
  { value: 'weight', label: '體重' },
  { value: 'note', label: '備註' },
];

export function RecordsPage({ records, filter, onFilterChange, currentUserId, canManageAll, onAdd, onEdit, onDelete }: RecordsPageProps) {
  const [deleting, setDeleting] = useState<BabyRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const closeDeleteDialog = () => {
    setDeleting(null);
    setDeleteError('');
  };
  const deleteDialogRef = useDialogFocus(Boolean(deleting), closeDeleteDialog, !deleteBusy);

  const filtered = records.filter((record) => {
    const matchesType = filter.type === 'all' || record.type === filter.type;
    const matchesDate = filter.date === null || dateInputValue(record.occurredAt) === filter.date;
    return matchesType && matchesDate;
  });
  const grouped = useMemo(() => {
    const groups = new Map<string, BabyRecord[]>();
    filtered.forEach((record) => {
      const key = dateInputValue(record.occurredAt);
      groups.set(key, [...(groups.get(key) || []), record]);
    });
    return [...groups.entries()];
  }, [filtered]);
  const yesterdayDate = dateInputValue(startOfUkDay(-1));
  const activeDateLabel = filter.date
    ? `${filter.date === yesterdayDate ? '昨日 · ' : ''}${formatLongDate(inputsToTimestamp(filter.date, '12:00'))}`
    : '';
  const hasActiveFilter = filter.type !== 'all' || filter.date !== null;

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await onDelete(deleting.id);
      closeDeleteDialog();
    } catch {
      setDeleteError('未能刪除，可能係帳戶權限或網絡問題。');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="page records-page">
      <header className="page-header">
        <div><p className="eyebrow">FAMILY LOG</p><h1>日常紀錄</h1><p>所有照顧者輸入會按時間排列。</p></div>
        <button className="primary-button desktop-action" onClick={onAdd}><Icon name="plus" size={18} />新增紀錄</button>
      </header>

      <div className="filter-scroller" role="group" aria-label="篩選紀錄">
        {filters.map((item) => <button key={item.value} type="button" data-testid={`records-filter-${item.value}`} className={filter.type === item.value ? 'active' : ''} aria-pressed={filter.type === item.value} onClick={() => onFilterChange({ ...filter, type: item.value })}>{item.label}</button>)}
      </div>

      {filter.date && (
        <div className="active-date-filter" data-testid="records-date-filter" data-date={filter.date} aria-label="已套用日期篩選">
          <span role="status"><Icon name="calendar" size={17} /><span><small>只顯示</small><strong>{activeDateLabel}</strong></span></span>
          <button type="button" onClick={() => onFilterChange({ ...filter, date: null })}>清除日期</button>
        </div>
      )}

      {grouped.length ? grouped.map(([date, items]) => (
        <section className="record-day" key={date} data-date={date}>
          <div className="day-heading"><h2>{date === dateInputValue() ? '今日' : date === yesterdayDate ? '昨日' : formatLongDate(inputsToTimestamp(date, '12:00'))}</h2><span>{items.length} 項</span></div>
          <div className="record-list">{items.map((record) => {
            const canManage = canManageAll || record.createdBy === currentUserId;
            return (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={canManage ? onEdit : undefined}
                onDelete={canManage ? (item) => { setDeleteError(''); setDeleting(item); } : undefined}
              />
            );
          })}</div>
        </section>
      )) : (
        <div className="large-empty"><span className="large-empty-icon"><Icon name="records" size={30} /></span><h2>未有相關紀錄</h2><p>{hasActiveFilter ? '呢個篩選暫時未有紀錄，可以清除篩選再睇全部。' : '新增紀錄後，所有家庭成員都可以喺呢度睇到。'}</p><button className="primary-button" onClick={hasActiveFilter ? () => onFilterChange({ type: 'all', date: null }) : onAdd}>{hasActiveFilter ? '清除篩選' : '記低第一項'}</button></div>
      )}

      {deleting && (
        <div className="modal-backdrop delete-backdrop" role="presentation">
          <section ref={deleteDialogRef} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-label="確認刪除紀錄">
            <span className="confirm-icon"><Icon name="trash" /></span><h2>刪除呢項紀錄？</h2><p>刪除後無法復原。如果只係時間或內容錯誤，可以取消後使用編輯。</p>
            {deleteError && <div className="form-error delete-error" role="alert">{deleteError}</div>}
            <div className="confirm-actions"><button className="secondary-button" onClick={closeDeleteDialog} disabled={deleteBusy}>取消</button><button className="danger-button" onClick={confirmDelete} disabled={deleteBusy}>{deleteBusy ? '刪除中…' : '確認刪除'}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
