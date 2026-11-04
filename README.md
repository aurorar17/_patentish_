# Patentish

**La teoria della patente, con un aiuto in inglese.**

Patentish è un’applicazione web per esercitarsi sui quiz della patente italiana. Affianca alle domande in italiano strumenti di supporto in inglese e livelli di aiuto diversi, per rendere lo studio più accessibile a chi sta imparando la lingua.

Il progetto è in sviluppo. La prima pubblicazione è dedicata ai quiz; lezioni e pagamenti non fanno parte del rilascio attuale.

## Cosa puoi fare

- Esercitarti per categoria oppure con una scheda mista da 30 domande.
- Rispondere Vero/Falso a domande con testo e, quando disponibile, immagine.
- Scegliere il livello di supporto linguistico attraverso un test iniziale.
- Consultare traduzioni e aiuti sulle parole disponibili nei contenuti.
- Creare un account facoltativo e accedere al profilo con storico, risultati ed errori da rivedere.
- Inviare una segnalazione sui quiz.
- Eliminare il proprio account dal profilo confermando la password.

> Il salvataggio dei progressi è implementato, ma è stata segnalata un’anomalia durante l’uso con login apparente: la verifica è tra i prossimi interventi. Il dettaglio del lavoro pianificato è in [NEXT_SESSION.md](docs/NEXT_SESSION.md).

## Tecnologie

**Frontend:** React, Vite, CSS e icone Lucide.
**Backend:** Django e Django REST Framework, con autenticazione tramite sessioni e protezione CSRF.
**Database:** SQLite per lo sviluppo locale; configurazione PostgreSQL per la produzione.
**Contenuti:** comandi Django per importare quiz, immagini e traduzioni revisionate.

Le versioni delle dipendenze sono definite in [package.json](FRONTEND/package.json), nel relativo lockfile e in [requirements.txt](BACKEND/requirements.txt).

## Struttura del progetto

```text
.
├── FRONTEND/
│   ├── src/
│   │   ├── App.jsx          # Composizione principale e navigazione
│   │   ├── Assessment.jsx   # Test iniziale e scelta del livello
│   │   ├── account/         # Profilo e gestione account
│   │   ├── quiz/            # Schede, domande e selezione modalità
│   │   ├── shared/          # API e componenti condivisi
│   │   └── data/            # Dati di presentazione dei livelli
│   └── vite.config.js       # Proxy locale e CSP della build
├── BACKEND/
│   ├── backend/            # Configurazione Django e URL principali
│   ├── quiz/               # Modelli, API, admin e test
│   │   └── management/commands/
│   ├── media/              # Immagini dei quiz presenti localmente
│   ├── requirements.txt
│   └── .env.example        # Modello di configurazione per la produzione
└── docs/
    ├── DEPLOYMENT_READINESS.md
    ├── NEXT_SESSION.md
    └── legal/              # Bozze privacy, cookie, condizioni e registro
```

## Avvio in locale

Servono Git, Python con supporto alle dipendenze backend e Node.js compatibile con la versione di Vite presente nel lockfile. I comandi seguenti sono pensati per macOS/Linux e vanno eseguiti dalla cartella del progetto.

### 1. Preparare il backend

```bash
cd BACKEND
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

Creare un file `BACKEND/.env` con questa configurazione **solo locale**, sostituendo il segnaposto della chiave:

```dotenv
DEBUG=True
SECRET_KEY=inserisci-qui-una-chiave-casuale-generata-localmente
DB_ENGINE=sqlite
ALLOWED_HOSTS=localhost,127.0.0.1,[::1]
```

Per generare una chiave, con l’ambiente virtuale attivo:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copiare il risultato nel `.env`. Non condividerlo e non inserirlo nel frontend. Se il file `.env` esiste già, conservarne la configurazione necessaria invece di sovrascriverlo.

Preparare il database e avviare il server:

```bash
python manage.py migrate
python manage.py runserver 127.0.0.1:8003
```

Per creare un amministratore locale, in un altro terminale con l’ambiente virtuale attivo:

```bash
cd BACKEND
source venv/bin/activate
python manage.py createsuperuser
```

L’amministrazione è disponibile su `http://127.0.0.1:8003/admin/`.

### 2. Avviare il frontend

In un secondo terminale, partendo dalla cartella del progetto:

