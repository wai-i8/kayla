import { useEffect, useId, useState, type FormEvent } from 'react';
import { dateInputValue, inputsToTimestamp, timeInputValue } from '../lib/date';
import type {
  BabyRecord,
  MedicineActiveUnit,
  MedicineAdministrationUnit,
  MedicineQuickValue,
  NewRecordInput,
  QuickOption,
  QuickOptionField,
  QuickOptionsByField,
  RecordType,
} from '../types';
import {
  calculateMedicineActiveAmount,
  calculateStoredMedicineActiveAmount,
  canonicalMedicineConcentration,
  formatMedicineAdministration,
  formatMedicineConcentration,
  formatMedicineNumber,
  hasStructuredMedicineValue,
  parseMedicineConcentration,
} from '../lib/medicine';
import { isMedicineQuickValue } from '../lib/quickOptions';
import { Icon, type IconName } from './Icon';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { RememberedField } from './RememberedField';

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: NewRecordInput) => Promise<void>;
  editingRecord?: BabyRecord | null;
  onUpdate: (recordId: string, record: NewRecordInput) => Promise<void>;
  quickOptions: QuickOptionsByField;
  onDeleteQuickOption: (field: QuickOptionField, id: string) => Promise<void>;
}

const options: Array<{ type: RecordType; label: string; hint: string; icon: IconName; tone: string }> = [
  { type: 'feed', label: '餵奶', hint: '母乳或奶量', icon: 'bottle', tone: 'peach' },
  { type: 'nappy', label: '尿片', hint: '濕片或便便', icon: 'nappy', tone: 'sage' },
  { type: 'temperature', label: '體溫', hint: '數值及位置', icon: 'temperature', tone: 'rose' },
  { type: 'sleep', label: '睡眠', hint: '睡眠時間', icon: 'moon', tone: 'blue' },
  { type: 'medicine', label: '藥物', hint: '名稱、濃度及份量', icon: 'medicine', tone: 'gold' },
  { type: 'weight', label: '體重', hint: '公斤', icon: 'weight', tone: 'blue' },
  { type: 'note', label: '備註', hint: '其他觀察', icon: 'note', tone: 'sage' },
];

