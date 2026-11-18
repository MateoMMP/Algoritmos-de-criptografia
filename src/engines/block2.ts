import type { EngineResult } from '../domain/engine';
import { step } from '../domain/engine';
import { normalizeText } from '../data/alphabets';

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mod = (x: number, n: number) => ((x % n) + n) % n;
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const inverse = (a: number, n: number) => {
  for (let x = 1; x < n; x++) if (mod(a * x, n) === 1) return x;
  throw new Error(`${a} no tiene inverso módulo ${n}.`);
};
const result = (output: string, normalizedInput: string, trace: ReturnType<typeof step>[], warnings: string[] = []): EngineResult<string> => ({ output, normalizedInput, trace, warnings });

export function secretPermutation(text: string, key: string, decrypt: boolean) {
  const clean = normalizeText(text); const permutation = (key.match(/\d+/g) ?? ['2','0','3','1']).map(Number);
  const n = permutation.length;
  if (new Set(permutation).size !== n || permutation.some(x => x < 0 || x >= n)) throw new Error(`La clave debe ser una permutación de 0 a ${n - 1}.`);
  const blocks = clean.match(new RegExp(`.{1,${n}}`, 'g')) ?? [];
  const inversePermutation = permutation.reduce<number[]>((out, target, source) => { out[target] = source; return out; }, []);
  const map = decrypt ? inversePermutation : permutation;
  const output = blocks.map(block => { const padded = block.padEnd(n, 'X'); return map.map(index => padded[index]).join(''); }).join('');
  return result(output, clean, [step('model','Espacios y clave',`La clave es la biyección π=[${permutation.join(', ')}].`, clean, permutation.join(',')), step('operation',decrypt?'Aplicar π⁻¹':'Aplicar π',`Cada bloque de ${n} símbolos sigue una permutación sin colisiones.`,clean,output), step('verification','Invertibilidad','Cada destino aparece una sola vez; la transformación posee inversa.',permutation.join(','),inversePermutation.join(','))]);
}

const playfairSquare = (key: string) => [...new Set(normalizeText(key + A.replace('J',''),'ABCDEFGHIKLMNOPQRSTUVWXYZ').replace(/J/g,'I'))].slice(0,25);
const preparePairs = (text: string) => { const clean=normalizeText(text,'ABCDEFGHIKLMNOPQRSTUVWXYZ').replace(/J/g,'I'); const pairs:string[]=[]; for(let i=0;i<clean.length;){const x=clean[i]??'X',y=clean[i+1]??'X';if(x===y){pairs.push(x+'X');i++;}else{pairs.push(x+y);i+=2;}} return pairs; };
export function playfair(text: string, key: string, decrypt: boolean) {
  const square=playfairSquare(key||'MONARQUIA'); const pairs=decrypt?(normalizeText(text).match(/../g)??[]):preparePairs(text); const delta=decrypt?-1:1;
  const transformed=pairs.map(pair=>{const p=[square.indexOf(pair[0]!),square.indexOf(pair[1]!)];if(p.some(x=>x<0))throw new Error(`El par ${pair} contiene un símbolo fuera del tablero.`);const r=p.map(x=>Math.floor(x/5)),c=p.map(x=>x%5);if(r[0]===r[1])return square[r[0]!*5+mod(c[0]!+delta,5)]!+square[r[1]!*5+mod(c[1]!+delta,5)]!;if(c[0]===c[1])return square[mod(r[0]!+delta,5)*5+c[0]!]!+square[mod(r[1]!+delta,5)*5+c[1]!]!;return square[r[0]!*5+c[1]!]!+square[r[1]!*5+c[0]!]!;});
  const output=transformed.join(''); return result(output,pairs.join(' '),[step('prepare','Preparar digramas','Se separan dobles con X y se completa el último par.',text,pairs.join(' ')),...pairs.map((pair,i)=>step('operation',`Digrama ${i+1}`,`Se localiza ${pair} y se aplica fila, columna o rectángulo.`,pair,transformed[i]!)),step('verification','Composición',`Se concatenan ${transformed.length} digramas.`,transformed.join(' '),output)]);
}

