import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { BilingualLogoImage } from "./Home.jsx";

const selfCheckQuestions = [
  {
    type: "confidence",
    prompt:
      "Al lavoro, sento che i miei colleghi capiscono facilmente quello che dico in italiano.",
    helper: "At work, my colleagues easily understand what I say in Italian.",
  },
  {
    type: "confidence",
    prompt: "Sento di riuscire a spiegare un problema semplice in italiano.",
    helper: "I can explain a simple problem in Italian.",
  },
  {
    type: "confidence",
    prompt: "Capisco le istruzioni quando qualcuno parla lentamente.",
    helper: "I understand instructions when someone speaks slowly.",
  },
  {
    type: "confidence",
    prompt:
      "Riesco a raccontare un avvenimento della mia giornata in italiano.",
    helper: "I can ask questions when I do not understand something.",
  },
  {
    type: "confidence",
    prompt: "Mi sento a mio agio in una breve conversazione in italiano.",
    helper: "I feel comfortable having a short conversation in Italian.",
  },
];

const translationQuestions = [
  {
    type: "translation",
    prompt: "I live in Rome.",
    options: [
      "Abito a Roma.",
      "Lavoro a Roma.",
      "Vengo da Roma.",
      "Vado a Roma.",
    ],
    correct: 0,
  },
  {
    type: "translation",
    prompt: "The car is red.",
    options: [
      "La strada è rossa.",
      "La macchina è rossa.",
      "La macchina è nuova.",
      "Il semaforo è rosso.",
    ],
    correct: 1,
  },
  {
    type: "translation",
    prompt: "We are going to work.",
    options: [
      "Lavoriamo da casa.",
      "Torniamo dal lavoro.",
      "Andiamo al lavoro.",
      "Usciamo dal lavoro.",
    ],
    correct: 2,
  },
  {
    type: "translation",
    prompt: "Can you help me?",
    options: [
      "Puoi aspettarmi?",
      "Puoi chiamarmi?",
      "Vuoi aiutarmi?",
      "Puoi aiutarmi?",
    ],
    correct: 3,
  },
  {
    type: "translation",
    prompt: "I drink water every day.",
    options: [
      "Bevo acqua ogni giorno.",
      "Compro acqua ogni giorno.",
      "Bevo caffè ogni giorno.",
      "L’acqua è fredda ogni giorno.",
    ],
    correct: 0,
  },
];

const questions = [...selfCheckQuestions, ...translationQuestions];
const confidenceOptions = ["Per niente", "Poco", "Abbastanza", "Si"];

function getResult(answers) {
  const score = questions.reduce((total, question, index) => {
    const answer = answers[index];
    if (answer === undefined) return total;
    if (question.type === "confidence") return total + (answer >= 2 ? 1 : 0);
    return total + (answer === question.correct ? 1 : 0);
  }, 0);
  const level = score <= 3 ? 0 : score <= 7 ? 1 : 2;
  return { score, level };
}

const levelDetails = [
  {
    title: "Partiamo dalle basi",
    description:
      "Nei quiz vedrai le frasi in italiano e in inglese, così potrai confrontarle con calma.",
  },
  {
    title: "Stai costruendo sicurezza",
    description:
      "Nei quiz userai l’italiano, con un aiuto per le parole più impegnative.",
  },
  {
    title: "Ottima base di italiano",
    description:
      "Nei quiz userai l’italiano e potrai aprire la traduzione delle parole più difficili.",
  },
];

