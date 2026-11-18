import type { EngineResult } from '../domain/engine';
import { step } from '../domain/engine';
import {
  adfgvx,
  affine,
  alberti,
  caesar,
  checkerboardCt46,
  columnar,
  nomenclator,
  polybius,
  porta,
  railFence,
  scytale,
  syndicalCode,
  vigenere,
  xorCipher,
} from './classical';
import { coincidence, factors, frequency, kasiski, modular, primality } from './analysis';
import { diffieHellman, elGamal, feistel, rc4, rsaDemo } from './modern';
import { cardano, enigmaM3, hill, m209Reduced, playfair, positionPermutation, secretPermutation } from './block2';

export interface LessonInput {
  text: string;
  key: string;
  decrypt: boolean;
}
export function runLesson(order: number, input: LessonInput): EngineResult<string> {
  switch (order) {
    case 1:
      return scytale(input.text, input);
    case 2:
      return railFence(input.text, input);
    case 3:
      return polybius(input.text, input);
    case 4:
      return polybius(input.text, input, 7);
    case 5:
      return checkerboardCt46(input.text, input);
    case 6:
    case 14:
      return caesar(input.text, input);
    case 7:
      return nomenclator(input.text, input);
    case 8:
      return alberti(input.text, input);
    case 9:
      return porta(input.text, input);
    case 10:
    case 18:
      return vigenere(input.text, input);
    case 11:
      return adfgvx(input.text, input);
    case 12:
      return syndicalCode(input.text, input);
    case 13:
      return secretPermutation(input.text, input.key, input.decrypt);
    case 23:
    case 24:
    case 25:
      return columnar(input.text, input);
    case 15:
      return affine(input.text, input);
    case 19:
      return xorCipher(input.text, input);
    case 20:
      return playfair(input.text, input.key, input.decrypt);
    case 21:
      return hill(input.text, input.key, input.decrypt);
    case 22:
      return positionPermutation(input.text, input.key, input.decrypt);
    case 26:
      return cardano(input.text, input.decrypt);
    case 27:
      return m209Reduced(input.text, input.key, input.decrypt);
    case 28:
      return enigmaM3(input.text, input.key);
    case 30:
      return frequency(input.text);
    case 31:
      return kasiski(input.text);
    case 32:
    case 34:
      return coincidence(input.text);
    case 36:
      return feistel(input.text, input.key, input.decrypt);
    case 46:
      return rc4(input.text, input.key, input.decrypt);
    case 53:
      return factors(input.text);
    case 54:
    case 55:
      return modular(input.text, input.key);
    case 56:
      return primality(input.text, input.key);
    case 59:
      return rsaDemo(input.text, input.key, input.decrypt);
    case 60:
      return elGamal(input.text, input.key, input.decrypt);
    case 61:
      return diffieHellman(input.key);
    default:
      return conceptual(order, input);
  }
}

function conceptual(order: number, { text, key, decrypt }: LessonInput): EngineResult<string> {
  const source = text.trim() || 'SEGURIDAD',
    seed = [...`${order}:${key}`].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const inputValues = decrypt
    ? (source.match(/[0-9a-f]{2}/gi) ?? []).map((value) => Number.parseInt(value, 16))
    : [...new TextEncoder().encode(source)];
  const values = inputValues.map((value, index) =>
    decrypt ? (value - seed - index * 17) & 255 : (value + seed + index * 17) & 255,
  );
  const output = decrypt
    ? new TextDecoder().decode(Uint8Array.from(values))
    : values
        .map((v) => v.toString(16).padStart(2, '0'))
        .join(' ')
        .toUpperCase();
  return {
    output,
    normalizedInput: source,
    trace: [
      step(
        'model',
        'Preparación del modelo',
        `La lección ${order} representa sus datos como símbolos, índices o bloques observables.`,
        source,
        inputValues.join(' '),
      ),
      step(
        'operation',
        'Operación central',
        `Se aplica el parámetro «${key || 'preset del temario'}» al estado. Cada transición queda explícita para poder inspeccionarla.`,
        inputValues.join(' '),
        output,
      ),
      step(
        'verification',
        'Comprobación',
        decrypt
          ? 'Se reconstruye el estado anterior con la operación inversa.'
          : 'El resultado queda listo para comparar con otra ejecución.',
        source,
        output,
      ),
    ],
    warnings: [],
    metrics: { symbols: source.length, lesson: order },
  };
}
