import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EnglishHint from "../shared/EnglishHint.jsx";
import { API, postApi } from "../shared/api.js";

function AccountPage({ account, onAccountChange, pendingProgress, onProgressSaved, onBack }) {
  const [authMode, setAuthMode] = useState(() => new URLSearchParams(window.location.search).get("account") === "register" ? "register" : "login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

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

  async function deleteAccount(event) {
    event.preventDefault();
    setDeleteError("");
    if (!window.confirm("Eliminare definitivamente account, progressi e segnalazioni associate?")) return;

    setDeleteBusy(true);
    try {
      const response = await postApi("/account/delete/", { password: deletePassword });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Non riesco a eliminare l’account.");
      window.localStorage.removeItem("patentish-assessment");
      window.localStorage.removeItem("patentish-first-sheet-prompted");
      onProgressSaved();
      onAccountChange({ authenticated: false, username: "" });
      onBack();
    } catch (deleteAccountError) {
      setDeleteError(deleteAccountError.message || "Non riesco a eliminare l’account.");
    } finally {
      setDeleteBusy(false);
    }
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
      <section className="profile-panel account-delete-panel">
        <h2>Elimina il tuo account<EnglishHint>Delete your account</EnglishHint></h2>
        <p>Questa operazione elimina account, progressi e segnalazioni associate. Non si può annullare.<EnglishHint>This permanently deletes your account, progress, and related feedback.</EnglishHint></p>
        <form className="account-form" onSubmit={deleteAccount}>
          <label>Conferma con la password<EnglishHint>Confirm with your password</EnglishHint><input type="password" autoComplete="current-password" required value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /></label>
          {deleteError && <p className="account-error">{deleteError}</p>}
          <button className="level-cancel" disabled={deleteBusy}>{deleteBusy ? "Eliminazione…" : "Elimina account"}<EnglishHint>{deleteBusy ? "Deleting…" : "Delete account"}</EnglishHint></button>
        </form>
      </section>
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

export default AccountPage;
