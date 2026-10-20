import { formatNumber, isValidRange, toIPA, toReading, toSpanish } from './numbers.js';
import { getRanges, nextNumber, sanitizeSettings, STORAGE_KEY } from './state.js';

const $ = (id) => document.getElementById(id);
let stored;
try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* Storage is optional. */ }
const settings = sanitizeSettings(stored);
let current;
let revealed = false;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* Keep practicing in memory. */ }
}

function showError(message = '') {
  $('range-error').textContent = message;
  $('range-error').hidden = !message;
}

function reveal() {
  if (current === undefined) return;
  revealed = true;
  $('answer').hidden = false;
  $('advance').textContent = 'Следующее →';
  $('advance').setAttribute('aria-expanded', 'true');
  $('card').setAttribute('aria-expanded', 'true');
  $('card').setAttribute('aria-label', `Число ${formatNumber(current)}. ${toSpanish(current)}. Следующее число`);
}

function advance() {
  if (revealed) showNext();
  else reveal();
}

function showNext({ reset = false } = {}) {
  const ranges = getRanges(settings);
  current = nextNumber(ranges, settings.order, reset ? undefined : current);
  const empty = current === undefined;
  $('advance').disabled = empty;
  $('card').disabled = empty;
  $('answer').hidden = true;
  revealed = false;
  $('advance').textContent = 'Показать ответ';
  $('advance').setAttribute('aria-expanded', 'false');
  $('card').setAttribute('aria-expanded', 'false');

  if (empty) {
    $('number').textContent = '—';
    $('card').setAttribute('aria-label', 'Выберите диапазон');
    $('empty-hint').hidden = false;
    showError('Выберите хотя бы один диапазон.');
    return;
  }

  $('empty-hint').hidden = true;
  showError();
  $('number').textContent = formatNumber(current);
  $('number').className = `number${current >= 1_000_000_000 ? ' huge' : current >= 10_000_000 ? ' large' : current >= 10_000 ? ' medium' : ''}`;
  const spanish = toSpanish(current);
  $('spanish').textContent = spanish;
  $('ipa').textContent = toIPA(current);
  $('russian').textContent = toReading(current);
  $('card').classList.toggle('long-answer', spanish.length > 65);
  $('card').classList.toggle('very-long-answer', spanish.length > 130);
  $('card').setAttribute('aria-label', `Число ${formatNumber(current)}. Показать ответ`);
}

$('card').addEventListener('click', advance);
$('advance').addEventListener('click', advance);

document.querySelectorAll('input[name="range"]').forEach((input) => {
  input.checked = settings.selected.includes(input.value);
  input.addEventListener('change', () => {
    settings.selected = [...document.querySelectorAll('input[name="range"]:checked')].map((item) => item.value);
    $('custom-form').hidden = !settings.selected.includes('custom');
    save();
    showNext({ reset: true });
  });
});

document.querySelectorAll('input[name="order"]').forEach((input) => {
  input.checked = input.value === settings.order;
  input.addEventListener('change', () => {
    settings.order = input.value;
    save();
    showNext({ reset: true });
  });
});

function applyTheme() {
  if (settings.theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = settings.theme;
}
applyTheme();
document.querySelectorAll('input[name="theme"]').forEach((input) => {
  input.checked = input.value === settings.theme;
  input.addEventListener('change', () => {
    settings.theme = input.value;
    applyTheme();
    save();
  });
});

const sheet = $('settings');
$('open-settings').addEventListener('click', () => sheet.showModal());
$('close-settings').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (event) => { if (event.target === sheet) sheet.close(); });

$('show-russian').checked = settings.showRussian;
$('russian').hidden = !settings.showRussian;
$('show-russian').addEventListener('change', (event) => {
  settings.showRussian = event.target.checked;
  $('russian').hidden = !settings.showRussian;
  save();
});

$('custom-min').value = settings.customMin;
$('custom-max').value = settings.customMax;
$('custom-form').hidden = !settings.selected.includes('custom');
$('custom-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const min = $('custom-min').valueAsNumber;
  const max = $('custom-max').valueAsNumber;
  if (!isValidRange(min, max)) {
    showError('От 0 до 999 999 999 999. Начало не должно быть больше конца.');
    return;
  }
  settings.customMin = min;
  settings.customMax = max;
  save();
  showNext({ reset: true });
});

document.addEventListener('keydown', (event) => {
  if (sheet.open || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.matches('input, select, textarea') || target.isContentEditable)) return;
  if (event.code === 'Space') {
    if (target instanceof HTMLElement && target.closest('button, a')) return;
    event.preventDefault();
    advance();
  } else if (event.code === 'ArrowRight') {
    event.preventDefault();
    showNext();
  }
});

showNext({ reset: true });
