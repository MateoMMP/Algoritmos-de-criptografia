# Prompt maestro para Codex — Seguridad CryptoLab

> Copia este documento completo en Codex dentro de VS Code. Es una especificación cerrada: implementa la aplicación completa, no redactes otra propuesta ni dejes decisiones pendientes.

## 1. Misión

Construye una aplicación web educativa, local y sin backend llamada **Seguridad CryptoLab**. Debe permitir aprender, ejecutar, invertir y visualizar paso a paso todos los algoritmos, construcciones y cálculos del Bloque 1 de la asignatura Seguridad. El usuario es un estudiante sin experiencia previa en criptografía ni en React.

La aplicación debe ser:

- Matemáticamente correcta y comprobable.
- Muy visual, intuitiva y útil para preparar ejercicios de examen.
- Completa: ningún laboratorio de esta especificación puede quedar como `TODO`, maqueta, texto estático o “próximamente”.
- Offline tras la primera carga.
- Enteramente cliente: no habrá servidor, cuentas, base de datos ni envío de datos.
- En español, salvo nombres históricos o técnicos establecidos.
- Educativa, no una biblioteca criptográfica de producción.

## 2. Principios no negociables

1. **Orden del temario.** El menú y las rutas siguen exactamente los cinco bloques y el orden indicado en la sección 7. Aunque dos lecciones reutilicen un mismo motor, ambas deben aparecer en su lugar del temario.
2. **Separación cálculo/interfaz.** Los algoritmos son funciones TypeScript puras e independientes de React. React solo controla estado, validación y visualización.
3. **Reversibilidad.** Todo cifrador reversible debe ofrecer Cifrar, Descifrar, Intercambiar entrada/salida y una comprobación automática `D(K, E(K, M)) = M`, teniendo en cuenta el padding o normalización documentados.
4. **Nada se normaliza en silencio.** Antes de calcular se muestra una vista “Entrada original → entrada normalizada”, indicando acentos eliminados, Ñ tratada, espacios/puntuación conservados o descartados y padding añadido.
5. **Paso a paso real.** Cada motor devuelve una traza estructurada. La visualización consume esa traza; no se inventan pasos decorativos.
6. **Dos escalas cuando proceda.** Para algoritmos modernos complejos habrá:
   - `Modo didáctico`: entradas pequeñas, todos los pasos visibles.
   - `Modo estándar`: parámetros reales y resultado verificable; se permite agrupar operaciones repetitivas, pero debe poder inspeccionarse al menos una ronda completa.
7. **Convención del temario vs. estándar.** Si el material docente usa una aproximación o convención distinta de la estándar actual, mostrar ambas sin ocultar la diferencia. El modo “Temario” es el predeterminado para el examen; una nota breve explica la variante estándar.
8. **Algoritmos obsoletos.** César, DES, 3DES, RC4, SHA-1, RSA sin padding, etc. llevan la insignia “Solo aprendizaje — no usar para proteger datos reales”.
9. **Determinismo docente.** Los ejemplos, ejercicios y animaciones usan una semilla reproducible. La generación marcada “criptográfica” usa `crypto.getRandomValues`, nunca `Math.random`.
10. **Sin falsas promesas.** No llamar “seguro” a un ejemplo con claves pequeñas. Distinguir claramente demostración matemática y uso real.

## 3. Stack cerrado

Usa una aplicación Vite con React y TypeScript estricto.

- React + TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Vite.
- React Router para rutas y navegación.
- Zustand para progreso, ajustes globales y sesiones locales. Persistencia selectiva en `localStorage`.
- Zod para validar formularios, importaciones y estados compartidos por URL.
- Tailwind CSS para estilos, con variables CSS propias para el tema.
- Radix UI únicamente para primitivas accesibles (Dialog, Tabs, Tooltip, Select, Slider, Accordion); construir el diseño visual propio, no una interfaz genérica de componentes.
- Lucide React para iconos.
- KaTeX para fórmulas.
- Recharts solo para histogramas, curvas de probabilidad y gráficas de avalancha. Diagramas de flujo, matrices, rotores y cableados se hacen con SVG/HTML propio.
- Vitest + Testing Library + `fast-check` para tests unitarios, de componentes y propiedades.
- Playwright para recorridos end-to-end.
- `vite-plugin-pwa` para funcionamiento offline.
- ESLint + Prettier.

No añadas un framework full-stack. No uses una API remota. No uses paquetes que “resuelvan” los cifradores didácticos impidiendo obtener la traza interna.

### Uso de Web Crypto

Usa `window.crypto.subtle` como oráculo independiente para verificar, cuando el navegador lo soporte:

- AES-CBC y AES-CTR.
- SHA-1, SHA-256, SHA-384 y SHA-512.
- HMAC.
- RSA-OAEP y firmas RSA-PSS en el laboratorio “modo real”.

Los motores didácticos de AES, DES, 3DES, RC4, RSA pequeño, etc. deben ser propios para poder mostrar pasos. No uses Web Crypto como sustituto de la traza.

## 4. Identidad visual y experiencia

### 4.1 Estilo

Diseño de “laboratorio científico moderno”, no estética hacker verde/neón.

- Fondo marfil muy claro en tema claro y azul tinta en tema oscuro.
- Color primario azul cobalto; secundarios verde esmeralda para salida correcta, ámbar para advertencia y coral para error.
- Tipografía de interfaz limpia; monospace para bits, hexadecimales, claves, matrices y trazas.
- Bordes suaves, sombras discretas, densidad media y mucho espacio útil.
- Matrices y tablas deben ser legibles sin zoom a 1366×768.
- Animaciones de 150–300 ms; respetar `prefers-reduced-motion`.

### 4.2 Estructura global

Escritorio:

