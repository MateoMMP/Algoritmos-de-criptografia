export type LessonKind = 'cipher' | 'analysis' | 'math' | 'construction' | 'concept';
export interface LessonDefinition {
  id: string; block: 1 | 2 | 3 | 4 | 5; order: number; title: string; kind: LessonKind;
  route: string; engineId?: string; defaultMode: 'learn' | 'lab'; obsolete?: boolean;
  prerequisites: string[]; learningGoals: string[]; examSkills: string[];
}

const titles = [
  'Escítala lacedemonia estricta','Escítala general / zigzag','Cuadrado de Polibio','Cifrado Uesugi','Straddling Checkerboard y tablero CT-46','César histórico','Nomenclátores y libros de códigos','Discos de Alberti','Porta/Bellaso','Vigenère con autoclave','ADFGX y ADFGVX','Código sindical con desplazamiento',
  'Sistema secreto y propiedades','César formal','Sustitución afín y monoalfabética','Cifra de Arnold / libro','Cifrado homofónico','Vigenère y autoclave formal','Vernam y One-Time Pad','Playfair','Hill','Pautas de barajado','Übchi — doble transposición columnar','Transposición columnar sencilla','Transposición interrumpida I y II','Rejilla de Cardano giratoria','M-209','Enigma M3',
  'Modelos y niveles de criptoanálisis','Análisis de frecuencias','Método Kasiski','Índice de coincidencia','Superposición de Kerckhoffs','Test de Kullback φ','Test de solapamiento χ (χ² en el temario)','Difusión, confusión y Feistel','DES','Ataques a DES',
  'Modos ECB, CBC, CFB, OFB y CTR','2DES y ataque meet-in-the-middle','3DES','IDEA','Blowfish','AES','Cifradores síncronos y autosincronizantes','RC4','Hash, preimagen y colisiones','Construcción iterada y padding','MAC y autenticación','SHA-1 y familia SHA-2','Davies–Meyer y Merkle–Damgård','Esponja criptográfica',
  'Factores primos, divisores y φ de Euler','Aritmética modular','Fermat y Euler','Primalidad y Miller–Rabin','Funciones de sentido único y criptografía asimétrica','Firma digital','RSA','ElGamal','Diffie–Hellman','Curvas elípticas','Cifrado híbrido','PKI, certificados y gestión de claves'
] as const;
const blockFor = (n: number): 1|2|3|4|5 => n <= 12 ? 1 : n <= 28 ? 2 : n <= 38 ? 3 : n <= 52 ? 4 : 5;
const concepts = new Set([13,29,45,48,51,52,57,64]);
const analyses = new Set([30,31,32,33,34,35,38,47]);
const maths = new Set([53,54,55,56,62]);
const obsolete = new Set([1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,20,21,23,24,25,26,27,28,37,40,41,42,43,46,50,59]);
const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export const syllabus: LessonDefinition[] = titles.map((title, index) => {
  const n = index + 1;
  const id = `${String(n).padStart(2,'0')}-${slug(title)}`;
  const kind: LessonKind = concepts.has(n) ? 'concept' : analyses.has(n) ? 'analysis' : maths.has(n) ? 'math' : n >= 47 ? 'construction' : 'cipher';
  return {id, block: blockFor(n), order: n, title, kind, route: `/bloque/${blockFor(n)}/${id}`, engineId: `lesson-${n}`, defaultMode: 'learn', ...(obsolete.has(n) ? {obsolete: true} : {}), prerequisites: n > 1 ? [String(n-1)] : [], learningGoals: [`Comprender ${title}`, 'Reproducir el cálculo paso a paso'], examSkills: ['Interpretar parámetros', 'Comprobar el resultado']};
});

export const blockTitles = ['','Introducción e historia','Soluciones criptográficas clásicas','Criptoanálisis y algoritmos actuales','Modos, cifradores modernos, hash y autenticación','Aritmética y criptografía asimétrica'];
