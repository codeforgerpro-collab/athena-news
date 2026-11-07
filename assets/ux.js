
/* 28 Oct: the readers' quick tour - first visit, or each new session when the reader switched it on */
(function () {
  "use strict";
  var src = document.getElementById("tour-i18n");
  window.athenaTourAuto = function () { return false; };
  if (!src) return;
  var T = JSON.parse(src.textContent || "{}"), KEY = "athena-tour";
  T.intro = T.intro || {}; T.intro.mark = src.getAttribute("data-mark") || T.intro.mark || "";
  if (src.getAttribute("data-src") && window.fetch) {                   /* SPD-35: the words are in a shared file on every other page */
    fetch(src.getAttribute("data-src")).then(function (r) { return r.json(); }).then(function (j) {
      j.intro = j.intro || {}; j.intro.mark = T.intro.mark;
      for (var k in j) T[k] = j[k];
      IN = T.intro || {};
      if (window.athenaTourAuto === auto && !box) auto();               /* "show the tour each visit": it starts once the words are here */
      syncHelp(); var hb2 = document.querySelector("#hp .hpbox"); if (hb2 && !hb2.querySelector(".hptour")) helpRow(hb2);
    }).catch(function () { /* no tour words: the page works without the tour */ });
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return "blocked"; } }
  function put(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var WHERE = { menu: ["nav.sections .nmain", "nav.sections .nmob"], ask: ["nav.sections > .wrap > .nask", "nav.sections .nsrch"], ticker: ["#ticker"],
                numbers: [".glance"], sources: [".srcs"], display: [".util .modes", ".util .tsz"], help: ["#hp .hpbtn", "#hp"] };
  function shown(el) { if (!el || el.closest("[hidden]")) return false; var r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; }
  function find(k) { var l = WHERE[k]; if (!l) return null; for (var i = 0; i < l.length; i++) { var el = document.querySelector(l[i]); if (shown(el)) return el; } return undefined; }
  var box = null, list = [], at = 0, last = null, autoOn = false;
  function close() {
    if (!box) return;
    put(autoOn ? "on" : "off");
    document.removeEventListener("keydown", keys, true); window.removeEventListener("resize", place); window.removeEventListener("scroll", onScroll, true);
    box.remove(); box = null;
    if (last && last.focus) try { last.focus(); } catch (e) { /* gone */ }
    syncHelp();
  }
  var sT = 0;
  function onScroll() {                                                 /* while the page scrolls, the spotlight follows at once */
    if (!box) return;
    box.classList.add("scrolling"); place();
    clearTimeout(sT); sT = setTimeout(function () { if (box) { box.classList.remove("scrolling"); place(); } }, 140);
  }
  function keys(ev) {
    if (!box) return;
    if (ev.key === "Escape") { ev.preventDefault(); close(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); go(at + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(at - 1); }
  }
  function place() {
    if (!box) return;
    var s = list[at], ring = box.querySelector(".tour-ring"), card = box.querySelector(".tour-card");
    var el = s.el, vw = window.innerWidth, vh = window.innerHeight;
    if (!el) { box.classList.remove("has-ring"); ring.hidden = true;
      card.style.left = Math.max(12, (vw - card.offsetWidth) / 2) + "px"; card.style.top = Math.max(12, (vh - card.offsetHeight) / 2) + "px"; return; }
    var r = el.getBoundingClientRect(), pad = 6, kids = el.children;
    if (kids && kids.length && kids.length < 12) {                     /* hug the content, not a full-width row */
      var L = 1e9, Tp = 1e9, Rr = -1e9, B = -1e9;
      for (var c = 0; c < kids.length; c++) { var q = kids[c].getBoundingClientRect(); if (q.width && q.height) { L = Math.min(L, q.left); Tp = Math.min(Tp, q.top); Rr = Math.max(Rr, q.right); B = Math.max(B, q.bottom); } }
      if (Rr > L && B > Tp && (Rr - L) < r.width * 0.9) r = { left: L, top: Tp, right: Rr, bottom: B, width: Rr - L, height: B - Tp };
    }
    ring.hidden = false; box.classList.add("has-ring");
    ring.style.left = (r.left - pad) + "px"; ring.style.top = (r.top - pad) + "px"; ring.style.width = (r.width + 2 * pad) + "px"; ring.style.height = (r.height + 2 * pad) + "px";
    if (vw <= 640) return;                                              /* phones: the card sits at the bottom (CSS) */
    var cw = card.offsetWidth, ch = card.offsetHeight, top = r.bottom + 14;
    if (top + ch > vh - 12) top = r.top - ch - 14;
    if (top < 12) top = Math.min(vh - ch - 12, Math.max(12, r.bottom + 14));
    var left = Math.min(vw - cw - 12, Math.max(12, r.left + r.width / 2 - cw / 2));
    card.style.left = left + "px"; card.style.top = top + "px";
  }
  function go(i) {
    if (!box) return;
    if (i < 0) return;
    if (i >= list.length) { close(); return; }
    at = i;
    var s = list[i], n = list.length, end = s.k === "end", card = box.querySelector(".tour-card");
    var follow = end && (T.tg || T.x) ? '<div class="tour-follow">' + (T.tg ? '<a href="' + esc(T.tg) + '" target="_blank" rel="noopener">Telegram</a>' : "") +
      (T.x ? '<a href="' + esc(T.x) + '" target="_blank" rel="noopener me">X</a>' : "") + "</div>" : "";
    var dots = "<div class=\"tour-dots\" aria-hidden=\"true\">" + list.map(function (_, j) { return "<i" + (j === i ? ' class="on"' : "") + "></i>"; }).join("") + "</div>";
    var auto = (i === 0 || end) ? '<label class="tour-auto"><input type="checkbox"' + (autoOn ? " checked" : "") + "> <span>" + esc(T.auto) + "</span></label>" : "";
    card.innerHTML = '<p class="tour-k">' + esc(T.label) + " · " + esc(String(T.step).replace("{i}", i + 1).replace("{n}", n)) + "</p>" +
      (s.k === "welcome" ? '<img class="tour-owl" src="' + esc(owl) + '" alt="" width="44" height="44">' : "") +
      '<h3 id="tour-h">' + esc(s.h) + '</h3><p id="tour-p">' + esc(s.p) + "</p>" + follow + dots + auto +
      '<div class="tour-btns">' + (end ? "" : '<button type="button" class="tour-skip">' + esc(T.skip) + "</button>") + '<span class="grow"></span>' +
      (i > 0 ? '<button type="button" class="tour-back">' + esc(T.back) + "</button>" : "") +
      '<button type="button" class="tour-next">' + esc(end ? T.done : T.next) + " " + (end ? "" : "&rsaquo;") + "</button></div>";
    var a = card.querySelector(".tour-auto input"); if (a) a.addEventListener("change", function () { autoOn = a.checked; put(autoOn ? "on" : "off"); });
    card.querySelector(".tour-next").addEventListener("click", function () { go(at + 1); });
    var b = card.querySelector(".tour-back"); if (b) b.addEventListener("click", function () { go(at - 1); });
    var k = card.querySelector(".tour-skip"); if (k) k.addEventListener("click", close);
    if (s.el) { try { s.el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } catch (e) { s.el.scrollIntoView(); } }
    place(); setTimeout(place, 320); setTimeout(place, 700);
    card.querySelector(".tour-next").focus({ preventScroll: true });
  }
  var owl = (document.querySelector(".mast img") || {}).src || "";
  function start() {
    if (box) return;
    try { sessionStorage.setItem("athena-tour-session", "1"); sessionStorage.setItem("athena-welcomed", "1"); } catch (e) { /* ok */ }
    var w = document.getElementById("welc"); if (w) w.hidden = true;
    var hp = document.getElementById("hp"); if (hp) hp.open = false;
    list = (T.steps || []).map(function (s) { var el = find(s.k); return { k: s.k, h: s.h, p: s.p, el: el }; })
      .filter(function (s) { return s.el !== undefined; });
    last = document.activeElement;
    autoOn = get() === "on";
    box = document.createElement("div"); box.className = "tour";
    box.innerHTML = '<div class="tour-dim"></div><div class="tour-ring" hidden></div><div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-h" aria-describedby="tour-p"></div>';
    document.body.appendChild(box);
    box.querySelector(".tour-dim").addEventListener("click", function () { go(at + 1); });
    document.addEventListener("keydown", keys, true); window.addEventListener("resize", place); window.addEventListener("scroll", onScroll, true);
    go(0);
  }
  function auto() {
    var v = get(), seen = false, played = true;
    try { seen = sessionStorage.getItem("athena-tour-session") === "1"; } catch (e) { seen = true; }
    try { played = localStorage.getItem("athena-intro") === "1"; } catch (e) { played = true; }
    /* LOOK-31 (30 Oct 2026): the news first. The tour starts only when the reader asked for it (Help, the welcome, or the
       "every visit" switch); the intro plays once per browser, on the front page only, and never for a reader who arrived
       from a search engine or a link to a story - they came for the news, not for us. */
    var front = !!document.getElementById("welcome"), ref = "";
    try { ref = document.referrer || ""; } catch (e) { ref = ""; }
    var fromSearch = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|qwant|startpage)\./i.test(ref);
    var wantTour = (T.steps || []).length && !seen && v === "on";
    var wantIntro = IN.on && !played && !seen && front && !fromSearch;
    if ((!wantTour && !wantIntro) || window.innerWidth < 320) return false;
    try { sessionStorage.setItem("athena-tour-session", "1"); sessionStorage.setItem("athena-welcomed", "1"); } catch (e) { /* ok */ }
    var next = function () { if (wantTour) setTimeout(start, 250); };
    if (wantIntro) { try { localStorage.setItem("athena-intro", "1"); } catch (e) { /* ok */ } intro(next); } else setTimeout(next, 450);
    return true;
  }
  /* ------------------------------------------------ the ATHENA intro (vector; the same animation as the social video) */
  var IN = T.intro || {}, MARK = '<svg class="ai-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3 L57 13.5 V33 C57 47.5 46.5 56.5 32 61 C17.5 56.5 7 47.5 7 33 V13.5 Z" fill="#0B1630" stroke="#C9A45C" stroke-width="2.4" stroke-linejoin="round"/><path d="M14.5 24 L17.5 9.5 L25.5 17.5 Z M49.5 24 L46.5 9.5 L38.5 17.5 Z" fill="#C9A45C"/><path d="M32 18.5 C25 13.5 14 15 14 27.5 C14 38.5 22.5 45 32 47 C41.5 45 50 38.5 50 27.5 C50 15 39 13.5 32 18.5 Z" fill="#14254D" stroke="#C9A45C" stroke-width="1.6"/><g fill="none" stroke="#C9A45C" stroke-width="1.8"><circle cx="24" cy="30" r="6.2"/><circle cx="40" cy="30" r="6.2"/></g><circle cx="24" cy="30" r="4" fill="#E2C27F"/><circle cx="40" cy="30" r="4" fill="#E2C27F"/><g class="ai-pup"><circle cx="24" cy="30" r="1.7" fill="#0B1630"/><circle cx="40" cy="30" r="1.7" fill="#0B1630"/><circle cx="24.9" cy="29" r=".7" fill="#fff"/><circle cx="40.9" cy="29" r=".7" fill="#fff"/></g><ellipse class="ai-l" cx="24" cy="30" rx="5.4" ry="0" fill="#14254D"/><ellipse class="ai-l" cx="40" cy="30" rx="5.4" ry="0" fill="#14254D"/><path d="M17.5 23.5 Q24.5 18.5 32 24 Q39.5 18.5 46.5 23.5" fill="none" stroke="#E2C27F" stroke-width="2" stroke-linecap="round"/><path d="M29.2 29.5 H34.8 L32 37.5 Z" fill="#C9A45C"/><path d="M23 51 L27.5 54 L32 51 L36.5 54 L41 51" fill="none" stroke="#C9A45C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/></svg>';
  var DUR = 5.0, LEN = 2.0;                                             /* KYB-50: the whole sequence (5 s of scenes) now plays in LEN = 2 seconds */
  function intro(then) {
    if (!IN.on || document.querySelector(".aintro")) { if (then) then(); return; }
    var calm = false; try { calm = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
    if (calm) { if (then) then(); return; }
    var el = document.createElement("div"); el.className = "aintro"; el.setAttribute("role", "img"); el.setAttribute("aria-label", "ATHENA Glaux");
    var tag = (IN.tag || []).map(function (x, i) { return (i ? "<b>·</b>" : "") + "<span>" + esc(x) + "</span>"; }).join("");
    el.innerHTML = '<svg class="ai-globe" viewBox="-100 -100 200 200" fill="none" stroke="#d4b06a" stroke-width=".55" aria-hidden="true"><g></g></svg>' +
      '<div class="ai-rule ai-r1"></div><div class="ai-rule ai-r2"></div><div class="ai-blk"><div style="position:relative;display:grid;place-items:center">' +
      '<div class="ai-halo"></div>' + MARK + '</div><div><p class="ai-wm">' + "ATHENA".split("").map(function (c) { return "<span>" + c + "</span>"; }).join("") +
      '</p><p class="ai-sub">GLAUX INTELLIGENCES</p><p class="ai-tag">' + tag + '</p></div></div><div class="ai-bar"></div>' +
      '<button type="button" class="ai-skip">' + esc(IN.skip || "Skip") + " &rsaquo;</button>";
    document.body.appendChild(el);
    var q = function (s) { return el.querySelector(s); }, qa = function (s) { return el.querySelectorAll(s); };
    var cl = function (x) { return Math.max(0, Math.min(1, x)); }, ease = function (x) { return 1 - Math.pow(1 - cl(x), 3); };
    var t0 = null, raf = 0, done = false, g = q(".ai-globe g"), mk = q(".ai-mark"), halo = q(".ai-halo"), lids = qa(".ai-l"), pup = q(".ai-pup");
    var letters = qa(".ai-wm span"), sub = q(".ai-sub"), tags = qa(".ai-tag span, .ai-tag b"), rules = qa(".ai-rule"), bar = q(".ai-bar");
    function frame(now) {
      if (done) return;
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000 * (DUR / LEN), r = ease(t / 1.0);
      rules.forEach(function (x) { x.style.width = (88 * r) + "vw"; });
      var m = ease((t - 0.2) / 0.9); mk.style.opacity = m; mk.style.transform = "translateY(" + (3 * (1 - m)) + "vmin) scale(" + (0.86 + 0.14 * m) + ")";
      var hp = ((t - 0.9) % 2.6 + 2.6) % 2.6 / 2.6; halo.style.opacity = t < 0.9 ? 0 : 0.35 * (1 - hp); halo.style.transform = "scale(" + (0.7 + 0.5 * hp) + ")";
      letters.forEach(function (s, i) { var a = ease((t - 0.75 - i * 0.11) / 0.45); s.style.opacity = a; s.style.transform = "translateY(" + (2.4 * (1 - a)) + "vmin)"; });
      var sb = ease((t - 1.6) / 0.55); sub.style.opacity = sb; sub.style.letterSpacing = (0.8 - 0.28 * sb) + "em";
      tags.forEach(function (s, i) { var a = ease((t - 2.1 - i * 0.22) / 0.45); s.style.opacity = a; s.style.transform = "translateY(" + (1.3 * (1 - a)) + "vmin)"; });
      var bl = function (c) { var d = Math.abs(t - c); return d < 0.13 ? 1 - d / 0.13 : 0; }, k = Math.max(bl(3.9), bl(4.3));
      lids.forEach(function (l) { l.setAttribute("ry", 6.4 * k); });
      pup.setAttribute("transform", "translate(" + (t > 4.7 ? Math.sin((t - 4.7) * 2.2) * 0.9 : 0) + ",0)");
      var ph = t * 0.35, gs = '<circle r="96"/><ellipse rx="96" ry="34"/><ellipse rx="96" ry="66"/><line x1="-96" x2="96"/><line y1="-96" y2="96" opacity=".4"/>';
      for (var j = 0; j < 6; j++) { var an = ph + j * Math.PI / 6; gs += '<ellipse rx="' + Math.abs(96 * Math.cos(an)).toFixed(2) + '" ry="96" opacity="' + (0.35 + 0.65 * Math.abs(Math.sin(an))).toFixed(2) + '"/>'; }
      g.innerHTML = gs;
      bar.style.width = (100 * cl(t / DUR)) + "%";
      if (t >= DUR) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }
    function finish() {
      if (done) return; done = true; cancelAnimationFrame(raf);
      document.removeEventListener("keydown", key, true);
      el.classList.add("out"); setTimeout(function () { el.remove(); if (then) then(); }, 560);
    }
    function key(ev) { if (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); finish(); } }
    el.addEventListener("click", finish);
    document.addEventListener("keydown", key, true);
    q(".ai-skip").focus({ preventScroll: true });
    raf = requestAnimationFrame(frame);
  }
  window.athenaIntro = intro;

  window.athenaTourAuto = auto;
  window.athenaTour = start;
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-tour-start]");
    if (b) { ev.preventDefault(); start(); return; }
    var pi = ev.target.closest && ev.target.closest("[data-intro-start]");
    if (pi) { ev.preventDefault(); var hp = document.getElementById("hp"); if (hp) hp.open = false; intro(null); }
  });
  function syncHelp() { var c = document.querySelector(".hptour input"); if (c) c.checked = get() === "on"; }
  function helpRow(hb) {
    if (!(T.steps || []).length && !IN.on) return;                       /* SPD-35: the words may still be on their way */
    var p = document.createElement("div"); p.className = "hptour";
    p.innerHTML = ((T.steps || []).length ? '<button type="button" data-tour-start>' + esc(T.take) + ' &rsaquo;</button>' : "") +
      (IN.on ? '<button type="button" data-intro-start>' + esc(IN.play) + " &rsaquo;</button>" : "") +
      ((T.steps || []).length ? '<label><input type="checkbox"> <span>' + esc(T.auto) + "</span></label>" : "");
    hb.appendChild(p);
    var c = p.querySelector("input"); if (c) { c.checked = get() === "on"; c.addEventListener("change", function () { put(c.checked ? "on" : "off"); }); }
  }
  var hb = document.querySelector("#hp .hpbox");
  if (hb) helpRow(hb);
  var wt = document.querySelector(".welc-tour"); if (wt) wt.hidden = false;
})();

