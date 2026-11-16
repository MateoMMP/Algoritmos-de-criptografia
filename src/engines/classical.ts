import { ALPHABETS, normalizeText } from '../data/alphabets';
import { mod, modInverse } from '../utils/math';
import { step, type EngineResult, type TraceStep } from '../domain/engine';

export interface TextParams {
  key: string;
  decrypt: boolean;
  alphabet?: string;
}
const result = (
  output: string,
  normalizedInput: string,
  trace: TraceStep[],
  warnings: string[] = [],
): EngineResult<string> => ({ output, normalizedInput, trace, warnings });

export function caesar(input: string, params: TextParams) {
  const a = params.alphabet ?? ALPHABETS.ES_27,
    text = normalizeText(input, a),
    k = Number.parseInt(params.key, 10) || 3,
    d = params.decrypt ? -1 : 1;
  const trace: TraceStep[] = [];
  const output = [...text]
    .map((c, i) => {
      const m = a.indexOf(c),
        v = mod(m + d * k, a.length),
        o = a[v] ?? '';
      trace.push(
        step(
          `char-${i}`,
          `Símbolo ${i + 1}`,
          `${c} ocupa el índice ${m}; se aplica el desplazamiento ${d * k}.`,
          c,
          o,
          `${v}=(${m}${d > 0 ? '+' : '-'}${Math.abs(k)}) mod ${a.length}`,
        ),
      );
      return o;
    })
    .join('');
  return result(output, text, trace);
}

export function scytale(input: string, params: TextParams) {
  const rows = Math.max(2, Number.parseInt(params.key, 10) || 4),
    text = input.toUpperCase(),
    trace: TraceStep[] = [];
  if (!params.decrypt) {
    const cols = Math.ceil(text.length / rows),
      padded = text.padEnd(rows * cols, '·');
    const out = Array.from({ length: cols }, (_, c) =>
      Array.from({ length: rows }, (_, r) => padded[r * cols + c]).join(''),
    ).join('');
    trace.push(
      step(
        'matrix',
        'Escritura por filas',
        `Se forma una matriz de ${rows}×${cols}.`,
        text,
        padded,
      ),
      step(
        'read',
        'Lectura por columnas',
        'Se recorren las columnas de arriba abajo.',
        padded,
        out,
      ),
    );
    return result(
      out,
      text,
      trace,
      padded.length > text.length
        ? [`Se añadieron ${padded.length - text.length} caracteres de relleno.`]
        : [],
    );
  }
  const cols = Math.ceil(text.length / rows);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
  let p = 0;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) grid[r]![c] = text[p++] ?? '';
  const out = grid
    .map((r) => r.join(''))
    .join('')
    .replace(/·+$/, '');
  trace.push(
    step(
      'fill',
      'Reconstrucción por columnas',
      `Se rellenan ${cols} columnas.`,
      text,
      grid.map((r) => r.join('')).join('|'),
    ),
    step('read', 'Lectura por filas', 'Se invierte el recorrido.', text, out),
  );
  return result(out, text, trace);
}

export function railFence(input: string, params: TextParams) {
  const depth = Math.max(2, Number.parseInt(params.key, 10) || 3),
    text = input.toUpperCase();
  const pattern = Array.from({ length: text.length }, (_, i) => {
    const cycle = 2 * (depth - 1),
      x = i % cycle;
    return x < depth ? x : cycle - x;
  });
  if (!params.decrypt) {
    const out = Array.from({ length: depth }, (_, r) =>
      [...text].filter((_, i) => pattern[i] === r).join(''),
    ).join('');
    return result(out, text, [
      step('path', 'Trayectoria zigzag', `Rieles: ${pattern.join(' → ')}`, text, out),
    ]);
  }
  const counts = Array.from({ length: depth }, (_, r) => pattern.filter((x) => x === r).length),
    rails: string[][] = [];
  let p = 0;
  for (const c of counts) {
    rails.push([...text.slice(p, p + c)]);
    p += c;
  }
  const out = pattern.map((r) => rails[r]!.shift() ?? '').join('');
  return result(out, text, [
    step('rebuild', 'Reconstrucción de rieles', `Longitudes: ${counts.join(', ')}`, text, out),
  ]);
}