```bash
cd FRONTEND
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Aprire **http://127.0.0.1:5173/** e tenere entrambi i terminali attivi. Vite inoltra `/api/` e `/media/` al backend sulla porta **8003**.

Se il backend usa una porta diversa, configurare il proxy all’avvio:

```bash
VITE_BACKEND_TARGET=http://127.0.0.1:8000 npm run dev
```

`VITE_BACKEND_TARGET` è una destinazione di sviluppo, non un posto in cui inserire credenziali. Usare sempre lo stesso hostname nel browser per evitare confusione con i cookie di sessione.

### 3. Caricare i contenuti

Le migrazioni creano le tabelle, ma non popolano automaticamente i quiz. Un nuovo database richiede l’importazione dei contenuti e delle eventuali immagini.

Da `BACKEND/`, con l’ambiente virtuale attivo:

```bash
python manage.py import_patente_json /percorso/quiz.json /percorso/immagini
```

Il comando legge il formato previsto dall’importatore, crea le categorie e copia le immagini in `media/quiz_images/`. Il CSV alternativo è gestito da `import_quiz`; consultare il comando prima dell’uso perché importazioni ripetute possono creare duplicati.

Il repository usato come riferimento per i contenuti è [Ed0ardo/QuizPatenteB](https://github.com/Ed0ardo/QuizPatenteB). La sua eventuale copia locale non è inclusa in questo repository. Verificare provenienza, licenze e possibilità di riutilizzo di testi e immagini prima della pubblicazione.

## Traduzioni

I comandi di traduzione sono strumenti editoriali separati dall’utilizzo ordinario del sito. Le traduzioni proposte devono essere controllate prima dell’importazione.

Per vedere le opzioni disponibili:

```bash
python manage.py translate_quiz --help
python manage.py translate_quiz_deepl --help
python manage.py import_quiz_translations --help
```

Per lo strumento DeepL servono anche le dipendenze opzionali di `BACKEND/requirements-translation.txt` e una `DEEPL_AUTH_KEY` privata. Non sono necessarie per eseguire i quiz.

L’importatore delle traduzioni mostra prima un riepilogo; modifica il database solo con `--apply`:

```bash
python manage.py import_quiz_translations /percorso/revisione.csv
python manage.py import_quiz_translations /percorso/revisione.csv --apply
```

Il file manuale delle parole per le categorie 2 e 3 è un intervento pianificato, descritto nel promemoria della prossima sessione.

## Controlli e compilazione

Backend, dalla cartella `BACKEND/` con ambiente e `.env` configurati:

```bash
python manage.py check
python manage.py test quiz
```

Frontend, dalla cartella `FRONTEND/`:

```bash
npm run build
npm audit
```

La build viene generata in `FRONTEND/dist/`. `npm run preview` permette di ispezionarla, ma non eredita il proxy API configurato per il server di sviluppo: il backend deve essere raggiungibile dalla stessa origine tramite una configurazione apposita.

## Sicurezza e dati

- Le password passano dal sistema di hash Django; non vengono memorizzate in chiaro.
- Le API di scrittura usano protezione CSRF; login, registrazione e segnalazioni hanno limiti alle richieste.
- I progressi sono associati all’utente della sessione.
- `.env`, database locali, ambienti virtuali e build sono esclusi da Git.
- I cookie di sessione sono `HttpOnly` e diventano `Secure` in produzione.
- La configurazione di produzione richiede PostgreSQL e una chiave segreta dedicata; CORS e host ammessi sono espliciti.
- La build frontend include una Content Security Policy; gli header del server che la pubblica vanno configurati durante il deploy.

Queste misure richiedono manutenzione e verifica nell’ambiente pubblico. Le impostazioni locali con `DEBUG=True` sono destinate allo sviluppo.

## Pubblicazione e documenti legali

Il provider di hosting non è ancora stato scelto. Prima di pubblicare, seguire la [checklist di preparazione al deploy](docs/DEPLOYMENT_READINESS.md): dominio, HTTPS, database privato, segreti, storage, backup, protezione dell’admin e controlli finali.

I documenti seguenti sono **bozze da completare prima di renderle pubbliche**:

- [Informativa privacy](docs/legal/PRIVACY_NOTICE_DRAFT.md)
- [Informativa cookie e memoria locale](docs/legal/COOKIE_NOTICE_DRAFT.md)
- [Condizioni d’uso](docs/legal/TERMS_DRAFT.md)
- [Registro interno dei trattamenti](docs/legal/RECORD_OF_PROCESSING_DRAFT.md)

Mancano ancora i dati del titolare, i fornitori effettivi, la localizzazione dei dati e i tempi di conservazione. Il README e le bozze non costituiscono una certificazione di conformità.

## Prossimi interventi

Il dettaglio delle richieste è conservato in [NEXT_SESSION.md](docs/NEXT_SESSION.md):

1. Stabilizzare le dimensioni delle schede e la posizione di Vero/Falso su mobile e desktop.
2. Aggiungere il file delle traduzioni manuali per le categorie 2 e 3.
3. Correggere l’anomalia segnalata nel salvataggio dei progressi.
4. Mostrare «Bentornato, [utente]» e l’accesso al profilo al posto dell’introduzione per chi ha effettuato il login.