function medicineOptionLabel(option: QuickOption) {
  if (!isMedicineQuickValue(option.value)) return '已儲存藥物';
  const concentration = formatMedicineConcentration(option.value);
  const administration = formatMedicineAdministration(option.value);
  const activeAmount = calculateStoredMedicineActiveAmount(option.value);
  const summary = [option.value.medicineName, concentration, administration].filter(Boolean).join(' · ');
  return activeAmount
    ? `${summary} → ${formatMedicineNumber(activeAmount.amount)} ${activeAmount.unit}`
    : summary;
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

function numberInputValue(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

export function QuickAddSheet({
  open,
  onClose,
  onSave,
  editingRecord = null,
  onUpdate,
  quickOptions,
  onDeleteQuickOption,
}: QuickAddSheetProps) {
  const [type, setType] = useState<RecordType | null>(null);
  const [date, setDate] = useState(dateInputValue());
  const [time, setTime] = useState(timeInputValue());
  const [method, setMethod] = useState<'breast' | 'formula' | 'expressed' | ''>('');
  const [side, setSide] = useState<'left' | 'right' | 'both' | ''>('');
  const [amountMl, setAmountMl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [nappyType, setNappyType] = useState<'wet' | 'dirty' | 'both' | ''>('');
  const [stoolColour, setStoolColour] = useState('');
  const [temperature, setTemperature] = useState('');
  const [measurementSite, setMeasurementSite] = useState('');
  const [sleepMinutes, setSleepMinutes] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [medicineConcentrationAmount, setMedicineConcentrationAmount] = useState('');
  const [medicineConcentrationUnit, setMedicineConcentrationUnit] = useState<MedicineActiveUnit>('mg');
  const [medicineConcentrationPerAmount, setMedicineConcentrationPerAmount] = useState('');
  const [medicineConcentrationPerUnit, setMedicineConcentrationPerUnit] = useState<MedicineAdministrationUnit>('mL');
  const [medicineAmount, setMedicineAmount] = useState('');
  const [medicineAmountUnit, setMedicineAmountUnit] = useState<MedicineAdministrationUnit>('mL');
  const [legacyMedicineNotice, setLegacyMedicineNotice] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const isEditing = Boolean(editingRecord);

  const resetDetails = () => {
    setMethod('');
    setSide('');
    setAmountMl('');
    setDurationMinutes('');
    setNappyType('');
    setStoolColour('');
    setTemperature('');
    setMeasurementSite('');
    setSleepMinutes('');
    setMedicineName('');
    setMedicineConcentrationAmount('');
    setMedicineConcentrationUnit('mg');
    setMedicineConcentrationPerAmount('');
    setMedicineConcentrationPerUnit('mL');
    setMedicineAmount('');
    setMedicineAmountUnit('mL');
    setLegacyMedicineNotice('');
    setWeightKg('');
    setNote('');
  };

  const resetForm = () => {
    setType(null);
    setDate(dateInputValue());
    setTime(timeInputValue());
    resetDetails();
    setError('');
    setSaving(false);
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };
  const dialogRef = useDialogFocus(open, resetAndClose, !saving);

  useEffect(() => {
    if (!open) return;
    resetForm();
    if (editingRecord) {
      const details = editingRecord.details;
      setType(editingRecord.type);
      setDate(dateInputValue(editingRecord.occurredAt));
      setTime(timeInputValue(editingRecord.occurredAt));
      setMethod(details.method || '');
      setSide(details.side || '');
      setAmountMl(numberInputValue(details.amountMl));
      setDurationMinutes(numberInputValue(details.durationMinutes));
      setNappyType(details.nappyType || '');
      setStoolColour(details.stoolColour || '');
      setTemperature(numberInputValue(details.valueCelsius));
      setMeasurementSite(details.measurementSite || '');
      setSleepMinutes(numberInputValue(details.sleepMinutes));
      setMedicineName(details.medicineName || '');
      setMedicineAmount(numberInputValue(details.doseMl));
      setWeightKg(numberInputValue(details.weightKg));
      setNote(details.note || '');

      const parsedConcentration = parseMedicineConcentration(details.concentration);
      if (parsedConcentration) {
        setMedicineConcentrationAmount(String(parsedConcentration.medicineConcentrationAmount));
        setMedicineConcentrationUnit(parsedConcentration.medicineConcentrationUnit);
        setMedicineConcentrationPerAmount(String(parsedConcentration.medicineConcentrationPerAmount));
        setMedicineConcentrationPerUnit(parsedConcentration.medicineConcentrationPerUnit);
        setMedicineAmountUnit(parsedConcentration.medicineConcentrationPerUnit);
      } else if (details.concentration) {
        setLegacyMedicineNotice(`舊濃度「${details.concentration}」未能自動拆分，請照藥物標籤重新填寫。`);
      }
    }
    setError('');
  }, [open, editingRecord?.id]);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const recordType = editingRecord?.type || type;
    if (!recordType) return;

    const occurredAt = inputsToTimestamp(date, time);
    if (!Number.isFinite(occurredAt) || occurredAt > Date.now() + 10 * 60_000) {
      setError('紀錄時間唔可以係未來時間。');
      return;
    }

    const details: NewRecordInput['details'] = {};
    if (note.trim()) details.note = note.trim();

    if (recordType === 'feed') {
      if (method) details.method = method;
      if (method === 'breast' && side) details.side = side;

      const durationText = durationMinutes.trim();
      if (durationText) {
        const duration = Number(durationText);
        if (!Number.isFinite(duration) || duration <= 0 || duration > 300) {
          setError('餵奶時間請輸入 1–300 分鐘。');
          return;
        }
        details.durationMinutes = duration;
      }

      if (method === 'formula' || method === 'expressed') {
        const amountText = amountMl.trim();
        if (amountText) {
          const amount = Number(amountText);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
            setError('奶量請輸入 1–1000 mL。');
            return;
          }
          details.amountMl = amount;
        }
      }
    }
    if (recordType === 'nappy') {
      if (nappyType) details.nappyType = nappyType;
      if ((nappyType === 'dirty' || nappyType === 'both') && stoolColour.trim()) {
        details.stoolColour = stoolColour.trim();
      }
    }
    if (recordType === 'temperature') {
      const temperatureText = temperature.trim();
      if (temperatureText) {
        const value = Number(temperatureText);
        if (!Number.isFinite(value) || value < 30 || value > 45) {
          setError('體溫請輸入 30–45°C。');
          return;
        }
        details.valueCelsius = value;
      }
      if (measurementSite) details.measurementSite = measurementSite;
    }
    if (recordType === 'sleep') {
      const sleepText = sleepMinutes.trim();
      if (sleepText) {
        const duration = Number(sleepText);
        if (!Number.isFinite(duration) || duration <= 0 || duration > 1440) {
          setError('睡眠時間請輸入 1–1440 分鐘。');
          return;
        }
        details.sleepMinutes = duration;
      }
    }
    if (recordType === 'medicine') {
      const hasAnyMedicineDetails = Boolean(
        medicineName.trim()
        || medicineConcentrationAmount.trim()
        || medicineConcentrationPerAmount.trim()
        || medicineAmount.trim(),
      );
      if (hasAnyMedicineDetails) {
        if (!medicineName.trim()) {
          setError('填寫藥物資料後，請同時輸入藥物名稱。');
          return;
        }
        const concentrationAmount = Number(medicineConcentrationAmount);
        const concentrationPerAmount = Number(medicineConcentrationPerAmount);
        const administeredAmount = Number(medicineAmount);
        if (!administeredAmount || administeredAmount <= 0 || administeredAmount > 100) {
          setError('請輸入有效嘅服用份量。');
          return;
        }
        if (!concentrationAmount || concentrationAmount <= 0 || concentrationAmount > 1_000_000) {
          setError('請依藥物標籤輸入有效濃度含量。');
          return;
        }
        if (!concentrationPerAmount || concentrationPerAmount <= 0 || concentrationPerAmount > 1_000) {
          setError('請輸入濃度嘅「基準份量」。');
          return;
        }
        if (medicineConcentrationPerUnit === '滴' && !Number.isInteger(concentrationPerAmount)) {
          setError('濃度以滴為單位時，請輸入完整滴數。');
          return;
        }
        if (medicineAmountUnit === '滴' && !Number.isInteger(administeredAmount)) {
          setError('服用份量以滴為單位時，請輸入完整滴數。');
          return;
        }
        if (medicineConcentrationPerUnit !== medicineAmountUnit) {
          setError('濃度嘅份量單位同服用份量單位要一致。');
          return;
        }
        details.medicineName = medicineName.trim();
        details.concentration = canonicalMedicineConcentration({
          medicineConcentrationAmount: concentrationAmount,
          medicineConcentrationUnit,
          medicineConcentrationPerAmount: concentrationPerAmount,
          medicineConcentrationPerUnit,
          medicineAmount: administeredAmount,
          medicineAmountUnit,
        });
        // Keep the established key so current live Database Rules and old clients remain compatible.
        details.doseMl = administeredAmount;
      }
    }
    if (recordType === 'weight') {
      const weightText = weightKg.trim();
      if (weightText) {
        const weight = Number(weightText);
        if (!Number.isFinite(weight) || weight < 0.3 || weight > 30) {
          setError('體重請輸入 0.3–30 kg。');
          return;
        }
        details.weightKg = weight;
      }
    }

    setSaving(true);
    setError('');
    try {
      const input = { type: recordType, occurredAt, details };
      if (editingRecord) {
        await onUpdate(editingRecord.id, input);
      } else {
        await onSave(input);
      }
      resetAndClose();
    } catch {
      setError(editingRecord ? '未能更新紀錄，請檢查網絡後再試。' : '未能儲存紀錄，請檢查網絡後再試。');
      setSaving(false);
    }
  };

  const activeType = editingRecord?.type || type;
  const selected = options.find((option) => option.type === activeType);
  const currentMedicineValue = {
    medicineConcentrationAmount: Number(medicineConcentrationAmount),
    medicineConcentrationUnit,
    medicineConcentrationPerAmount: Number(medicineConcentrationPerAmount),
    medicineConcentrationPerUnit,
    medicineAmount: Number(medicineAmount),
    medicineAmountUnit,
  };
  const selectedMedicinePreset: MedicineQuickValue | undefined = medicineName.trim() && hasStructuredMedicineValue(currentMedicineValue)
    ? {
        medicineName: medicineName.trim(),
        concentration: canonicalMedicineConcentration(currentMedicineValue),
        doseMl: currentMedicineValue.medicineAmount,
      }
    : undefined;
  const actualMedicineAmount = calculateMedicineActiveAmount(currentMedicineValue);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && resetAndClose()}>
      <section ref={dialogRef} className="quick-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} data-testid="quick-add-sheet" data-record-type={activeType || 'picker'}>
        <div className="sheet-handle" />
        <header className="sheet-header">
          <div>
            {activeType && !isEditing && <button className="text-button" type="button" onClick={() => { resetDetails(); setType(null); setError(''); }}>← 返回</button>}
            <h2 id={titleId}>{activeType ? `${isEditing ? '編輯' : '新增'}${selected?.label}紀錄` : '想記低咩？'}</h2>
            {!activeType
              ? <p>揀一項，預設會使用而家時間。</p>
              : <p>詳細資料可以留空儲存，之後得閒再編輯補充。</p>}
          </div>
          <button className="icon-button" onClick={resetAndClose} disabled={saving} aria-label={isEditing ? '關閉編輯紀錄' : '關閉新增紀錄'}><Icon name="close" /></button>
        </header>

        {!activeType ? (
          <div className="quick-grid">
            {options.map((option) => (
              <button key={option.type} onClick={() => { resetDetails(); setType(option.type); setError(''); }} data-testid={`add-${option.type}`}>
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

            {activeType === 'feed' && (
              <>
                <fieldset className="choice-group"><legend>餵奶方式</legend><div className="segmented">
                  {([['', '未填'], ['breast', '母乳'], ['formula', '配方奶'], ['expressed', '泵奶']] as const).map(([value, label]) => (
                    <button type="button" key={value || 'blank'} className={method === value ? 'selected' : ''} onClick={() => setMethod(value)}>{label}</button>
                  ))}
                </div></fieldset>
                {method === 'breast' && (
                  <fieldset className="choice-group"><legend>邊一邊</legend><div className="segmented">
                    {([['', '未填'], ['left', '左邊'], ['right', '右邊'], ['both', '兩邊']] as const).map(([value, label]) => (
                      <button type="button" key={value || 'blank'} className={side === value ? 'selected' : ''} onClick={() => setSide(value)}>{label}</button>
                    ))}
                  </div></fieldset>
                )}
                <RememberedField
                  field="feedDurationMinutes"
                  label="餵奶時間"
                  suffix="分鐘"
                  options={quickOptions.feedDurationMinutes}
                  selectedValue={durationMinutes ? Number(durationMinutes) : undefined}
                  onSelect={(option) => setDurationMinutes(String(option.value))}
                  onDelete={onDeleteQuickOption}
                >
                  <label className="field"><span>大約幾多分鐘（可留空）</span><input type="number" inputMode="numeric" min="1" max="300" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} placeholder="例如 20" /></label>
                </RememberedField>
                {(method === 'formula' || method === 'expressed') && (
                  <RememberedField
                    field="feedAmountMl"
                    label="奶量"
                    suffix="mL"
                    options={quickOptions.feedAmountMl}
                    selectedValue={amountMl ? Number(amountMl) : undefined}
                    onSelect={(option) => setAmountMl(String(option.value))}
                    onDelete={onDeleteQuickOption}
                  >
                    <label className="field"><span>奶量（mL，可留空）</span><input type="number" inputMode="decimal" min="1" max="1000" step="0.1" value={amountMl} onChange={(event) => setAmountMl(event.target.value)} placeholder="例如 90" /></label>
                  </RememberedField>
                )}
              </>
            )}

            {activeType === 'nappy' && (
              <>
                <fieldset className="choice-group"><legend>尿片種類</legend><div className="segmented">
                  {([['', '未填'], ['wet', '濕片'], ['dirty', '便便'], ['both', '兩樣']] as const).map(([value, label]) => (
                    <button type="button" key={value || 'blank'} className={nappyType === value ? 'selected' : ''} onClick={() => setNappyType(value)}>{label}</button>
                  ))}
                </div></fieldset>
                {(nappyType === 'dirty' || nappyType === 'both') && (
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

            {activeType === 'temperature' && (
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
                  <label className="field"><span>體溫（°C，可留空）</span><input type="number" inputMode="decimal" min="30" max="45" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} placeholder="36.8" /></label>
                </RememberedField>
                <label className="field"><span>量度位置</span><select value={measurementSite} onChange={(event) => setMeasurementSite(event.target.value)}><option value="">未填</option><option>腋下</option><option>耳探</option><option>其他</option></select></label>
              </div>
            )}

            {activeType === 'sleep' && (
              <RememberedField
                field="sleepMinutes"
                label="睡眠時間"
                suffix="分鐘"
                options={quickOptions.sleepMinutes}
                selectedValue={sleepMinutes ? Number(sleepMinutes) : undefined}
                onSelect={(option) => setSleepMinutes(String(option.value))}
                onDelete={onDeleteQuickOption}
              >
                <label className="field"><span>瞓咗幾多分鐘（可留空）</span><input type="number" inputMode="numeric" min="1" max="1440" value={sleepMinutes} onChange={(event) => setSleepMinutes(event.target.value)} placeholder="例如 45" /></label>
              </RememberedField>
            )}

            {activeType === 'medicine' && (
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
                    setMedicineAmount(String(option.value.doseMl));
                    const parsed = parseMedicineConcentration(option.value.concentration);
                    if (parsed) {
                      setMedicineConcentrationAmount(String(parsed.medicineConcentrationAmount));
                      setMedicineConcentrationUnit(parsed.medicineConcentrationUnit);
                      setMedicineConcentrationPerAmount(String(parsed.medicineConcentrationPerAmount));
                      setMedicineConcentrationPerUnit(parsed.medicineConcentrationPerUnit);
                      setMedicineAmountUnit(parsed.medicineConcentrationPerUnit);
                      setLegacyMedicineNotice('');
                    } else {
                      setMedicineConcentrationAmount('');
                      setMedicineConcentrationUnit('mg');
                      setMedicineConcentrationPerAmount('');
                      setMedicineConcentrationPerUnit('mL');
                      setMedicineAmountUnit('mL');
                      setLegacyMedicineNotice(option.value.concentration
                        ? `舊濃度「${option.value.concentration}」未能自動拆分，請照藥物標籤重新填寫。`
                        : '呢個舊常用組合未有濃度，請照藥物標籤補充。');
                    }
                  }}
                  onDelete={onDeleteQuickOption}
                >
                  <label className="field"><span>藥物名稱（可整組留空）</span><input value={medicineName} onChange={(event) => setMedicineName(event.target.value)} maxLength={120} placeholder="依藥物標籤填寫" /></label>
                  <fieldset className="medicine-field-group">
                    <legend>濃度</legend>
                    <p>照藥物標籤填寫，例如：120 mg / 5 mL</p>
                    <div className="medicine-ratio-grid">
                      <label className="field"><span>含量</span><input type="number" inputMode="decimal" min="0.0001" max="1000000" step="any" value={medicineConcentrationAmount} onChange={(event) => { setMedicineConcentrationAmount(event.target.value); setLegacyMedicineNotice(''); }} placeholder="120" /></label>
                      <label className="field"><span>單位</span><select value={medicineConcentrationUnit} onChange={(event) => setMedicineConcentrationUnit(event.target.value as MedicineActiveUnit)}><option value="mg">mg</option><option value="µg">µg</option><option value="IU">IU</option></select></label>
                      <label className="field"><span>基準份量</span><input type="number" inputMode={medicineConcentrationPerUnit === '滴' ? 'numeric' : 'decimal'} min={medicineConcentrationPerUnit === '滴' ? '1' : '0.0001'} max="1000" step={medicineConcentrationPerUnit === '滴' ? '1' : 'any'} value={medicineConcentrationPerAmount} onChange={(event) => { setMedicineConcentrationPerAmount(event.target.value); setLegacyMedicineNotice(''); }} placeholder="5" /></label>
                      <label className="field"><span>份量單位</span><select value={medicineConcentrationPerUnit} onChange={(event) => { const unit = event.target.value as MedicineAdministrationUnit; setMedicineConcentrationPerUnit(unit); setMedicineAmountUnit(unit); }}><option value="mL">mL</option><option value="滴">滴</option></select></label>
                    </div>
                  </fieldset>

                  <div className="form-row two-columns medicine-administration-row">
                    <label className="field"><span>服用份量</span><input type="number" inputMode={medicineAmountUnit === '滴' ? 'numeric' : 'decimal'} min={medicineAmountUnit === '滴' ? '1' : '0.0001'} max="100" step={medicineAmountUnit === '滴' ? '1' : 'any'} value={medicineAmount} onChange={(event) => setMedicineAmount(event.target.value)} placeholder={medicineAmountUnit === '滴' ? '例如 1' : '例如 2.5'} /></label>
                    <label className="field"><span>單位</span><select value={medicineAmountUnit} onChange={(event) => setMedicineAmountUnit(event.target.value as MedicineAdministrationUnit)}><option value="mL">mL</option><option value="滴">滴</option></select></label>
                  </div>

                  <output className="medicine-calculation" aria-live="polite">
                    <span>實際劑量</span>
                    <strong>{actualMedicineAmount ? `${formatMedicineNumber(actualMedicineAmount.amount)} ${actualMedicineAmount.unit}` : '—'}</strong>
                    <small>{medicineConcentrationPerUnit !== medicineAmountUnit
                      ? '濃度同服用份量嘅單位要一致先可以換算。'
                      : '填好濃度同服用份量後會自動換算。'}</small>
                  </output>
                  {legacyMedicineNotice && <p className="medicine-legacy-notice" role="status">{legacyMedicineNotice}</p>}
                </RememberedField>
                <div className="inline-warning"><Icon name="alert" size={18} /> 自動結果只係根據你輸入嘅濃度同服用份量換算，唔係服藥建議。只依照醫護或藥物標籤指示用藥。</div>
              </>
            )}

            {activeType === 'weight' && (
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
              field={noteFieldByType[activeType]}
              label={activeType === 'note' ? '內容' : '備註'}
              options={quickOptions[noteFieldByType[activeType]]}
              selectedValue={note}
              onSelect={(option) => setNote(String(option.value))}
              onDelete={onDeleteQuickOption}
            >
              <label className="field"><span>{activeType === 'note' ? '內容（可留空）' : '備註（可留空）'}</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={1000} placeholder="記低其他觀察…" /></label>
            </RememberedField>

            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button save-record" disabled={saving}>{saving ? '儲存中…' : isEditing ? '儲存修改' : '儲存紀錄'}</button>
          </form>
        )}
      </section>
    </div>
  );
}