- Barra lateral izquierda plegable con los 5 bloques, progreso y buscador.
- Cabecera con título de la lección, migas, selector de modo y controles de tema/ajustes.
- Zona principal.
- Panel derecho plegable “Teoría y fórmulas”.

Móvil/tablet:

- Temario en drawer.
- Paneles apilados.
- Ningún gráfico debe depender de hover; todo debe funcionar con toque y teclado.

### 4.3 Cuatro modos de trabajo

1. **Aprender**: explicación breve, ejemplo guiado y pasos bloqueados en orden.
2. **Laboratorio**: edición libre con recálculo en vivo, comparación y traza completa.
3. **Practicar**: ejercicio generado; campos de respuesta; pistas escalonadas; corrección que señala el primer paso equivocado.
4. **Examen**: sin ayuda ni resultado hasta entregar; cronómetro opcional; puntuación local; revisión posterior.

### 4.4 Shell común de laboratorio

Todas las lecciones computables usan `LabShell`:

- Tarjeta Entrada.
- Tarjeta Parámetros/Clave.
- Tarjeta Salida.
- Barra de acciones: Cifrar/Calcular, Descifrar/Invertir, Intercambiar, Ejemplo, Aleatorio, Reiniciar, Copiar, Compartir y Exportar.
- `RepresentationToggle`: Texto, símbolos, índices, decimal, binario y hexadecimal cuando sean aplicables.
- `NormalizationPreview` con diff.
- `StepPlayer`: anterior, siguiente, reproducir/pausar, velocidad, salto de ronda, lista de pasos y atajos ←/→/espacio.
- `Inspector`: fórmula sustituida con valores, estado anterior, operación, estado nuevo y explicación en lenguaje natural.
- `CompareTray`: fijar una ejecución A y compararla con B; resaltar caracteres/bits/celdas modificados.
- Errores en línea, junto al campo; nunca solo mediante toast.

## 5. Convenciones de datos

### 5.1 Alfabetos

Crear presets editables:

- `ES_27 = ABCDEFGHIJKLMNÑOPQRSTUVWXYZ`.
- `LATIN_26 = ABCDEFGHIJKLMNOPQRSTUVWXYZ`.
- `PLAYFAIR_25 = ABCDEFGHIKLMNOPQRSTUVWXYZ` (I/J comparten casilla; permitir alternativa elegida).
- `ADFGX = ADFGX`.
- `ADFGVX = ADFGVX`.
- `BYTE = 0..255`.

Cada lección declara su alfabeto por defecto. Validar que no haya símbolos repetidos. Acentos se pueden conservar solo si están en el alfabeto; en otro caso el usuario elige entre quitar diacríticos, sustituir o rechazar.

### 5.2 Entrada y salida

- Texto Unicode se convierte explícitamente a UTF-8 cuando el algoritmo opera con bytes.
- Hexadecimal acepta espacios, `0x` opcional y mayúsculas/minúsculas; rechaza longitud impar salvo que el usuario confirme anteponer `0`.
- Binario acepta separadores visuales, pero valida grupos.
- BigInt se serializa como cadena decimal/hex, nunca como JSON number.
- Separar `rawInput`, `normalizedInput` y `displayInput`.

### 5.3 Aleatoriedad

- `SeededRng` reproducible para ejercicios y elecciones homofónicas; implementar `xoshiro128**` o equivalente bien testeado.
- `SecureRng` basado en `crypto.getRandomValues` para claves/nonces del modo real.
- Mostrar y permitir copiar la semilla de un ejercicio.

## 6. Protocolo de trazas y arquitectura de motores

Implementa como mínimo:

```ts
export type TraceValue =
  | { kind: 'text'; value: string }
  | { kind: 'symbols'; value: string[] }
  | { kind: 'numbers'; value: Array<number | string> }
  | { kind: 'bits'; value: string; groups?: number[] }
  | { kind: 'matrix'; value: Array<Array<string | number>>; rowLabels?: string[]; colLabels?: string[] }
  | { kind: 'mapping'; value: Array<{ from: string; to: string }> };

export interface TraceStep {
  id: string;
  phase: string;
  title: string;
  explanation: string;
  formula?: string;
  substitutions?: string[];
  before?: TraceValue;
  after?: TraceValue;
  highlights?: Array<{ target: string; role: 'read' | 'write' | 'key' | 'changed' | 'warning' }>;
  metadata?: Record<string, string | number | boolean>;
}

export interface EngineResult<O> {
  output: O;
  normalizedInput: unknown;
  trace: TraceStep[];
  warnings: string[];
  metrics?: Record<string, number | string>;
}

export interface CryptoEngine<I, O, P> {
  id: string;
  validate(input: I, params: P): ValidationIssue[];
  run(input: I, params: P): EngineResult<O>;
}
```

Cada motor debe:

- Ser puro salvo la aleatoriedad inyectada.
- No depender del DOM.
- Usar tipos propios para sus parámetros.
- Separar `encrypt`, `decrypt` y utilidades matemáticas.
- Poder ejecutar sin traza para pruebas de rendimiento y con traza para la UI.
- Incluir tests de ejemplo, round-trip, bordes y propiedades.

### 6.1 Registro de lecciones

`syllabus.ts` es la única fuente de navegación. Cada definición incluye:

```ts
interface LessonDefinition {
  id: string;
  block: 1 | 2 | 3 | 4 | 5;
  order: number;
  title: string;
  kind: 'cipher' | 'analysis' | 'math' | 'construction' | 'concept';
  route: string;
  engineId?: string;
  defaultMode: 'learn' | 'lab';
  obsolete?: boolean;
  prerequisites: string[];
  learningGoals: string[];
  examSkills: string[];
}
```

No dupliques algoritmos: una lección puede referenciar un motor ya existente y aportar otra explicación/preset.

