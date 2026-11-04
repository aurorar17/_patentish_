# Prossima sessione — richieste del 4 novembre 2026

Riprendere questi interventi nella prossima sessione. Questo file raccoglie le richieste; le modifiche non sono ancora implementate.

## 1. Schede quiz con dimensioni stabili su mobile e desktop

- Dare alle schede una grandezza stabile e coerente in tutte le categorie e nella scheda mista, adattata allo schermo.
- Mantenere i comandi Vero/Falso alla stessa altezza passando da una domanda all’altra, anche quando è presente un’immagine o cambia la lunghezza del testo.
- Riservare lo spazio necessario a immagini e contenuto, evitando che i pulsanti vengano spinti verso il basso.
- Obiettivo: l’utente non deve scorrere continuamente in alto e in basso per rispondere.
- Verificare il comportamento su mobile e desktop, con e senza immagini, testi lunghi e traduzioni.

## 2. File manuale per le traduzioni delle parole — categorie 2 e 3

- Aggiungere un file chiaro e facilmente modificabile in cui la proprietaria possa inserire manualmente le parole e le rispettive traduzioni.
- Collegarlo alle categorie 2 e 3 e al sistema di traduzione delle parole nelle domande.
- Verificare la corrispondenza tra identificativi delle categorie e categorie visualizzate prima di implementare.
- Documentare con un esempio il formato e come aggiungere nuove parole.

## 3. Profilo: progressi non salvati nonostante login apparente

- Riprodurre il problema: l’interfaccia sembra indicare una sessione autenticata, ma il profilo non mostra/salva i progressi.
- Controllare sessione reale, cookie, CSRF, invio a `/api/progress/`, completamento scheda, gestione errori e aggiornamento del profilo.
- Verificare che i progressi vengano associati all’utente corretto e restino disponibili dopo ricaricamento e nuovo accesso.
- Mostrare eventuali errori di salvataggio in modo comprensibile, evitando che l’interfaccia suggerisca un salvataggio riuscito quando non lo è.

## 4. Benvenuto e accesso al profilo per utenti autenticati

Quando l’utente è autenticato, sostituire il testo introduttivo:

> Scegli un argomento specifico oppure metti alla prova le tue conoscenze con una scheda mista da 30 domande.
> Choose a topic or test yourself with a mixed sheet of 30 questions.

Nella stessa posizione in alto mostrare:

- Un saluto, ad esempio «Bentornato, [nome utente]».
- Un pulsante per aprire il profilo e consultare i progressi.
- Testi coerenti con l’interfaccia bilingue esistente.

Per i visitatori senza login mantenere l’introduzione attuale.

## Contesto per il lancio

- Ultimo commit prima di questo promemoria: `13f6c1f` — `check sicurezza`.
- Il primo deploy riguarderà solo i quiz; non implementare lezioni o pagamenti.
- Hosting ancora da scegliere. Dati del titolare e documenti legali da completare prima del lancio, previsto indicativamente tra un mese.
