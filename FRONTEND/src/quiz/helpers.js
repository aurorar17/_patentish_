import { getWordGlosses, normalizeItalianWord } from "../vocabulary.js";

export function hasDifferentEnglish(question) {
  const english = (question.domanda_inglese || "").trim();
  const italian = (question.domanda_italiano || "").trim();
  return Boolean(
    english &&
    english.toLocaleLowerCase("it") !== italian.toLocaleLowerCase("it"),
  );
}

export function glossCount(question) {
  const words =
    (question.domanda_italiano || "").match(/[\p{L}]+(?:['’\-][\p{L}]+)*/gu) ||
    [];
  const glosses = getWordGlosses(question);
  return words.filter((word) => glosses[normalizeItalianWord(word)]).length;
}