export function polybius(input: string, params: TextParams, size = 5) {
  const alphabet =
    size === 5 ? ALPHABETS.PLAYFAIR_25 : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijkl';
  const text = params.decrypt ? input.replace(/\D/g, '') : normalizeText(input, alphabet);
  if (params.decrypt) {
    let out = '';
    const trace: TraceStep[] = [];
    for (let i = 0; i < text.length; i += 2) {
      const r = Number(text[i]) - 1,
        c = Number(text[i + 1]) - 1,
        o = alphabet[r * size + c] ?? '?';
      out += o;
      trace.push(
        step(
          `pair-${i / 2}`,
          `Par ${text.slice(i, i + 2)}`,
          `Fila ${r + 1}, columna ${c + 1}.`,
          text.slice(i, i + 2),
          o,
        ),
      );
    }
    return result(
      out,
      text,
      trace,
      text.length % 2 ? ['El último dígito no forma un par completo.'] : [],
    );
  }
  const trace: TraceStep[] = [];
  const out = [...text]
    .map((c, i) => {
      const x = alphabet.indexOf(c),
        o = `${Math.floor(x / size) + 1}${(x % size) + 1}`;
      trace.push(step(`cell-${i}`, c, `Índice ${x}: fila ${o[0]}, columna ${o[1]}.`, c, o));
      return o;
    })
    .join(' ');
  return result(out, text, trace);
}

export function vigenere(input: string, params: TextParams) {
  const a = params.alphabet ?? ALPHABETS.LATIN_26,
    text = normalizeText(input, a),
    key = normalizeText(params.key || 'CLAVE', a);
  if (!key) throw new Error('La clave debe contener símbolos del alfabeto.');
  const trace: TraceStep[] = [];
  const out = [...text]
    .map((c, i) => {
      const m = a.indexOf(c),
        k = a.indexOf(key[i % key.length]!),
        v = mod(m + (params.decrypt ? -k : k), a.length),
        o = a[v] ?? '';
      trace.push(
        step(
          `char-${i}`,
          `Posición ${i + 1}`,
          `${c} (${m}) con ${key[i % key.length]} (${k}).`,
          c,
          o,
          params.decrypt ? `m=(${m}-${k}) mod ${a.length}` : `c=(${m}+${k}) mod ${a.length}`,
        ),
      );
      return o;
    })
    .join('');
  return result(out, text, trace);
}

export function affine(input: string, params: TextParams) {
  const a = ALPHABETS.ES_27,
    text = normalizeText(input, a),
    parts = params.key.split(/[,; ]+/),
    mul = Number(parts[0] ?? 7),
    add = Number(parts[1] ?? 3);
  let inv = 0;
  try {
    inv = Number(modInverse(BigInt(mul), BigInt(a.length)));
  } catch {
    throw new Error(`a=${mul} no es coprimo con ${a.length}; la cifra no sería reversible.`);
  }
  const trace: TraceStep[] = [];
  const out = [...text]
    .map((c, i) => {
      const x = a.indexOf(c),
        v = params.decrypt ? mod(inv * (x - add), a.length) : mod(mul * x + add, a.length),
        o = a[v] ?? '';
      trace.push(
        step(
          `char-${i}`,
          `Símbolo ${i + 1}`,
          `a=${mul}, b=${add}, a⁻¹=${inv}.`,
          c,
          o,
          params.decrypt
            ? `m=${inv}(${x}-${add}) mod ${a.length}`
            : `c=(${mul}·${x}+${add}) mod ${a.length}`,
        ),
      );
      return o;
    })
    .join('');
  return result(out, text, trace);
}