## 7. Temario y laboratorios — orden exacto

### Bloque 1 — Introducción e historia

#### 1. Escítala lacedemonia estricta

- Motor de transposición rectangular: escribir por filas y leer por columnas; descifrado inverso.
- Parámetros: circunferencia/filas, longitud/columnas, carácter de relleno y opción de omitir padding final.
- Visual: cinta que se enrolla conceptualmente y matriz coloreada; numerar recorrido de escritura y lectura.
- Preset del temario: 4×20 y el ejemplo de 75/80 caracteres.

#### 2. Escítala general / zigzag

- Motor Rail Fence con profundidad ≥2 y dirección inicial configurable.
- Visual: trayectoria animada arriba–abajo–arriba y reconstrucción durante el descifrado.
- Mostrar la permutación de índices.

#### 3. Cuadrado de Polibio

- Tabla 5×5 configurable, convención I/J conjunta y coordenadas fila-columna o columna-fila.
- Cifrar y descifrar, validar pares incompletos y hacer clic en celdas para introducir símbolos.

#### 4. Cifrado Uesugi

- Reutiliza el motor de coordenadas en una tabla 7×7.
- Preset Iroha de 48 símbolos romanizados más una celda libre; permitir cargar cualquier alfabeto de hasta 49 símbolos.
- Mostrar por qué 48 símbolos requieren 7×7.

#### 5. Straddling Checkerboard y tablero CT-46

- Constructor de tablero: permutación de dígitos, seis símbolos frecuentes de código corto y cuatro prefijos de fila.
- Preset CT-46 del temario con columnas `5 0 1 7 9 2 8 3 6 4`:
  - Códigos de un dígito: `5→A, 0→E, 1→I, 7→N, 9→O, 2→R`.
  - Prefijo `8`: `B C D F G H J K L M` según las diez columnas.
  - Prefijo `3`: `P Q S T U V W X Y Z`.
  - Prefijo `6`: espacio, punto, coma, dos puntos, `?`, `/`, `(`, `)`, comillas y `CODE`.
  - Prefijo `4`: dígitos `0..9`.
- Parser visual que marque dónde termina cada código; nunca descifrar por una expresión regular opaca.
- Permitir generar el orden de columnas desde una palabra clave eliminando repetidos, con edición manual posterior.

#### 6. César histórico

- Desplazamiento circular con alfabeto configurable.
- Ruedas concéntricas arrastrables y tabla de sustitución.
- Fuerza bruta de todos los desplazamientos con puntuación lingüística española y elección manual del candidato.

#### 7. Nomenclátores y libros de códigos

- Editor de diccionario donde claves pueden ser letras, palabras o frases; estrategia longest-match para tokenizar.
- Cifrar/descifrar; detectar ambigüedades, códigos repetidos y entradas solapadas.
- Preset pequeño de demostración, no reproducir documentos históricos completos.

#### 8. Discos de Alberti

- Dos discos arrastrables, alfabetos exterior/interior editables.
- Clave: alineamiento inicial, longitud del periodo, incremento y dirección.
- Cifrar/descifrar y mostrar cada giro. Convención por defecto del temario: `Mb,4,3i`.
- Visual SVG con la letra activa, alineamiento y contador hasta el siguiente giro.

#### 9. Porta/Bellaso

- Implementar la tabla Porta estándar de 13 alfabetos recíprocos (AB, CD, …, YZ).
- La mitad `ABCDEFGHIJKLM` se empareja, por fila, con: `NOPQRSTUVWXYZ`, `ZNOPQRSTUVWXY`, `YZNOPQRSTUVWX`, `XYZNOPQRSTUVW`, `WXYZNOPQRSTUV`, `VWXYZNOPQRSTU`, `UVWXYZNOPQRST`, `TUVWXYZNOPQRS`, `STUVWXYZNOPQR`, `RSTUVWXYZNOPQ`, `QRSTUVWXYZNOP`, `PQRSTUVWXYZNO`, `OPQRSTUVWXYZN`. La sustitución inversa de cada fila es recíproca.
- Clave repetida y tabla seleccionada en cada posición.
- Visual de las dos mitades del alfabeto y la fila activa.
- Herramienta de palabra probable: alinear una palabra, derivar filas/clave posibles y descartar posiciones incompatibles.

#### 10. Vigenère con autoclave

- Variantes separadas: clave periódica, key-autokey y text-autokey.
- Tabula recta, tira de clave extendida y fórmula por carácter.
- En descifrado text-autokey, mostrar cómo el texto recuperado realimenta la clave.

#### 11. ADFGX y ADFGVX

- Pipeline explícito: normalización → tabla de Polibio con clave → fraccionamiento en coordenadas → transposición columnar con segunda clave.
- ADFGX 5×5 y ADFGVX 6×6 alfanumérico.
- Constructor de tabla por palabra clave eliminando duplicados.
- Visual en dos pestañas sincronizadas y descifrado en orden inverso.
- Preset ADFGVX: clave de tablero `ANONYMOUS`, clave de transposición `MRPRESIDENT`.

#### 12. Código sindical con desplazamiento

- Libro de códigos ordenado y clave numérica: al cifrar avanzar `k`, al descifrar retroceder `k` con aritmética circular.
- Mostrar número base, suma/resta y palabra seleccionada.

### Bloque 2 — Soluciones criptográficas clásicas

#### 13. Sistema secreto y propiedades

- Simulador conceptual de espacios de mensajes/criptogramas con permutaciones pequeñas.
- El usuario puede crear una función no biyectiva y observar por qué no se puede descifrar sin ambigüedad.
- Experimento de cambiar un bit de mensaje o clave y medir correlación.

#### 14. César formal

