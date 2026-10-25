
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
  var N = [], L = [], byId = {}, adj = {}, show = { e: 1, c: 1, t: 1, k: 1, a: 1 }, minRisk = 0, sel = null, hov = null;
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
  function run() { cancelAnimationFrame(raf); alpha = 1; (function step() { tick(); draw(); alpha *= 0.985; if (alpha > 0.03) raf = requestAnimationFrame(step); else if (!viewMoved) fitTo(R && R.ev.length ? R.set : allSet()); })(); }
  function allSet() { var o = {}; N.forEach(function (n) { o[n.id] = 1; }); return o; }
  function shape(n, x, y, r) {
    cx.beginPath();
    if (n.t === "k") cx.rect(x - r, y - r, 2 * r, 2 * r);
    else if (n.t === "a") { cx.moveTo(x, y - r); cx.lineTo(x + r, y); cx.lineTo(x, y + r); cx.lineTo(x - r, y); cx.closePath(); }
    else cx.arc(x, y, r, 0, 6.2832);
  }
  function draw() {
    if (!W) return;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    var focus = sel || (R ? null : hov), near = {}, ink = css("--ink", "#141a24"), muted = css("--muted", "#6b7280"), rule = css("--rule", "#d9d1c1"), paper = css("--paper2", "#f3eee4"), gold = css("--gold", "#a8843a");
    if (focus) { near[focus.id] = 1; (adj[focus.id] || []).forEach(function (m) { near[m.id] = 1; }); }
    var rq = R && !focus && R.ev.length ? R : null;
    cx.lineWidth = 1;
    L.forEach(function (l) {
      if (!visible(l.s) || !visible(l.t)) return;
      var on = focus && (l.s === focus || l.t === focus), ron = rq && rq.set[l.s.id] && rq.set[l.t.id] && (l.s.t === "e" || l.t.t === "e");
      cx.strokeStyle = on || ron ? gold : rule; cx.globalAlpha = focus && !on ? 0.1 : on ? 0.95 : rq ? (ron ? 0.8 : 0.05) : 0.6;
      cx.beginPath(); cx.moveTo(ox + l.s.x * k, oy + l.s.y * k); cx.lineTo(ox + l.t.x * k, oy + l.t.y * k); cx.stroke();
    });
    N.forEach(function (n) {
      if (!visible(n)) return;
      var x = ox + n.x * k, y = oy + n.y * k, r = Math.max(2.5, n.r * Math.sqrt(k)), dim = (focus && !near[n.id]) || (rq && !rq.set[n.id]);
      cx.globalAlpha = dim ? (rq ? 0.08 : 0.15) : 1; shape(n, x, y, r);
      if (n.t === "e") { cx.fillStyle = riskCol(n.risk); cx.fill(); }
      else if (n.t === "c") { cx.fillStyle = paper; cx.fill(); cx.lineWidth = 2; cx.strokeStyle = n.risk >= 6 ? riskCol(n.risk) : css("--ink2", "#2f3a4b"); cx.stroke(); }
      else if (n.t === "k") { cx.fillStyle = n.color; cx.fill(); }
      else if (n.t === "t") { cx.fillStyle = paper; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = gold; cx.stroke(); }
      else { cx.fillStyle = "#8a7fd0"; cx.fill(); }
      if (n === hov && R) { cx.lineWidth = 2; cx.strokeStyle = gold; shape(n, x, y, r + 3); cx.stroke(); }
      if (n === sel) { cx.lineWidth = 3; cx.strokeStyle = ink; shape(n, x, y, r + 4); cx.stroke(); }
      var show_lab = n === hov || (rq ? rq.lab[n.id] : n.t === "e" ? (near[n.id] || (n.imp >= 7 && k > 0.85)) : (n.t !== "a" || k > 0.9 || near[n.id]));
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
      else { ox = drag.ox + dx; oy = drag.oy + dy; viewMoved = true; draw(); }
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
  function zoom(px, py, f) { viewMoved = true; var nk = Math.min(4, Math.max(0.25, k * f)); ox = px - (px - ox) * nk / k; oy = py - (py - oy) * nk / k; k = nk; draw(); }
  host.addEventListener("wheel", function (ev) { ev.preventDefault(); var p = pos(ev); zoom(p[0], p[1], ev.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  function refilter() { if (R && qs) { R = resolve(R.r); report(qs.value); } if (reduce) { for (var i = 0; i < 150; i++) tick(); draw(); } else run(); }
  document.querySelectorAll("[data-mgt]").forEach(function (c) { c.addEventListener("change", function () { show[c.getAttribute("data-mgt")] = c.checked ? 1 : 0; refilter(); }); });
  var rs = document.getElementById("mgrisk"); if (rs) rs.addEventListener("change", function () { minRisk = +rs.value; refilter(); });
  // ---- WEB-2.0 the request box: read with the Ask vocabulary of the page's language, answered from the graph itself
  var V = null, X = null, R = null, viewMoved = false, qs = document.getElementById("mgq"), rd = document.getElementById("mgread");
  function NZ(s) { s = String(s || "").toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "").replace(/ς/g, "σ").replace(/ё/g, "е").replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}\s+.<>=]/gu, " "); return s.replace(/\s+/g, " ").trim(); }
  function wm(q, v) {
    if (q === v) return true; if (V.lang === "ar" && q.length > 3 && /^[وبلف]/.test(q) && q.slice(1) === v) return true;
    if (q === v + "s" || q === v + "es") return true;
    if (V.inflected && v.length >= 5) { var s = v.slice(0, v.length - (v.length >= 7 ? 2 : 1)); if (q.indexOf(s) === 0 && q.length >= v.length - 1 && q.length <= v.length + 3) return true;
      if (V.lang === "ar" && /^[وبلف]/.test(q) && q.slice(1).indexOf(s) === 0) return true; }
    return false;
  }
  function index() {
    var E = [];
    function add(map, kind) { for (var key in map) { if (key) E.push({ w: key.split(" "), k: kind, v: map[key], n: key.length, p: 1 }); } }
    add(V.risk || {}, "risk"); add(V.cats || {}, "section"); add(V.regions || {}, "region"); add(V.places || {}, "country");
    var tp = {}; for (var key in (V.topics || {})) if (byId["t" + V.topics[key]]) tp[key] = V.topics[key]; add(tp, "topic");
    var own = {};
    N.forEach(function (n) {                        // every named node of the graph, in the page's language and in English
      if (n.t === "e") return;
      [label(n), n.label].concat(n.t === "a" ? String(n.label).split(" ").filter(function (x) { return x.length >= 4; }) : []).forEach(function (s) {
        var key = NZ(s); if (!key || key.length < 2) return; (own[key] = own[key] || []).indexOf(n.id) < 0 && own[key].push(n.id);
      });
    });
    for (var o in own) E.push({ w: o.split(" "), k: "node", v: own[o], n: o.length, p: 0 });
    E.sort(function (a, b) { return b.w.length - a.w.length || b.p - a.p || b.n - a.n; });
    var by = {}; E.forEach(function (x) { var f = x.w[0].slice(0, 2); (by[f] = by[f] || []).push(x); }); return by;
  }
  function parse(q) {
    var w = NZ(q).split(" ").filter(Boolean), used = [], r = { country: [], region: [], topic: [], section: [], node: [], risk: 0, words: [] };
    for (var i = 0; i < w.length; i++) {
      if (used[i]) continue;
      var m0 = w[i].match(/^(?:>=?|=)?(\d+(?:\.\d+)?)\+?$/);
      if (m0 && (/[+>=]/.test(w[i]) || (i > 0 && used[i - 1] === 2))) { r.risk = Math.min(10, Math.max(r.risk, parseFloat(m0[1]))); used[i] = 1; continue; }
      if ((V.risk_word || []).some(function (x) { return w[i].indexOf(x) === 0; })) {
        for (var j = i + 1; j < Math.min(w.length, i + 5); j++) { var m = w[j].match(/^(\d+(?:\.\d+)?)\+?$/);
          if (m) { r.risk = Math.min(10, Math.max(r.risk, parseFloat(m[1]))); for (var z = i; z <= j; z++) used[z] = 1; break; } }
        if (used[i]) continue;
      }
      var keys = [w[i].slice(0, 2)]; if (V.lang === "ar" && w[i].length > 3) keys.push(w[i].slice(1, 3)); var best = null;
      keys.forEach(function (f) { (X[f] || []).forEach(function (x) {
        if (best && best.w.length >= x.w.length) return; if (i + x.w.length > w.length) return;
        for (var kk = 0; kk < x.w.length; kk++) { if (used[i + kk] || !wm(w[i + kk], x.w[kk])) return; } best = x; }); });
      if (best) {
        for (var kk = 0; kk < best.w.length; kk++) used[i + kk] = best.k === "risk" ? 2 : 1;
        if (best.k === "risk") r.risk = Math.max(r.risk, best.v);
        else if (best.k === "node") r.node.push(best.v);
        else if (r[best.k].indexOf(best.v) < 0) r[best.k].push(best.v);
      }
    }
    w.forEach(function (x, i) { if (!used[i] && (V.stop || []).indexOf(x) < 0 && x.length >= 3) r.words.push(x); });
    return r;
  }
  function tw(n) { return n.__w || (n.__w = NZ(n.label).split(" ")); }
  function hasWord(n, q) { return tw(n).some(function (x) { return x === q || (q.length >= 4 && x.indexOf(q) === 0) || (q.length >= 5 && q.indexOf(x) === 0 && x.length >= 4); }); }
  function linked(e, ids) { return (adj[e.id] || []).some(function (m) { return ids[m.id]; }); }
  function resolve(r) {
    var T = (V.text && V.text.lbl) || {}, groups = [], missing = [], chips = [];
    function grp(ids, lab, name) { var o = {}; ids.forEach(function (id) { if (byId[id]) o[id] = 1; });
      chips.push([lab, name]); if (Object.keys(o).length) groups.push(o); else missing.push(name); }
    r.country.forEach(function (iso) { grp(["c" + iso], T.country || I.t_c, (V.cname && V.cname[iso]) || (byId["c" + iso] ? label(byId["c" + iso]) : iso)); });
    r.region.forEach(function (rg) { grp(N.filter(function (n) { return n.t === "c" && n.region === rg; }).map(function (n) { return n.id; }), T.region || "", (V.rname && V.rname[rg]) || I.regions[rg] || rg); });
    r.topic.forEach(function (s) { grp(["t" + s], T.topic || I.t_t, byId["t" + s] ? label(byId["t" + s]) : s); });
    r.section.forEach(function (c) { grp(["k" + c], T.section || I.t_k, byId["k" + c] ? label(byId["k" + c]) : (V.catname && V.catname[c]) || c); });
    r.node.forEach(function (ids) { var n = byId[ids[0]]; if (n && !groups.some(function (g) { return g[n.id]; })) grp(ids, I["t_" + n.t], label(n)); });
    if (r.risk) chips.push([T.risk || I.p_risk, num(r.risk, 0) + "+"]);
    var evs = N.filter(function (n) { return n.t === "e" && visible(n) && n.risk >= r.risk; }), all = evs;
    if (groups.length) {
      var and = evs.filter(function (e) { return groups.every(function (g) { return linked(e, g); }); });
      evs = and.length || groups.length === 1 ? and : evs.filter(function (e) { return groups.some(function (g) { return linked(e, g); }); });
    }
    if (r.words.length) {
      chips.push([I.req_words, r.words.join(" ")]);
      var need = Math.max(1, Math.ceil(r.words.length / 2));
      var ww = evs.filter(function (e) { var h = 0; r.words.forEach(function (q) { if (hasWord(e, q)) h++; }); return h >= need; });
      if (ww.length || !groups.length) evs = ww;
    } else if (!groups.length && !r.risk) evs = [];
    if ((missing.length && !groups.length) || (!groups.length && !r.words.length && !r.risk)) evs = [];
    evs.sort(function (a, b) { return b.risk - a.risk || b.imp - a.imp; });
    var set = {}, lab = {};
    groups.forEach(function (g) { for (var id in g) { set[id] = 1; lab[id] = 1; } });
    evs.forEach(function (e, i) { set[e.id] = 1; if (i < (evs.length > 8 ? 5 : 8)) lab[e.id] = 1;
      (adj[e.id] || []).forEach(function (m) { if (m.t !== "e" && visible(m)) { set[m.id] = 1; if (m.t !== "a" || evs.length < 15) lab[m.id] = 1; } }); });
    return { r: r, ev: evs, set: set, lab: lab, chips: chips, missing: missing, groups: groups, all: all.length };
  }
  function fitTo(set) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, c = 0;
    N.forEach(function (n) { if (!set[n.id] || !visible(n)) return; c++; x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); });
    if (!c || !W) return;
    var bw = Math.max(80, x1 - x0), bh = Math.max(80, y1 - y0);
    k = Math.max(0.35, Math.min(2.4, Math.min((W - 120) / bw, (H - 120) / bh)));
    ox = W / 2 - (x0 + x1) / 2 * k; oy = H / 2 - (y0 + y1) / 2 * k; draw();
  }
  function evRow(m) { return "<li>" + evLink(m) + ' <b style="color:' + riskCol(m.risk) + '">' + num(m.risk, 1) + "</b></li>"; }
  function askLink(q) { return '<a class="go" href="' + esc(I.base + "ask.html?q=" + encodeURIComponent(q)) + '">' + esc(I.req_all) + " ›</a>"; }
  function chipsHtml(c) { return '<div class="achips">' + c.map(function (x) { return '<span class="achip"><b>' + esc(x[0]) + "</b> " + esc(x[1]) + "</span>"; }).join("") + "</div>"; }
  function report(q) {
    var h = "", n = R ? R.ev.length : 0;
    if (!R) { rd.innerHTML = ""; return; }
    if (R.chips.length && !n) h += '<div class="small">' + esc(I.req_read) + "</div>" + chipsHtml(R.chips);
    R.missing.forEach(function (x) { h += '<p class="out">' + esc(I.req_out.replace("{x}", x)) + "</p>"; });
    if (n) h += '<p class="cnt">' + esc(n === 1 ? I.req_one : I.req_found.replace("{n}", num(n, 0))) + "</p>";
    else h += '<p class="cnt">' + esc(I.req_none) + '</p><p class="small">' + esc(I.req_tip) + "</p>" + askLink(q);
    rd.innerHTML = h;
    if (!n) { details(null); return; }
    var ent = [];
    R.groups.forEach(function (g) { for (var id in g) if (ent.length < 12) ent.push(byId[id]); });
    var p = '<div class="small">' + esc(I.req_read) + "</div>" + chipsHtml(R.chips) +
      '<p class="small">' + esc(n === 1 ? I.req_one : I.req_found.replace("{n}", num(n, 0))) + "</p><ul>" + R.ev.slice(0, 30).map(evRow).join("") + "</ul>" +
      (n > 30 ? '<p class="small">' + esc(I.req_more.replace("{n}", num(n - 30, 0))) + "</p>" : "");
    if (ent.length) p += '<p class="small"><b>' + esc(I.req_also) + ':</b></p><div class="chips">' + ent.map(function (m) { return '<button type="button" data-id="' + esc(m.id) + '">' + esc(label(m)) + "</button>"; }).join("") + "</div>";
    p += askLink(q);
    panel.innerHTML = p;
  }
  panel.addEventListener("click", function (ev) { var b = ev.target.closest && ev.target.closest("button[data-id]"); if (!b) return; sel = byId[b.getAttribute("data-id")] || null; details(sel); draw(); });
  function setUrl(q) { try { history.replaceState(null, "", location.pathname + (q ? "?q=" + encodeURIComponent(q) : "") + location.hash); } catch (er) {} }
  function apply(q) {
    q = String(q || "").trim(); if (qs && qs.value !== q) qs.value = q;
    var x = document.getElementById("mgqx"); if (x) x.hidden = !q;
    sel = null; setUrl(q);
    if (!q || !N.length) { R = null; report(""); details(null); fit0(); draw(); return; }
    if (!X) { V = V || { lang: root.lang || "en", stop: [], risk: {}, risk_word: [] }; X = index(); }
    R = resolve(parse(q)); report(q); viewMoved = false;
    if (R.ev.length) fitTo(R.set); else { fit0(); }
    if (R.ev.length === 1) { sel = R.ev[0]; details(sel); }
    draw();
  }
  var tmr = 0;
  if (qs) {
    qs.addEventListener("input", function () { clearTimeout(tmr); var v = qs.value; var x = document.getElementById("mgqx"); if (x) x.hidden = !v;
      tmr = setTimeout(function () { if (!v.trim() || v.trim().length >= 3) apply(v); }, 380); });
    qs.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); clearTimeout(tmr); apply(qs.value); } else if (ev.key === "Escape") { apply(""); } });
  }
  var gob = document.getElementById("mgqgo"); if (gob) gob.addEventListener("click", function () { clearTimeout(tmr); apply(qs ? qs.value : ""); });
  var xb = document.getElementById("mgqx"); if (xb) xb.addEventListener("click", function () { apply(""); if (qs) qs.focus(); });
  document.querySelectorAll(".mgchip[data-q]").forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-q")); }); });
  var rb = document.getElementById("mgreset"); if (rb) rb.addEventListener("click", function () {
    N.forEach(function (n) { n.fixed = false; }); apply(""); refilter();
  });
  window.addEventListener("resize", resize);
  if (window.MutationObserver) new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ["data-tone"] });
  var vocab = fetch(I.vocab).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  fetch(I.data, { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (data) {
    init(data);
    return vocab.then(function (v) { V = v; X = null; var q0 = ""; try { q0 = new URLSearchParams(location.search).get("q") || ""; } catch (er) {} if (q0) apply(q0); });
  })
    .catch(function () { host.insertAdjacentHTML("beforeend", '<p class="small" style="padding:16px">' + esc(I.panel) + "</p>"); });
})();
