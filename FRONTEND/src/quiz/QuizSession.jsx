import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import EnglishHint from "../shared/EnglishHint.jsx";
import { postApi } from "../shared/api.js";
import QuestionText from "./QuestionText.jsx";
import { glossCount, hasDifferentEnglish } from "./helpers.js";
import { levelNames } from "../data/levels.js";

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

export default QuizSession;
