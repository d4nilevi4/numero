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
  assert.equal(settings.theme, 'auto');
  assert.equal(sanitizeSettings({ theme: 'dark' }).theme, 'dark');
  assert.equal(sanitizeSettings({ theme: 'neon' }).theme, 'auto');
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

test('random cards exclude the previous value at both endpoints and inside a range', () => {
  for (const previous of [0, 4, 8, 9]) {
    const actual = new Set();
    for (let index = 0; index < 90; index++) {
      const values = [0, index / 90];
      actual.add(nextNumber([RANGES.units], 'random', previous, () => values.shift()));
    }
    assert.deepEqual(actual, new Set(Array.from({ length: 10 }, (_, index) => index).filter(number => number !== previous)));
  }
  assert.equal(nextNumber([{ min: 999_999_999_998, max: 999_999_999_999 }], 'random', 999_999_999_998, () => 0), 999_999_999_999);
});

test('overlapping bands and singleton custom ranges cannot reintroduce the previous card', () => {
  const ranges = [RANGES.units, { min: 5, max: 12 }, { min: 8, max: 8 }, { min: 2, max: 2 }];
  for (const bandDraw of [0, 0.4, 0.999999]) {
    for (const numberDraw of [0, 0.5, 0.999999]) {
      const values = [bandDraw, numberDraw];
      const number = nextNumber(ranges, 'random', 8, () => values.shift());
      assert.notEqual(number, 8);
      assert.ok(number >= 0 && number <= 12);
    }
  }
  assert.equal(nextNumber([{ min: 8, max: 8 }, { min: 9, max: 9 }], 'random', 8, () => 0), 9);
  assert.equal(nextNumber([{ min: 8, max: 8 }, { min: 8, max: 8 }], 'random', 8, () => 0), 8);
});

test('two-number practice keeps alternating without retry loops, even with a constant random source', () => {
  const ranges = [{ min: 7, max: 8 }];
  let previous = 7;
  for (let index = 0; index < 100; index++) {
    const number = nextNumber(ranges, 'random', previous, () => 0);
    assert.equal(number, previous === 7 ? 8 : 7);
    previous = number;
  }
});
