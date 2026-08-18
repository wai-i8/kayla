import { useEffect, useState, type FormEvent } from 'react';
import { dateInputValue, inputsToTimestamp, timeInputValue } from '../lib/date';
import type {
  MedicineQuickValue,
  NewRecordInput,
  QuickOption,
  QuickOptionField,
  QuickOptionsByField,
  RecordType,
} from '../types';
import { Icon, type IconName } from './Icon';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { RememberedField } from './RememberedField';

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: NewRecordInput) => Promise<void>;
  quickOptions: QuickOptionsByField;
  onDeleteQuickOption: (field: QuickOptionField, id: string) => Promise<void>;
}

const options: Array<{ type: RecordType; label: string; hint: string; icon: IconName; tone: string }> = [
  { type: 'feed', label: '餵奶', hint: '母乳或奶量', icon: 'bottle', tone: 'peach' },
  { type: 'nappy', label: '尿片', hint: '濕片或便便', icon: 'nappy', tone: 'sage' },
  { type: 'temperature', label: '體溫', hint: '數值及位置', icon: 'temperature', tone: 'rose' },
  { type: 'sleep', label: '睡眠', hint: '睡眠時間', icon: 'moon', tone: 'blue' },
  { type: 'medicine', label: '藥物', hint: '名稱及劑量', icon: 'medicine', tone: 'gold' },
  { type: 'weight', label: '體重', hint: '公斤', icon: 'weight', tone: 'blue' },
  { type: 'note', label: '備註', hint: '其他觀察', icon: 'note', tone: 'sage' },
];

function isMedicineQuickValue(value: QuickOption['value']): value is MedicineQuickValue {
  return typeof value === 'object' && value !== null && 'medicineName' in value && 'doseMl' in value;
}

function medicineOptionLabel(option: QuickOption) {
  if (!isMedicineQuickValue(option.value)) return '已儲存藥物';
  const concentration = option.value.concentration ? ` · ${option.value.concentration}` : '';
  return `${option.value.medicineName}${concentration} · ${option.value.doseMl} ml`;
}

const noteFieldByType: Record<RecordType, QuickOptionField> = {
  feed: 'feedNote',
  nappy: 'nappyNote',
  temperature: 'temperatureNote',
  sleep: 'sleepNote',
  medicine: 'medicineNote',
  weight: 'weightNote',
  note: 'noteContent',
};

