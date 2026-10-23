// ─── The demo engine: player, cards, versions, cursor ─────────────────────────
// It plays one story (window.STORY) on one product's screens (window.PORTAL). A story is data: chapters, versions, a
// step list where every step is { v, ch, title, text, line1, view, acts, hold, setup }, and initial() for the state the
// acts change. A version plays the steps of its set (step.v). Jumping to a step replays, at once, the earlier steps of
// the same version, so any step can be opened directly (#full, #law-9).
(() => {
"use strict";
const ST = window.STORY, P = window.PORTAL;
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ic = (n, c = "") => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const mark = () => `<svg class="mark" aria-hidden="true"><use href="#lawee-mark"/></svg>`;

// Acts. `d` is the pause before the act, in ms at the whole version's pace; `view` is the pane a phone-width viewer
// is switched to; `lite` plays the act at once, without the cursor, in the 1-minute version.
const W = (d) => ({ k: "wait", d });
const DO = (d, fn, o = {}) => ({ k: "do", d, fn, ...o });
const CLICK = (d, t, fn, o = {}) => ({ k: "click", d, t, fn, ...o });
const TYPE = (d, t, text, fn, o = {}) => ({ k: "type", d, t, text, fn, ...o });
const LOOK = (d, t, o = {}) => ({ k: "look", d, t, ...o });
const STEPS = ST.steps({ W, DO, CLICK, TYPE, LOOK });

// ─── Versions ───────────────────────────────────────────────────────────────
// Each has its set of steps, its pace (how far it stretches the story's timings), how fast it types and reads (ms a
// word), and its card: a whole one that stops the stage before each step, or a line that goes along with it.
const VERSIONS = Object.fromEntries(ST.versions.map((v) => [v.key, v]));
const VKEYS = ST.versions.map((v) => v.key);
const V = () => VERSIONS[R.v];
let SEQ = [];
const seqOf = (v) => STEPS.map((_, i) => i).filter((i) => STEPS[i].v === VERSIONS[v].set);
const sequence = () => { SEQ = seqOf(R.v); };
const pos = () => SEQ.indexOf(R.step);
const versionOf = (k) => VKEYS.find((v) => seqOf(v).includes(k));
const SEEN_KEY = `${ST.key}-demo-seen`;
function markSeen(v) {
  try {
    const s = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
    s.add(v);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
  } catch (e) {}
}

// ─── State ──────────────────────────────────────────────────────────────────
let S = ST.initial();
const R = { v: ST.start, step: 0, i: 0, playing: false, card: false, menu: null, token: 0, mview: "comp", ended: false, read: false };
const C = { left: 0, t0: 0, timer: 0, info: false, resume: false };
const MISSING = (window.__demoMissing = new Set());
// ?fast plays everything ten times faster: for checking every step, not for viewers.
const FAST = /[?&]fast\b/.test(location.search) ? 0.1 : 1;
const sleep = (ms, tok) => new Promise((r) => setTimeout(() => r(tok === undefined || tok === R.token), Math.max(0, ms * FAST)));
const narrow = () => window.innerWidth < 900;
const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
const firstCard = () => pos() === 0 && !C.info;
const readMs = (k) => Math.max(3000, 1000 + words(`${STEPS[k].title} ${STEPS[k].text}`) * V().wordMs) + (k === SEQ[0] ? Math.round(words(ST.tag) * V().wordMs * 0.6) : 0);
const lineOf = (k) => (V().card === "line" ? STEPS[k][V().line] : "");
const lineMs = (k) => Math.max(2600, 1200 + words(lineOf(k)) * V().wordMs);
const chapter = (k) => { const [, lane, name] = ST.chapters[STEPS[k].ch]; return `${lane} · ${name}`; };
const cardFor = (k) => V().card === "whole" || (V().intro && k === SEQ[0]);

function applyInstant(a) {
  if (a.k === "do" || a.k === "click") a.fn(S);
  else if (a.k === "type") a.fn(S, a.text);
}
// The state at the start of step k (or at its end): the version's earlier steps, played at once.
function stateAt(k, end) {
  const s = ST.initial();
  const prev = S; S = s;
  for (const i of seqOf(versionOf(k))) {
    if (i > k || (i === k && !end)) break;
    STEPS[i].setup?.(S);
    STEPS[i].acts.forEach(applyInstant);
  }
  if (!end) STEPS[k].setup?.(S);
  const out = S; S = prev;
  return out;
}
function clearTransient() {
  S.comp.toast = null; S.focus = null;
  if (S.phone) { if (S.phone.screen !== "lock") S.phone.note = null; }
}

// ─── Render ─────────────────────────────────────────────────────────────────
const CACHE = new Map();
function setHTML(el, html) {
  if (CACHE.get(el) === html) return;
  const keep = {};
  el.querySelectorAll("[data-scroll]").forEach((n) => { keep[n.dataset.scroll] = n.scrollTop; });
  el.innerHTML = html;
  CACHE.set(el, html);
  el.querySelectorAll("[data-scroll]").forEach((n) => { if (keep[n.dataset.scroll] != null) n.scrollTop = keep[n.dataset.scroll]; });
}
function mview() { return S.phone ? R.mview : "comp"; }
// On narrow screens the menu is a row that scrolls sideways: keep the item that matters in view.
function keepInSide(el, smooth) {
  const side = el && el.closest(".side");
  if (!side || side.scrollWidth <= side.clientWidth) return false;
  const l = el.offsetLeft - side.offsetLeft;
  if (l >= side.scrollLeft && l + el.offsetWidth <= side.scrollLeft + side.clientWidth) return false;
  side.scrollTo({ left: Math.max(0, l - 12), behavior: smooth ? "smooth" : "auto" });
  return true;
}
function render() {
  document.body.classList.toggle("narrow", narrow());
  document.body.dataset.mview = mview();
  const stage = $("#stage");
  stage.dataset.phone = S.phone ? "1" : "0";
  stage.dataset.dim = R.card || R.menu ? "1" : "0";
  setHTML($("#compwho"), P.compWho(S));
  setHTML($("#comp"), P.comp(S));
  keepInSide($("#comp .side .nv.on"));
  setHTML($("#phonewho"), S.phone ? P.phoneWho(S) : "");
  setHTML($("#phone"), S.phone ? P.phone(S) : "");
  const mv = mview();
  setHTML($("#mswitch"), `<div class="msw" role="group" aria-label="Schermo"><button type="button" class="${mv === "comp" ? "on" : ""}" data-ui="mview:comp">${ic("monitor")}Computer</button><button type="button" class="${mv === "phone" ? "on" : ""}" data-ui="mview:phone">${ic("smartphone")}Telefono</button></div>`);
  renderPlayer();
  paintCard();
  fitPhone();
}
function fitPhone() {
  const box = $("#phonebox"), dev = $("#dev");
  const stage = $("#stage");
  if (!S.phone || !box.offsetParent) { stage.style.setProperty("--pw", "0px"); return; }
  const h = box.clientHeight, w = box.clientWidth;
  if (narrow()) {
    // Phone width: the viewer's phone shows Luca's screen at close to its own size, without the frame.
    const s = Math.min(1, (w - 4) / 375);
    dev.classList.add("flat");
    dev.style.width = "375px";
    dev.style.height = `${Math.floor(h / s)}px`;
    dev.style.transform = `translateX(-50%) scale(${s})`;
    stage.style.setProperty("--pw", "0px");
    return;
  }
  dev.classList.remove("flat");
  const s = Math.min(0.82, h / 700);
  const height = Math.min(840, h / s);
  dev.style.width = "395px";
  dev.style.height = `${Math.floor(height)}px`;
  dev.style.transform = `translateX(-50%) scale(${s})`;
  $(".phonecol").style.width = `${Math.ceil(395 * s)}px`;
  stage.style.setProperty("--pw", `${Math.ceil(395 * s)}px`);
}

function renderPlayer() {
  const segs = $("#segs");
  const key = `${R.v}:${SEQ.join(",")}`;
  if (segs.dataset.key !== key) {
    segs.dataset.key = key;
    segs.innerHTML = SEQ.map((k, i) => `<button type="button" class="seg${i && STEPS[k].ch !== STEPS[SEQ[i - 1]].ch ? " cut" : ""}" data-ui="seg:${k}" aria-label="Passo ${i + 1}: ${esc(STEPS[k].title)}"><i></i></button>`).join("");
  }
  progress();
  $("#count").textContent = `${pos() + 1}/${SEQ.length}`;
  $("#gtitle").textContent = STEPS[R.step].title;
  const info = $(".pnow");
  if (!info.querySelector(".ic")) info.insertAdjacentHTML("beforeend", ic("info"));
  const fresh = !R.playing && R.i === 0 && pos() === 0 && !R.ended;
  const label = R.ended ? "Ricomincia" : R.playing ? "Pausa" : fresh ? "Guarda la demo" : "Riprendi";
  const play = $('[data-ui="play"]');
  play.innerHTML = `${ic(R.ended ? "rotate-ccw" : R.playing ? "pause" : "play", R.ended ? "" : "solid")}<span class="lb">${label}</span>`;
  play.setAttribute("aria-label", label);
  $('[data-ui="prev"]').innerHTML = ic("arrow-left");
  $('[data-ui="prev"]').disabled = pos() <= 0 && !R.menu;
  $('[data-ui="next"]').innerHTML = `<span class="lb">Avanti</span>${ic("arrow-right")}`;
  $('[data-ui="next"]').disabled = !!R.menu || (!R.card && pos() === SEQ.length - 1);
  setHTML($("#vpick"), VKEYS.map((v) => `<button type="button" class="${v === R.v ? "on" : ""}" data-ui="ver:${v}">${VERSIONS[v].name}${v === R.v ? `<span class="vmore">${ic("chevron-down")}</span>` : ""}</button>`).join(""));
}
function progress() {
  document.querySelectorAll(".seg").forEach((el, i) => {
    const k = SEQ[i];
    const done = k < R.step || (k === R.step && R.ended);
    el.classList.toggle("done", done);
    el.firstElementChild.style.width = k === R.step && !R.ended ? `${Math.round((R.i / Math.max(1, STEPS[k].acts.length)) * 100)}%` : "";
  });
}

// ─── Cards ──────────────────────────────────────────────────────────────────
function stepCard() {
  const k = R.step, first = firstCard();
  return `<div class="scard" role="status">
    <div class="sc-top">${mark()}<span>Demo guidata · ${esc(VERSIONS[R.v].long)}</span><span class="sc-n">Passo ${pos() + 1} di ${SEQ.length}</span></div>
    <div class="sc-ch">${esc(chapter(k))}</div>
    <h2>${esc(STEPS[k].title)}</h2>
    <p>${esc(STEPS[k].text)}</p>
    ${first ? `<p class="sc-note">${esc(ST.tag)}</p>` : ""}
    <div class="sc-foot">${first ? `<span>La demo va avanti da sola: un clic per non aspettare.</span>` : ""}<button type="button" class="pb pri" data-ui="card">Continua${ic("arrow-right")}</button></div>
    <i class="sc-time"><b></b></i></div>`;
}
function pickCard() {
  const opt = (v) => {
    const X = VERSIONS[v];
    return `<button type="button" class="vopt${v === R.v ? " go" : ""}" data-ui="ver:${v}">${ic("play", "solid")}<span><b>${esc(X.long)}</b><small>${esc(X.sub)}</small></span></button>`;
  };
  return `<div class="scard" role="dialog" aria-label="Quale versione?">
    <div class="sc-top">${mark()}<span>Demo guidata · ${esc(ST.title)}</span></div>
    <h2>Quale versione?</h2>
    <div class="vopts">${VKEYS.map(opt).join("")}</div>
    <p class="sc-note">${esc(ST.tag)}</p></div>`;
}
function endCard() {
  const E = ST.ends[R.v];
  return `<div class="scard" role="dialog" aria-label="Fine">
    <div class="sc-top">${mark()}<span>Demo guidata · ${esc(ST.title)}</span></div>
    <h2>${esc(E.title)}</h2>
    <p>${esc(E.text)}</p>
    <p class="sc-note">${esc(ST.tag)}</p>
    <div class="sc-foot vend"><button type="button" class="pb" data-ui="again">${ic("rotate-ccw")}Rivedi</button><button type="button" class="pb pri" data-ui="ver:${E.next}">${esc(E.label)}${ic("arrow-right")}</button></div></div>`;
}
let cardKey = "";
function paintCard() {
  const el = $("#card");
  const key = R.menu ? `menu:${R.menu}:${R.v}` : R.card ? `step:${R.step}:${C.info}:${R.v}` : "";
  if (key !== cardKey) {
    if (key) {
      if (R.card && !R.menu) el.style.setProperty("--read", `${C.left}ms`);
      el.innerHTML = R.menu === "pick" ? pickCard() : R.menu === "end" ? endCard() : stepCard();
    } else el.innerHTML = "";
    cardKey = key;
  }
  el.classList.toggle("on", !!key);
  el.classList.toggle("run", R.card && R.playing && !R.menu && !C.info);
  el.setAttribute("aria-hidden", String(!key));
  const line = $("#sline");
  const text = !R.menu && !R.card ? lineOf(R.step) : "";
  setHTML(line, text ? `${mark()}<span>${esc(text)}</span>` : "");
  line.classList.toggle("on", !!text);
}
function openCard(info = false) {
  R.card = true; C.info = info; C.left = readMs(R.step);
  if (!info) R.read = true;
  cursorHide();
  render();
  if (R.playing && !info) startCardTimer();
}
function startCardTimer() {
  clearTimeout(C.timer);
  C.t0 = performance.now();
  const tok = R.token;
  C.timer = setTimeout(() => { if (tok === R.token && R.card && R.playing) closeCard(true); }, C.left * FAST);
}
function stopCardTimer() { clearTimeout(C.timer); C.left = Math.max(400, C.left - (performance.now() - C.t0)); }
function closeCard(run) {
  clearTimeout(C.timer);
  R.card = false; C.info = false;
  render();
  if (run) { R.playing = true; R.token++; renderPlayer(); runFrom(R.token); }
}

// ─── Cursor ─────────────────────────────────────────────────────────────────
const cursor = $("#cursor");
let cpos = null;
function cursorHide() { cursor.classList.remove("on"); }
const findT = (t) => document.querySelector(`[data-t="${t}"]`);
async function point(t, tok, view) {
  let el = findT(t);
  const pane = view || (el ? (el.closest("#phone") ? "phone" : "comp") : null);
  if (narrow() && S.phone && pane && R.mview !== pane) {
    R.mview = pane; render();
    if (!(await sleep(380, tok))) return null;
  }
  el = findT(t);
  if (!el || !el.getClientRects().length) { MISSING.add(`${R.step + 1}:${t}`); return null; }
  // Bring it into view inside whatever scrolls around it (the page, a list, the sideways menu), and wait for the
  // scroll to settle before the cursor moves.
  for (const axis of ["x", "y"]) {
    const sc = scroller(el, axis);
    if (!sc) continue;
    const er = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    if (axis === "y" && (er.top < sr.top + 8 || er.bottom > sr.bottom - 8)) {
      const to = sc.scrollTop + (er.top - sr.top) - Math.max(16, (sr.height - Math.min(er.height, sr.height * 0.8)) * 0.35);
      sc.scrollTo({ top: Math.max(0, to), behavior: "smooth" });
    } else if (axis === "x" && (er.left < sr.left + 8 || er.right > sr.right - 8)) {
      sc.scrollTo({ left: Math.max(0, sc.scrollLeft + (er.left - sr.left) - 12), behavior: "smooth" });
    } else continue;
    await settle(sc);
    if (tok !== R.token) return null;
  }
  const r = el.getBoundingClientRect();
  const x = r.left + (r.width > 180 ? Math.min(40, r.width / 2) : r.width / 2);
  const y = r.top + Math.min(r.height / 2, 24);
  const dist = cpos ? Math.hypot(x - cpos[0], y - cpos[1]) : 300;
  const dur = Math.round(Math.min(900, Math.max(320, dist * 0.9)) * Math.max(0.6, V().pace));
  cursor.style.transitionDuration = cursor.classList.contains("on") ? `${dur * FAST}ms, 200ms` : "0ms, 200ms";
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  cursor.classList.add("on");
  cpos = [x, y];
  if (!(await sleep(dur + 40, tok))) return null;
  return el;
}
function scroller(el, axis) {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const o = axis === "x" ? cs.overflowX : cs.overflowY;
    if ((o === "auto" || o === "scroll") && (axis === "x" ? n.scrollWidth > n.clientWidth + 1 : n.scrollHeight > n.clientHeight + 1)) return n;
  }
  return null;
}
// Resolves once a smooth scroll has stopped (three still frames), or after 900 ms at most.
function settle(n) {
  return new Promise((res) => {
    let last = null, still = 0;
    const t0 = performance.now();
    const tick = () => {
      const v = `${n.scrollTop}:${n.scrollLeft}`;
      if (v === last) still++; else { still = 0; last = v; }
      if (still >= 3 || performance.now() - t0 > 900) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
function tap() { cursor.classList.remove("tap"); void cursor.offsetWidth; cursor.classList.add("tap"); }

// ─── Playing ────────────────────────────────────────────────────────────────
async function act(a, tok) {
  if (a.lite && V().card === "line") {
    applyInstant(a);
    if (a.view && narrow()) R.mview = a.view;
    render();
    return sleep(60, tok);
  }
  if (!(await sleep(a.d * V().pace, tok))) return false;
  if (a.view && narrow() && S.phone && (a.k === "do" || a.k === "wait")) R.mview = a.view;
  switch (a.k) {
    case "wait": return true;
    case "do":
      a.fn(S);
      if (a.view && narrow()) R.mview = a.view;
      render();
      return sleep(60, tok);
    case "look": {
      await point(a.t, tok, a.view);
      if (tok !== R.token) return false;
      return sleep(200 * V().pace, tok);
    }
    case "click": {
      await point(a.t, tok, a.view);
      if (tok !== R.token) return false;
      tap();
      if (!(await sleep(120, tok))) return false;
      a.fn(S);
      render();
      return sleep(160, tok);
    }
    case "type": {
      await point(a.t, tok, a.view);
      if (tok !== R.token) return false;
      tap();
      S.focus = a.t;
      for (let n = 1; n <= a.text.length; n++) {
        a.fn(S, a.text.slice(0, n));
        render();
        if (!(await sleep(V().typeMs, tok))) return false;
      }
      S.focus = null;
      render();
      return sleep(120, tok);
    }
  }
  return true;
}
async function runFrom(tok) {
  const k = R.step, step = STEPS[k];
  const t0 = performance.now();
  if (narrow() && R.i === 0) { R.mview = step.view || "comp"; render(); }
  // In a short version the line comes first: a moment to read it before anything moves (unless its card was just read).
  if (V().card === "line" && R.i === 0 && !R.read && !(await sleep(lineMs(k), tok))) return;
  while (R.i < step.acts.length) {
    if (!(await act(step.acts[R.i], tok))) return;
    R.i++;
    progress();
  }
  const min = V().card === "line" && !R.read ? lineMs(k) - (performance.now() - t0) : 0;
  if (!(await sleep(Math.max(step.hold * V().pace + (V().rest || 0), min), tok))) return;
  advance(tok);
}
function advance(tok) {
  if (tok !== R.token) return;
  const p = pos();
  if (p >= SEQ.length - 1) {
    R.playing = false; R.ended = true; R.token++;
    markSeen(R.v);
    cursorHide();
    R.menu = "end";
    render();
    return;
  }
  goto(SEQ[p + 1], true);
}
function goto(k, play) {
  R.token++;
  clearTimeout(C.timer);
  S = stateAt(k, false);
  clearTransient();
  R.step = k; R.i = 0; R.ended = false; R.card = false; R.read = false; C.info = false;
  R.mview = STEPS[k].view || "comp";
  R.playing = !!play;
  cursorHide(); cpos = null;
  CACHE.clear();
  if (cardFor(k)) openCard(false);
  else { render(); if (play) runFrom(R.token); }
}
function choose(v) {
  R.v = v; R.menu = null;
  sequence();
  goto(SEQ[0], true);
}
function play() {
  if (R.menu === "pick") return choose(R.v);
  if (R.menu === "end" || R.ended) { R.menu = null; return goto(SEQ[0], true); }
  R.playing = true;
  if (R.card) {
    if (C.info) { closeCard(true); return; }
    render(); startCardTimer(); return;
  }
  R.token++; render(); runFrom(R.token);
}
function pause() {
  R.playing = false; R.token++;
  if (R.card) stopCardTimer();
  S.focus = null;
  render();
}
function next() {
  if (R.menu) return;
  if (R.card && !C.info) { closeCard(true); return; }
  if (R.card && C.info) { closeCard(false); }
  const p = pos();
  if (p < SEQ.length - 1) goto(SEQ[p + 1], R.playing);
}
function prev() {
  if (R.menu === "end") { R.menu = null; }
  const p = pos();
  if (p > 0) goto(SEQ[p - 1], R.playing);
}
function showInfo() {
  if (R.menu) return;
  if (R.card) { if (C.info) closeCard(false); else closeCard(true); return; }
  const was = R.playing;
  if (was) pause();
  C.resume = was;
  openCard(true);
}
function cardButton() {
  if (C.info) { const was = C.resume; closeCard(false); if (was) play(); } else closeCard(true);
}

// ─── Input ──────────────────────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ui]");
  const ui = b?.dataset.ui;
  if (!ui) {
    // A click on the card itself sends it away, as its button does.
    if (e.target.closest("#card .scard") && R.card) cardButton();
    return;
  }
  if (ui === "play") return R.playing ? pause() : play();
  if (ui === "prev") return prev();
  if (ui === "next") return next();
  if (ui === "info") return showInfo();
  if (ui === "again") { R.menu = null; return goto(SEQ[0], true); }
  if (ui === "card") return cardButton();
  if (ui.startsWith("ver:")) {
    const v = ui.slice(4);
    if (narrow() && !R.menu && v === R.v) { if (R.playing) pause(); R.menu = "pick"; return render(); }
    return choose(v);
  }
  if (ui.startsWith("seg:")) { R.menu = null; return goto(Number(ui.slice(4)), R.playing); }
  if (ui.startsWith("mview:")) { R.mview = ui.slice(6); return render(); }
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
  if (e.key === " ") { e.preventDefault(); R.playing ? pause() : play(); }
  else if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
});
let rz = 0;
window.addEventListener("resize", () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { CACHE.clear(); render(); }); });
document.addEventListener("visibilitychange", () => { if (document.hidden && R.playing) pause(); });

// ─── Start ──────────────────────────────────────────────────────────────────
// The minute starts on its own, on its first card. #full opens the complete version at its first step; #law-9 opens
// step 9. Both wait for a click to play.
function start() {
  const h = location.hash.slice(1);
  const m = h.match(new RegExp(`^${ST.key}-(\\d+)$`));
  const whole = VKEYS.find((v) => VERSIONS[v].card === "whole");
  if (h === "full" || m) {
    const k = m ? Math.min(Math.max(1, Number(m[1])), STEPS.length) - 1 : seqOf(whole)[0];
    R.v = versionOf(k); sequence();
    goto(k, false);
    return;
  }
  R.v = ST.start; sequence();
  goto(SEQ[0], !document.hidden);
}
// For checks: show step k as it starts, or as it ends (`end`), with no card over it.
function show(k, end) {
  R.token++; R.playing = false; R.menu = null; R.card = false; clearTimeout(C.timer);
  R.v = versionOf(k); sequence();
  S = stateAt(k, !!end);
  R.step = k; R.i = end ? STEPS[k].acts.length : 0;
  R.mview = STEPS[k].view || "comp";
  CACHE.clear(); cursorHide(); render();
}
window.__demo = { R, get S() { return S; }, STEPS, goto, play, pause, choose, show, render, VERSIONS, get SEQ() { return SEQ; }, readMs, lineMs, markSeen };
start();
})();