function order(key: string) {
  return [...key]
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.localeCompare(b.c) || a.i - b.i)
    .map((x) => x.i);
}
export function columnar(input: string, params: TextParams) {
  const text = input.replace(/\s/g, '').toUpperCase(),
    key = normalizeText(params.key || 'CLAVE'),
    cols = key.length,
    ranking = order(key);
  if (!params.decrypt) {
    const rows = Math.ceil(text.length / cols),
      out = ranking
        .map((c) => Array.from({ length: rows }, (_, r) => text[r * cols + c] ?? '').join(''))
        .join('');
    return result(out, text, [
      step(
        'rank',
        'Ranking estable',
        `${key}: ${ranking.map((x) => x + 1).join('-')}`,
        key,
        ranking.join(','),
      ),
      step('read', 'Lectura de columnas', 'Las columnas se leen por orden de clave.', text, out),
    ]);
  }
  const base = Math.floor(text.length / cols),
    extra = text.length % cols,
    lengths = Array.from({ length: cols }, (_, c) => base + (c < extra ? 1 : 0)),
    columns = Array(cols).fill('') as string[];
  let p = 0;
  for (const c of ranking) {
    columns[c] = text.slice(p, p + lengths[c]!);
    p += lengths[c]!;
  }
  let out = '';
  for (let r = 0; r < Math.ceil(text.length / cols); r++)
    for (let c = 0; c < cols; c++) out += columns[c]?.[r] ?? '';
  return result(out, text, [
    step(
      'restore',
      'Restauración de columnas',
      `Longitudes: ${lengths.join(', ')}`,
      text,
      columns.join('|'),
    ),
    step('rows', 'Lectura por filas', 'Se recompone el texto original.', text, out),
  ]);
}

const ADFGVX_LABELS = 'ADFGVX';
const ADFGVX_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface AdfgvxToken {
  symbol: string;
  pair: string;
  row: number;
  column: number;
}

export interface AdfgvxState {
  squareKey: string;
  transpositionKey: string;
  square: string;
  normalizedInput: string;
  fractionated: string;
  output: string;
  tokens: AdfgvxToken[];
}

const normalizeAdfgvx = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export function parseAdfgvxKeys(key: string) {
  const [rawSquare = '', ...rest] = key.split(',');
  const squareKey = normalizeAdfgvx(rawSquare || 'CLAVE');
  const transpositionKey = normalizeAdfgvx(rest.join(',') || 'ORDEN');
  if (!squareKey || !transpositionKey) {
    throw new Error('ADFGVX necesita dos claves separadas por una coma.');
  }
  return { squareKey, transpositionKey };
}

export function buildAdfgvxSquare(squareKey: string) {
  return [...new Set([...normalizeAdfgvx(squareKey), ...ADFGVX_ALPHABET])].join('').slice(0, 36);
}

const transposeAdfgvx = (text: string, key: string) => {
  const cols = key.length;
  const rows = Math.ceil(text.length / cols);
  return order(key)
    .map((column) =>
      Array.from({ length: rows }, (_, row) => text[row * cols + column] ?? '').join(''),
    )
    .join('');
};

const undoAdfgvxTransposition = (text: string, key: string) => {
  const cols = key.length;
  const base = Math.floor(text.length / cols);
  const extra = text.length % cols;
  const lengths = Array.from({ length: cols }, (_, column) => base + (column < extra ? 1 : 0));
  const columns = Array<string>(cols).fill('');
  let cursor = 0;
  for (const column of order(key)) {
    columns[column] = text.slice(cursor, cursor + (lengths[column] ?? 0));
    cursor += lengths[column] ?? 0;
  }
  let restored = '';
  for (let row = 0; row < Math.ceil(text.length / cols); row++) {
    for (let column = 0; column < cols; column++) restored += columns[column]?.[row] ?? '';
  }
  return restored;
};

