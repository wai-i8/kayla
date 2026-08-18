import { useId, useMemo, useState, type ReactNode } from 'react';
import type { QuickOption, QuickOptionField, QuickOptionValue } from '../types';
import { Icon } from './Icon';

interface RememberedFieldProps {
  field: QuickOptionField;
  label: string;
  options?: QuickOption[];
  selectedValue?: QuickOptionValue;
  suffix?: string;
  children: ReactNode;
  formatOption?: (option: QuickOption) => string;
  onSelect: (option: QuickOption) => void;
  onDelete: (field: QuickOptionField, id: string) => Promise<void>;
}

function valuesMatch(current: QuickOptionValue | undefined, option: QuickOptionValue) {
  if (current === undefined) return false;
  if (typeof current === 'object' || typeof option === 'object') {
    if (typeof current !== 'object' || typeof option !== 'object') return false;
    return current.medicineName.trim() === option.medicineName.trim()
      && (current.concentration || '').trim() === (option.concentration || '').trim()
      && current.doseMl === option.doseMl;
  }
  if (typeof current === 'number' || typeof option === 'number') {
    const currentNumber = Number(current);
    const optionNumber = Number(option);
    return Number.isFinite(currentNumber) && Number.isFinite(optionNumber) && currentNumber === optionNumber;
  }
  return current.trim() === option.trim();
}

function defaultLabel(option: QuickOption, suffix?: string) {
  if (typeof option.value === 'object') return '已儲存組合';
  const value = String(option.value).trim();
  return suffix ? `${value} ${suffix}` : value;
}

export function RememberedField({
  field,
  label,
  options = [],
  selectedValue,
  suffix,
  children,
  formatOption,
  onSelect,
  onDelete,
}: RememberedFieldProps) {
  const headingId = useId();
  const [managing, setManaging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const sortedOptions = useMemo(
    () => [...options]
      .filter((option) => !hiddenIds.includes(option.id))
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [hiddenIds, options],
  );

  const optionLabel = (option: QuickOption) => (
    formatOption ? formatOption(option) : defaultLabel(option, suffix)
  );

  const choose = (option: QuickOption) => {
    const nextLabel = optionLabel(option);
    onSelect(option);
    setAnnouncement(`已填入${label}：${nextLabel}`);
  };

  const deleteOption = async (option: QuickOption) => {
    setDeletingId(option.id);
    setDeleteError('');
    try {
      await onDelete(field, option.id);
      setHiddenIds((current) => [...current, option.id]);
      setAnnouncement(`已刪除常用${label}：${optionLabel(option)}`);
    } catch {
      setDeleteError('未能刪除呢個常用值，請檢查網絡後再試。');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="remembered-field">
      {children}
      {sortedOptions.length > 0 && (
        <section className="remembered-options" aria-labelledby={headingId}>
          <div className="remembered-options-heading">
            <span id={headingId}>常用{label}</span>
            <button
              type="button"
              className="remembered-manage-toggle"
              aria-expanded={managing}
              onClick={() => {
                setManaging((current) => !current);
                setDeleteError('');
              }}
            >
              {managing ? '完成' : '管理'}
            </button>
          </div>

          {managing ? (
            <div className="remembered-manage-list">
              {sortedOptions.map((option) => {
                const text = optionLabel(option);
                return (
                  <div className="remembered-manage-row" key={option.id}>
                    <span title={text}>{text}</span>
                    <button
                      type="button"
                      className="remembered-delete"
                      disabled={deletingId !== null}
                      aria-label={`刪除常用${label}：${text}`}
                      onClick={() => void deleteOption(option)}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="remembered-chip-list">
              {sortedOptions.slice(0, 6).map((option) => {
                const text = optionLabel(option);
                const selected = valuesMatch(selectedValue, option.value);
                return (
                  <button
                    type="button"
                    className="remembered-chip"
                    key={option.id}
                    aria-label={`填入${label}：${text}`}
                    aria-pressed={selected}
                    title={text}
                    onClick={() => choose(option)}
                  >
                    <span>{text}</span>
                    {selected && <Icon name="check" size={15} />}
                  </button>
                );
              })}
            </div>
          )}

          {deleteError && <p className="remembered-error" role="alert">{deleteError}</p>}
        </section>
      )}
      <span className="sr-only" aria-live="polite">{announcement}</span>
    </div>
  );
}