/* WEB-1.13 - help panel and the living band. No libraries; still for readers who ask for less motion. */
(function () {
  "use strict";
  var hp = document.getElementById("hp");
  if (hp) {
    var x = hp.querySelector("[data-hpclose]");
    if (x) x.addEventListener("click", function () { hp.open = false; });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && hp.open) { hp.open = false; var s = hp.querySelector("summary"); if (s) s.focus(); } });
    document.addEventListener("click", function (ev) { if (hp.open && !hp.contains(ev.target)) hp.open = false; });
  }
  /* 27 Oct 2026 - the living band, second edition: sharp symbols (section icons, country flags, Bitcoin and Ether, market
     symbols, the ATHENA owl) drawn once at the screen's own sharpness and only moved after that; a scene per page; the
     partners' coins (Home and the market sections) open their sites when clicked. Symbols only - no prices, no numbers. */
  var box = document.querySelector(".amb");
  if (!box || !box.querySelector("canvas").getContext) return;
  var cv = box.querySelector("canvas"), cx = cv.getContext("2d"), mode = box.getAttribute("data-mode") || "news";
  var root = box.getAttribute("data-root") || "";
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = Math.min(3, window.devicePixelRatio || 1), on = true, raf = 0, t = 0, P = [], X = {}, COINS = [], ATH = null, mx = -999, my = -999, C = {}, SPR = {}, EV = [], NAMES = {}, PRE = "", LIVE = false, mt = 0, touch = false, HOT = null, HOTT = 0, FR = 0,
    LOW = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
  var ICON = {1: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z", 2: "M4 19h16M6 15l4-4 3 3 5-6M15 8h3v3",
    3: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.8 1.2 2.7 2.5 3-.3-3 0-5.5 0-8z", 4: "M3 16l2 4h14l2-4zM6 16v-5h12v5M9 11V7h6v4M12 7V4",
    5: "M7 7h10v10H7zM10 10h4v4h-4zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3", 6: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
    7: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9", 8: "M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z",
    9: "M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", 10: "M12 4l9 16H3zM12 10v4M12 17v.5",
    stk: "M4 20V10M9 20V6M14 20v-8M19 20V4", oil: "M12 3c3 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6.5 6-11z", gold: "M3 18l3-7h12l3 7zM8 11l2-5h4l2 5",
    ship: "M3 15l2 4h14l2-4zM7 15v-4h10v4M12 11V5l4 3", beacon: "M12 3v3M5 6l2 2M19 6l-2 2M8 21h8M9 21v-6a3 3 0 0 1 6 0v6"};
  var FLAGS = ["grc", "cyp", "tur", "usa", "gbr", "deu", "fra", "ita", "esp", "ukr", "rus", "chn", "isr", "irn", "egy", "sau", "jpn", "ind"], FL = {}, FLK = [];
  function img(src) { var i = new Image(); i.decoding = "async"; i.onload = function () { SPR = {}; if (still) start(); }; i.src = src; return i; }
  FLAGS.forEach(function (k) { FL[k] = img(root + "assets/cf/" + k + ".svg"); FLK.push("f:" + k); });
  function flagImg(c) { return FL[c] || (FL[c] = img(root + "assets/cf/" + c + ".svg")); }   /* BAND-55: any country's flag, loaded when first needed */
  var OWL = img(root + "assets/athena_mark.svg"), PART = [], SYMS = { btc: true, eth: true, x: [] }, SC = {};
  try { SC = JSON.parse(box.getAttribute("data-sc") || "{}"); } catch (e) { SC = {}; }
  /* LOOK-36: every symbol is a designed badge - a section in its own colour, the market symbols in theirs */
  var MC = { stk: "#2E9E6B", oil: "#B45309", gold: "#D4A017", ship: "#3A8DDB", beacon: "#D92D3A", eur: "#3A6FD8", usd: "#15803D", etf: "#8E5BE8" };
  function hx(c) { c = String(c || "#888").replace("#", ""); if (c.length === 3) c = c.replace(/./g, "$&$&"); var n = parseInt(c, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(c, w, k) { var a = hx(c), b = w ? [255, 255, 255] : [0, 0, 0]; return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(",") + ")"; }
  function badge(g, r, col) {                                            /* lit from the top left, a lighter rim, a soft gloss */
    var gr = g.createRadialGradient(-r * .35, -r * .45, r * .1, 0, 0, r * 1.05); gr.addColorStop(0, mix(col, 1, .38)); gr.addColorStop(.55, col); gr.addColorStop(1, mix(col, 0, .3));
    g.save(); g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = r * .35; g.shadowOffsetY = r * .08;
    g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.fillStyle = gr; g.fill(); g.restore();
    g.beginPath(); g.arc(0, 0, r - .6, 0, 6.2832); g.lineWidth = 1.2; g.strokeStyle = mix(col, 1, .55); g.globalAlpha = .9; g.stroke(); g.globalAlpha = 1;
    g.save(); g.beginPath(); g.arc(0, 0, r - 1.5, 0, 6.2832); g.clip(); g.globalAlpha = .16; g.fillStyle = "#fff"; g.beginPath(); g.ellipse(0, -r * .55, r * .85, r * .5, 0, 0, 6.2832); g.fill(); g.restore(); }
  try { SYMS = JSON.parse(box.getAttribute("data-sym") || "{}"); } catch (e) {}
  var XS = (SYMS.x || []).map(function (s) { return img(s.src); });
  function crypto() { var a = []; if (SYMS.btc !== false) a.push("btc"); if (SYMS.eth !== false) a.push("eth"); XS.forEach(function (_, i) { a.push("x:" + i); }); return a; }
  function cover(g, im, x, y, r) { var w = im.naturalWidth || 1, h = im.naturalHeight || 1, s = Math.max(2 * r / w, 2 * r / h); g.drawImage(im, x - w * s / 2, y - h * s / 2, w * s, h * s); }
  try { PART = JSON.parse(box.getAttribute("data-coins") || "[]"); } catch (e) { PART = []; }
  PART.forEach(function (p) { p.im = img(p.src); });
  function css(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  /* BAND-56 (5 Nov 2026): the band is always a night panel - gold links, glowing risk colours - in the light and the dark theme alike */
  function colours() { C = { gold: "#E2C27F", ink: "#F3EBD8", muted: "#8E9CC0", rule: "#2B3F73", paper: "#10204A", up: "#34D399", down: "#FF4D5E" };
    C.risk = ["#E2C27F", "#FFB43B", "#FF7A3D", "#FF4D5E"]; C.acc = { graph: "#5ED0E6", pins: "#6EA8FF", sea: "#2DD4BF", radar: "#B794F6", markets: "#34D399", beacons: "#FF7A3D" }[mode] || "#E2C27F"; SPR = {}; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function size() { var r = box.getBoundingClientRect(); W = r.width; H = r.height; if (W < 60 || H < 20) { W = Math.max(W, 0); } cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function count(per, lo, hi) { return Math.max(lo || 10, Math.min(hi || 40, Math.round(W / per))); }
  function RR() { return W < 640 ? 8.5 : 9.5; }
  function line(a, b, c, w, al) { cx.globalAlpha = al; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.strokeStyle = c; cx.lineWidth = w; cx.stroke(); }
  function ring(x, y, r, c, w, al) { cx.globalAlpha = al; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.strokeStyle = c; cx.lineWidth = w; cx.stroke(); }
  function dot(x, y, r, c, al) { cx.globalAlpha = al; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fillStyle = c; cx.fill(); }
  /* BAND-55 (3 Nov 2026): nothing ever stops or settles. Every symbol keeps its own speed (never below a walking pace), turns a
     little at random and bounces at the walls, so the whole band stays in motion over its full width. The pointer only nudges
     symbols while it is actually moving (never on a touch screen, never when it rests), and gently. */
  function drift(p, sp, pad, keep) {
    if (p === (HOT && HOT.p)) return;                                     /* the one being pointed at holds still */
    var v = Math.hypot(p.vx, p.vy) || .2, a = Math.atan2(p.vy, p.vx) + (Math.random() - .5) * .05; v = Math.max(.13, Math.min(.34, v));
    var sx = Math.cos(a) >= 0 ? 1 : -1, off = Math.max(-.45, Math.min(.45, Math.atan2(Math.sin(a), Math.abs(Math.cos(a)))));   /* mostly sideways, never upright */
    a = sx > 0 ? off : Math.PI - off; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
    p.x += p.vx * sp * .9; p.y += p.vy * sp * .9; var ex = Math.max(pad, 14);
    /* at a wall the symbol always turns INWARD (a plain "flip" sent the ones the neighbours had shoved past the wall back out again:
       they jittered there and the whole band slowly piled up against one wall) */
    if (p.x < ex) { p.vx = Math.abs(p.vx); p.x = ex; } else if (p.x > W - ex) { p.vx = -Math.abs(p.vx); p.x = W - ex; }
    if (p.y < pad) { p.vy = Math.abs(p.vy); p.y = pad; } else if (p.y > H - pad) { p.vy = -Math.abs(p.vy); p.y = H - pad; }
    if (keep || !LIVE) return; var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
    if (d2 < 4900) { var d = Math.sqrt(d2 + 1), k = 1 - d / 70; p.x += dx / d * k * .9; p.y += dy / d * k * .9; } }
  /* LOOK-31 (30 Oct 2026): symbols keep a gap between them - the coins and the emblem push the others gently away */
  function apart(list, gap) { for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) { var a = list[i], b = list[j]; if (a.x == null || b.x == null) continue;
      var dx = b.x - a.x, dy = b.y - a.y; if (!dx && !dy) { dx = (i % 2 ? 1 : -1) * .5; dy = .3; } var d = Math.sqrt(dx * dx + dy * dy) || .01, g = (a.r || 0) + (b.r || 0) + gap; if (d >= g) continue; var k = (g - d) / d * .5; dx *= k; dy *= k;
      if (!a.fixed) { a.x -= dx; a.y -= dy; } if (!b.fixed) { b.x += dx; b.y += dy; }
      /* BAND-55: two symbols meeting head-on bounce off each other (they only used to be pushed apart while still heading at each other,
         so a crowd pressed together and froze in place - the "everything gathers on one side" effect) */
      if (a.vx != null && b.vx != null && !a.fixed && !b.fixed) { var nx = (b.x - a.x) / d, ny = (b.y - a.y) / d, rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rel < 0) { a.vx += rel * nx; a.vy += rel * ny; b.vx -= rel * nx; b.vy -= rel * ny; } } } }
  /* every symbol is drawn once into a small sprite at the screen's own sharpness; the animation only moves the sprites */
  function sprite(key, r, draw) { var k = key + "|" + r; if (SPR[k]) return SPR[k]; var c = document.createElement("canvas"), s = Math.ceil((r * 2 + 4) * dpr); c.width = c.height = s;
    var g = c.getContext("2d"); g.scale(dpr, dpr); g.translate(r + 2, r + 2); draw(g, r); return SPR[k] = c; }
  function put(s, x, y, r, al) { cx.globalAlpha = al == null ? 1 : al; cx.drawImage(s, x - r - 2, y - r - 2, s.width / dpr, s.height / dpr); }
  function disc(g, r, fill, edge) { g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.fillStyle = fill; g.fill(); if (edge) { g.lineWidth = 1.3; g.strokeStyle = edge; g.stroke(); } }
  function glyph(g, r, d, col, w) { var s = r * 1.25 / 24; g.save(); g.scale(s, s); g.translate(-12, -12); g.lineWidth = w || 1.9; g.lineCap = g.lineJoin = "round"; g.strokeStyle = col; g.stroke(new Path2D(d)); g.restore(); }
  function txt(g, r, s, size, col) { g.font = "800 " + size + "px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, 0, r * .05); }
  function sym(k, r) { return sprite(k, r, function (g, r) {
    if (k.indexOf("f:") === 0) { var f = flagImg(k.slice(2)); disc(g, r, C.paper, C.rule); g.save(); g.beginPath(); g.arc(0, 0, r - 2, 0, 6.2832); g.clip();
      if (f && f.complete && f.naturalWidth) g.drawImage(f, -(r - 2) * 1.34, -(r - 2), (r - 2) * 2.68, (r - 2) * 2); g.restore(); return; }
    if (k.indexOf("x:") === 0) { var xi = XS[+k.slice(2)]; disc(g, r, C.paper, C.gold); if (xi && xi.complete && xi.naturalWidth) { g.save(); g.beginPath(); g.arc(0, 0, r - 1, 0, 6.2832); g.clip(); cover(g, xi, 0, 0, r - 1); g.restore(); } return; }
    if (k === "btc") { disc(g, r, "#f7931a"); g.rotate(-.24); txt(g, r, "₿", r * 1.2, "#fff"); return; }
    if (k === "eth") { disc(g, r, "#627eea"); var s = r / 12; g.scale(s, s); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, -8); g.lineTo(5, .6); g.lineTo(0, 3.4); g.lineTo(-5, .6); g.closePath(); g.fill();
      g.globalAlpha = .8; g.beginPath(); g.moveTo(0, 4.6); g.lineTo(5, 1.8); g.lineTo(0, 8.6); g.lineTo(-5, 1.8); g.closePath(); g.fill(); return; }
    badge(g, r, SC[k] || MC[k] || C.gold);
    if (k === "etf") return txt(g, r, "ETF", r * .62, "#fff");
    if (k === "eur" || k === "usd") return txt(g, r, k === "eur" ? "€" : "$", r * 1.05, "#fff");
    glyph(g, r, ICON[k], "#fff", 2.1); }); }
  function evsym(k, col, r) { return sprite("ev" + k + col, r, function (g, r) { badge(g, r, col); glyph(g, r, ICON[k], "#fff", 2.3); }); }
  /* 30 Oct 2026: the ATHENA emblem (the header's own logo) in the band - partner-coin size, on a gold-rimmed disc, flashing */
  function CR() { return W < 640 ? 13 : 17; }
  /* LOOK-36: the ATHENA owl drawn in vector (the same shapes as the logo) and alive inside its circle - it looks around, blinks,
     breathes, and two gold arcs turn slowly inside the rim. Still for readers who ask for reduced motion. */
  var OP = { shield: new Path2D("M32 3 L57 13.5 V33 C57 47.5 46.5 56.5 32 61 C17.5 56.5 7 47.5 7 33 V13.5 Z"), ears: new Path2D("M13 27 L16.5 9 L26.5 18.5 Z M51 27 L47.5 9 L37.5 18.5 Z"),
    head: new Path2D("M32 18.5 C25 13.5 14 15 14 27.5 C14 38.5 22.5 45 32 47 C41.5 45 50 38.5 50 27.5 C50 15 39 13.5 32 18.5 Z"),
    brow: new Path2D("M17.5 23.5 Q24.5 18.5 32 24 Q39.5 18.5 46.5 23.5"), beak: new Path2D("M29 41 H35 L32 48 Z"), chev: new Path2D("M23 51 L27.5 54 L32 51 L36.5 54 L41 51") };
  var OG = "#C9A45C", OL = "#E2C27F", ON = "#0B1630", OH = "#14254D";
  function owlVec(x, y, r, col) {
    var tt = still ? 0 : t, look = still ? 0 : Math.sin(tt / 55) * 1.7 + Math.sin(tt / 23) * .4, bl = (tt % 260), lid = bl < 9 ? Math.sin(bl / 9 * Math.PI) : 0, wb = tt % 520, wk = still ? 0 : (wb > 300 && wb < 332 ? Math.sin((wb - 300) / 32 * Math.PI) : 0);; var sb = tt - BLKT; if (sb >= 0 && sb < 9) lid = Math.max(lid, Math.sin(sb / 9 * Math.PI));   /* the left eye winks now and then; a blink when a new headline enters the ticker */
    var breathe = 1 + (still ? 0 : Math.sin(tt / 34) * .025), tilt = still ? 0 : Math.sin(tt / 90) * .06;
    cx.save(); cx.globalAlpha = 1; cx.translate(x, y);
    var bg = cx.createRadialGradient(-r * .3, -r * .4, r * .1, 0, 0, r); bg.addColorStop(0, "#1d3266"); bg.addColorStop(1, ON);   /* the night-blue disc */
    cx.beginPath(); cx.arc(0, 0, r, 0, 6.2832); cx.fillStyle = bg; cx.fill();
    cx.lineWidth = Math.max(1.6, r * .09); cx.strokeStyle = col; cx.stroke();
    cx.save(); cx.beginPath(); cx.arc(0, 0, r - 1, 0, 6.2832); cx.clip();
    var a0 = still ? 0 : tt / 60; cx.lineWidth = Math.max(1, r * .06); cx.strokeStyle = OL; cx.globalAlpha = .55;   /* two arcs turning inside the rim */
    cx.beginPath(); cx.arc(0, 0, r * .86, a0, a0 + 1.1); cx.stroke(); cx.beginPath(); cx.arc(0, 0, r * .86, a0 + Math.PI, a0 + Math.PI + 1.1); cx.stroke();
    cx.globalAlpha = .12 + (still ? 0 : .08 * Math.sin(tt / 20)); cx.fillStyle = "#fff"; cx.beginPath(); cx.ellipse(0, -r * .55, r * .8, r * .38, 0, 0, 6.2832); cx.fill();
    cx.globalAlpha = 1; cx.rotate(tilt); var s = r * 1.42 / 64 * breathe; cx.scale(s, s); cx.translate(-32, -32);
    cx.fillStyle = OG; cx.fill(OP.ears);                                                       /* LOGO-38: the new owl - an eye ring, and a rising line in the right pupil */
    cx.shadowColor = OL; cx.shadowBlur = 5;
    [22.5, 41.5].forEach(function (ex, k) { cx.beginPath(); cx.arc(ex, 31, 9, 0, 6.2832); cx.lineWidth = 2.2; cx.strokeStyle = OL; cx.stroke();
      cx.beginPath(); cx.arc(ex, 31, 5.2, 0, 6.2832); cx.fillStyle = OL; cx.fill();
      if (k === 0) { cx.beginPath(); cx.arc(ex + look * .6, 31, 2.2, 0, 6.2832); cx.fillStyle = ON; cx.fill(); }
      else { cx.beginPath(); cx.moveTo(37.6, 33.6); cx.lineTo(40, 31.6); cx.lineTo(41.6, 32.6); cx.lineTo(44, 28.6); cx.lineWidth = 1.7; cx.lineCap = "round"; cx.lineJoin = "round"; cx.strokeStyle = ON; cx.stroke(); }
      var ld = k === 0 ? Math.max(lid, wk) : lid; if (ld > 0) { cx.beginPath(); cx.ellipse(ex, 31 - 9 * (1 - ld), 9.4, 9.4 * ld + .01, 0, 0, 6.2832); cx.fillStyle = ON; cx.fill(); } });
    cx.shadowBlur = 0;
    cx.fillStyle = OG; cx.fill(OP.beak);
    cx.restore(); cx.restore(); }
  function emblem(x, y, r, col, fl) {
    var f = fl == null ? .5 + .5 * Math.sin(t / 7) : fl;                                       /* the flash */
    cx.globalAlpha = .18 + .32 * f; var gr = cx.createRadialGradient(x, y, r * .5, x, y, r * 2.3); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r * 2.3, 0, 6.2832); cx.fill();
    ring(x, y, r + 3 + ((t % 80) / 80) * 16, col, 2, .5 * (1 - (t % 80) / 80));               /* a ring goes out every ~1.3 s */
    owlVec(x, y, r, col); }
  function owl(x, y, r, col) { emblem(x, y, Math.max(r, CR()), col); }

  /* BAND-57 (5 Nov 2026): a dotted world behind the nodes (events sit where they happened), a radar beam from the owl that pings what it
     passes, hexagon / bracket frames for the highest risks, arcs between the countries of an event, small readouts for the top three,
     and two slow layers of far dots. Reduced motion: the same picture, still. */
  var CO = null, WAVES = [], TK = {}, BLKT = -999, GEO = null, MAPC = null, MAPK = "", SW = 0, STARS = [], GR0 = 75, GR1 = -57;
  function geoInit(m, r) { try { var q = atob(m), b = new Uint8Array(q.length); for (var i = 0; i < q.length; i++) b[i] = q.charCodeAt(i); GEO = { b: b, r0: r[0], r1: r[1] }; MAPC = null; if (still) start(); } catch (e) {} }
  function land(lat, lon) { var row = Math.floor(GEO.r0 - lat), col = Math.floor(lon + 180); if (row < 0 || row >= GEO.r0 - GEO.r1 || col < 0 || col > 359) return 0; var ix = row * 360 + col; return (GEO.b[ix >> 3] >> (7 - (ix & 7))) & 1; }
  function buildMap() { if (!GEO) return; var key = W + "x" + H + "x" + dpr; if (MAPC && MAPK === key) return; MAPK = key;
    var c = document.createElement("canvas"); c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); var g = c.getContext("2d"); g.scale(dpr, dpr);
    var st = W < 640 ? 5 : 6, cols = Math.max(20, Math.floor(W / st)), rows = Math.max(6, Math.floor((H - 20) / st)), dl = (GR0 - GR1) / rows, dn = 360 / cols;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) { var lat0 = GR0 - j * dl, lon0 = -180 + i * dn, n = 0;
      for (var a = 0; a < 3; a++) for (var b = 0; b < 2; b++) if (land(lat0 - dl * (a + .5) / 3, lon0 + dn * (b + .5) / 2)) n++;
      g.beginPath(); g.arc((i + .5) / cols * W, 10 + (j + .5) / rows * (H - 20), n ? 1.15 : .55, 0, 6.2832); g.fillStyle = n ? "rgba(226,194,127," + (.14 + n * .05) + ")" : "rgba(226,194,127,.07)"; g.fill(); }
    MAPC = c; }
  function ll(g) { return { x: (g[1] + 180) / 360 * W, y: 10 + (GR0 - g[0]) / (GR0 - GR1) * (H - 20) }; }
  function homeOf(e, p, placed) { if (!e.g || !e.g[0]) return null; var h = ll(e.g[0]), step = p.r * 2 + 6, n = 0, k;
    for (k = 0; k < placed.length; k++) if (Math.hypot(placed[k].x - h.x, placed[k].y - h.y) < step) n++;
    if (n) { h.x += (n % 2 ? 1 : -1) * Math.ceil(n / 2) * step; h.y += (n % 3 - 1) * 6; }
    h.x = Math.max(24, Math.min(W - 24, h.x)); h.y = Math.max(20, Math.min(H - 20, h.y)); placed.push(h); return h; }
  function tagTop() { var l = P.filter(function (p) { return p.evt && p.home; }).sort(function (a, b) { return b.evt.r - a.evt.r; });
    l.forEach(function (p, i) { p.tagi = i; p.tag = i < 3 ? String((p.evt.f || [""])[0] || "").toUpperCase() + " R" + p.evt.r : ""; }); }
  function stars() { if (LOW) return; if (!STARS.length || STARS.w !== W) { STARS = []; STARS.w = W; for (var i = 0; i < 70; i++) STARS.push({ x: Math.random() * W, y: Math.random() * H, v: i % 3 ? .05 : .13, r: i % 3 ? .6 : 1, a: i % 3 ? .22 : .34 }); }
    STARS.forEach(function (s) { dot(((s.x - (still ? 0 : t * s.v)) % W + W) % W, s.y, s.r, "#BFD0FF", s.a); }); }
  function radar() { if (mode !== "news" || !ATH) return; SW = still ? 5.2 : (t * .011) % 6.2832; var R = Math.max(W, 600);
    ring(ATH.x, ATH.y, 46, C.gold, .8, .14); ring(ATH.x, ATH.y, 100, C.gold, .8, .1); ring(ATH.x, ATH.y, 180, C.gold, .8, .07);
    cx.save(); cx.globalCompositeOperation = "lighter"; cx.globalAlpha = 1;
    if (cx.createConicGradient) { var g = cx.createConicGradient(SW - .75, ATH.x, ATH.y); g.addColorStop(0, "rgba(226,194,127,0)"); g.addColorStop(.119, "rgba(226,194,127,.30)"); g.addColorStop(.1195, "rgba(226,194,127,0)"); g.addColorStop(1, "rgba(226,194,127,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
    else { cx.globalAlpha = .1; cx.fillStyle = C.gold; cx.beginPath(); cx.moveTo(ATH.x, ATH.y); cx.arc(ATH.x, ATH.y, R, SW - .5, SW); cx.closePath(); cx.fill(); }
    cx.globalAlpha = .55; cx.lineWidth = 1.2; cx.strokeStyle = "#FFF1C9"; cx.beginPath(); cx.moveTo(ATH.x, ATH.y); cx.lineTo(ATH.x + Math.cos(SW) * R, ATH.y + Math.sin(SW) * R); cx.stroke(); cx.restore(); }
  function back() { stars(); if (GEO && (mode === "news" || mode === "pins" || mode === "sea")) { buildMap(); cx.globalAlpha = 1; cx.drawImage(MAPC, 0, 0, W, H); } if (mode === "news") radar(); }
  function rr(x, y, w, h, r) { cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, r); else cx.rect(x, y, w, h); }
  function sweepGlow(x, y, a, col) { if (!cx.createConicGradient) return; cx.save(); cx.globalCompositeOperation = "lighter"; var g = cx.createConicGradient(a - .75, x, y); g.addColorStop(0, col + "0)"); g.addColorStop(.119, col + ".30)"); g.addColorStop(.1195, col + "0)"); g.addColorStop(1, col + "0)"); cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.restore(); }
  function ticker() { if (LOW || !EV.length) return; cx.save(); cx.font = "600 10.5px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"; cx.textBaseline = "middle";
    if (!TK.items || TK.w0 !== W) { TK.items = []; var x0 = 0; EV.forEach(function (e) { var q = String(e.t || "").slice(0, 56), w = cx.measureText(q).width + 30; TK.items.push({ s: q, w: w, x: x0, lvl: lvlOf(e.r) }); x0 += w + 26; }); TK.tot = Math.max(x0, W + 40); TK.w0 = W; }
    cx.globalAlpha = 1; var g = cx.createLinearGradient(0, H - 17, 0, H); g.addColorStop(0, "rgba(6,12,30,0)"); g.addColorStop(1, "rgba(6,12,30,.72)"); cx.fillStyle = g; cx.fillRect(0, H - 17, W, 17);
    var sp = still ? 0 : t * .4, y = H - 7;
    TK.items.forEach(function (it) { var x = ((it.x - sp) % TK.tot + TK.tot) % TK.tot; if (!still && x > W - .4 && x <= W) BLKT = t;
      [x, x - TK.tot].forEach(function (xx) { if (xx > W || xx + it.w < 0) return; dot(xx + 4, y, 2.2, C.risk[it.lvl], .95); cx.globalAlpha = .78; cx.fillStyle = "#E8DDC0"; cx.textAlign = "left"; cx.fillText(it.s, xx + 12, y + .5); }); }); cx.restore(); }

  function scan(p, col, r) { if (still || !ATH || mode !== "news") return;
    if (p.pg > 0) { p.pg--; var k = p.pg / 50; ring(p.x, p.y, r + 4 + (1 - k) * 18, col, 1.6, .55 * k); glow(p.x, p.y, r * 2.2, col, .5 * k); return; }
    var a = Math.atan2(p.y - ATH.y, p.x - ATH.x); if (a < 0) a += 6.2832; if ((SW - a + 6.2832) % 6.2832 < .06) p.pg = 50; }
  function hex(x, y, r, col, rot) { cx.globalAlpha = .9; cx.lineWidth = 1.5; cx.strokeStyle = col; cx.beginPath(); for (var k = 0; k < 6; k++) { var a = rot + k * 1.0472; if (k) cx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else cx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } cx.closePath(); cx.stroke(); }
  function brackets(x, y, r, col) { var L = r * .55; cx.globalAlpha = .95; cx.lineWidth = 1.6; cx.strokeStyle = col; cx.beginPath();
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { cx.moveTo(x + c[0] * r, y + c[1] * (r - L)); cx.lineTo(x + c[0] * r, y + c[1] * r); cx.lineTo(x + c[0] * (r - L), y + c[1] * r); }); cx.stroke(); }
  function arcs() { if (LOW) return; P.forEach(function (p) { if (!p.evt || !p.g2 || !p.home) return;
      var ph = ((t + p.src * 37) % 320) / 320, pr = still ? 1 : Math.min(1, ph / .45), fd = still ? .6 : (ph > .6 ? Math.max(0, 1 - (ph - .6) / .4) : 1);
      var x1 = p.x, y1 = p.y, x2 = p.g2.x, y2 = p.g2.y, qx = (x1 + x2) / 2, qy = Math.max(2, Math.min(y1, y2) - Math.abs(x2 - x1) * .16 - 6), col = C.risk[p.lvl], N = 28, n = Math.max(1, Math.round(N * pr)), hx = x1, hy = y1;
      cx.save(); cx.globalCompositeOperation = "lighter"; cx.globalAlpha = .75 * fd; cx.lineWidth = 1.5; cx.strokeStyle = col; cx.beginPath();
      for (var k = 0; k <= n; k++) { var u = k / N, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u, X = a * x1 + b * qx + c * x2, Y = a * y1 + b * qy + c * y2; if (k) cx.lineTo(X, Y); else cx.moveTo(X, Y); hx = X; hy = Y; }
      cx.stroke(); cx.restore(); dot(hx, hy, 2.4, "#FFFFFF", .9 * fd); glow(hx, hy, 9, col, .6 * fd);
      if (pr >= 1) { ring(x2, y2, 3 + ((t * .1) % 6), col, 1.3, .6 * fd); dot(x2, y2, 2, col, .9 * fd); } }); }
  function tags() { if (W < 640 || LOW) return; cx.save(); cx.font = "600 9.5px ui-monospace,SFMono-Regular,Consolas,monospace"; cx.textBaseline = "middle"; cx.shadowColor = "#060c1e"; cx.shadowBlur = 3;
    P.forEach(function (p) { if (!p.tag) return; var up = p.tagi % 2 === 0 ? p.y > 42 : p.y > H - 24; cx.textAlign = "center"; cx.globalAlpha = .95; cx.fillStyle = C.risk[p.lvl]; cx.fillText(p.tag, Math.max(34, Math.min(W - 34, p.x)), p.y + (up ? -1 : 1) * (p.r + 12)); }); cx.restore(); }

  /* the partners' coins: gold rim, a soft breathing glow; they never run from the pointer and stop while pointed at */
  function coins() { var rc = CR(); COINS = PART.map(function (p, i) { return { p: p, x: W * (i ? .72 : .3), y: H * (i ? .42 : .55), vx: i ? -.18 : .22, vy: i ? -.07 : .08, ph: i * Math.PI, r: rc }; });
    ATH = { x: W * .5, y: H * .5, vx: 0, vy: 0, r: rc, fixed: true }; }
  function drawCoins(links) {
    COINS.forEach(function (c) { drift(c, c.hot ? 0 : .8, c.r + 4, true); c.ph += .03;
      if (links) P.forEach(function (p) { if (p.x == null) return; var d = Math.hypot(c.x - p.x, c.y - p.y); if (d < 110) line(c, p, C.gold, 1.1, (1 - d / 110) * .6); }); });
    COINS.forEach(function (c) { var im = c.p.im; if (!im.complete || !im.naturalWidth) return; var g = .5 + .5 * Math.sin(c.ph), r = c.r * (c.hot ? 1.12 : 1);
      cx.globalAlpha = (.22 + .18 * g) * (c.hot ? 1.3 : 1); var gr = cx.createRadialGradient(c.x, c.y, c.r * .6, c.x, c.y, c.r * 2.1); gr.addColorStop(0, C.gold); gr.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = gr; cx.beginPath(); cx.arc(c.x, c.y, c.r * 2.1, 0, 6.2832); cx.fill();
      dot(c.x, c.y, r + 1.6, C.gold, 1); cx.save(); cx.beginPath(); cx.arc(c.x, c.y, r, 0, 6.2832); cx.clip(); cover(cx, im, c.x, c.y, r); cx.restore(); }); }
  function drawMark() { if (!ATH) return; emblem(ATH.x, ATH.y, ATH.r, C.gold); }
  function hit(x, y) {
    for (var i = 0; i < COINS.length; i++) { var c = COINS[i]; if (Math.hypot(x - c.x, y - c.y) <= c.r + 6) return { coin: c }; }
    for (i = P.length - 1; i >= 0; i--) { var p = P[i], e = p.evt || (p.fl && p.fl.evt) || (p.ev > 0 && p.evref); if (!e) continue;
      if (Math.hypot(x - p.x, y - p.y) <= (p.r || RR()) + (touch ? 12 : 6)) return { ev: e, p: p }; }
    return null; }
  /* BAND-55: today's real events - a section badge in the event's risk colour, its countries' flags tied to it by a line,
     a label on the pointer, a link to the event page, and a plain list for screen readers */
  function lvlOf(r) { return r >= 8 ? 3 : r >= 6 ? 2 : r >= 4 ? 1 : 0; }
  function mkEv() { mkEv0(); tagTop(); }
  function mkEv0() { if (mode !== "news" || !EV.length) return; var r = RR(); P = P.filter(function (p) { return !p.evt && !p.fl; });
    P = P.slice(0, Math.round(P.length * .55));                           /* room for the real events: fewer generic symbols */
    var placed = []; EV.slice(0, count(90, 6, 12)).forEach(function (e, i) {
      var p = { x: rnd(24, W - 24), y: rnd(18, H - 18), vx: rnd(.14, .3) * (i % 2 ? 1 : -1), vy: rnd(-.1, .1), evt: e, lvl: lvlOf(e.r), k: String(e.c), r: r + 3, src: 40 + i, ev: 0 };
      P.push(p); var h = homeOf(e, p, placed); if (h) { p.home = h; p.fixed = true; p.x = h.x; p.y = h.y; } if (e.g && e.g[1]) p.g2 = ll(e.g[1]);
      (e.f || []).forEach(function (f, j) { P.push({ x: p.x + rnd(-40, 40), y: rnd(18, H - 18), vx: rnd(.14, .3) * (Math.random() < .5 ? 1 : -1), vy: rnd(-.1, .1),
        k: "f:" + f, fl: p, r: r - 1, src: 80 + i * 2 + j, ev: 0 }); }); }); }
  function tie(f) { var e = f.fl, dx = e.x - f.x, dy = e.y - f.y, d = Math.hypot(dx, dy) || 1; if (d > 78) { f.x += dx / d * .25; f.y += dy / d * .25; }
    line(f, e, C.risk[e.lvl], 1.2, Math.max(.12, .55 * (1 - d / 160))); }
  function glow(x, y, R, col, al) { if (!isFinite(x + y + R)) return; cx.save(); cx.globalCompositeOperation = "lighter"; cx.globalAlpha = al; var g = cx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, R, 0, 6.2832); cx.fill(); cx.restore(); }
  function hud(x, y, r, col, seed, lvl) { var a = (still ? seed : t * (.018 + lvl * .01) + seed) % 6.2832; cx.lineCap = "round"; ring(x, y, r, col, .8, .22);
    cx.globalAlpha = .9; cx.lineWidth = 1.5; cx.strokeStyle = col; cx.beginPath(); cx.arc(x, y, r, a, a + 1.0); cx.stroke(); cx.beginPath(); cx.arc(x, y, r, a + 3.1416, a + 3.1416 + .55); cx.stroke(); cx.lineCap = "butt"; }
  function drawEvt(p) { var col = C.risk[p.lvl], ph = ((t + p.src * 17) % 100) / 100, hot = HOT && HOT.p === p;
    glow(p.x, p.y, p.r * 2.6, col, .26 + .1 * p.lvl + (still ? 0 : .06 * Math.sin(t / 18 + p.src))); if (p.lvl >= 3) { hex(p.x, p.y, p.r + 7, col, still ? 0 : t * .008); hud(p.x, p.y, p.r + 3, col, p.src, 2); } else if (p.lvl === 2) { brackets(p.x, p.y, p.r + 6, col); hud(p.x, p.y, p.r + 3.5, col, p.src, 2); } else hud(p.x, p.y, p.r + 4.5, col, p.src, p.lvl);
    scan(p, col, p.r);
    if (p.lvl >= 2 || hot) ring(p.x, p.y, p.r + 3 + ph * 11, col, 1.4, (hot ? .7 : .38) * (1 - ph));
    put(evsym(p.k, col, p.r), p.x, p.y, p.r, 1); if (hot) ring(p.x, p.y, p.r + 3, C.gold, 2, 1); }
  function drawFl(p) { var hot = HOT && (HOT.p === p || HOT.p === p.fl); put(sym(p.k, p.r), p.x, p.y, p.r, hot ? 1 : .95); }
  function label(p, e) { var s = e.t || "", mw = Math.min(W - 16, 420), fs = W < 640 ? 11.5 : 12.5; cx.font = "600 " + fs + "px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"; cx.textAlign = "left"; cx.textBaseline = "middle";
    var cut = false; while (cx.measureText(s).width > mw - 18 && s.length > 8) { s = s.slice(0, -2); cut = true; } if (cut) s = s.trim() + "\u2026";
    var w = cx.measureText(s).width + 18, h = 24, x = Math.max(6, Math.min(W - w - 6, p.x - w / 2)), y = p.y > H / 2 ? Math.max(3, p.y - (p.r || 10) - h - 6) : Math.min(H - h - 3, p.y + (p.r || 10) + 6);
    cx.globalAlpha = .97; cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, 7); else cx.rect(x, y, w, h); cx.fillStyle = C.paper; cx.fill(); cx.lineWidth = 1.2; cx.strokeStyle = C.gold; cx.stroke();
    cx.fillStyle = C.ink; cx.fillText(s, x + 9, y + h / 2 + .5); cx.globalAlpha = 1; }
  function evUrl(e) { return PRE + "event/" + e.id + ".html"; }
  var FOCUS = { en: "In focus now:", el: "Στο επίκεντρο τώρα:", es: "En foco ahora:", fr: "À la une :", de: "Aktuell im Fokus:", ru: "Сейчас в центре внимания:", ar: "في الواجهة الآن:" },
      TOPL = { en: "Top events now", el: "Τα σημαντικότερα τώρα" };
  function focusLine() { var cap = document.querySelector(".ambcap"); if (!cap || !EV.length || (mode !== "news" && mode !== "graph")) return;
    var n = {}, lg = document.documentElement.lang || "en"; EV.forEach(function (e) { var c = (e.f || [])[0]; if (c) n[c] = (n[c] || 0) + 1; });
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 3).map(function (c) { return NAMES[c.toUpperCase()] || c.toUpperCase(); });
    if (!top.length) return; var sp = cap.querySelector(".ambfocus") || cap.appendChild(document.createElement("span")); sp.className = "ambfocus"; sp.textContent = (FOCUS[lg] || FOCUS.en) + " " + top.join(", "); }
  function a11y() { if (document.getElementById("ambl") || !EV.length) return; var lg = document.documentElement.lang || "en", nav = document.createElement("nav"); nav.id = "ambl"; nav.className = "ambl";
    nav.setAttribute("aria-label", TOPL[lg] || TOPL.en); var ul = document.createElement("ul");
    EV.forEach(function (e) { var li = document.createElement("li"), a = document.createElement("a"); a.href = evUrl(e); a.lang = "en"; a.textContent = e.t; li.appendChild(a); ul.appendChild(li); });
    nav.appendChild(ul); box.parentNode.insertBefore(nav, box.nextSibling); }
  function loadEv() { if (!window.fetch || (mode !== "news" && mode !== "graph" && mode !== "pins" && mode !== "sea")) return; var tk = document.getElementById("ticker"); PRE = root + (tk ? tk.getAttribute("data-prefix") || "" : "");
    try { fetch(root + "assets/band.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (!j || !j.ev || !j.ev.length) return;
      if (j.m) geoInit(j.m, j.r || [75, -57]); EV = j.ev; NAMES = (j.names || {})[document.documentElement.lang || "en"] || (j.names || {}).en || {}; CO = j.co || null; if (W > 60) { mkEv(); } focusLine(); if (mode === "news" || mode === "graph") a11y(); if (mode === "pins" && CO && W > 60) { setup(); start(); } }).catch(function () {}); } catch (e) {} }

  var M = {
    /* reports from different outlets meet and become a verified event: its section icon flashes in its risk colour (sometimes the owl) */
    news: { init: function () { var K = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].concat(crypto(), FLK); P = [];
        for (var i = 0, n = count(38, 12, 40); i < n; i++) P.push({ x: (i + Math.random()) / n * W, y: rnd(14, H - 14), vx: (rnd(.12, .32) * (i % 2 ? 1 : -1)), vy: rnd(-.13, .13), src: i % 5, ev: 0, k: K[i % K.length] }); },
      step: function () { var r = RR(); P.forEach(function (p) { if (p.home) { p.x = p.home.x + (still ? 0 : Math.sin(t / 60 + p.src) * 3); p.y = p.home.y + (still ? 0 : Math.cos(t / 75 + p.src) * 2.5); } else drift(p, 1, 12); if (p.fl) tie(p); });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 84 && a.src !== b.src && !a.evt && !b.evt && !a.fl && !b.fl) { line(a, b, C.gold, 1, (1 - d / 84) * .6); var f = (t * .022 + i * .37 + j * .11) % 1; dot(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 1.9, "#FFF1C9", .95);
            if (d < 24 && !a.ev && !b.ev) { a.ev = b.ev = 110; a.lvl = b.lvl = (Math.random() * 4) | 0; a.cat = b.cat = String(1 + ((Math.random() * 10) | 0)); a.owl = b.owl = Math.random() < .18;
              if (EV.length) { var re = pick(EV); a.cat = b.cat = String(re.c); a.lvl = b.lvl = lvlOf(re.r); a.evref = b.evref = re; a.owl = b.owl = false; } } } }
        arcs(); P.forEach(function (p) { if (p.evt) { drawEvt(p); return; } if (p.fl) { drawFl(p); return; } if (p.ev) { p.ev--; var k = p.ev / 110, col = C.risk[p.lvl]; ring(p.x, p.y, r + 4 + (1 - k) * 28, col, 2, .32 * k);
            if (p.owl) owl(p.x, p.y, r + 2, col); else put(evsym(p.cat, col, r + 2), p.x, p.y, r + 2); }
          else { ring(p.x, p.y, r + 2.6, C.gold, .8, .24); put(sym(p.k, r), p.x, p.y, r, .95); scan(p, C.gold, r); } }); tags(); ticker(); } },
    /* BAND-58: the day's stories as glass cards on a briefing board; a scan line passes over them and stamps each with its risk colour */
    brief: { init: function () { var cols = Math.max(4, Math.round(W / 150)); X = { cols: cols }; P = [];
        for (var i = 0; i < cols * 2; i++) P.push({ tx: (i % cols + .5) * W / cols, ty: i < cols ? H * .33 : H * .7, x: rnd(0, W), y: rnd(0, H), k: String(1 + (i % 10)), lvl: (Math.random() * 4) | 0, d: i * 14 }); },
      step: function () { var r = RR(), cw = W / X.cols, ch = 30, sx = still ? W * 2 : (t * 1.7) % (W + 140) - 70;
        P.forEach(function (p) { if (p.d > 0) { p.d--; return; } p.x += (p.tx - p.x) * .04; p.y += (p.ty - p.y) * .04; var done = Math.hypot(p.tx - p.x, p.ty - p.y) < 1, col = C.risk[p.lvl];
          if (done && Math.random() < .002) { p.x = rnd(0, W); p.y = -20; p.k = String(1 + ((Math.random() * 10) | 0)); p.lvl = (Math.random() * 4) | 0; }
          if (done) { var x0 = p.x - r - 7, cwid = Math.max(60, cw - 20); cx.globalAlpha = 1; rr(x0, p.y - ch / 2, cwid, ch, 6); cx.fillStyle = "rgba(226,194,127,.07)"; cx.fill(); cx.lineWidth = 1; cx.strokeStyle = "rgba(226,194,127,.3)"; cx.stroke();
            if (sx > x0) { cx.globalAlpha = .95; cx.fillStyle = col; cx.fillRect(x0, p.y - ch / 2 + 4, 3, ch - 8); glow(x0 + 1, p.y, 16, col, .22); }
            cx.globalAlpha = .38; cx.fillStyle = "#BFD0FF"; cx.fillRect(p.x + r + 6, p.y - 5, Math.max(0, Math.min(90, cwid - r * 2 - 22)), 2.4); cx.fillRect(p.x + r + 6, p.y + 1.5, Math.max(0, Math.min(56, cwid - r * 2 - 40)), 2); }
          put(done ? evsym(p.k, col, r) : sym(p.k, r), p.x, p.y, r, done ? 1 : .7); });
        if (!still) { cx.save(); cx.globalCompositeOperation = "lighter"; var g = cx.createLinearGradient(sx - 46, 0, sx, 0); g.addColorStop(0, "rgba(226,194,127,0)"); g.addColorStop(1, "rgba(226,194,127,.28)"); cx.fillStyle = g; cx.fillRect(sx - 46, 0, 46, H); cx.globalAlpha = .7; cx.fillStyle = "#FFF1C9"; cx.fillRect(sx, 0, 1.2, H); cx.restore(); } } },
    /* a neural network: events are bright cores, countries and outlets the satellites, signals run along the links */
    graph: { init: function () { P = []; for (var i = 0, n = count(42, 12, 36); i < n; i++) { var k = i % 3;
          P.push({ x: (i + Math.random()) / n * W, y: rnd(12, H - 12), vx: rnd(.1, .25) * (i % 2 ? 1 : -1), vy: rnd(-.1, .1), t: k, k: k === 0 ? String(1 + (i % 10)) : k === 1 ? pick(FLK) : "", lvl: (Math.random() * 4) | 0, src: i }); } },
      step: function () { var r = RR(); P.forEach(function (p) { drift(p, 1, 12); });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j]; if ((a.t === 0) === (b.t === 0)) continue;
          var d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 100) { var col = a.t === 0 ? C.risk[a.lvl] : C.risk[b.lvl]; line(a, b, col, 1.2, (1 - d / 100) * .6);
            var f = (t * .02 + i * .31 + j * .17) % 1; dot(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 1.8, "#E9FBFF", .9 * (1 - d / 140)); } }
        P.forEach(function (p) { if (p.t === 0) { var col = C.risk[p.lvl]; glow(p.x, p.y, (r + 1) * 2.7, col, .3); hud(p.x, p.y, r + 4, col, p.src, p.lvl); put(evsym(p.k, col, r + 1), p.x, p.y, r + 1); }
          else if (p.t === 1) put(sym(p.k, r - 1), p.x, p.y, r - 1); else { ring(p.x, p.y, 5, C.acc, .8, .28 + (still ? 0 : .12 * Math.sin(t / 15 + p.src))); dot(p.x, p.y, 2.6, C.acc, .95); } }); } },
    /* flag pins stand where their country is on the dotted world; the light passes from one to its neighbours */
    pins: { init: function () { P = []; var r = RR();
        if (CO) { var list = [], seen = {}, risk = {}; EV.forEach(function (e) { (e.f || []).forEach(function (c) { if (!seen[c]) { seen[c] = 1; list.push(c); } risk[c] = Math.max(risk[c] || 0, e.r); }); });
          FLAGS.forEach(function (c) { if (!seen[c]) { seen[c] = 1; list.push(c); } }); var max = count(60, 8, 26);
          list.forEach(function (c) { if (P.length >= max || !CO[c]) return; var h = ll(CO[c]); if (P.some(function (q) { return Math.hypot(q.x - h.x, q.y - h.y) < r * 2 + 4; })) return;
            P.push({ x: h.x, y: h.y, z: 0, d: P.length * 8 + rnd(0, 30), lit: 0, k: "f:" + c, lvl: risk[c] != null ? lvlOf(risk[c]) : -1 }); }); }
        else for (var i = 0, n = count(60, 8, 26); i < n; i++) P.push({ x: rnd(14, W - 14), y: rnd(H * .3, H - 14), z: 0, d: i * 10 + rnd(0, 40), lit: 0, k: pick(FLK), lvl: -1 }); },
      step: function () { var r = RR();
        P.forEach(function (p) { if (p.d > 0) { p.d--; return; } p.z = Math.min(1, p.z + .05); if (Math.random() < .004) p.lit = 70; if (p.lit) p.lit--; });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j]; if (!a.z || !b.z) continue; var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140 && (a.lit || b.lit)) { line(a, b, C.acc, 1.2, .55 * (1 - d / 140)); if (a.lit > 35 && !b.lit) b.lit = 45; } }
        P.forEach(function (q) { if (!q.z) return; var col = q.lvl >= 0 ? C.risk[q.lvl] : C.acc, y = q.y - (1 - q.z) * 30;
          glow(q.x, y, r * 2.3, col, (q.lvl >= 0 ? .34 : .16) * q.z + (q.lit ? .25 : 0));
          cx.globalAlpha = q.z * .8; cx.beginPath(); cx.ellipse(q.x, y + r + 4, r * .8, 2.2, 0, 0, 6.2832); cx.strokeStyle = col; cx.lineWidth = 1.2; cx.stroke();
          cx.beginPath(); cx.moveTo(q.x - 3, y + r - 1); cx.lineTo(q.x + 3, y + r - 1); cx.lineTo(q.x, y + r + 4); cx.closePath(); cx.fillStyle = col; cx.fill();
          if (q.lit) ring(q.x, y, 14 - q.lit / 7 + r * .6, col, 1.5, .5 * q.lit / 70);
          put(sym(q.k, r), q.x, y, r, q.z); if (q.lit || q.lvl >= 2) ring(q.x, y, r + 2.2, col, 1.6, q.z * (q.lit ? 1 : .6)); }); } },
    /* shipping lanes on the dotted world; the gates pulse, ships leave light trails and slow down near a hazard */
    sea: { init: function () { var G = { mal: [2.5, 101.5], suez: [30, 32.5], bab: [12.6, 43.3], hor: [26.5, 56.3], gib: [36, -5.6], bos: [41.1, 29.1], pan: [9.1, -79.7], cape: [-34.4, 18.5] },
          NM = { mal: "MALACCA", suez: "SUEZ", bab: "BAB EL-MANDEB", hor: "HORMUZ", gib: "GIBRALTAR", bos: "BOSPORUS", pan: "PANAMA", cape: "CAPE" },
          RT = [[[31.2, 121.5], G.mal, [6.9, 79.8], G.bab, G.suez, [35.2, 20], G.gib, [51.9, 4.1]], [[26.7, 50.2], G.hor, [19, 72.8]], [[33.7, -118.3], [10, -90], G.pan, [15, -70], [40.6, -74]],
            [[51.9, 4.1], [46, -25], [40.6, -74]], [[36.5, 28], G.bos, [46.5, 30.7]], [[51.9, 4.1], G.gib, [5, -15], G.cape, [-15, 60], G.mal]];
        X = { gates: [], routes: [], ships: [], hz: 0 }; Object.keys(G).forEach(function (k) { var h = ll(G[k]); X.gates.push({ k: k, x: h.x, y: h.y, nm: NM[k], ph: rnd(0, 100) }); });
        RT.forEach(function (rt) { var pts = rt.map(function (q) { return ll(q); }), cum = [0]; for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); X.routes.push({ pts: pts, cum: cum, len: cum[cum.length - 1] }); });
        var n = W < 640 ? 10 : 20; for (var i = 0; i < n; i++) X.ships.push({ r: i % X.routes.length, s: Math.random(), v: rnd(.7, 1.3), tr: [] }); },
      step: function () { var hzk = ["bab", "hor", "suez", "bos"][((t / 900) | 0) % 4]; cx.save(); cx.setLineDash([2, 5]); cx.lineWidth = 1; cx.strokeStyle = C.acc; cx.globalAlpha = .16;
        X.routes.forEach(function (rt) { cx.beginPath(); rt.pts.forEach(function (q, i) { if (i) cx.lineTo(q.x, q.y); else cx.moveTo(q.x, q.y); }); cx.stroke(); }); cx.restore();
        var hz = null; X.gates.forEach(function (g) { if (g.k === hzk) hz = g; });
        X.gates.forEach(function (g) { g.ph = (g.ph + .9) % 100; var bad = g === hz, col = bad ? C.risk[3] : C.acc; ring(g.x, g.y, 3 + g.ph / 9, col, 1.4, (bad ? .7 : .4) * (1 - g.ph / 100)); dot(g.x, g.y, 2.4, col, .95); glow(g.x, g.y, bad ? 22 : 13, col, bad ? .45 : .25); });
        X.ships.forEach(function (sh) { var rt = X.routes[sh.r], v = sh.v, near = false; if (hz && Math.hypot(sh.x - hz.x, sh.y - hz.y) < 38) { v *= .35; near = true; }
          sh.s += v * .00085 * (900 / rt.len + .4); if (sh.s >= 1) { sh.s = 0; sh.tr = []; } var d = sh.s * rt.len, k = 1; while (k < rt.cum.length - 1 && rt.cum[k] < d) k++;
          var A = rt.pts[k - 1], B = rt.pts[k], u = (d - rt.cum[k - 1]) / ((rt.cum[k] - rt.cum[k - 1]) || 1); sh.x = A.x + (B.x - A.x) * u; sh.y = A.y + (B.y - A.y) * u; sh.a = Math.atan2(B.y - A.y, B.x - A.x);
          sh.tr.push({ x: sh.x, y: sh.y }); if (sh.tr.length > 18) sh.tr.shift(); var col = near ? C.risk[1] : "#B8FFF2";
          cx.save(); cx.globalCompositeOperation = "lighter"; cx.lineWidth = 1.6; cx.strokeStyle = near ? C.risk[1] : C.acc; for (var q = 1; q < sh.tr.length; q++) { cx.globalAlpha = .55 * q / sh.tr.length; cx.beginPath(); cx.moveTo(sh.tr[q - 1].x, sh.tr[q - 1].y); cx.lineTo(sh.tr[q].x, sh.tr[q].y); cx.stroke(); } cx.restore();
          glow(sh.x, sh.y, 8, near ? C.risk[1] : C.acc, .5); cx.save(); cx.translate(sh.x, sh.y); cx.rotate(sh.a); cx.globalAlpha = 1; cx.fillStyle = col; cx.beginPath(); cx.moveTo(5, 0); cx.lineTo(-3.5, -3); cx.lineTo(-2, 0); cx.lineTo(-3.5, 3); cx.closePath(); cx.fill(); cx.restore(); });
        if (W >= 640) { cx.save(); cx.font = "600 8.5px ui-monospace,SFMono-Regular,Consolas,monospace"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.shadowColor = "#060c1e"; cx.shadowBlur = 3; cx.fillStyle = "#BFEFE6"; cx.globalAlpha = .75;
          X.gates.forEach(function (g) { cx.fillText(g.nm, g.x, g.y + (g.y > H - 22 ? -10 : 10)); }); cx.restore(); } } },
    /* a polar radar: the sweep leaves an afterglow, topics light up in their risk colour, and a new one pings in now and then */
    radar: { init: function () { P = []; X = { cx: W * .5, cy: H * 1.15, R: Math.max(W * .62, H * 2) };
        for (var i = 0, n = count(45, 10, 30); i < n; i++) { var x = rnd(14, W - 14), y = rnd(14, H - 14), a = Math.atan2(y - X.cy, x - X.cx); if (a < 0) a += 6.2832;
          P.push({ x: x, y: y, ang: a, k: String(1 + (i % 10)), lit: 0, lvl: (Math.random() * 4) | 0, born: -99 }); } },
      step: function () { var r = RR(), sw = Math.PI + ((t * .012) % Math.PI);
        for (var k = 1; k <= 4; k++) ring(X.cx, X.cy, X.R * k / 4, C.acc, 1, .2);
        cx.save(); cx.strokeStyle = C.acc; cx.globalAlpha = .28; cx.lineWidth = 1; cx.beginPath(); for (var a = Math.PI; a <= 6.29; a += .1745) { cx.moveTo(X.cx + Math.cos(a) * X.R, X.cy + Math.sin(a) * X.R); cx.lineTo(X.cx + Math.cos(a) * (X.R - 7), X.cy + Math.sin(a) * (X.R - 7)); } cx.stroke(); cx.restore();
        sweepGlow(X.cx, X.cy, sw, "rgba(183,148,246,"); line({ x: X.cx, y: X.cy }, { x: X.cx + Math.cos(sw) * X.R, y: X.cy + Math.sin(sw) * X.R }, "#EFE6FF", 1.4, .6);
        if (!still && t % 120 === 0) { var q = pick(P); q.x = rnd(14, W - 14); q.y = rnd(14, H - 14); q.ang = Math.atan2(q.y - X.cy, q.x - X.cx); if (q.ang < 0) q.ang += 6.2832; q.k = String(1 + ((Math.random() * 10) | 0)); q.lvl = (Math.random() * 4) | 0; q.born = t; }
        P.forEach(function (p) { if (Math.abs(p.ang - sw) < .03) p.lit = 55; if (p.lit) p.lit--; var l = p.lit / 55, nb = Math.min(1, (t - p.born) / 30);
          if (t - p.born < 40) ring(p.x, p.y, r + (t - p.born) * .7, C.acc, 1.4, .6 * (1 - (t - p.born) / 40));
          if (p.lit) { ring(p.x, p.y, r + 3 + (1 - l) * 14, C.risk[p.lvl], 1.6, .4 * l); glow(p.x, p.y, r * 2.2, C.risk[p.lvl], .4 * l); }
          put(p.lit ? evsym(p.k, C.risk[p.lvl], r) : sym(p.k, r), p.x, p.y, r, (.4 + .6 * l) * nb); }); } },
    /* signals and warnings: an equalizer wall - the higher the level, the taller, faster and redder; two neighbours both high are bridged by a light */
    beacons: { init: function () { P = []; var n = count(26, 14, 48); for (var i = 0; i < n; i++) P.push({ x: (i + .5) * W / n, lvl: (Math.random() * 4) | 0, ph: rnd(0, 6), sp: rnd(.7, 1.4), pk: 0, lev: 0 }); },
      step: function () { var n = P.length, bw = Math.max(5, Math.min(11, W / n * .4)), sg = 5, gp = 2, base = H - 8, mx = Math.floor((H - 22) / (sg + gp));
        P.forEach(function (p, i) { p.ph += p.sp * (1 + p.lvl * .35) * .05; p.lev = Math.max(.08, Math.min(1, .22 + p.lvl * .16 + Math.sin(p.ph) * .22 + Math.sin(p.ph * 2.3 + i) * .08)); var ns = Math.round(p.lev * mx);
          for (var k = 0; k < ns; k++) { var f = k / mx; cx.globalAlpha = .55 + .4 * f; cx.fillStyle = f > .75 ? C.risk[3] : f > .5 ? C.risk[2] : f > .28 ? C.risk[1] : C.risk[0]; cx.fillRect(p.x - bw / 2, base - (k + 1) * (sg + gp), bw, sg); }
          p.pk = Math.max(p.pk - .006, p.lev); cx.globalAlpha = .85; cx.fillStyle = "#FFF1C9"; cx.fillRect(p.x - bw / 2, base - p.pk * mx * (sg + gp) - 2, bw, 1.6);
          if (p.lev > .7) glow(p.x, base - p.lev * mx * (sg + gp), 14, C.risk[3], .35); });
        for (var i = 0; i < n - 1; i++) { var a = P[i], b = P[i + 1]; if (a.lev > .62 && b.lev > .62) { var ya = base - a.lev * mx * (sg + gp), yb = base - b.lev * mx * (sg + gp);
          cx.save(); cx.globalCompositeOperation = "lighter"; cx.globalAlpha = .55; cx.lineWidth = 1.4; cx.strokeStyle = C.gold; cx.beginPath(); cx.moveTo(a.x, ya); cx.quadraticCurveTo((a.x + b.x) / 2, Math.min(ya, yb) - 8, b.x, yb); cx.stroke(); cx.restore(); dot((a.x + b.x) / 2, Math.min(ya, yb) - 4, 2, "#fff", .8); } } } },
    /* markets in the news: two glowing trend lines with a gradient under them (an illustration - never prices), a moving crosshair, and market symbols that tick up or down as they cross */
    markets: { init: function () { var n = Math.max(40, Math.round(W / 8)), vb = .45, ve = .62; X = { b: [], e: [], off: 0 };
        for (var i = 0; i < n; i++) { vb = Math.max(.18, Math.min(.82, vb + rnd(-.035, .035))); ve = Math.max(.18, Math.min(.82, ve + rnd(-.04, .04))); X.b.push(vb); X.e.push(ve); }
        var K = ["etf", "stk", "oil", "gold", "eur", "usd", "2", "6"].concat(crypto(), crypto()); P = [];
        for (i = 0; i < count(60, 8, 22); i++) P.push({ x: (i + Math.random()) / count(60, 8, 22) * W, y: rnd(14, H - 14), vx: rnd(.1, .3) * (i % 2 ? 1 : -1), vy: rnd(-.12, .12), k: K[i % K.length], tick: 0, up: true }); },
      step: function () { var r = RR(), n = X.b.length, dx = W / (n - 1); X.off += .6;
        if (X.off >= dx) { X.off -= dx; X.b.shift(); X.e.shift(); X.b.push(Math.max(.18, Math.min(.82, X.b[n - 2] + rnd(-.035, .035)))); X.e.push(Math.max(.18, Math.min(.82, X.e[n - 2] + rnd(-.04, .04)))); }
        cx.globalAlpha = .1; cx.fillStyle = "#BFD0FF"; for (var gy = H * .25; gy < H; gy += H * .25) cx.fillRect(0, gy, W, 1); for (var gx = -((X.off * 1) % 40); gx < W; gx += 40) cx.fillRect(gx, 0, 1, H);
        function path(L) { cx.beginPath(); for (var i = 0; i < n; i++) { var x = i * dx - X.off, y = L[i] * H; if (i) cx.lineTo(x, y); else cx.moveTo(x, y); } }
        [[X.b, "#f7931a"], [X.e, "#A78BFA"]].forEach(function (L) { path(L[0]); cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath(); var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, L[1] + "55"); g.addColorStop(1, L[1] + "00"); cx.globalAlpha = 1; cx.fillStyle = g; cx.fill();
          cx.save(); cx.globalCompositeOperation = "lighter"; path(L[0]); cx.lineWidth = 6; cx.strokeStyle = L[1]; cx.globalAlpha = .16; cx.stroke(); path(L[0]); cx.lineWidth = 1.8; cx.globalAlpha = .95; cx.stroke(); cx.restore(); });
        var xh = still ? W * .62 : (t * .9) % W, ix = Math.max(0, Math.min(n - 1, Math.round((xh + X.off) / dx)));
        cx.save(); cx.setLineDash([3, 4]); cx.globalAlpha = .3; cx.strokeStyle = "#E9FBFF"; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(xh, 0); cx.lineTo(xh, H); cx.stroke(); cx.restore();
        [[X.b, "#f7931a"], [X.e, "#A78BFA"]].forEach(function (L) { var yy = L[0][ix] * H; dot(xh, yy, 3.2, L[1], 1); ring(xh, yy, 6, L[1], 1.2, .6); glow(xh, yy, 14, L[1], .5); });
        P.forEach(function (p) { drift(p, 1, 12); var i = Math.max(0, Math.min(n - 1, Math.round((p.x + X.off) / dx))), above = p.y < X.b[i] * H;
          if (p.prev != null && above !== p.prev && !p.tick) { p.tick = 70; p.up = above; } p.prev = above;
          if (p.tick) { p.tick--; var a = p.tick / 70, col = p.up ? C.up : C.down; cx.globalAlpha = a; cx.font = "700 " + (r * 1.1) + "px system-ui,sans-serif"; cx.textAlign = "center"; cx.fillStyle = col;
            cx.fillText(p.up ? "▲" : "▼", p.x, p.y - r - 6 - (1 - a) * 10); ring(p.x, p.y, r + 3, col, 1.6, .6 * a); glow(p.x, p.y, r * 2.4, col, .4 * a); }
          put(sym(p.k, r), p.x, p.y, r, .95); }); } },
    /* an event page: reports arrive as beams from both sides; each arrival sends a shock ring; from the second report on the event is verified (owl in gold, sources orbit it) */
    event: { init: function () { P = []; WAVES = []; for (var i = 0, n = count(36, 10, 40); i < n; i++) P.push(spawn()); P.hits = 0; },
      step: function () { var r0 = RR(), cxp = W / 2, cyp = H / 2, pulse = Math.min(1, P.hits / 2);
        P.forEach(function (p, i) { p.k += p.v; var e1 = ease(p.k), x = p.x0 + (cxp - p.x0) * e1, y = p.y0 + (cyp - p.y0) * e1;
          cx.save(); cx.globalCompositeOperation = "lighter"; var g = cx.createLinearGradient(p.x0, p.y0, x, y); g.addColorStop(0, "rgba(226,194,127,0)"); g.addColorStop(1, "rgba(226,194,127,.6)"); cx.strokeStyle = g; cx.lineWidth = 1.5; cx.globalAlpha = 1; cx.beginPath(); cx.moveTo(p.x0, p.y0); cx.lineTo(x, y); cx.stroke(); cx.restore();
          glow(x, y, 12, C.gold, .35); put(sym(p.s, r0 - 2), x, y, r0 - 2, 1 - p.k * .6); if (p.k >= 1) { P.hits++; WAVES.push(t); if (P.hits === 2) { WAVES.push(t + 8); WAVES.push(t + 16); } P[i] = spawn(); } });
        var r = r0 + 3 + Math.sin(t / 14) * 1.2 + pulse * 3; WAVES = WAVES.filter(function (w) { return t - w < 50; });
        WAVES.forEach(function (w) { var k = (t - w) / 50; if (k >= 0) ring(cxp, cyp, r + k * 70, C.gold, 2, .5 * (1 - k)); });
        if (P.hits >= 2) { var N = Math.min(8, P.hits); ring(cxp, cyp, r + 16, C.gold, .8, .2); for (var q = 0; q < N; q++) { var a = (still ? 0 : t * .02) + q * 6.2832 / N; dot(cxp + Math.cos(a) * (r + 16), cyp + Math.sin(a) * (r + 16), 2, C.gold, .85); } }
        if (P.hits >= 2) owl(cxp, cyp, r, C.gold); else dot(cxp, cyp, r, C.muted, 1); } }
  };
  function spawn() { var left = Math.random() < .5; return { x0: left ? rnd(0, W * .3) : rnd(W * .7, W), y0: rnd(10, H - 10), k: 0, v: rnd(.004, .012), s: Math.random() < .5 ? pick(FLK) : String(1 + ((Math.random() * 10) | 0)) }; }
  function ease(k) { return k < 1 ? 1 - Math.pow(1 - k, 2) : 1; }
  var mod = M[mode] || M.news;
  function space() { if (mode === "beacons" || mode === "brief" || mode === "sea" || mode === "radar" || mode === "pins" || mode === "event") return; var r = RR(), all = [];
    P.forEach(function (p) { if (p.x != null) { p.r = p.r || r; all.push(p); } }); COINS.forEach(function (c) { all.push(c); }); apart(all, 6); }   /* BAND-55: the fixed owl is no obstacle - symbols pass under it (a wall in the middle of a short strip made them pile up against it) */
  function frame() { if (!on) return; if (LOW && (++FR & 1)) { raf = requestAnimationFrame(frame); return; } t++; seen = Date.now(); LIVE = !touch && seen - mt < 1200; if (HOT && touch && seen - HOTT > 3000) HOT = null; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); space(); back(); mod.step(); if (COINS.length) drawCoins(mode === "news"); if (mode !== "event") drawMark(); if (HOT && HOT.ev) label(HOT.p, HOT.ev); cx.globalAlpha = 1; raf = requestAnimationFrame(frame); }
  function start() { cancelAnimationFrame(raf); if (still) { for (var i = 0; i < 160; i++) { cx.clearRect(0, 0, W, H); t++; space(); back(); mod.step(); if (COINS.length) drawCoins(mode === "news"); } if (mode !== "event") drawMark(); cx.globalAlpha = 1; return; } raf = requestAnimationFrame(frame); }
  var seen = 0, lastW = 0;
  function setup() { size(); lastW = W; if (W < 60) return; mod.init(); coins(); if (EV.length) mkEv(); }
  /* 31 Oct 2026: the strip is laid out again whenever its own width changes (late layout, zoom, a hidden tab, a rotated phone),
     so the symbols are always spread over the whole width and never stay bunched at the left */
  function relayout() { var w = box.getBoundingClientRect().width; if (Math.abs(w - lastW) > 6 || !P.length) { setup(); start(); } }
  colours(); setup(); start(); loadEv();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(relayout, 150); });
  if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(relayout, 120); }).observe(box);
  /* a quiet watchdog: if the strip is on screen but nothing has been drawn for 2 s, or the symbols have piled up on one side, start it again */
  setInterval(function () { if (still || document.hidden) return; var r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width < 60) return;
    var xs = P.filter(function (p) { return p.x != null; }), bunched = xs.length > 6 && (Math.max.apply(null, xs.map(function (p) { return p.x; })) - Math.min.apply(null, xs.map(function (p) { return p.x; }))) < W * .5;
    if (Date.now() - seen > 2000 || Math.abs(r.width - lastW) > 6 || bunched) { on = true; setup(); start(); } }, 2500);
  function setHot(h, ev) { HOT = h; COINS.forEach(function (c) { c.hot = !!(h && h.coin === c); }); box.classList.toggle("hot", !!h); box.title = ""; }
  box.addEventListener("pointermove", function (ev) { var b = box.getBoundingClientRect(); mx = ev.clientX - b.left; my = ev.clientY - b.top; mt = Date.now(); touch = ev.pointerType === "touch";
    if (!touch) setHot(hit(mx, my)); });
  function away() { mx = my = -999; if (!touch) setHot(null); }
  box.addEventListener("pointerleave", away); box.addEventListener("pointercancel", function () { mx = my = -999; });
  box.addEventListener("pointerup", function (ev) { if (ev.pointerType === "touch") { touch = true; mx = my = -999; } });
  box.addEventListener("click", function (ev) { var b = box.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top, h = hit(x, y); if (!h) { if (touch) HOT = null; return; }
    if (h.coin) { if (/^https:\/\//.test(h.coin.p.url)) { var w = window.open(h.coin.p.url, "_blank", "noopener"); if (w) w.opener = null; } return; }
    if (touch && (!HOT || HOT.p !== h.p)) { HOT = h; HOTT = Date.now(); box.classList.add("hot"); return; }          /* touch: the first tap names it, the second opens it */
    location.href = evUrl(h.ev); });
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { on = es[0].isIntersecting && !document.hidden; if (on && !still) start(); }).observe(box);
  document.addEventListener("visibilitychange", function () { on = !document.hidden; if (on && !still) start(); });
  if (window.MutationObserver) new MutationObserver(function () { colours(); if (still) start(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
})();

/* 27 Oct: text size (A- A A+) - six steps, remembered in this browser; assets/theme.js applies it before the page is drawn */
(function () {
  var d = document.documentElement, Z = [0.85, 0.92, 1, 1.1, 1.2, 1.35];
  var i = parseInt(d.getAttribute("data-tsz"), 10); if (!(i >= 0)) i = 2;
  function set(n) {
    i = Math.max(0, Math.min(Z.length - 1, n));
    d.style.zoom = i === 2 ? "" : Z[i]; d.setAttribute("data-tsz", i);
    try { localStorage.setItem("athena-text-size", String(i)); } catch (e) {}
    document.querySelectorAll("[data-tsz-btn]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tsz") === "0" && i === 2 ? "true" : "false"); });
  }
  document.querySelectorAll(".tsz button[data-tsz]").forEach(function (b) {
    b.setAttribute("data-tsz-btn", "");
    b.addEventListener("click", function () { var s = +b.getAttribute("data-tsz"); set(s === 0 ? 2 : i + s); });
  });
  set(i);
})();

