
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
  var box = document.querySelector(".amb");
  if (!box || !box.querySelector("canvas").getContext) return;
  var cv = box.querySelector("canvas"), cx = cv.getContext("2d"), mode = box.getAttribute("data-mode") || "news";
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), on = true, raf = 0, t = 0, P = [], mx = -999, my = -999, C = {};
  function css(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function colours() { C = { gold: css("--gold", "#a8843a"), high: css("--high", "#c2410c"), crit: css("--crit", "#9f1239"), elev: css("--elev", "#a16207"),
    ink: css("--ink", "#141a24"), muted: css("--muted", "#6b7280"), rule: css("--rule", "#d9d1c1"), paper: css("--paper2", "#f3eee4") }; C.risk = [C.gold, C.elev, C.high, C.crit]; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function size() { var r = box.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function count(per) { return Math.max(10, Math.min(56, Math.round(W / per))); }
  function alpha(a) { cx.globalAlpha = a; }
  function dot(x, y, r, c) { cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fillStyle = c; cx.fill(); }
  function ring(x, y, r, c, w) { cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.strokeStyle = c; cx.lineWidth = w || 1.5; cx.stroke(); }
  function line(a, b, c, w) { cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.strokeStyle = c; cx.lineWidth = w || 1; cx.stroke(); }
  function drift(p, sp) { p.x += p.vx * sp; p.y += p.vy * sp; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < 6 || p.y > H - 6) p.vy *= -1;
    var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 3600) { p.x += dx / Math.sqrt(d2 + 1) * 1.6; p.y += dy / Math.sqrt(d2 + 1) * 1.6; } }

  var M = {
    news: { init: function () { P = []; for (var i = 0, n = count(26); i < n; i++) P.push({ x: rnd(0, W), y: rnd(8, H - 8), vx: rnd(-.35, .35) || .2, vy: rnd(-.15, .15), src: i % 5, life: 0, ev: 0 }); },
      step: function () {
        for (var i = 0; i < P.length; i++) drift(P[i], 1);
        for (i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
          var a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 70 && a.src !== b.src) { alpha((1 - d / 70) * .55); line(a, b, C.gold, 1); if (d < 22 && !a.ev && !b.ev) { a.ev = b.ev = 90; a.lvl = b.lvl = (Math.random() * 4) | 0; } }
        }
        for (i = 0; i < P.length; i++) { var p = P[i];
          if (p.ev) { p.ev--; var k = p.ev / 90; alpha(.25 * k); ring(p.x, p.y, 6 + (1 - k) * 22, C.risk[p.lvl], 2); alpha(1); dot(p.x, p.y, 4.6, C.risk[p.lvl]); }
          else { alpha(.75); dot(p.x, p.y, 2.4, p.src % 2 ? C.muted : C.ink); } }
      } },
    graph: { init: function () { P = []; var ty = "ectka"; for (var i = 0, n = count(30); i < n; i++) P.push({ x: rnd(0, W), y: rnd(10, H - 10), vx: rnd(-.3, .3) || .15, vy: rnd(-.12, .12), t: ty[i % 5], lvl: (Math.random() * 4) | 0, r: rnd(3, 6) }); },
      step: function () {
        for (var i = 0; i < P.length; i++) drift(P[i], 1);
        for (i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 90 && (a.t === "e") !== (b.t === "e")) { alpha((1 - d / 90) * .6); line(a, b, C.rule, 1.2); } }
        for (i = 0; i < P.length; i++) { var p = P[i]; alpha(.95);
          if (p.t === "e") dot(p.x, p.y, p.r, C.risk[p.lvl]);
          else if (p.t === "c") { dot(p.x, p.y, p.r, C.paper); ring(p.x, p.y, p.r, C.ink, 1.6); }
          else if (p.t === "k") { cx.fillStyle = "#5b7fd6"; cx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
          else if (p.t === "t") { dot(p.x, p.y, p.r, C.paper); ring(p.x, p.y, p.r, C.gold, 2.4); }
          else { cx.beginPath(); cx.moveTo(p.x, p.y - p.r); cx.lineTo(p.x + p.r, p.y); cx.lineTo(p.x, p.y + p.r); cx.lineTo(p.x - p.r, p.y); cx.closePath(); cx.fillStyle = "#8a7fd0"; cx.fill(); } }
      } },
    pins: { init: function () { P = []; for (var i = 0, n = count(34); i < n; i++) P.push({ x: rnd(10, W - 10), y: rnd(26, H - 8), d: rnd(0, 70), z: 0, lit: Math.random() < .2 ? 60 : 0 }); },
      step: function () {
        alpha(.18); for (var gx = 0; gx < W; gx += 28) { cx.fillStyle = C.rule; cx.fillRect(gx, 0, 1, H); }
        for (var i = 0; i < P.length; i++) { var p = P[i]; if (p.d > 0) { p.d--; continue; } p.z = Math.min(1, p.z + .04); if (Math.random() < .004) p.lit = 60; if (p.lit) p.lit--; }
        for (i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j]; if (!a.z || !b.z) continue;
          var d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 80 && (a.lit || b.lit)) { alpha(.5 * (1 - d / 80)); line(a, b, C.gold, 1.2); if (a.lit > 30 && !b.lit) b.lit = 40; } }
        for (i = 0; i < P.length; i++) { var q = P[i]; if (!q.z) continue; var y = q.y - (1 - q.z) * 30;
          if (q.lit) { alpha(.3 * q.lit / 60); ring(q.x, q.y, 14 - q.lit / 6, C.gold, 1.5); }
          alpha(q.z); cx.beginPath(); cx.moveTo(q.x, y); cx.arc(q.x, y - 8, 5, 2.4, .74, false); cx.closePath(); cx.fillStyle = q.lit ? C.gold : C.muted; cx.fill(); dot(q.x, y - 8, 1.8, C.paper); }
      } },
    sea: { init: function () { var n = Math.max(4, Math.min(9, Math.round(W / 150))); P = { ports: [], ships: [], hz: { x: W * rnd(.35, .65), y: H * .5, ph: 0 } };
        for (var i = 0; i < n; i++) P.ports.push({ x: (i + .5) * W / n + rnd(-20, 20), y: i % 2 ? H * .26 : H * .74 });
        for (i = 0; i < n + 3; i++) { var a = (Math.random() * n) | 0; P.ships.push({ a: a, b: (a + 1 + ((Math.random() * (n - 1)) | 0)) % n, s: Math.random(), v: rnd(.0015, .004) }); } },
      step: function () {
        alpha(.22); for (var w = 0; w < 3; w++) { cx.beginPath(); for (var x = 0; x <= W; x += 8) { var y = H * (.3 + w * .2) + Math.sin(x / 40 + t / 30 + w) * 3; x ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.strokeStyle = C.rule; cx.lineWidth = 1; cx.stroke(); }
        var hz = P.hz; hz.ph = (hz.ph + 1) % 120; alpha(.45 * (1 - hz.ph / 120)); ring(hz.x, hz.y, 4 + hz.ph / 4, C.crit, 2); alpha(1); dot(hz.x, hz.y, 3.5, C.crit);
        P.ports.forEach(function (p) { alpha(.9); cx.fillStyle = C.ink; cx.fillRect(p.x - 3, p.y - 3, 6, 6); });
        P.ships.forEach(function (s) {
          s.s += s.v; if (s.s >= 1) { s.a = s.b; s.b = (s.b + 1 + ((Math.random() * (P.ports.length - 1)) | 0)) % P.ports.length; s.s = 0; }
          var A = P.ports[s.a], B = P.ports[s.b], x = A.x + (B.x - A.x) * s.s, y = A.y + (B.y - A.y) * s.s;
          var dx = x - hz.x, dy = y - hz.y, d = Math.hypot(dx, dy); if (d < 34) { x += dx / d * (34 - d); y += dy / d * (34 - d); }
          var ang = Math.atan2(B.y - A.y, B.x - A.x); alpha(.25); line({ x: A.x, y: A.y }, { x: x, y: y }, C.gold, 1);
          alpha(1); cx.save(); cx.translate(x, y); cx.rotate(ang); cx.beginPath(); cx.moveTo(7, 0); cx.lineTo(-5, -3.5); cx.lineTo(-5, 3.5); cx.closePath();
          cx.fillStyle = d < 40 ? C.high : C.gold; cx.fill(); cx.restore(); });
      } },
    radar: { init: function () { P = []; for (var i = 0, n = count(40); i < n; i++) P.push({ a: rnd(0, 6.2832), r: rnd(.15, 1), lit: 0, lvl: (Math.random() * 4) | 0 }); },
      step: function () {
        var R = Math.min(W * .45, H * 2.4), cxp = W / 2, cyp = H + R * .35, sw = (t / 55) % 6.2832;
        for (var k = 1; k <= 3; k++) { alpha(.55); ring(cxp, cyp, R * k / 3, C.rule, 1.2); }
        alpha(.7); line({ x: cxp, y: cyp }, { x: cxp + Math.cos(sw) * R, y: cyp + Math.sin(sw) * R }, C.gold, 1.6);
        var g = cx.createRadialGradient(cxp, cyp, 0, cxp, cyp, R); g.addColorStop(0, "transparent"); g.addColorStop(1, C.gold);
        alpha(.32); cx.beginPath(); cx.moveTo(cxp, cyp); cx.arc(cxp, cyp, R, sw - .5, sw); cx.closePath(); cx.fillStyle = g; cx.fill();
        P.forEach(function (p) { var da = Math.abs(((sw - p.a) % 6.2832 + 6.2832) % 6.2832); if (da < .05) p.lit = 100; if (p.lit) p.lit--;
          var x = cxp + Math.cos(p.a) * R * p.r, y = cyp + Math.sin(p.a) * R * p.r; if (y > H + 4) return;
          alpha(.45 + .55 * p.lit / 100); dot(x, y, p.lit ? 3.6 : 2.2, p.lit ? C.risk[p.lvl] : C.muted); });
      } },
    beacons: { init: function () { P = []; for (var i = 0, n = Math.max(4, Math.min(11, Math.round(W / 110))); i < n; i++) P.push({ x: (i + .5) * W / n + rnd(-25, 25), y: rnd(H * .3, H * .75), ph: rnd(0, 160), sp: rnd(.7, 1.3), lvl: (Math.random() * 4) | 0 }); },
      step: function () {
        P.forEach(function (b) { b.ph = (b.ph + b.sp) % 160; });
        for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], ra = a.ph * .7, rb = b.ph * .7, d = Math.hypot(a.x - b.x, a.y - b.y);
          if (ra + rb > d && Math.abs(ra - rb) < d) { alpha(.35 * (1 - Math.max(a.ph, b.ph) / 160)); line(a, b, C.gold, 2); dot((a.x + b.x) / 2, (a.y + b.y) / 2, 3, C.gold); } }
        P.forEach(function (b) { alpha(.5 * (1 - b.ph / 160)); ring(b.x, b.y, b.ph * .7, C.risk[b.lvl], 1.6); alpha(1); dot(b.x, b.y, 3.6, C.risk[b.lvl]); });
      } },
    event: { init: function () { P = []; for (var i = 0, n = count(36); i < n; i++) P.push(spawn()); P.hits = 0; },
      step: function () {
        var cxp = W / 2, cyp = H / 2, pulse = Math.min(1, P.hits / 2);
        P.forEach(function (p, i) { p.k += p.v; var x = p.x0 + (cxp - p.x0) * ease(p.k), y = p.y0 + (cyp - p.y0) * ease(p.k);
          alpha(.25); line({ x: p.x0, y: p.y0 }, { x: x, y: y }, C.rule, 1); alpha(1 - p.k * .6); dot(x, y, 2.6, C.muted);
          if (p.k >= 1) { P.hits++; P[i] = spawn(); } });
        var r = 9 + Math.sin(t / 14) * 1.2 + pulse * 3; alpha(.25 * pulse); ring(cxp, cyp, r + 10 + (t % 60) / 3, C.gold, 2); alpha(1); dot(cxp, cyp, r, P.hits >= 2 ? C.gold : C.muted);
        if (P.hits >= 2) { alpha(.9); ring(cxp, cyp, r + 3, C.gold, 1.5); }
      } },
  };
  function spawn() { var left = Math.random() < .5; return { x0: left ? rnd(0, W * .3) : rnd(W * .7, W), y0: rnd(6, H - 6), k: 0, v: rnd(.004, .012) }; }
  function ease(k) { return k < 1 ? 1 - Math.pow(1 - k, 2) : 1; }
  var mod = M[mode] || M.news;
  function frame() { if (!on) return; t++; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); mod.step(); alpha(1); raf = requestAnimationFrame(frame); }
  function start() { cancelAnimationFrame(raf); if (still) { cx.clearRect(0, 0, W, H); for (var i = 0; i < 160; i++) { cx.clearRect(0, 0, W, H); t++; mod.step(); } alpha(1); return; } raf = requestAnimationFrame(frame); }
  colours(); size(); mod.init(); start();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); mod.init(); start(); }, 200); });
  box.addEventListener("pointermove", function (ev) { var r = box.getBoundingClientRect(); mx = ev.clientX - r.left; my = ev.clientY - r.top; });
  box.addEventListener("pointerleave", function () { mx = my = -999; });
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { on = es[0].isIntersecting && !document.hidden; if (on && !still) start(); }).observe(box);
  document.addEventListener("visibilitychange", function () { on = !document.hidden; if (on && !still) start(); });
  if (window.MutationObserver) new MutationObserver(function () { colours(); if (still) start(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
})();
