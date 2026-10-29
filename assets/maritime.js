
/* WEB-1.12 Maritime & Shipping - select a chokepoint or port to see everything about it; filter incidents and notices. */
(function () {
  "use strict";
  var src = document.getElementById("mt-data"), panel = document.getElementById("mtpanel");
  if (!src || !panel) return;
  var D = JSON.parse(src.textContent || "{}"), T = D.t || {};
  var CLS = { Disrupted: "crit", Elevated: "high", Watch: "elev", Normal: "ok" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat(D.lang, { numeric: "auto" }) : null;
  function ago(ts) {
    var s = Date.now() / 1000 - ts; if (!rtf) return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
    if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), "minute");
    if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
    return rtf.format(-Math.round(s / 86400), "day");
  }
  function date(ts) { try { return new Date(ts * 1000).toLocaleString(D.lang, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }) + " UTC"; } catch (e) { return ""; } }
  function bars(series) {
    var n = series.length, m = Math.max.apply(null, series.concat([1])), W = 600, H = 150, bw = W / n, out = "";
    series.forEach(function (v, k) {
      var h = Math.max(2, v / m * (H - 34)), x = k * bw;
      out += '<rect x="' + (x + 3).toFixed(1) + '" y="' + (H - 20 - h).toFixed(1) + '" width="' + (bw - 6).toFixed(1) + '" height="' + h.toFixed(1) +
        '" rx="2" class="' + (k === n - 1 ? "now" : "") + '"><title>' + esc((D.days || [])[k] || "") + ": " + v + "</title></rect>";
      if (v) out += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 24 - h).toFixed(1) + '" text-anchor="middle">' + v + "</text>";
      if (k % 2 === 0 || k === n - 1) out += '<text class="d" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 5) + '" text-anchor="middle">' + esc((D.days || [])[k] || "") + "</text>";
    });
    return '<svg class="mtbars" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(T.chart) + '">' + out + "</svg>";
  }
  function incident(i) {
    var title = i.id ? '<a lang="en" href="' + esc(D.base + "event/" + i.id + ".html") + '">' + esc(i.t) + "</a>" : '<span lang="en">' + esc(i.t) + "</span>";
    var f = [esc(T.risk) + " <b>" + Number(i.r).toFixed(1) + "</b>", i.n + " " + esc(T.newsrooms)];
    ["vessel", "imo", "flag", "owner"].forEach(function (k) { if (i[k]) f.push(esc(T[k]) + ': <span lang="en">' + esc(i[k]) + "</span>"); });
    if (i.cas) f.push(i.cas + " " + esc(T.cas));
    return '<li><span class="mtty">' + esc((T.types || {})[i.type] || i.type) + "</span>" + (i.official ? '<span class="mtb off">' + esc(T.official) + "</span>" : "") +
      (i.disputed ? '<span class="mtb dis">' + esc(T.disputed) + "</span>" : "") + "<div>" + title + '</div><div class="small">' + f.join(" · ") + " · " + esc(ago(i.ts)) + "</div></li>";
  }
  function open(id, scroll) {
    var b = (D.board || []).filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    var inc = (b.inc || []).map(function (k) { return D.inc[k]; }).filter(Boolean);
    var nots = (b.not || []).map(function (k) { return D.not[k]; }).filter(Boolean);
    var cls = CLS[b.status] || "ok", h = "";
    h += '<div class="mtph"><div><span class="mtst st-' + cls + '">' + esc((T.status || {})[b.status] || b.status) + '</span> <span class="small">' + esc((T.kind || {})[b.kind] || b.kind) +
      '</span><h2>' + esc(b.name) + '</h2></div><button type="button" class="ubtn" data-close>' + esc(T.close) + " ✕</button></div>";
    h += '<p class="mtr" lang="en">' + esc(b.reason) + "</p>" + (D.lang !== "en" ? '<p class="small">' + esc(T.reason_en) + "</p>" : "");
    h += '<div class="mtfacts"><div><b>' + b.n24 + "</b><span>" + esc(T.now24) + "</span></div><div><b>" + b.base + "</b><span>" + esc(T.avg) + "</span></div>" +
      (b.status !== "Normal" && b.since ? "<div><b>" + esc(date(b.since)) + "</b><span>" + esc(T.since_l) + "</span></div>" : "") +
      (b.prev && b.prev !== b.status ? "<div><b>" + esc((T.status || {})[b.prev] || b.prev) + "</b><span>" + esc(T.prev) + "</span></div>" : "") + "</div>";
    h += '<h3>' + esc(T.chart) + "</h3>" + bars(b.series || []);
    if (b.worst) h += '<p class="mtw"><b>' + esc(T.worst) + ':</b> <a lang="en" href="' + esc(D.base + "event/" + b.worst.id + ".html") + '">' + esc(b.worst.t) + "</a> · " +
      esc(T.risk) + " " + Number(b.worst.r).toFixed(1) + "</p>";
    h += '<div class="mtpcols"><section><h3>' + esc(T.inc_here) + "</h3>" + (inc.length ? '<ol class="num mtinc">' + inc.map(incident).join("") + "</ol>" :
      '<p class="small">' + esc(T.inc_here_none) + "</p>") + "</section><section><h3>" + esc(T.not_here) + "</h3>" + (nots.length ? '<ul class="plain mtnot">' +
      nots.map(function (n) { return '<li><div class="small"><b>' + esc((T.kinds || {})[n.kind] || n.kind) + "</b> · " + esc(n.issuer) + " · " + esc(date(n.ts)) +
        '</div><a lang="en" href="' + esc(n.link) + '" target="_blank" rel="noopener nofollow">' + esc(n.t) + "</a></li>"; }).join("") + "</ul>" :
      '<p class="small">' + esc(T.not_here_none) + "</p>") + "</section></div>";
    panel.className = "mtpanel st-" + cls; panel.innerHTML = h; panel.hidden = false;
    Array.prototype.forEach.call(document.querySelectorAll(".mtc"), function (c) { c.classList.toggle("on", c.getAttribute("data-place") === id); c.setAttribute("aria-expanded", c.getAttribute("data-place") === id ? "true" : "false"); });
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    panel.querySelector("[data-close]").addEventListener("click", close);
    if (scroll) { panel.scrollIntoView({ behavior: "smooth", block: "start" }); try { panel.focus({ preventScroll: true }); } catch (e) { /* old browsers */ } }
  }
  function close() {
    panel.hidden = true; panel.innerHTML = "";
    Array.prototype.forEach.call(document.querySelectorAll(".mtc"), function (c) { c.classList.remove("on"); c.setAttribute("aria-expanded", "false"); });
    history.replaceState(null, "", location.pathname + location.search);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".mtc[data-place]"), function (c) {
    c.addEventListener("click", function () { var id = c.getAttribute("data-place"); if (!panel.hidden && location.hash === "#" + id) close(); else open(id, true); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  /* filters: incident types and notice kinds */
  function filter(box, attr, listSel) {
    if (!box) return;
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var v = b.getAttribute("data-" + attr);
      Array.prototype.forEach.call(box.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var list = box.parentNode.querySelector(listSel);
      if (list) Array.prototype.forEach.call(list.children, function (li) { li.hidden = !!v && li.getAttribute(attr === "ft" ? "data-type" : "data-kind") !== v; });
    });
  }
  filter(document.querySelector('.mtf[data-for="inc"]'), "ft", ".mtinc");
  filter(document.querySelector('.mtf[data-for="not"]'), "fk", ".mtnot");
  var hh = (location.hash || "").slice(1);
  if (hh) open(hh, true);
})();
