# Demo guidata Lawee

Una demo guidata di **Lawee**, il gestionale con AI per studi legali di Monolite, che MEUS S.r.l. realizza dalla specifica `lawee-demo-v1.0.md`. Chi la riceve la guarda da solo, anche dal telefono.

Una mattina allo Studio Legale Ferri di Perugia: arriva la PEC di Edil Tevere contro Officine Valtopina, e Lawee fa il lavoro di segreteria.

| Versione | Passi | Durata |
|---|---|---|
| **1 minuto**: parte da sola, sull'inbox | 1–4: la PEC, la bozza, una domanda con le fonti, la chiusura | circa 1 minuto |
| **Completa**: si apre dal pulsante «Guarda la demo completa (4 min)» | 5–14: accesso, Oggi, fascicolo, fatture e banca, fonte non trovata, agenda, preventivo, automazione, il box, la chiusura | circa 4 minuti |

Lo studio, i clienti, le persone, gli importi e le date sono d'esempio, e la prima card lo dice. Le norme citate sono reali (D.Lgs. 231/2002, con i link a Normattiva). Grafica, colori, font e icone vengono dal design system di Lawee, tema chiaro.

## Indirizzo

Con Cloudflare Pages (cartella di output `public`) l'indirizzo è:

```
https://<progetto>.pages.dev/lawee-umhudb/
```

La radice del sito non elenca la demo. `public/_headers` e `public/robots.txt` chiedono ai motori di ricerca di non indicizzare nulla, e lo dice anche la pagina.

Link utili dentro la demo:

- `#full` apre la versione completa;
- `#law-9` apre il passo 9, in pausa.

## Pubblicare

Il sito si aggiorna da solo a ogni push su `main`. Impostazioni del progetto Cloudflare Pages:

- Framework preset: **None**
- Build command: *(vuoto)*
- Build output directory: **`public`**

## Modificare la demo

La demo si costruisce dai sorgenti in un solo file HTML, che funziona anche offline:

```
python3 lawee/build.py
```

| File | Cosa contiene |
|---|---|
| `lawee/src/engine.js` | Il motore: player, card, versioni, cursore. Non conosce il prodotto. |
| `lawee/src/portal.js` | Le schermate di Lawee: il computer di Chiara e il telefono di Luca (portale cliente). |
| `lawee/src/story.js` | La storia: clienti, messaggi, fatture, norme e i 14 passi con i testi delle card. |
| `lawee/src/style.css` | I token del design system e l'impaginazione, da 360 px in su. |
| `lawee/src/sprite.svg` | Il camaleonte e le icone (Lucide 0.469, licenza ISC). |
| `lawee/src/template.html` | Lo scheletro della pagina. |
| `lawee/media/` | I font: Clash Display e Satoshi dal design system, Source Serif 4 e IBM Plex Mono (licenza OFL). |

Un passo è `{ v, ch, title, text, line1, view, acts, hold, setup }`: `v` dice se è nel minuto (`"1"`) o nella completa (`"c"`), `line1` è la riga del minuto, `setup` prepara lo stato quando la versione parte da quel passo.

Le azioni disponibili sono `W` (attesa), `DO` (cambia lo stato), `CLICK`, `TYPE` e `LOOK`. Le ultime tre puntano a un elemento con `data-t`. Un'azione con `{ lite: true }` nel minuto avviene subito, senza cursore.

Gli indirizzi email per la schermata finale vanno in `contacts` in fondo a `lawee/src/story.js`.

Per controllare tutti i passi velocemente, apri la pagina con `?fast`: tutto va dieci volte più veloce.
