# Landing del caso bonus — Gialli dopo Cena

Questa pagina chiede **nome, cognome ed email** al lettore, salva i dati in un **Google Sheet** e solo dopo mostra il link al PDF del caso bonus «Il cuore di cioccolato». Il link del PDF non è scritto nella pagina: lo conosce solo il server (Vercel), che lo consegna dopo aver salvato i dati.

Tempo richiesto: circa 20 minuti. Serve un account Google, un account GitHub e un account Vercel (tutti gratuiti).

---

## Passo 0 — Una modifica prima di cominciare

Apri `public/index.html` con il Blocco note, cerca la parola **EMAIL_CONTATTO** (compare una sola volta, nella nota sulla privacy) e sostituiscila con l'indirizzo email a cui i lettori possono scrivere per far cancellare i propri dati. Salva.

## Passo 1 — Google Sheet e Apps Script (dove arrivano i dati)

1. Vai su sheets.google.com e crea un **foglio vuoto**. Chiamalo per esempio «Lead Gialli dopo Cena».
2. Menu **Estensioni → Apps Script**.
3. Cancella tutto il testo che c'è già e incolla il contenuto del file `apps-script/Code.gs` **così com'è**, senza modificare nulla. Premi l'icona del dischetto (Salva).
4. In alto a destra: **Esegui il deployment → Nuovo deployment**.
5. Clicca l'ingranaggio accanto a «Seleziona tipo» e scegli **Applicazione web**. Imposta:
   - Esegui come: **Me**
   - Chi può accedere: **Chiunque**
6. Premi **Esegui il deployment**, poi **Autorizza accesso** e scegli il tuo account.
   - Vedrai «Google non ha verificato questa app»: è normale per uno script personale. Clicca **Avanzate → Vai a … (non sicuro) → Consenti**.
7. Copia l'**URL dell'applicazione web**: finisce con `/exec`. Ti serve al passo 3.

> I dati compariranno in una scheda nuova chiamata **Lead**, in basso nel foglio, non nella prima scheda «Foglio1». La scheda viene creata automaticamente al primo invio.

## Passo 2 — GitHub (dove sta il codice)

1. Scompatta lo zip.
2. Su github.com premi **New repository**, chiamalo per esempio `gialli-bonus`, e scegli **Private** (importante: il codice segreto non deve essere pubblico). Crea il repository.
3. Clicca **uploading an existing file** e trascina **tutto il contenuto** della cartella `gialli-bonus-landing` (le cartelle `api`, `apps-script`, `public` e i file `package.json`, `vercel.json`, `README.md`, `.gitignore`, `.env.example`).
   - I file che iniziano con il punto (`.gitignore`, `.env.example`) su Windows possono non vedersi: in Esplora file attiva **Visualizza → Elementi nascosti**. Se non riesci a caricarli non è un problema: i loro valori servono solo come promemoria per il passo 3.
4. Premi **Commit changes**.

## Passo 3 — Vercel (pubblicazione)

1. Su vercel.com accedi con GitHub e premi **Add New → Project**, poi **Import** sul repository `gialli-bonus`.
2. **Prima di premere Deploy** apri **Environment Variables** e aggiungi queste tre (i valori sono nel file `.env.example`):

| Nome | Valore |
|---|---|
| `GOOGLE_SCRIPT_URL` | l'URL `/exec` copiato al passo 1 |
| `APPS_SCRIPT_SECRET` | il codice già scritto in `.env.example` (copialo identico) |
| `BONUS_DRIVE_URL` | il link del PDF già scritto in `.env.example` |

3. Premi **Deploy**. Alla fine Vercel ti dà l'indirizzo della pagina, per esempio `https://gialli-bonus.vercel.app`.

> Se aggiungi o cambi le variabili **dopo** il deploy, devi rifarlo: **Deployments → i tre puntini dell'ultimo → Redeploy**. Altrimenti la pagina non le vede.

## Passo 4 — Prova finale

1. Apri l'indirizzo Vercel dal telefono.
2. Inserisci nome, cognome ed email di prova, spunta il consenso e premi **Apri il fascicolo**.
3. Deve comparire «Il fascicolo è vostro» con il pulsante per il PDF, e il PDF si deve aprire.
4. Nel Google Sheet apri la scheda **Lead**: deve esserci la riga di prova.

Se compare un errore: su Vercel apri il progetto → **Logs** (i log di esecuzione, non quelli di build) e guarda il messaggio. I casi più comuni sono una variabile mancante o scritta male, oppure il redeploy non fatto.

## Passo 5 — Il QR nel libro

Manda l'indirizzo Vercel a Claude: il QR a pagina 157 del libro va rigenerato per puntare a questa pagina invece che direttamente al PDF.

---

### Da sapere più avanti

- **Se modifichi `Code.gs`**: in Apps Script usa **Esegui il deployment → Gestisci deployment → matita → Versione: Nuova versione → Esegui il deployment**. Non creare un «Nuovo deployment»: cambierebbe l'URL `/exec`.
- **Lo stesso lettore che si iscrive due volte** non crea una riga doppia: la sua riga viene aggiornata (colonna «Ultimo accesso»).
- **Il PDF su Drive** deve restare condiviso come «Chiunque abbia il link» e non va cancellato.
