
/* WEB-1.10 Local news - find a country, show its events and its own newsrooms' headlines. */
(function () {
  "use strict";
  var src = document.getElementById("lc-i18n"), out = document.getElementById("lcout"), q = document.getElementById("lcq");
  if (!src || !out || !q) return;
  var I = JSON.parse(src.textContent || "{}");
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
  function ago(ts) {
    var s = Date.now() / 1000 - ts;
    if (!rtf) return new Date(ts * 1000).toLocaleString();
    if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), "minute");
    if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
    return rtf.format(-Math.round(s / 86400), "day");
  }
  function fill(t, c, n) { return String(t).replace("{c}", c).replace("{n}", n); }
  function render(iso, d) {
    var name = I.names[iso][0], h = "<h2>" + esc(name) + "</h2>";
    h += '<p class="lcsrc">' + esc(fill(I.sources, name, d.sources || 0)) + "</p>";
    if ((d.sources || 0) < 2) h += '<p class="lcthin">' + esc(fill(I.thin, name, d.sources || 0)) + "</p>";
    h += "<h3>" + esc(fill(I.ev_h, name)) + "</h3>";
    h += (d.events || []).length ? '<ol class="num lcev">' + d.events.map(function (x) {
      return '<li><div><a lang="en" class="hl-s" href="' + esc(I.base + "event/" + x.id + ".html") + '">' + esc(x.t) + "</a>" +
        '<div class="small">' + esc(I.risk) + " " + Number(x.r).toFixed(1) + " · " + x.n + " " + esc(I.outlets) + " · " + esc(ago(x.ts)) + "</div></div></li>";
    }).join("") + "</ol>" : '<p class="small">' + esc(fill(I.ev_none, name)) + "</p>";
    h += "<h3>" + esc(fill(I.heads_h, name)) + "</h3>";
    h += (d.heads || []).length ? '<p class="small">' + esc(I.heads_note) + '</p><ul class="plain lchd">' + d.heads.map(function (x) {
      return '<li><a class="lco" href="' + esc(x.u) + '" target="_blank" rel="noopener nofollow">' + esc(x.t) + "</a>" +
        (x.sid ? '<a class="lcat" href="' + esc(I.base + "event/" + x.sid + ".html") + '">' + esc(I.on_athena) + " ›</a>" : "") +
        '<div class="small">' + esc(x.o) + " · " + esc(ago(x.ts)) + "</div></li>";
    }).join("") + "</ul>" : '<p class="small">' + esc(fill(I.heads_none, name)) + "</p>";
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
  var h = (location.hash || "").replace("#", "").toUpperCase();
  if (I.names[h]) show(h);
})();
