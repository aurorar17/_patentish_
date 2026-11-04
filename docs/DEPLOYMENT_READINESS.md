# Preparazione deploy — quiz

Stato: preparazione tecnica completata in parte; **non distribuire finché non sono stati scelti provider/dominio, compilate le variabili segrete e completata la verifica legale**.

## Architettura consigliata

Pubblicare il frontend e il backend sotto lo stesso dominio: frontend alla radice, Django su `/api/`, `/media/` e `/admin/` tramite reverse proxy. Il frontend attuale usa cookie e richieste same-origin; separare frontend e API su domini diversi richiede ulteriori modifiche CORS/CSRF e cookie.

Usare PostgreSQL gestito con accesso privato dall’app, TLS verificato, credenziali dedicate e privilegi minimi. Attivare backup cifrati automatici e provare il ripristino. Le immagini quiz in `BACKEND/media/` richiedono storage persistente o object storage: il filesystem effimero di un container non basta.

## Configurazione applicativa

1. Scegliere un provider che conservi database, backup e media nella regione desiderata; verificare DPA, sub-responsabili e trasferimenti.
2. Impostare le variabili da `BACKEND/.env.example` nel secret manager del provider. Generare una nuova `SECRET_KEY` non riutilizzata; non caricare `.env` su Git o nel bundle frontend.
3. Impostare `DEBUG=False`, `ALLOWED_HOSTS` sul dominio preciso, `DB_ENGINE=postgresql`, credenziali DB private e `DB_SSLMODE=verify-full` con CA del provider se necessaria.
4. Abilitare HTTPS end-to-end. Attivare `TRUST_X_FORWARDED_PROTO=True` solo se il reverse proxy fidato sovrascrive quell’header. Portare HSTS a un anno solo dopo aver verificato HTTPS e tutti i sottodomini coinvolti.
5. Da `FRONTEND/`: `npm ci && npm run build`; pubblicare `dist/`. Da `BACKEND/`: `pip install -r requirements.txt`, `python manage.py migrate`, `python manage.py createcachetable` e `python manage.py collectstatic --noinput`, poi avviare `gunicorn backend.wsgi:application` da `BACKEND/`.
   Configurare il web server o un servizio statico/CDN per servire i file raccolti in `BACKEND/staticfiles/` sotto `/static/`; Django non li servirà automaticamente in produzione. Conservare i media caricati in storage persistente privato e servirli con una configurazione sicura: non usare un filesystem temporaneo e non esporre file di upload come contenuto eseguibile.
6. Configurare log senza password, token CSRF o payload delle risposte; definire accessi admin, rate limit/WAF al proxy, allarmi, backup e risposta agli incidenti.
7. Non usare `manage.py runserver` in produzione. Non esporre la porta DB a Internet.

## Cose ancora da verificare

- Provider, localizzazione dei dati, DPA, trasferimenti e durata dei log/backup.
- Identità legale del titolare, indirizzo/sede e contatto privacy.
- Durata motivata per account inattivi, progressi e segnalazioni.
- Inventario cookie e richieste esterne dopo deploy; la bozza attuale presume solo gli strumenti presenti nel repository.
- Verifica finale `python manage.py check --deploy` con le variabili reali e revisione di sicurezza dell’hosting.
- Informativa privacy, informativa cookie e condizioni in `docs/legal/`: sono bozze, non pagine pubblicabili.
- Completare e tenere aggiornato il registro dei trattamenti (bozza in `docs/legal/RECORD_OF_PROCESSING_DRAFT.md`) e definire una procedura per richieste privacy e violazioni dei dati.

## Verifiche di sicurezza aggiuntive — 4 novembre 2026

- Riscansionati 12 commit e 97 blob di testo raggiungibili da tutti i riferimenti Git locali: nessuna corrispondenza con i valori segreti locali attuali e nessun formato di chiave privata / AWS / GitHub / Stripe tra quelli cercati. Non copre remoti non scaricati, reflog, backup esterni o formati di segreti non riconosciuti. Nessuna riscrittura della cronologia eseguita.
- `.env` e SQLite locali hanno permessi 0600. La chiave Django locale è solo per sviluppo; generarne una nuova al deploy.
- API account/progressi usano sessioni e CSRF; progressi limitati all’utente della sessione; il vecchio viewset di scrittura quiz richiede staff. Autenticazione HTTP Basic e API browser navigabile disabilitate.
- Il frontend compilato contiene una CSP che limita script e connessioni alla stessa origine; gli stili inline sono consentiti per le barre di avanzamento. Il proxy deve inviare anche `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy: camera=(), microphone=(), geolocation=()` sulle risposte frontend. Gli header Django coprono le risposte backend, non i file serviti da un altro server.
- Vietare al proxy l’accesso a dotfile, repository, file di configurazione, sorgenti backend e dump. Pubblicare solo `FRONTEND/dist`, statici raccolti e media previsti; non la root del repository.
- Limitare `/admin/` al proxy mediante VPN, allowlist o access gateway con MFA. Il login Django controlla staff e permessi, ma la pagina di login amministrativa richiede rate limiting dedicato al proxy prima del lancio. Il limite API non copre `/admin/login/`.
- `NUM_PROXIES=0` per impostazione predefinita ignora gli header IP forniti dal client. Impostare il numero reale di proxy solo quando il proxy riscrive gli header. I limiti DRF non sostituiscono un WAF/rate limit contro attacchi distribuiti.
- L’IP dell’utente non può essere nascosto al server che riceve la connessione. Un reverse proxy può evitare che il browser conosca l’IP del server di origine, ma richiede una configurazione infrastrutturale; non usare la rete di casa per il servizio pubblico.
- Le dipendenze frontend dichiarate sono tutte utilizzate; Vite e relativo plugin sono stati spostati tra le dipendenze di sviluppo e le versioni fissate al lockfile. Il virtualenv locale esistente non viene ripulito automaticamente: creare l’ambiente di produzione da `requirements.txt` evita di distribuire pacchetti di tooling/traduzione inutili.
