
/* WEB-1.10 + LOCALDESK-1.0 - find a country: its risk picture, today's brief, topics, verified events, its newsrooms' headlines
   (translated into the page's language when a translation exists) and the rated list of its newsrooms. */
(function () {
  "use strict";
  var src = document.getElementById("lc-i18n"), out = document.getElementById("lcout"), q = document.getElementById("lcq");
  if (!src || !out) return;
  var I0 = JSON.parse(src.textContent || "{}");
  if (I0.shared && window.fetch) {                                       /* SPD-35: the words are in a shared file */
    fetch(I0.shared).then(function (r) { return r.json(); }).then(function (j) { for (var k in j) if (!(k in I0)) I0[k] = j[k]; main(I0); })
      .catch(function () { /* the section stays empty */ });
  } else main(I0);
  function main(I) { var D = I.desk || {};
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
    if (!rtf) return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
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
    var name = I.names[iso][0], E = I.embed, h = E ? "" : "<h2>" + esc(name) + "</h2>";
    h += '<p class="lcsrc">' + esc(fill(I.sources, name, d.sources || 0)) + "</p>";
    if ((d.sources || 0) < 2 && !(d.newsrooms || []).length) h += '<p class="lcthin">' + esc(fill(I.thin, name, d.sources || 0)) + "</p>";
    /* (d) risk picture */
    var R = d.risk || {}, rk = "";
    if (R.top) rk += '<div><span class="small">' + esc(D.risk_top) + ':</span> <a lang="en" href="' + esc(I.base + "event/" + R.top.id + ".html") + '">' + esc(R.top.t) + "</a> " +
      '<b class="rk">' + esc(I.risk) + " " + Number(R.top.r).toFixed(1) + "</b></div>";
    rk += '<div class="small">' + (R.high ? esc(fill(D.risk_high, name, R.high)) : esc(D.risk_none)) + "</div>";
    if ((R.maritime || []).length) rk += '<div class="lcmar"><b>' + esc(D.mar_h) + ":</b> " + R.maritime.map(function (m) {
      return '<a href="' + esc(I.maritime_url) + '" class="lcms ms-' + esc(m.status) + '" title="' + esc(m.reason) + '">' + esc(m.name) + " · " + esc((I.mstatus || {})[m.status] || m.status) + "</a>"; }).join(" ") + "</div>";
    if (!E) h += '<section class="lcbox"><h3>' + esc(D.risk_h) + "</h3>" + rk + "</section>";   /* a country page has its own */
    /* 28 Oct: Most reported - on a country page at its top (#mostrep), in the finder here */
    var mr = E ? document.getElementById("mostrep") : null;
    if (mr && (d.brief || []).length) {
      mr.innerHTML = "<h2 class=\"ci-reg\">" + esc(fill(D.mr_h, name)) + '</h2><p class="small">' + esc(fill(D.mr_x, name)) + '</p><ol class="num lcbr mrl">' +
        d.brief.slice(0, 3).map(function (b) { return "<li><div>" + headline(b, "lco") + '<div class="small"><b>' + esc(fill(D.mr_n, "", b.n)) + "</b>: " + esc((b.outlets || []).join(", ")) + " · " + esc(ago(b.ts)) + "</div></div></li>"; }).join("") + "</ol>";
      mr.hidden = false;
    }
    /* (c) today's brief */
    if (!mr && (d.brief || []).length) h += '<section class="lcbox"><h3>' + esc(D.brief_h) + '</h3><p class="small">' + esc(D.brief_x) + '</p><ol class="num lcbr">' +
      d.brief.map(function (b) { return "<li><div>" + headline(b, "lco") + '<div class="small">' + esc(fill(D.by_n, "", b.n)) + ": " + esc(b.outlets.join(", ")) + " · " + esc(ago(b.ts)) + "</div></div></li>"; }).join("") + "</ol></section>";
    /* (b) topics */
    if ((d.topics || []).length) h += '<section class="lcbox"><h3>' + esc(D.topics_h) + '</h3><div class="mgchips">' +
      d.topics.map(function (t) { return '<span lang="en">' + esc(t[0]) + " <b>" + t[1] + "</b></span>"; }).join("") + "</div></section>";
    /* verified events (a country page lists them already) */
    if (!E) h += "<h3>" + esc(fill(I.ev_h, name)) + "</h3>";
    if (!E) h += (d.events || []).length ? '<ol class="num lcev">' + d.events.map(function (x) {
      return '<li><div><a lang="en" class="hl-s" href="' + esc(I.base + "event/" + x.id + ".html") + '">' + esc(x.t) + "</a>" +
        '<div class="small">' + esc(I.risk) + " " + Number(x.r).toFixed(1) + " · " + x.n + " " + esc(I.outlets) + " · " + esc(ago(x.ts)) + "</div></div></li>";
    }).join("") + "</ol>" : '<p class="small">' + esc(fill(I.ev_none, name)) + "</p>";
    /* the country's newsrooms - latest headlines */
    h += "<h3>" + esc(fill(I.heads_h, name)) + "</h3>";
    if ((d.newsrooms || []).length && d.translated === false) h += '<p class="small">' + esc(D.tr_off) + "</p>";
    /* LOCALDESK-1.1: section chips - All (everything but sport & culture), then each section that has headlines */
    var SN = d.sec_n || {}, SL = D.secs || {}, order = ["politics", "economy", "society", "energy", "tech", "regions", "official", "sport"];
    var allN = (d.heads || []).filter(function (x) { return x.sec !== "sport"; }).length;
    var chips = order.filter(function (k) { return SN[k]; });
    if (chips.length > 1) h += '<div class="lcsec" role="tablist">' + '<button type="button" class="qchip on" data-sec="" role="tab" aria-selected="true">' + esc(D.sec_all) + " · " + allN + "</button>" +
      chips.map(function (k) { return '<button type="button" class="qchip" data-sec="' + k + '" role="tab" aria-selected="false">' + esc(SL[k] || k) + " · " + SN[k] + "</button>"; }).join("") + "</div>";
    h += '<div id="lcsecmr"></div>';
    h += (d.heads || []).length ? '<p class="small">' + esc(I.heads_note) + '</p><ul class="plain lchd" id="lchd"></ul>' : '<p class="small">' + esc(fill(I.heads_none, name)) + "</p>";
    /* (a) the newsrooms, rated */
    if ((d.newsrooms || []).length) h += '<section class="lcbox"><h3>' + esc(D.nr_h) + '</h3><p class="small">' + esc(D.nr_x) + '</p><table class="lcnr"><tbody>' +
      d.newsrooms.map(function (n) { return '<tr><td><a href="' + esc(n.home) + '" target="_blank" rel="noopener nofollow">' + esc(n.name) + "</a></td><td>" + stars(n.stars) +
        "</td><td>" + esc((D.types || {})[n.type] || n.type_label) + "</td><td>" + esc(langName(n.lang)) + '</td><td class="' + (n.working ? "ok" : "no") + '">' +
        esc(n.working ? D.working : n.testing ? D.testing : D.not_working) + "</td></tr>"; }).join("") + "</tbody></table></section>";
    out.innerHTML = h;
    function row(x) {
      return "<li>" + headline(x, "lco") + (x.sid ? '<a class="lcat" href="' + esc(I.base + "event/" + x.sid + ".html") + '">' + esc(I.on_athena) + " ›</a>" : "") +
        '<div class="small">' + (x.k === "official" ? '<b class="lcoff">' + esc((D.secs || {}).official || "Official") + "</b> " : "") + (x.stars ? stars(x.stars) + " " : "") +
        esc(x.o) + (x.reg ? " · " + esc(x.reg) : "") + " · " + esc(ago(x.ts)) + "</div></li>";
    }
    function pick(sec) {
      var list = (d.heads || []).filter(function (x) { return sec ? x.sec === sec : x.sec !== "sport"; });
      var ul = document.getElementById("lchd"); if (ul) ul.innerHTML = list.slice(0, 40).map(row).join("");
      var mr = document.getElementById("lcsecmr"), b = sec ? ((d.brief_sec || {})[sec] || []) : [];
      if (mr) mr.innerHTML = b.length ? '<section class="lcbox"><h3>' + esc(D.sec_mr) + " · " + esc((D.secs || {})[sec] || "") + '</h3><ol class="num lcbr">' +
        b.map(function (g) { return "<li><div>" + headline(g, "lco") + '<div class="small"><b>' + esc(fill(D.mr_n, "", g.n)) + "</b>: " + esc((g.outlets || []).join(", ")) + " · " + esc(ago(g.ts)) + "</div></div></li>"; }).join("") + "</ol></section>" : "";
      Array.prototype.forEach.call(out.querySelectorAll(".lcsec [data-sec]"), function (c) { var on = c.getAttribute("data-sec") === (sec || ""); c.classList.toggle("on", on); c.setAttribute("aria-selected", on ? "true" : "false"); });
    }
    Array.prototype.forEach.call(out.querySelectorAll(".lcsec [data-sec]"), function (c) { c.addEventListener("click", function () { pick(c.getAttribute("data-sec")); }); });
    pick("");
  }
  function show(iso) {
    if (!iso || !I.names[iso]) { out.innerHTML = '<p class="small">' + esc(I.notfound) + "</p>"; return; }
    if (!I.embed && I.pages && I.pages[iso]) { location.href = I.pages[iso] + "#local"; return; }   /* its own page has everything */
    if (q) q.value = I.names[iso][0];
    if (!I.embed && location.hash !== "#" + iso) history.replaceState(null, "", "#" + iso);
    out.innerHTML = '<p class="small">' + esc(I.loading) + "</p>";
    fetch(I.data + iso + ".json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : { events: [], heads: [], sources: 0 }; })
      .then(function (d) { render(iso, d); })
      .catch(function () { render(iso, { events: [], heads: [], sources: 0 }); });
  }
  if (I.embed) { show(out.getAttribute("data-iso")); return; }
  /* 28 Oct: the Countries page - one "Most reported" line on every card that has one */
  var cards = document.querySelectorAll(".ci-mr[data-iso]");
  if (cards.length) fetch(I.data + "index.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) {
    var C = (j && j.countries) || {};
    Array.prototype.forEach.call(cards, function (p) {
      var m = (C[p.getAttribute("data-iso")] || {}).m;
      if (!m) return;
      var hl = headline(m, "lco"), cnt = ' <span class="small">· ' + esc(fill(D.mr_n, "", m.n)) + "</span>";
      p.innerHTML = '<span class="ci-mrl">' + esc(D.mr_c) + ":</span> " + (hl.indexOf('<div class="lcmt">') > 0 ? hl.replace('<div class="lcmt">', cnt + '<div class="lcmt">') : hl + cnt);
      p.hidden = false;
    });
  }).catch(function () {});
  document.getElementById("lcform").addEventListener("submit", function (ev) { ev.preventDefault(); show(find(q.value)); });
  q.addEventListener("change", function () { var iso = find(q.value); if (iso) show(iso); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-iso]"), function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-iso")); }); });
  var hh = (location.hash || "").replace("#", "").toUpperCase();
  if (I.names[hh]) show(hh);
}
})();
