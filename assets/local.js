
/* WEB-1.10 + LOCALDESK-1.0 - find a country: its risk picture, today's brief, topics, verified events, its newsrooms' headlines
   (translated into the page's language when a translation exists) and the rated list of its newsrooms. */
(function () {
  "use strict";
  var src = document.getElementById("lc-i18n"), out = document.getElementById("lcout"), q = document.getElementById("lcq");
  if (!src || !out || !q) return;
  var I = JSON.parse(src.textContent || "{}"), D = I.desk || {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
  var idx = Object.keys(I.names).map(function (iso) { return { iso: iso, keys: I.names[iso].map(norm).concat([iso.toLowerCase()]) }; });
  function find(text) {
    var t = norm(text); if (!t) return null;
    var hit = idx.filter(function (x) { return x.keys.indexOf(t) >= 0; })[0]
      || idx.filter(function (x) { return x.keys.some(function (k) { return k.indexOf(t) === 0; }); })[0]
      || idx.filter(function (x) { return x.keys.some(function (k) { return k.indexOf(t) >= 0; }); })[0];
    return hit ? hit.iso : null;
  }
  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat(I.lang, { numeric: "auto" }) : null;
  var dn = null; try { dn = new Intl.DisplayNames([I.lang], { type: "language" }); } catch (e) { /* older browsers */ }
  function langName(code) { try { return (dn && dn.of(code)) || code; } catch (e) { return code; } }
  function ago(ts) {
    var s = Date.now() / 1000 - ts;
    if (!rtf) return new Date(ts * 1000).toLocaleString();
    if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), "minute");
    if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
    return rtf.format(-Math.round(s / 86400), "day");
  }
  function fill(t, c, n) { return String(t || "").replace("{c}", c).replace("{n}", n).replace("{l}", c); }
  function stars(n) { var f = Math.floor(n || 0), h = (n || 0) - f >= 0.5; return '<span class="lcst" title="' + (n || 0) + ' / 5">' + "★".repeat(f) + (h ? "½" : "") + "</span>"; }
  /* the headline in the page's language: original, or a translation (labelled), or the English translation */
  function shown(x) {
    if (!x.lang || x.lang === I.lang) return { t: x.t, mt: null };
    var tr = x.tr || {};
    if (tr[I.lang]) return { t: tr[I.lang], mt: x.lang };
    if (I.lang === "en" && x.en) return { t: x.en, mt: x.lang };
    if (x.en && x.lang !== "en") return { t: x.en, mt: x.lang };
    return { t: x.t, mt: null, untranslated: x.lang !== "en" && x.lang !== I.lang };
  }
  function headline(x, cls) {
    var s = shown(x);
    return '<a class="' + cls + '" href="' + esc(x.u) + '" target="_blank" rel="noopener nofollow"' + (s.mt || s.untranslated ? ' lang="' + esc(s.mt ? I.lang : x.lang) + '"' : "") + ">" + esc(s.t) + "</a>" +
      (s.mt ? '<div class="lcmt">' + esc(fill(D.mt, langName(s.mt))) + ' · <span title="' + esc(x.t) + '">' + esc(D.orig) + ": " + '<span lang="' + esc(x.lang) + '">' + esc(x.t) + "</span></span></div>" : "");
  }
  function render(iso, d) {
    var name = I.names[iso][0], h = "<h2>" + esc(name) + "</h2>";
    h += '<p class="lcsrc">' + esc(fill(I.sources, name, d.sources || 0)) + "</p>";
    if ((d.sources || 0) < 2 && !(d.newsrooms || []).length) h += '<p class="lcthin">' + esc(fill(I.thin, name, d.sources || 0)) + "</p>";
    /* (d) risk picture */
    var R = d.risk || {}, rk = "";
    if (R.top) rk += '<div><span class="small">' + esc(D.risk_top) + ':</span> <a lang="en" href="' + esc(I.base + "event/" + R.top.id + ".html") + '">' + esc(R.top.t) + "</a> " +
      '<b class="rk">' + esc(I.risk) + " " + Number(R.top.r).toFixed(1) + "</b></div>";
    rk += '<div class="small">' + (R.high ? esc(fill(D.risk_high, name, R.high)) : esc(D.risk_none)) + "</div>";
    if ((R.maritime || []).length) rk += '<div class="lcmar"><b>' + esc(D.mar_h) + ":</b> " + R.maritime.map(function (m) {
      return '<a href="' + esc(I.maritime_url) + '" class="lcms ms-' + esc(m.status) + '" title="' + esc(m.reason) + '">' + esc(m.name) + " · " + esc((I.mstatus || {})[m.status] || m.status) + "</a>"; }).join(" ") + "</div>";
    h += '<section class="lcbox"><h3>' + esc(D.risk_h) + "</h3>" + rk + "</section>";
    /* (c) today's brief */
    if ((d.brief || []).length) h += '<section class="lcbox"><h3>' + esc(D.brief_h) + '</h3><p class="small">' + esc(D.brief_x) + '</p><ol class="num lcbr">' +
      d.brief.map(function (b) { return "<li><div>" + headline(b, "lco") + '<div class="small">' + esc(fill(D.by_n, "", b.n)) + ": " + esc(b.outlets.join(", ")) + " · " + esc(ago(b.ts)) + "</div></div></li>"; }).join("") + "</ol></section>";
    /* (b) topics */
    if ((d.topics || []).length) h += '<section class="lcbox"><h3>' + esc(D.topics_h) + '</h3><div class="mgchips">' +
      d.topics.map(function (t) { return '<span lang="en">' + esc(t[0]) + " <b>" + t[1] + "</b></span>"; }).join("") + "</div></section>";
    /* verified events */
    h += "<h3>" + esc(fill(I.ev_h, name)) + "</h3>";
    h += (d.events || []).length ? '<ol class="num lcev">' + d.events.map(function (x) {
      return '<li><div><a lang="en" class="hl-s" href="' + esc(I.base + "event/" + x.id + ".html") + '">' + esc(x.t) + "</a>" +
        '<div class="small">' + esc(I.risk) + " " + Number(x.r).toFixed(1) + " · " + x.n + " " + esc(I.outlets) + " · " + esc(ago(x.ts)) + "</div></div></li>";
    }).join("") + "</ol>" : '<p class="small">' + esc(fill(I.ev_none, name)) + "</p>";
    /* the country's newsrooms - latest headlines */
    h += "<h3>" + esc(fill(I.heads_h, name)) + "</h3>";
    if ((d.newsrooms || []).length && d.translated === false) h += '<p class="small">' + esc(D.tr_off) + "</p>";
    h += (d.heads || []).length ? '<p class="small">' + esc(I.heads_note) + '</p><ul class="plain lchd">' + d.heads.map(function (x) {
      return "<li>" + headline(x, "lco") + (x.sid ? '<a class="lcat" href="' + esc(I.base + "event/" + x.sid + ".html") + '">' + esc(I.on_athena) + " ›</a>" : "") +
        '<div class="small">' + (x.stars ? stars(x.stars) + " " : "") + esc(x.o) + " · " + esc(ago(x.ts)) + "</div></li>";
    }).join("") + "</ul>" : '<p class="small">' + esc(fill(I.heads_none, name)) + "</p>";
    /* (a) the newsrooms, rated */
    if ((d.newsrooms || []).length) h += '<section class="lcbox"><h3>' + esc(D.nr_h) + '</h3><p class="small">' + esc(D.nr_x) + '</p><table class="lcnr"><tbody>' +
      d.newsrooms.map(function (n) { return '<tr><td><a href="' + esc(n.home) + '" target="_blank" rel="noopener nofollow">' + esc(n.name) + "</a></td><td>" + stars(n.stars) +
        "</td><td>" + esc((D.types || {})[n.type] || n.type_label) + "</td><td>" + esc(langName(n.lang)) + '</td><td class="' + (n.working ? "ok" : "no") + '">' +
        esc(n.working ? D.working : n.testing ? D.testing : D.not_working) + "</td></tr>"; }).join("") + "</tbody></table></section>";
    out.innerHTML = h;
  }
  function show(iso) {
    if (!iso || !I.names[iso]) { out.innerHTML = '<p class="small">' + esc(I.notfound) + "</p>"; return; }
    q.value = I.names[iso][0];
    if (location.hash !== "#" + iso) history.replaceState(null, "", "#" + iso);
    out.innerHTML = '<p class="small">' + esc(I.loading) + "</p>";
    fetch(I.data + iso + ".json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : { events: [], heads: [], sources: 0 }; })
      .then(function (d) { render(iso, d); })
      .catch(function () { render(iso, { events: [], heads: [], sources: 0 }); });
  }
  document.getElementById("lcform").addEventListener("submit", function (ev) { ev.preventDefault(); show(find(q.value)); });
  q.addEventListener("change", function () { var iso = find(q.value); if (iso) show(iso); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-iso]"), function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-iso")); }); });
  var hh = (location.hash || "").replace("#", "").toUpperCase();
  if (I.names[hh]) show(hh);
})();
