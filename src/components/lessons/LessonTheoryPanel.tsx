import { BookOpen } from 'lucide-react';
import type { LessonDefinition } from '../../data/syllabus';
import { getLessonTheory } from '../../data/lessonTheory';

export function LessonTheoryPanel({ lesson }: { lesson: LessonDefinition }) {
  const theory = getLessonTheory(lesson.order);
  return (
    <section className="lesson-theory" aria-labelledby="theory-title">
      <header>
        <span className="theory-icon">
          <BookOpen aria-hidden />
        </span>
        <div>
          <small>PARTE DEL TEMARIO</small>
          <h2 id="theory-title">Cómo funciona</h2>
        </div>
      </header>
      <p className="theory-overview">{theory.overview}</p>
      <div className="theory-columns">
        <div>
          <h3>Procedimiento paso a paso</h3>
          <ol>
            {theory.steps.map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Relación fundamental</h3>
          <code>{theory.formula}</code>
        </div>
      </div>
    </section>
  );
}