export function getAdfgvxState(input: string, key: string, decrypt = false): AdfgvxState {
  const { squareKey, transpositionKey } = parseAdfgvxKeys(key);
  const square = buildAdfgvxSquare(squareKey);
  if (!decrypt) {
    const normalizedInput = normalizeAdfgvx(input);
    const tokens = [...normalizedInput].map((symbol) => {
      const index = square.indexOf(symbol);
      const row = Math.floor(index / 6);
      const column = index % 6;
      return {
        symbol,
        pair: `${ADFGVX_LABELS[row]}${ADFGVX_LABELS[column]}`,
        row,
        column,
      };
    });
    const fractionated = tokens.map((token) => token.pair).join('');
    return {
      squareKey,
      transpositionKey,
      square,
      normalizedInput,
      fractionated,
      output: transposeAdfgvx(fractionated, transpositionKey),
      tokens,
    };
  }
  const normalizedInput = [...input.toUpperCase()]
    .filter((symbol) => ADFGVX_LABELS.includes(symbol))
    .join('');
  const fractionated = undoAdfgvxTransposition(normalizedInput, transpositionKey);
  const tokens: AdfgvxToken[] = [];
  for (let index = 0; index < fractionated.length; index += 2) {
    const pair = fractionated.slice(index, index + 2);
    const row = ADFGVX_LABELS.indexOf(pair[0] ?? '');
    const column = ADFGVX_LABELS.indexOf(pair[1] ?? '');
    tokens.push({ symbol: square[row * 6 + column] ?? '?', pair, row, column });
  }
  return {
    squareKey,
    transpositionKey,
    square,
    normalizedInput,
    fractionated,
    output: tokens.map((token) => token.symbol).join(''),
    tokens,
  };
}

export function adfgvx(input: string, params: TextParams): EngineResult<string> {
  const state = getAdfgvxState(input, params.key, params.decrypt);
  const squareRows = Array.from({ length: 6 }, (_, row) =>
    state.square.slice(row * 6, row * 6 + 6),
  );
  const trace = [
    step(
      'adfgvx-square',
      'Clave 1: construir el tablero',
      `Se eliminan repeticiones de ${state.squareKey} y se completa el alfabeto de 36 símbolos.`,
      state.squareKey,
      squareRows.join(' | '),
      'clave 1 → tablero 6×6',
    ),
  ];
  if (params.decrypt) {
    trace.push(
      step(
        'adfgvx-untranspose',
        'Clave 2: reconstruir las columnas',
        `La clave ${state.transpositionKey} deshace la transposición y recupera los pares originales.`,
        state.normalizedInput,
        state.fractionated,
        'criptograma → pares ADFGVX',
      ),
    );
  }
  state.tokens.forEach((token, index) => {
    trace.push(
      step(
        `adfgvx-token-${index}`,
        params.decrypt ? `${token.pair} → ${token.symbol}` : `${token.symbol} → ${token.pair}`,
        `Fila ${ADFGVX_LABELS[token.row]}, columna ${ADFGVX_LABELS[token.column]} del tablero creado con la primera clave.`,
        params.decrypt ? token.pair : token.symbol,
        params.decrypt ? token.symbol : token.pair,
        'par = etiqueta de fila || etiqueta de columna',
      ),
    );
  });
  if (!params.decrypt) {
    trace.push(
      step(
        'adfgvx-transpose',
        'Clave 2: transponer las columnas',
        `Se escribe el texto fraccionado por filas bajo ${state.transpositionKey} y se leen las columnas por orden alfabético estable.`,
        state.fractionated,
        state.output,
        'clave 2 → orden de columnas',
      ),
    );
  }
  const warnings =
    state.fractionated.length % 2
      ? ['El texto fraccionado termina con una coordenada incompleta.']
      : [];
  return result(state.output, state.normalizedInput, trace, warnings);
}

export const SYNDICAL_CODEBOOK = [
  'ALERTA',
  'AVANZAR',
  'DETENER',
  'ENCUENTRO',
  'GENERAL',
  'HUELGA',
  'MENSAJE',
  'RETIRADA',
  'UNIDAD',
] as const;

