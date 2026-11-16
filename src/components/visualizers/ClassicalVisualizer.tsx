import { ArrowDown, ArrowRight, Eye, Grid3X3 } from 'lucide-react';
import type { LessonDefinition } from '../../data/syllabus';
import type { EngineResult, TraceValue } from '../../domain/engine';
import { ALPHABETS, normalizeText } from '../../data/alphabets';
import {
  encodeCt46Tokens,
  getAdfgvxState,
  getSyndicalTokens,
  parseAlbertiKey,
  parseCt46Codes,
  parseNomenclatorKey,
  SYNDICAL_CODEBOOK,
  tokenizeNomenclator,
  transformAlberti,
  transformPorta,
} from '../../engines/classical';

interface Props {
  lesson: LessonDefinition;
  input: string;
  keyValue: string;
  decrypt: boolean;
  result: EngineResult<string>;
  activeStep: number;
}

const cells = (value: string) =>
  [...value].map((char, index) => (
    <span className="viz-cell" key={`${index}-${char}`}>
      <b>{char === ' ' ? '·' : char}</b>
      <small>{index + 1}</small>
    </span>
  ));
const rankKey = (key: string) =>
  [...key]
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index)
    .reduce<number[]>((out, item, rank) => {
      out[item.index] = rank + 1;
      return out;
    }, []);

