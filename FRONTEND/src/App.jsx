import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, CircleHelp } from "lucide-react";
import Assessment from "./Assessment.jsx";
import Home, { BilingualLogoImage } from "./Home.jsx";
import ServicePage from "./ServicePage.jsx";
import AccountPage from "./account/AccountPage.jsx";
import FeedbackDialog from "./FeedbackDialog.jsx";
import EnglishHint from "./shared/EnglishHint.jsx";
import { API } from "./shared/api.js";
import ModeChooser from "./quiz/ModeChooser.jsx";
import QuizSession from "./quiz/QuizSession.jsx";
import { levelNames } from "./data/levels.js";
import LevelDialog from "./quiz/LevelDialog.jsx";

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
      window.localStorage.setItem(
        "patentish-assessment",
        JSON.stringify({ level: nextLevel }),
      );
    } catch {}
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

      <LevelDialog
        levelDialog={levelDialog}
        level={level}
        onClose={() => setLevelDialog(null)}
        onChoose={() => setLevelDialog("choose")}
        onBack={() => setLevelDialog("confirm")}
        onSave={saveNewLevel}
      />

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