export interface SyndicalToken {
  source: string;
  target: string;
  sourceIndex: number;
  targetIndex: number;
  coded: boolean;
}

const normalizeSyndicalWords = (input: string) =>
  input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean);

export function getSyndicalTokens(input: string, key: string, decrypt = false) {
  const shift = Number.parseInt(key, 10) || 0;
  const direction = decrypt ? -1 : 1;
  return normalizeSyndicalWords(input).map<SyndicalToken>((source) => {
    const sourceIndex = SYNDICAL_CODEBOOK.indexOf(source as (typeof SYNDICAL_CODEBOOK)[number]);
    if (sourceIndex < 0) {
      return { source, target: source, sourceIndex: -1, targetIndex: -1, coded: false };
    }
    const targetIndex = mod(sourceIndex + direction * shift, SYNDICAL_CODEBOOK.length);
    return {
      source,
      target: SYNDICAL_CODEBOOK[targetIndex] ?? source,
      sourceIndex,
      targetIndex,
      coded: true,
    };
  });
}

export function syndicalCode(input: string, params: TextParams): EngineResult<string> {
  const shift = Number.parseInt(params.key, 10) || 0;
  const tokens = getSyndicalTokens(input, params.key, params.decrypt);
  const trace = [
    step(
      'syndical-book',
      'Preparar el libro compartido',
      `El libro contiene ${SYNDICAL_CODEBOOK.length} palabras en un orden acordado. Las posiciones son circulares.`,
      SYNDICAL_CODEBOOK.join(', '),
      SYNDICAL_CODEBOOK.map((word, index) => `${index + 1}:${word}`).join(' · '),
      'posiciones 1…N',
    ),
  ];
  tokens.forEach((token, index) => {
    trace.push(
      step(
        `syndical-${index}`,
        token.coded ? `${token.source} → ${token.target}` : `${token.source}: sin entrada`,
        token.coded
          ? `${token.source} ocupa la posición ${token.sourceIndex + 1}. Se ${params.decrypt ? 'resta' : 'suma'} ${Math.abs(shift)} y se obtiene la posición ${token.targetIndex + 1}, donde está ${token.target}.`
          : `${token.source} no figura en el libro reducido y permanece literal.`,
        token.source,
        token.target,
        token.coded
          ? `p' = ((p−1) ${params.decrypt ? '−' : '+'} ${Math.abs(shift)}) mod ${SYNDICAL_CODEBOOK.length} + 1`
          : 'sin sustitución',
      ),
    );
  });
  return result(
    tokens.map((token) => token.target).join(' '),
    normalizeSyndicalWords(input).join(' '),
    trace,
    tokens.some((token) => !token.coded)
      ? ['Las palabras ausentes del libro permanecen literales.']
      : [],
  );
}

export function xorCipher(input: string, params: TextParams) {
  const enc = new TextEncoder(),
    data = params.decrypt
      ? Uint8Array.from((input.match(/[0-9a-f]{2}/gi) ?? []).map((x) => parseInt(x, 16)))
      : enc.encode(input),
    key = enc.encode(params.key || 'CLAVE');
  const bytes = data.map((b, i) => b ^ key[i % key.length]!);
  const output = params.decrypt
    ? new TextDecoder().decode(bytes)
    : [...bytes]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
  return result(
    output,
    input,
    [
      step(
        'xor',
        'XOR por bytes',
        `Se repite una clave de ${key.length} bytes.`,
        [...data].join(' '),
        [...bytes].join(' '),
        'Cᵢ=Mᵢ XOR Kᵢ',
      ),
    ],
    ['Una clave repetida no es One-Time Pad; se muestra solo con fin educativo.'],
  );
}

export interface NomenclatorEntry {
  phrase: string;
  code: string;
}

export interface NomenclatorToken {
  source: string;
  target: string;
  coded: boolean;
}

