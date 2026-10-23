// ─── Lawee's screens, drawn from the state, with the Lawee design system ────────
// The computer (Avv. Chiara Ferri in Lawee) and the phone (Luca Rossi in the studio's portale cliente). It reads the
// story's data (window.STORY.data) and the demo's state S; it never changes either.
window.PORTAL = (() => {
"use strict";
const D = () => window.STORY.data;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ic = (n, c = "") => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const T = (t) => ` data-t="${t}"`;
const eur = (n) => "€ " + Number(Math.abs(n)).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => `${n < 0 ? "− " : "+ "}${eur(n)}`;
const mark = (cls = "") => `<svg class="lmark ${cls}" aria-hidden="true"><use href="#lawee-mark"/></svg>`;
const client = (k) => D().clients[k];

// ─── Pieces of the design system ─────────────────────────────────────────────
const ST_ICON = { urgent: "circle-alert", due: "clock", verified: "badge-check", pending: "hourglass", neutral: "archive" };
const st = (k, label, icon) => `<span class="st st-${k}">${icon === false ? "" : ic(icon || ST_ICON[k])}${esc(label)}</span>`;
const dot = (k, label) => `<span class="st st-${k}"><i class="sdot"></i>${esc(label)}</span>`;
// The client chip in the client's perimeter tint.
const cchip = (k, matter) => `<span class="cchip h-${client(k).hue}"><i></i>${esc(client(k).name)}${matter ? `<span>· ${esc(matter)}</span>` : ""}</span>`;
const av = (k, size = "") => `<span class="cav h-${client(k).hue} ${size}">${client(k).name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</span>`;
const perim = (k) => `<span class="perim h-${client(k).hue}">${ic("lock-keyhole")}Perimetro ${esc(client(k).name)}</span>`;
// A source badge, archive-label style: [n] label · detail ↗
const src = (n, label, detail, t) => `<span class="srcb"${t ? T(t) : ""}><span class="sn">${n}</span><span class="sl">${esc(label)}</span>${detail ? `<span class="sd">${esc(detail)}</span>` : ""}${ic("arrow-up-right")}</span>`;
const sidx = (n) => `<span class="sidx">${n}</span>`;
const btn = (label, o = {}) => `<span class="btn ${o.k || "pri"}${o.sm ? " sm" : ""}${o.off ? " off" : ""}"${o.t ? T(o.t) : ""}>${o.icon ? ic(o.icon) : ""}${esc(label)}${o.right ? ic(o.right) : ""}</span>`;
const note = (html, cls = "", t = "") => `<div class="lnote ${cls}"${t ? T(t) : ""}>${mark()}<p>${html}</p></div>`;
const CH = { email: ["mail", "Email"], pec: ["mail-check", "PEC"], whatsapp: ["message-circle", "WhatsApp"], phone: ["phone", "Telefonata"] };
function inp(S, t, v, ph, o = {}) {
  return `<div class="inp${S.focus === t ? " focus" : ""}${o.cls ? ` ${o.cls}` : ""}"${T(t)}>${o.icon ? ic(o.icon) : ""}${v ? `<span class="v">${esc(v)}</span>` : `<span class="ph">${esc(ph)}</span>`}</div>`;
}

// ─── The computer ────────────────────────────────────────────────────────────
const NAV = [["today", "sun", "Oggi"], ["inbox", "inbox", "Inbox"], ["clients", "briefcase", "Clienti"], ["assist", "sparkles", "Assistente"], ["agenda", "calendar", "Agenda"], ["fees", "receipt", "Preventivi e parcelle", "Parcelle"], ["settings", "settings", "Impostazioni"], ["box", "server", "Lawee by Monolite", "Il box"]];
const ROUTE_NAV = { client: "clients" };
function compWho() {
  const p = D().people.chiara;
  return `<span class="wav">CF</span><span>Il computer di <b>${esc(p.short)}</b> · ${esc(p.name)}, ${esc(p.caption)}</span>`;
}
function inboxCount(S) {
  if (S.inbox.today) return S.inbox.sent ? 5 : 6;
  return S.inbox.arrived && !S.inbox.seen ? 1 : 0;
}
// Inside a client's perimeter the chameleon takes the client's tint.
const perimOf = (S) => (S.comp.route === "client" || S.comp.route === "assist" ? "ov" : null);
function comp(S) {
  const r = S.comp.route;
  if (r === "login") return `<div class="app bare">${login(S)}</div>`;
  if (r === "slate") return `<div class="app bare">${slate(S)}</div>`;
  const on = ROUTE_NAV[r] ?? r;
  const nav = NAV.map(([k, i, l, short]) => {
    const b = k === "inbox" ? inboxCount(S) : 0;
    return `<div class="nv${on === k ? " on" : ""}"${T(`nav-${k}`)}>${ic(i)}<span class="nl">${l}</span><span class="ns">${short || l}</span>${b ? `<span class="nb">${b}</span>` : ""}</div>`;
  }).join("");
  const pk = perimOf(S);
  return `<div class="app${pk ? ` in-perim h-${client(pk).hue}` : ""}">
    <header class="top">
      <span class="brand">${mark("tm")}<span class="word">Lawee</span></span>
      <span class="studio">${ic("lock-keyhole")}Studio Legale Ferri</span>
      <span class="sp"></span>
      <span class="search">${ic("search")}<span>Cerca clienti, pratiche, documenti</span></span>
      <span class="clock"><span>Gio 22/10/2026 · </span><b>${S.comp.time}</b></span>
      <span class="bell">${ic("bell")}</span>
      <span class="me"><span class="mav">CF</span><span class="mt"><b>Avv. Chiara Ferri</b><small>Titolare</small></span></span>
    </header>
    <div class="shell"><nav class="side" aria-label="Menu">${nav}</nav>${page(S)}</div>
    ${S.comp.toast ? `<div class="toast">${ic("circle-check")}<span>${esc(S.comp.toast)}</span></div>` : ""}
  </div>`;
}
const main = (S, html, cls = "") => `<main class="page ${cls}" data-scroll="page:${S.comp.route}:${S.client.tab}:${S.fee.open}">${html}</main>`;
function page(S) {
  switch (S.comp.route) {
    case "inbox": return inbox(S);
    case "today": return main(S, today(S));
    case "client": return main(S, fascicolo(S));
    case "assist": return assist(S);
    case "agenda": return main(S, agenda(S));
    case "fees": return main(S, fees(S));
    case "settings": return main(S, settings(S));
    case "box": return main(S, box(S));
    default: return main(S, "");
  }
}
const head = (title, sub, tools = "") => `<div class="ph"><div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</div>`;

// ── Accesso ──
function login(S) {
  const L = S.login, code = L.stage === "code";
  const boxes = Array.from({ length: 6 }, (_, i) => `<span>${esc(L.code[i] || "")}</span>`).join("");
  return `<div class="login"><div class="lcard">
    <span class="logo">${mark()}<span class="word">Lawee</span></span>
    <h1>${code ? "Codice di accesso" : "Accedi allo studio"}</h1>
    <p class="sub">${code ? "Inserisci il codice dell'app di autenticazione." : "Studio Legale Ferri · Perugia"}</p>
    ${code
      ? `<div class="otp${S.focus === "lg-code" ? " focus" : ""}"${T("lg-code")}>${boxes}</div>${btn("Verifica e entra", { t: "lg-verify", off: L.code.length < 6 })}`
      : `<label class="fld"><span class="lab">Email</span>${inp(S, "lg-email", "chiara.ferri@studioferri.esempio.it", "")}</label>
         <label class="fld"><span class="lab">Password</span>${inp(S, "lg-pass", L.pass, "La tua password", { cls: "pw" })}</label>${btn("Accedi", { t: "lg-go", off: !L.pass })}`}
    <div class="lperim"${T("lg-perim")}>${ic("shield-check")}<span><b>Ogni cliente ha il suo perimetro cifrato.</b> La chiave è solo dello studio.</span></div>
  </div></div>`;
}

// ── Inbox unificata ──
function mrow(S, m) {
  const pec = m.id === "pec", I = S.inbox;
  const tagged = !pec || I.tagged;
  const unread = pec && !I.seen;
  const sent = pec && I.sent;
  const chips = tagged
    ? `${cchip(m.c, m.matter)}${m.cat ? `<span class="cat">${esc(m.cat)}</span>` : ""}${m.urgent && !sent ? st("urgent", "Urgente") : ""}${m.att ? `<span class="att">${ic("paperclip")}${m.att}</span>` : ""}${m.draft && !sent ? `<span class="hasd">${ic("file-pen-line")}Bozza pronta</span>` : ""}${sent ? `<span class="hasd ok">${ic("check")}Risposta inviata</span>` : ""}${m.done ? `<span class="hasd mute">${ic("check")}${esc(m.done)}</span>` : ""}`
    : `<span class="reading"><i class="spin"></i>Sto leggendo la PEC…</span>`;
  return `<div class="mrow${unread ? " unread" : ""}${I.open === m.id ? " sel" : ""}${pec && I.fresh ? " fresh" : ""}"${T(`msg-${m.id}`)}>
    <span class="chi ch-${m.ch}" title="${CH[m.ch][1]}">${ic(CH[m.ch][0])}</span>
    <div class="mm"><div class="m1">${unread ? '<i class="udot"></i>' : ""}<b>${esc(m.from)}</b>${m.ch === "pec" ? '<span class="pectag">PEC</span>' : ""}<time class="${m.urgent && !sent ? "urg" : ""}">${m.t}</time></div>
      <div class="m2">${esc(m.subj)}</div>
      <div class="m3${pec && I.tagAnim ? " tagin" : ""}">${chips}</div></div></div>`;
}
function inbox(S) {
  const I = S.inbox, all = D().msgs;
  const today = I.today ? all.filter((m) => m.day === "today") : I.arrived ? all.filter((m) => m.id === "pec") : [];
  const yday = all.filter((m) => m.day === "yday");
  const n = today.length + yday.length;
  const filters = [["Tutti", n], ["Email"], ["PEC"], ["WhatsApp"], ["Telefonate"]].map(([l, c], i) => `<span class="fchip${i ? "" : " on"}">${l}${c ? ` <b>${c}</b>` : ""}</span>`).join("");
  const list = `<section class="mlist" data-scroll="mlist">
      <div class="mlh"><h1>Inbox</h1><p class="sub">Email, PEC, WhatsApp e telefonate, già smistate.</p><div class="fchips">${filters}</div></div>
      <div class="grp">Oggi · giovedì 22/10</div>${today.length ? today.map((m) => mrow(S, m)).join("") : `<div class="mempty">Nessun messaggio da gestire. Ti avviso io se arriva qualcosa.</div>`}
      <div class="grp">Ieri</div>${yday.map((m) => mrow(S, m)).join("")}
    </section>`;
  const det = I.open === "pec" ? pecDetail(S) : `<section class="mdet empty">${mark()}<p>Seleziona un messaggio.</p></section>`;
  return `<main class="page inboxp${I.open ? " open" : ""}">${list}${det}</main>`;
}
function pecDetail(S) {
  const I = S.inbox;
  return `<section class="mdet" data-scroll="mdet">
    <span class="dback">${ic("chevron-left")}Inbox</span>
    <div class="dh"><span class="chi ch-pec">${ic("mail-check")}</span><div class="dhm"><div class="m1"><b>Edil Tevere S.r.l.</b><span class="pectag">PEC</span><time>Gio 22/10/2026 · 08:12</time></div><span class="mono">amministrazione@pec.ediltevere.esempio.it</span></div></div>
    <h2 class="dsubj">Contestazione fornitura ordine 2026/118</h2>
    ${note("Ho collegato la PEC a <b>Officine Valtopina</b>, pratica Recupero crediti Edil Tevere. La bozza di risposta è pronta.")}
    <dl class="labels"${T("pec-labels")}>
      <div><dt>Cliente</dt><dd>${cchip("ov")}</dd></div>
      <div><dt>Pratica</dt><dd>Recupero crediti Edil Tevere</dd></div>
      <div><dt>Tipo</dt><dd>Contestazione</dd></div>
      <div><dt>Urgenza</dt><dd>${I.sent ? st("verified", "Gestita") : st("urgent", "Urgente")}</dd></div>
    </dl>
    <div class="letter">
      <p>Spett.le Officine Valtopina S.r.l., e p.c. Studio Legale Ferri,</p>
      <p>in riscontro ai Vostri solleciti di pagamento, contestiamo la fornitura dell'ordine n. 2026/118: parte dei profilati consegnati non è conforme alle specifiche concordate. Fino a chiarimento, sospendiamo il pagamento delle fatture aperte.</p>
      <p>Edil Tevere S.r.l. · Ufficio amministrazione</p>
    </div>
    <div class="file">${ic("file-text")}<b>Contestazione_ordine_2026-118.pdf</b><small>2 pagine</small></div>
    ${draft(S)}
  </section>`;
}
function draft(S) {
  const I = S.inbox;
  if (I.draft === "closed") {
    return `<div class="draft shut"><div class="drh">${ic("file-pen-line")}<b>Bozza di risposta</b>${st("pending", "Pronta")}<span class="sp"></span>${btn("Apri la bozza", { k: "sec", sm: true, t: "draft-open" })}</div></div>`;
  }
  return `<div class="draft"><div class="drh">${ic("file-pen-line")}<b>Risposta via PEC</b><span class="sp"></span>${I.sent ? st("verified", "Inviata alle 08:15") : st("pending", "Bozza AI, da rivedere e firmare")}</div>
    <div class="reading"${T("draft-body")}>
      <p>Spett.le Edil Tevere S.r.l., in nome e per conto di Officine Valtopina S.r.l., riscontriamo la Vostra del 22/10/2026.</p>
      <p>La contestazione appare tardiva rispetto al termine di 8 giorni previsto dall'art. 8 del contratto quadro del 20/01/2024 ${sidx(1)}. Restano inoltre insolute le fatture n. 2026/087, 2026/102 e 2026/118, per complessivi euro 48.600 ${sidx(2)}, oltre interessi ai sensi del D.Lgs. 231/2002 ${sidx(3)}.</p>
      <p>Vi invitiamo al pagamento entro 15 giorni dal ricevimento della presente.</p>
      <p class="sign">Avv. Chiara Ferri</p>
    </div>
    <div class="srcs"${T("draft-srcs")}>${src(1, "Contratto quadro", "art. 8 · pag. 4")}${src(2, "Fatture", "087 · 102 · 118")}${src(3, "D.Lgs. 231/2002", "Normattiva")}</div>
    ${I.sent
      ? `<div class="sentok">${ic("circle-check")}Ricevute di accettazione e consegna archiviate nel fascicolo di Officine Valtopina.</div>`
      : `<div class="dfoot">${btn("Modifica", { k: "sec", icon: "pen-line" })}${btn("Approva e invia", { icon: "send", t: "draft-send" })}</div>`}
  </div>`;
}

// ── Assistente ──
function assist(S) {
  const A = S.ai;
  const thread = !A.stage
    ? `<div class="aempty">${mark()}<p><b>Chiedimi qualcosa su Officine Valtopina.</b> Rispondo solo con una fonte: fascicolo, Normattiva o sentenze.</p></div>`
    : `<div class="qb">${esc(A.asked)}</div>${answer(S)}`;
  const ph = "Chiedi su Officine Valtopina…";
  return `<main class="page assistp${A.viewer ? " vw" : ""}">
    <section class="athread" data-scroll="athread">
      <div class="ph"><div><h1>Assistente</h1><p class="sub">Ogni risposta con la sua fonte.</p></div><div class="tools">${perim("ov")}</div></div>
      ${thread}
      <div class="composer">${inp(S, "ai-input", A.q, ph)}<span class="sendb${A.q ? " on" : ""}"${T("ai-send")}>${ic("send")}</span></div>
    </section>
    ${A.viewer ? viewer(S) : ""}
  </main>`;
}
function answer(S) {
  const A = S.ai;
  const who = `<span class="amark">${mark()}</span>`;
  if (A.stage === "thinking") return `<div class="ans">${who}<div class="abody"><div class="thinking"><i class="spin"></i>Cerco nel fascicolo e nelle fonti ufficiali…</div></div></div>`;
  if (A.kind === "penale") {
    return `<div class="ans">${who}<div class="abody">
      <div class="nosrc"${T("ai-nosrc")}><div class="nh">${ic("circle-help")}Fonte non trovata</div>
        <p>Non ho trovato una clausola penale nel contratto quadro del 20/01/2024 né negli altri documenti del fascicolo. Non rispondo senza una fonte.</p>
        <p>Vuoi che cerchi in altri documenti condivisi dal cliente?</p>
        <div class="acts">${btn("Sì, cerca", { k: "sec", sm: true })}${btn("No, grazie", { k: "ghost", sm: true })}</div></div>
      <div class="searched"${T("ai-searched")}>${ic("list-checks")}<span>Ho cercato in: contratto quadro (6 pagine), 4 fatture, 14 email e PEC, 23 documenti.</span></div>
    </div></div>`;
  }
  return `<div class="ans">${who}<div class="abody"${T("ai-answer")}>
    <p>Sì. Le tre fatture sono scadute: il contratto prevede il pagamento a 60 giorni data fattura ${sidx(1)}. Tra imprese, per il ritardo nei pagamenti sono dovuti gli interessi moratori senza bisogno di messa in mora ${sidx(2)}. Il tasso è quello di riferimento BCE maggiorato di 8 punti percentuali ${sidx(3)}.</p>
    <p class="anote"><b>Nota.</b> La contestazione di Edil Tevere è arrivata il 22/10/2026. Il contratto chiede contestazioni entro 8 giorni dalla consegna ${sidx(1)}. Verificare le date di consegna nel fascicolo.</p>
    <div class="srcs">${src(1, "Contratto quadro", "artt. 7 e 8 · pag. 4", "ai-src-1")}${src(2, "D.Lgs. 231/2002", "art. 4", "ai-src-2")}${src(3, "D.Lgs. 231/2002", "art. 2, lett. e) e art. 5", "ai-src-3")}</div>
    <p class="afoot">${ic("badge-check")}3 fonti verificate · risposta delle 08:16</p>
  </div></div>`;
}
function viewer(S) {
  const v = S.ai.viewer;
  const tabs = [["c", "1", "Contratto"], ["a4", "2", "Art. 4"], ["a2", "3", "Art. 2 e 5"]].map(([k, n, l]) => `<span class="vt${v === k ? " on" : ""}"${T(`vw-tab-${n}`)}><span class="sn">${n}</span>${l}</span>`).join("");
  let body;
  if (v === "c") {
    body = `<div class="vmeta">${ic("file-text")}<div><b>Contratto quadro di fornitura</b><small>Officine Valtopina – Edil Tevere · 20/01/2024</small></div><span class="mono">pag. 4 di 6</span></div>
      <div class="sheet">
        <p class="dim">… Ogni consegna è accompagnata dal documento di trasporto (DDT) firmato dall'Acquirente.</p>
        <div class="hl"${T("viewer-hl")}><h4>Art. 7 – Pagamenti</h4><p>L'Acquirente paga ogni fattura con bonifico bancario entro 60 (sessanta) giorni dalla data della fattura.</p></div>
        <div class="hl"><h4>Art. 8 – Contestazioni</h4><p>Eventuali vizi o difformità della merce vanno contestati per iscritto entro 8 (otto) giorni dalla consegna. In mancanza, la fornitura si intende accettata.</p></div>
        <h4>Art. 9 – Durata</h4><p class="dim">Il presente contratto ha durata di tre anni dalla sottoscrizione …</p>
      </div>
      <p class="vfoot">${ic("badge-check")}Documento del fascicolo · firmato il 20/01/2024</p>`;
  } else {
    const law = D().law;
    const items = v === "a4" ? [law.a4] : [law.a2, law.a5];
    body = items.map((a, i) => `<figure class="cite">
        <div class="cth"><span class="cic">${ic("book-open")}</span><div><span class="art">${a.art}</span> <span class="act">D.Lgs. 9 ottobre 2002, n. 231</span><div class="rub">${esc(a.rub)} · ${esc(a.comma)}</div></div>${st("verified", "Vigente", false)}</div>
        <blockquote${i === 0 ? T("viewer-quote") : ""}>«${esc(a.text)}»</blockquote>
        <figcaption><span>Testo vigente · consultato il 22/10/2026</span><a href="${a.href}" target="_blank" rel="noopener noreferrer">Normattiva${ic("arrow-up-right")}</a></figcaption>
      </figure>`).join("");
  }
  return `<aside class="viewer" data-scroll="viewer:${v}"><div class="vh"><div class="vtabs">${tabs}</div><span class="vx">${ic("x")}</span></div><div class="vb">${body}</div></aside>`;
}

// ── Oggi ──
function today(S) {
  const urg = [
    { k: "ov", t: "urg-ov", chip: st("urgent", "Urgente"), title: "Edil Tevere contesta la fornitura", what: `${ic("mail-check")}PEC delle 08:12 · bozza di risposta pronta`, act: "Apri fascicolo" },
    { k: "tl", chip: st("due", "Lunedì 26/10"), title: "Udienza confermata dalla cancelleria", what: `${ic("mail-check")}PEC delle 10:15 · R.G. 2817/2026`, act: "Prepara documenti" },
    { k: "dm", chip: st("pending", "Da richiamare"), title: "Il dott. Moretti chiede del parere", what: `${ic("phone")}Telefonata delle 09:30 · mancano 2 documenti`, act: "Richiama" },
  ];
  return `<div class="hello"${T("today-hello")}><h1>Buongiorno, Chiara.</h1><p class="sub">Oggi richiedono attenzione 3 urgenze e 6 messaggi.</p></div>
    <div class="kpis">
      <div class="kpi k-urg"><small>Urgenze</small><strong>3</strong><span>in cima alla lista</span></div>
      <div class="kpi"><small>Messaggi da gestire</small><strong>6</strong><span>già collegati ai clienti</span></div>
      <div class="kpi"><small>Appuntamenti oggi</small><strong>1</strong><span>16:30 · Studio Dentistico Moretti</span></div>
      <div class="kpi k-ok"${T("kpi-hours")}><small>Ore risparmiate a ottobre</small><strong>31</strong><span>smistamento, bozze, archivio</span></div>
    </div>
    <div class="cols">
      <section class="box"${T("today-urg")}><div class="boxh"><h2>Urgenze</h2><span class="sub">Le ho messe in ordine io</span></div>
        ${urg.map((u) => `<div class="urg h-${client(u.k).hue}"${u.t ? T(u.t) : ""}>${av(u.k)}<div class="um"><div class="u1">${u.chip}<span class="cn">${esc(client(u.k).name)}</span></div><b>${esc(u.title)}</b><small>${u.what}</small></div>${btn(u.act, { k: u.t ? "pri" : "sec", sm: true, right: "arrow-right" })}</div>`).join("")}
      </section>
      <section class="box"><div class="boxh"><h2>Agenda di oggi</h2></div>
        <div class="aglist"><div class="slot appointment"><i></i><div><small>${ic("users")}16:30–17:30 · Appuntamento</small><b>Studio Dentistico Moretti</b><span>Il parere sul contratto</span></div></div>
        <div class="slot free"><i></i><div><small>${ic("plus")}11:00 e 15:30</small><b>Liberi</b><span>Li propongo io a chi chiede un incontro</span></div></div></div>
      </section>
    </div>`;
}

// ── Fascicolo impresa 360 ──
function fascicolo(S) {
  const c = client("ov"), tab = S.client.tab;
  const tabs = [["timeline", "Timeline"], ["contratti", "Contratti", 1], ["corr", "Corrispondenza", 14], ["pratiche", "Pratiche", 1], ["fatture", "Fatture", 4], ["banca", "Banca"], ["docs", "Documenti", 23]]
    .map(([k, l, n]) => `<span class="tab${tab === k ? " on" : ""}"${T(`tab-${k}`)}>${l}${n ? `<span class="tn">${n}</span>` : ""}</span>`).join("");
  return `<span class="back">${ic("chevron-left")}Clienti</span>
    <section class="chead h-${c.hue}"${T("cl-head")}>
      ${av("ov", "lg")}<div class="chm"><h1>${esc(c.name)} <span>${c.legal}</span></h1><p>${c.sector} · ${c.city} · ${c.staff} dipendenti · cliente dal ${c.since}</p>${perim("ov")}</div>
      <div class="tools">${btn("Chiedi a Lawee", { k: "sec", icon: "sparkles", t: "cl-ask" })}</div>
    </section>
    <div class="tabs">${tabs}</div>
    <div class="ccols"><div class="cmain">${tab === "fatture" ? fatture(S) : timeline(S)}</div>${alerts(S)}</div>`;
}
function timeline() {
  const inv = D().invoices;
  const ev = [
    { day: "Oggi · 22/10/2026", t: "08:40", ic: "mail", title: "Email di Luca Rossi", det: "«Fwd: contestazione Edil Tevere, ci vediamo?»" },
    { t: "08:12", ic: "mail-check", tone: "urgent", title: "PEC di Edil Tevere: contestazione della fornitura", det: "Ordine 2026/118 · bozza di risposta pronta", id: "tl-pec" },
    { day: "15/09/2026", ic: "banknote", tone: "verified", title: "Bonifico di Edil Tevere: € 9.800,00", det: "Saldo della fattura 2026/041" },
    ...inv.filter((i) => !i.paid).map((i) => ({ day: i.due, ic: "receipt", tone: "urgent", title: `Scade la fattura ${i.n}: ${eur(i.amt)}`, det: "Nessun incasso in banca" })),
    { day: "10/07/2026", ic: "receipt", title: "Fattura 2026/118: € 17.500,00", det: "Consegna del 09/07/2026 con DDT firmato da Edil Tevere", id: "tl-deliv" },
    { day: "12/06/2026", ic: "receipt", title: "Fattura 2026/102: € 14.900,00", det: "Consegna dell'11/06/2026 con DDT firmato" },
    { day: "15/05/2026", ic: "receipt", title: "Fattura 2026/087: € 16.200,00", det: "Consegna del 14/05/2026 con DDT firmato" },
    { day: "20/01/2024", ic: "signature", tone: "pending", title: "Contratto quadro di fornitura firmato", det: "6 pagine · pagamento a 60 giorni · contestazioni entro 8 giorni", id: "tl-contract" },
  ];
  return `<ol class="tl">${ev.map((e) => `${e.day ? `<li class="tday">${e.day}</li>` : ""}<li class="tev${e.tone ? ` t-${e.tone}` : ""}"${e.id ? T(e.id) : ""}><span class="tdot">${ic(e.ic)}</span><div><div class="tt"><b>${esc(e.title)}</b>${e.t ? `<time>${e.t}</time>` : ""}</div><small>${esc(e.det)}</small></div></li>`).join("")}</ol>`;
}
function fatture() {
  const inv = D().invoices, bank = D().bank;
  return `${note(`Ho incrociato fatture e movimenti del conto: per tre fatture non trovo incassi. Mancano <b>${eur(D().missing)}</b>.`, "warn", "inv-note")}
    <section class="box"${T("inv-table")}><div class="boxh"><h2>${ic("receipt")}Fatture a Edil Tevere</h2><span class="sub">Pagamento a 60 giorni data fattura</span></div>
      <div class="tw"><table class="t"><thead><tr><th>Numero</th><th class="opt">Data</th><th class="r">Importo</th><th class="opt2">Scadenza</th><th>Stato</th></tr></thead><tbody>
      ${inv.map((i) => `<tr><td class="mono">${i.n}</td><td class="opt">${i.date}</td><td class="r">${eur(i.amt)}</td><td class="opt2">${i.due}</td><td>${i.paid ? st("verified", "Incassata", false) : st("urgent", "Non incassata", false)}</td></tr>`).join("")}
      <tr class="tot"><td>Da incassare</td><td class="opt"></td><td class="r">${eur(D().missing)}</td><td class="opt2"></td><td></td></tr></tbody></table></div></section>
    <section class="box"${T("bank-box")}><div class="boxh"><h2>${ic("banknote")}Movimenti del conto</h2><span class="sub">Conto collegato · aggiornato oggi alle 07:00</span></div>
      ${bank.map((b) => `<div class="mov"><span class="md">${b.d.slice(0, 5)}</span><div class="mw"><b>${esc(b.what)}</b>${b.sub ? `<small>${esc(b.sub)}</small>` : ""}</div><span class="ma ${b.amt < 0 ? "neg" : "pos"}">${money(b.amt)}</span>${b.match ? `<span class="mm">${st("verified", `Riconciliato · ${b.match}`)}</span>` : ""}</div>`).join("")}
      <div class="mov none">${ic("circle-alert")}<span>Nessun incasso per le fatture 2026/087, 2026/102 e 2026/118.</span></div>
    </section>`;
}
function alerts() {
  return `<aside class="alerts"${T("cl-alerts")}><h3 class="over">Avvisi</h3>
    <div class="al t-urgent">${ic("circle-alert")}<div><b>3 fatture scadute, nessun incasso</b><small>${eur(D().missing)} · la più vecchia scaduta da 100 giorni</small></div></div>
    <div class="al t-due">${ic("clock")}<div><b>La contestazione sembra tardiva</b><small>Il contratto chiede 8 giorni dalla consegna · art. 8</small></div></div>
    <div class="al t-pending">${ic("calendar-clock")}<div><b>Luca Rossi chiede un incontro</b><small>Ho trovato 3 orari liberi in agenda</small></div></div>
  </aside>`;
}

// ── Agenda ──
function agenda(S) {
  const A = S.agenda;
  const slot = (it) => {
    if (it.k === "prop") {
      if (A.chosen && it.id !== "a") return "";
      const chosen = A.chosen && it.id === "a";
      return chosen
        ? `<div class="slot appointment picked"${T(`slot-${it.id}`)}><i></i><div><small>${ic("users")}${it.t}</small><b>Officine Valtopina</b><span>Luca Rossi, in studio</span></div></div>`
        : `<div class="slot request"${T(`slot-${it.id}`)}><i></i><div><small>${ic("inbox")}${it.t}</small><b>Officine Valtopina</b><span>${A.sent ? "Proposto a Luca Rossi" : "Da proporre"}</span></div></div>`;
    }
    const icn = { appointment: "users", call: "video", deadline: "calendar-clock" }[it.k];
    return `<div class="slot ${it.k}"><i></i><div><small>${ic(icn)}${it.t}</small><b>${esc(it.title)}</b><span>${esc(it.sub)}</span></div></div>`;
  };
  const days = D().week.map((d) => `<div class="day${d.today ? " today" : ""}${["Lun 19", "Mar 20", "Mer 21"].includes(d.d) ? " past" : ""}"><div class="dh">${d.d}${d.today ? "<span>oggi</span>" : ""}</div>${d.items.map(slot).join("")}</div>`).join("");
  const msg = A.chosen
    ? note("Luca Rossi ha scelto <b>giovedì 22/10 alle 11:00</b>. L'ho messo in agenda e gli ho mandato un promemoria.", "ok")
    : A.sent
      ? note("Ho proposto a Luca Rossi tre orari nel portale cliente. Aspetto la sua scelta.")
      : `${note("Nella sua email delle 08:40 <b>Luca Rossi</b> chiede di vedervi presto. Ho trovato tre orari liberi.")}<div class="agact">${btn("Invia proposta", { icon: "send", t: "ag-send" })}</div>`;
  return `${head("Agenda", "Settimana dal 19 al 23 ottobre 2026")}
    <div${T("ag-note")}>${msg}</div>
    <div class="week">${days}</div>
    <div class="nextw">${ic("building-2")}<span><b>Lun 26/10 · 10:00</b> Udienza Trasimeno Logistica · Tribunale di Perugia</span></div>`;
}

// ── Preventivi e parcelle ──
function fees(S) {
  const F = D().fee, P = S.fee;
  const status = P.status === "signed" ? st("verified", "Firmato alle 10:31") : P.status === "sent" ? st("pending", "In firma") : st("due", "Da inviare", "file-pen-line");
  if (!P.open) {
    const rows = [
      { t: "fee-row", n: "P-2026/031", k: "ov", what: "Recupero crediti Edil Tevere", amt: F.total, s: st("due", "Pronto da inviare", "file-pen-line"), ex: true },
      { n: "P-2026/029", k: "tl", what: "Rinnovo contratto Umbria Freddo", amt: 2318.4, s: st("verified", "Firmato") },
      { n: "F-2026/112", k: "cp", what: "Parere sul contratto di distribuzione", amt: 1427.4, s: st("verified", "Pagata") },
    ];
    return `${head("Preventivi e parcelle", "Preparati dai parametri forensi. Li firmi tu, li firma il cliente.")}
      ${note("Ho preparato il preventivo per il recupero crediti di <b>Officine Valtopina</b>.")}
      <section class="box"><div class="tw"><table class="t"><thead><tr><th class="opt">Numero</th><th>Cliente e oggetto</th><th class="r">Totale</th><th class="opt2">Stato</th></tr></thead><tbody>
      ${rows.map((r) => `<tr class="${r.t ? "go" : ""}"${r.t ? T(r.t) : ""}><td class="mono opt">${r.n}</td><td><span class="cn2">${av(r.k, "sm")}<span><b>${esc(client(r.k).name)}</b><small>${esc(r.what)}</small></span></span></td><td class="r">${eur(r.amt)}${r.ex ? "<small>esempio</small>" : ""}</td><td class="opt2">${r.s}</td></tr>`).join("")}
      </tbody></table></div></section>`;
  }
  const docs = [["receipt", "Preventivo P-2026/031"], ["signature", "Mandato professionale"], ["file-text", "Informativa sull'uso dell'AI"]];
  return `<span class="back">${ic("chevron-left")}Preventivi e parcelle</span>
    ${head(`Preventivo <span class="mono">P-2026/031</span>`, "Officine Valtopina · Recupero crediti Edil Tevere · valore € 48.600,00", `<span${T("fee-status")}>${status}</span>`)}
    <div class="fcols">
      <section class="box fee"${T("fee-lines")}>
        ${F.lines.map((l) => `<div class="fl"><span class="mono fc">${l.code}</span><div><b>${esc(l.what)}</b><small>${esc(l.note)}</small></div><span class="fa">${eur(l.amt)}</span></div>`).join("")}
        <div class="fs"><span>Compensi</span><span>${eur(F.base)}</span></div>
        <div class="fs"><span>Spese generali 15%</span><span>${eur(F.sg)}</span></div>
        <div class="fs"><span>CPA 4%</span><span>${eur(F.cpa)}</span></div>
        <div class="fs"><span>IVA 22%</span><span>${eur(F.iva)}</span></div>
        <div class="ftot"${T("fee-total")}><span>Totale <small>importi d'esempio</small></span><strong>${eur(F.total)}</strong></div>
      </section>
      <section class="box fdocs"><div class="boxh"><h2>Da firmare</h2><span class="sub">Luca Rossi · Officine Valtopina</span></div>
        ${docs.map(([i, l]) => `<div class="fdoc">${ic(i)}<span>${l}</span>${P.status === "signed" ? ic("circle-check", "okc") : ""}</div>`).join("")}
        <div class="fdact">${P.status === "draft" ? btn("Invia in firma", { icon: "send", t: "fee-send" }) : P.status === "sent" ? `<span class="waiting"><i class="spin"></i>In attesa della firma</span>` : `<span class="signedok">${ic("circle-check")}Firmati da Luca Rossi con codice SMS</span>`}</div>
      </section>
    </div>`;
}

// ── Impostazioni › Automazione ──
const LEVELS = [["Suggerisci", "lightbulb"], ["Prepara", "file-pen-line"], ["Esegui e notifica", "zap"]];
function level(id, v, max = 3) {
  return `<div class="lvl" role="radiogroup">${LEVELS.map(([l, i], n) => {
    const k = n + 1, locked = k > max, on = k === v;
    return `<span class="lv${on ? " on" : ""}${k <= v && !locked ? " reach" : ""}${locked ? " locked" : ""}"${T(`lvl-${id}-${k}`)}><span class="bars">${[1, 2, 3].map((b) => `<i class="${b <= k ? "f" : ""}"></i>`).join("")}</span>${ic(locked ? "lock" : i)}<span class="ll">${l}</span></span>`;
  }).join("")}</div>`;
}
function settings(S) {
  const rows = [
    ["mail", "Smistamento di email e PEC", "Leggo, collego al cliente e archivio.", 3],
    ["send", "Risposte ai clienti", "Preparo la bozza, tu approvi l'invio.", 2],
    ["rem", "Promemoria per documenti mancanti", "Chiedo al cliente i documenti che mancano.", S.auto.rem],
    ["agenda", "Proposte di appuntamento", "Trovo gli orari, tu invii la proposta.", 2],
  ];
  const locked = [
    ["atti", "Atti e pareri", "Sempre in revisione all'avvocato."],
    ["dep", "Depositi telematici", "Preparo il deposito, lo invia l'avvocato."],
  ];
  const tabs = ["Studio", "Utenti e ruoli", "Automazione", "Sicurezza"].map((t) => `<span class="tab${t === "Automazione" ? " on" : ""}">${t}</span>`).join("");
  return `${head("Impostazioni", "Studio Legale Ferri")}<div class="tabs">${tabs}</div>
    <div class="scols"><div>
      <p class="lead">Scegli quanto lascio fare da solo, flusso per flusso.</p>
      <section class="box autos"${T("auto-list")}>${rows.map(([id, t, d, v]) => `<div class="arow${id === "rem" && v === 3 ? " changed" : ""}"><div class="at"><b>${t}</b><small>${d}</small></div>${level(id, v)}</div>`).join("")}</section>
      <section class="box autos"${T("auto-locked")}>${locked.map(([id, t, d]) => `<div class="arow"><div class="at"><b>${ic("lock")}${t}</b><small>${d}</small></div>${level(id, 2, 2)}</div>`).join("")}</section>
    </div>
    <aside class="box roles"${T("roles")}><div class="boxh"><h2>Chi approva</h2></div>
      <div class="role"><span class="mav">CF</span><div><b>Avv. Chiara Ferri</b><small>Titolare · approva e firma tutto</small></div></div>
      <div class="role"><span class="mav">MB</span><div><b>Avv. Marco Bellini</b><small>Avvocato · approva atti e pareri</small></div></div>
      <div class="role"><span class="mav">SC</span><div><b>Sara Conti</b><small>Praticante · prepara, non invia</small></div></div>
    </aside></div>`;
}

// ── Lawee by Monolite ──
function box() {
  return `${head(`<span class="bylogo">${mark()}<span><span class="word">Lawee</span><span class="by">by Monolite</span></span></span>`, "Il box nello studio: dati e modello AI restano qui.")}
    <div class="bgrid">
      <section class="box bst"${T("box-status")}><small class="over">Stato</small><div class="big">${dot("verified", "Online")}</div><b>Nello studio, Corso Vannucci</b><span>Acceso da 41 giorni · temperatura regolare</span></section>
      <section class="box bst"${T("box-backup")}><small class="over">Ultimo backup</small><div class="big"><strong>03:00</strong></div><b>Stanotte, cifrato con la chiave dello studio</b><span>Il prossimo stanotte alle 03:00</span></section>
      <section class="box bst"${T("box-model")}><small class="over">Modello AI attivo</small><div class="big">${st("verified", "Nel box")}</div><b>Le domande non escono dallo studio</b><span>Aggiornato il 14/10/2026</span></section>
      <section class="box bst"><small class="over">Spazio</small><div class="big"><strong>412 GB</strong></div><b>su 2 TB</b><span class="bar"><i style="width:20.6%"></i></span></section>
    </div>
    <section class="box flow"><div class="fnode">${ic("monitor")}<b>I computer dello studio</b></div><span class="fline"></span><div class="fnode main">${ic("server")}<b>Lawee by Monolite</b><small>fascicoli, documenti, modello AI</small></div><span class="fline cut">${ic("x")}</span><div class="fnode off">${ic("hard-drive")}<b>Nessun cloud esterno</b><small>per i dati dei clienti</small></div></section>
    <p class="lead quote">Il tuo know-how rimane veramente tuo.</p>`;
}

// ── The closing screens ──
function slate(S) {
  if (S.slate === "one") {
    const done = [["PEC letta, collegata al cliente e segnata come urgente", "08:12"], ["Risposta con le fonti, firmata e inviata", "08:15"], ["Domanda sul cliente: risposta con 3 fonti", "08:16"]];
    return `<div class="slate"><span class="slogo">${mark()}</span><h1>La segreteria che non si licenzia.</h1>
      <ul class="sdone"${T("slate-list")}>${done.map(([a, t]) => `<li>${ic("circle-check")}<span>${a}</span><time>${t}</time></li>`).join("")}</ul>
      <p class="sub">Un giovedì mattina allo Studio Legale Ferri, in quattro minuti di orologio.</p></div>`;
  }
  const c = window.STORY.contacts || [];
  return `<div class="slate">
    <span class="slogo">${mark()}</span>
    <div class="smsgs"${T("slate-msgs")}><h1>La segreteria che non si licenzia.</h1><h1>Sai tutto del tuo cliente prima che te lo dica.</h1><h1>Ogni risposta con la sua fonte.</h1></div>
    <div class="scta"${T("slate-cta")}>${btn("Richiedi una prova", { icon: "calendar", right: "arrow-right" })}${c.length ? `<p class="contacts">${c.map((m) => `<a href="mailto:${esc(m)}">${esc(m)}</a>`).join(" · ")}</p>` : ""}</div>
    <p class="by">Lawee by Monolite</p>
  </div>`;
}

// ─── The phone: Luca's portale cliente ──────────────────────────────────────
function phoneWho() {
  const p = D().people.luca;
  return `<span class="wav h-terracotta">LR</span><span>Il telefono di <b>${esc(p.short)}</b> · ${esc(p.caption)}</span>`;
}
function phone(S) {
  const P = S.phone, lock = P.screen === "lock";
  const noteHtml = (cls) => P.note ? `<div class="${cls}"${T("ph-note")}><span class="appi">${mark()}</span><div><span class="l1"><span>PORTALE CLIENTE</span><span>ora</span></span><b>${esc(P.note.title)}</b><span class="t">${esc(P.note.text)}</span></div></div>` : "";
  return `<div class="sbar${lock ? " dark" : ""}"><span class="num">${P.time}</span><span class="isl"></span><span class="si">${ic("signal")}${ic("wifi")}${ic("battery-full")}</span></div>
    <div class="pv">${lock ? `<div class="lock"><div class="lk"><small>giovedì 22 ottobre</small><b>${P.time}</b></div>${noteHtml("lnote2")}</div>` : `${screen(S)}${noteHtml("pnote")}`}</div>`;
}
function pshell(S, body, tab) {
  const tabs = [["todo", "list-checks", "Da fare"], ["docs", "file-text", "Documenti"], ["appts", "calendar", "Appuntamenti"]];
  return `<div class="pscr"><div class="phd"><span class="pm">${mark()}</span><div><b>Studio Legale Ferri</b><small>Portale cliente · Officine Valtopina</small></div></div>
    <div class="pscroll" data-scroll="ph:${S.phone.screen}">${body}</div>
    <nav class="ptabs">${tabs.map(([k, i, l]) => `<span class="ptab${tab === k ? " on" : ""}">${ic(i)}${l}</span>`).join("")}</nav></div>`;
}
function screen(S) {
  const P = S.phone, L = S.luca, sl = D().slots;
  switch (P.screen) {
    case "slots":
      return pshell(S, `<div class="ppad"><p class="pgreet">Ciao Luca</p><h3 class="pst">Scegli un orario</h3>
        <p class="pmut">Incontro con l'Avv. Chiara Ferri sulla contestazione di Edil Tevere. In studio, a Perugia.</p>
        <div class="pslots"${T("ph-slots")}>${["a", "b", "c"].map((k) => `<div class="pslot${L.pick === k ? " on" : ""}"${T(`ph-slot-${k}`)}><span><small>${sl[k][0]}</small><b>${sl[k][1]}</b></span>${L.pick === k ? ic("circle-check") : '<i class="rad"></i>'}</div>`).join("")}</div>
        <span class="pbtn${L.pick ? "" : " off"}"${T("ph-slot-ok")}>Conferma l'orario</span></div>`, "appts");
    case "booked":
      return pshell(S, `<div class="ppad"><div class="okbig">${ic("circle-check")}<h3>Appuntamento confermato</h3><p>Giovedì 22/10 alle 11:00, nello studio. Ti mando un promemoria un'ora prima.</p></div></div>`, "appts");
    case "todo":
      return pshell(S, `<div class="ppad"><p class="pgreet">Ciao Luca</p><h3 class="pst">Da fare</h3>
        <div class="ptodo hot">${ic("signature")}<span><b>Firma 3 documenti</b><small>Preventivo, mandato, informativa sull'AI</small></span>${ic("chevron-right")}</div>
        <div class="ptodo">${ic("upload")}<span><b>Carica i DDT di luglio</b><small>Servono per rispondere a Edil Tevere</small></span>${ic("chevron-right")}</div>
        <div class="ptodo done">${ic("calendar")}<span><b>Incontro oggi alle 11:00</b><small>Confermato</small></span>${ic("circle-check")}</div></div>`, "todo");
    case "sign":
      return pshell(S, `<div class="ppad"><h3 class="pst">Documenti da firmare</h3><p class="pmut">Leggili con calma. Firmi tutto con un codice via SMS.</p>
        <div class="psign"${T("ph-sign-list")}>
          <div class="pdoc">${ic("receipt")}<span><b>Preventivo P-2026/031</b><small>Totale ${eur(D().fee.total)} · esempio</small></span></div>
          <div class="pdoc">${ic("signature")}<span><b>Mandato professionale</b><small>Recupero crediti Edil Tevere</small></span></div>
          <div class="pdoc">${ic("file-text")}<span><b>Informativa sull'uso dell'AI</b><small>Come lo studio usa Lawee</small></span></div>
        </div>
        <span class="pbtn"${T("ph-sign-go")}>${ic("signature")}Firma i documenti</span></div>`, "todo");
    case "otp":
      return pshell(S, `<div class="ppad"><h3 class="pst">Codice di firma</h3><p class="pmut">Te l'ho mandato via SMS al numero che finisce con 42.</p>
        <div class="otp${S.focus === "ph-otp" ? " focus" : ""}"${T("ph-otp")}>${Array.from({ length: 6 }, (_, i) => `<span>${esc(L.otp[i] || "")}</span>`).join("")}</div>
        <span class="pbtn${L.otp.length < 6 ? " off" : ""}"${T("ph-otp-ok")}>Conferma la firma</span></div>`, "todo");
    case "signed":
      return pshell(S, `<div class="ppad"><div class="okbig">${ic("circle-check")}<h3>Documenti firmati</h3><p>Preventivo, mandato e informativa. Una copia è nei tuoi documenti.</p></div></div>`, "docs");
    default: return "";
  }
}

return { comp, compWho, phone, phoneWho };
})();
