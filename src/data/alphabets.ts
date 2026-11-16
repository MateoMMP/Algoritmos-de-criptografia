export const ALPHABETS = {
  ES_27: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  LATIN_26: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  PLAYFAIR_25: 'ABCDEFGHIKLMNOPQRSTUVWXYZ',
  ADFGX: 'ADFGX',
  ADFGVX: 'ADFGVX',
} as const;

export function normalizeText(value: string, alphabet: string = ALPHABETS.LATIN_26) {
  return [...value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()]
    .map((c) => c === 'J' && alphabet === ALPHABETS.PLAYFAIR_25 ? 'I' : c)
    .filter((c) => alphabet.includes(c))
    .join('');
}

export function validateAlphabet(alphabet: string) {
  const symbols = [...alphabet];
  return symbols.length > 1 && new Set(symbols).size === symbols.length;
}