- Reutiliza César, añade índices y fórmulas `c=(m+k) mod |A|`, `m=(c-k) mod |A|`.

#### 15. Sustitución afín y monoalfabética

- Afín: `c=(a·m+b) mod n`; descifrado con inverso modular.
- Validar `gcd(a,n)=1`; explicar por qué de lo contrario no es reversible.
- Preset: `n=27, a=7, b=3`, inverso `a⁻¹=4`, `m=(4c+15) mod 27`.
- Constructor de sustitución por palabra o frase clave, eliminando repetidos y completando con símbolos ausentes.

#### 16. Cifra de Arnold / libro

- El usuario pega un texto dividido en páginas/líneas o usa un preset breve.
- Cifrar palabras como `página.línea.palabra`; descifrar coordenadas; validar límites.
- Convenciones de tokenización visibles y configurables.

#### 17. Cifrado homofónico

- Editor letra → lista de códigos; validar que cada código pertenezca a una sola letra.
- Elección aleatoria reproducible o estrategia round-robin.
- Histograma antes/después para comprobar cómo se aplanan frecuencias.
- Generador automático que reparte N códigos proporcionalmente a frecuencias españolas.

#### 18. Vigenère y autoclave formal

- Reutiliza el motor 10; añade comparación simultánea entre periódica, key-autokey y text-autokey.

#### 19. Vernam y One-Time Pad

- Dos variantes:
  - XOR por bytes, entrada texto/hex y clave de igual longitud.
  - CT-46 decimal: codificar a dígitos, restar clave sin acarreo para cifrar y sumar sin acarreo para descifrar.
- Comprobar longitud de clave y mostrar reutilización peligrosa: `C1 XOR C2 = M1 XOR M2`.
- Generar clave segura solo para modo real; clave sembrada para ejercicios reproducibles.

#### 20. Playfair

- Matriz 5×5 por palabra clave, preparación de digramas, separación de dobles con relleno y padding final.
- Reglas fila, columna y rectángulo, con inversas al descifrar.
- Visual que resalte el par y las celdas de salida.
- La preparación del texto debe ser reversible en lo matemático, pero avisar de la ambigüedad al quitar rellenos.

#### 21. Hill

- Matrices 2×2 y 3×3 sobre módulo configurable.
- Calcular determinante, gcd, inverso modular y matriz inversa paso a paso.
- Rechazar matrices no invertibles explicando el motivo.
- Preset módulo 26: `K=[[9,4],[5,7]]`, `K⁻¹=[[5,12],[15,25]]`.
- Multiplicación matriz-vector por bloque y ataque de texto conocido reducido para 2×2.

#### 22. Pautas de barajado

- Editor de permutación arbitraria de índices y recorridos gráficos sobre una cuadrícula.
- Permitir dibujar/seleccionar una ruta y ver la permutación resultante.

#### 23. Übchi — doble transposición columnar

- Transposición columnar estable incluso con letras repetidas en la clave: ordenar por símbolo y después por índice original.
- Aplicar dos claves sucesivas; descifrar en orden inverso.
- Mostrar longitud irregular de columnas sin rellenar y opción de padding explícito.
- Preset `PRISION` y `MAYOR`, con claves numéricas visibles.

#### 24. Transposición columnar sencilla

- Reutiliza el motor de una etapa; vista de matriz, ranking de columnas y lectura.
- Incluye modo reto con longitud de clave conocida.

#### 25. Transposición interrumpida I y II

- Variante I: longitud de cada fila termina al alcanzar la columna cuyo ranking coincide con el número de fila; los huecos quedan vacíos.
- Variante II: escribir primera mitad siguiendo la pauta y rellenar huecos con la segunda mitad.
- Visual de huecos y lectura de columnas; la regla exacta debe estar descrita junto al cálculo.

#### 26. Rejilla de Cardano giratoria

- Tamaños pares 4×4, 6×6 y 8×8.
- Editor de ventanas que impida solapamientos entre las cuatro rotaciones y exija exactamente `n²/4` agujeros.
- Rotaciones de 90° en sentido configurable, cifrar/descifrar y animar los cuatro giros.
- Ofrecer generador de rejillas válidas con semilla.

#### 27. M-209

- Simulador completo con seis ruedas de longitudes 26, 25, 23, 21, 19 y 17; pines activos; 27 barras y dos lugs por barra.
- UI de ruedas, pines y lugs; importar/exportar configuración JSON.
- Cada carácter muestra ruedas activas, barras desplazadas, desplazamiento total, letra de clave y operación Beaufort.
- Incluir:
  - modo `Temario-27`, que sigue la fórmula mostrada `c=(k-m) mod 27` y el alfabeto del curso;
  - modo `Histórico-26`, etiquetado claramente, con alfabeto A–Z.
- Autocomprobación de 26 letras A para verificar estado interno.
- No simplificar a una secuencia aleatoria genérica.

#### 28. Enigma M3

- Implementar rotores Wehrmacht I–V, reflectores B/C, orden de tres rotores, posiciones, Ringstellung y clavijero.
- Avance históricamente correcto con double-stepping.
- Recorrido eléctrico animado: clavijero → rotores ida → reflector → rotores vuelta → clavijero.
- Panel de cableado y comparación de configuración.
- Cifrado recíproco; normalización A–Z; lámparas/teclado accesibles.
- Vector mínimo obligatorio: reflector B, rotores I-II-III de izquierda a derecha, Ringstellung AAA, posiciones iniciales AAA, sin clavijero: `AAAAA → BDZGO` y `HELLOWORLD → ILBDAAMTAZ` desde el estado inicial AAA en una ejecución independiente.

### Bloque 3 — Criptoanálisis y algoritmos actuales

#### 29. Modelos y niveles de criptoanálisis

