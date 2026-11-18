import { describe, expect, it } from 'vitest';
import {
  adfgvx,
  alberti,
  caesar,
  checkerboardCt46,
  nomenclator,
  polybius,
  porta,
  railFence,
  scytale,
  syndicalCode,
  vigenere,
} from '../engines/classical';
import { rc4, rsaDemo, diffieHellman, elGamal } from '../engines/modern';
import { coincidence } from '../engines/analysis';
import { modInverse, modPow } from '../utils/math';
import { syllabus } from '../data/syllabus';
import { runLesson } from '../engines/runLesson';

describe('registro y motores', () => {
  it('contiene 64 lecciones ordenadas y rutas únicas', () => {
    expect(syllabus).toHaveLength(64);
    expect(new Set(syllabus.map((x) => x.route)).size).toBe(64);
    expect(syllabus.map((x) => x.order)).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });
  it('César hace round-trip', () => {
    const e = caesar('CRIPTOGRAFIA', { key: '5', decrypt: false });
    expect(caesar(e.output, { key: '5', decrypt: true }).output).toBe('CRIPTOGRAFIA');
  });
  it('Vigenère usa el vector clásico', () => {
    expect(vigenere('ATTACKATDAWN', { key: 'LEMON', decrypt: false }).output).toBe('LXFOPVEFRNHR');
  });
  it('Rail Fence hace round-trip', () => {
    const e = railFence('WEAREDISCOVERED', { key: '3', decrypt: false });
    expect(railFence(e.output, { key: '3', decrypt: true }).output).toBe('WEAREDISCOVERED');
  });
  it('escítala hace round-trip', () => {
    const e = scytale('MENSAJE', { key: '4', decrypt: false });
    expect(scytale(e.output, { key: '4', decrypt: true }).output).toBe('MENSAJE');
  });
  it('Polibio recupera el ejemplo tras intercambiar la salida', () => {
    const encrypted = polybius('CRIPTOGRAFIA', { key: '', decrypt: false });
    expect(polybius(encrypted.output, { key: '', decrypt: true }).output).toBe('CRIPTOGRAFIA');
  });
  it('CT-46 codifica y recupera el ejemplo del temario', () => {
    const encrypted = checkerboardCt46('ATAQUE A LAS 20:00', { key: '', decrypt: false });
    expect(encrypted.output).toBe('5375303906556586531654145674545');
    expect(checkerboardCt46(encrypted.output, { key: '', decrypt: true }).output).toBe(
      'ATAQUE A LAS 20:00',
    );
  });
  it('el nomenclátor usa exclusivamente las entradas escritas en la clave', () => {
    const key = 'AMANECER=731, EJERCITO=204';
    const encrypted = nomenclator('EL EJERCITO AVANZA AL AMANECER', { key, decrypt: false });
    expect(encrypted.output).toBe('EL 204 AVANZA AL 731');
    expect(nomenclator(encrypted.output, { key, decrypt: true }).output).toBe(
      'EL EJERCITO AVANZA AL AMANECER',
    );
  });
  it('Alberti gira por periodos y recupera el texto', () => {
    const key = 'Mb,4,3i';
    const encrypted = alberti('DEFENDER ROMA', { key, decrypt: false });
    expect(encrypted.trace[3]?.explanation).toContain('Giro 0');
    expect(encrypted.trace[4]?.explanation).toContain('Giro 1');
    expect(alberti(encrypted.output, { key, decrypt: true }).output).toBe('DEFENDERROMA');
  });
  it('Porta/Bellaso es recíproco y su traza usa la clave real', () => {
    const encrypted = porta('MENSAJEPORTA', { key: 'CLAVE', decrypt: false });
    expect(encrypted.trace[0]?.explanation).toContain('clave C');
    expect(encrypted.trace[0]?.explanation).toContain('fila CD');
    expect(porta(encrypted.output, { key: 'CLAVE', decrypt: true }).output).toBe('MENSAJEPORTA');
  });
  it('ADFGVX aplica por separado el tablero y la transposición', () => {
    const key = 'ANONYMOUS,MRPRESIDENT';
    const encrypted = adfgvx('ATTACKAT1200AM', { key, decrypt: false });
    expect(encrypted.output).toMatch(/^[ADFGVX]+$/);
    expect(encrypted.trace[0]?.explanation).toContain('ANONYMOUS');
    expect(encrypted.trace.at(-1)?.explanation).toContain('MRPRESIDENT');
    expect(adfgvx(encrypted.output, { key, decrypt: true }).output).toBe('ATTACKAT1200AM');
  });
  it('el código sindical desplaza palabras circularmente y se invierte', () => {
    const encrypted = syndicalCode('HUELGA GENERAL', { key: '3', decrypt: false });
    expect(encrypted.output).toBe('UNIDAD RETIRADA');
    expect(encrypted.trace[1]?.explanation).toContain('posición 6');
    expect(syndicalCode(encrypted.output, { key: '3', decrypt: true }).output).toBe(
      'HUELGA GENERAL',
    );
  });
  it('el adaptador didáctico conserva la reversibilidad', () => {
    const encrypted = runLesson(5, { text: 'SEGURIDAD', key: 'CLAVE', decrypt: false });
    expect(runLesson(5, { text: encrypted.output, key: 'CLAVE', decrypt: true }).output).toBe(
      'SEGURIDAD',
    );
  });
  it('el adaptador conceptual no añade avisos genéricos a la salida', () => {
    expect(runLesson(13, { text: 'ABCD', key: '2,0,3,1', decrypt: false }).warnings).toEqual([]);
  });
  it('RC4 cumple el vector obligatorio', () =>
    expect(rc4('Plaintext', 'Key').output).toBe('BBF316E8D940AF0AD3'));
  it('RSA cumple el preset', () => {
    const e = rsaDemo('65', '61,53,17');
    expect(e.output).toBe('2790');
    expect(rsaDemo(e.output, '61,53,17', true).output).toBe('65');
  });
  it('ElGamal y DH cumplen presets', () => {
    expect(elGamal('13', '23,5,6,3').output).toBe('(10, 9)');
    expect(diffieHellman('23,5,6,15').output).toBe('yA=8, yB=19, K=2');
  });
  it('aritmética modular', () => {
    expect(modInverse(7n, 27n)).toBe(4n);
    expect(modPow(5n, 117n, 19n)).toBe(1n);
  });
  it('IC presenta cálculo exacto', () =>
    expect(coincidence('AAAAAB').metrics?.IC).toBeCloseTo(2 / 3));
  it('los modelos reales del bloque 2 recuperan su entrada', () => {
    const cases: Array<[number, string, string]> = [
      [13, 'ABCD', '2,0,3,1'],
      [20, 'INSTRUMENTOS', 'MONARQUIA'],
      [21, 'HELP', '9,4,5,7'],
      [22, 'TRAN', '3,1,4,2'],
      [26, 'MENSAJEENREJILLA', '4'],
      [27, 'SEGURIDAD', 'Temario-27'],
      [28, 'HELLOWORLD', 'I-II-III,AAA,AAA'],
    ];
    for (const [order, plain, key] of cases) {
      const encrypted = runLesson(order, { text: plain, key, decrypt: false });
      const decrypted = runLesson(order, { text: encrypted.output, key, decrypt: true });
      expect(decrypted.output).toBe(plain);
    }
  });
});
