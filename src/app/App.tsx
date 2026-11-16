import { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  FlaskConical,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { blockTitles, syllabus, type LessonDefinition } from '../data/syllabus';
import { LabShell } from '../components/lab/LabShell';
import { useAppStore } from '../store/useAppStore';

function Sidebar({ current }: { current?: LessonDefinition }) {
  const { completed, sidebar, setSidebar } = useAppStore();
  const [query, setQuery] = useState('');
  const matches = syllabus.filter((x) => x.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <div className="brand">
        <span>
          <FlaskConical />
        </span>
        <div>
          <strong>Seguridad</strong>
          <b>CryptoLab</b>
        </div>
        <button aria-label="Cerrar temario" onClick={() => setSidebar(false)}>
          <X />
        </button>
      </div>
      <label className="search">
        <Search />
        <input
          placeholder="Buscar en 64 lecciones…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="progress">
        <div>
          <span>Tu progreso</span>
          <b>{completed.length}/64</b>
        </div>
        <progress max="64" value={completed.length} />
      </div>
      <nav aria-label="Temario">
        {[1, 2, 3, 4, 5].map((block) => (
          <details open key={block}>
            <summary>
              <span>BLOQUE {block}</span>
              <b>{blockTitles[block]}</b>
            </summary>
            {matches
              .filter((x) => x.block === block)
              .map((x) => (
                <Link className={current?.id === x.id ? 'active' : ''} to={x.route} key={x.id}>
                  <span>{completed.includes(x.id) ? <Check /> : x.order}</span>
                  {x.title}
                </Link>
              ))}
          </details>
        ))}
      </nav>
      <footer>
        <button
          onClick={() => {
            if (confirm('¿Borrar el progreso y las preferencias locales?'))
              useAppStore.getState().clear();
          }}
        >
          <Settings />
          Borrar mis datos locales
        </button>
      </footer>
    </aside>
  );
}

function LessonPage() {
  const { lessonId } = useParams(),
    lesson = syllabus.find((x) => x.id === lessonId);
  const { completed, toggleCompleted } = useAppStore();
  if (!lesson) return <Navigate to={syllabus[0]!.route} />;
  const markCurrentCompleted = () => {
    if (!completed.includes(lesson.id)) toggleCompleted(lesson.id);
  };
  return (
    <>
      <Sidebar current={lesson} />
      <main className="main">
        <Header lesson={lesson} />
        <div className="content">
          <section className="lesson-intro">
            <div>
              <span className="eyebrow">
                BLOQUE {lesson.block} · LECCIÓN {lesson.order} DE 64
              </span>
              <h1>{lesson.title}</h1>
            </div>
            <button
              className={`lesson-complete ${completed.includes(lesson.id) ? 'done' : ''}`}
              aria-pressed={completed.includes(lesson.id)}
              onClick={() => toggleCompleted(lesson.id)}
            >
              <Check />
              {completed.includes(lesson.id) ? 'Lección completada' : 'Marcar como completada'}
            </button>
          </section>
          <LabShell lesson={lesson} />
          <nav className="lesson-nav">
            {syllabus[lesson.order - 2] && (
              <Link to={syllabus[lesson.order - 2]!.route}>
                <ChevronLeft />
                Anterior
              </Link>
            )}
            {syllabus[lesson.order] && (
              <Link to={syllabus[lesson.order]!.route} onClick={markCurrentCompleted}>
                Siguiente <ChevronLeft className="next" />
              </Link>
            )}
          </nav>
        </div>
      </main>
    </>
  );
}

function Header({ lesson }: { lesson: LessonDefinition }) {
  const { theme, setTheme, setSidebar } = useAppStore();
  return (
    <header className="topbar">
      <button className="menu" aria-label="Abrir temario" onClick={() => setSidebar(true)}>
        <Menu />
      </button>
      <div className="crumb">
        Bloque {lesson.block}
        <span>/</span>
        {lesson.title}
      </div>
      <button
        aria-label="Cambiar tema"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? <Moon /> : <Sun />}
      </button>
    </header>
  );
}

function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate(syllabus[0]!.route, { replace: true });
  }, [navigate]);
  return null;
}
export default function App() {
  const theme = useAppStore((s) => s.theme),
    location = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bloque/:block/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
