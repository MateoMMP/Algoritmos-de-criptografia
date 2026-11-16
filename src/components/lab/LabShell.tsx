import { useState } from 'react';
import { ArrowLeftRight, Beaker, Dice5 } from 'lucide-react';
import type { LessonDefinition } from '../../data/syllabus';
import { runLesson } from '../../engines/runLesson';
import type { EngineResult } from '../../domain/engine';
import { NormalizationPreview } from './NormalizationPreview';
import { StepPlayer } from './StepPlayer';
import { LessonTheoryPanel } from '../lessons/LessonTheoryPanel';
import { ClassicalVisualizer } from '../visualizers/ClassicalVisualizer';

const examples: Record<number, [string, string]> = {
  1: ['ATAQUE AL AMANECER', '4'],
  2: ['TRANSPOCISION', '3'],
  3: ['CRIPTOGRAFIA', ''],
  4: ['IROHA', '7'],
  5: ['ATAQUE A LAS 20:00', '5017928364'],
  6: ['SEGURIDAD', '3'],
  7: ['EL EJERCITO AVANZA AL AMANECER', 'AMANECER=731, EJERCITO=204'],
  8: ['DEFENDER ROMA', 'Mb,4,3i'],
  9: ['MENSAJE PORTA', 'CLAVE'],
  10: ['DEFENDER', 'CLAVE'],
  11: ['ATTACKAT1200AM', 'ANONYMOUS,MRPRESIDENT'],
  12: ['HUELGA GENERAL', '3'],
  13: ['ABCD', '2,0,3,1'],
  14: ['FORMULA MODULAR', '3'],
  15: ['CRIPTOGRAFIA', '7,3'],
  16: ['SEGURIDAD CRIPTOGRAFIA', '1.1.1'],
  17: ['ESTE ES UN MENSAJE', 'semilla=2026'],
  18: ['DEFENDERLAPOSICION', 'CLAVE'],
  19: ['Mensaje secreto', 'CLAVE'],
  20: ['INSTRUMENTOS', 'MONARQUIA'],
  21: ['HELP', '9,4,5,7'],
  22: ['TRANSPOSICION', '3,1,4,2'],
  23: ['MENSAJE DOBLE', 'PRISION'],
  24: ['ATAQUEALAMANECER', 'CLAVE'],
  25: ['TRANSPOSICIONINTERRUMPIDA', 'ZEBRAS'],
  26: ['MENSAJE EN REJILLA', '4'],
  27: ['AAAAAAAAAAAAAAAAAAAAAAAAAA', 'Temario-27'],
  28: ['HELLOWORLD', 'I-II-III,AAA,AAA'],
  30: ['ESTE ES UN TEXTO DE PRUEBA PARA ANALIZAR FRECUENCIAS', ''],
  31: ['ABCXYZABCQQQXYZ', ''],
  32: ['ESTEESUNEJEMPLODEINDICEDECOINCIDENCIA', ''],
  36: ['1234', '19,43,7,91'],
  46: ['Plaintext', 'Key'],
  53: ['720', ''],
  54: ['7 40 13', ''],
  56: ['21', '2'],
  59: ['65', '61,53,17'],
  60: ['13', '23,5,6,3'],
  61: ['', '23,5,6,15'],
};

export function LabShell({ lesson }: { lesson: LessonDefinition }) {
  return <LabShellSession key={lesson.id} lesson={lesson} />;
}

function LabShellSession({ lesson }: { lesson: LessonDefinition }) {
  const preset = examples[lesson.order] ?? ['SEGURIDAD', 'CLAVE'];
  const [text, setText] = useState(preset[0]);
  const [key, setKey] = useState(preset[1]);
  const [decrypt, setDecrypt] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EngineResult<string> | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const run = (direction = decrypt, source = text) => {
    try {
      setError('');
      setDecrypt(direction);
      setResult(runLesson(lesson.order, { text: source, key, decrypt: direction }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo calcular.');
      setResult(null);
    }
  };

  const runOpposite = () => {
    const source = result?.output ?? text;
    setText(source);
    run(!decrypt, source);
  };

  const interchange = () => {
    if (!result) return;
    setText(result.output);
    setResult(null);
    setDecrypt((value) => !value);
    setError('');
  };

  const resetExample = () => {
    setText(preset[0]);
    setKey(preset[1]);
    setResult(null);
    setDecrypt(false);
    setError('');
  };

  const primaryLabel = lesson.kind === 'cipher' ? (decrypt ? 'Descifrar' : 'Cifrar') : 'Calcular';

  return (
    <div className="lab-shell">
      <LessonTheoryPanel lesson={lesson} />
      <div className="lab-grid">
        <section className="card input-composer">
          <div className="input-fields">
            <div className="input-panel input-card">
              <div className="card-title">
                <span>01</span>
                <h2>Entrada</h2>
              </div>
              <label htmlFor="message">Mensaje o valor</label>
              <textarea
                id="message"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={10000}
              />
            </div>
            <div className="input-panel">
              <div className="card-title">
                <span>02</span>
                <h2>Parámetros / clave</h2>
              </div>
              <label htmlFor="key">
                Clave o parámetros <small>(admite valores separados por comas)</small>
              </label>
              <input id="key" value={key} onChange={(event) => setKey(event.target.value)} />
            </div>
          </div>
          <div className="actionbar">
            <button className="primary" onClick={() => run(decrypt)}>
              <Beaker />
              {primaryLabel}
            </button>
            {lesson.kind === 'cipher' && (
              <button onClick={runOpposite}>
                <ArrowLeftRight />
                {decrypt ? 'Cifrar' : 'Descifrar'}
              </button>
            )}
            <button onClick={interchange} disabled={!result}>
              <ArrowLeftRight />
              Intercambiar
            </button>
            <button onClick={resetExample}>
              <Dice5 />
              Ejemplo
            </button>
          </div>
        </section>
        <section className="card output-card">
          <div className="card-title">
            <span>03</span>
            <h2>Salida</h2>
          </div>
          <pre aria-live="polite">{result?.output ?? 'Pulsa Calcular para ver el resultado.'}</pre>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {result?.warnings.map((warning) => (
            <p className="warning" key={warning}>
              {warning}
            </p>
          ))}
        </section>
      </div>

      {result && (
        <>
          <NormalizationPreview raw={text} normalized={result.normalizedInput} />
          <section className={`algorithm-workbench ${lesson.block > 2 ? 'trace-only' : ''}`}>
            <ClassicalVisualizer
              lesson={lesson}
              input={text}
              keyValue={key}
              decrypt={decrypt}
              result={result}
              activeStep={activeStep}
            />
            <section className="trace-layout">
              <div>
                <div className="section-heading">
                  <div>
                    <span>CONTROLES DEL MODELO</span>
                    <h2>Explorador paso a paso</h2>
                  </div>
                </div>
                <StepPlayer steps={result.trace} index={activeStep} onIndexChange={setActiveStep} />
              </div>
            </section>
          </section>
        </>
      )}
    </div>
  );
}