export function parseNomenclatorKey(key: string): NomenclatorEntry[] {
  const entries = key
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      if (separator < 1) return null;
      const phrase = part.slice(0, separator).trim().toUpperCase().replace(/\s+/g, ' ');
      const code = part
        .slice(separator + 1)
        .trim()
        .toUpperCase();
      return phrase && code ? { phrase, code } : null;
    })
    .filter((entry): entry is NomenclatorEntry => entry !== null);
  return entries.sort((a, b) => b.phrase.split(' ').length - a.phrase.split(' ').length);
}

export function tokenizeNomenclator(
  input: string,
  key: string,
  decrypt = false,
): NomenclatorToken[] {
  const entries = parseNomenclatorKey(key);
  const words = input.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const tokens: NomenclatorToken[] = [];
  if (decrypt) {
    const byCode = new Map(entries.map((entry) => [entry.code, entry.phrase]));
    for (const word of words) {
      const phrase = byCode.get(word);
      tokens.push({ source: word, target: phrase ?? word, coded: phrase !== undefined });
    }
    return tokens;
  }
  for (let index = 0; index < words.length;) {
    const entry = entries.find(({ phrase }) => {
      const parts = phrase.split(' ');
      return parts.every((part, offset) => words[index + offset] === part);
    });
    if (entry) {
      tokens.push({ source: entry.phrase, target: entry.code, coded: true });
      index += entry.phrase.split(' ').length;
    } else {
      const word = words[index] ?? '';
      tokens.push({ source: word, target: word, coded: false });
      index += 1;
    }
  }
  return tokens;
}

export function nomenclator(input: string, params: TextParams): EngineResult<string> {
  const entries = parseNomenclatorKey(params.key);
  if (!entries.length) throw new Error('Define al menos una entrada como PALABRA=CODIGO.');
  const tokens = tokenizeNomenclator(input, params.key, params.decrypt);
  const output = tokens.map((token) => token.target).join(' ');
  const trace = tokens.map((token, index) =>
    step(
      `nomenclator-${index}`,
      `${token.source} → ${token.target}`,
      token.coded
        ? params.decrypt
          ? `El grupo ${token.source} figura en el libro y recupera la unidad «${token.target}».`
          : `Se elige primero la entrada más larga del libro: «${token.source}» se sustituye como una unidad.`
        : `«${token.source}» no figura en este libro reducido, por lo que permanece literal.`,
      token.source,
      token.target,
      token.coded ? 'sustitución por libro de códigos' : 'sin entrada: copia literal',
    ),
  );
  return result(
    output,
    input.trim().toUpperCase().replace(/\s+/g, ' '),
    trace,
    tokens.some((token) => !token.coded)
      ? ['Las unidades sin entrada permanecen literales en este libro reducido.']
      : [],
  );
}

export interface AlbertiParameters {
  outerAnchor: string;
  innerAnchor: string;
  period: number;
  increment: number;
  direction: 'izquierda' | 'derecha';
  initialShift: number;
}

export interface AlbertiToken {
  input: string;
  output: string;
  shift: number;
  turn: number;
}

export function parseAlbertiKey(key: string): AlbertiParameters {
  const parts = key.split(',').map((part) => part.trim());
  const alignment = parts[0]?.match(/([A-Za-z])\s*[-:=]?\s*([A-Za-z])/);
  const outerAnchor = (alignment?.[1] ?? 'M').toUpperCase();
  const innerAnchor = (alignment?.[2] ?? 'B').toUpperCase();
  const period = Math.max(1, Number.parseInt(parts[1] ?? '4', 10) || 4);
  const turnPart = parts[2] ?? '3i';
  const increment = Math.max(0, Number.parseInt(turnPart, 10) || 3);
  const direction = /i|izq|left/i.test(turnPart) ? 'izquierda' : 'derecha';
  return {
    outerAnchor,
    innerAnchor,
    period,
    increment,
    direction,
    initialShift: mod(
      ALPHABETS.LATIN_26.indexOf(innerAnchor) - ALPHABETS.LATIN_26.indexOf(outerAnchor),
      26,
    ),
  };
}

