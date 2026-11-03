import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Shuffle,
  SlidersHorizontal,
} from "lucide-react";
import Assessment from "./Assessment.jsx";
import Home, { BilingualLogoImage } from "./Home.jsx";
import ServicePage from "./ServicePage.jsx";
import { getWordGlosses, normalizeItalianWord } from "./vocabulary.js";

const API = "/api";
const levelNames = [
  "Con traduzione completa",
  "Con aiuto sulle parole",
  "In autonomia",
];

function QuestionText({ question, mode, openGlosses, setOpenGlosses }) {
  const glosses = getWordGlosses(question);
  const parts =
    (question.domanda_italiano || "").match(
      /([\p{L}]+(?:['’\-][\p{L}]+)*|\s+|[^\p{L}\s]+)/gu,
    ) || [];

  return (
    <>
      {parts.map((part, index) => {
        if (!/^[\p{L}]/u.test(part)) return <span key={index}>{part}</span>;
        const word = normalizeItalianWord(part.replace(/^['’]+|['’]+$/g, ""));
        const gloss = glosses[word];
        if (!gloss) return <span key={index}>{part}</span>;
        if (mode === "above")
          return (
            <span className="word-gloss-set" key={index}>
              <span className="word-gloss-label">{gloss}</span>
              <span className="word-gloss-text">{part}</span>
            </span>
          );

        const isOpen = Boolean(openGlosses[question.id]?.[word]);
        return (
          <button
            type="button"
            key={index}
            className={isOpen ? "gloss-word is-open" : "gloss-word"}
            aria-expanded={isOpen}
            aria-label={`${part}: ${gloss}`}
            onClick={() =>
              setOpenGlosses((current) => ({
                ...current,
                [question.id]: {
                  ...current[question.id],
                  [word]: !current[question.id]?.[word],
                },
              }))
            }
          >
            {part}
            {isOpen && <span className="word-gloss-popup">{gloss}</span>}
          </button>
        );
      })}
    </>
  );
}

function hasDifferentEnglish(question) {
  const english = (question.domanda_inglese || "").trim();
  const italian = (question.domanda_italiano || "").trim();
  return Boolean(
    english &&
    english.toLocaleLowerCase("it") !== italian.toLocaleLowerCase("it"),
  );
}

function glossCount(question) {
  const words =
    (question.domanda_italiano || "").match(/[\p{L}]+(?:['’\-][\p{L}]+)*/gu) ||
    [];
  const glosses = getWordGlosses(question);
  return words.filter((word) => glosses[normalizeItalianWord(word)]).length;
}

function EnglishHint({ children }) {
  return <small className="ui-english">{children}</small>;
}

function readCookie(name) {
  const cookie = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

async function postApi(path, payload) {
  let csrfToken = readCookie("csrftoken");
  if (!csrfToken) {
    const accountResponse = await fetch(`${API}/account/`, { credentials: "same-origin" });
    const accountData = await accountResponse.json();
    csrfToken = accountData.csrfToken || readCookie("csrftoken");
  }
  return fetch(`${API}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify(payload),
  });
}

function AccountPage({ account, onAccountChange, pendingProgress, onProgressSaved, onBack }) {
  const [authMode, setAuthMode] = useState(() => new URLSearchParams(window.location.search).get("account") === "register" ? "register" : "login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!account.authenticated) return undefined;
    let active = true;
    fetch(`${API}/progress/`, { credentials: "same-origin" })
      .then((response) => response.json())
      .then((data) => active && setProfile(data))
      .catch(() => active && setError("Non riesco a caricare i progressi."));
    return () => { active = false; };
  }, [account.authenticated]);

  useEffect(() => {
    if (!account.authenticated || !pendingProgress) return;
    postApi("/progress/", pendingProgress)
      .then((response) => { if (response.ok) onProgressSaved(); })
      .catch(() => setError("Non riesco a salvare questa scheda. Riprova tra poco."));
  }, [account.authenticated, pendingProgress, onProgressSaved]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await postApi(authMode === "register" ? "/register/" : "/login/", { username, password });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operazione non riuscita.");
      onAccountChange({ authenticated: true, username: data.username });
    } catch (submitError) {
      setError(submitError.message || "Non riesco a completare l’operazione.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await postApi("/logout/", {});
    onAccountChange({ authenticated: false, username: "" });
    setProfile(null);
  }

  const history = profile?.history || [];
  const points = history.map((item) => item.accuracy);
  const chartPoints = points.map((value, index) => `${points.length < 2 ? 180 : 10 + index * (340 / (points.length - 1))},${100 - value}`).join(" ");

  return <main className="page-wrap account-page">
    <button className="back-to-modes" onClick={onBack}><ArrowLeft size={15} /> Torna ai quiz<EnglishHint>Back to quizzes</EnglishHint></button>
    {account.authenticated ? <>
      <div className="account-heading"><span className="section-kicker">IL TUO PROFILO<EnglishHint>YOUR PROFILE</EnglishHint></span><h1>Ciao, {account.username}</h1><p>Qui trovi i tuoi progressi e le risposte da ripassare.<EnglishHint>Track your progress and review your mistakes here.</EnglishHint></p></div>
      {profile ? <>
        <section className="profile-stats">
          <div><strong>{profile.sheets_completed}</strong><span>Schede completate<EnglishHint>Sheets completed</EnglishHint></span></div>
          <div><strong>{profile.errors}</strong><span>Errori da ripassare<EnglishHint>Mistakes to review</EnglishHint></span></div>
          <div><strong>{profile.error_percentage}%</strong><span>Percentuale errori<EnglishHint>Error rate</EnglishHint></span></div>
        </section>
        <section className="profile-panel"><h2>Il tuo miglioramento<EnglishHint>Your progress</EnglishHint></h2>
          {points.length ? <><svg className="progress-chart" viewBox="0 0 360 110" role="img" aria-label="Grafico percentuale risposte corrette"><polyline points={chartPoints} fill="none" stroke="#5681a7" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{points.map((point, index) => <circle key={index} cx={points.length < 2 ? 180 : 10 + index * (340 / (points.length - 1))} cy={100 - point} r="4" fill="#315e8d" />)}</svg><p className="chart-caption">Percentuale di risposte corrette per scheda<EnglishHint>Correct answers per quiz sheet</EnglishHint></p></> : <p>Completa una scheda per vedere il grafico.<EnglishHint>Complete a sheet to see your chart.</EnglishHint></p>}
        </section>
        <section className="profile-panel"><h2>Ripassa gli errori<EnglishHint>Review your mistakes</EnglishHint></h2>
          {profile.errors_to_review?.length ? <ol className="mistake-list">{profile.errors_to_review.map((item, index) => <li key={`${item.question_id}-${index}`}><strong>{item.question_it}</strong><EnglishHint>{item.question_en}</EnglishHint><span>Risposta corretta: {item.correct_answer ? "Vero" : "Falso"}<EnglishHint>Correct answer: {item.correct_answer ? "True" : "False"}</EnglishHint></span></li>)}</ol> : <p>Nessun errore da ripassare per ora.<EnglishHint>No mistakes to review yet.</EnglishHint></p>}
        </section>
      </> : <p>Caricamento progressi…<EnglishHint>Loading progress…</EnglishHint></p>}
      {error && <p className="account-error">{error}</p>}
      <button className="level-cancel" onClick={signOut}>Esci<EnglishHint>Log out</EnglishHint></button>
    </> : <>
      <div className="account-heading"><span className="section-kicker">PROGRESSI GRATUITI<EnglishHint>FREE PROGRESS TRACKING</EnglishHint></span><h1>{authMode === "register" ? "Crea il tuo account" : "Accedi al tuo account"}<EnglishHint>{authMode === "register" ? "Create your free account" : "Log in to your account"}</EnglishHint></h1><p>Salva i risultati delle schede e ritrovali quando torni.<EnglishHint>Save your quiz results and pick up where you left off.</EnglishHint></p></div>
      <form className="account-form" onSubmit={submit}>
        <label>Nome utente<EnglishHint>Username</EnglishHint><input autoComplete="username" required minLength={3} maxLength={30} value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>Password<EnglishHint>Password</EnglishHint><input type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="account-error">{error}</p>}
        <button className="continue-button" disabled={busy}>{busy ? "Attendi…" : authMode === "register" ? "Iscriviti gratuitamente" : "Accedi"}<EnglishHint>{busy ? "Please wait…" : authMode === "register" ? "Sign up for free" : "Log in"}</EnglishHint><ArrowRight size={16} /></button>
      </form>
      <button className="account-switch" onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setError(""); }}>{authMode === "register" ? "Hai già un account? Accedi" : "Non hai un account? Iscriviti gratis"}<EnglishHint>{authMode === "register" ? "Already have an account? Log in" : "New here? Sign up for free"}</EnglishHint></button>
    </>}
  </main>;
}

function FeedbackDialog({ onClose, account }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await postApi("/feedback/", { message, email });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invio non riuscito.");
      setSent(true);
    } catch (submitError) { setError(submitError.message); }
  }
  return <div className="level-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="level-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title"><button className="level-modal-close" onClick={onClose} aria-label="Chiudi">×</button>{sent ? <><h2 id="feedback-title">Grazie per la segnalazione<EnglishHint>Thank you for your feedback</EnglishHint></h2><button className="continue-button" onClick={onClose}>Chiudi<EnglishHint>Close</EnglishHint></button></> : <form className="account-form" onSubmit={submit}><h2 id="feedback-title">Segnala un problema<EnglishHint>Report a problem</EnglishHint></h2><p>Hai trovato qualcosa che non ti sembra corretto? Raccontacelo.<EnglishHint>Found something that doesn’t look right? Let us know.</EnglishHint></p>{!account.authenticated && <label>Email (facoltativa)<EnglishHint>Email (optional)</EnglishHint><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>}<label>La tua segnalazione<EnglishHint>Your feedback</EnglishHint><textarea required minLength={8} maxLength={3000} value={message} onChange={(event) => setMessage(event.target.value)} /></label>{error && <p className="account-error">{error}</p>}<button className="continue-button">Invia segnalazione<EnglishHint>Send feedback</EnglishHint><ArrowRight size={16} /></button></form>}</section></div>;
}

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

function QuizSession({ questions, level, title, sessionMode, account, onExit, onOpenAccount, onFinished, onProgressSaved }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openGlosses, setOpenGlosses] = useState({});
  const [complete, setComplete] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const question = questions[currentIndex];
  const answerSelected = question ? Object.hasOwn(answers, question.id) : false;
  const answerIsCorrect =
    answerSelected && answers[question.id] === question.risposta_corretta;
  const image = question?.immagine
    ? question.immagine.startsWith("http")
      ? question.immagine
      : question.immagine.startsWith("/")
        ? question.immagine
        : `/media/${question.immagine}`
    : null;
  const translatedSentenceAvailable = question
    ? hasDifferentEnglish(question)
    : false;
  const annotatedWordCount = question ? glossCount(question) : 0;
  const correctCount = questions.filter(
    (item) => answers[item.id] === item.risposta_corretta,
  ).length;
  const incorrectCount = questions.length - correctCount;

  useEffect(() => {
    if (!answerSelected || complete) return undefined;
    const timer = window.setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        const progress = {
          mode: sessionMode,
          category_name: sessionMode === "category" ? title : "",
          level,
          answers: questions.map((item) => ({ question_id: item.id, selected: answers[item.id] })),
        };
        onFinished(progress);
        if (account.authenticated) {
          postApi("/progress/", progress).then((response) => {
            if (response.ok) { setProgressSaved(true); onProgressSaved(); }
          }).catch(() => {});
        } else {
          const alreadyPrompted = window.localStorage.getItem("patentish-first-sheet-prompted");
          if (!alreadyPrompted) setShowJoinPrompt(true);
          window.localStorage.setItem("patentish-first-sheet-prompted", "true");
        }
        setComplete(true);
      }
      else setCurrentIndex((index) => index + 1);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [answerSelected, complete, currentIndex, questions.length]);

  function selectAnswer(value) {
    if (!question || answerSelected) return;
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  }

  if (complete)
    return (
      <section className="sheet-complete" aria-live="polite">
        <div className="sheet-result-heading">
          <span className="result-icon">
            <Check size={23} />
          </span>
          <h2>
            Quiz completato<EnglishHint>Quiz complete</EnglishHint>
          </h2>
          <p className="sheet-score">
            {correctCount}
            <span> / {questions.length}</span>
          </p>
        </div>
        <div
          className="sheet-result-summary"
          aria-label={`${correctCount} risposte corrette e ${incorrectCount} errate`}
        >
          <div className="review-summary-correct">
            <strong>{correctCount}</strong>
            <span>
              corrette<EnglishHint>correct</EnglishHint>
            </span>
          </div>
          <div className="review-summary-incorrect">
            <strong>{incorrectCount}</strong>
            <span>
              errate<EnglishHint>incorrect</EnglishHint>
            </span>
          </div>
        </div>
        {showJoinPrompt && !account.authenticated && <aside className="join-prompt"><div><strong>Vuoi tenere traccia dei tuoi progressi?<EnglishHint>Would you like to track your progress?</EnglishHint></strong><p>Iscriviti al sito: è completamente gratuito e potrai salvare i risultati.<EnglishHint>Create a free account to save your quiz results.</EnglishHint></p></div><div className="join-prompt-actions"><button className="continue-button" onClick={() => onOpenAccount("register")}>Iscriviti gratis<EnglishHint>Sign up for free</EnglishHint><ArrowRight size={15} /></button><button className="level-cancel" onClick={() => onOpenAccount("login")}>Accedi<EnglishHint>Log in</EnglishHint></button></div></aside>}
        {account.authenticated && progressSaved && <p className="progress-saved-note">Progressi salvati nel tuo profilo.<EnglishHint>Progress saved to your profile.</EnglishHint></p>}
        <h3 className="sheet-review-heading">
          Rivedi tutte le domande<EnglishHint>Review all questions</EnglishHint>
        </h3>
        <ol
          className="sheet-review-list"
          aria-label="Domande e risposte della scheda / Sheet questions and answers"
          tabIndex={0}
        >
          {questions.map((reviewQuestion, index) => {
            const wasCorrect =
              answers[reviewQuestion.id] === reviewQuestion.risposta_corretta;
            const selectedAnswer = answers[reviewQuestion.id];
            const reviewImage = reviewQuestion.immagine
              ? reviewQuestion.immagine.startsWith("http")
                ? reviewQuestion.immagine
                : reviewQuestion.immagine.startsWith("/")
                  ? reviewQuestion.immagine
                  : `/media/${reviewQuestion.immagine}`
              : null;
            return (
              <li
                className={`sheet-review-item ${wasCorrect ? "review-item-correct" : "review-item-incorrect"}`}
                key={reviewQuestion.id}
              >
                <div className="sheet-review-item-heading">
                  <span>
                    DOMANDA {String(index + 1).padStart(2, "0")}
                    <EnglishHint>
                      QUESTION {String(index + 1).padStart(2, "0")}
                    </EnglishHint>
                  </span>
                  <strong>
                    {wasCorrect ? (
                      <>
                        Corretta<EnglishHint>Correct</EnglishHint>
                      </>
                    ) : (
                      <>
                        Errata<EnglishHint>Incorrect</EnglishHint>
                      </>
                    )}
                  </strong>
                </div>
                {reviewImage && (
                  <img
                    className="sheet-review-image"
                    src={reviewImage}
                    alt="Immagine della domanda"
                  />
                )}
                {level === 0 ? (
                  <div className="sheet-review-question">
                    <p>{reviewQuestion.domanda_italiano}</p>
                    {hasDifferentEnglish(reviewQuestion) && (
                      <p className="sheet-review-english">
                        {reviewQuestion.domanda_inglese}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="sheet-review-question">
                    <QuestionText
                      question={reviewQuestion}
                      mode={level === 1 ? "above" : "click"}
                      openGlosses={openGlosses}
                      setOpenGlosses={setOpenGlosses}
                    />
                  </p>
                )}
                <div className="sheet-review-answers">
                  <div>
                    <span>
                      La tua risposta<EnglishHint>Your answer</EnglishHint>
                    </span>
                    <strong
                      className={
                        wasCorrect
                          ? "review-answer-correct"
                          : "review-answer-incorrect"
                      }
                    >
                      {selectedAnswer === true ? (
                        <>
                          Vero <EnglishHint>True</EnglishHint>
                        </>
                      ) : (
                        <>
                          Falso <EnglishHint>False</EnglishHint>
                        </>
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>
                      Risposta corretta<EnglishHint>Correct answer</EnglishHint>
                    </span>
                    <strong>
                      {reviewQuestion.risposta_corretta ? (
                        <>
                          Vero <EnglishHint>True</EnglishHint>
                        </>
                      ) : (
                        <>
                          Falso <EnglishHint>False</EnglishHint>
                        </>
                      )}
                    </strong>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <button className="continue-button" onClick={onExit}>
          Scegli un altro quiz<EnglishHint>Choose another quiz</EnglishHint>{" "}
          <ArrowRight size={16} />
        </button>
      </section>
    );

  if (!question)
    return (
      <div className="message-card">Non ci sono quiz in questa scheda.</div>
    );

  return (
    <section className="single-sheet" aria-live="polite">
      <div className="single-sheet-progress">
        <span>
          DOMANDA <strong>{String(currentIndex + 1).padStart(2, "0")}</strong>{" "}
          <i>DI {questions.length}</i>
          <EnglishHint>
            QUESTION {String(currentIndex + 1).padStart(2, "0")} OF{" "}
            {questions.length}
          </EnglishHint>
        </span>
        <span>{question.categoria_nome}</span>
      </div>
      <div className="single-sheet-track">
        <span
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <article className="single-question-card">
        <div className="single-question-meta">
          <span className="category-label">{question.categoria_nome}</span>
          <span className="question-number">{levelNames[level]}</span>
        </div>
        {image && (
          <img
            className="single-question-image"
            src={image}
            alt="Illustrazione del quiz"
          />
        )}
        {level === 0 ? (
          <div className="bilingual-question">
            <div className="language-version">
              <span className="language-version-label">
                IT · ITALIANO<EnglishHint>ITALIAN</EnglishHint>
              </span>
              <p>{question.domanda_italiano}</p>
            </div>
            <div className="language-version language-version-en">
              <span className="language-version-label">EN · ENGLISH</span>
              <p>
                {translatedSentenceAvailable ? (
                  question.domanda_inglese
                ) : (
                  <span className="translation-unavailable">
                    Traduzione inglese non ancora disponibile.
                    <EnglishHint>
                      English translation not available yet.
                    </EnglishHint>
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <h2>
            <QuestionText
              question={question}
              mode={level === 1 ? "above" : "click"}
              openGlosses={openGlosses}
              setOpenGlosses={setOpenGlosses}
            />
          </h2>
        )}
        {level > 0 && annotatedWordCount === 0 && (
          <p className="single-english-translation">
            {translatedSentenceAvailable ? (
              <>
                <span className="translation-language">EN</span>
                {question.domanda_inglese}
              </>
            ) : (
              "Le traduzioni delle parole per questa domanda non sono ancora disponibili."
            )}
          </p>
        )}
        {level === 1 && annotatedWordCount > 0 && (
          <p className="glossary-help">
            La traduzione delle parole chiave appare sopra la parola.
            <EnglishHint>
              Key word translations appear above each word.
            </EnglishHint>
          </p>
        )}
        {level === 2 && annotatedWordCount > 0 && (
          <p className="glossary-help">
            Tocca le parole evidenziate per vedere la traduzione.
            <EnglishHint>
              Tap highlighted words to see the translation.
            </EnglishHint>
          </p>
        )}
        <div className="single-answer-options">
          <button
            className={
              answerSelected && answers[question.id] === true
                ? answerIsCorrect
                  ? "single-answer selected correct"
                  : "single-answer selected incorrect"
                : "single-answer"
            }
            onClick={() => selectAnswer(true)}
            disabled={answerSelected}
            aria-pressed={answerSelected && answers[question.id] === true}
          >
            <span>Vero</span>
            <EnglishHint>True</EnglishHint>
          </button>
          <button
            className={
              answerSelected && answers[question.id] === false
                ? answerIsCorrect
                  ? "single-answer selected correct"
                  : "single-answer selected incorrect"
                : "single-answer"
            }
            onClick={() => selectAnswer(false)}
            disabled={answerSelected}
            aria-pressed={answerSelected && answers[question.id] === false}
          >
            <span>Falso</span>
            <EnglishHint>False</EnglishHint>
          </button>
        </div>
      </article>
    </section>
  );
}

function App() {
  const routePath = window.location.pathname.replace(/\/+$/, "") || "/";
  const servicePageType =
    routePath === "/bilingual-lessons"
      ? "bilingual-lessons"
      : routePath === "/individual-lessons"
        ? "individual-lessons"
        : null;
  const isHomePage = routePath === "/";
  const isServicePage = servicePageType !== null;
  const [level, setLevel] = useState(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("patentish-assessment") || "null",
      );
      return Number.isInteger(saved?.level) &&
        saved.level >= 0 &&
        saved.level <= 2
        ? saved.level
        : null;
    } catch {
      return null;
    }
  });
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).has("account") ? "account" : "choose");
  const [account, setAccount] = useState({ authenticated: false, username: "" });
  const [pendingProgress, setPendingProgress] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(() => new URLSearchParams(window.location.search).get("feedback") === "1");
  const [sessionMode, setSessionMode] = useState("random");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [levelDialog, setLevelDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearPendingProgress = useCallback(() => setPendingProgress(null), []);

  useEffect(() => {
    fetch(`${API}/account/`, { credentials: "same-origin" })
      .then((response) => response.json())
      .then((data) => setAccount({ authenticated: data.authenticated, username: data.username || "" }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isHomePage || isServicePage || level === null) return undefined;
    let active = true;
    fetch(`${API}/categorie/`)
      .then((response) => {
        if (!response.ok)
          throw new Error("Non riesco a caricare le categorie.");
        return response.json();
      })
      .then((categoryData) => {
        if (!active) return;
        setCategories(categoryData);
      })
      .catch(
        () =>
          active &&
          setError(
            "Non riesco a raggiungere il backend sulla porta 8003. Controlla che Django sia avviato.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isHomePage, isServicePage, level]);

  async function openCategory(category) {
    setSessionLoading(true);
    setSessionError("");
    try {
      const response = await fetch(`${API}/quiz/?categoria=${category.id}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setQuestions(data);
      setSessionMode("category");
      setSessionTitle(category.nome);
      setView("session");
    } catch {
      setSessionError(
        "Non è stato possibile caricare i quiz di questa categoria. Riprova tra poco.",
      );
    } finally {
      setSessionLoading(false);
    }
  }

  async function openRandomSheet() {
    setSessionLoading(true);
    setSessionError("");
    try {
      const response = await fetch(`${API}/scheda-random/`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setQuestions(data);
      setSessionMode("random");
      setSessionTitle("Scheda casuale · 30 quiz");
      setView("session");
    } catch {
      setSessionError(
        "Non è stato possibile creare la scheda casuale. Riprova tra poco.",
      );
    } finally {
      setSessionLoading(false);
    }
  }

  function saveNewLevel(nextLevel) {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("patentish-assessment") || "{}",
      );
      window.localStorage.setItem(
        "patentish-assessment",
        JSON.stringify({
          ...saved,
          level: nextLevel,
          manuallySelected: true,
          levelChangedAt: new Date().toISOString(),
        }),
      );
    } catch {
      window.localStorage.setItem(
        "patentish-assessment",
        JSON.stringify({
          level: nextLevel,
          manuallySelected: true,
          levelChangedAt: new Date().toISOString(),
        }),
      );
    }
    setLevel(nextLevel);
    setLevelDialog(null);
  }

  if (isHomePage) return <Home />;
  if (servicePageType) return <ServicePage type={servicePageType} />;
  if (level === null) return <><Assessment onComplete={setLevel} />{feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} account={account} />}</>;

  return (
    <div
      className={view === "session" ? "app-shell session-active" : "app-shell"}
    >
      <header className="topbar">
        <a className="brand" href="/" aria-label="Patentish, home">
          <span className="brand-image-wrap">
            <BilingualLogoImage className="brand-bilingual-logo" />
          </span>
          <span>
            patentish<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="topbar-center">
          <span className="live-dot" /> Il tuo spazio di esercitazione
          <EnglishHint>Your practice space</EnglishHint>
        </div>
        <button
          className="level-badge level-badge-button"
          aria-label="Cambia livello / Change level"
          onClick={() => setLevelDialog("confirm")}
        >
          <span className="level-badge-labels">
            <span>Cambia livello</span>
            <span>Change level</span>
          </span>
          <ChevronDown size={13} />
        </button>
      </header>

      {levelDialog && (
        <div
          className="level-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLevelDialog(null);
          }}
        >
          <section
            className="level-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-modal-title"
          >
            <button
              className="level-modal-close"
              onClick={() => setLevelDialog(null)}
              aria-label="Chiudi / Close"
            >
              ×
            </button>
            {levelDialog === "confirm" ? (
              <>
                <span className="level-modal-kicker">IL TUO PERCORSO<EnglishHint>YOUR LEARNING PATH</EnglishHint></span>
                <h2 id="level-modal-title">
                  Sei sicuro di voler cambiare livello?<EnglishHint>Are you sure you want to change your level?</EnglishHint>
                </h2>
                <p>
                  Stai usando il percorso “{levelNames[level]}”. Cambiarlo
                  modifica il supporto linguistico mostrato nei quiz. Puoi
                  cambiarlo di nuovo in qualsiasi momento.
                  <EnglishHint>You’re using “{levelNames[level]}”. Changing it updates the language support in your quizzes. You can change it again at any time.</EnglishHint>
                </p>
                <div className="level-modal-actions">
                  <button
                    className="level-cancel"
                    onClick={() => setLevelDialog(null)}
                  >
                    No, lascia così<EnglishHint>No, keep it</EnglishHint>
                  </button>
                  <button
                    className="continue-button"
                    onClick={() => setLevelDialog("choose")}
                  >
                    Sì, scegli un livello<EnglishHint>Yes, choose a level</EnglishHint> <ArrowRight size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="level-modal-kicker">
                  SCEGLI IL TUO LIVELLO<EnglishHint>CHOOSE YOUR LEVEL</EnglishHint>
                </span>
                <h2 id="level-modal-title">Come vuoi vedere i quiz?<EnglishHint>How would you like to view the quizzes?</EnglishHint></h2>
                <div className="level-choice-list">
                  {[
                    {
                      title: levelNames[0],
                      description:
                        "Ogni quiz mostra la domanda in italiano e in inglese.",
                      english:
                        "Each quiz shows the question in Italian and English.",
                    },
                    {
                      title: levelNames[1],
                      description:
                        "Le traduzioni delle parole chiave appaiono sopra la parola.",
                      english:
                        "Key word translations appear above each word.",
                    },
                    {
                      title: levelNames[2],
                      description:
                        "Puoi toccare le parole evidenziate per tradurle.",
                      english:
                        "Tap highlighted words to see their translation.",
                    },
                  ].map((option, index) => (
                    <button
                      key={option.title}
                      className={
                        level === index
                          ? "level-choice current"
                          : "level-choice"
                      }
                      onClick={() => saveNewLevel(index)}
                    >
                      <span className="level-choice-text">
                        <strong>{option.title}</strong>
                        <small>{option.description}<EnglishHint>{option.english}</EnglishHint></small>
                      </span>
                      {level === index ? (
                        <span className="current-level-label">Attuale<EnglishHint>Current</EnglishHint></span>
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="level-cancel choose-cancel"
                  onClick={() => setLevelDialog("confirm")}
                >
                  Indietro<EnglishHint>Back</EnglishHint>
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {view === "account" ? (
        <AccountPage
          account={account}
          onAccountChange={setAccount}
          pendingProgress={pendingProgress}
          onProgressSaved={clearPendingProgress}
          onBack={() => setView("choose")}
        />
      ) : view === "choose" ? (
        <ModeChooser
          categories={categories}
          loading={loading}
          error={error}
          busy={sessionLoading}
          sessionError={sessionError}
          onChooseCategory={openCategory}
          onChooseRandom={openRandomSheet}
        />
      ) : (
        <main className="page-wrap session-page-wrap">
          <div className="breadcrumbs">
            <span>
              Area studio<EnglishHint>Study area</EnglishHint>
            </span>
            <span className="crumb-slash">/</span>
            <strong>
              Quiz<EnglishHint>Quizzes</EnglishHint>
            </strong>
          </div>

          <section className="quiz-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  IL TUO PERCORSO<EnglishHint>YOUR LEARNING PATH</EnglishHint>
                </span>
                <h2>{sessionTitle}</h2>
              </div>
              <span className="mode-caption">
                {level === 0 ? (
                  <>
                    Italiano + English
                    <EnglishHint>Full translation</EnglishHint>
                  </>
                ) : level === 1 ? (
                  <>
                    Aiuto sulle parole chiave
                    <EnglishHint>Key word support</EnglishHint>
                  </>
                ) : (
                  <>
                    Tocca le parole blu per la traduzione
                    <EnglishHint>Tap blue words to translate</EnglishHint>
                  </>
                )}
              </span>
            </div>
            <div className="session-toolbar">
              <button
                className="back-to-modes"
                onClick={() => setView("choose")}
              >
                <ArrowLeft size={15} />
                <span>
                  Cambia modalità<EnglishHint>Change mode</EnglishHint>
                </span>
              </button>
            </div>

            {sessionLoading && (
              <div className="message-card">
                <span className="loader" />
                <span>
                  Preparo i quiz…<EnglishHint>Preparing quizzes…</EnglishHint>
                </span>
              </div>
            )}
            {!sessionLoading && sessionError && (
              <div className="message-card error-card">
                <CircleHelp size={20} />
                <span>{sessionError}</span>
              </div>
            )}
            {!sessionLoading && !sessionError && (
              <QuizSession
                questions={questions}
                level={level}
                title={sessionTitle}
                sessionMode={sessionMode}
                account={account}
                onExit={() => setView("choose")}
                onOpenAccount={() => setView("account")}
                onFinished={setPendingProgress}
                onProgressSaved={clearPendingProgress}
              />
            )}
          </section>
        </main>
      )}
      {feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} account={account} />}
      <footer className="footer">
        <span>© Patentish</span>
        <span>Un piccolo passo ogni giorno fa la differenza.</span>
        <span className="footer-notice">Sito in fase di completamento: potrebbe contenere errori.<EnglishHint>This site is still being completed and may contain errors.</EnglishHint></span>
        <button className="footer-action" onClick={() => setFeedbackOpen(true)}>Segnala un errore<EnglishHint>Report an issue</EnglishHint></button>
        <button className="footer-action" onClick={() => setView("account")}>{account.authenticated ? `Profilo · ${account.username}` : "Accedi / Iscriviti gratis"}<EnglishHint>{account.authenticated ? "Profile" : "Log in / Sign up for free"}</EnglishHint></button>
      </footer>
    </div>
  );
}

export default App;
