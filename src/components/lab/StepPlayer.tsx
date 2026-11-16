import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { TraceStep, TraceValue } from '../../domain/engine';
const show = (v?: TraceValue) =>
  v ? ('value' in v ? (Array.isArray(v.value) ? JSON.stringify(v.value) : v.value) : '') : '';
export function StepPlayer({
  steps,
  index,
  onIndexChange,
}: {
  steps: TraceStep[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => onIndexChange(0), [steps, onIndexChange]);
  useEffect(() => {
    if (!playing || steps.length < 2) return;
    const timer = setInterval(() => onIndexChange(index >= steps.length - 1 ? 0 : index + 1), 900);
    return () => clearInterval(timer);
  }, [playing, steps.length, index, onIndexChange]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input,textarea')) return;
      if (e.key === 'ArrowLeft') onIndexChange(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onIndexChange(Math.min(steps.length - 1, index + 1));
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((x) => !x);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [steps.length, index, onIndexChange]);
  if (!steps.length)
    return <div className="empty">Ejecuta el laboratorio para generar una traza.</div>;
  const s = steps[index] ?? steps[0]!;
  return (
    <section className="step-player">
      <header>
        <button
          aria-label="Paso anterior"
          onClick={() => onIndexChange(Math.max(0, index - 1))}
          disabled={!index}
        >
          <ChevronLeft />
        </button>
        <button
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          onClick={() => setPlaying((x) => !x)}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <button
          aria-label="Paso siguiente"
          onClick={() => onIndexChange(Math.min(steps.length - 1, index + 1))}
          disabled={index === steps.length - 1}
        >
          <ChevronRight />
        </button>
        <span>
          Paso {index + 1} de {steps.length}
        </span>
      </header>
      <div className="timeline" role="list" aria-label="Lista de pasos">
        {steps.map((x, i) => (
          <button
            role="listitem"
            className={i === index ? 'active' : ''}
            onClick={() => onIndexChange(i)}
            key={x.id}
            title={x.title}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <article aria-live="polite">
        <span className="phase">{s.phase}</span>
        <h3>{s.title}</h3>
        <p>{s.explanation}</p>
        {s.formula && <code className="formula">{s.formula}</code>}
        <div className="state-change">
          <div>
            <small>Antes</small>
            <code>{show(s.before)}</code>
          </div>
          <span>→</span>
          <div>
            <small>Después</small>
            <code>{show(s.after)}</code>
          </div>
        </div>
      </article>
    </section>
  );
}
