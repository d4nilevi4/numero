import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, isValidRange, MAX_NUMBER, toIPA, toReading, toSpanish } from '../src/numbers.js';

const examples = new Map([
  [0, 'cero'], [1, 'uno'], [9, 'nueve'], [10, 'diez'], [15, 'quince'],
  [16, 'dieciséis'], [20, 'veinte'], [21, 'veintiuno'], [22, 'veintidós'],
  [23, 'veintitrés'], [26, 'veintiséis'], [29, 'veintinueve'], [30, 'treinta'],
  [31, 'treinta y uno'], [99, 'noventa y nueve'], [100, 'cien'], [101, 'ciento uno'],
  [121, 'ciento veintiuno'], [200, 'doscientos'], [300, 'trescientos'],
  [347, 'trescientos cuarenta y siete'], [400, 'cuatrocientos'], [500, 'quinientos'],
  [600, 'seiscientos'], [700, 'setecientos'], [800, 'ochocientos'], [900, 'novecientos'],
  [999, 'novecientos noventa y nueve'], [1000, 'mil'], [1001, 'mil uno'],
  [1100, 'mil cien'], [1101, 'mil ciento uno'], [2000, 'dos mil'],
  [21_000, 'veintiún mil'], [21_001, 'veintiún mil uno'],
  [31_000, 'treinta y un mil'], [100_000, 'cien mil'], [100_001, 'cien mil uno'],
  [101_000, 'ciento un mil'], [121_021, 'ciento veintiún mil veintiuno'],
  [500_500, 'quinientos mil quinientos'],
  [999_999, 'novecientos noventa y nueve mil novecientos noventa y nueve'],
  [1_000_000, 'un millón'], [1_000_001, 'un millón uno'],
  [1_001_000, 'un millón mil'], [2_000_100, 'dos millones cien'],
  [10_000_000, 'diez millones'], [21_000_000, 'veintiún millones'],
  [31_000_000, 'treinta y un millones'], [100_000_000, 'cien millones'],
  [101_000_000, 'ciento un millones'], [1_000_000_000, 'mil millones'],
  [1_001_000_000, 'mil un millones'], [21_001_000_000, 'veintiún mil un millones'],
  [999_999_999_999, 'novecientos noventa y nueve mil novecientos noventa y nueve millones novecientos noventa y nueve mil novecientos noventa y nueve'],
]);

test('Spanish cardinal forms, accents, irregular hundreds and apocope before mil', () => {
  for (const [number, expected] of examples) assert.equal(toSpanish(number), expected, String(number));
});

test('all numbers below a million and a large-number sample have complete readings', () => {
  function check(number) {
    const spanish = toSpanish(number);
    assert.match(spanish, /^[a-záéíóúñ]+(?: [a-záéíóúñ]+)*$/u);
    assert.doesNotMatch(spanish, /(?:undefined|uno mil|ciento mil| y mil|mil cero)/u);
    assert.match(toReading(number), /^[а-яё\u0301]+(?: [а-яё\u0301]+)*$/u);
    assert.match(toIPA(number), /^\/[a-zɾʃʝˈ]+(?: [a-zɾʃʝˈ]+)*\/$/u);
  }
  for (let number = 0; number < 1_000_000; number++) check(number);
  for (const number of examples.keys()) check(number);
  // A repeatable sample across all twelve digits, without looping a trillion times.
  let seed = 17;
  for (let index = 0; index < 10000; index++) {
    seed = (seed * 48271) % 2147483647;
    check(Math.floor(seed / 2147483647 * MAX_NUMBER));
  }
});

test('rejects values outside the integer domain', () => {
  for (const value of [-1, MAX_NUMBER + 1, 1.2, NaN, Infinity, '21', null]) {
    assert.throws(() => toSpanish(value), RangeError);
  }
  assert.equal(isValidRange(0, MAX_NUMBER), true);
  assert.equal(isValidRange(21, 21), true);
  assert.equal(isValidRange(10, 2), false);
  assert.equal(isValidRange(0, 1.5), false);
});

test('formatting and reading retain stress marks and thousands grouping', () => {
  assert.equal(formatNumber(MAX_NUMBER), '999\u202f999\u202f999\u202f999');
  assert.equal(toReading(21_001), 'бэйнтиу́н мил у́но');
  assert.equal(toReading(347), 'тресье́нтос куаре́нта и сье́те');
  assert.equal(toIPA(21_000_001), '/bejnˈtjun miˈʝones ˈuno/');
  assert.equal(toIPA(1_000_000_000), '/mil miˈʝones/');
});

test('IPA preserves diphthongs, lexical stress and apocope in composite numbers', () => {
  const examples = new Map([
    [16, '/djesiˈsejs/'], [18, '/djeˈsjotʃo/'],
    [21, '/bejnˈtjuno/'], [28, '/bejnˈtjotʃo/'],
    [31, '/ˈtɾejnta i ˈuno/'], [101, '/ˈsjento ˈuno/'],
    [500, '/kiˈnjentos/'], [700, '/seteˈsjentos/'],
    [900, '/nobeˈsjentos/'], [31_000, '/ˈtɾejnta i un mil/'],
    [21_000_000, '/bejnˈtjun miˈʝones/'],
    [1_001_000_001, '/mil un miˈʝones ˈuno/'],
  ]);
  for (const [number, expected] of examples) assert.equal(toIPA(number), expected, String(number));
});
