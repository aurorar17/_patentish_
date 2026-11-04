import { ArrowRight, BookOpen, CircleHelp, Clock3, Shuffle, SlidersHorizontal } from "lucide-react";
import EnglishHint from "../shared/EnglishHint.jsx";

function ModeChooser({
  categories,
  loading,
  error,
  busy,
  sessionError,
  onChooseCategory,
  onChooseRandom,
}) {
  const totalQuizCount = categories.reduce(
    (total, category) => total + (Number(category.quiz_count) || 0),
    0,
  );

  return (
    <main className="page-wrap mode-page">
      {/* <div className="breadcrumbs"><span>Area studio<EnglishHint>Study area</EnglishHint></span><span className="crumb-slash">/</span><strong>Scegli il tuo quiz<EnglishHint>Choose your quiz</EnglishHint></strong></div> */}
      <section className="mode-intro">
        <p className="intro-copy">
          Scegli un argomento specifico oppure metti alla prova le tue
          conoscenze con una scheda mista da 30 domande.
          <EnglishHint>
            Choose a topic or test yourself with a mixed sheet of 30 questions.
          </EnglishHint>
        </p>
      </section>
      <section
        className="stats-row"
        aria-label="Riepilogo quiz / Quiz overview"
      >
        <div className="stat">
          <span className="stat-icon">
            <BookOpen size={18} />
          </span>
          <span>
            <strong>{totalQuizCount || "—"}</strong>
            <small>
              quiz disponibili<EnglishHint>quizzes available</EnglishHint>
            </small>
          </span>
        </div>
        <span className="stat-divider" />
        <div className="stat">
          <span className="stat-icon stat-icon-green">
            <SlidersHorizontal size={18} />
          </span>
          <span>
            <strong>{categories.length || "—"}</strong>
            <small>
              argomenti <EnglishHint>topics to explore</EnglishHint>
            </small>
          </span>
        </div>
        <span className="stat-divider" />
        <div className="stat">
          <span className="stat-icon stat-icon-peach">
            <Clock3 size={18} />
          </span>
          <span className="stat-at-your-pace">
            <strong>
              Al tuo ritmo<EnglishHint>At your own pace</EnglishHint>
            </strong>
            <small>
              senza fretta, un passo alla volta
              <EnglishHint>One step at a time</EnglishHint>
            </small>
          </span>
        </div>
      </section>
      <button
        className="random-sheet-card"
        onClick={onChooseRandom}
        disabled={busy}
      >
        <span className="random-icon">
          <Shuffle size={21} />
        </span>
        <span className="random-sheet-copy">
          <strong>
            Scheda quiz casuali<EnglishHint>Random quiz sheet</EnglishHint>
          </strong>
          <small>
            <EnglishHint>from all topics</EnglishHint>
          </small>
        </span>
        <span className="random-sheet-cta">
          {busy ? (
            <>
              Preparo la scheda…<EnglishHint>Getting it ready…</EnglishHint>
            </>
          ) : (
            <>
              Inizia<EnglishHint>Start</EnglishHint>
            </>
          )}{" "}
          <ArrowRight size={17} />
        </span>
      </button>
      {sessionError && <p className="mode-error">{sessionError}</p>}
      <section className="category-picker">
        <div className="picker-heading">
          <div>
            <span className="section-kicker">
              SCEGLI IL TUO ARGOMENTO<EnglishHint>CHOOSE A TOPIC</EnglishHint>
            </span>
            <h2>
              Quiz per categoria<EnglishHint>Quizzes by topic</EnglishHint>
            </h2>
          </div>
          <span>
            {categories.length} argomenti<EnglishHint>topics</EnglishHint>
          </span>
        </div>
        {loading && (
          <div className="message-card">
            <span className="loader" />
            Caricamento categorie…
          </div>
        )}
        {!loading && error && (
          <div className="message-card error-card">
            <CircleHelp size={20} />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="category-picker-grid">
            {categories.map((category, index) => (
              <button
                className="category-choice"
                key={category.id}
                onClick={() => onChooseCategory(category)}
                disabled={busy}
              >
                <span className="category-choice-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="category-choice-text">
                  <strong>{category.nome}</strong>
                  <small>
                    {category.quiz_count ?? "—"} quiz
                    <EnglishHint>quizzes</EnglishHint>
                  </small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ModeChooser;
