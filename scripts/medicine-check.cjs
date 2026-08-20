const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'lib', 'medicine.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', output)(loaded.exports, loaded);

const {
  calculateMedicineActiveAmount,
  calculateStoredMedicineActiveAmount,
  canonicalMedicineConcentration,
  formatMedicineAdministration,
  formatMedicineNumber,
  parseMedicineConcentration,
} = loaded.exports;

const liquid = {
  medicineConcentrationAmount: 120,
  medicineConcentrationUnit: 'mg',
  medicineConcentrationPerAmount: 5,
  medicineConcentrationPerUnit: 'mL',
  medicineAmount: 2.5,
  medicineAmountUnit: 'mL',
};

assert.equal(canonicalMedicineConcentration(liquid), '120 mg / 5 mL');
assert.deepEqual(calculateMedicineActiveAmount(liquid), { amount: 60, unit: 'mg' });
assert.deepEqual(
  calculateStoredMedicineActiveAmount({ concentration: '120 mg / 5 mL', doseMl: 2.5 }),
  { amount: 60, unit: 'mg' },
);
assert.equal(
  formatMedicineAdministration({ concentration: '400 IU / 1 滴', doseMl: 1 }),
  '1 滴',
);
assert.deepEqual(
  calculateStoredMedicineActiveAmount({ concentration: '400 IU / 1 drop', doseMl: 1 }),
  { amount: 400, unit: 'IU' },
);
assert.equal(parseMedicineConcentration('250 μg / 1 mL').medicineConcentrationUnit, 'µg');
assert.equal(parseMedicineConcentration('1,000 mg / 5 mL'), null);
assert.equal(parseMedicineConcentration('1000001 mg / 5 mL'), null);
assert.equal(parseMedicineConcentration('120 mg per 5 mL'), null);
assert.equal(parseMedicineConcentration('400 IU / 0.5 滴'), null);
assert.equal(calculateMedicineActiveAmount({ ...liquid, medicineAmountUnit: '滴' }), null);
assert.equal(calculateMedicineActiveAmount({
  ...liquid,
  medicineConcentrationPerAmount: 1,
  medicineConcentrationPerUnit: '滴',
  medicineAmount: 0.5,
  medicineAmountUnit: '滴',
}), null);
assert.notEqual(formatMedicineNumber(0.00000000001), '0');

console.log('Medicine checks passed: liquid, drops, units, legacy parsing and safety bounds.');
