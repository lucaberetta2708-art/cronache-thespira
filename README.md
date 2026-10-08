# Cronache di Thespira — prototipo pubblico

Wiki illustrata e cronologica della campagna. Il prototipo contiene:

- Home e riepilogo dell'ultimo punto noto (Ebavurage, Le Due Lanterne)
- Cronologia dei nove archi, con il **Capitolo I, Manna e Lilith-Zetto**, già pubblicato
- Schede di Wilhelm Codroipo, Margravio di Manna, Lilith-Zetto e vecchio della foresta
- Atlante: Manna, Cervo Sonnacchioso, Foreste di Nemorae, baracca, antro della megera
- Scoperte: la prima pagina
- Ricerca funzionante (clicca Cerca oppure premi `/`)
- Layout mobile e desktop, navigazione con collegamenti tra voci

## La mappa illustrata (nuovo)

- Apri `#/mappa`, oppure usa **Atlante → Mappa di Thespira**.
- La mappa è quella originale fornita dal DM, nel file `assets/mappa-thespira.jpg`.
- Con mouse: rotella per lo zoom, trascinamento per spostarsi, doppio clic per ingrandire.
- Con smartphone: trascinamento a un dito, pizzico a due dita per ingrandire.
- Pulsanti **+**, **−**, **Centra** ed **Espandi**.
- La carta non contiene ancora punti cliccabili: verranno aggiunti solo quando il DM avrà approvato le posizioni e le informazioni rivelabili ai giocatori.
- Logica JavaScript del visualizzatore: `map.js`.

## Come aggiornare un repository GitHub Pages già esistente

1. Estrai lo ZIP della nuova versione.
2. Nel repository GitHub usa **Add file → Upload files** e trascina **tutti i file** presenti nello ZIP, compresi `map.js` e `assets/mappa-thespira.jpg`.
3. Per i file già esistenti GitHub dovrebbe proporre un aggiornamento; conferma **Commit changes**. Se la modalità di caricamento non permette di sovrascrivere i file, usa la modifica di ciascun file o un caricamento via Git locale. Non cancellare il repository.
4. Attendi il nuovo deploy di GitHub Pages e ricarica il sito (Ctrl+F5 se serve).

## Perché non ci sono le pose sheet?

Le tavole di studio dei personaggi sono **materiale privato del DM**. Non devono finire nel sito condiviso. Dove necessario, sono presenti segnaposto per futuri ritratti e illustrazioni approvati per la pubblicazione.

## Aprire in locale

Fai doppio clic su `index.html`. Tutto il contenuto è incorporato in file statici, senza dipendenze esterne e senza bisogno di un server.

## Pubblicare con GitHub Pages

1. Crea (o usa) un account su https://github.com/.
2. Crea un nuovo repository **pubblico**, per esempio `cronache-thespira`.
3. Carica nella radice del repository i file e le cartelle contenuti in questo ZIP, **non** lo ZIP stesso e **non** la cartella superiore.
4. Apri le impostazioni del repository: **Settings → Pages**.
5. In **Build and deployment** scegli **Deploy from a branch**, poi `main` e `/(root)`; salva.
6. Una volta pubblicato, il sito sarà disponibile a un indirizzo analogo a `https://NOMEUTENTE.github.io/cronache-thespira/`.

Per nuovi aggiornamenti modifica `content.js` e, se necessario, `app.js` e `styles.css`, poi carica le versioni aggiornate nello stesso repository. Il link del sito resta lo stesso.

**Importante:** un sito GitHub Pages è pubblicamente accessibile. Non pubblicare schede del DM, spoiler non rivelati, dati personali o altri materiali riservati. Il repository pubblico espone anche i file sorgente.

## Come si aggiornano i contenuti

- `content.js`: contiene schede PNG (`people`), luoghi (`places`), scoperte (`discoveries`) e indice capitoli (`chapters`).
- `app.js`: contiene i testi strutturati del Capitolo I nella costante `ch1Sections` e il sistema di navigazione/ricerca. Per nuovi capitoli sarà opportuno estrarre i testi in un file dedicato.
- `styles.css`: impaginazione, tipografia, colori e layout adattivo.
- `assets/`: eventuali immagini originali o autorizzate per la cronaca (non pose sheet private).

**Protocollo spoiler:** pubblicare solo ciò che i giocatori hanno effettivamente scoperto. Eventi futuri, origini segrete dei personaggi e materiale del DM vanno in un archivio separato e non devono essere inseriti neppure nei file del sito.

## Stato

Questo ZIP è una **prima bozza funzionante**. Non è online finché non viene pubblicato su un servizio di hosting. Le illustrazioni narrative definitive sono ancora da realizzare.


## Capitolo II — L’ordine di Selese Arco

Secondo capitolo pubblicato e collegato all’indice e alla ricerca: il rientro a Manna, il mandato della Magistra, l’incontro con Nero, il campo dei reietti e le informazioni riferite da Brannor. L’incontro con Cato Mirel resta nel Capitolo III (Lantrelle), in preparazione.

Per aggiornare GitHub con il solo Capitolo II, sovrascrivere nella radice del repository `content.js`, `app.js`, `index.html` e facoltativamente `README.md`. Le risorse `assets/` e la mappa non richiedono modifiche.


## Capitolo III — Il rapporto di Lantrelle

Nuovo capitolo wiki, schede per Cato Mirel e il Brambilla, nuove voci nell’Atlante per Lantrelle e l'Emporio e negli oggetti per la pagina di Obsydra e l'armatura indossata da Derrick. La presentazione della Chiesa conserva la distinzione fra le affermazioni di Cato e i fatti confermati.

**Aggiornamento selettivo:** caricare `app.js`, `content.js` e `index.html` nella radice del repository. Gli asset della mappa non vanno modificati.