export function transformAlberti(input: string, key: string, decrypt = false): AlbertiToken[] {
  const params = parseAlbertiKey(key);
  const text = normalizeText(input, ALPHABETS.LATIN_26);
  const direction = params.direction === 'izquierda' ? -1 : 1;
  return [...text].map((char, index) => {
    const turn = Math.floor(index / params.period);
    const shift = mod(params.initialShift + turn * direction * params.increment, 26);
    const sourceIndex = ALPHABETS.LATIN_26.indexOf(char);
    const outputIndex = mod(sourceIndex + (decrypt ? -shift : shift), 26);
    return { input: char, output: ALPHABETS.LATIN_26[outputIndex] ?? '', shift, turn };
  });
}

export function alberti(input: string, params: TextParams): EngineResult<string> {
  const settings = parseAlbertiKey(params.key);
  const tokens = transformAlberti(input, params.key, params.decrypt);
  const trace = tokens.map((token, index) =>
    step(
      `alberti-${index}`,
      `Posición ${index + 1}: ${token.input} → ${token.output}`,
      `Giro ${token.turn}: desplazamiento activo ${token.shift}. El disco gira cada ${settings.period} símbolos, ${settings.increment} posiciones hacia la ${settings.direction}.`,
      token.input,
      token.output,
      params.decrypt
        ? `exterior = interior − ${token.shift} (mod 26)`
        : `interior = exterior + ${token.shift} (mod 26)`,
    ),
  );
  return result(tokens.map((token) => token.output).join(''), normalizeText(input), trace);
}

export interface PortaToken {
  input: string;
  key: string;
  output: string;
  row: number;
}

export function transformPorta(input: string, keyValue: string): PortaToken[] {
  const text = normalizeText(input, ALPHABETS.LATIN_26);
  const key = normalizeText(keyValue || 'CLAVE', ALPHABETS.LATIN_26);
  if (!key) throw new Error('La clave debe contener letras.');
  return [...text].map((char, index) => {
    const keyChar = key[index % key.length] ?? 'A';
    const row = Math.floor(ALPHABETS.LATIN_26.indexOf(keyChar) / 2);
    const value = ALPHABETS.LATIN_26.indexOf(char);
    const outputIndex = value < 13 ? 13 + mod(value + row, 13) : mod(value - 13 - row, 13);
    return { input: char, key: keyChar, output: ALPHABETS.LATIN_26[outputIndex] ?? '', row };
  });
}

export function porta(input: string, params: TextParams): EngineResult<string> {
  const tokens = transformPorta(input, params.key);
  const trace = tokens.map((token, index) =>
    step(
      `porta-${index}`,
      `Posición ${index + 1}: ${token.input} → ${token.output}`,
      `La letra de clave ${token.key} selecciona la fila ${ALPHABETS.LATIN_26[token.row * 2]}${ALPHABETS.LATIN_26[token.row * 2 + 1]} (número ${token.row + 1}).`,
      token.input,
      token.output,
      'Porta es recíproco: la misma operación cifra y descifra',
    ),
  );
  return result(tokens.map((token) => token.output).join(''), normalizeText(input), trace);
}

export const CT46_CODE_BY_SYMBOL: Readonly<Record<string, string>> = {
  A: '5',
  E: '0',
  I: '1',
  N: '7',
  O: '9',
  R: '2',
  B: '85',
  C: '80',
  D: '81',
  F: '87',
  G: '89',
  H: '82',
  J: '88',
  K: '83',
  L: '86',
  M: '84',
  P: '35',
  Q: '30',
  S: '31',
  T: '37',
  U: '39',
  V: '32',
  W: '38',
  X: '33',
  Y: '36',
  Z: '34',
  ' ': '65',
  '.': '60',
  ',': '61',
  ':': '67',
  '?': '69',
  '/': '62',
  '(': '68',
  ')': '63',
  '"': '66',
  CODE: '64',
  '0': '45',
  '1': '40',
  '2': '41',
  '3': '47',
  '4': '49',
  '5': '42',
  '6': '48',
  '7': '43',
  '8': '46',
  '9': '44',
};