/* 27 Oct: a warm welcome each time the reader opens the site in a new browser session (once per session, any page) */
(function () {
  var w = document.getElementById("welc"); if (!w) return;
  if (window.athenaTourAuto && window.athenaTourAuto()) return;      /* 28 Oct: first visit - the intro and the tour welcome the reader */
  if (!document.getElementById("welcome")) return;                   /* LOOK-31: the greeting on the front page only - a story page is for its story */
  var seen = false;
  try { seen = sessionStorage.getItem("athena-welcomed") === "1"; sessionStorage.setItem("athena-welcomed", "1"); } catch (e) { seen = false; }
  if (seen) return;
  var g = (w.getAttribute("data-g") || "").split("|"), h = new Date().getHours();
  var b = w.querySelector(".welc-g"); if (b) b.textContent = (h < 12 ? g[0] : h < 18 ? g[1] : g[2]) || g[0] || "";
  w.hidden = false;
  var gone = false;
  function close() { if (gone) return; gone = true; w.classList.add("out"); setTimeout(function () { w.hidden = true; }, 380); }
  w.querySelector(".welc-go").addEventListener("click", close);
  w.querySelector(".welc-x").addEventListener("click", close);
  var wt = w.querySelector(".welc-tour"); if (wt) wt.addEventListener("click", close);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
  setTimeout(close, 2000);                                           /* 30 Oct 2026: the greeting closes after 2 seconds (Tony) */
})();