export function QuickAddSheet({
  open,
  onClose,
  onSave,
  quickOptions,
  onDeleteQuickOption,
}: QuickAddSheetProps) {
  const [type, setType] = useState<RecordType | null>(null);
  const [date, setDate] = useState(dateInputValue());
  const [time, setTime] = useState(timeInputValue());
  const [method, setMethod] = useState<'breast' | 'formula' | 'expressed'>('breast');
  const [side, setSide] = useState<'left' | 'right' | 'both'>('left');
  const [amountMl, setAmountMl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [nappyType, setNappyType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [stoolColour, setStoolColour] = useState('');
  const [temperature, setTemperature] = useState('');
  const [measurementSite, setMeasurementSite] = useState('腋下');
  const [sleepMinutes, setSleepMinutes] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [concentration, setConcentration] = useState('');
  const [doseMl, setDoseMl] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetAndClose = () => {
    setType(null);
    setAmountMl('');
    setDurationMinutes('');
    setStoolColour('');
    setTemperature('');
    setSleepMinutes('');
    setMedicineName('');
    setConcentration('');
    setDoseMl('');
    setWeightKg('');
    setNote('');
    setError('');
    setSaving(false);
    onClose();
  };
  const dialogRef = useDialogFocus(open, resetAndClose, !saving);

  useEffect(() => {
    if (!open) return;
    setDate(dateInputValue());
    setTime(timeInputValue());
    setError('');
  }, [open]);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!type) return;

    const occurredAt = inputsToTimestamp(date, time);
    if (!Number.isFinite(occurredAt) || occurredAt > Date.now() + 10 * 60_000) {
      setError('紀錄時間唔可以係未來時間。');
      return;
    }

    const details: NewRecordInput['details'] = { note: note.trim() || undefined };
    if (type === 'feed') {
      details.method = method;
      if (method === 'breast') {
        details.side = side;
        const duration = Number(durationMinutes);
        if (durationMinutes && (duration <= 0 || duration > 300)) {
          setError('母乳時間請輸入 1–300 分鐘。');
          return;
        }
        details.durationMinutes = duration || undefined;
      } else {
        const amount = Number(amountMl);
        if (!amount || amount <= 0 || amount > 1000) {
          setError('請輸入 1–1000 ml 奶量。');
          return;
        }
        details.amountMl = amount;
      }
    }
    if (type === 'nappy') {
      details.nappyType = nappyType;
      details.stoolColour = stoolColour || undefined;
    }
    if (type === 'temperature') {
      const value = Number(temperature);
      if (!value || value < 30 || value > 45) {
        setError('請輸入合理嘅體溫數值。');
        return;
      }
      details.valueCelsius = value;
      details.measurementSite = measurementSite;
    }
    if (type === 'sleep') {
      const duration = Number(sleepMinutes);
      if (!duration || duration <= 0 || duration > 1440) {
        setError('請輸入 1–1440 分鐘睡眠時間。');
        return;
      }
      details.sleepMinutes = duration;
    }
    if (type === 'medicine') {
      if (!medicineName.trim()) {
        setError('請輸入藥物名稱。');
        return;
      }
      details.medicineName = medicineName.trim();
      details.concentration = concentration.trim() || undefined;
      const dose = Number(doseMl);
      if (!dose || dose <= 0 || dose > 100) {
        setError('請依藥物標籤輸入有效 ml 劑量。');
        return;
      }
      details.doseMl = dose;
    }
    if (type === 'weight') {
      const weight = Number(weightKg);
      if (!weight || weight < 0.3 || weight > 30) {
        setError('請輸入 0.3–30 kg 體重。');
        return;
      }
      details.weightKg = weight;
    }
    if (type === 'note' && !note.trim()) {
      setError('請輸入備註內容。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({ type, occurredAt, details });
      resetAndClose();
    } catch {
      setError('未能儲存紀錄，請檢查網絡後再試。');
      setSaving(false);
    }
  };

  const selected = options.find((option) => option.type === type);
  const selectedMedicinePreset: MedicineQuickValue | undefined = medicineName.trim() && Number(doseMl) > 0
    ? {
        medicineName: medicineName.trim(),
        concentration: concentration.trim() || undefined,
        doseMl: Number(doseMl),
      }
    : undefined;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && resetAndClose()}>
      <section ref={dialogRef} className="quick-sheet" role="dialog" aria-modal="true" aria-label="新增 BB 紀錄" data-testid="quick-add-sheet">
        <div className="sheet-handle" />
        <header className="sheet-header">
          <div>
            {type && <button className="text-button" type="button" onClick={() => setType(null)}>← 返回</button>}
            <h2>{type ? `新增${selected?.label}紀錄` : '想記低咩？'}</h2>
            {!type && <p>揀一項，預設會使用而家時間。</p>}
          </div>
          <button className="icon-button" onClick={resetAndClose} disabled={saving} aria-label="關閉新增紀錄"><Icon name="close" /></button>
        </header>

        {!type ? (
          <div className="quick-grid">
            {options.map((option) => (
              <button key={option.type} onClick={() => setType(option.type)} data-testid={`add-${option.type}`}>
                <span className={`record-icon tone-${option.tone}`}><Icon name={option.icon} /></span>
                <span><strong>{option.label}</strong><small>{option.hint}</small></span>
                <Icon name="chevron" size={17} />
              </button>
            ))}
          </div>
        ) : (
          <form className="record-form" onSubmit={submit}>
            <div className="form-row two-columns">
              <label className="field"><span>日期</span><input type="date" min="2020-01-01" max={dateInputValue()} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
              <label className="field"><span>時間</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
            </div>

            {type === 'feed' && (
              <>
                <fieldset className="choice-group"><legend>餵奶方式</legend><div className="segmented">
                  {[['breast', '母乳'], ['formula', '配方奶'], ['expressed', '泵奶']].map(([value, label]) => (
                    <button type="button" key={value} className={method === value ? 'selected' : ''} onClick={() => setMethod(value as typeof method)}>{label}</button>
                  ))}
                </div></fieldset>
                {method === 'breast' ? (
                  <>
                    <fieldset className="choice-group"><legend>邊一邊</legend><div className="segmented">
                      {[['left', '左邊'], ['right', '右邊'], ['both', '兩邊']].map(([value, label]) => (
                        <button type="button" key={value} className={side === value ? 'selected' : ''} onClick={() => setSide(value as typeof side)}>{label}</button>
                      ))}
                    </div></fieldset>
                    <RememberedField
                      field="feedDurationMinutes"
                      label="母乳時間"
                      suffix="分鐘"
                      options={quickOptions.feedDurationMinutes}
                      selectedValue={durationMinutes ? Number(durationMinutes) : undefined}
                      onSelect={(option) => setDurationMinutes(String(option.value))}
                      onDelete={onDeleteQuickOption}
                    >
                      <label className="field"><span>大約幾多分鐘</span><input type="number" inputMode="numeric" min="1" max="300" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} placeholder="例如 20" /></label>
                    </RememberedField>
                  </>
                ) : (
                  <RememberedField
                    field="feedAmountMl"
                    label="奶量"
                    suffix="ml"
                    options={quickOptions.feedAmountMl}
                    selectedValue={amountMl ? Number(amountMl) : undefined}
                    onSelect={(option) => setAmountMl(String(option.value))}
                    onDelete={onDeleteQuickOption}
                  >
                    <label className="field"><span>奶量（ml）</span><input type="number" inputMode="decimal" min="1" max="1000" step="0.1" value={amountMl} onChange={(event) => setAmountMl(event.target.value)} placeholder="例如 90" /></label>
                  </RememberedField>
                )}
              </>
            )}

            {type === 'nappy' && (
              <>
                <fieldset className="choice-group"><legend>尿片種類</legend><div className="segmented">
                  {[['wet', '濕片'], ['dirty', '便便'], ['both', '兩樣']].map(([value, label]) => (
                    <button type="button" key={value} className={nappyType === value ? 'selected' : ''} onClick={() => setNappyType(value as typeof nappyType)}>{label}</button>
                  ))}
                </div></fieldset>
                {nappyType !== 'wet' && (
                  <RememberedField
                    field="nappyStoolColour"
                    label="便便顏色"
                    options={quickOptions.nappyStoolColour}
                    selectedValue={stoolColour}
                    onSelect={(option) => setStoolColour(String(option.value))}
                    onDelete={onDeleteQuickOption}
                  >
                    <label className="field"><span>便便顏色</span><input value={stoolColour} onChange={(event) => setStoolColour(event.target.value)} maxLength={80} placeholder="例如 黃色、綠色" /></label>
                  </RememberedField>
                )}
              </>
            )}

            {type === 'temperature' && (
              <div className="form-row two-columns">
                <RememberedField
                  field="temperatureCelsius"
                  label="體溫"
                  suffix="°C"
                  options={quickOptions.temperatureCelsius}
                  selectedValue={temperature ? Number(temperature) : undefined}
                  onSelect={(option) => setTemperature(String(option.value))}
                  onDelete={onDeleteQuickOption}
                >
                  <label className="field"><span>體溫（°C）</span><input type="number" inputMode="decimal" min="30" max="45" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} placeholder="36.8" required /></label>
                </RememberedField>
                <label className="field"><span>量度位置</span><select value={measurementSite} onChange={(event) => setMeasurementSite(event.target.value)}><option>腋下</option><option>耳探</option><option>其他</option></select></label>
              </div>
            )}

            {type === 'sleep' && (
              <RememberedField
                field="sleepMinutes"
                label="睡眠時間"
                suffix="分鐘"
                options={quickOptions.sleepMinutes}
                selectedValue={sleepMinutes ? Number(sleepMinutes) : undefined}
                onSelect={(option) => setSleepMinutes(String(option.value))}
                onDelete={onDeleteQuickOption}
              >
                <label className="field"><span>睡咗幾多分鐘</span><input type="number" inputMode="numeric" min="1" max="1440" value={sleepMinutes} onChange={(event) => setSleepMinutes(event.target.value)} placeholder="例如 45" /></label>
              </RememberedField>
            )}

            {type === 'medicine' && (
              <>
                <RememberedField
                  field="medicinePreset"
                  label="藥物組合"
                  options={quickOptions.medicinePreset}
                  selectedValue={selectedMedicinePreset}
                  formatOption={medicineOptionLabel}
                  onSelect={(option) => {
                    if (!isMedicineQuickValue(option.value)) return;
                    setMedicineName(option.value.medicineName);
                    setConcentration(option.value.concentration || '');
                    setDoseMl(String(option.value.doseMl));
                  }}
                  onDelete={onDeleteQuickOption}
                >
                  <label className="field"><span>藥物名稱</span><input value={medicineName} onChange={(event) => setMedicineName(event.target.value)} maxLength={120} placeholder="依藥物標籤填寫" required /></label>
                  <div className="form-row two-columns">
                    <label className="field"><span>濃度</span><input value={concentration} onChange={(event) => setConcentration(event.target.value)} maxLength={120} placeholder="例如 120 mg/5 ml" /></label>
                    <label className="field"><span>劑量（ml）</span><input type="number" inputMode="decimal" min="0.01" max="100" step="0.01" value={doseMl} onChange={(event) => setDoseMl(event.target.value)} placeholder="例如 2.5" /></label>
                  </div>
                </RememberedField>
                <div className="inline-warning"><Icon name="alert" size={18} /> 只依照醫護或藥物標籤指示記錄，網站唔會計算劑量。</div>
              </>
            )}

            {type === 'weight' && (
              <RememberedField
                field="weightKg"
                label="體重"
                suffix="kg"
                options={quickOptions.weightKg}
                selectedValue={weightKg ? Number(weightKg) : undefined}
                onSelect={(option) => setWeightKg(String(option.value))}
                onDelete={onDeleteQuickOption}
              >
                <label className="field"><span>體重（kg）</span><input type="number" inputMode="decimal" min="0.3" max="30" step="0.01" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} placeholder="例如 3.65" /></label>
              </RememberedField>
            )}

            <RememberedField
              field={noteFieldByType[type]}
              label={type === 'note' ? '內容' : '備註'}
              options={quickOptions[noteFieldByType[type]]}
              selectedValue={note}
              onSelect={(option) => setNote(String(option.value))}
              onDelete={onDeleteQuickOption}
            >
              <label className="field"><span>{type === 'note' ? '內容' : '備註（可留空）'}</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={1000} placeholder="記低其他觀察…" required={type === 'note'} /></label>
            </RememberedField>

            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button save-record" disabled={saving}>{saving ? '儲存中…' : '儲存紀錄'}</button>
          </form>
        )}
      </section>
    </div>
  );
}
