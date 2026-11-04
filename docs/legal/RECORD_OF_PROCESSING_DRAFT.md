# Registro dei trattamenti — BOZZA interna

Da completare e mantenere dal titolare del trattamento prima del deploy. Non sostituisce l’informativa agli utenti. Basato sull’ambito attuale del repository: quiz gratuiti, account facoltativi, progressi salvati, segnalazioni; lezioni e pagamenti esclusi.

## Titolare e contatti

- Titolare: [nome / ragione sociale]
- Sede: [indirizzo]
- Contatto privacy: [email]
- RPD/DPO, se nominato: [contatti]
- Data revisione: [data]

## Trattamenti previsti

| Trattamento | Interessati e dati | Finalità e base da documentare | Destinatari / trasferimenti | Cancellazione da definire |
|---|---|---|---|---|
| Account e autenticazione | Utenti registrati; username e hash password | Gestire l’account richiesto; verificare base art. 6 GDPR | Hosting e database scelti; paesi da verificare | Cancellazione account su richiesta; definire inattività e backup |
| Progressi quiz | Utenti autenticati; risposte, correttezza, testo delle domande, categoria, livello, punteggio, data | Salvare e mostrare lo storico richiesto; verificare base art. 6 GDPR | Hosting e database scelti; paesi da verificare | Insieme all’account; definire scadenza dei backup |
| Segnalazioni | Utenti autenticati o visitatori; testo, email facoltativa, account se autenticati | Gestire e risolvere segnalazioni; documentare base e necessità | Hosting/database; eventuale assistenza email da decidere | [periodo motivato] |
| Preferenza locale quiz | Visitatori; livello selezionato in localStorage | Ricordare la preferenza sul dispositivo; verificare stretta necessità e art. 122 Codice Privacy | Nessun destinatario server previsto | L’utente/browser può cancellarla; definire durata tecnica |
| Sicurezza e log | Visitatori/utenti; IP e metadati di richiesta secondo configurazione del provider | Proteggere servizio e prevenire abusi; definire base, minimizzazione e retention | Hosting, proxy e logging scelti | [durata del provider da confermare] |

## Misure e controlli da registrare

- Accesso: account amministrativi nominativi, MFA ove disponibile, privilegi minimi.
- Protezione: HTTPS, cookie `Secure`/`HttpOnly`, segreti nel secret manager, database privato con TLS.
- Continuità: backup cifrati, retention documentata e prova periodica di ripristino.
- Applicazione: rate limiting, aggiornamenti dipendenze, log senza password/token/payload non necessari.
- Diritti: canale per accesso, rettifica, cancellazione, limitazione, opposizione e portabilità quando applicabile; procedura per rispondere entro i termini GDPR.
- Incidenti: contatto interno [referente], valutazione documentata delle violazioni, registro degli incidenti e procedura per notifiche al Garante e comunicazioni agli interessati quando richiesto.
- Responsabili/sub-responsabili: [provider hosting, database, backup, proxy, email; contratto/DPA, sede e trasferimenti da verificare].

## Decisioni che impediscono la chiusura del registro

Identità e sede del titolare, provider e regione, responsabili e trasferimenti, basi giuridiche definitive, tempi di conservazione di segnalazioni/log/backup, procedura per richieste privacy e valutazione dell’eventuale necessità di un RPD/DPO.