function Scytale({
  input,
  keyValue,
  decrypt,
}: {
  input: string;
  keyValue: string;
  decrypt: boolean;
}) {
  const rows = Math.max(2, Number.parseInt(keyValue, 10) || 4),
    cols = Math.ceil(input.length / rows),
    padded = input.toUpperCase().padEnd(rows * cols, '·');
  const matrix = Array.from({ length: rows }, () => Array<string>(cols).fill(''));
  if (decrypt) {
    let p = 0;
    for (let col = 0; col < cols; col++)
      for (let row = 0; row < rows; row++) matrix[row]![col] = padded[p++] ?? '·';
  } else
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) matrix[row]![col] = padded[row * cols + col] ?? '·';
  return (
    <>
      <p className="viz-caption">
        La cinta se representa desenrollada. Los números azules indican el orden de escritura; sigue
        las flechas verticales para obtener la lectura por columnas.
      </p>
      <div className="matrix-wrap">
        <div className="matrix-labels rows">
          {Array.from({ length: rows }, (_, i) => (
            <span key={i}>Fila {i + 1}</span>
          ))}
        </div>
        <div
          className="crypto-matrix"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(34px,1fr))` }}
        >
          {matrix.flatMap((row, r) =>
            row.map((char, c) => (
              <span className="viz-cell path-cell" key={`${r}-${c}`}>
                <b>{char === ' ' ? '·' : char}</b>
                <small>{r * cols + c + 1}</small>
                <i>{c * rows + r + 1}</i>
              </span>
            )),
          )}
        </div>
      </div>
      <div className="viz-legend">
        <span>
          <i className="dot write" />
          orden de escritura
        </span>
        <span>
          <i className="dot read" />
          orden de lectura
        </span>
        <strong>
          {rows} × {cols} = {rows * cols} celdas
        </strong>
      </div>
    </>
  );
}

function RailFence({ input, keyValue }: { input: string; keyValue: string }) {
  const depth = Math.max(2, Number.parseInt(keyValue, 10) || 3),
    text = input.toUpperCase(),
    period = 2 * (depth - 1);
  return (
    <>
      <p className="viz-caption">
        Cada símbolo baja y sube entre los rieles. La línea continua permite ver el periodo completo
        del zigzag.
      </p>
      <div
        className="rail-grid"
        style={{
          gridTemplateRows: `repeat(${depth},38px)`,
          gridTemplateColumns: `repeat(${Math.max(text.length, 1)},32px)`,
        }}
      >
        {[...text].map((char, i) => {
          const x = i % period,
            row = x < depth ? x : period - x;
          return (
            <span key={i} style={{ gridRow: row + 1, gridColumn: i + 1 }}>
              <b>{char}</b>
              <small>{i + 1}</small>
            </span>
          );
        })}
      </div>
      <div className="viz-legend">
        <strong>Profundidad {depth}</strong>
        <span>Periodo {period}</span>
      </div>
    </>
  );
}

function CoordinateGrid({ size, input }: { size: number; input: string }) {
  const alphabet =
      size === 5 ? ALPHABETS.PLAYFAIR_25 : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijkl',
    active = new Set([...normalizeText(input, alphabet)]);
  return (
    <>
      <p className="viz-caption">
        Cruza la cabecera de fila con la de columna. Las celdas utilizadas por el ejemplo aparecen
        resaltadas.
      </p>
      <div
        className="coordinate-grid"
        style={{ gridTemplateColumns: `32px repeat(${size}, minmax(36px,1fr))` }}
      >
        <span className="corner">↘</span>
        {Array.from({ length: size }, (_, i) => (
          <span className="axis" key={`c${i}`}>
            {i + 1}
          </span>
        ))}
        {Array.from({ length: size }, (_, r) => (
          <span className="coord-row" key={r} style={{ display: 'contents' }}>
            <span className="axis">{r + 1}</span>
            {Array.from({ length: size }, (_, c) => {
              const char = alphabet[r * size + c] ?? '·';
              return (
                <span className={`viz-cell ${active.has(char) ? 'active' : ''}`} key={`${r}-${c}`}>
                  <b>{char}</b>
                  <small>
                    {r + 1}
                    {c + 1}
                  </small>
                </span>
              );
            })}
          </span>
        ))}
      </div>
    </>
  );
}

function Checkerboard({ activeCodes }: { activeCodes: Set<string> }) {
  const cols = ['5', '0', '1', '7', '9', '2', '8', '3', '6', '4'],
    short = ['A', 'E', 'I', 'N', 'O', 'R', '', '', '', ''];
  const rows: [string, string[]][] = [
    ['8', [...'BCDFGHJKLM']],
    ['3', [...'PQSTUVWXYZ']],
    ['6', ['ESP', '.', ',', ':', '?', '/', '(', ')', '”', 'CODE']],
    ['4', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']],
  ];
  return (
    <>
      <p className="viz-caption">
        Los seis símbolos frecuentes usan un dígito. Si aparece 8, 3, 6 o 4, ese dígito abre una
        segunda fila y el siguiente elige la columna.
      </p>
      <div className="checker">
        <div className="checker-row">
          <span className="axis">pref.</span>
          {cols.map((x) => (
            <span className="axis" key={x}>
              {x}
            </span>
          ))}
        </div>
        <div className="checker-row">
          <span className="axis">corto</span>
          {short.map((x, i) => {
            const code = x ? (cols[i] ?? '') : '';
            return (
              <span className={`viz-cell ${activeCodes.has(code) ? 'active' : ''}`} key={i}>
                <b>{x || '·'}</b>
                <small>{code}</small>
              </span>
            );
          })}
        </div>
        {rows.map(([prefix, values]) => (
          <div className="checker-row" key={prefix}>
            <span className="axis">fila {prefix}</span>
            {values.map((x, i) => {
              const code = `${prefix}${cols[i]}`;
              return (
                <span className={`viz-cell ${activeCodes.has(code) ? 'active' : ''}`} key={i}>
                  <b>{x}</b>
                  <small>{code}</small>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function Ct46Walkthrough({
  input,
  result,
  decrypt,
}: {
  input: string;
  result: string;
  decrypt: boolean;
}) {
  const pairs = decrypt ? parseCt46Codes(input) : encodeCt46Tokens(input);
  const activeCodes = new Set(pairs.map((pair) => pair.code));
  return (
    <>
      <div className="ct46-guide">
        <strong>Cómo se lee el tablero</strong>
        <ol>
          <li>
            <b>Fila corta:</b> A está directamente bajo la columna 5, luego <code>A → 5</code>.
          </li>
          <li>
            <b>Filas largas:</b> T está en la fila de prefijo 3 y bajo la columna 7, luego{' '}
            <code>T → 37</code>.
          </li>
          <li>
            <b>Espacios, signos y cifras:</b> espacio está en fila 6/columna 5 (
            <code>ESP → 65</code>); el dígito 2 está en fila 4/columna 1 (<code>2 → 41</code>).
          </li>
        </ol>
      </div>
      <Checkerboard activeCodes={activeCodes} />
      <div className="ct46-walk">
        <h3>
          {decrypt ? 'El parser consume el criptograma' : 'Descomposición de ATAQUE A LAS 20:00'}
        </h3>
        <div>
          {pairs.map((pair, index) => (
            <span key={`${pair.code}-${index}`}>
              <b>{pair.symbol === ' ' ? 'ESP' : pair.symbol}</b>
              <i>→</i>
              <code>{pair.code}</code>
            </span>
          ))}
        </div>
        <p>
          {decrypt
            ? 'Los prefijos 8, 3, 6 y 4 obligan a consumir un segundo dígito. Resultado:'
            : 'Se concatenan los códigos, sin espacios entre ellos:'}{' '}
          <strong>{decrypt ? result : pairs.map((pair) => pair.code).join('')}</strong>
        </p>
      </div>
    </>
  );
}

function Disks({
  input,
  keyValue,
  order,
  decrypt,
  activeStep,
}: {
  input: string;
  keyValue: string;
  order: number;
  decrypt: boolean;
  activeStep: number;
}) {
  const isAlberti = order === 8;
  const settings = parseAlbertiKey(keyValue);
  const tokens = isAlberti ? transformAlberti(input, keyValue, decrypt) : [];
  const token = tokens[Math.min(activeStep, Math.max(0, tokens.length - 1))];
  const shift = isAlberti
    ? (token?.shift ?? settings.initialShift)
    : Number.parseInt(keyValue, 10) || 3;
  const letters = [...ALPHABETS.LATIN_26];
  const outerActive = token ? ALPHABETS.LATIN_26.indexOf(decrypt ? token.output : token.input) : -1;
  const innerActive = token ? (decrypt ? token.input : token.output) : '';
  return (
    <>
      <p className="viz-caption">
        {isAlberti
          ? `El anillo interior gira cada ${settings.period} símbolos. Avanza el explorador inferior: el disco, la alineación resaltada y el cálculo cambian juntos.`
          : 'El anillo interior mantiene el desplazamiento fijo indicado por la clave.'}
      </p>
      <div className="disk-stage">
        <svg viewBox="0 0 340 340" role="img">
          <title>Discos concéntricos de sustitución</title>
          <desc>Alfabeto exterior e interior desplazado según la clave.</desc>
          <circle cx="170" cy="170" r="150" />
          <circle cx="170" cy="170" r="106" />
          {letters.map((char, i) => {
            const a = (2 * Math.PI * i) / 26 - Math.PI / 2;
            return (
              <text
                className={i === outerActive ? 'active-letter' : ''}
                key={`o${i}`}
                x={170 + 132 * Math.cos(a)}
                y={174 + 132 * Math.sin(a)}
              >
                {char}
              </text>
            );
          })}
          {letters.map((char, i) => {
            const a = (2 * Math.PI * (i - shift)) / 26 - Math.PI / 2;
            const x = 170 + 88 * Math.cos(a);
            const y = 170 + 88 * Math.sin(a);
            return (
              <g
                className="inner-letter"
                key={`i${i}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <text className={`inner ${char === innerActive ? 'active-letter' : ''}`} y="4">
                  {char.toLowerCase()}
                </text>
              </g>
            );
          })}
          <line x1="170" y1="18" x2="170" y2="64" />
          <circle className="hub" cx="170" cy="170" r="28" />
          <text className="key" x="170" y="176">
            {isAlberti ? `G${token?.turn ?? 0}` : `+${shift}`}
          </text>
        </svg>
      </div>
      {isAlberti && (
        <div className="disk-readout" aria-live="polite">
          <span>
            <small>Paso</small>
            <b>
              {Math.min(activeStep + 1, tokens.length)} / {tokens.length}
            </b>
          </span>
          <span>
            <small>Alineación inicial</small>
            <b>
              {settings.outerAnchor} ↔ {settings.innerAnchor.toLowerCase()}
            </b>
          </span>
          <span>
            <small>Giro activo</small>
            <b>
              {token?.turn ?? 0} · desplazamiento {shift}
            </b>
          </span>
          <span className="active">
            <small>Sustitución</small>
            <b>{token ? `${token.input} → ${token.output}` : '—'}</b>
          </span>
        </div>
      )}
    </>
  );
}

