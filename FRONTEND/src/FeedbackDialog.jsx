import { useState } from "react";
import { ArrowRight } from "lucide-react";
import EnglishHint from "./shared/EnglishHint.jsx";
import { postApi } from "./shared/api.js";

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

export default FeedbackDialog;