/* 27 Oct: the whole news item opens the story, on every page - not only the headline. The headline stays the real link
   (keyboard, screen readers, "open in new tab"); other links and buttons inside the item keep their own job; selecting
   text never jumps; Ctrl/Cmd/Shift or the middle button opens a new tab. Lists drawn later (local news, maritime panel,
   Ask results) are picked up too. */
(function () {
  var main = document.querySelector("main"); if (!main) return;
  var EV = 'a[href*="event/"]';
  function uniq(el) { var s = {}, n = 0; el.querySelectorAll(EV).forEach(function (a) { var h = a.getAttribute("href"); if (!s[h]) { s[h] = 1; n++; } }); return n; }
  function mark() {
    main.querySelectorAll(EV).forEach(function (a) {
      if (a.closest(".newsclick") || (a.textContent || "").trim().length < 15 || a.closest("h1")) return;
      var c = a.parentElement, best = null;
      for (var i = 0; i < 4 && c && c !== main; i++) {
        if (/^(LI|DIV|ARTICLE|P|SECTION|TR)$/.test(c.tagName) && !c.matches("#mg,#mgp,.mgwrap,.mgcols,.hp,.amb,form,nav")) {
          if (uniq(c) !== 1) break;
          if (c.getBoundingClientRect().height < 420) best = c;
        }
        c = c.parentElement;
      }
      if (best) { best.classList.add("newsclick"); best.setAttribute("data-go", a.href); }
    });
  }
  function go(ev, tab) {
    var c = ev.target.closest && ev.target.closest(".newsclick"); if (!c) return;
    if (ev.target.closest("a,button,input,select,textarea,label,summary,[role=button],[contenteditable]")) return;
    try { if (String(window.getSelection() || "").trim()) return; } catch (er) {}
    var u = c.getAttribute("data-go"); if (!u) return;
    ev.preventDefault();
    if (tab) { var w = window.open(u, "_blank", "noopener"); if (w) w.opener = null; } else location.href = u;
  }
  document.addEventListener("click", function (ev) { if (ev.button === 0) go(ev, ev.ctrlKey || ev.metaKey || ev.shiftKey); });
  document.addEventListener("auxclick", function (ev) { if (ev.button === 1) go(ev, true); });
  mark();
  var tm = null;
  if (window.MutationObserver) new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(mark, 120); }).observe(main, { childList: true, subtree: true });
})();

