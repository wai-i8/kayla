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
  const engine = await import(pathToFileURL(bundlePath).href);
  const { babyReminders } = engine;

  assert.ok(babyReminders.length >= 120, `expected a rich reminder library, got ${babyReminders.length}`);
  assert.equal(new Set(babyReminders.map((item) => item.id)).size, babyReminders.length, 'reminder IDs must be unique');
  for (const trigger of ['exact_day', 'age_window', 'event_based']) {
    assert.ok(babyReminders.some((item) => item.triggerType === trigger), `missing trigger type: ${trigger}`);
  }

  const now = Date.parse('2026-09-28T12:00:00Z');
  const profileForAge = (days) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - days);
    return { name: 'Test', dateOfBirth: d.toISOString().slice(0, 10), feedingMethod: 'mixed' };
  };

  // The key regression that prompted this change: no blank "5 weeks 6 days" day.
  const day41 = engine.getDailyBabyReminders(profileForAge(41), now);
  assert.ok(day41.reminders.length >= 2, '5w6d should surface useful stage knowledge');
  assert.ok(day41.reminders.some((item) => item.triggerType === 'age_window'), '5w6d should use stage knowledge');

  // First year should not silently go blank on ordinary days.
  for (let days = 0; days <= 365; days += 1) {
    const result = engine.getDailyBabyReminders(profileForAge(days), now);
    assert.ok(result.reminders.length >= 1, `day ${days} should have at least one useful reminder`);
  }

  // Seen stage items should be skipped when unseen alternatives exist.
  const first = engine.getDailyBabyReminders(profileForAge(41), now);
  const excluded = new Set(first.reminders.filter((item) => item.triggerType === 'age_window').map((item) => item.id));
  const second = engine.getDailyBabyReminders(profileForAge(41), now, 3, excluded);
  const secondStageIds = second.reminders.filter((item) => item.triggerType === 'age_window').map((item) => item.id);
  assert.ok(secondStageIds.every((id) => !excluded.has(id)), 'stage rotation should prefer unseen content');

  const vaccine = engine.getDailyBabyReminders(profileForAge(56), now);
  assert.ok(vaccine.reminders.some((item) => item.id === 'day56-vaccines'), '8-week vaccine reminder should remain exact-day priority');

  console.log(`Reminder checks OK: ${babyReminders.length} entries; first-year daily coverage and unseen stage rotation covered.`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