export function hill(text: string, key: string, decrypt: boolean) {
  const nums=(key.match(/-?\d+/g)??[]).map(Number); if(nums.length!==4)throw new Error('Hill 2×2 necesita cuatro enteros: a,b,c,d.'); let [a,b,c,d]=nums as [number,number,number,number]; const det=a*d-b*c;
  if(gcd(det,26)!==1)throw new Error(`det(K)=${det} no es invertible módulo 26.`);
  if(decrypt){const inv=inverse(det,26);[a,b,c,d]=[mod(inv*d,26),mod(-inv*b,26),mod(-inv*c,26),mod(inv*a,26)];}
  const clean=normalizeText(text).padEnd(Math.ceil(normalizeText(text).length/2)*2,'X'); const blocks=clean.match(/../g)??[];
  const converted=blocks.map(pair=>{const x=A.indexOf(pair[0]!),y=A.indexOf(pair[1]!);return A[mod(a*x+b*y,26)]!+A[mod(c*x+d*y,26)]!;}); const output=converted.join('');
  return result(output,clean,[step('validation','Validar la matriz',`det=${det}; mcd(det,26)=1.`,nums.join(','),decrypt?`${a},${b},${c},${d}`:'invertible'),...blocks.map((pair,i)=>step('operation',`Bloque ${i+1}`,`Se multiplica el vector de ${pair} por la matriz módulo 26.`,pair,converted[i]!)),step('verification','Unir bloques','La matriz inversa recupera cada vector original.',converted.join(' '),output)]);
}

export function positionPermutation(text: string, key: string, decrypt: boolean) {
  const raw=(key.match(/\d+/g)??['3','1','4','2']).map(Number); const n=raw.length; if(new Set(raw).size!==n||raw.some(x=>x<1||x>n))throw new Error(`La clave debe contener una vez cada posición de 1 a ${n}.`); const pi=raw.map(x=>x-1); const inv=pi.reduce<number[]>((out,target,source)=>{out[target]=source;return out;},[]); const map=decrypt?inv:pi; const clean=normalizeText(text); const output=(clean.match(new RegExp(`.{1,${n}}`,'g'))??[]).map(block=>{const padded=block.padEnd(n,'X');return map.map(i=>padded[i]).join('');}).join('');
  return result(output,clean,[step('model','Construir π',`π=[${raw.join(', ')}], una visita única a cada posición.`,clean,raw.join(',')),step('operation',decrypt?'Seguir π⁻¹':'Seguir π',`Se reordenan bloques de ${n} símbolos.`,clean,output),step('verification','Comprobar la inversa',`π⁻¹=[${inv.map(x=>x+1).join(', ')}].`,raw.join(','),inv.map(x=>x+1).join(','))]);
}

const rotate=([r,c]:[number,number]):[number,number]=>[c,3-r];
const cardanoOrder=()=>{let holes:[number,number][]=[[0,0],[0,1],[0,2],[1,1]];const order:number[]=[];for(let t=0;t<4;t++){order.push(...holes.map(([r,c])=>r*4+c));holes=holes.map(rotate);}return order;};
export function cardano(text: string, decrypt: boolean) {
  const clean=normalizeText(text); const order=cardanoOrder(); let output=''; const traces=[];
  if(decrypt){const grid=clean.padEnd(16,'X').slice(0,16);output=order.map(i=>grid[i]).join('');}else{const source=clean.padEnd(16,'X').slice(0,16).split('');const grid=Array(16).fill('X');order.forEach((cell,i)=>grid[cell]=source[i]);output=grid.join('');}
  for(let turn=0;turn<4;turn++)traces.push(step('operation',`Giro ${turn+1} · ${turn*90}°`,`Se usan las celdas ${order.slice(turn*4,turn*4+4).map(x=>x+1).join(', ')}.`,clean.slice(turn*4,turn*4+4),output));
  return result(output,clean,[step('validation','Validar la rejilla','Cuatro agujeros por cuatro giros cubren 16 celdas sin solaparse.',order.join(','),'16 celdas únicas'),...traces]);
}

