import { ArrowRight, Check, RotateCw, X } from 'lucide-react';
import type { EngineResult } from '../../domain/engine';
import type { LessonDefinition } from '../../data/syllabus';
import { normalizeText } from '../../data/alphabets';

interface Props {
  lesson: LessonDefinition;
  input: string;
  keyValue: string;
  result: EngineResult<string>;
  decrypt: boolean;
  activeStep: number;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const esAlphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const mod = (value: number, n: number) => ((value % n) + n) % n;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const numbers = (value: string, fallback: number[]) =>
  (value.match(/-?\d+/g)?.map(Number).filter(Number.isFinite) ?? fallback);
const stableRank = (key: string) =>
  [...key].map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index)
    .reduce<number[]>((rank, item, index) => { rank[item.index] = index + 1; return rank; }, []);

function Flow({ items, active = 0 }: { items: string[]; active?: number }) {
  return <div className="b2-flow">{items.map((item, index) => <span key={`${item}-${index}`} className={index === active ? 'active' : ''}><b>{item}</b>{index < items.length - 1 && <ArrowRight aria-hidden />}</span>)}</div>;
}

function SystemProperties({ keyValue }: { keyValue: string }) {
  const permutation = numbers(keyValue, [2, 0, 3, 1]).slice(0, 6);
  const size = Math.max(4, permutation.length);
  const targets = Array.from({ length: size }, (_, i) => permutation[i] ?? i);
  const unique = new Set(targets).size === size && targets.every((x) => x >= 0 && x < size);
  return <div className="b2-system">
    <p className="viz-caption">La clave define estas flechas. Si dos mensajes comparten destino, el receptor no puede decidir cuál era el original.</p>
    <div className="b2-mapping">
      {targets.map((target, index) => <div key={index} className={targets.indexOf(target) !== index ? 'collision-map' : ''}><code>M{index}</code><ArrowRight/><code>C{target}</code></div>)}
    </div>
    <div className={`b2-verdict ${unique ? 'ok' : 'bad'}`}>{unique ? <Check/> : <X/>}<span><b>{unique ? 'Transformación biyectiva' : 'Clave no invertible'}</b><small>{unique ? 'Cada mensaje tiene una salida exclusiva.' : 'Hay destinos repetidos o fuera del espacio.'}</small></span></div>
  </div>;
}

function ModularAlphabet({ input, keyValue, affine = false }: { input: string; keyValue: string; affine?: boolean }) {
  const values = numbers(keyValue, affine ? [7, 3] : [3]);
  const a = affine ? (values[0] ?? 7) : 1;
  const b = affine ? (values[1] ?? 3) : (values[0] ?? 3);
  const source = normalizeText(input, esAlphabet)[0] ?? 'A';
  const origin = esAlphabet.indexOf(source);
  const target = mod(a * origin + b, esAlphabet.length);
  return <>
    <div className="b2-equation"><span><small>entrada</small><b>{source} = {origin}</b></span><i>→</i><code>({a}·{origin} + {b}) mod {esAlphabet.length}</code><i>=</i><span className="result"><small>salida</small><b>{esAlphabet[target]} = {target}</b></span></div>
    {affine && <div className={`b2-verdict ${gcd(a, esAlphabet.length) === 1 ? 'ok' : 'bad'}`}>{gcd(a, esAlphabet.length) === 1 ? <Check/> : <X/>}<span><b>mcd({a}, {esAlphabet.length}) = {gcd(a, esAlphabet.length)}</b><small>{gcd(a, esAlphabet.length) === 1 ? `${a} tiene inverso modular: la clave se puede deshacer.` : 'No existe inverso: varias letras colisionarán.'}</small></span></div>}
    <div className="b2-alphabet-strip">{[...esAlphabet].map((char, index) => <span key={char} className={index === origin ? 'source' : index === target ? 'target' : ''}><b>{char}</b><small>{index}</small></span>)}</div>
  </>;
}

function BookCoordinates({ input }: { input: string }) {
  const words = input.toUpperCase().match(/[A-ZÁÉÍÓÚÜÑ]+/g) ?? [];
  return <><p className="viz-caption">Este ejemplo fija tres palabras por línea y seis por página. Cambiar esa convención cambia todas las coordenadas.</p><div className="b2-book">{words.map((word, index) => { const page = Math.floor(index / 6) + 1; const line = Math.floor((index % 6) / 3) + 1; const position = index % 3 + 1; return <span key={`${word}-${index}`}><small>P{page} · L{line}</small><b>{word}</b><code>{page}.{line}.{position}</code></span>; })}</div></>;
}

