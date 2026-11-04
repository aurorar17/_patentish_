# Cookie e archiviazione sul dispositivo — BOZZA DA COMPLETARE

**Bozza riferita al codice del progetto, non ancora all’hosting scelto.** Prima della pubblicazione controllare cookie e richieste di rete del sito distribuito: hosting, CDN e servizi terzi possono aggiungere strumenti non visibili nel repository.

## Strumenti attualmente individuati

| Strumento | Uso | Durata/configurazione | Consenso |
|---|---|---|---|
| `sessionid` Django, quando si accede | Mantenere l’accesso e collegare le richieste all’account | Scadenza configurata a 7 giorni; cookie HttpOnly, Secure in produzione, SameSite=Lax | In genere non richiesto se strettamente necessario all’autenticazione richiesta |
| `csrftoken` Django | Proteggere le richieste che modificano dati da attacchi CSRF | Scadenza configurata a 24 ore; Secure in produzione, SameSite=Lax | In genere non richiesto se strettamente necessario alla sicurezza del servizio |
| `localStorage: patentish-assessment` | Ricordare sul dispositivo il livello di aiuto scelto | Fino alla cancellazione manuale o del browser | Valutare e documentare la stretta necessità della funzione richiesta ai sensi dell’art. 122 |
| `localStorage: patentish-first-sheet-prompted` | Ricordare se è già stato mostrato il suggerimento di registrazione | Fino alla cancellazione manuale o del browser | Valutare e documentare la stretta necessità; rimuovere se non serve più |

Nel codice esaminato non ho trovato analytics, pixel pubblicitari o altri tracker non tecnici. La richiesta al font esterno Google è stata rimossa per evitare il contatto del browser con un servizio terzo. Questo elenco va rifatto dopo la scelta di hosting e CDN.

## Banner di consenso

Se la versione pubblicata utilizza soltanto cookie/strumenti tecnici strettamente necessari, il Garante prevede informativa senza banner di consenso. Se vengono aggiunti tracker non tecnici, devono restare disattivati fino a un consenso valido, granulare e revocabile; il rifiuto deve essere semplice quanto l’accettazione. Il banner non sostituisce l’informativa privacy.

**Provider e domini finali:** [da compilare]. **Data dell’ultimo inventario tecnico:** [da compilare].
