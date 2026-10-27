
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
  var W = 0, H = 0, dpr = Math.min(3, window.devicePixelRatio || 1), on = true, raf = 0, t = 0, P = [], X = {}, COINS = [], mx = -999, my = -999, C = {}, SPR = {};
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
  var OWL = img(root + "assets/athena_mark.svg"), PART = [], SYMS = { btc: true, eth: true, x: [] };
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
  function drift(p, sp, pad, keep) { p.x += p.vx * sp; p.y += p.vy * sp; if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < pad || p.y > H - pad) p.vy *= -1;
    if (keep) return; var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 4900) { var d = Math.sqrt(d2 + 1); p.x += dx / d * 1.7; p.y += dy / d * 1.7; } }
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
    var mk = /^(etf|stk|oil|gold|eur|usd)$/.test(k); disc(g, r, C.paper, mk ? C.gold : C.rule);
    if (k === "etf") return txt(g, r, "ETF", r * .62, C.gold);
    if (k === "eur" || k === "usd") return txt(g, r, k === "eur" ? "€" : "$", r * 1.05, C.gold);
    glyph(g, r, ICON[k], mk ? C.gold : C.muted); }); }
  function evsym(k, col, r) { return sprite("ev" + k + col, r, function (g, r) { disc(g, r, col); glyph(g, r, ICON[k], "#fff", 2.2); }); }
  function owl(x, y, r, col) { if (!OWL.complete || !OWL.naturalWidth) return put(evsym("1", col, r), x, y, r); dot(x, y, r + 1.5, col, 1); cx.globalAlpha = 1; cx.drawImage(OWL, x - r, y - r, r * 2, r * 2); }

  /* the partners' coins: gold rim, a soft breathing glow; they never run from the pointer and stop while pointed at */
  function coins() { var rc = W < 640 ? 13 : 17; COINS = PART.map(function (p, i) { return { p: p, x: W * (i ? .72 : .3), y: H * (i ? .42 : .55), vx: i ? -.18 : .22, vy: i ? -.07 : .08, ph: i * Math.PI, r: rc }; }); }
  function drawCoins(links) {
    COINS.forEach(function (c) { drift(c, c.hot ? 0 : .8, c.r + 4, true); c.ph += .03;
      if (links) P.forEach(function (p) { if (p.x == null) return; var d = Math.hypot(c.x - p.x, c.y - p.y); if (d < 110) line(c, p, C.gold, 1.1, (1 - d / 110) * .6); }); });
    COINS.forEach(function (c) { var im = c.p.im; if (!im.complete || !im.naturalWidth) return; var g = .5 + .5 * Math.sin(c.ph), r = c.r * (c.hot ? 1.12 : 1);
      cx.globalAlpha = (.22 + .18 * g) * (c.hot ? 1.3 : 1); var gr = cx.createRadialGradient(c.x, c.y, c.r * .6, c.x, c.y, c.r * 2.1); gr.addColorStop(0, C.gold); gr.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = gr; cx.beginPath(); cx.arc(c.x, c.y, c.r * 2.1, 0, 6.2832); cx.fill();
      dot(c.x, c.y, r + 1.6, C.gold, 1); cx.save(); cx.beginPath(); cx.arc(c.x, c.y, r, 0, 6.2832); cx.clip(); cover(cx, im, c.x, c.y, r); cx.restore(); }); }
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
  var mod = M[mode] || M.news, withCoins = PART.length > 0;
  function frame() { if (!on) return; t++; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); mod.step(); if (COINS.length) drawCoins(mode === "news"); cx.globalAlpha = 1; raf = requestAnimationFrame(frame); }
  function start() { cancelAnimationFrame(raf); if (still) { for (var i = 0; i < 160; i++) { cx.clearRect(0, 0, W, H); t++; mod.step(); if (COINS.length) drawCoins(mode === "news"); } cx.globalAlpha = 1; return; } raf = requestAnimationFrame(frame); }
  function setup() { size(); mod.init(); if (withCoins) coins(); }
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
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
  setTimeout(close, 14000);
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
