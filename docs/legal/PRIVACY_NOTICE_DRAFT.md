# Informativa privacy — BOZZA DA COMPLETARE

**Non pubblicare questa bozza finché tutti i campi tra parentesi quadre non sono compilati e i trattamenti non sono verificati con chi gestisce il sito.** Il provider di hosting non è stato scelto e l’identità e i recapiti del titolare non risultano dal repository.

Ultimo controllo normativo: 4 novembre 2026. Ambito previsto: sito di quiz gratuiti sulla teoria della patente, senza lezioni, pagamenti, newsletter o pubblicità comportamentale attivi.

## Titolare

Il titolare del trattamento è **[nome e cognome o ragione sociale]**, con sede in **[indirizzo completo]**. Contatto privacy: **[email dedicata]**. Se il titolare è stabilito fuori dall’UE, indicare l’eventuale rappresentante nell’UE: **[dati / non applicabile]**. RPD/DPO: **[contatti / valutare e documentare se la nomina è richiesta]**.

## Dati, finalità e basi giuridiche

| Dati | Perché sono trattati | Base giuridica da confermare | Conservazione da definire |
|---|---|---|---|
| Nome utente e password | Creare e proteggere l’account | Necessità di fornire la funzione account richiesta (GDPR art. 6(1)(b), da verificare rispetto alle condizioni del servizio) | Fino alla cancellazione dell’account; definire cancellazione automatica degli account inattivi |
| Progressi quiz: risposte, correttezza, testo IT/EN delle domande, categoria, livello, punteggio e data | Mostrare storico, errori e andamento nel profilo | Fornire la funzione di salvataggio richiesta (GDPR art. 6(1)(b), da confermare) | Fino alla cancellazione dell’account; eventuali copie di backup secondo il periodo del provider |
| Segnalazioni, eventuale email e associazione all’account se autenticato | Leggere e rispondere alle segnalazioni | Gestione della richiesta inviata e/o legittimo interesse a correggere il servizio; scegliere e documentare la base corretta | **[durata motivata]**; cancellare o anonimizzare quando la segnalazione non è più necessaria |
| Livello scelto nel test iniziale salvato in `localStorage` | Ricordare localmente il livello per mostrare i quiz con l’aiuto scelto | Valutare la stretta necessità della memorizzazione sul dispositivo ai sensi dell’art. 122 del Codice Privacy e la relativa base GDPR | Restano sul dispositivo fino alla cancellazione da parte dell’utente o del browser |
| Dati tecnici e log di sicurezza (ad esempio IP, user-agent, errori) | Sicurezza, diagnosi e prevenzione degli abusi | **[base e necessità da confermare con il provider]** | **[durata configurata dal provider]** |

Le password non vengono salvate in chiaro: la registrazione passa dal sistema di autenticazione Django, che memorizza un hash della password. L’account del progetto non richiede un indirizzo email.

Il test iniziale calcola un punteggio e suggerisce un livello di aiuto; non decide l’accesso a servizi essenziali né produce effetti giuridici sull’utente. Il punteggio e le risposte non vengono conservati dopo il test; viene salvato nel browser soltanto il livello scelto, non inviato al server.

Questa bozza è in italiano. Poiché l’interfaccia offre anche contenuti in inglese, prima del deploy va predisposta e verificata un’informativa inglese equivalente, se il sito sarà presentato anche a utenti anglofoni.

## Conferimento e destinatari

Il nome utente e la password sono necessari per creare e usare l’account; senza di essi si può usare il quiz senza salvare i progressi. L’email nelle segnalazioni è facoltativa. Il testo libero della segnalazione può contenere informazioni che l’utente decide di scrivere: non includere dati sensibili o di altre persone.

I dati server saranno accessibili al titolare e ai fornitori tecnici necessari: **[hosting/app]**, **[database/backup]**, **[posta o assistenza, se usata]**. Inserire le ragioni sociali, i paesi, i ruoli privacy e gli eventuali responsabili del trattamento. Trasferimenti fuori dallo Spazio Economico Europeo: **[nessuno / specificare paese, destinatario e garanzia]**.

## Diritti e reclami

La persona può chiedere accesso, rettifica, cancellazione, limitazione e, quando applicabile, portabilità; può opporsi ai trattamenti fondati sul legittimo interesse e revocare i consensi prestati. Le richieste si inviano a **[email privacy]**. Il riscontro è normalmente dovuto entro un mese. È possibile proporre reclamo al Garante per la protezione dei dati personali.

L’utente può eliminare l’account dalla pagina profilo dopo aver confermato la password. La funzione cancella i progressi e le segnalazioni collegate all’account. Le segnalazioni inviate senza account non sono collegate al profilo e richiedono una richiesta al contatto privacy.

## Sicurezza e aggiornamenti

Il titolare applica misure tecniche e organizzative adeguate al rischio e aggiorna questa informativa se cambiano finalità, dati, provider o tempi di conservazione. Prima della pubblicazione compilare l’identità del titolare, i fornitori effettivi, i trasferimenti e i tempi; documentare la base giuridica per ciascun trattamento.