function AlignedAlphabet({
  input,
  keyValue,
  result,
}: {
  input: string;
  keyValue: string;
  result: string;
}) {
  const text = normalizeText(input),
    key = normalizeText(keyValue || 'CLAVE'),
    expanded = [...text].map((_, i) => key[i % key.length] ?? '').join('');
  return (
    <>
      <p className="viz-caption">
        Lee cada columna de arriba abajo: clave, entrada, índice/operación y salida. Así se ve qué
        carácter de clave actúa en cada posición.
      </p>
      <div className="aligned-strips">
        <div>
          <label>CLAVE</label>
          {cells(expanded)}
        </div>
        <div>
          <label>ENTRADA</label>
          {cells(text)}
        </div>
        <div>
          <label>SALIDA</label>
          {cells(result.replace(/\s/g, ''))}
        </div>
      </div>
    </>
  );
}

function AdfgvxVisualizer({
  input,
  keyValue,
  result,
  decrypt,
  activeStep,
}: {
  input: string;
  keyValue: string;
  result: string;
  decrypt: boolean;
  activeStep: number;
}) {
  const state = getAdfgvxState(input, keyValue, decrypt);
  const ranks = rankKey(state.transpositionKey);
  const activeTokenIndex = activeStep - (decrypt ? 2 : 1);
  const activeToken = activeTokenIndex >= 0 ? state.tokens[activeTokenIndex] : undefined;
  const columns = state.transpositionKey.length;
  const rows = Math.ceil(state.fractionated.length / columns);
  const readingOrder = Array.from({ length: columns }, (_, index) => index).sort(
    (a, b) => (ranks[a] ?? 0) - (ranks[b] ?? 0),
  );
  return (
    <div className="adfgvx-viz">
      <div className="adfgvx-key-guide">
        <div>
          <span>1</span>
          <div>
            <small>CLAVE DEL TABLERO</small>
            <b>{state.squareKey}</b>
          </div>
          <p>Elimina letras repetidas y decide dónde se coloca cada letra o cifra.</p>
        </div>
        <ArrowRight />
        <div>
          <span>2</span>
          <div>
            <small>CLAVE DE TRANSPOSICIÓN</small>
            <b>{state.transpositionKey}</b>
          </div>
          <p>No cambia los pares: solo decide en qué orden se leen las columnas.</p>
        </div>
      </div>

      <section className="adfgvx-stage">
        <header>
          <span>FASE 1</span>
          <h3>La primera clave construye el tablero 6×6</h3>
        </header>
        <p>Las etiquetas A, D, F, G, V y X son coordenadas, no letras del mensaje.</p>
        <div className="adfgvx-square">
          <span className="corner">↘</span>
          {[...'ADFGVX'].map((label) => (
            <span className="axis" key={`column-${label}`}>
              {label}
            </span>
          ))}
          {Array.from({ length: 6 }, (_, row) => (
            <div className="adfgvx-square-row" key={row}>
              <span className="axis">{'ADFGVX'[row]}</span>
              {Array.from({ length: 6 }, (_, column) => {
                const symbol = state.square[row * 6 + column] ?? '';
                const active = activeToken?.symbol === symbol;
                return (
                  <span className={`viz-cell ${active ? 'active' : ''}`} key={symbol}>
                    <b>{symbol}</b>
                    <small>
                      {'ADFGVX'[row]}
                      {'ADFGVX'[column]}
                    </small>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="adfgvx-stage">
        <header>
          <span>FASE 2</span>
          <h3>
            {decrypt ? 'Reconstruir y leer los pares' : 'Convertir cada símbolo en dos coordenadas'}
          </h3>
        </header>
        <div className="adfgvx-fraction">
          {state.tokens.map((token, index) => (
            <span
              className={index === activeTokenIndex ? 'active' : ''}
              key={`${token.pair}-${index}`}
            >
              <b>{token.symbol}</b>
              <i>{decrypt ? '←' : '→'}</i>
              <code>{token.pair}</code>
            </span>
          ))}
        </div>
        <p className="adfgvx-stream">
          <small>Texto intermedio</small>
          <code>{state.fractionated}</code>
        </p>
      </section>

      <section className="adfgvx-stage">
        <header>
          <span>FASE 3</span>
          <h3>La segunda clave ordena las columnas</h3>
        </header>
        <p>
          Los números indican el orden alfabético estable de la clave. Se leen las columnas 1, 2, 3…
        </p>
        <div className="adfgvx-transposition">
          <div
            className="columnar-head"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(42px,1fr))` }}
          >
            {[...state.transpositionKey].map((char, index) => (
              <span key={`${char}-${index}`}>
                <b>{char}</b>
                <small>{ranks[index]}</small>
              </span>
            ))}
          </div>
          <div
            className="crypto-matrix"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(42px,1fr))` }}
          >
            {Array.from({ length: rows * columns }, (_, index) => (
              <span className="viz-cell" key={index}>
                <b>{state.fractionated[index] ?? '·'}</b>
                <small>{index + 1}</small>
              </span>
            ))}
          </div>
        </div>
        <p className="adfgvx-order">
          <small>Orden de lectura</small>
          {readingOrder.map((column) => (
            <code key={column}>
              {state.transpositionKey[column]}
              <sup>{column + 1}</sup>
            </code>
          ))}
        </p>
        <p className="adfgvx-result">
          <small>{decrypt ? 'Mensaje recuperado' : 'Criptograma final'}</small>
          <strong>{result}</strong>
        </p>
      </section>
    </div>
  );
}

function Mapping({ input, result, order }: { input: string; result: string; order: number }) {
  const left = [...input.slice(0, 18)],
    right = [...result.replace(/\s/g, '').slice(0, 18)];
  return (
    <>
      <p className="viz-caption">
        Cada columna conserva la correspondencia de esta ejecución. Los conectores ayudan a
        distinguir sustitución, código o permutación.
      </p>
      <div className="mapping-viz">
        <div>
          {left.map((x, i) => (
            <span key={i}>{x === ' ' ? '␠' : x}</span>
          ))}
        </div>
        <div className="mapping-arrows">
          {left.map((_, i) => (
            <ArrowDown key={i} />
          ))}
        </div>
        <div>
          {left.map((_, i) => (
            <span key={i}>{right[i] ?? '·'}</span>
          ))}
        </div>
      </div>
      <div className="viz-legend">
        <strong>Modelo visual de la lección {order}</strong>
        <span>{left.length} unidades mostradas</span>
      </div>
    </>
  );
}

function Codebook({
  input,
  keyValue,
  decrypt,
  activeStep,
}: {
  input: string;
  keyValue: string;
  decrypt: boolean;
  activeStep: number;
}) {
  const entries = parseNomenclatorKey(keyValue);
  const tokens = tokenizeNomenclator(input, keyValue, decrypt);
  return (
    <>
      <p className="viz-caption">
        El modelo usa exactamente el libro escrito en «Parámetros / clave». Las unidades que no
        figuran en él se muestran como literales, sin inventarles un código.
      </p>
      <div className="codebook-entries">
        {entries.map((entry) => (
          <span key={`${entry.phrase}-${entry.code}`}>
            <b>{entry.phrase}</b>
            <i>↔</i>
            <code>{entry.code}</code>
          </span>
        ))}
      </div>
      <div className="token-flow">
        {tokens.map((token, i) => (
          <div
            className={`${i === activeStep ? 'active' : ''} ${token.coded ? 'coded' : 'literal'}`}
            key={`${token.source}-${i}`}
          >
            <span>{token.source}</span>
            <ArrowDown />
            <b>{token.target}</b>
            <small>{token.coded ? 'entrada del libro' : 'literal'}</small>
          </div>
        ))}
      </div>
    </>
  );
}

function PortaTable({
  input,
  keyValue,
  result,
  activeStep,
}: {
  input: string;
  keyValue: string;
  result: string;
  activeStep: number;
}) {
  const tokens = transformPorta(input, keyValue);
  const token = tokens[Math.min(activeStep, Math.max(0, tokens.length - 1))];
  const activeInputIndex = token ? ALPHABETS.LATIN_26.indexOf(token.input) : -1;
  const activeOutputIndex = token ? ALPHABETS.LATIN_26.indexOf(token.output) : -1;
  const activeLeftIndex =
    activeInputIndex >= 0 && activeInputIndex < 13 ? activeInputIndex : activeOutputIndex;
  const numberedCells = (value: string, row: 'key' | 'input' | 'output') =>
    [...value].map((char, index) => (
      <span
        className={`porta-cell ${index === activeStep ? 'active' : ''}`}
        key={`${row}-${index}`}
      >
        <b>{char}</b>
        <small>{ALPHABETS.LATIN_26.indexOf(char) + 1}</small>
      </span>
    ));
  return (
    <>
      <p className="viz-caption">
        Cada cuadrado incluye la posición de su letra en el alfabeto (A=1, …, Z=26). La letra de
        clave selecciona uno de los trece alfabetos recíprocos AB, CD, …, YZ.
      </p>
      <div className="porta-guide">
        <strong>Recíproco significa que cada pareja funciona en los dos sentidos</strong>
        <p>
          La clave no se suma al mensaje. Primero elige una fila; esa fila empareja cada letra de
          A–M con una de N–Z. Si aparece <code>E ↔ T</code>, entonces <code>E → T</code> y también
          <code>T → E</code>. Por eso la misma operación sirve para cifrar y descifrar.
        </p>
      </div>
      <div className="porta-rule">
        <span>
          <small>Par de clave activo</small>
          <b>
            {token
              ? `${ALPHABETS.LATIN_26[token.row * 2]}${ALPHABETS.LATIN_26[token.row * 2 + 1]}`
              : '—'}
          </b>
        </span>
        <span>
          <small>Fila n.º</small>
          <b>{token ? token.row + 1 : '—'}</b>
        </span>
        <span className="active">
          <small>Sustitución activa</small>
          <b>{token ? `${token.input} ↔ ${token.output}` : '—'}</b>
        </span>
      </div>
      <div className="porta-alphabet" aria-label="Alfabeto recíproco seleccionado">
        <div className="porta-alphabet-heading">
          <span>Mitad A–M</span>
          <b>parejas bidireccionales</b>
          <span>Mitad N–Z desplazada</span>
        </div>
        <div className="porta-pairs">
          {Array.from({ length: 13 }, (_, index) => {
            const left = ALPHABETS.LATIN_26[index] ?? '';
            const rightIndex = 13 + ((index + (token?.row ?? 0)) % 13);
            const right = ALPHABETS.LATIN_26[rightIndex] ?? '';
            return (
              <div className={`porta-pair ${index === activeLeftIndex ? 'active' : ''}`} key={left}>
                <span>
                  <b>{left}</b>
                  <small>{index + 1}</small>
                </span>
                <i>↔</i>
                <span>
                  <b>{right}</b>
                  <small>{rightIndex + 1}</small>
                </span>
              </div>
            );
          })}
        </div>
        <p className="porta-active-explanation">
          {token ? (
            <>
              <b>Paso activo:</b> la fila empareja <code>{token.input}</code> con{' '}
              <code>{token.output}</code>. Al repetirla, <code>{token.output}</code> vuelve a{' '}
              <code>{token.input}</code>.
            </>
          ) : (
            'Introduce un mensaje para ver la pareja activa.'
          )}
        </p>
      </div>
      <div className="porta-strips">
        <div>
          <label>CLAVE</label>
          {numberedCells(tokens.map((item) => item.key).join(''), 'key')}
        </div>
        <div>
          <label>ENTRADA</label>
          {numberedCells(tokens.map((item) => item.input).join(''), 'input')}
        </div>
        <div>
          <label>SALIDA</label>
          {numberedCells(result.replace(/\s/g, ''), 'output')}
        </div>
      </div>
    </>
  );
}

function SyndicalCode({
  input,
  keyValue,
  decrypt,
  result,
  activeStep,
}: {
  input: string;
  keyValue: string;
  decrypt: boolean;
  result: string;
  activeStep: number;
}) {
  const shift = Math.abs(Number.parseInt(keyValue, 10) || 0);
  const tokens = getSyndicalTokens(input, keyValue, decrypt);
  const activeIndex = activeStep - 1;
  const active = activeIndex >= 0 ? tokens[activeIndex] : undefined;
  const wrapped = active?.coded
    ? decrypt
      ? active.targetIndex > active.sourceIndex
      : active.targetIndex < active.sourceIndex
    : false;
  return (
    <>
      <div className="syndical-guide">
        <strong>No se desplazan letras: se desplaza la posición de una palabra en el libro</strong>
        <p>
          Emisor y receptor comparten la misma lista ordenada. La clave <code>{shift}</code> indica
          cuántas posiciones avanzar al cifrar y retroceder al descifrar.
        </p>
      </div>
      <div className="syndical-calculation" aria-live="polite">
        {active?.coded ? (
          <>
            <span>
              <small>Palabra de entrada</small>
              <b>{active.source}</b>
              <code>posición {active.sourceIndex + 1}</code>
            </span>
            <i>{decrypt ? `−${shift}` : `+${shift}`}</i>
            <span>
              <small>Nueva posición</small>
              <b>{active.targetIndex + 1}</b>
              <code>{wrapped ? 'vuelve por el extremo' : 'sin cruzar el extremo'}</code>
            </span>
            <ArrowRight />
            <span className="result">
              <small>Palabra resultante</small>
              <b>{active.target}</b>
              <code>posición {active.targetIndex + 1}</code>
            </span>
          </>
        ) : (
          <p>Avanza al siguiente paso para seguir una palabra concreta dentro del libro.</p>
        )}
      </div>
      <div className="syndical-book">
        {SYNDICAL_CODEBOOK.map((word, index) => {
          const isSource = active?.sourceIndex === index;
          const isTarget = active?.targetIndex === index;
          return (
            <span className={`${isSource ? 'source' : ''} ${isTarget ? 'target' : ''}`} key={word}>
              <small>{index + 1}</small>
              <b>{word}</b>
              {isSource && <i>origen</i>}
              {isTarget && <i>destino</i>}
            </span>
          );
        })}
      </div>
      <div className="syndical-token-flow">
        {tokens.map((token, index) => (
          <span className={index === activeIndex ? 'active' : ''} key={`${token.source}-${index}`}>
            <b>{token.source}</b>
            <i>→</i>
            <code>{token.target}</code>
          </span>
        ))}
      </div>
      <p className="syndical-output">
        <small>{decrypt ? 'Mensaje recuperado' : 'Mensaje cifrado'}</small>
        <strong>{result}</strong>
      </p>
    </>
  );
}

function SecretMap() {
  return (
    <>
      <p className="viz-caption">
        Una función válida une cada mensaje con un criptograma distinto. En rojo se muestra qué
        ocurre si dos flechas terminan en la misma salida.
      </p>
      <div className="bijection">
        <div>
          {['M₀', 'M₁', 'M₂', 'M₃'].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="bijection-lines">
          →<br />↘<br />→<br />↗
        </div>
        <div>
          {['C₂', 'C₀', 'C₃', 'C₁'].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="collision">
          M₁, M₂ → C₀ <b>ambigüedad</b>
        </div>
      </div>
    </>
  );
}

function BookCipher({ input }: { input: string }) {
  const words = input.toUpperCase().split(/\s+/).filter(Boolean);
  return (
    <>
      <p className="viz-caption">
        Cada palabra se localiza dentro de una estructura página → línea → palabra. La edición y la
        regla de separación deben coincidir.
      </p>
      <div className="book-viz">
        <div className="page">
          <small>PÁGINA 1</small>
          {words.map((word, i) => (
            <span key={i}>
              <i>Línea {Math.floor(i / 3) + 1}</i>
              <b>{word}</b>
              <code>
                1.{Math.floor(i / 3) + 1}.{(i % 3) + 1}
              </code>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function Homophonic() {
  const groups = [
    ['E', '01', '14', '37', '62'],
    ['A', '05', '28', '70'],
    ['O', '11', '43', '89'],
    ['Z', '96'],
  ];
  return (
    <>
      <p className="viz-caption">
        Las letras más frecuentes reciben más códigos. Todos los códigos de un grupo vuelven a la
        misma letra, pero ninguno puede pertenecer a dos grupos.
      </p>
      <div className="homophone-viz">
        {groups.map(([letter, ...codes]) => (
          <div key={letter}>
            <b>{letter}</b>
            <ArrowRight />
            <span>
              {codes.map((x) => (
                <i key={x}>{x}</i>
              ))}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function XorRows({ input, keyValue, result }: { input: string; keyValue: string; result: string }) {
  const byte = new TextEncoder().encode(input)[0] ?? 0,
    key = new TextEncoder().encode(keyValue || 'K')[0] ?? 0,
    out = byte ^ key;
  const bits = (n: number) => n.toString(2).padStart(8, '0').split('');
  return (
    <>
      <p className="viz-caption">
        XOR trabaja columna a columna: bits iguales producen 0 y bits distintos producen 1. Repetir
        XOR con la misma clave recupera el mensaje.
      </p>
      <div className="xor-viz">
        <label>M</label>
        <div>
          {bits(byte).map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
        <label>K</label>
        <div>
          {bits(key).map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
        <b>XOR</b>
        <hr />
        <label>C</label>
        <div>
          {bits(out).map((x, i) => (
            <span className="active" key={i}>
              {x}
            </span>
          ))}
        </div>
      </div>
      <div className="viz-legend">
        <span>Primer byte del ejemplo</span>
        <strong>{result.slice(0, 2)} hex</strong>
      </div>
    </>
  );
}

function ShufflePath({ input }: { input: string }) {
  const text = input.replace(/\s/g, '').toUpperCase().padEnd(16, '·');
  const path = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12];
  return (
    <>
      <p className="viz-caption">
        La ruta visita cada celda una sola vez. Los números muestran el orden de extracción;
        invertir esa numeración deshace el barajado.
      </p>
      <div className="shuffle-grid">
        {path.map((cell, order) => (
          <span key={cell} style={{ gridArea: `${Math.floor(cell / 4) + 1} / ${(cell % 4) + 1}` }}>
            <small>{order + 1}</small>
            <b>{text[cell]}</b>
          </span>
        ))}
      </div>
    </>
  );
}

function Columnar({ input, keyValue }: { input: string; keyValue: string }) {
  const key = normalizeText(keyValue || 'CLAVE'),
    text = input.replace(/\s/g, '').toUpperCase(),
    cols = Math.max(2, key.length),
    rows = Math.ceil(text.length / cols),
    rank = rankKey(key);
  return (
    <>
      <p className="viz-caption">
        La clave encabeza las columnas. El número inferior es su ranking estable; las flechas
        indican el orden de lectura.
      </p>
      <div
        className="columnar-head"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(38px,1fr))` }}
      >
        {[...key].map((x, i) => (
          <span key={i}>
            <b>{x}</b>
            <small>{rank[i]}</small>
          </span>
        ))}
      </div>
      <div
        className="crypto-matrix"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(38px,1fr))` }}
      >
        {Array.from({ length: rows * cols }, (_, i) => (
          <span className="viz-cell" key={i}>
            <b>{text[i] ?? '·'}</b>
            <small>{i + 1}</small>
          </span>
        ))}
      </div>
    </>
  );
}

function HillMatrix({ input, keyValue }: { input: string; keyValue: string }) {
  const nums = (keyValue.match(/-?\d+/g) ?? ['9', '4', '5', '7']).slice(0, 4),
    letters = normalizeText(input).slice(0, 2).padEnd(2, 'A');
  return (
    <div className="hill-viz">
      <div className="bracket-matrix">
        {nums.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </div>
      <b>×</b>
      <div className="vector">
        <span>{letters.charCodeAt(0) - 65}</span>
        <span>{letters.charCodeAt(1) - 65}</span>
      </div>
      <b>mod 26</b>
      <ArrowRight />
      <div className="vector output">
        <span>c₁</span>
        <span>c₂</span>
      </div>
    </div>
  );
}

const rotate = (point: number[], n: number): number[] => {
  const r = point[0] ?? 0,
    c = point[1] ?? 0;
  return [c, n - 1 - r];
};
function Cardano() {
  const holes = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ];
  return (
    <>
      <p className="viz-caption">
        Las cuatro plantillas muestran la misma rejilla tras cada giro. Cada celda queda descubierta
        exactamente una vez.
      </p>
      <div className="cardano-rotations">
        {Array.from({ length: 4 }, (_, turn) => {
          let hs = holes.map((x) => [...x]);
          for (let i = 0; i < turn; i++) hs = hs.map((x) => rotate(x, 4));
          const set = new Set(hs.map((x) => x.join('-')));
          return (
            <div key={turn}>
              <b>
                Giro {turn} · {turn * 90}°
              </b>
              <div className="cardano-grid">
                {Array.from({ length: 16 }, (_, i) => (
                  <span className={set.has(`${Math.floor(i / 4)}-${i % 4}`) ? 'hole' : ''} key={i}>
                    {set.has(`${Math.floor(i / 4)}-${i % 4}`) ? <Eye /> : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Machine({ order }: { order: number }) {
  if (order === 27)
    return (
      <div className="wheel-bank">
        {[26, 25, 23, 21, 19, 17].map((n, i) => {
          const angle = i * 9;
          return (
            <div key={n}>
              <span className="wheel" style={{ transform: `rotate(${angle}deg)` }}>
                <b className="wheel-letter" style={{ transform: `rotate(${-angle}deg)` }}>
                  {String.fromCharCode(65 + i)}
                </b>
              </span>
              <b>Rueda {i + 1}</b>
              <small>{n} posiciones</small>
            </div>
          );
        })}
      </div>
    );
  return (
    <div className="enigma-viz">
      <div className="plug">Clavijero</div>
      <ArrowRight />
      <div className="rotor">
        III<small>rápido</small>
      </div>
      <ArrowRight />
      <div className="rotor">
        II<small>medio</small>
      </div>
      <ArrowRight />
      <div className="rotor">
        I<small>lento</small>
      </div>
      <ArrowRight />
      <div className="reflector">
        B<small>reflector</small>
      </div>
      <div className="return-path">← regreso por rotores inversos ←</div>
    </div>
  );
}

const traceText = (value?: TraceValue) => {
  if (!value || !('value' in value)) return '—';
  return Array.isArray(value.value) ? JSON.stringify(value.value) : String(value.value);
};

function ExactExecutionState({
  result,
  keyValue,
  activeStep,
}: {
  result: EngineResult<string>;
  keyValue: string;
  activeStep: number;
}) {
  const current = result.trace[Math.min(activeStep, Math.max(0, result.trace.length - 1))];
  if (!current) return null;
  return (
    <div className="exact-execution" aria-live="polite">
      <div>
        <small>
          ESTADO EXACTO · PASO {Math.min(activeStep + 1, result.trace.length)} DE{' '}
          {result.trace.length}
        </small>
        <strong>{current.title}</strong>
      </div>
      <span>
        <small>Entrada del paso</small>
        <code>{traceText(current.before)}</code>
      </span>
      <b>→</b>
      <span>
        <small>Salida del paso</small>
        <code>{traceText(current.after)}</code>
      </span>
      <span>
        <small>Clave / parámetros actuales</small>
        <code>{keyValue || '—'}</code>
      </span>
    </div>
  );
}

export function ClassicalVisualizer(props: Props) {
  const { lesson, input, keyValue, result, decrypt, activeStep } = props;
  if (lesson.block > 2) return null;
  let body: React.ReactNode;
  switch (lesson.order) {
    case 1:
      body = <Scytale input={input} keyValue={keyValue} decrypt={decrypt} />;
      break;
    case 2:
      body = <RailFence input={input} keyValue={keyValue} />;
      break;
    case 3:
    case 4:
    case 20:
      body = <CoordinateGrid size={lesson.order === 4 ? 7 : 5} input={input} />;
      break;
    case 5:
      body = <Ct46Walkthrough input={input} result={result.output} decrypt={decrypt} />;
      break;
    case 6:
      body = (
        <Disks
          input={input}
          keyValue={keyValue}
          order={lesson.order}
          decrypt={decrypt}
          activeStep={activeStep}
        />
      );
      break;
    case 7:
      body = (
        <Codebook input={input} keyValue={keyValue} decrypt={decrypt} activeStep={activeStep} />
      );
      break;
    case 8:
      body = (
        <Disks
          input={input}
          keyValue={keyValue}
          order={lesson.order}
          decrypt={decrypt}
          activeStep={activeStep}
        />
      );
      break;
    case 9:
      body = (
        <PortaTable
          input={input}
          keyValue={keyValue}
          result={result.output}
          activeStep={activeStep}
        />
      );
      break;
    case 10:
    case 14:
    case 15:
    case 18:
      body = <AlignedAlphabet input={input} keyValue={keyValue} result={result.output} />;
      break;
    case 11:
      body = (
        <AdfgvxVisualizer
          input={input}
          keyValue={keyValue}
          result={result.output}
          decrypt={decrypt}
          activeStep={activeStep}
        />
      );
      break;
    case 12:
      body = (
        <SyndicalCode
          input={input}
          keyValue={keyValue}
          decrypt={decrypt}
          result={result.output}
          activeStep={activeStep}
        />
      );
      break;
    case 13:
      body = <SecretMap />;
      break;
    case 16:
      body = <BookCipher input={input} />;
      break;
    case 17:
      body = <Homophonic />;
      break;
    case 19:
      body = <XorRows input={input} keyValue={keyValue} result={result.output} />;
      break;
    case 21:
      body = <HillMatrix input={input} keyValue={keyValue} />;
      break;
    case 22:
      body = <ShufflePath input={input} />;
      break;
    case 23:
    case 24:
    case 25:
      body = <Columnar input={input} keyValue={keyValue} />;
      break;
    case 26:
      body = <Cardano />;
      break;
    case 27:
    case 28:
      body = <Machine order={lesson.order} />;
      break;
    default:
      body = <Mapping input={input} result={result.output} order={lesson.order} />;
  }
  return (
    <section className="algorithm-viz" aria-label={`Visualización de ${lesson.title}`}>
      <header>
        <span>
          <Grid3X3 />
        </span>
        <div>
          <small>MODELO Y TRAZA SINCRONIZADOS</small>
          <h2>{lesson.title} paso a paso</h2>
        </div>
      </header>
      {body}
      <ExactExecutionState result={result} keyValue={keyValue} activeStep={activeStep} />
    </section>
  );
}