- Actividad clasificatoria interactiva: solo criptograma, texto conocido/elegido, texto cifrado elegido, adaptativo y claves relacionadas; ruptura total/global/particular/información/discriminante.

#### 30. Análisis de frecuencias

- Contar monogramas, digramas, trigramas, palabras por longitud y frecuencias de contacto.
- Histogramas por orden alfabético y descendente; referencia española/inglesa editable.
- Banco de sustituciones provisional: arrastrar equivalencias y ver texto parcial.
- Preservar espacios opcionalmente para análisis de patrones.

#### 31. Método Kasiski

- Encontrar n-gramas repetidos con longitud mínima configurable.
- Mostrar posiciones, distancias, factorización, gcd y ranking de periodos candidatos.
- Al elegir periodo, repartir el criptograma en columnas por índice módulo periodo.
- Integrar análisis de frecuencia/IC por columna y sugerir desplazamientos Vigenère sin resolverlos de forma opaca.

#### 32. Índice de coincidencia

- Fórmula `IC=Σ fᵢ(fᵢ−1)/(N(N−1))`, tabla término a término y referencias por idioma.
- Preset del temario: N=102, numerador 738, IC≈0,0716.
- Graficar IC por longitud de clave candidata (promedio de columnas).

#### 33. Superposición de Kerckhoffs

- Deslizador de desplazamiento entre dos secuencias; contar coincidencias y resaltar posiciones.
- Comparar con κr y κp; localizar periodos.

#### 34. Test de Kullback φ

- Calcular `φobs=Σfᵢ(fᵢ−1)`, `φr=N(N−1)κr` y `φp=N(N−1)κp`.
- Mostrar distancia a cada hipótesis y advertir que es evidencia estadística, no certeza.

#### 35. “χ²” por solapamiento del temario

- Implementar exactamente `χobs=Σ fI,i·fII,i`, con referencias `χr=κr·NI·NII` y `χp=κp·NI·NII`.
- Llamarlo en la UI `Test de solapamiento χ (denominado χ² en el temario)` y añadir nota: no es el χ² de Pearson `Σ(O−E)²/E`.

#### 36. Difusión, confusión y Feistel

- Red Feistel parametrizable con mitades de 8/16/32 bits y 1–16 rondas.
- Función docente predeterminada `F(R,K)=ROTL(R XOR K,1)` recortada al ancho; permitir otras dos funciones seguras solo para demostración.
- Mostrar `Lᵢ=Rᵢ₋₁`, `Rᵢ=Lᵢ₋₁ XOR F(Rᵢ₋₁,Kᵢ)` y descifrado con subclaves inversas.
- Experimento de avalancha cambiando un bit.

#### 37. DES

- Implementación completa estándar: IP, FP, expansión E, key schedule PC-1/rotaciones/PC-2, 16 rondas, 8 S-boxes y permutación P.
- Inspector de ronda, S-box y subclave; selección de bit para seguir su propagación.
- Vector obligatorio: clave `133457799BBCDFF1`, claro `0123456789ABCDEF`, cifrado `85E813540F0AB405`.
- Gráfica de avalancha por ronda para cambio de bit en mensaje o clave.

#### 38. Ataques a DES

- Fuerza bruta solo sobre un DES reducido configurable, ejecutado en Web Worker con cancelar/progreso.
- Laboratorio conceptual de diferencial: comparar XOR de pares a través de una Feistel reducida.
- Laboratorio conceptual lineal: evaluar una aproximación sobre muchas muestras y mostrar sesgo respecto de 0,5.
- No fingir que el navegador atacará DES completo.

### Bloque 4 — Modos, cifradores modernos, hash y autenticación

#### 39. Modos ECB, CBC, CFB, OFB y CTR

- Dos motores de bloque seleccionables:
  - juguete de 8 bits `Eₖ(x)=(x+k) mod 256`, `Dₖ(x)=(x−k) mod 256`, para ver todos los valores;
  - AES-128 para ejecución real.
- Diagramas por bloque y fórmulas de cifrado/descifrado.
- IV/nonce/contador editables con validación de longitud y unicidad.
- Errores simulados: cambiar/eliminar/insertar un bit o bloque y visualizar propagación.
- Comparación paralela de patrones; demo con imagen generada localmente mediante canvas, sin archivos externos.
- Padding PKCS#7 para ECB/CBC y cola parcial para CFB/OFB/CTR.

#### 40. 2DES y ataque meet-in-the-middle

- 2DES real con el motor DES.
- Demostración MITM con espacio de claves reducido de 8–20 bits por etapa, tabla intermedia, coincidencias y segundo par para filtrar falsos positivos.
- Web Worker, progreso, memoria estimada y cancelación.

#### 41. 3DES

- EDE con dos claves (`K1,K2,K1`) y tres claves (`K1,K2,K3`), cifrar/descifrar y traza por etapa.
- Compatibilidad: si las claves coinciden, mostrar relación con DES.

#### 42. IDEA

- Implementación completa de 8 rondas + transformación final.
- XOR, suma mod 2¹⁶ y multiplicación mod 65537 representando 0 como 65536.
- Key schedule de 52 subclaves de 16 bits y generación correcta de subclaves de descifrado.
- Inspector de una ronda con sus seis subclaves.
- Vector obligatorio: clave `00010002000300040005000600070008`, claro `0000000100020003`, cifrado `11FBED2B01986DE5`.

#### 43. Blowfish

- Implementación completa con P-array de 18 entradas y cuatro S-boxes de 256 entradas inicializadas con las constantes estándar de π.
- Expansión de clave mediante 521 cifrados; mostrar progreso y permitir inspeccionar primeras/últimas sustituciones.
- 16 rondas Feistel y función F detallada.
- Vector obligatorio: clave y claro `0000000000000000`, cifrado `4EF997456198DD78`.

