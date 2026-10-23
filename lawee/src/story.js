// ─── The story: a Thursday morning at Studio Legale Ferri, 22 October 2026 ──────
// Data only, plus the steps that move it. Lawee and Monolite are the product's own names. The studio, its clients, the
// people, the amounts and the dates are examples; the laws cited are real (D.Lgs. 231/2002, as amended). Every number
// below adds up with the others.
window.STORY = (() => {
"use strict";

// Clients of the studio, each with its perimeter tint (the chameleon takes it inside the client's perimeter).
const clients = {
  ov: { name: "Officine Valtopina", legal: "S.r.l.", hue: "terracotta", sector: "Carpenteria metallica", city: "Valtopina (PG)", staff: 38, since: 2022, matters: 1 },
  cp: { name: "Cantina Colli Perugini", legal: "S.r.l.", hue: "salvia", sector: "Vitivinicolo", staff: 14, matters: 1 },
  dm: { name: "Studio Dentistico Moretti", legal: "", hue: "ardesia", sector: "Sanità privata", staff: 6, matters: 1 },
  tl: { name: "Trasimeno Logistica", legal: "S.p.A.", hue: "ocra", sector: "Trasporti", staff: 120, matters: 3 },
};

// The unified inbox. Today's six are the specification's; yesterday's three are already handled.
const msgs = [
  { id: "trib", day: "today", t: "10:15", ch: "pec", from: "Tribunale di Perugia", subj: "Comunicazione di cancelleria", c: "tl", matter: "R.G. 2817/2026", cat: "Udienza" },
  { id: "tl", day: "today", t: "10:02", ch: "email", from: "Trasimeno Logistica", subj: "Rinnovo contratto con Umbria Freddo", c: "tl", cat: "Contratti", att: 1 },
  { id: "mor", day: "today", t: "09:30", ch: "phone", from: "Dott. Moretti", subj: "Chiede quando arriva il parere", c: "dm", cat: "Da richiamare" },
  { id: "cp", day: "today", t: "09:05", ch: "whatsapp", from: "Cantina Colli Perugini", subj: "Foto del contratto di distribuzione firmato", c: "cp", att: 1, done: "Archiviato" },
  { id: "luca", day: "today", t: "08:40", ch: "email", from: "Luca Rossi", subj: "Fwd: contestazione Edil Tevere, ci vediamo?", c: "ov", cat: "Appuntamento" },
  { id: "pec", day: "today", t: "08:12", ch: "pec", from: "Edil Tevere S.r.l.", subj: "Contestazione fornitura ordine 2026/118", c: "ov", matter: "Recupero crediti", cat: "Contestazione", urgent: true, draft: true, att: 1 },
  { id: "y1", day: "yday", t: "18:12", ch: "email", from: "Cantina Colli Perugini", subj: "Grazie per il parere sul contratto", c: "cp", done: "Archiviato" },
  { id: "y2", day: "yday", t: "16:05", ch: "whatsapp", from: "Trasimeno Logistica", subj: "Confermate l'udienza di lunedì?", c: "tl", done: "Risposto" },
  { id: "y3", day: "yday", t: "11:20", ch: "email", from: "Studio Dentistico Moretti", subj: "Primi documenti per il parere", c: "dm", att: 3, done: "Archiviato" },
];

// Officine Valtopina's invoices to Edil Tevere: 60 days from the invoice date (contract, art. 7).
const invoices = [
  { n: "2026/118", date: "10/07/2026", deliv: "09/07/2026", amt: 17500, due: "08/09/2026", paid: null },
  { n: "2026/102", date: "12/06/2026", deliv: "11/06/2026", amt: 14900, due: "11/08/2026", paid: null },
  { n: "2026/087", date: "15/05/2026", deliv: "14/05/2026", amt: 16200, due: "14/07/2026", paid: null },
  { n: "2026/041", date: "17/03/2026", deliv: "16/03/2026", amt: 9800, due: "16/05/2026", paid: "15/09/2026" },
];
const bank = [
  { d: "03/10/2026", what: "Bonifico da Cantieri Assisi S.r.l.", amt: 22400 },
  { d: "30/09/2026", what: "Stipendi di settembre", amt: -61300 },
  { d: "15/09/2026", what: "Bonifico da Edil Tevere S.r.l.", sub: "Causale: saldo fattura 2026/041", amt: 9800, match: "2026/041" },
];
const missing = invoices.filter((i) => !i.paid).reduce((a, i) => a + i.amt, 0); // 48.600

// The quote for the recovery: example amounts, as the specification asks.
const fee = (() => {
  const lines = [
    { code: "F1", what: "Fase stragiudiziale: diffida e trattativa", note: "Lettera di diffida, incontri, accordo di rientro", amt: 1200 },
    { code: "F2", what: "Eventuale ricorso per decreto ingiuntivo", note: "Solo se la trattativa non riesce", amt: 1850 },
  ];
  const base = lines.reduce((a, l) => a + l.amt, 0);
  const sg = Math.round(base * 0.15 * 100) / 100;
  const cpa = Math.round((base + sg) * 0.04 * 100) / 100;
  const iva = Math.round((base + sg + cpa) * 0.22 * 100) / 100;
  return { lines, base, sg, cpa, iva, total: Math.round((base + sg + cpa + iva) * 100) / 100 };
})();

const N231 = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2002-10-09;231";
const data = {
  clients, msgs, invoices, bank, missing, fee,
  studio: { name: "Studio Legale Ferri", city: "Perugia", addr: "Corso Vannucci 00, Perugia (indirizzo d'esempio)", pec: "studioferri@pec.esempio.it" },
  people: {
    chiara: { name: "Avv. Chiara Ferri", short: "Chiara", role: "Titolare", caption: "Studio Legale Ferri, Perugia" },
    luca: { name: "Luca Rossi", short: "Luca", caption: "Officine Valtopina, il cliente" },
  },
  qMora: "Officine Valtopina può chiedere gli interessi di mora a Edil Tevere?",
  qPen: "C'è una clausola penale nel contratto?",
  // Real texts of D.Lgs. 9 ottobre 2002, n. 231 (as replaced by D.Lgs. 192/2012), with their Normattiva addresses.
  law: {
    a4: { art: "Art. 4", rub: "Termini di pagamento", comma: "comma 1", text: "Gli interessi moratori decorrono, senza che sia necessaria la costituzione in mora, dal giorno successivo alla scadenza del termine per il pagamento.", href: `${N231}~art4` },
    a2: { art: "Art. 2", rub: "Definizioni", comma: "comma 1, lettera e)", text: "«interessi legali di mora»: interessi semplici di mora su base giornaliera ad un tasso che è pari al tasso di riferimento maggiorato di otto punti percentuali;", href: `${N231}~art2` },
    a5: { art: "Art. 5", rub: "Saggio degli interessi", comma: "comma 1", text: "Gli interessi moratori sono determinati nella misura degli interessi legali di mora.", href: `${N231}~art5` },
  },
  // The week of 19 October; three free times the studio proposes to Luca.
  week: [
    { d: "Lun 19", items: [{ t: "10:00", k: "appointment", title: "Riunione di studio", sub: "Pratiche della settimana" }] },
    { d: "Mar 20", items: [{ t: "15:00", k: "appointment", title: "Cantina Colli Perugini", sub: "Firma del contratto" }] },
    { d: "Mer 21", items: [{ t: "11:30", k: "call", title: "Trasimeno Logistica", sub: "Rinnovo Umbria Freddo" }] },
    { d: "Gio 22", today: true, items: [{ t: "11:00", k: "prop", id: "a" }, { t: "15:30", k: "prop", id: "b" }, { t: "16:30", k: "appointment", title: "Studio Dentistico Moretti", sub: "Il parere" }] },
    { d: "Ven 23", items: [{ t: "09:30", k: "prop", id: "c" }, { t: "14:00", k: "deadline", title: "Trasimeno Logistica", sub: "Documenti per l'udienza" }] },
  ],
  slots: { a: ["Oggi, giovedì 22/10", "11:00"], b: ["Oggi, giovedì 22/10", "15:30"], c: ["Domani, venerdì 23/10", "09:30"] },
};

// The 1-minute version starts here: 08:12, the PEC is about to arrive.
const initial = () => ({
  comp: { route: "inbox", toast: null, time: "08:12" },
  phone: null, focus: null, slate: null,
  inbox: { today: false, arrived: false, fresh: false, tagged: false, tagAnim: false, seen: false, open: null, draft: "closed", sent: false },
  login: { stage: "pass", pass: "", code: "" },
  ai: { kind: null, q: "", asked: "", stage: null, viewer: null },
  client: { tab: "timeline" },
  agenda: { sent: false, chosen: false },
  fee: { open: false, status: "draft" },
  auto: { rem: 1 },
  luca: { pick: null, otp: "" },
});

const CH = {
  A: ["st", "Lo studio", "Il primo minuto"],
  B: ["st", "Lo studio", "La giornata e il fascicolo"],
  C: ["cl", "Lo studio e il cliente", "Appuntamento e preventivo"],
  D: ["st", "Lo studio", "Fiducia e controllo"],
};

// Each step: the version it belongs to ("1": the minute, "c": the complete one), chapter, title and card text (as
// approved), the 1-minute line, the pane a phone-width viewer starts on, the acts, how long the stage holds once they
// are done, and `setup`: the state the step needs when the version starts there. An act marked { lite: true } plays at
// once, without the cursor, in the 1-minute version.
function steps({ W, DO, CLICK, TYPE, LOOK }) {
  const S_ = (v, ch, title, text, line1, view, acts, hold = 1000, setup = null) => ({ v, ch, title, text, line1, view, acts, hold, setup });
  const toastOff = DO(0, (S) => { S.comp.toast = null; });
  const L = { lite: true };
  const ask = (kind) => (S) => { S.comp.route = "assist"; S.ai = { kind, q: "", asked: "", stage: null, viewer: null }; };
  const send = (S) => { S.ai.asked = S.ai.q; S.ai.q = ""; S.ai.stage = "thinking"; };
  return [
    // ── A · Il primo minuto ──
    S_("1", "A", "La PEC del mattino", "Arriva una PEC alle 8:12. Lawee la collega al cliente e la segna come contestazione.",
      "Arriva una PEC: Lawee la legge e la collega al cliente e alla pratica.", "comp", [
        W(400),
        DO(0, (S) => { S.inbox.arrived = true; S.inbox.fresh = true; }),
        W(1400),
        DO(0, (S) => { S.inbox.fresh = false; S.inbox.tagged = true; S.inbox.tagAnim = true; }),
        W(900), LOOK(300, "msg-pec"), W(1100),
        CLICK(300, "msg-pec", (S) => { S.inbox.open = "pec"; S.inbox.seen = true; S.inbox.tagAnim = false; }),
        W(700), LOOK(300, "pec-labels"), W(1900),
      ], 500),
    S_("1", "A", "La bozza è pronta", "Lawee ha già scritto la risposta, con le fonti. Chiara la rilegge e la firma.",
      "La risposta è già pronta: Chiara la rilegge e preme «Approva e invia».", "comp", [
        CLICK(400, "draft-open", (S) => { S.inbox.draft = "open"; }),
        W(700), LOOK(300, "draft-body"), W(2200), LOOK(300, "draft-srcs"), W(900),
        CLICK(400, "draft-send", (S) => { S.inbox.sent = true; S.comp.time = "08:15"; S.comp.toast = "PEC inviata a Edil Tevere. Ricevute archiviate nel fascicolo."; }),
        W(2100), toastOff,
      ], 400),
    S_("1", "A", "Ogni risposta ha la sua fonte", "Chiara chiede degli interessi di mora. Ogni frase della risposta cita la sua fonte.",
      "Chiara chiede degli interessi: la risposta cita contratto e legge, e li apre.", "comp", [
        CLICK(400, "nav-assist", ask("mora")),
        TYPE(400, "ai-input", data.qMora, (S, v) => { S.ai.q = v; }, L),
        CLICK(300, "ai-send", send),
        W(1300),
        DO(0, (S) => { S.ai.stage = "done"; S.comp.time = "08:16"; }),
        W(500), LOOK(300, "ai-answer"), W(2600),
        CLICK(300, "ai-src-1", (S) => { S.ai.viewer = "c"; }),
        W(700), LOOK(300, "viewer-hl"), W(2200),
        CLICK(300, "vw-tab-2", (S) => { S.ai.viewer = "a4"; }),
        W(700), LOOK(300, "viewer-quote"), W(2100),
      ], 400),
    S_("1", "A", "La segreteria che non si licenzia", "In un minuto: una PEC gestita, una risposta firmata, una domanda con le sue fonti.",
      "La segreteria che non si licenzia.", "comp", [
        DO(300, (S) => { S.comp.route = "slate"; S.slate = "one"; S.ai.viewer = null; }),
        W(500), LOOK(300, "slate-list"), W(1700),
      ], 1400),

    // ── B · La giornata e il fascicolo ──
    S_("c", "B", "Un accesso sicuro", "Chiara entra con un codice. Ogni cliente ha il suo perimetro cifrato.", null, "comp", [
      W(500),
      TYPE(300, "lg-pass", "••••••••••", (S, v) => { S.login.pass = v; }),
      CLICK(300, "lg-go", (S) => { S.login.stage = "code"; }),
      W(800),
      TYPE(300, "lg-code", "482913", (S, v) => { S.login.code = v; }),
      W(300), LOOK(300, "lg-perim"), W(2000),
      CLICK(300, "lg-verify", (S) => { S.comp.route = "today"; }),
      W(900),
    ], 300, (S) => {
      S.comp.route = "login"; S.comp.time = "10:20";
      Object.assign(S.inbox, { today: true, arrived: true, tagged: true });
    }),
    S_("c", "B", "Oggi", "Le tre urgenze di oggi in cima: quello che ti avrebbe detto la segreteria.", null, "comp", [
      W(400), LOOK(300, "today-hello"), W(1500), LOOK(300, "today-urg"), W(2600), LOOK(300, "kpi-hours"), W(2000),
    ], 500),
    S_("c", "B", "Il fascicolo del cliente", "Contratto del 2024, fatture, pagamenti, email: tutto di Officine Valtopina, in ordine di tempo.", null, "comp", [
      CLICK(400, "urg-ov", (S) => { S.comp.route = "client"; S.client.tab = "timeline"; }),
      W(900), LOOK(300, "cl-head"), W(1700), LOOK(300, "tl-pec"), W(1500), LOOK(400, "tl-deliv"), W(1300), LOOK(400, "tl-contract"), W(1600), LOOK(300, "cl-alerts"), W(2000),
    ], 500),
    S_("c", "B", "I soldi che mancano", "Lawee incrocia fatture e banca: i 48.600 € non sono mai arrivati.", null, "comp", [
      CLICK(400, "tab-fatture", (S) => { S.client.tab = "fatture"; }),
      W(900), LOOK(300, "inv-note"), W(2000), LOOK(300, "inv-table"), W(2000), LOOK(300, "bank-box"), W(2400),
    ], 500),
    S_("c", "B", "Se la fonte non c'è", "Chiara chiede di una clausola penale. Nel contratto non c'è, e Lawee lo dice.", null, "comp", [
      CLICK(400, "cl-ask", ask("penale")),
      TYPE(500, "ai-input", data.qPen, (S, v) => { S.ai.q = v; }),
      CLICK(300, "ai-send", send),
      W(1700),
      DO(0, (S) => { S.ai.stage = "done"; }),
      W(600), LOOK(300, "ai-nosrc"), W(3000), LOOK(300, "ai-searched"), W(2000),
    ], 500),

    // ── C · Appuntamento e preventivo ──
    S_("c", "C", "L'appuntamento", "Il cliente chiedeva di vedersi: Lawee ha proposto tre orari, lui ne sceglie uno.", null, "comp", [
      CLICK(400, "nav-agenda", (S) => { S.comp.route = "agenda"; }),
      W(900), LOOK(300, "ag-note"), W(1700), LOOK(300, "slot-a"), W(900),
      CLICK(400, "ag-send", (S) => { S.agenda.sent = true; S.comp.toast = "Proposta inviata a Luca Rossi nel portale cliente"; }),
      W(1500),
      DO(200, (S) => { S.comp.toast = null; S.comp.time = "10:24"; S.phone = { screen: "lock", time: "10:24", note: { title: "Studio Legale Ferri", text: "Ti proponiamo tre orari per l'incontro" } }; }, { view: "phone" }),
      W(1900),
      CLICK(300, "ph-note", (S) => { S.phone.screen = "slots"; S.phone.note = null; }),
      W(1300), LOOK(300, "ph-slots"), W(700),
      CLICK(400, "ph-slot-a", (S) => { S.luca.pick = "a"; }),
      CLICK(400, "ph-slot-ok", (S) => { S.phone.screen = "booked"; S.agenda.chosen = true; }),
      W(1700),
      LOOK(300, "slot-a", { view: "comp" }),
      DO(0, (S) => { S.comp.toast = "Luca Rossi ha scelto giovedì 22/10 alle 11:00"; }),
      W(2200), toastOff,
    ], 500),
    S_("c", "C", "Il preventivo", "Il preventivo per il recupero è pronto. Il cliente lo firma dal telefono.", null, "comp", [
      CLICK(400, "nav-fees", (S) => { S.comp.route = "fees"; S.fee.open = false; }),
      W(800),
      CLICK(400, "fee-row", (S) => { S.fee.open = true; }),
      W(900), LOOK(300, "fee-lines"), W(1700), LOOK(300, "fee-total"), W(1500),
      CLICK(400, "fee-send", (S) => { S.fee.status = "sent"; S.comp.toast = "Inviati in firma a Luca Rossi: preventivo, mandato e informativa"; }),
      W(1400),
      DO(200, (S) => { S.comp.toast = null; S.comp.time = "10:29"; S.phone.time = "10:29"; S.phone.screen = "todo"; S.phone.note = { title: "Studio Legale Ferri", text: "Hai 3 documenti da firmare" }; }, { view: "phone" }),
      W(1700),
      CLICK(300, "ph-note", (S) => { S.phone.note = null; S.phone.screen = "sign"; }),
      W(1000), LOOK(300, "ph-sign-list"), W(1500),
      CLICK(400, "ph-sign-go", (S) => { S.phone.screen = "otp"; S.luca.otp = ""; }),
      TYPE(400, "ph-otp", "731406", (S, v) => { S.luca.otp = v; }),
      CLICK(300, "ph-otp-ok", (S) => { S.phone.screen = "signed"; S.fee.status = "signed"; }),
      W(1500),
      LOOK(300, "fee-status", { view: "comp" }),
      DO(0, (S) => { S.comp.toast = "Luca Rossi ha firmato preventivo, mandato e informativa"; }),
      W(2200), toastOff,
    ], 500),

    // ── D · Fiducia e controllo ──
    S_("c", "D", "Quanto delegare", "Lo studio sceglie quanto delegare. Atti e pareri li rivede sempre l'avvocato.", null, "comp", [
      CLICK(400, "nav-settings", (S) => { S.comp.route = "settings"; }),
      W(900), LOOK(300, "auto-list"), W(1500),
      CLICK(400, "lvl-rem-3", (S) => { S.auto.rem = 3; S.comp.toast = "Salvato: i promemoria ai clienti partono da soli. Ti avviso io."; }),
      W(1900), toastOff,
      LOOK(300, "auto-locked"), W(2400), LOOK(300, "roles"), W(1800),
    ], 500, (S) => { S.phone = null; }),
    S_("c", "D", "Il box nello studio", "Chi vuole i dati in casa ha il box nello studio. Il know-how resta suo.", null, "comp", [
      CLICK(400, "nav-box", (S) => { S.comp.route = "box"; }),
      W(900), LOOK(300, "box-status"), W(1700), LOOK(300, "box-backup"), W(1500), LOOK(300, "box-model"), W(2000),
    ], 500),
    S_("c", "D", "Tutto del tuo cliente", "La segreteria che non si licenzia. Ogni risposta con la sua fonte.", null, "comp", [
      DO(300, (S) => { S.comp.route = "slate"; S.slate = "full"; }),
      W(700), LOOK(300, "slate-msgs"), W(2600), LOOK(300, "slate-cta"), W(1600),
    ], 1600),
  ];
}

return {
  key: "law",
  title: "Lawee",
  tag: "Demo. Studio, clienti, persone, importi e date sono d'esempio. Le norme citate sono reali.",
  chapters: CH,
  // Versions: the steps each one plays (its set), its line or whole cards, its pace. The minute opens on its first card.
  versions: [
    { key: "1", set: "1", name: "1 min", long: "1 minuto", sub: "Una PEC, la risposta, una domanda con le fonti", line: "line1", card: "line", intro: true, pace: 0.9, typeMs: 40, wordMs: 160, rest: 700 },
    { key: "full", set: "c", name: "Completa", long: "Completa, 4 minuti", sub: "Il fascicolo, i pagamenti, l'agenda, il preventivo, il box", card: "whole", pace: 1.15, typeMs: 55, wordMs: 250, rest: 1200 },
  ],
  start: "1",
  ends: {
    "1": { title: "Hai visto Lawee in un minuto", text: "Nella completa: il fascicolo, i soldi che mancano, l'agenda, il preventivo, il box.", next: "full", label: "Guarda la demo completa (4 min)" },
    full: { title: "Hai visto tutta la demo", text: "Una mattina di studio: ogni messaggio al suo posto, ogni risposta con la sua fonte.", next: "1", label: "Rivedi il minuto" },
  },
  // The addresses for the last screen («Richiedi una prova»). Empty: the button shows without a link.
  contacts: [],
  data, initial, steps,
};
})();
