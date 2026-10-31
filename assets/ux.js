
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
  var DUR = 5.0;                                                        /* LOOK-31: five seconds (was 6.2) */
  function intro(then) {
    if (!IN.on || document.querySelector(".aintro")) { if (then) then(); return; }
    var calm = false; try { calm = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
    if (calm) { if (then) then(); return; }
    var el = document.createElement("div"); el.className = "aintro"; el.setAttribute("role", "img"); el.setAttribute("aria-label", "ATHENA Intelligence");
    var tag = (IN.tag || []).map(function (x, i) { return (i ? "<b>·</b>" : "") + "<span>" + esc(x) + "</span>"; }).join("");
    el.innerHTML = '<svg class="ai-globe" viewBox="-100 -100 200 200" fill="none" stroke="#d4b06a" stroke-width=".55" aria-hidden="true"><g></g></svg>' +
      '<div class="ai-rule ai-r1"></div><div class="ai-rule ai-r2"></div><div class="ai-blk"><div style="position:relative;display:grid;place-items:center">' +
      '<div class="ai-halo"></div>' + MARK + '</div><div><p class="ai-wm">' + "ATHENA".split("").map(function (c) { return "<span>" + c + "</span>"; }).join("") +
      '</p><p class="ai-sub">NEWS ROOM</p><p class="ai-tag">' + tag + '</p></div></div><div class="ai-bar"></div>' +
      '<button type="button" class="ai-skip">' + esc(IN.skip || "Skip") + " &rsaquo;</button>";
    document.body.appendChild(el);
    var q = function (s) { return el.querySelector(s); }, qa = function (s) { return el.querySelectorAll(s); };
    var cl = function (x) { return Math.max(0, Math.min(1, x)); }, ease = function (x) { return 1 - Math.pow(1 - cl(x), 3); };
    var t0 = null, raf = 0, done = false, g = q(".ai-globe g"), mk = q(".ai-mark"), halo = q(".ai-halo"), lids = qa(".ai-l"), pup = q(".ai-pup");
    var letters = qa(".ai-wm span"), sub = q(".ai-sub"), tags = qa(".ai-tag span, .ai-tag b"), rules = qa(".ai-rule"), bar = q(".ai-bar");
    function frame(now) {
      if (done) return;
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000, r = ease(t / 1.0);
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
  var W = 0, H = 0, dpr = Math.min(3, window.devicePixelRatio || 1), on = true, raf = 0, t = 0, P = [], X = {}, COINS = [], ATH = null, mx = -999, my = -999, C = {}, SPR = {};
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
  function colours() { C = { gold: css("--gold", "#a8843a"), ink: css("--ink", "#141a24"), muted: css("--muted", "#6b7280"), rule: css("--rule", "#d9d1c1"),
    paper: css("--card", "#fffdf9"), up: "#1f9d55", down: css("--crit", "#9f1239") };
    C.risk = [C.gold, css("--elev", "#a16207"), css("--high", "#c2410c"), C.down]; SPR = {}; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function size() { var r = box.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function count(per, lo, hi) { return Math.max(lo || 10, Math.min(hi || 40, Math.round(W / per))); }
  function RR() { return W < 640 ? 7 : 9.5; }
  function line(a, b, c, w, al) { cx.globalAlpha = al; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.strokeStyle = c; cx.lineWidth = w; cx.stroke(); }
  function ring(x, y, r, c, w, al) { cx.globalAlpha = al; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.strokeStyle = c; cx.lineWidth = w; cx.stroke(); }
  function dot(x, y, r, c, al) { cx.globalAlpha = al; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fillStyle = c; cx.fill(); }
  function drift(p, sp, pad, keep) { p.x += p.vx * sp; p.y += p.vy * sp; var ex = Math.max(pad, 14); if (p.x < ex || p.x > W - ex) { p.vx *= -1; p.x = Math.max(ex, Math.min(W - ex, p.x)); }
    if (p.y < pad || p.y > H - pad) { p.vy *= -1; p.y = Math.max(pad, Math.min(H - pad, p.y)); }
    if (keep) return; var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 4900) { var d = Math.sqrt(d2 + 1); p.x += dx / d * 1.7; p.y += dy / d * 1.7; } }
  /* LOOK-31 (30 Oct 2026): symbols keep a gap between them - the coins and the emblem push the others gently away */
  function apart(list, gap) { for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) { var a = list[i], b = list[j]; if (a.x == null || b.x == null) continue;
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || .01, g = (a.r || 0) + (b.r || 0) + gap; if (d >= g) continue; var k = (g - d) / d * .5; dx *= k; dy *= k;
      if (!a.fixed) { a.x -= dx; a.y -= dy; } if (!b.fixed) { b.x += dx; b.y += dy; } } }
  /* every symbol is drawn once into a small sprite at the screen's own sharpness; the animation only moves the sprites */
  function sprite(key, r, draw) { var k = key + "|" + r; if (SPR[k]) return SPR[k]; var c = document.createElement("canvas"), s = Math.ceil((r * 2 + 4) * dpr); c.width = c.height = s;
    var g = c.getContext("2d"); g.scale(dpr, dpr); g.translate(r + 2, r + 2); draw(g, r); return SPR[k] = c; }
  function put(s, x, y, r, al) { cx.globalAlpha = al == null ? 1 : al; cx.drawImage(s, x - r - 2, y - r - 2, s.width / dpr, s.height / dpr); }
  function disc(g, r, fill, edge) { g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.fillStyle = fill; g.fill(); if (edge) { g.lineWidth = 1.3; g.strokeStyle = edge; g.stroke(); } }
  function glyph(g, r, d, col, w) { var s = r * 1.25 / 24; g.save(); g.scale(s, s); g.translate(-12, -12); g.lineWidth = w || 1.9; g.lineCap = g.lineJoin = "round"; g.strokeStyle = col; g.stroke(new Path2D(d)); g.restore(); }
  function txt(g, r, s, size, col) { g.font = "800 " + size + "px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, 0, r * .05); }
  function sym(k, r) { return sprite(k, r, function (g, r) {
    if (k.indexOf("f:") === 0) { var f = FL[k.slice(2)]; disc(g, r, C.paper, C.rule); g.save(); g.beginPath(); g.arc(0, 0, r - 2, 0, 6.2832); g.clip();
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
  var OP = { shield: new Path2D("M32 3 L57 13.5 V33 C57 47.5 46.5 56.5 32 61 C17.5 56.5 7 47.5 7 33 V13.5 Z"), ears: new Path2D("M14.5 24 L17.5 9.5 L25.5 17.5 Z M49.5 24 L46.5 9.5 L38.5 17.5 Z"),
    head: new Path2D("M32 18.5 C25 13.5 14 15 14 27.5 C14 38.5 22.5 45 32 47 C41.5 45 50 38.5 50 27.5 C50 15 39 13.5 32 18.5 Z"),
    brow: new Path2D("M17.5 23.5 Q24.5 18.5 32 24 Q39.5 18.5 46.5 23.5"), beak: new Path2D("M29.2 29.5 H34.8 L32 37.5 Z"), chev: new Path2D("M23 51 L27.5 54 L32 51 L36.5 54 L41 51") };
  var OG = "#C9A45C", OL = "#E2C27F", ON = "#0B1630", OH = "#14254D";
  function owlVec(x, y, r, col) {
    var tt = still ? 0 : t, look = still ? 0 : Math.sin(tt / 55) * 1.7 + Math.sin(tt / 23) * .4, bl = (tt % 260), lid = bl < 9 ? Math.sin(bl / 9 * Math.PI) : 0;
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
    cx.fillStyle = OH; cx.fill(OP.head); cx.lineWidth = 1.6; cx.strokeStyle = OG; cx.stroke(OP.head);
    cx.fillStyle = OG; cx.fill(OP.ears);
    cx.lineWidth = 2; cx.lineCap = "round"; cx.strokeStyle = OL; cx.stroke(OP.brow);
    [24, 40].forEach(function (ex) { cx.beginPath(); cx.arc(ex, 30, 6.2, 0, 6.2832); cx.lineWidth = 1.8; cx.strokeStyle = OG; cx.stroke();
      cx.beginPath(); cx.arc(ex, 30, 4, 0, 6.2832); cx.fillStyle = OL; cx.fill();
      cx.beginPath(); cx.arc(ex + look, 30, 1.8, 0, 6.2832); cx.fillStyle = ON; cx.fill();
      cx.beginPath(); cx.arc(ex + look + .9, 29, .7, 0, 6.2832); cx.fillStyle = "#fff"; cx.fill();
      if (lid > 0) { cx.beginPath(); cx.ellipse(ex, 30 - 6.2 * (1 - lid), 6.4, 6.4 * lid + .01, 0, 0, 6.2832); cx.fillStyle = OH; cx.fill(); } });
    cx.fillStyle = OG; cx.fill(OP.beak); cx.lineWidth = 1.5; cx.strokeStyle = OG; cx.globalAlpha = .75; cx.stroke(OP.chev);
    cx.restore(); cx.restore(); }
  function emblem(x, y, r, col, fl) {
    var f = fl == null ? .5 + .5 * Math.sin(t / 7) : fl;                                       /* the flash */
    cx.globalAlpha = .18 + .32 * f; var gr = cx.createRadialGradient(x, y, r * .5, x, y, r * 2.3); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r * 2.3, 0, 6.2832); cx.fill();
    ring(x, y, r + 3 + ((t % 80) / 80) * 16, col, 2, .5 * (1 - (t % 80) / 80));               /* a ring goes out every ~1.3 s */
    owlVec(x, y, r, col); }
  function owl(x, y, r, col) { emblem(x, y, Math.max(r, CR()), col); }

  /* the partners' coins: gold rim, a soft breathing glow; they never run from the pointer and stop while pointed at */
  function coins() { var rc = CR(); COINS = PART.map(function (p, i) { return { p: p, x: W * (i ? .72 : .3), y: H * (i ? .42 : .55), vx: i ? -.18 : .22, vy: i ? -.07 : .08, ph: i * Math.PI, r: rc }; });
    ATH = { x: W * .5, y: H * .5, vx: .16, vy: -.06, r: rc }; }
  function drawCoins(links) {
    COINS.forEach(function (c) { drift(c, c.hot ? 0 : .8, c.r + 4, true); c.ph += .03;
      if (links) P.forEach(function (p) { if (p.x == null) return; var d = Math.hypot(c.x - p.x, c.y - p.y); if (d < 110) line(c, p, C.gold, 1.1, (1 - d / 110) * .6); }); });
    COINS.forEach(function (c) { var im = c.p.im; if (!im.complete || !im.naturalWidth) return; var g = .5 + .5 * Math.sin(c.ph), r = c.r * (c.hot ? 1.12 : 1);
      cx.globalAlpha = (.22 + .18 * g) * (c.hot ? 1.3 : 1); var gr = cx.createRadialGradient(c.x, c.y, c.r * .6, c.x, c.y, c.r * 2.1); gr.addColorStop(0, C.gold); gr.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = gr; cx.beginPath(); cx.arc(c.x, c.y, c.r * 2.1, 0, 6.2832); cx.fill();
      dot(c.x, c.y, r + 1.6, C.gold, 1); cx.save(); cx.beginPath(); cx.arc(c.x, c.y, r, 0, 6.2832); cx.clip(); cover(cx, im, c.x, c.y, r); cx.restore(); }); }
  function drawMark() { if (!ATH) return; drift(ATH, .8, ATH.r + 4, true); emblem(ATH.x, ATH.y, ATH.r, C.gold); }
  function hit(x, y) { for (var i = 0; i < COINS.length; i++) { var c = COINS[i]; if (Math.hypot(x - c.x, y - c.y) <= c.r + 6) return c; } return null; }

  var M = {
    /* reports from different newsrooms meet and become a verified event: its section icon flashes in its risk colour (sometimes the owl) */
    news: { init: function () { var K = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].concat(crypto(), FLK); P = [];
        for (var i = 0, n = count(38, 12, 40); i < n; i++) P.push({ x: rnd(0, W), y: rnd(14, H - 14), vx: rnd(-.32, .32) || .2, vy: rnd(-.13, .13), src: i % 5, ev: 0, k: K[i % K.length] }); },
      step: function () { var r = RR(); P.forEach(function (p) { drift(p, 1, 12); });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 84 && a.src !== b.src) { line(a, b, C.gold, 1, (1 - d / 84) * .5);
            if (d < 24 && !a.ev && !b.ev) { a.ev = b.ev = 110; a.lvl = b.lvl = (Math.random() * 4) | 0; a.cat = b.cat = String(1 + ((Math.random() * 10) | 0)); a.owl = b.owl = Math.random() < .18; } } }
        P.forEach(function (p) { if (p.ev) { p.ev--; var k = p.ev / 110, col = C.risk[p.lvl]; ring(p.x, p.y, r + 4 + (1 - k) * 28, col, 2, .32 * k);
            if (p.owl) owl(p.x, p.y, r + 2, col); else put(evsym(p.cat, col, r + 2), p.x, p.y, r + 2); }
          else put(sym(p.k, r), p.x, p.y, r, .92); }); } },
    /* the day's stories settle into two rows, like a briefing being written */
    brief: { init: function () { var cols = Math.max(4, Math.round(W / 150)); X = { cols: cols }; P = [];
        for (var i = 0; i < cols * 2; i++) P.push({ tx: (i % cols + .5) * W / cols, ty: i < cols ? H * .33 : H * .7, x: rnd(0, W), y: rnd(0, H), k: String(1 + (i % 10)), lvl: (Math.random() * 4) | 0, d: i * 14 }); },
      step: function () { var r = RR(), cw = W / X.cols; cx.globalAlpha = .25; cx.fillStyle = C.rule; cx.fillRect(0, H * .33, W, 1); cx.fillRect(0, H * .7, W, 1);
        P.forEach(function (p) { if (p.d > 0) { p.d--; return; } p.x += (p.tx - p.x) * .04; p.y += (p.ty - p.y) * .04; var done = Math.hypot(p.tx - p.x, p.ty - p.y) < 1;
          if (done && Math.random() < .002) { p.x = rnd(0, W); p.y = -20; p.k = String(1 + ((Math.random() * 10) | 0)); p.lvl = (Math.random() * 4) | 0; }
          if (done) { cx.globalAlpha = .35; cx.fillStyle = C.muted; cx.fillRect(p.x + r + 6, p.y - 3, Math.max(0, Math.min(90, cw - r * 2 - 24)), 2.4); cx.fillRect(p.x + r + 6, p.y + 2, Math.max(0, Math.min(56, cw - r * 2 - 40)), 2); }
          put(done ? evsym(p.k, C.risk[p.lvl], r) : sym(p.k, r), p.x, p.y, r, done ? 1 : .7); }); } },
    /* events (section icons in risk colours) linked to the countries they touch and the newsrooms that report them */
    graph: { init: function () { P = []; for (var i = 0, n = count(42, 12, 36); i < n; i++) { var k = i % 3;
          P.push({ x: rnd(0, W), y: rnd(12, H - 12), vx: rnd(-.25, .25) || .15, vy: rnd(-.1, .1), t: k, k: k === 0 ? String(1 + (i % 10)) : k === 1 ? pick(FLK) : "", lvl: (Math.random() * 4) | 0 }); } },
      step: function () { var r = RR(); P.forEach(function (p) { drift(p, 1, 12); });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j]; if ((a.t === 0) === (b.t === 0)) continue;
          var d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 100) line(a, b, a.t === 0 ? C.risk[a.lvl] : C.risk[b.lvl], 1.2, (1 - d / 100) * .55); }
        P.forEach(function (p) { if (p.t === 0) put(evsym(p.k, C.risk[p.lvl], r + 1), p.x, p.y, r + 1); else if (p.t === 1) put(sym(p.k, r - 1), p.x, p.y, r - 1); else dot(p.x, p.y, 3, C.ink, .85); }); } },
    /* flag pins drop on a map grid, light up and pass the light to their neighbours */
    pins: { init: function () { P = []; for (var i = 0, n = count(60, 8, 26); i < n; i++) P.push({ x: rnd(14, W - 14), y: rnd(H * .52, H - 8), z: 0, d: i * 10 + rnd(0, 40), lit: 0, k: pick(FLK) }); },
      step: function () { var r = RR(); cx.globalAlpha = .16; cx.fillStyle = C.rule; for (var gx = 0; gx < W; gx += 28) cx.fillRect(gx, 0, 1, H); for (var gy = 0; gy < H; gy += 28) cx.fillRect(0, gy, W, 1);
        P.forEach(function (p) { if (p.d > 0) { p.d--; return; } p.z = Math.min(1, p.z + .05); if (Math.random() < .004) p.lit = 70; if (p.lit) p.lit--; });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j]; if (!a.z || !b.z) continue; var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120 && (a.lit || b.lit)) { line(a, b, C.gold, 1.2, .5 * (1 - d / 120)); if (a.lit > 35 && !b.lit) b.lit = 45; } }
        P.forEach(function (q) { if (!q.z) return; var y = q.y - (1 - q.z) * 40, hy = y - r - 8; if (q.lit) ring(q.x, q.y, 16 - q.lit / 6, C.gold, 1.5, .35 * q.lit / 70);
          cx.globalAlpha = q.z; cx.beginPath(); cx.moveTo(q.x, y); cx.lineTo(q.x - 4, hy + r * .6); cx.lineTo(q.x + 4, hy + r * .6); cx.closePath(); cx.fillStyle = q.lit ? C.gold : C.muted; cx.fill();
          put(sym(q.k, r), q.x, hy, r, q.z); if (q.lit) ring(q.x, hy, r + 2, C.gold, 2, q.z); }); } },
    /* ships sail between flagged ports and steer around a hazard */
    sea: { init: function () { var n = Math.max(4, Math.min(8, Math.round(W / 160))); X = { ports: [], ships: [], hz: { x: W * rnd(.38, .62), y: H * .5, ph: 0 } };
        for (var i = 0; i < n; i++) X.ports.push({ x: (i + .5) * W / n + rnd(-20, 20), y: i % 2 ? H * .24 : H * .76, k: FLK[i % FLK.length] });
        for (i = 0; i < n + 2; i++) { var a = (Math.random() * n) | 0; X.ships.push({ a: a, b: (a + 1 + ((Math.random() * (n - 1)) | 0)) % n, s: Math.random(), v: rnd(.0015, .0035) }); } },
      step: function () { var r = RR(); cx.strokeStyle = C.gold; cx.lineWidth = 1;
        for (var w = 0; w < 3; w++) { cx.globalAlpha = .2; cx.beginPath(); for (var x = 0; x <= W; x += 8) { var y = H * (.3 + w * .2) + Math.sin(x / 40 + t / 30 + w) * 3; if (x) cx.lineTo(x, y); else cx.moveTo(x, y); } cx.stroke(); }
        var hz = X.hz; hz.ph = (hz.ph + 1) % 120; ring(hz.x, hz.y, 6 + hz.ph / 3, C.risk[3], 2, .45 * (1 - hz.ph / 120)); put(evsym("10", C.risk[3], r), hz.x, hz.y, r);
        X.ports.forEach(function (p) { put(sym(p.k, r - 1), p.x, p.y, r - 1); });
        X.ships.forEach(function (s) { s.s += s.v; if (s.s >= 1) { s.a = s.b; s.b = (s.b + 1 + ((Math.random() * (X.ports.length - 1)) | 0)) % X.ports.length; s.s = 0; }
          var A = X.ports[s.a], B = X.ports[s.b], x = A.x + (B.x - A.x) * s.s, y = A.y + (B.y - A.y) * s.s, dx = x - hz.x, dy = y - hz.y, d = Math.hypot(dx, dy) || 1;
          if (d < 40) { x += dx / d * (40 - d); y += dy / d * (40 - d); }
          line(A, { x: x, y: y }, C.gold, 1, .22); put(d < 46 ? evsym("ship", C.risk[2], r - 1) : sym("ship", r - 1), x, y, r - 1); }); } },
    /* a radar sweep lights up the topics it passes, each in its risk colour */
    radar: { init: function () { P = []; X = { cx: W * .5, cy: H * 1.15, R: Math.max(W * .62, H * 2) };
        for (var i = 0, n = count(45, 10, 30); i < n; i++) { var x = rnd(14, W - 14), y = rnd(14, H - 14), a = Math.atan2(y - X.cy, x - X.cx); if (a < 0) a += 6.2832;
          P.push({ x: x, y: y, ang: a, k: String(1 + (i % 10)), lit: 0, lvl: (Math.random() * 4) | 0 }); } },
      step: function () { var r = RR(), sw = Math.PI + ((t * .012) % Math.PI);
        for (var k = 1; k <= 4; k++) ring(X.cx, X.cy, X.R * k / 4, C.rule, 1, .5);
        for (var s = 0; s < 14; s++) { var a = sw - s * .02; line({ x: X.cx, y: X.cy }, { x: X.cx + Math.cos(a) * X.R, y: X.cy + Math.sin(a) * X.R }, C.gold, 2, .35 * (1 - s / 14)); }
        P.forEach(function (p) { if (Math.abs(p.ang - sw) < .03) p.lit = 55; if (p.lit) p.lit--; var l = p.lit / 55;
          if (p.lit) ring(p.x, p.y, r + 3 + (1 - l) * 14, C.risk[p.lvl], 1.6, .4 * l); put(p.lit ? evsym(p.k, C.risk[p.lvl], r) : sym(p.k, r), p.x, p.y, r, .45 + .55 * l); }); } },
    /* signals and official warnings: beacons pulse - the higher the level, the faster and redder */
    beacons: { init: function () { P = []; for (var i = 0, n = count(80, 6, 18); i < n; i++) P.push({ x: (i + .5) * W / n + rnd(-15, 15), y: rnd(H * .3, H * .75), lvl: (Math.random() * 4) | 0, ph: rnd(0, 120), sp: rnd(.6, 1.4) }); },
      step: function () { var r = RR();
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], ra = r + a.ph / 4, rb = r + b.ph / 4, d = Math.hypot(a.x - b.x, a.y - b.y);
          if (ra + rb > d) { line(a, b, C.gold, 1.6, .3 * (1 - Math.max(a.ph, b.ph) / 120)); dot((a.x + b.x) / 2, (a.y + b.y) / 2, 2.6, C.gold, .7); } }   /* rings overlap: sources agree */
        P.forEach(function (p) { p.ph = (p.ph + p.sp * (1 + p.lvl * .4)) % 120; var col = C.risk[p.lvl];
        for (var k = 0; k < 2; k++) { var ph = (p.ph + k * 60) % 120; ring(p.x, p.y, r + ph / 4, col, 1.8, .45 * (1 - ph / 120)); }
        put(evsym(p.lvl >= 2 ? "10" : "beacon", col, r), p.x, p.y, r); }); } },
    /* markets in the news: two trend lines (an illustration - never prices) and market symbols that tick up or down as they cross */
    markets: { init: function () { var n = Math.max(40, Math.round(W / 8)), vb = .45, ve = .62; X = { b: [], e: [], off: 0 };
        for (var i = 0; i < n; i++) { vb = Math.max(.18, Math.min(.82, vb + rnd(-.035, .035))); ve = Math.max(.18, Math.min(.82, ve + rnd(-.04, .04))); X.b.push(vb); X.e.push(ve); }
        var K = ["etf", "stk", "oil", "gold", "eur", "usd", "2", "6"].concat(crypto(), crypto()); P = [];
        for (i = 0; i < count(60, 8, 22); i++) P.push({ x: rnd(0, W), y: rnd(14, H - 14), vx: rnd(-.3, .3) || .2, vy: rnd(-.12, .12), k: K[i % K.length], tick: 0, up: true }); },
      step: function () { var r = RR(), n = X.b.length, dx = W / (n - 1); X.off += .6;
        if (X.off >= dx) { X.off -= dx; X.b.shift(); X.e.shift(); X.b.push(Math.max(.18, Math.min(.82, X.b[n - 2] + rnd(-.035, .035)))); X.e.push(Math.max(.18, Math.min(.82, X.e[n - 2] + rnd(-.04, .04)))); }
        cx.globalAlpha = .14; cx.fillStyle = C.rule; for (var gy = H * .25; gy < H; gy += H * .25) cx.fillRect(0, gy, W, 1);
        [[X.b, "#f7931a"], [X.e, "#627eea"]].forEach(function (L) { cx.globalAlpha = .75; cx.beginPath();
          for (var i = 0; i < n; i++) { var x = i * dx - X.off, y = L[0][i] * H; if (i) cx.lineTo(x, y); else cx.moveTo(x, y); }
          cx.strokeStyle = L[1]; cx.lineWidth = 2; cx.stroke(); cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath(); cx.globalAlpha = .06; cx.fillStyle = L[1]; cx.fill(); });
        P.forEach(function (p) { drift(p, 1, 12); var i = Math.max(0, Math.min(n - 1, Math.round((p.x + X.off) / dx))), above = p.y < X.b[i] * H;
          if (p.prev != null && above !== p.prev && !p.tick) { p.tick = 70; p.up = above; } p.prev = above;
          if (p.tick) { p.tick--; var a = p.tick / 70, col = p.up ? C.up : C.down; cx.globalAlpha = a; cx.font = "700 " + (r * 1.1) + "px system-ui,sans-serif"; cx.textAlign = "center"; cx.fillStyle = col;
            cx.fillText(p.up ? "▲" : "▼", p.x, p.y - r - 6 - (1 - a) * 10); ring(p.x, p.y, r + 3, col, 1.6, .6 * a); }
          put(sym(p.k, r), p.x, p.y, r, .95); }); } },
    /* an event page: reports stream in from both sides; from the second report on, the event is verified (owl in gold) */
    event: { init: function () { P = []; for (var i = 0, n = count(36, 10, 40); i < n; i++) P.push(spawn()); P.hits = 0; },
      step: function () { var r0 = RR(), cxp = W / 2, cyp = H / 2, pulse = Math.min(1, P.hits / 2);
        P.forEach(function (p, i) { p.k += p.v; var x = p.x0 + (cxp - p.x0) * ease(p.k), y = p.y0 + (cyp - p.y0) * ease(p.k);
          line({ x: p.x0, y: p.y0 }, { x: x, y: y }, C.rule, 1, .25); put(sym(p.s, r0 - 2), x, y, r0 - 2, 1 - p.k * .6); if (p.k >= 1) { P.hits++; P[i] = spawn(); } });
        var r = r0 + 3 + Math.sin(t / 14) * 1.2 + pulse * 3; ring(cxp, cyp, r + 10 + (t % 60) / 3, C.gold, 2, .25 * pulse);
        if (P.hits >= 2) owl(cxp, cyp, r, C.gold); else dot(cxp, cyp, r, C.muted, 1); } }
  };
  function spawn() { var left = Math.random() < .5; return { x0: left ? rnd(0, W * .3) : rnd(W * .7, W), y0: rnd(10, H - 10), k: 0, v: rnd(.004, .012), s: Math.random() < .5 ? pick(FLK) : String(1 + ((Math.random() * 10) | 0)) }; }
  function ease(k) { return k < 1 ? 1 - Math.pow(1 - k, 2) : 1; }
  var mod = M[mode] || M.news;
  function space() { if (mode === "brief" || mode === "sea" || mode === "radar" || mode === "pins" || mode === "event") return; var r = RR(), all = [];
    P.forEach(function (p) { if (p.x != null) { p.r = p.r || r; all.push(p); } }); COINS.forEach(function (c) { all.push(c); }); if (ATH && mode !== "event") all.push(ATH); apart(all, 6); }
  function frame() { if (!on) return; t++; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); space(); mod.step(); if (COINS.length) drawCoins(mode === "news"); if (mode !== "event") drawMark(); cx.globalAlpha = 1; raf = requestAnimationFrame(frame); }
  function start() { cancelAnimationFrame(raf); if (still) { for (var i = 0; i < 160; i++) { cx.clearRect(0, 0, W, H); t++; space(); mod.step(); if (COINS.length) drawCoins(mode === "news"); } if (mode !== "event") drawMark(); cx.globalAlpha = 1; return; } raf = requestAnimationFrame(frame); }
  function setup() { size(); mod.init(); coins(); }
  colours(); setup(); start();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { setup(); start(); }, 200); });
  box.addEventListener("pointermove", function (ev) { var b = box.getBoundingClientRect(); mx = ev.clientX - b.left; my = ev.clientY - b.top;
    var h = hit(mx, my); COINS.forEach(function (c) { c.hot = c === h; }); box.classList.toggle("hot", !!h); box.title = h ? h.p.name : ""; });
  box.addEventListener("pointerleave", function () { mx = my = -999; COINS.forEach(function (c) { c.hot = false; }); box.classList.remove("hot"); box.title = ""; });
  box.addEventListener("click", function (ev) { var b = box.getBoundingClientRect(), h = hit(ev.clientX - b.left, ev.clientY - b.top);
    if (h && /^https:\/\//.test(h.p.url)) { var w = window.open(h.p.url, "_blank", "noopener"); if (w) w.opener = null; } });
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
