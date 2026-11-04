import { getWordGlosses, normalizeItalianWord } from "../vocabulary.js";

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

export default QuestionText;