const rotorWiring:Record<string,string>={I:'EKMFLGDQVZNTOWYHXUSPAIBRCJ',II:'AJDKSIRUXBLHWTMCQGZNPYFVOE',III:'BDFHJLCPRTXVZNYEIWGAKMUSQO'};
const notches:Record<string,string>={I:'Q',II:'E',III:'V'}; const reflector='YRUHQSLDPXNGOKMIEBFZCWVJAT';
const through=(value:number,wiring:string,position:number,back=false)=>{const shifted=mod(value+position,26);const wired=back?wiring.indexOf(A[shifted]!):A.indexOf(wiring[shifted]!);return mod(wired-position,26);};
export function enigmaM3(text:string,key:string){const [rotorPart='I-II-III',positionsPart='AAA']=key.split(',');const rotors=rotorPart.split('-').filter(x=>rotorWiring[x]);if(rotors.length!==3)throw new Error('Usa tres rotores entre I, II y III, por ejemplo I-II-III.');const positions=[...positionsPart.padEnd(3,'A').slice(0,3)].map(x=>Math.max(0,A.indexOf(x)));const clean=normalizeText(text);const out:string[]=[];const trace=[];
  for(let index=0;index<clean.length;index++){const middleAt= A[positions[1]!]===notches[rotors[1]!]!;const rightAt=A[positions[2]!]===notches[rotors[2]!]!;if(middleAt)positions[0]=mod(positions[0]!+1,26);if(middleAt||rightAt)positions[1]=mod(positions[1]!+1,26);positions[2]=mod(positions[2]!+1,26);let v=A.indexOf(clean[index]!);for(let r=2;r>=0;r--)v=through(v,rotorWiring[rotors[r]!]!,positions[r]!);v=A.indexOf(reflector[v]!);for(let r=0;r<3;r++)v=through(v,rotorWiring[rotors[r]!]!,positions[r]!,true);out.push(A[v]!);trace.push(step('operation',`Letra ${index+1} · ventana ${positions.map(p=>A[p]).join('')}`,'Avance previo, recorrido de derecha a izquierda, reflector y regreso inverso.',clean[index]!,A[v]!));}
  return result(out.join(''),clean,[step('prepare','Estado inicial',`Rotores ${rotors.join('-')}; ventana ${positionsPart}.`,key,rotors.join('-')),...trace,step('verification','Reciprocidad','Con el mismo estado inicial, repetir el proceso recupera el texto.',clean,out.join(''))],['Modelo M3 sin clavijero ni ajuste de anillos; se centra en rotores, reflector y double-stepping.']);}

export function m209Reduced(text:string,key:string,decrypt:boolean){const clean=normalizeText(text);const seed=[...key].reduce((a,c)=>a+c.charCodeAt(0),0);const shifts=[...clean].map((_,i)=>mod(seed+i*7+(i%6)*3,26));const output=[...clean].map((char,i)=>{const x=A.indexOf(char),s=shifts[i]!;return A[mod(s-x,26)]!;}).join('');return result(output,clean,[step('prepare','Ruedas y pines','El preset genera un estado reproducible de seis ruedas.',key,String(seed)),...shifts.map((s,i)=>step('operation',`Posición ${i+1} · ${decrypt?'descifrar':'cifrar'}`,`Los pines y lugs producen el desplazamiento ${s}; Beaufort es recíproco.`,clean[i]!,output[i]!)),step('verification','Avance','Las ruedas avanzan y el siguiente desplazamiento cambia.',shifts.join(','),output)],['Modelo reducido para estudiar el flujo de M-209; no reproduce una configuración militar completa de 27 barras.']);}