#### 44. AES

- AES-128 completo con key expansion, AddRoundKey inicial, 9 rondas completas y ronda final sin MixColumns.
- Soportar AES-192/256 en modo estándar; la traza completa se exige al menos para AES-128.
- Matriz de estado 4×4 en orden column-major y operaciones SubBytes, ShiftRows, MixColumns y AddRoundKey, más inversas.
- Visual de GF(2⁸) para una multiplicación de MixColumns.
- Vector obligatorio: clave `000102030405060708090A0B0C0D0E0F`, claro `00112233445566778899AABBCCDDEEFF`, cifrado `69C4E0D86A7B0430D8CDB78070B4C55A`.
- Comparar resultado con Web Crypto en CBC/CTR cuando corresponda.

#### 45. Cifradores síncronos y autosincronizantes

- Simulador con registro pequeño configurable.
- Insertar, borrar o alterar un bit del criptograma y comparar pérdida/recuperación de sincronía.
- Mostrar memoria/estado en cada paso.

#### 46. RC4

- KSA y PRGA completos con S[256], índices i/j, intercambio y byte de salida.
- Vista compacta 16×16 del estado y zoom del intercambio actual.
- Cifrar/descifrar por XOR.
- Vector obligatorio: clave ASCII `Key`, texto `Plaintext`, cifrado hex `BBF316E8D940AF0AD3`.

#### 47. Hash, preimagen y colisiones

- Demo de tabla hash no criptográfica para explicar compresión/colisiones.
- Calculadoras exactas:
  - preimagen: `P=1−(1−1/2ⁿ)^k`;
  - cumpleaños: producto exacto/logarítmico y aproximación `1−exp(−k(k−1)/(2·2ⁿ))`.
- Mostrar la aproximación del temario `k≈2^(n−1)` para 50% de preimagen junto al valor exacto `k≈ln(2)·2ⁿ`; no presentarlos como idénticos.
- Gráficas interactivas para n pequeño y escalas logarítmicas.

#### 48. Construcción iterada y padding

- Visualizar división en bloques, IV, variable de encadenamiento y función de compresión juguete.
- Comparar padding de ceros, `1||0*` y `1||0*||longitud`.
- Demostrar ambigüedad del relleno de ceros con contraejemplo.

#### 49. MAC y autenticación

- Comparar hash simple, MAC y firma.
- HMAC-SHA-256 real con Web Crypto y traza didáctica de `ipad`, `opad`, hash interior y exterior.
- Simular alteración del mensaje/etiqueta y verificación.
- Aclarar que dos poseedores de la misma clave pueden crear el MAC.

#### 50. SHA-1 y familia SHA-2

- SHA-1 didáctico completo: padding, 16→80 palabras, cinco registros, 80 rondas agrupadas 0–19, 20–39, 40–59, 60–79.
- Vector: SHA-1 de cadena vacía `DA39A3EE5E6B4B0D3255BFEF95601890AFD80709`.
- SHA-256 didáctico completo para al menos un bloque; SHA-224/384/512 disponibles mediante Web Crypto y comparación estructural.
- Vector SHA-256 de `abc`: `BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD`.
- Insignia de obsolescencia para SHA-1.

#### 51. Davies–Meyer y Merkle–Damgård

- Compresión Davies–Meyer con el cifrador juguete: `Hᵢ=E_{mᵢ}(Hᵢ₋₁) XOR Hᵢ₋₁`.
- Buscar/mostrar puntos fijos en espacio pequeño.
- Cadena Merkle–Damgård por bloques, con inspección de cada estado.

#### 52. Esponja criptográfica

- Esponja juguete de estado 16 bits, rate 8, capacity 8 y permutación reversible fija documentada.
- Absorción, padding `10*1`, permutación y squeezing animados.
- Configurar longitud de salida y demostrar que puede producir varios bloques.
- Explicar rate/capacity y no llamarlo SHA-3.

### Bloque 5 — Aritmética y criptografía asimétrica

#### 53. Factores primos, divisores y φ de Euler

- Factorización por división para BigInt didácticos, árbol de factores y lista de divisores.
- Calcular `φ(n)=Π(pᵅ−pᵅ⁻¹)` y porcentaje de coprimos.
- Preset `720=2⁴·3²·5`, `φ(720)=192`.

#### 54. Aritmética modular

- Suma, resta, producto, potencia rápida, gcd, algoritmo extendido de Euclides e inverso modular.
- Tablas mod n para n≤20; colorear permutaciones frente a compresiones.
- Mostrar pasos de square-and-multiply y del Euclides extendido.

#### 55. Fermat y Euler

- Verificador interactivo de hipótesis y conclusión.
- Enumerar residuos y mostrar la permutación por multiplicar por `a`.
- Encontrar contraejemplos al omitir “p primo” o “gcd(a,n)=1”.

#### 56. Primalidad y Miller–Rabin

- División de prueba para números pequeños.
- Miller–Rabin estándar: escribir `n−1=2ˢ·d`, calcular `aᵈ mod n`, cuadrados sucesivos y testigo.
- Repetición con bases sembradas o seguras.
- Mostrar la cota estándar de falsos positivos `≤4^(−t)` y, en una nota “convención de la diapositiva”, la cota simplificada `2^(−k)` que aparece en el material.
- Preset compuesto `n=21, a=2`.

#### 57. Funciones de sentido único y criptografía asimétrica

- Simulación conceptual con funciones pequeñas: directa fácil, inversión por búsqueda y puerta trasera.
- Diagrama clave pública/privada y actividad para elegir qué clave usa cada actor.

#### 58. Firma digital

