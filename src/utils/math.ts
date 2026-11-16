export const mod = (a: number, n: number) => ((a % n) + n) % n;
export function gcd(a: bigint, b: bigint): bigint { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a,b] = [b,a%b]; return a; }
export function egcd(a: bigint, b: bigint): [bigint,bigint,bigint] { if (b === 0n) return [a,1n,0n]; const [g,x,y] = egcd(b,a%b); return [g,y,x-(a/b)*y]; }
export function modInverse(a: bigint, n: bigint) { const [g,x] = egcd(((a%n)+n)%n,n); if(g!==1n) throw new Error('No existe inverso modular'); return ((x%n)+n)%n; }
export function modPow(base: bigint, exponent: bigint, modulus: bigint) { if(modulus<=0n || exponent<0n) throw new Error('Parámetros no válidos'); let r=1n; base=((base%modulus)+modulus)%modulus; while(exponent){if(exponent&1n) r=r*base%modulus; base=base*base%modulus; exponent>>=1n;} return r; }

export class SeededRng {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0 || 0x9e3779b9; }
  next() { let x=this.state; x^=x<<13; x^=x>>>17; x^=x<<5; this.state=x>>>0; return this.state/0x100000000; }
  int(max: number) { return Math.floor(this.next()*max); }
}