/* LOOK-31: the sticky menu's emblem, the test strip, the freshness dot, the help button */
(function () {
  "use strict";
  var nav = document.querySelector("nav.sections"), mast = document.querySelector("header.mast"), hp = document.getElementById("hp");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (nav && mast) nav.classList.toggle("stuck", y > mast.offsetTop + mast.offsetHeight);
    if (hp) hp.classList.toggle("mini", y > 240);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var tb = document.querySelector(".testbar");
  if (tb) {
    var rev = tb.getAttribute("data-rev") || "", hid = false;
    try { hid = localStorage.getItem("athena-testbar") === rev; } catch (e) { hid = false; }
    if (hid) tb.hidden = true;
    var t = tb.querySelector(".tb-t"), x = tb.querySelector(".tb-x");
    if (t) t.addEventListener("click", function () { t.setAttribute("aria-expanded", t.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
    if (x) x.addEventListener("click", function () { tb.hidden = true; try { localStorage.setItem("athena-testbar", rev); } catch (e) { /* private */ } });
  }
  /* 30 Oct 2026 (evening): no observer on the label - changing its class from an observer of its own attributes looped
     forever and froze the page. The dot is set a few times while data/updated.json arrives, then once a minute, and
     only when its colour really changes. */
  /* LIVE-35: the dot is green while the site is being kept up to date - the last publish landed within two publishing
     intervals (data-int, minutes); amber under two hours; red after. The time shown is when the site went live. */
  function fresh() {
    var s = document.getElementById("upd"); if (!s || s.hidden) return;
    var tm = s.querySelector("time"), iso = tm && tm.getAttribute("datetime"); if (!iso) return;
    var iv = parseInt(s.getAttribute("data-int") || "15", 10) || 15, g = Math.max(30, iv * 2 + 5);
    var m = (Date.now() - new Date(iso).getTime()) / 60000, want = m < g ? "fresh" : m < 120 ? "ok" : "stale";
    if (!s.classList.contains(want)) { s.classList.remove("fresh", "ok", "stale"); s.classList.add(want); }
    /* SPD-35: next to "Updated", when the next update is due - from the publishing rhythm the site itself reports */
    var nx = parseFloat(s.getAttribute("data-next") || "0") || iv, left = Math.round(nx - m), el = s.querySelector(".nxt");
    var txt = want === "stale" ? "" : left >= 2 ? (s.getAttribute("data-nxt") || "").replace("{n}", String(left)) : (s.getAttribute("data-soon") || "");
    if (!el && txt) { el = document.createElement("span"); el.className = "nxt"; s.appendChild(el); }
    if (el && el.textContent !== (txt ? " · " + txt : "")) el.textContent = txt ? " · " + txt : "";
  }
  var up = document.getElementById("upd");
  if (up) up.addEventListener("athena-live", fresh);
  [500, 1500, 4000, 9000].forEach(function (ms) { setTimeout(fresh, ms); }); setInterval(fresh, 60000);
  /* LIVE-35: while a large update is being published, readers are told (data/status.json, written by the publish) */
  (function () {
    var u = document.querySelector(".util[data-root]"), root = u ? (u.getAttribute("data-root") || "") : "";
    if (!up || !window.fetch || document.querySelector(".upd-bar")) return;
    fetch(root + "data/status.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.publishing || !j.started) return;
      var age = (Date.now() - new Date(j.started).getTime()) / 60000;
      if (!(age >= 0 && age < Math.max(90, (j.eta_min || 20) * 3))) return;                 /* an old flag: the landed file never arrived */
      var key = "athena-updbar"; try { if (sessionStorage.getItem(key) === j.started) return; } catch (e) { /* private */ }
      var left = Math.max(1, Math.round((j.eta_min || 20) - age));
      var bar = document.createElement("div"); bar.className = "nbar upd-bar"; bar.setAttribute("role", "status");
      bar.innerHTML = '<div class="wrap"><span class="nk">ATHENA</span><span class="nt"></span><button type="button" class="nx" aria-label="">&times;</button></div>';
      bar.querySelector(".nt").textContent = (up.getAttribute("data-big") || "").replace("{n}", String(left));
      var x = bar.querySelector(".nx"); x.setAttribute("aria-label", up.getAttribute("data-close") || "Close");
      x.addEventListener("click", function () { bar.remove(); try { sessionStorage.setItem(key, j.started); } catch (e) { /* private */ } });
      var nb = document.getElementById("nbar");
      if (nb && nb.parentNode) nb.parentNode.insertBefore(bar, nb.nextSibling); else document.body.insertBefore(bar, document.body.firstChild);
    }).catch(function () { /* no status file: nothing to say */ });
  })();
})();

/* SHR-37: share this page - the device's share sheet, a copied link; the network links are already in the page */
(function(){var bars=document.querySelectorAll(".shr");if(!bars.length)return;
function adr(){var c=document.querySelector('link[rel="canonical"]');return (c&&c.href)||location.href.split("#")[0]}
function lk(n,u,t,d){var U=encodeURIComponent(u),T=encodeURIComponent(t);return n==="x"?"https://x.com/intent/post?url="+U+"&text="+T:n==="telegram"?"https://t.me/share/url?url="+U+"&text="+T:n==="whatsapp"?"https://wa.me/?text="+encodeURIComponent(t+" "+u):n==="linkedin"?"https://www.linkedin.com/feed/?shareActive=true&text="+encodeURIComponent(t+"\n\n"+(d?d+"\n\n":"")+u):n==="facebook"?"https://www.facebook.com/sharer/sharer.php?u="+U:"mailto:?subject="+T+"&body="+encodeURIComponent((d?d+"\n\n":"")+u)}
function copy(s,done){function fb(){var a=document.createElement("textarea");a.value=s;a.setAttribute("readonly","");a.style.cssText="position:fixed;opacity:0;top:0";document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}document.body.removeChild(a);done(ok)}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){done(true)},fb)}else fb()}
window.ATH_SH={lk:lk,copy:copy};
[].forEach.call(bars,function(b){var u=b.getAttribute("data-u")||adr(),t=b.getAttribute("data-t")||document.title,d=b.getAttribute("data-d")||"",st=b.querySelector(".shr-ok");
 [].forEach.call(b.querySelectorAll(".shr-l"),function(a){var n=a.getAttribute("data-net");if(n==="mail"||!b.getAttribute("data-u")){a.setAttribute("href",lk(n,u,t,d))}if(n==="mail")a.hidden=false})
 var nb=b.querySelector('[data-shr="native"]');if(nb&&navigator.share){nb.hidden=false;nb.addEventListener("click",function(){try{navigator.share({title:t,text:d||t,url:u}).catch(function(){})}catch(e){}})}
 var cb=b.querySelector('[data-shr="copy"]');if(cb)cb.addEventListener("click",function(){copy(u,function(ok){if(st){st.textContent=ok?st.getAttribute("data-ok"):u;setTimeout(function(){st.textContent=""},4000)}})})})})();

