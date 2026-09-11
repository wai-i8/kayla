import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const tempDir = await mkdtemp(path.join(os.tmpdir(), 'kayla-reminders-'));
const bundlePath = path.join(tempDir, 'reminder-engine.mjs');

try {
  await build({
    entryPoints: [path.join(projectRoot, 'src', 'lib', 'reminderEngine.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: bundlePath,
    logLevel: 'silent',
  });
  const { babyReminders } = await import(pathToFileURL(bundlePath).href);
  const engine = await import(`${pathToFileURL(bundlePath).href}?test=${Date.now()}`);

  assert.ok(babyReminders.length >= 100, `expected at least 100 reminders, got ${babyReminders.length}`);
  assert.equal(new Set(babyReminders.map((item) => item.id)).size, babyReminders.length, 'reminder IDs must be unique');
  for (const trigger of ['exact_day', 'day_range', 'exact_week', 'week_range', 'exact_month', 'month_range', 'recurring', 'event_based']) {
    assert.ok(babyReminders.some((item) => item.triggerType === trigger), `missing trigger type: ${trigger}`);
  }
  for (const category of ['feeding', 'nappy', 'sleep', 'bath', 'umbilical', 'vitamins', 'physical', 'vision', 'hearing', 'communication', 'social', 'teeth', 'weaning', 'allergens', 'vaccination', 'safety', 'travel', 'play', 'bonding', 'newborn']) {
    assert.ok(babyReminders.some((item) => item.category === category), `missing category: ${category}`);
  }

  const today = Date.parse('2026-09-11T12:00:00Z');
  const mixedProfile = { name: 'Test', dateOfBirth: '2026-09-11', feedingMethod: 'mixed' };
  assert.equal(engine.getBabyAge(mixedProfile.dateOfBirth, today).babyAgeDays, 0, 'DOB today should be day 0');
  assert.equal(engine.getBabyAge('2026-09-10', today).babyAgeDays, 1, 'DOB yesterday should be day 1');
  assert.equal(engine.getBabyAge('2026-09-06', today).babyAgeDays, 5, 'DOB six days before should be day 5');
  assert.equal(engine.getBabyAge('2026-08-28', today).babyAgeWeeks, 2, '14 days should be 2 weeks');
  assert.equal(engine.getBabyAge('2026-07-31', today).babyAgeWeeks, 6, '42 days should be 6 weeks');
  assert.equal(engine.getBabyAge('2026-03-11', today).babyAgeMonths, 6, 'same calendar day should be 6 months');

  const newborn = engine.getDailyBabyReminders(mixedProfile, today);
  assert.ok(newborn.reminders.length >= 2, 'newborn should show multiple reminders');
  assert.ok(newborn.eligibleCount > newborn.reminders.length, 'newborn should have a view-all remainder');
  assert.deepEqual(
    newborn.reminders.map((item) => item.id),
    engine.getDailyBabyReminders(mixedProfile, today).reminders.map((item) => item.id),
    'same baby and local date should be deterministic',
  );

  const vaccineDay = engine.getDailyBabyReminders({ ...mixedProfile, dateOfBirth: '2026-07-17' }, today);
  assert.ok(vaccineDay.eligible.some((item) => item.id === 'weeks4-vaccine-eight'), '8-week vaccine reminder should be eligible');
  assert.ok(vaccineDay.reminders.some((item) => item.id === 'weeks4-vaccine-eight'), 'time-sensitive vaccine reminder should be selected');

  const detached = engine.getDailyBabyReminders({ ...mixedProfile, dateOfBirth: '2026-08-28', events: { umbilicalCordDetachedAt: '2026-09-05' } }, today);
  assert.ok(!detached.eligible.some((item) => item.eventKey === 'umbilicalCordDetachedAt' && item.eventCondition === 'unset'), 'detached cord should suppress pending-cord reminders');
  assert.ok(detached.eligible.some((item) => item.id === 'day8-cord-after-drop'), 'detached cord should enable post-detachment guidance');

  const invalid = engine.getDailyBabyReminders({ ...mixedProfile, dateOfBirth: 'not-a-date' }, today);
  assert.equal(invalid.age.valid, false, 'invalid DOB should be handled gracefully');
  assert.equal(invalid.reminders.length, 0, 'invalid DOB should not produce age-based reminders');
  assert.notDeepEqual(
    engine.getDailyBabyReminders(mixedProfile, today).reminders.map((item) => item.id),
    engine.getDailyBabyReminders({ ...mixedProfile, dateOfBirth: '2026-09-10' }, today).reminders.map((item) => item.id),
    'next local day should use a different age/date rotation when eligible content changes',
  );

  console.log(`Reminder checks OK: ${babyReminders.length} entries; age, triggers, priorities, determinism and events covered.`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
