export const MAX_NUMBER = 999_999_999_999;

const SMALL = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis',
  'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós',
  'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete',
  'veintiocho', 'veintinueve',
];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

// A reading aid, not IPA. Latin American seseo; acute marks indicate stress.
const READING = {
  cero: 'се́ро', uno: 'у́но', un: 'ун', dos: 'дос', tres: 'трес',
  cuatro: 'куа́тро', cinco: 'си́нко', seis: 'сэйс', siete: 'сье́те',
  ocho: 'о́чо', nueve: 'нуэ́ве', diez: 'дьес', once: 'о́нсе', doce: 'до́се',
  trece: 'тре́се', catorce: 'като́рсе', quince: 'ки́нсе',
  dieciséis: 'дьесисэ́йс', diecisiete: 'дьесисье́те', dieciocho: 'дьесио́чо',
  diecinueve: 'дьесинуэ́ве', veinte: 'бэ́йнте', veintiuno: 'бэйнтиу́но',
  veintiún: 'бэйнтиу́н', veintidós: 'бэйнтидо́с', veintitrés: 'бэйнтитре́с',
  veinticuatro: 'бэйнтикуа́тро', veinticinco: 'бэйнтиси́нко',
  veintiséis: 'бэйнтисэ́йс', veintisiete: 'бэйнтисье́те',
  veintiocho: 'бэйнтио́чо', veintinueve: 'бэйнтинуэ́ве',
  treinta: 'тре́йнта', cuarenta: 'куаре́нта', cincuenta: 'синкуэ́нта',
  sesenta: 'сесе́нта', setenta: 'сете́нта', ochenta: 'оче́нта', noventa: 'нобэ́нта',
  cien: 'сьен', ciento: 'сье́нто', doscientos: 'досье́нтос',
  trescientos: 'тресье́нтос', cuatrocientos: 'куатросье́нтос',
  quinientos: 'кинье́нтос', seiscientos: 'сэйсье́нтос',
  setecientos: 'сетесье́нтос', ochocientos: 'очосье́нтос',
  novecientos: 'нобэсье́нтос', mil: 'мил', millón: 'мийо́н', millones: 'мийо́нес', y: 'и',
};

// Broad, word-by-word IPA with Latin American seseo and yeísmo.
// Phonemic /b d/ stay distinct from the context-dependent [β ð] allophones.
const IPA = {
  cero: 'ˈseɾo', uno: 'ˈuno', un: 'un', dos: 'dos', tres: 'tɾes',
  cuatro: 'ˈkwatɾo', cinco: 'ˈsinko', seis: 'sejs', siete: 'ˈsjete',
  ocho: 'ˈotʃo', nueve: 'ˈnwebe', diez: 'djes', once: 'ˈonse', doce: 'ˈdose',
  trece: 'ˈtɾese', catorce: 'kaˈtoɾse', quince: 'ˈkinse',
  dieciséis: 'djesiˈsejs', diecisiete: 'djesiˈsjete', dieciocho: 'djeˈsjotʃo',
  diecinueve: 'djesiˈnwebe', veinte: 'ˈbejnte', veintiuno: 'bejnˈtjuno',
  veintiún: 'bejnˈtjun', veintidós: 'bejntiˈdos', veintitrés: 'bejntiˈtɾes',
  veinticuatro: 'bejntiˈkwatɾo', veinticinco: 'bejntiˈsinko',
  veintiséis: 'bejntiˈsejs', veintisiete: 'bejntiˈsjete',
  veintiocho: 'bejnˈtjotʃo', veintinueve: 'bejntiˈnwebe',
  treinta: 'ˈtɾejnta', cuarenta: 'kwaˈɾenta', cincuenta: 'sinˈkwenta',
  sesenta: 'seˈsenta', setenta: 'seˈtenta', ochenta: 'oˈtʃenta', noventa: 'noˈbenta',
  cien: 'sjen', ciento: 'ˈsjento', doscientos: 'dosˈsjentos',
  trescientos: 'tɾesˈsjentos', cuatrocientos: 'kwatɾoˈsjentos',
  quinientos: 'kiˈnjentos', seiscientos: 'sejsˈsjentos',
  setecientos: 'seteˈsjentos', ochocientos: 'otʃoˈsjentos',
  novecientos: 'nobeˈsjentos', mil: 'mil', millón: 'miˈʝon', millones: 'miˈʝones', y: 'i',
};

export function isValidNumber(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_NUMBER;
}

export function isValidRange(min, max) {
  return isValidNumber(min) && isValidNumber(max) && min <= max;
}

function underThousand(number) {
  if (number < 30) return SMALL[number];
  if (number < 100) {
    const remainder = number % 10;
    return TENS[Math.floor(number / 10)] + (remainder ? ` y ${SMALL[remainder]}` : '');
  }
  if (number === 100) return 'cien';
  const remainder = number % 100;
  return HUNDREDS[Math.floor(number / 100)] + (remainder ? ` ${underThousand(remainder)}` : '');
}

function apocopate(words) {
  if (words.endsWith('veintiuno')) return words.slice(0, -9) + 'veintiún';
  if (words.endsWith('uno')) return words.slice(0, -3) + 'un';
  return words;
}

function underMillion(number) {
  if (number < 1000) return underThousand(number);
  const thousands = Math.floor(number / 1000);
  const remainder = number % 1000;
  const prefix = thousands === 1 ? 'mil' : `${apocopate(underThousand(thousands))} mil`;
  return prefix + (remainder ? ` ${underThousand(remainder)}` : '');
}

export function toSpanish(number) {
  if (!isValidNumber(number)) throw new RangeError(`Expected an integer from 0 to ${MAX_NUMBER}`);
  if (number < 1_000_000) return underMillion(number);
  const millions = Math.floor(number / 1_000_000);
  const remainder = number % 1_000_000;
  const prefix = millions === 1 ? 'un millón' : `${apocopate(underMillion(millions))} millones`;
  return prefix + (remainder ? ` ${underMillion(remainder)}` : '');
}

export function toReading(number) {
  return toSpanish(number).split(' ').map((word) => {
    if (!READING[word]) throw new Error(`Missing reading for ${word}`);
    return READING[word];
  }).join(' ');
}

export function toIPA(number) {
  return '/' + toSpanish(number).split(' ').map((word) => {
    if (!IPA[word]) throw new Error(`Missing IPA for ${word}`);
    return IPA[word];
  }).join(' ') + '/';
}

export function formatNumber(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

