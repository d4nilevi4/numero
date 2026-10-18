import test from 'node:test';
import assert from 'node:assert/strict';
import { getRanges, mergeRanges, nextNumber, RANGES, sanitizeSettings } from '../src/state.js';

test('settings recover defaults, reject unknown ranges and retain a valid mix', () => {
  for (const raw of [null, undefined, false, 'broken', {}]) {
    assert.deepEqual(sanitizeSettings(raw).selected, ['units', 'tens', 'hundreds']);
  }
  const settings = sanitizeSettings({
    selected: ['units', 'millions', 'units', 'toString', null, 'custom'],
    customMin: 21_000_000, customMax: 31_000_000, order: 'ascending', showRussian: true,
  });
  assert.deepEqual(settings.selected, ['units', 'millions', 'custom']);
  assert.equal(settings.order, 'ascending');
  assert.equal(settings.showRussian, true);
  assert.deepEqual(getRanges(settings), [RANGES.units, RANGES.millions, { min: 21_000_000, max: 31_000_000 }]);
  assert.equal(sanitizeSettings({ customMin: 10, customMax: 1 }).customMin, 0);
  assert.deepEqual(sanitizeSettings({ selected: [] }).selected, []);
});

test('ascending order crosses gaps, deduplicates overlaps and wraps to the beginning', () => {
  const ranges = [{ min: 10, max: 11 }, { min: 0, max: 1 }, { min: 10, max: 13 }, { min: 21, max: 21 }];
  const actual = [];
  let previous;
  for (let index = 0; index < 8; index++) {
    previous = nextNumber(ranges, 'ascending', previous);
    actual.push(previous);
  }
  assert.deepEqual(actual, [0, 1, 10, 11, 12, 13, 21, 0]);
  assert.equal(ranges[0].max, 11, 'input ranges are not changed');
  assert.deepEqual(mergeRanges([{ min: 0, max: 9 }, { min: 10, max: 99 }]), [{ min: 0, max: 99 }]);
});

test('a random mix gives small and large bands equal opportunity and includes endpoints', () => {
  const ranges = [RANGES.units, RANGES.tenMillions];
  let values = [0, 0.999999];
  assert.equal(nextNumber(ranges, 'random', undefined, () => values.shift()), 9);
  values = [0.999999, 0];
  assert.equal(nextNumber(ranges, 'random', undefined, () => values.shift()), 10_000_000);
  values = [0.999999, 0.99999999999];
  assert.equal(nextNumber(ranges, 'random', undefined, () => values.shift()), 99_999_999);

  const counts = [0, 0];
  for (let index = 0; index < 100; index++) {
    values = [index / 100, 0];
    const number = nextNumber(ranges, 'random', undefined, () => values.shift());
    counts[number < 10 ? 0 : 1]++;
  }
  assert.deepEqual(counts, [50, 50]);
});

test('empty selections and single-number custom ranges behave in both modes', () => {
  for (const order of ['random', 'ascending']) {
    assert.equal(nextNumber([], order), undefined);
    assert.equal(nextNumber([{ min: 21_000_000, max: 21_000_000 }], order, 21_000_000), 21_000_000);
  }
  assert.equal(nextNumber([RANGES.billions], 'ascending', RANGES.billions.max), RANGES.billions.min);
});