export default function Assessment({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const current = questions[step];
  const selected = answers[step];
  const progress = showResult ? 100 : (step / questions.length) * 100;
  const result = useMemo(() => getResult(answers), [answers]);

  function continueAssessment() {
    if (step === questions.length - 1) setShowResult(true);
    else setStep((currentStep) => currentStep + 1);
  }

  function enterQuiz() {
    try {
      window.localStorage.setItem(
        "patentish-assessment",
        JSON.stringify({ level: result.level }),
      );
    } catch {
      // The assessment remains usable if the browser blocks local storage.
    }
    onComplete(result.level);
  }

  return (
    <div className="assessment-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Patentish, home">
          <span className="brand-image-wrap">
            <BilingualLogoImage className="brand-bilingual-logo" />
          </span>
          <span>
            patentish<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="topbar-center">A little Italian, every day</span>
        <span className="assessment-top-icon">
          <Compass size={18} />
        </span>
      </header>
      <main className="assessment-main">
        <div className="assessment-intro">
          <span className="assessment-kicker">
            <Sparkles size={14} /> YOUR STARTING POINT
          </span>
          <h1>
            Let’s find your
            <br />
            <em>Italian level.</em>
          </h1>
          <p>
            This quick check helps us shape your quiz experience around your
            Italian. There are 10 questions and no time limit.
          </p>
        </div>

        {!showResult ? (
          <section className="assessment-card" aria-live="polite">
            <div className="assessment-progress-row">
              <span>
                QUESTION <strong>{String(step + 1).padStart(2, "0")}</strong>{" "}
                <i>OF 10</i>
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="assessment-progress">
              <span style={{ width: `${Math.max(progress, 4)}%` }} />
            </div>
            {current.type === "confidence" ? (
              <>
                <span className="assessment-type">A QUICK SELF-CHECK</span>
                <h2>{current.prompt}</h2>
                <p className="assessment-helper">{current.helper}</p>
                <div className="confidence-options">
                  {confidenceOptions.map((option, index) => (
                    <button
                      key={option}
                      className={
                        selected === index
                          ? "assessment-option selected"
                          : "assessment-option"
                      }
                      onClick={() =>
                        setAnswers((previous) => ({
                          ...previous,
                          [step]: index,
                        }))
                      }
                    >
                      <span className="option-radio">
                        {selected === index && <span />}
                      </span>
                      {option}
                      <small>
                        {["Not at all", "A little", "Quite", "Yes"][index]}
                      </small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className="assessment-type">TRANSLATE INTO ITALIAN</span>
                <h2 className="translation-prompt">“{current.prompt}”</h2>
                <p className="assessment-helper">
                  Choose the sentence with the same meaning.
                </p>
                <div className="translation-options">
                  {current.options.map((option, index) => (
                    <button
                      key={option}
                      className={
                        selected === index
                          ? "translation-option selected"
                          : "translation-option"
                      }
                      onClick={() =>
                        setAnswers((previous) => ({
                          ...previous,
                          [step]: index,
                        }))
                      }
                    >
                      <span className="option-radio">
                        {selected === index && <span />}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="assessment-actions">
              <button
                className="back-button"
                onClick={() =>
                  setStep((currentStep) => Math.max(0, currentStep - 1))
                }
                disabled={step === 0}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="continue-button"
                onClick={continueAssessment}
                disabled={selected === undefined}
              >
                {step === questions.length - 1 ? "See my result" : "Continue"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        ) : (
          <section className="assessment-card result-card" aria-live="polite">
            <span className="result-icon">
              <Check size={23} />
            </span>
            <span className="assessment-type">YOUR STARTING POINT</span>
            <h2>{levelDetails[result.level].title}</h2>
            <p className="result-score">
              {result.score}
              <span> / 10</span>
            </p>
            <div className="level-track">
              <span className={result.level >= 0 ? "reached" : ""}>0–3</span>
              <span className={result.level >= 1 ? "reached" : ""}>4–7</span>
              <span className={result.level >= 2 ? "reached" : ""}>8–10</span>
            </div>
            <p className="result-description">
              {levelDetails[result.level].description}
            </p>
            <p className="result-note">
              This is just a starting point. You can improve your level as you
              practise.
            </p>
            <button
              className="continue-button result-continue"
              onClick={enterQuiz}
            >
              Explore the quizzes <ArrowRight size={16} />
            </button>
          </section>
        )}
        <div className="assessment-footnote">
          <span>No account needed</span>
          <span>·</span>
          <span>Your result stays on this device for now</span>
        </div>
      </main>
    </div>
  );
}