/* SHR-37b: a share button on each item shown (headlines, charts) - the same networks, the item's own address, headline and summary */
(function(){var bar=document.querySelector(".shr");if(!bar||!window.ATH_SH)return;var SH=window.ATH_SH;
var nets=[].map.call(bar.querySelectorAll(".shr-l"),function(a){return [a.getAttribute("data-net"),a.textContent]});
var nat=bar.querySelector('[data-shr="native"]'),cpy=bar.querySelector('[data-shr="copy"]'),okb=bar.querySelector(".shr-ok");
var LB=nat?nat.textContent:"Share",CP=cpy?cpy.textContent:"Copy",OK=okb?okb.getAttribute("data-ok"):"OK";
var can=document.querySelector('link[rel="canonical"]'),base=(can&&can.href)||location.href.split("#")[0];
function abs(h){try{return new URL(h,base).href}catch(e){return base}}
function clip(s,n){s=(s||"").replace(/\s+/g," ").trim();return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,"")+"…":s}
var ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
var pop=null,cur=null,seen={},root=document.querySelector("main")||document.body,n=0;
function close(){if(pop)pop.hidden=true;if(cur){var f=cur;cur=null;f.setAttribute("aria-expanded","false");try{f.focus()}catch(e){}}}
function open(b,it){if(cur===b){close();return}if(cur){cur.setAttribute("aria-expanded","false")}
 if(!pop){pop=document.createElement("div");pop.className="shp";pop.setAttribute("role","dialog");pop.hidden=true;document.body.appendChild(pop)}
 pop.innerHTML="";var t=document.createElement("p");t.className="shp-t";t.textContent=it.t;pop.appendChild(t);
 var st=document.createElement("span");st.className="shr-ok";st.setAttribute("role","status");
 (it.extra||[]).forEach(function(x){var eb=document.createElement("button");eb.type="button";eb.className="shr-b";eb.textContent=x.l;eb.addEventListener("click",function(){x.fn(function(m){st.textContent=m;setTimeout(function(){st.textContent=""},4000)})});pop.appendChild(eb)});
 if(navigator.share){var nb=document.createElement("button");nb.type="button";nb.className="shr-b";nb.textContent=LB;nb.addEventListener("click",function(){try{navigator.share({title:it.t,text:it.d||it.t,url:it.u}).catch(function(){})}catch(e){}});pop.appendChild(nb)}
 nets.forEach(function(x){var a=document.createElement("a");a.className="shr-l";a.href=SH.lk(x[0],it.u,it.t,it.d);a.textContent=x[1];if(x[0]!=="mail"){a.target="_blank";a.rel="noopener noreferrer"}pop.appendChild(a)});
 var c=document.createElement("button");c.type="button";c.className="shr-b";c.textContent=CP;
 c.addEventListener("click",function(){SH.copy(it.u,function(ok){st.textContent=ok?OK:it.u;setTimeout(function(){st.textContent=""},4000)})});pop.appendChild(c);pop.appendChild(st);
 pop.hidden=false;cur=b;b.setAttribute("aria-expanded","true");
 var r=b.getBoundingClientRect(),w=pop.offsetWidth,x=r.left+window.pageXOffset;x=Math.max(8,Math.min(x,document.documentElement.clientWidth-w-8+window.pageXOffset));
 pop.style.left=x+"px";pop.style.top=(r.bottom+window.pageYOffset+6)+"px";var f=pop.querySelector("a,button");if(f)f.focus()}
SH.open=open;
function mk(it,fig){var b=document.createElement("button");b.type="button";b.className="shi";b.setAttribute("aria-haspopup","dialog");b.setAttribute("aria-expanded","false");b.setAttribute("aria-label",LB+": "+clip(it.t,80));b.title=LB;b.innerHTML=ICON;
 b.addEventListener("click",function(e){e.stopPropagation();open(b,it)});return b}
/* headlines that lead to an event page: each card or list entry shown, not the news ticker or the menus */
var ev=/(^|\/)event\/\d+\.html$/,cnt=0;
[].forEach.call(root.querySelectorAll("a[href]"),function(a){var h=a.getAttribute("href");if(cnt>=90||!ev.test(h)||a.closest(".shr,nav,header,footer,.dev,.rl,.foryou,.pbar,[data-nosh]"))return;
 var p=a.parentElement,txt=a.textContent.trim();if(!p||txt.length<20)return;
 if(!(/^H[2-4]$/.test(p.tagName)||/(^|\s)hl-/.test(a.className||"")))return;
 var h2=/^H[2-4]$/.test(p.tagName)?p:a,d="",c=h2.parentElement,i=0;
 while(c&&i<2&&!d){var q=c.querySelector(".dek");if(q&&!q.contains(a))d=clip(q.textContent,200);if(!d){var s2=h2.nextElementSibling;if(s2&&(s2.tagName==="P"||s2.classList.contains("dek")))d=clip(s2.textContent,200)}
  var hs={};[].forEach.call(c.querySelectorAll("a[href]"),function(z){if(ev.test(z.getAttribute("href")))hs[z.getAttribute("href")]=1});if(Object.keys(hs).length>1){d=d||"";break}c=c.parentElement;i++}
 cnt++;h2.insertAdjacentElement(h2===a?"afterend":"beforeend",mk({u:abs(h),t:clip(txt,160),d:d}))});
/* charts and figures: the page, at that figure */
[].forEach.call(root.querySelectorAll("figure"),function(f){if(f.closest("[data-nosh],.whobox")||!f.querySelector("svg,canvas"))return;
 var cap=f.querySelector("figcaption"),h=f,t="";while(h&&!t){h=h.previousElementSibling||h.parentElement;if(h&&/^H[1-4]$/.test(h.tagName))t=h.textContent;if(h===root)break}
 t=clip((cap&&cap.textContent)||t||document.title,160);if(!f.id)f.id="fig-"+(++n);
 f.classList.add("shf");f.appendChild(mk({u:base.split("#")[0]+"#"+f.id,t:t,d:clip(document.title,200)}))});
document.addEventListener("click",function(e){if(cur&&pop&&!pop.contains(e.target))close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&cur)close()})})();

