
/* WEB-1.9 Mind Graph - a small force-directed network, no libraries. */
(function () {
  "use strict";
  var host = document.getElementById("mg"), src = document.getElementById("mg-i18n");
  if (!host || !src) return;
  var I = JSON.parse(src.textContent || "{}"), panel = document.getElementById("mgp");
  var cv = document.createElement("canvas"), cx = cv.getContext("2d"); host.appendChild(cv);
  var root = document.documentElement;
  function css(v, d) { return (getComputedStyle(root).getPropertyValue(v) || "").trim() || d; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(v, d) { return Number(v || 0).toLocaleString(root.lang || "en", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  var N = [], L = [], byId = {}, adj = {}, show = { e: 1, c: 1, t: 1, k: 1, a: 1 }, minRisk = 0, q = "", sel = null, hov = null;
  var W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0, alpha = 1, raf = 0;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function riskCol(r) { return r >= 8 ? css("--crit", "#9f1239") : r >= 6 ? css("--high", "#c2410c") : r >= 4 ? css("--elev", "#a16207") : css("--gold", "#a8843a"); }
  function label(n) { return I.names[n.id] || n.label; }
  function radius(n) {
    if (n.t === "e") return 5 + n.imp * 1.5;
    if (n.t === "c") return 5 + Math.sqrt(n.deg) * 3.2;
    if (n.t === "k") return 9 + Math.sqrt(n.deg) * 2;
    if (n.t === "t") return 8 + Math.sqrt(n.deg) * 1.6;
    return 4 + Math.sqrt(n.deg) * 1.8;
  }
  function visible(n) {
    if (!show[n.t]) return false;
    if (n.t === "e") return n.risk >= minRisk;
    if (minRisk > 0) return (adj[n.id] || []).some(function (m) { return m.t === "e" && show.e && m.risk >= minRisk; });
    return true;
  }
  function resize() { var r = host.getBoundingClientRect(); dpr = window.devicePixelRatio || 1; W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; draw(); }
  function fit0() { k = Math.min(W, H) / 820; ox = W / 2; oy = H / 2; }
  function init(data) {
    N = data.nodes || [];
    N.forEach(function (n, i) { var a = i * 2.399963, rr = 20 + 10 * Math.sqrt(i); n.x = Math.cos(a) * rr; n.y = Math.sin(a) * rr; n.vx = n.vy = 0; n.r = radius(n); byId[n.id] = n; adj[n.id] = []; });
    (data.links || []).forEach(function (l) { var s = byId[l.s], t = byId[l.t]; if (s && t) { L.push({ s: s, t: t, k: l.k }); adj[s.id].push(t); adj[t.id].push(s); } });
    resize(); fit0();
    if (reduce) { for (var i = 0; i < 350; i++) tick(); draw(); } else run();
  }
  function tick() {
    var vs = N.filter(visible), i, j, a, b, dx, dy, d2, f, d, md, o;
    for (i = 0; i < vs.length; i++) for (j = i + 1; j < vs.length; j++) {
      a = vs[i]; b = vs[j]; dx = b.x - a.x; dy = b.y - a.y; d2 = dx * dx + dy * dy + 0.01;
      if (d2 > 160000) continue;
      f = 700 / d2; a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
      md = a.r + b.r + 6; if (d2 < md * md) { d = Math.sqrt(d2); o = (md - d) / d * 0.5; a.x -= dx * o; a.y -= dy * o; b.x += dx * o; b.y += dy * o; }
    }
    L.forEach(function (l) {
      if (!visible(l.s) || !visible(l.t)) return;
      dx = l.t.x - l.s.x; dy = l.t.y - l.s.y; d = Math.sqrt(dx * dx + dy * dy) || 1;
      var want = l.k === "about" ? 70 : l.k === "cat" ? 120 : 95, s = l.k === "cat" ? 0.015 : 0.04;
      f = (d - want) / d * s; l.s.vx += dx * f; l.s.vy += dy * f; l.t.vx -= dx * f; l.t.vy -= dy * f;
    });
    vs.forEach(function (n) {
      if (n.fixed) { n.vx = n.vy = 0; return; }
      n.vx -= n.x * 0.006; n.vy -= n.y * 0.006; n.vx *= 0.55; n.vy *= 0.55; n.x += n.vx * alpha; n.y += n.vy * alpha;
    });
  }
  function run() { cancelAnimationFrame(raf); alpha = 1; (function step() { tick(); draw(); alpha *= 0.985; if (alpha > 0.03) raf = requestAnimationFrame(step); })(); }
  function shape(n, x, y, r) {
    cx.beginPath();
    if (n.t === "k") cx.rect(x - r, y - r, 2 * r, 2 * r);
    else if (n.t === "a") { cx.moveTo(x, y - r); cx.lineTo(x + r, y); cx.lineTo(x, y + r); cx.lineTo(x - r, y); cx.closePath(); }
    else cx.arc(x, y, r, 0, 6.2832);
  }
  function draw() {
    if (!W) return;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    var focus = sel || hov, near = {}, ink = css("--ink", "#141a24"), muted = css("--muted", "#6b7280"), rule = css("--rule", "#d9d1c1"), paper = css("--paper2", "#f3eee4"), gold = css("--gold", "#a8843a");
    if (focus) { near[focus.id] = 1; (adj[focus.id] || []).forEach(function (m) { near[m.id] = 1; }); }
    var match = q ? function (n) { return label(n).toLowerCase().indexOf(q) >= 0; } : null;
    cx.lineWidth = 1;
    L.forEach(function (l) {
      if (!visible(l.s) || !visible(l.t)) return;
      var on = focus && (l.s === focus || l.t === focus);
      cx.strokeStyle = on ? gold : rule; cx.globalAlpha = focus && !on ? 0.1 : on ? 0.95 : 0.6;
      cx.beginPath(); cx.moveTo(ox + l.s.x * k, oy + l.s.y * k); cx.lineTo(ox + l.t.x * k, oy + l.t.y * k); cx.stroke();
    });
    N.forEach(function (n) {
      if (!visible(n)) return;
      var x = ox + n.x * k, y = oy + n.y * k, r = Math.max(2.5, n.r * Math.sqrt(k)), dim = (focus && !near[n.id]) || (match && !match(n));
      cx.globalAlpha = dim ? 0.15 : 1; shape(n, x, y, r);
      if (n.t === "e") { cx.fillStyle = riskCol(n.risk); cx.fill(); }
      else if (n.t === "c") { cx.fillStyle = paper; cx.fill(); cx.lineWidth = 2; cx.strokeStyle = n.risk >= 6 ? riskCol(n.risk) : css("--ink2", "#2f3a4b"); cx.stroke(); }
      else if (n.t === "k") { cx.fillStyle = n.color; cx.fill(); }
      else if (n.t === "t") { cx.fillStyle = paper; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = gold; cx.stroke(); }
      else { cx.fillStyle = "#8a7fd0"; cx.fill(); }
      if (n === sel) { cx.lineWidth = 3; cx.strokeStyle = ink; shape(n, x, y, r + 4); cx.stroke(); }
      var show_lab = n.t === "e" ? (near[n.id] || (match && match(n)) || (n.imp >= 7 && k > 0.85)) : (n.t !== "a" || k > 0.9 || near[n.id] || (match && match(n)));
      if (show_lab && !dim) {
        var s = label(n); if (s.length > 46) s = s.slice(0, 44) + "…";
        cx.font = (n.t === "e" ? "12px " : "600 12.5px ") + "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif";
        cx.fillStyle = n.t === "e" ? muted : ink; cx.textAlign = "center"; cx.fillText(s, x, y + r + 13);
      }
    });
    cx.globalAlpha = 1;
  }
  function at(px, py) {
    var best = null, bd = 1e9;
    N.forEach(function (n) {
      if (!visible(n)) return;
      var dx = ox + n.x * k - px, dy = oy + n.y * k - py, d = dx * dx + dy * dy, r = Math.max(7, n.r * Math.sqrt(k) + 3);
      if (d < r * r && d < bd) { bd = d; best = n; }
    });
    return best;
  }
  function evLink(m) { return '<a lang="en" href="' + esc(I.base + "event/" + m.sid + ".html") + '">' + esc(m.label) + "</a>"; }
  function details(n) {
    if (!n) { panel.innerHTML = '<p class="small">' + esc(I.panel) + "</p>"; return; }
    var h;
    if (n.t === "e") {
      h = '<div class="small">' + esc(I.t_e) + '</div><h3 lang="en">' + esc(n.label) + "</h3>" +
        '<div class="row"><span>' + esc(I.p_risk) + '</span><b style="color:' + riskCol(n.risk) + '">' + num(n.risk, 1) + "/10</b></div>" +
        '<div class="row"><span>' + esc(I.p_imp) + "</span><b>" + num(n.imp, 1) + "/10</b></div>" +
        '<div class="row"><span>' + esc(I.p_conf) + "</span><b>" + Math.round(n.conf * 100) + "%</b></div>" +
        '<div class="row"><span>' + num(n.outlets, 0) + " " + esc(I.p_outlets) + "</span><b>" + num(n.covered, 0) + " " + esc(I.p_covered) + "</b></div>";
      var gr = {}; (adj[n.id] || []).forEach(function (m) { (gr[m.t] = gr[m.t] || []).push(label(m)); });
      ["c", "k", "t", "a"].forEach(function (t) { if (gr[t]) h += "<p><b>" + esc(I["t_" + t]) + ":</b> " + esc(gr[t].join(", ")) + "</p>"; });
      h += '<a class="go" href="' + esc(I.base + "event/" + n.sid + ".html") + '">' + esc(I.p_open) + " ›</a>";
    } else {
      var evs = (adj[n.id] || []).filter(function (m) { return m.t === "e"; }).sort(function (a, b) { return b.risk - a.risk; });
      h = '<div class="small">' + esc(I["t_" + n.t]) + (n.region ? " · " + esc(I.regions[n.region] || n.region) : "") + "</div><h3>" + esc(label(n)) + "</h3>" +
        '<p class="small">' + esc(I.p_linked) + " " + evs.length + " " + esc(I.p_events) + "</p><ul>" +
        evs.map(function (m) { return "<li>" + evLink(m) + ' <b style="color:' + riskCol(m.risk) + '">' + num(m.risk, 1) + "</b></li>"; }).join("") + "</ul>";
      if (n.t === "t") h += '<a class="go" href="' + esc(I.base + "topic/" + n.slug + ".html") + '">' + esc(I.p_tracker) + " ›</a>";
    }
    panel.innerHTML = h;
  }
  function pos(ev) { var r = host.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  var drag = null, moved = false, pts = {}, pinch = 0;
  host.addEventListener("pointerdown", function (ev) {
    var p = pos(ev); host.setPointerCapture(ev.pointerId); pts[ev.pointerId] = p; moved = false;
    var n = at(p[0], p[1]); drag = { n: n, x: p[0], y: p[1], ox: ox, oy: oy }; if (n) n.fixed = true; host.classList.add("drag");
  });
  host.addEventListener("pointermove", function (ev) {
    var p = pos(ev); if (pts[ev.pointerId]) pts[ev.pointerId] = p;
    var ids = Object.keys(pts);
    if (ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) zoom((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinch); pinch = d; moved = true; return;
    }
    if (drag) {
      var dx = p[0] - drag.x, dy = p[1] - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (drag.n) { drag.n.x = (p[0] - ox) / k; drag.n.y = (p[1] - oy) / k; if (reduce) draw(); else if (alpha < 0.1) { alpha = 0.3; run(); } }
      else { ox = drag.ox + dx; oy = drag.oy + dy; draw(); }
      return;
    }
    var h = at(p[0], p[1]); if (h !== hov) { hov = h; host.style.cursor = h ? "pointer" : ""; draw(); }
  });
  function up(ev) {
    delete pts[ev.pointerId]; pinch = 0; host.classList.remove("drag");
    if (drag && !moved) { sel = drag.n || null; details(sel); }
    if (drag && drag.n && !moved) drag.n.fixed = false;
    drag = null; draw();
  }
  host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
  host.addEventListener("pointerleave", function () { if (hov) { hov = null; draw(); } });
  function zoom(px, py, f) { var nk = Math.min(4, Math.max(0.25, k * f)); ox = px - (px - ox) * nk / k; oy = py - (py - oy) * nk / k; k = nk; draw(); }
  host.addEventListener("wheel", function (ev) { ev.preventDefault(); var p = pos(ev); zoom(p[0], p[1], ev.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  function refilter() { if (reduce) { for (var i = 0; i < 150; i++) tick(); draw(); } else run(); }
  document.querySelectorAll("[data-mgt]").forEach(function (c) { c.addEventListener("change", function () { show[c.getAttribute("data-mgt")] = c.checked ? 1 : 0; refilter(); }); });
  var rs = document.getElementById("mgrisk"); if (rs) rs.addEventListener("change", function () { minRisk = +rs.value; refilter(); });
  var qs = document.getElementById("mgq"); if (qs) qs.addEventListener("input", function () {
    q = qs.value.trim().toLowerCase();
    if (q) { var hit = N.filter(function (n) { return visible(n) && label(n).toLowerCase().indexOf(q) >= 0; }); if (hit.length === 1) { sel = hit[0]; details(sel); } }
    draw();
  });
  var rb = document.getElementById("mgreset"); if (rb) rb.addEventListener("click", function () {
    sel = null; q = ""; if (qs) qs.value = ""; N.forEach(function (n) { n.fixed = false; }); fit0(); details(null); refilter();
  });
  window.addEventListener("resize", resize);
  if (window.MutationObserver) new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ["data-tone"] });
  fetch(I.data, { cache: "no-cache" }).then(function (r) { return r.json(); }).then(init)
    .catch(function () { host.insertAdjacentHTML("beforeend", '<p class="small" style="padding:16px">' + esc(I.panel) + "</p>"); });
})();
