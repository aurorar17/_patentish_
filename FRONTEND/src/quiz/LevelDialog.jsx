import { ArrowRight } from "lucide-react";
import EnglishHint from "../shared/EnglishHint.jsx";
import { levelNames, levelOptions } from "../data/levels.js";

export default function LevelDialog({ levelDialog, level, onClose, onChoose, onBack, onSave }) {
  if (!levelDialog) return null;
  return (
        <div
          className="level-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
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
              onClick={() => onClose()}
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
                    onClick={() => onClose()}
                  >
                    No, lascia così<EnglishHint>No, keep it</EnglishHint>
                  </button>
                  <button
                    className="continue-button"
                    onClick={() => onChoose()}
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
                  {levelOptions.map((option, index) => (
                    <button
                      key={option.title}
                      className={
                        level === index
                          ? "level-choice current"
                          : "level-choice"
                      }
                      onClick={() => onSave(index)}
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
                  onClick={() => onBack()}
                >
                  Indietro<EnglishHint>Back</EnglishHint>
                </button>
              </>
            )}
          </section>
        </div>
  );
}
