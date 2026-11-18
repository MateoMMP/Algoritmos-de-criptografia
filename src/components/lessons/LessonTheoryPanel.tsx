import { AlertTriangle, BookOpen, FlaskConical, GraduationCap, Lightbulb } from 'lucide-react';
import type { LessonDefinition } from '../../data/syllabus';
import { getLessonStudyGuide, getLessonTheory } from '../../data/lessonTheory';

export function LessonTheoryPanel({ lesson }: { lesson: LessonDefinition }) {
  const theory = getLessonTheory(lesson.order);
  const guide = getLessonStudyGuide(lesson.order);
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
      {guide && (
        <div className="study-guide" aria-label="Guía para el examen">
          <article>
            <Lightbulb aria-hidden />
            <div><h3>Idea mental</h3><p>{guide.intuition}</p></div>
          </article>
          <article>
            <GraduationCap aria-hidden />
            <div><h3>Qué escribir en el examen</h3><p>{guide.examTip}</p></div>
          </article>
          <article className="study-warning">
            <AlertTriangle aria-hidden />
            <div><h3>Error típico</h3><p>{guide.commonMistake}</p></div>
          </article>
          <article>
            <FlaskConical aria-hidden />
            <div><h3>Pruébalo en el laboratorio</h3><p>{guide.experiment}</p></div>
          </article>
        </div>
      )}
    </section>
  );
}
