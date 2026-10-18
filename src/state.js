import { isValidRange } from './numbers.js';

export const STORAGE_KEY = 'numero-settings-v2';
export const RANGES = {
  units: { min: 0, max: 9 },
  tens: { min: 10, max: 99 },
  hundreds: { min: 100, max: 999 },
  thousands: { min: 1000, max: 999_999 },
  millions: { min: 1_000_000, max: 9_999_999 },
  tenMillions: { min: 10_000_000, max: 99_999_999 },
  hundredMillions: { min: 100_000_000, max: 999_999_999 },
  billions: { min: 1_000_000_000, max: 999_999_999_999 },
};

export function sanitizeSettings(raw) {
  return {
    selected: Array.isArray(raw?.selected)
      ? [...new Set(raw.selected.filter((key) => typeof key === 'string' && (Object.hasOwn(RANGES, key) || key === 'custom')))]
      : ['units', 'tens', 'hundreds'],
    order: raw?.order === 'ascending' ? 'ascending' : 'random',
    showRussian: raw?.showRussian === true,
    customMin: isValidRange(raw?.customMin, raw?.customMax) ? raw.customMin : 0,
    customMax: isValidRange(raw?.customMin, raw?.customMax) ? raw.customMax : 1000,
  };
}

export function getRanges(settings) {
  return settings.selected.map((key) => key === 'custom'
    ? { min: settings.customMin, max: settings.customMax }
    : RANGES[key]);
}

export function mergeRanges(ranges) {
  const sorted = ranges.map((range) => ({ ...range })).sort((a, b) => a.min - b.min);
  const merged = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range.min <= last.max + 1) last.max = Math.max(last.max, range.max);
    else merged.push(range);
  }
  return merged;
}

export function nextNumber(ranges, order, previous, random = Math.random) {
  if (!ranges.length) return undefined;
  if (order === 'ascending') {
    const merged = mergeRanges(ranges);
    if (previous === undefined) return merged[0].min;
    for (const { min, max } of merged) {
      if (previous < min) return min;
      if (previous < max) return previous + 1;
    }
    return merged[0].min;
  }
  // Pick a selected band first, so millions don't drown out smaller numbers.
  const { min, max } = ranges[Math.floor(random() * ranges.length)];
  return min + Math.floor(random() * (max - min + 1));
}