const CT46_SYMBOL_BY_CODE = Object.fromEntries(
  Object.entries(CT46_CODE_BY_SYMBOL).map(([symbol, code]) => [code, symbol]),
) as Record<string, string>;
const CT46_PREFIXES = new Set(['8', '3', '6', '4']);

export function encodeCt46Tokens(input: string): Array<{ symbol: string; code: string }> {
  const text = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[“”]/g, '"');
  const tokens: Array<{ symbol: string; code: string }> = [];
  for (let index = 0; index < text.length;) {
    const symbol = text.startsWith('CODE', index) ? 'CODE' : (text[index] ?? '');
    const code = CT46_CODE_BY_SYMBOL[symbol];
    if (code) tokens.push({ symbol, code });
    index += symbol === 'CODE' ? 4 : 1;
  }
  return tokens;
}

export function parseCt46Codes(input: string): Array<{ code: string; symbol: string }> {
  const digits = input.replace(/\D/g, '');
  const tokens: Array<{ code: string; symbol: string }> = [];
  for (let index = 0; index < digits.length;) {
    const first = digits[index] ?? '';
    const width = CT46_PREFIXES.has(first) ? 2 : 1;
    const code = digits.slice(index, index + width);
    tokens.push({ code, symbol: CT46_SYMBOL_BY_CODE[code] ?? '?' });
    index += width;
  }
  return tokens;
}

export function checkerboardCt46(input: string, params: TextParams): EngineResult<string> {
  if (!params.decrypt) {
    const tokens = encodeCt46Tokens(input);
    const normalizedInput = tokens.map((token) => token.symbol).join('');
    const trace = tokens.map((token, index) =>
      step(
        `ct46-${index}`,
        `${token.symbol === ' ' ? 'ESPACIO' : token.symbol} → ${token.code}`,
        token.code.length === 1
          ? `${token.symbol} es frecuente y aparece en la fila corta bajo la columna ${token.code}; se escribe un solo dígito.`
          : `${token.code[0]} abre la fila de prefijo y ${token.code[1]} elige la columna donde está ${token.symbol === ' ' ? 'el espacio' : token.symbol}.`,
        token.symbol,
        token.code,
        token.code.length === 1 ? 'código = columna' : 'código = prefijo || columna',
      ),
    );
    return result(
      tokens.map((token) => token.code).join(''),
      normalizedInput,
      trace,
      normalizedInput.length < input.length
        ? ['Se descartaron símbolos que no existen en el tablero CT-46.']
        : [],
    );
  }
  const digits = input.replace(/\D/g, '');
  const tokens = parseCt46Codes(digits);
  const trace = tokens.map((token, index) =>
    step(
      `ct46-parse-${index}`,
      `${token.code} → ${token.symbol === ' ' ? 'ESPACIO' : token.symbol}`,
      token.code.length === 1
        ? `${token.code} no es un prefijo: se consulta directamente la fila corta.`
        : `${token.code[0]} es prefijo, por tanto se consume también ${token.code[1]} como columna.`,
      token.code,
      token.symbol,
      'parser: 1 dígito corto o 2 dígitos con prefijo',
    ),
  );
  const warnings: string[] = [];
  if (CT46_PREFIXES.has(digits.at(-1) ?? ''))
    warnings.push('El último dígito es un prefijo sin columna: el código está incompleto.');
  if (tokens.some((token) => token.symbol === '?'))
    warnings.push('Hay al menos un código que no pertenece al tablero CT-46.');
  return result(tokens.map((token) => token.symbol).join(''), digits, trace, warnings);
}