- Modo didáctico RSA pequeño sobre hash reducido y modo real RSA-PSS con Web Crypto.
- Flujo: hash → firma privada → verificación pública; alterar documento/firma/clave y observar fallo.
- No describir firma como “cifrar el documento con la privada” sin la aclaración de que los esquemas reales firman un resumen codificado.

#### 59. RSA

- Generación didáctica: p, q, n, φ(n), elegir e, calcular d por Euclides extendido.
- Cifrado `C=M^e mod n`, descifrado `M=C^d mod n`, firma/verificación didácticas.
- Preset: p=61, q=53, n=3233, φ=3120, e=17, d=2753, M=65, C=2790.
- Validar `0≤M<n`, p≠q, primalidad y gcd.
- Modo real RSA-OAEP/PSS con generación 2048 bits vía Web Crypto y advertencia de padding.

#### 60. ElGamal

- Grupo multiplicativo mod p; clave privada u y pública `y=αᵘ mod p`.
- Cifrado con nonce fresco `v`: `(c1,c2)=(αᵛ, M·yᵛ) mod p`; descifrado usando inverso modular.
- Preset: p=23, α=5, u=6, y=8, v=3, M=13, resultado `(10,9)`.
- Laboratorio de reutilización de nonce y maleabilidad multiplicativa.

#### 61. Diffie–Hellman

- Dos columnas A/B, secretos, valores públicos y cálculo del mismo K.
- Preset q=23, α=5, xA=6, yA=8, xB=15, yB=19, K=2.
- Simulación visual de intermediario que establece dos secretos distintos.
- Derivación conceptual de clave; no usar directamente K pequeño como AES.

#### 62. Curvas elípticas

- Curva didáctica `y²=x³+2x+2 mod 17`, G=(5,1), orden 19.
- Enumerar puntos, punto al infinito, suma, doblado y multiplicación escalar double-and-add.
- Visual plano discreto; mostrar pendiente y aritmética modular.
- ECDH pequeño con dos escalares; distinguir visualización real continua de operaciones en campo finito.

#### 63. Cifrado híbrido

- Simular: generar clave AES, cifrar datos con AES-GCM y proteger la clave con RSA-OAEP.
- Diagrama de sobre digital; ejecutar y verificar en Web Crypto.
- Alterar cada componente y explicar cuál falla.

#### 64. PKI, certificados y gestión de claves

- Constructor visual de cadena raíz → intermedia → servidor con estados válido, caducado, nombre incorrecto, uso incorrecto y revocado simulado.
- Ciclo de vida de claves: generar, distribuir, almacenar, usar, rotar, revocar y destruir.
- Es una lección interactiva conceptual; no construir una CA real.

## 8. Componentes visuales reutilizables

Implementa y reutiliza:

- `AlphabetStrip`, `RotatingAlphabetDisks`, `SymbolMappingTable`.
- `MatrixGrid`, `PathGrid`, `CardanoGrid`, `StateMatrix`.
- `BitRow`, `BitDiff`, `ByteGrid`, `HexInput`.
- `FormulaCard`, `SubstitutionFormula`, `EuclidTable`.
- `PipelineDiagram`, `FeistelDiagram`, `BlockModeDiagram`, `SpongeDiagram`.
- `Rotor`, `Plugboard`, `Lampboard`, `M209Wheel`, `LugBarEditor`.
- `FrequencyChart`, `CoincidenceChart`, `AvalancheChart`, `ProbabilityChart`.
- `TraceTimeline`, `StepInspector`, `CompareRuns`.
- `ExercisePanel`, `HintLadder`, `AnswerFeedback`, `ProgressBadge`.

Todos los SVG deben tener título/descripcion accesible. Las celdas resaltadas deben usar color + borde/patrón/icono, no solo color.

## 9. Organización del código

Usa una estructura equivalente a:

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    layouts/
  data/
    syllabus.ts
    alphabets.ts
    presets/
    referenceFrequencies.ts
  domain/
    engine.ts
    trace.ts
    validation.ts
    serialization.ts
  engines/
    classical/
    transposition/
    machines/
    cryptanalysis/
    block/
    stream/
    hash/
    numberTheory/
    asymmetric/
  features/
    lessons/
    practice/
    exam/
    compare/
    progress/
  components/
    lab/
    visualizers/
    forms/
    charts/
    ui/
  workers/
    bruteForce.worker.ts
    mitm.worker.ts
    heavyCrypto.worker.ts
  store/
  utils/
  styles/
  tests/