/* RSK-38: risk filter and scale */
(function(){var TX={"en":{"label":"Filter by risk","all":"All","b4":"4+ Elevated","b6":"6+ High","b8":"8+ Critical","shown":"{n} of {m} shown","what":"What is the risk score?","more":"How the numbers are made","expl":"Risk runs from 0 to 10 and describes the harm the coverage reports: severity, urgency and knock-on effects. It is an analytical indicator, not a forecast.","scale":["0–2 Low","2–4 Moderate","4–6 Elevated","6–8 High","8–10 Critical"]},"el":{"label":"Φίλτρο κινδύνου","all":"Όλα","b4":"4+ Αυξημένος","b6":"6+ Υψηλός","b8":"8+ Κρίσιμος","shown":"{n} από {m}","what":"Τι είναι ο δείκτης κινδύνου;","more":"Πώς υπολογίζονται οι αριθμοί","expl":"Ο κίνδυνος κυμαίνεται από 0 έως 10 και περιγράφει τη βλάβη που αναφέρει η κάλυψη: σοβαρότητα, επείγον χαρακτήρα και αλυσιδωτές επιπτώσεις. Είναι αναλυτικός δείκτης, όχι πρόβλεψη.","scale":["0–2 Χαμηλός","2–4 Μέτριος","4–6 Αυξημένος","6–8 Υψηλός","8–10 Κρίσιμος"]},"es":{"label":"Filtrar por riesgo","all":"Todos","b4":"4+ Elevado","b6":"6+ Alto","b8":"8+ Crítico","shown":"{n} de {m}","what":"¿Qué es la puntuación de riesgo?","more":"Cómo se calculan los números","expl":"El riesgo va de 0 a 10 y describe el daño que recoge la cobertura: gravedad, urgencia y efectos en cadena. Es un indicador analítico, no una previsión.","scale":["0–2 Bajo","2–4 Moderado","4–6 Elevado","6–8 Alto","8–10 Crítico"]},"fr":{"label":"Filtrer par risque","all":"Tous","b4":"4+ Élevé","b6":"6+ Fort","b8":"8+ Critique","shown":"{n} sur {m}","what":"Que signifie le score de risque ?","more":"Comment les chiffres sont établis","expl":"Le risque va de 0 à 10 et décrit le dommage que rapporte la couverture : gravité, urgence et effets en chaîne. C'est un indicateur analytique, pas une prévision.","scale":["0–2 Faible","2–4 Modéré","4–6 Élevé","6–8 Fort","8–10 Critique"]},"de":{"label":"Nach Risiko filtern","all":"Alle","b4":"4+ Erhöht","b6":"6+ Hoch","b8":"8+ Kritisch","shown":"{n} von {m}","what":"Was bedeutet der Risikowert?","more":"Wie die Zahlen entstehen","expl":"Das Risiko reicht von 0 bis 10 und beschreibt den Schaden, den die Berichterstattung schildert: Schwere, Dringlichkeit und Folgewirkungen. Es ist ein analytischer Indikator, keine Prognose.","scale":["0–2 Niedrig","2–4 Mäßig","4–6 Erhöht","6–8 Hoch","8–10 Kritisch"]},"ar":{"label":"تصفية حسب الخطر","all":"الكل","b4":"4+ مرتفع نسبياً","b6":"6+ عالٍ","b8":"8+ حرج","shown":"{n} من {m}","what":"ما هو مؤشر الخطر؟","more":"كيف تُحسب الأرقام","expl":"يتراوح الخطر بين 0 و10 ويصف الضرر الذي تنقله التغطية: الخطورة والإلحاح والآثار المتتابعة. هو مؤشر تحليلي وليس توقعاً.","scale":["0–2 منخفض","2–4 معتدل","4–6 مرتفع نسبياً","6–8 عالٍ","8–10 حرج"]},"ru":{"label":"Фильтр по риску","all":"Все","b4":"4+ Повышенный","b6":"6+ Высокий","b8":"8+ Критический","shown":"{n} из {m}","what":"Что означает оценка риска?","more":"Как считаются цифры","expl":"Риск измеряется от 0 до 10 и описывает ущерб, о котором сообщают СМИ: тяжесть, срочность и цепные последствия. Это аналитический индикатор, а не прогноз.","scale":["0–2 Низкий","2–4 Умеренный","4–6 Повышенный","6–8 Высокий","8–10 Критический"]}};var L=document.documentElement.getAttribute("lang")||"en",T=TX[L]||TX.en;
function init(){var all=[].slice.call(document.querySelectorAll(".rk")).filter(function(x){return !x.closest("nav,header,footer,.mega-dd,[data-no-risk],.tk,.rkbar")});
if(all.length<6)return;var by=[],rows=[];
all.forEach(function(x){var r=x.closest("li,article,tr");if(!r||rows.indexOf(r)>-1)return;rows.push(r);var p=r.parentNode,g=by.filter(function(b){return b.p===p})[0];if(!g){g={p:p,r:[]};by.push(g)}
var m=(x.textContent||"").match(/(\d+(?:[.,]\d+)?)\s*$/);g.r.push({el:r,v:m?parseFloat(m[1].replace(",",".")):0})});
by.sort(function(a,b){return b.r.length-a.r.length});var g=by[0];if(!g||g.r.length<6||document.querySelector(".rkbar"))return;
var bar=document.createElement("div");bar.className="rkbar";bar.setAttribute("role","group");bar.setAttribute("aria-label",T.label);
var man=document.querySelector('link[rel=manifest]'),root=man?(man.getAttribute("href")||"").replace(/site\.webmanifest.*$/,""):"";
var lv=[[0,T.all],[4,T.b4],[6,T.b6],[8,T.b8]],cur=0;try{cur=+sessionStorage.getItem("rk")||0}catch(e){}
bar.innerHTML='<div class="rkbar-r"><span class="rkbar-t"></span></div><details><summary></summary><p></p><ul class="rkbar-s"></ul><p><a></a></p></details>';
var row=bar.querySelector(".rkbar-r");bar.querySelector(".rkbar-t").textContent=T.label;
var n=document.createElement("span");n.className="rkbar-n";n.setAttribute("aria-live","polite");
lv.forEach(function(l){var b=document.createElement("button");b.type="button";b.textContent=l[1];b.setAttribute("data-m",l[0]);row.appendChild(b)});row.appendChild(n);
var d=bar.querySelector("details");d.querySelector("summary").textContent=T.what;d.querySelector("p").textContent=T.expl;
var cl=["","m","e","h","c"];T.scale.forEach(function(s,i){var li=document.createElement("li");li.className=cl[i]==="" ? "" : cl[i];li.innerHTML="<i></i>";li.appendChild(document.createTextNode(s));d.querySelector("ul").appendChild(li)});
var a=d.querySelector("a");a.textContent=T.more;a.href=root+"about.html#numbers";
function apply(min){cur=min;var k=0;g.r.forEach(function(r){var off=r.v<min;if(off)r.el.setAttribute("data-rkh","");else{r.el.removeAttribute("data-rkh");k++}});
[].forEach.call(row.querySelectorAll("button"),function(b){b.setAttribute("aria-pressed",String(+b.getAttribute("data-m")===min))});
n.textContent=min?T.shown.replace("{n}",k).replace("{m}",g.r.length):"";try{sessionStorage.setItem("rk",String(min))}catch(e){}}
row.addEventListener("click",function(ev){var b=ev.target.closest("button[data-m]");if(b)apply(+b.getAttribute("data-m"))});
g.p.parentNode.insertBefore(bar,g.p);apply(cur)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()})();

(function(){var K="athena_adx_hide",D=7*864e5;function rd(){try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){return {}}}
function wr(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
var o=rd(),n=Date.now(),ch=false;for(var k in o){if(n-o[k]>D){delete o[k];ch=true}}if(ch)wr(o);
function hide(s){var a=document.querySelector(".adx-"+s);if(a)a.classList.add("adx-off")}
for(var k in o)hide(k);
document.addEventListener("click",function(ev){var b=ev.target.closest&&ev.target.closest(".adx-x");if(!b)return;var s=b.getAttribute("data-adx");hide(s);var q=rd();q[s]=Date.now();wr(q)})})();