function Homophones({ input, keyValue }: { input: string; keyValue: string }) {
  const clean = normalizeText(input);
  const counts = [...clean].reduce<Record<string, number>>((acc, char) => { acc[char] = (acc[char] ?? 0) + 1; return acc; }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const seed = numbers(keyValue, [2026]).at(-1) ?? 2026;
  return <><p className="viz-caption">La cantidad de códigos crece con la frecuencia observada. La semilla cambia la elección, no la tabla inversa.</p><div className="b2-homophones">{entries.map(([char, count], row) => { const amount = Math.min(5, Math.max(1, Math.ceil(count / 2))); return <div key={char}><b>{char}</b><small>{count} apariciones</small><ArrowRight/><span>{Array.from({ length: amount }, (_, i) => <code key={i}>{String(mod(seed + row * 17 + i * 23, 100)).padStart(2, '0')}</code>)}</span></div>; })}</div></>;
}

function VigenereStrips({ input, keyValue }: { input: string; keyValue: string }) {
  const text = normalizeText(input).slice(0, 18);
  const key = normalizeText(keyValue) || 'CLAVE';
  const periodic = [...text].map((_, i) => key[i % key.length]).join('');
  const keyAuto = (key + key.repeat(10)).slice(0, text.length);
  const textAuto = (key + text).slice(0, text.length);
  return <div className="b2-strips"><StripRow name="Mensaje" value={text}/><StripRow name="Periódica" value={periodic}/><StripRow name="Key-autokey" value={keyAuto}/><StripRow name="Text-autokey" value={textAuto}/></div>;
}

function StripRow({ name, value }: { name: string; value: string }) {
  return <div><b>{name}</b><code>{[...value].map((x, i) => <i key={i}>{x}</i>)}</code></div>;
}

function XorBoard({ input, keyValue }: { input: string; keyValue: string }) {
  const m = new TextEncoder().encode(input)[0] ?? 0;
  const k = new TextEncoder().encode(keyValue || 'K')[0] ?? 0;
  const bits = (n: number) => n.toString(2).padStart(8, '0');
  const rows: Array<[string, string]> = [['M', bits(m)], ['K', bits(k)], ['C', bits(m ^ k)]];
  return <div className="b2-xor">{rows.map(([label, value], row) => <div key={label} className={row === 2 ? 'xor-result' : ''}><b>{label}</b>{[...value].map((bit, i) => <span key={i} className={row < 2 && bits(m)[i] !== bits(k)[i] ? 'different' : ''}>{bit}</span>)}</div>)}<p>Bits distintos → 1 · bits iguales → 0 · C ⊕ K = M</p></div>;
}

const playfairSquare = (keyValue: string) => {
  const sequence = normalizeText(keyValue + alphabet.replace('J', ''), 'ABCDEFGHIKLMNOPQRSTUVWXYZ').replace(/J/g, 'I');
  return [...new Set(sequence)].slice(0, 25);
};
function Playfair({ input, keyValue, activeStep }: { input: string; keyValue: string; activeStep: number }) {
  const square = playfairSquare(keyValue || 'MONARQUIA');
  const clean = normalizeText(input, 'ABCDEFGHIKLMNOPQRSTUVWXYZ').replace(/J/g, 'I');
  const pairs: string[] = [];
  for (let i = 0; i < clean.length;) { const a = clean[i] ?? 'X'; const b = clean[i + 1] ?? 'X'; if (a === b) { pairs.push(a + 'X'); i++; } else { pairs.push(a + b); i += 2; } }
  const pair = pairs[activeStep % Math.max(1, pairs.length)] ?? 'IN';
  const positions = [...pair].map((x) => square.indexOf(x));
  const sameRow = Math.floor((positions[0] ?? 0) / 5) === Math.floor((positions[1] ?? 0) / 5);
  const sameCol = (positions[0] ?? 0) % 5 === (positions[1] ?? 0) % 5;
  return <><div className="b2-pairs">{pairs.map((x, i) => <code key={i} className={x === pair ? 'active' : ''}>{x}</code>)}</div><div className="b2-playfair"><div className="b2-square">{square.map((x, i) => <span key={x} className={positions.includes(i) ? 'active' : ''}>{x}<small>{Math.floor(i / 5) + 1},{i % 5 + 1}</small></span>)}</div><div className="b2-rule"><small>Regla activa</small><b>{sameRow ? 'Misma fila → desplazar' : sameCol ? 'Misma columna → desplazar' : 'Rectángulo → intercambiar columnas'}</b><p>Par preparado: <code>{pair}</code></p></div></div></>;
}

function Hill({ input, keyValue }: { input: string; keyValue: string }) {
  const [a, b, c, d] = [...numbers(keyValue, [9, 4, 5, 7]), 9, 4, 5, 7];
  const text = normalizeText(input).padEnd(2, 'A'); const x = alphabet.indexOf(text[0] ?? 'A'); const y = alphabet.indexOf(text[1] ?? 'A');
  const det = a * d - b * c; const u = mod(a * x + b * y, 26); const v = mod(c * x + d * y, 26);
  return <><div className="b2-hill"><div className="matrix2"><span>{a}</span><span>{b}</span><span>{c}</span><span>{d}</span></div><b>×</b><div className="vector2"><span>{x}</span><span>{y}</span></div><b>mod 26 =</b><div className="vector2 output"><span>{u}</span><span>{v}</span></div><code>{text.slice(0,2)} → {alphabet[u]}{alphabet[v]}</code></div><div className={`b2-verdict ${gcd(det,26) === 1 ? 'ok' : 'bad'}`}>{gcd(det,26) === 1 ? <Check/> : <X/>}<span><b>det(K) = {det} ≡ {mod(det,26)}; mcd = {gcd(det,26)}</b><small>{gcd(det,26) === 1 ? 'La matriz tiene inversa modular.' : 'La matriz no sirve como clave de Hill.'}</small></span></div></>;
}

function Permutation({ input, keyValue }: { input: string; keyValue: string }) {
  const requested = numbers(keyValue, [3, 1, 4, 2]).map((x) => x - 1);
  const n = requested.length || 4; const permutation = requested.length ? requested : [2,0,3,1]; const text = normalizeText(input).slice(0,n).padEnd(n,'X');
  return <><div className="b2-permutation">{[...text].map((char, i) => <span key={i}><small>{i + 1}</small><b>{char}</b><i>π → {mod(permutation[i] ?? i,n)+1}</i></span>)}</div><p className="b2-note">Una permutación válida contiene una sola vez cada índice de 1 a {n}. Su inversa sigue las flechas en sentido contrario.</p></>;
}

function ColumnarModel({ input, keyValue, variant }: { input: string; keyValue: string; variant: 23|24|25 }) {
  const keys = keyValue.split(',').map((x) => normalizeText(x)).filter(Boolean); const key = keys[0] || 'CLAVE'; const rank = stableRank(key); const text = normalizeText(input); const cols = key.length; const rows = Math.ceil(text.length / cols);
  const interrupted = variant === 25;
  return <><div className="b2-column-key" style={{gridTemplateColumns:`repeat(${cols},minmax(38px,1fr))`}}>{[...key].map((char,i)=><span key={i}><b>{char}</b><small>orden {rank[i]}</small></span>)}</div><div className={`b2-column-grid ${interrupted ? 'interrupted' : ''}`} style={{gridTemplateColumns:`repeat(${cols},minmax(38px,1fr))`}}>{Array.from({length:rows*cols},(_,i)=>{ const row=Math.floor(i/cols); const col=i%cols; const hole=interrupted && col >= Math.max(1, rank[row % cols] ?? cols); return <span key={i} className={hole?'hole':''}><small>{hole?'hueco':i+1}</small><b>{hole?'':text[i] ?? '·'}</b></span>; })}</div>{variant===23 && <Flow items={['Texto claro','T₁ con '+key,'Intermedio','T₂','Criptograma']} active={2}/>}<p className="b2-note">Lectura de columnas: {rank.map((r,i)=>({r,i})).sort((a,b)=>a.r-b.r).map(x=>key[x.i]).join(' → ')}</p></>;
}

const rotatePoint = ([row,col]: [number,number], n=4): [number,number] => [col,n-1-row];
function Cardano({ input, activeStep }: { input: string; activeStep: number }) {
  const holes: [number,number][] = [[0,0],[0,1],[0,2],[1,1]]; const turn=activeStep%4; let current=holes; for(let i=0;i<turn;i++) current=current.map((p)=>rotatePoint(p)); const set=new Set(current.map(x=>x.join('-'))); const text=normalizeText(input).padEnd(16,'X');
  return <><div className="b2-turns">{[0,90,180,270].map((deg,i)=><span key={deg} className={i===turn?'active':''}><RotateCw/><b>{deg}°</b></span>)}</div><div className="b2-cardano">{Array.from({length:16},(_,i)=>{const open=set.has(`${Math.floor(i/4)}-${i%4}`);return <span key={i} className={open?'open':''}><small>{i+1}</small>{open?<b>{text[i]}</b>:<i>cubierta</i>}</span>;})}</div><p className="b2-note">Giro {turn+1}/4: los cuatro agujeros revelan una celda de cada órbita.</p></>;
}

function M209({ input, keyValue, activeStep }: { input: string; keyValue: string; activeStep: number }) {
  const lengths=[26,25,23,21,19,17]; const seed=[...keyValue].reduce((a,c)=>a+c.charCodeAt(0),0); const position=activeStep%Math.max(1,normalizeText(input).length); const pins=lengths.map((length,i)=>mod(seed+position+i*7,length)%3===0); const displaced=pins.filter(Boolean).length*3+mod(seed+position,4);
  return <><div className="b2-wheels">{lengths.map((length,i)=><div key={length} className={pins[i]?'active':''}><span>{String.fromCharCode(65+mod(position+i,length))}</span><b>Rueda {i+1}</b><small>{length} pos. · pin {pins[i]?'activo':'inactivo'}</small></div>)}</div><Flow items={['Pines: '+pins.map(x=>x?'1':'0').join(''),'Barras desplazadas: '+displaced,'Clave: '+mod(displaced,26),'Beaufort']} active={1}/><p className="b2-note">Posición procesada: {position+1}. Al avanzar cambia el vector de pines y, con él, el desplazamiento.</p></>;
}

const rotorWirings=['EKMFLGDQVZNTOWYHXUSPAIBRCJ','AJDKSIRUXBLHWTMCQGZNPYFVOE','BDFHJLCPRTXVZNYEIWGAKMUSQO'];
function Enigma({ input, activeStep }: { input: string; activeStep: number }) {
  const step=activeStep%Math.max(1,normalizeText(input).length); const positions=[mod(step,26),mod(Math.floor(step/26),26),0]; const source=alphabet.indexOf(normalizeText(input)[step]??'A'); let value=source; const stages=[`Tecla ${alphabet[source]}`];
  for(let r=2;r>=0;r--){value=alphabet.indexOf(rotorWirings[r]![mod(value+positions[2-r]!,26)]!); stages.push(`${['III','II','I'][2-r]}: ${alphabet[value]}`);} stages.push('Reflector B'); stages.push('regreso inverso'); stages.push(`Lámpara ${alphabet[value]}`);
  return <><div className="b2-rotor-window">{['I','II','III'].map((name,i)=><span key={name}><small>Rotor {name}</small><b>{alphabet[positions[2-i] ?? 0]}</b><i>{i===2?'rápido':i===1?'medio':'lento'}</i></span>)}</div><Flow items={stages} active={Math.min(activeStep,stages.length-1)}/><p className="b2-note">El avance ocurre antes del circuito. En el regreso se usa el cableado inverso; el reflector hace que la máquina sea recíproca.</p></>;
}

export function Block2Visualizer(props: Props) {
  const { lesson, input, keyValue, activeStep } = props;
  switch (lesson.order) {
    case 13: return <SystemProperties keyValue={keyValue}/>;
    case 14: return <ModularAlphabet input={input} keyValue={keyValue}/>;
    case 15: return <ModularAlphabet input={input} keyValue={keyValue} affine/>;
    case 16: return <BookCoordinates input={input}/>;
    case 17: return <Homophones input={input} keyValue={keyValue}/>;
    case 18: return <VigenereStrips input={input} keyValue={keyValue}/>;
    case 19: return <XorBoard input={input} keyValue={keyValue}/>;
    case 20: return <Playfair input={input} keyValue={keyValue} activeStep={activeStep}/>;
    case 21: return <Hill input={input} keyValue={keyValue}/>;
    case 22: return <Permutation input={input} keyValue={keyValue}/>;
    case 23: return <ColumnarModel input={input} keyValue={keyValue} variant={23}/>;
    case 24: return <ColumnarModel input={input} keyValue={keyValue} variant={24}/>;
    case 25: return <ColumnarModel input={input} keyValue={keyValue} variant={25}/>;
    case 26: return <Cardano input={input} activeStep={activeStep}/>;
    case 27: return <M209 input={input} keyValue={keyValue} activeStep={activeStep}/>;
    case 28: return <Enigma input={input} activeStep={activeStep}/>;
    default: return null;
  }
}