e2e/
public/
```

No crear un componente monolítico por cada lección. Los componentes específicos deben componer el shell y visualizadores reutilizables.

## 10. Estado, URLs y persistencia

- Ruta estable por lección: `/bloque/:block/:lessonId`.
- Modo en query param `?mode=learn|lab|practice|exam`.
- Parámetros compartibles se serializan con versión de esquema, se comprimen si hace falta y se validan con Zod.
- Por defecto, Compartir excluye claves y mensajes marcados sensibles; permitir incluirlos solo tras confirmación explícita.
- Guardar localmente: progreso, tema, preferencias de alfabeto, sesiones fijadas y resultados de práctica.
- Botón “Borrar mis datos locales” con confirmación.
- Importar/exportar sesión JSON con `schemaVersion` y migraciones.

## 11. Práctica y examen

Crear un generador de ejercicios por lección con dificultad 1–5.

- Nivel 1: entradas pequeñas y pasos guiados.
- Nivel 2: cálculo directo con una pista.
- Nivel 3: descifrado o parámetro desconocido.
- Nivel 4: combinación de etapas/diagnóstico de error.
- Nivel 5: ejercicio tipo examen con distractores y sin pista.

La corrección debe comparar el estado matemático, no solo la cadena final cuando existan representaciones equivalentes. Registrar localmente aciertos, intentos, tiempo y pistas usadas. El dashboard recomienda repaso por errores recientes, sin algoritmo de IA ni nube.

Incluye al menos 3 plantillas de ejercicio por lección computable y 2 por lección conceptual. Los valores se generan desde semilla; no hace falta escribir cientos de preguntas a mano.

## 12. Rendimiento y seguridad de la propia app

- Web Workers para brute force, MITM, expansión Blowfish con traza extensa y cálculos de muchos puntos/primos.
- Cada tarea larga debe informar progreso, aceptar cancelación y tener límites de entrada.
- Límites iniciales razonables: 10 000 caracteres en cifrados clásicos; 1 MiB en hash real; matrices Hill hasta 3×3; curvas y grupos pequeños en modo didáctico.
- No ejecutar código del usuario ni interpretar HTML.
- Escapar contenido importado.
- No guardar claves reales en IndexedDB/localStorage salvo acción explícita; mostrar advertencia.
- PWA sin analytics, trackers ni peticiones externas.

## 13. Accesibilidad

- WCAG 2.2 AA como objetivo.
- Navegación completa por teclado.
- Focus visible y orden lógico.
- Etiquetas y descripciones en formularios.
- Mensajes de error asociados por `aria-describedby`.
- Tablas con encabezados; gráficos con resumen textual y tabla de datos alternativa.
- Animación pausada/reducida cuando corresponda.
- Lectura de paso actual mediante región `aria-live` no intrusiva.

## 14. Tests obligatorios

### 14.1 Unitarios y propiedades

Para cada cifrador reversible:

- Vector conocido si existe.
- `decrypt(encrypt(m,k),k) === normalized(m)` con `fast-check`.
- Claves/entradas inválidas.
- Vacío, un símbolo, bloque exacto, bloque incompleto y caracteres fuera de alfabeto.

Para matemáticas:

- `a·modInverse(a,n) mod n = 1` cuando gcd=1.
- `modPow` comparado con implementación ingenua en dominios pequeños.
- Matriz Hill multiplicada por inversa = identidad módulo n.
- Suma ECC cerrada y `nG=O` para la curva preset.

Para trazas:

- El estado final de la traza coincide con output.
- IDs únicos y orden estable.
- Una traza desactivada no cambia el resultado.

### 14.2 Vectores mínimos que deben pasar

1. DES, AES, IDEA, Blowfish y RC4 indicados en cada lección.
2. SHA-1 vacío y SHA-256 `abc` indicados arriba.
3. RSA, ElGamal y DH pequeños indicados arriba.
4. Hill `K·K⁻¹=I mod 26` para el preset.
5. IC del ejemplo ≈0,0716.
6. Cardano: cada celda cubierta exactamente una vez en cuatro giros.
7. Enigma: vectores documentados en fixtures con configuración completa.

### 14.3 Componentes y E2E

- Validación de alfabeto, hex y BigInt.
- StepPlayer por botones y teclado.
- Navegación de los 5 bloques.
- Flujo E2E: César, Playfair, DES, AES, Kasiski, RSA y DH.
- Persistencia del progreso y borrado.
- Tema oscuro y layout móvil.
- PWA carga offline de una lección ya visitada.

## 15. Documentación del repositorio

Crear:

- `README.md` con requisitos, instalación, scripts, estructura y límites educativos.
- `docs/CONVENTIONS.md` con alfabetos, normalización, índices, endianness y padding.
- `docs/ALGORITHM_COVERAGE.md` con las 64 lecciones y su estado, ruta, motor, tests y vector de referencia. Al finalizar todo debe figurar `complete`.
- `docs/TRACE_PROTOCOL.md`.
- `docs/SECURITY_NOTE.md` aclarando que es software educativo y qué algoritmos están obsoletos.

Scripts mínimos:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "check": "npm run lint && npm run test && npm run build"
}
```

## 16. Criterios de aceptación

La tarea solo está terminada cuando:

1. Las 64 lecciones aparecen en el orden especificado y abren sin error.
2. Todos los laboratorios descritos calculan resultados reales; no hay botones falsos, placeholders ni `TODO`.
3. Cifrar/descifrar funciona y la traza explica el resultado.
4. Los vectores obligatorios pasan.
5. `npm run check` termina con código 0.
6. Los E2E críticos pasan en Chromium.
7. La aplicación funciona a 1366×768 y 390×844 sin scroll horizontal global.
8. No hay errores ni warnings evitables en consola.
9. Lighthouse en producción obtiene como objetivo ≥90 en Accesibilidad, Buenas prácticas y SEO; rendimiento ≥80.
10. README y los cuatro documentos de `docs/` están completos.
11. Se ha ejecutado una revisión final de cobertura comparando `syllabus.ts` con esta especificación.

## 17. Forma de trabajo exigida a Codex

1. Inspecciona primero el repositorio y conserva cualquier trabajo útil existente.
2. Si está vacío, inicializa el proyecto en el directorio actual, no en una subcarpeta innecesaria.
3. Escribe un plan interno corto y empieza a implementar; no me devuelvas solo el plan.
4. Construye primero el núcleo de tipos, matemáticas, trazas, `LabShell` y registro de lecciones; después completa motores y páginas por bloque.
5. Ejecuta tests de forma incremental.
6. Corrige todos los fallos que estén dentro del alcance.
7. Antes de terminar, ejecuta `npm run check` y los E2E críticos.
8. Entrega un resumen conciso: qué se construyó, cómo ejecutarlo, pruebas realizadas y cualquier limitación real. Una limitación no puede ser una lección omitida.

No pidas al usuario que elija librerías, colores, estructura o convenciones ya resueltas aquí. Solo pregunta si existe un bloqueo externo imposible de inferir, como una versión de Node incompatible que no puedas actualizar. Implementa la aplicación completa en esta iteración.
