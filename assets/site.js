
(function(){
  // WEB-1.4: one script for every language — the words come from W (site_i18n.JS), chosen by the page's lang
  var d=document.documentElement, LG=d.getAttribute("lang")||"en", ALL={"en":{"rising":"Rising","mkts":"Markets","now":"just now","m":" min ago","h":" h ago","d":" days ago","d1":" day ago","brk":"Breaking","lat":"Latest","new":"New","risk":"Risk","pause":"Pause","pp":"Pause / play","clock":"Your local time","wclose":"Fold the welcome","wopen":"Show the welcome","intl":"en-GB"},"el":{"rising":"Ανεβαίνει","mkts":"Αγορές","now":"μόλις τώρα","m":" λεπτά πριν","h":" ώρες πριν","d":" ημέρες πριν","m1":" λεπτό πριν","h1":" ώρα πριν","d1":" ημέρα πριν","brk":"Έκτακτο","lat":"Τελευταία","new":"Νέο","risk":"Κίνδυνος","pause":"Παύση","pp":"Παύση / συνέχεια","clock":"Η ώρα σας","wclose":"Σύμπτυξη του καλωσορίσματος","wopen":"Εμφάνιση του καλωσορίσματος","intl":"el-GR"},"es":{"rising":"En aumento","mkts":"Mercados","now":"ahora mismo","m":" min","h":" h","d":" días","d1":" día","pre":"hace ","brk":"Última hora","lat":"Lo último","new":"Nuevo","risk":"Riesgo","pause":"Pausa","pp":"Pausa / reanudar","clock":"Su hora local","wclose":"Plegar la bienvenida","wopen":"Mostrar la bienvenida","intl":"es-ES"},"fr":{"rising":"En hausse","mkts":"Marchés","now":"à l'instant","m":" min","h":" h","d":" jours","d1":" jour","pre":"il y a ","brk":"Dernière minute","lat":"En continu","new":"Nouveau","risk":"Risque","pause":"Pause","pp":"Pause / lecture","clock":"Votre heure locale","wclose":"Replier l'accueil","wopen":"Afficher l'accueil","intl":"fr-FR"},"de":{"rising":"Steigend","mkts":"Märkte","now":"gerade eben","m":" Min.","h":" Std.","d":" Tagen","d1":" Tag","pre":"vor ","brk":"Eilmeldung","lat":"Neueste","new":"Neu","risk":"Risiko","pause":"Pause","pp":"Pause / weiter","clock":"Ihre Ortszeit","wclose":"Willkommen einklappen","wopen":"Willkommen anzeigen","intl":"de-DE"},"ar":{"rising":"يتصاعد","mkts":"الأسواق","now":"الآن","m":" دقيقة","h":" ساعة","d":" يوم","pre":"قبل ","brk":"عاجل","lat":"الأحدث","new":"جديد","risk":"الخطر","pause":"إيقاف مؤقت","pp":"إيقاف / تشغيل","clock":"توقيتك المحلي","wclose":"طيّ الترحيب","wopen":"إظهار الترحيب","intl":"ar"},"ru":{"rising":"Растёт","mkts":"Рынки","now":"только что","m":" мин назад","h":" ч назад","d":" дн. назад","brk":"Срочно","lat":"Последнее","new":"Новое","risk":"Риск","pause":"Пауза","pp":"Пауза / продолжить","clock":"Ваше местное время","wclose":"Свернуть приветствие","wopen":"Показать приветствие","intl":"ru-RU"}}, W=ALL[LG]||ALL.en, LOC=W.intl||"en-GB";
  // WEB-1.6: display modes (assets/theme.js applied the saved one before the page was drawn)
  var DARK={night:1,future:1,neon:1},mm=document.querySelector("details.modes");
  function markMode(){var cur=d.getAttribute("data-theme")||"auto";[].forEach.call(document.querySelectorAll("[data-set-mode]"),function(x){
    x.setAttribute("aria-pressed",x.getAttribute("data-set-mode")===cur?"true":"false");});}
  [].forEach.call(document.querySelectorAll("[data-set-mode]"),function(x){x.addEventListener("click",function(){var m=x.getAttribute("data-set-mode");
    if(m==="auto"){d.removeAttribute("data-theme");d.removeAttribute("data-tone");}else{d.setAttribute("data-theme",m);d.setAttribute("data-tone",DARK[m]?"dark":"light");}
    try{if(m==="auto"){localStorage.removeItem("athena-site-mode");localStorage.removeItem("athena-site-theme");}else localStorage.setItem("athena-site-mode",m);}catch(e){}
    markMode();if(mm)mm.open=false;});});markMode();
  if(mm)document.addEventListener("click",function(e){if(mm.open&&!mm.contains(e.target))mm.open=false;});
  // WEB-1.6: the welcome's live line — the top events roll by (still for readers who ask for less motion)
  var rl=document.querySelector(".roller");
  if(rl){var its=[];try{its=JSON.parse(rl.getAttribute("data-items")||"[]");}catch(e){}
    var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,nm=rl.querySelector(".rl-name"),fg=rl.querySelector(".rl-fig"),k=0,hold=false;
    rl.addEventListener("mouseenter",function(){hold=true;});rl.addEventListener("mouseleave",function(){hold=false;});
    rl.addEventListener("focusin",function(){hold=true;});rl.addEventListener("focusout",function(){hold=false;});
    if(its.length>1&&!still)setInterval(function(){if(hold||document.hidden)return;k=(k+1)%its.length;var it=its[k];
      rl.classList.remove("in");void rl.offsetWidth;nm.textContent=it[0];nm.setAttribute("href",it[2]);fg.textContent=it[1];
      rl.setAttribute("data-rk",it[3]>=8?"crit":it[3]>=6?"high":it[3]>=4?"elev":"");rl.classList.add("in");},4800);}
  function ago(s){var m=Math.round((Date.now()-Date.parse(s))/60000);if(isNaN(m)||m<-1)return null;if(m<2)return W.now;var p=W.pre||"";
    var one=function(n,k){return p+n+(n===1&&W[k+"1"]?W[k+"1"]:W[k]);};                      // 29 Oct: "1 day ago", "1 ώρα πριν"
    if(m<60)return one(m,"m");var h=Math.round(m/60);if(h<48)return one(h,"h");return one(Math.round(h/24),"d");}
  function esc(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":"";}
  // 29 Oct 2026: every time on the site is UTC - also in the reader's browser (it used to switch to the reader's own time zone,
  // without saying so: 05:34 UTC became 08:34 for a reader in Athens)
  var fmt,fday;try{fmt=new Intl.DateTimeFormat(LOC,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:"UTC"});
    fday=new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"long",year:"numeric"});}catch(e){}
  var fu=function(d){return fmt.format(d)+" UTC";};
  var u=document.querySelector(".util"),td=document.getElementById("today");if(td&&fday)td.textContent=fday.format(new Date());
  // the reader's own local time next to the date (their device's time zone), kept current - every REPORT time stays UTC
  var ck=document.getElementById("clock"),fclk;try{fclk=new Intl.DateTimeFormat(LOC,{hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZoneName:"short"});}catch(e){}
  if(ck&&fclk){var tick=function(){var n=new Date();ck.textContent=fclk.format(n);ck.setAttribute("datetime",n.toISOString());
      if(td&&fday)td.textContent=fday.format(n);};tick();ck.hidden=false;
    try{ck.title=W.clock+" · "+Intl.DateTimeFormat().resolvedOptions().timeZone;}catch(e){}
    setTimeout(function(){tick();setInterval(tick,60000);},(60-new Date().getSeconds())*1000);}
  // the language menu closes when you click elsewhere
  var lm=document.querySelector("details.langs");
  if(lm)document.addEventListener("click",function(e){if(lm.open&&!lm.contains(e.target))lm.open=false;});
  var root=(u&&u.getAttribute("data-root"))||"";
  if(u&&window.fetch)fetch(root+"data/updated.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
    var s=document.getElementById("upd");if(!s||!j.updated)return;var t=s.querySelector("time");t.setAttribute("datetime",j.updated);t.textContent=ago(j.updated)||j.updated;
    if(fmt)t.title=fu(new Date(j.updated));s.hidden=false;}).catch(function(){});
  var c=document.querySelector('meta[name="athena-count"]');
  if(c&&/^https?:$/.test(location.protocol)&&!/^(localhost|127\.|\[::1\])/.test(location.hostname)&&navigator.doNotTrack!=="1"&&!navigator.webdriver){
    try{var q="?p="+encodeURIComponent(location.pathname)+"&t="+encodeURIComponent(document.title)+"&r="+encodeURIComponent(document.referrer||"")
      +"&s="+encodeURIComponent(screen.width+","+screen.height+","+(window.devicePixelRatio||1))+"&rnd="+Math.random().toString(36).slice(2);
      var im=new Image();im.src=c.getAttribute("content")+q;}catch(e){}}
  // the rolling news bar (data/breaking.json): breaking events, or the latest important updates when nothing new broke
  var TKI={1:"M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z",2:"M4 19h16M6 15l4-4 3 3 5-6M15 8h3v3",
    3:"M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.8 1.2 2.7 2.5 3-.3-3 0-5.5 0-8z",4:"M3 16l2 4h14l2-4zM6 16v-5h12v5M9 11V7h6v4M12 7V4",
    5:"M7 7h10v10H7zM10 10h4v4h-4zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3",6:"M4 8h16v11H4zM9 8V5h6v3M4 13h16",
    7:"M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9",8:"M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z",
    9:"M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",10:"M12 4l9 16H3zM12 10v4M12 17v.5",
    11:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l3.5 2.5-1.3 4h-4.4l-1.3-4zM3.5 10.5 8.5 9.5M20.5 10.5l-5-1M9.8 13.5 7.5 19M14.2 13.5 16.5 19",12:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"};
  var tk=document.getElementById("ticker");
  if(tk&&window.fetch)fetch(tk.getAttribute("data-root")+"data/breaking.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
    var it=(j&&j.items)||[];if(!it.length)return;
    var brk=it.every(function(x){return x.kind==="breaking";}),base=tk.getAttribute("data-root")+tk.getAttribute("data-prefix");
    // 27 Oct: a topic icon and the flags of the (at most 2) countries most reported on, before each headline
    var rt=tk.getAttribute("data-root"),CN={},DN=null;try{CN=JSON.parse(tk.getAttribute("data-cats")||"{}");}catch(e){}
    try{DN=new Intl.DisplayNames([LG],{type:"region"});}catch(e){}
    function icons(x){var p=TKI[x.cat],h=p?'<span class="tki" title="'+esc(CN[x.cat]||"")+'"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+p+'"/></svg></span>':'';
      var f=(x.cc||[]).map(function(c){var n="";try{n=DN?DN.of(c[1].toUpperCase()):"";}catch(e){}
        return '<img src="'+esc(rt+"assets/cf/"+c[0]+".svg")+'" alt="" width="20" height="15" decoding="async" title="'+esc(n||"")+'">';}).join("");
      return h+(f?'<span class="tkfs">'+f+'</span>':'');}
    // LOOK-31: a story that grew into a dangerous one or a market shock is marked as such - "breaking" is kept for the new
    var one=it.map(function(x){var a=ago(x.time)||"";var tag=x.late?'<em class="tn tn-late" lang="'+LG+'">'+esc(W.rising||"Rising")+'</em>':x.shock?'<em class="tn tn-mkt" lang="'+LG+'">'+esc(W.mkts||"Markets")+'</em>':(!brk&&x.kind==="breaking"?'<em class="tn" lang="'+LG+'">'+esc(W.new)+'</em>':'');
      return '<a class="ti" lang="en" href="'+esc(base+x.page)+'">'+tag+'<time datetime="'+esc(x.time)+'" lang="'+LG+'">'+esc(a)+'</time>'+icons(x)+'<b>'+esc(x.title)+'</b>'
      +'<span class="rk '+rc(x.risk)+'" lang="'+LG+'">'+esc(W.risk)+' '+x.risk.toFixed(1)+'</span></a>';}).join("");
    var lbl=brk?W.brk:W.lat;
    tk.className="ticker"+(brk?"":" latest");tk.setAttribute("role","region");tk.setAttribute("aria-label",lbl);
    tk.innerHTML='<div class="wrap"><div class="tl"><i></i><img class="tk-owl" src="'+esc(rt+"assets/athena_icon.svg")+'" alt="" width="20" height="20">'+esc(lbl)+'<span>· '+it.length+'</span></div><div class="tv"><div class="tt">'+one+'<span aria-hidden="true" style="display:inline-flex">'+one+'</span></div></div>'
      +'<button class="tp" type="button" aria-label="'+esc(W.pause)+'" title="'+esc(W.pp)+'">❚❚</button></div>';
    [].forEach.call(tk.querySelectorAll('[aria-hidden] a'),function(a){a.tabIndex=-1;});
    var tt=tk.querySelector(".tt");tk.hidden=false;
    var dv=document.querySelector(".dev");if(dv)dv.hidden=true;                             // the bar replaces the static "developing" strip
    tt.style.setProperty("--tkd",Math.max(25,Math.round(tt.scrollWidth/2/60))+"s");          // ~60 px a second, whatever the number of items
    var pb=tk.querySelector(".tp");pb.addEventListener("click",function(){var p=tk.classList.toggle("paused");pb.textContent=p?"▶":"❚❚";});
  }).catch(function(){});
  // 27 Oct: Notices from ATHENA (data/notices.json) - shown inside their time window, most important first; closing one
  // hides it in this browser until it is changed (its revision)
  var nb=document.getElementById("nbar");
  if(nb&&window.fetch)fetch(nb.getAttribute("data-root")+"data/notices.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
    var NL={};try{NL=JSON.parse(nb.getAttribute("data-l")||"{}");}catch(e){}
    var lg=nb.getAttribute("data-lang")||"en",now=Date.now()/1000,rk={important:0,correction:1,notice:2};
    function seen(x){try{return localStorage.getItem("athena-nb-"+x.id)===String(x.rev);}catch(e){return false;}}
    var it=((j&&j.items)||[]).filter(function(x){return !x.withdrawn&&x.start<=now&&(!x.end||x.end>now);});
    var open=it.filter(function(x){return !seen(x);}).sort(function(a,b){return (rk[a.kind]-rk[b.kind])||(b.start-a.start);});
    if(!open.length)return;
    var x=open[0],own=lg==="el"&&x.title.el,ti=own?x.title.el:x.title.en,tx=own?x.text.el:x.text.en,la=(lg!=="en"&&!own)?' lang="en"':'';
    var page=nb.getAttribute("data-root")+nb.getAttribute("data-prefix")+"notices.html#n-"+x.id;
    nb.className="nbar k-"+x.kind;nb.setAttribute("role","region");nb.setAttribute("aria-label",(NL.k||{})[x.kind]||"Notice");
    nb.innerHTML='<div class="wrap"><span class="nk">'+esc((NL.k||{})[x.kind]||x.kind)+'</span><a class="nt" href="'+esc(page)+'"'+la+'><b>'+esc(ti)+'</b> '
      +'<span>'+esc(tx.split("\n")[0])+'</span></a>'+(open.length>1?'<a class="nmore" href="'+esc(nb.getAttribute("data-root")+nb.getAttribute("data-prefix")+"notices.html")+'">'+esc((NL.plus||"+{n}").replace("{n}",open.length-1))+'</a>':'')
      +'<button class="nx" type="button" aria-label="'+esc(NL.close||"Close")+'" title="'+esc(NL.close||"Close")+'">&times;</button></div>';
    nb.hidden=false;
    nb.querySelector(".nx").addEventListener("click",function(){try{localStorage.setItem("athena-nb-"+x.id,String(x.rev));}catch(e){}nb.hidden=true;});
  }).catch(function(){});
  // WEB-1.4: the boxes that change with every other story ("More in …", the tracker figures) are filled here from
  // data/related.json, so an event page itself changes — and is uploaded again — only when its own story changes
  var more=document.querySelectorAll(".js-more"),trk=document.querySelectorAll("[data-trk]");
  if((more.length||trk.length)&&window.fetch)fetch(root+"data/related.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
    var pre=(more[0]||trk[0]).getAttribute("data-base")||"";
    [].forEach.call(more,function(box){
      var me=+box.getAttribute("data-id"),lst=((j.cats||{})[box.getAttribute("data-cat")]||[]).filter(function(x){return x[0]!==me;}).slice(0,6);
      if(!lst.length)return;
      box.querySelector("ul").innerHTML=lst.map(function(x){return '<li><h3 class="hl-s" lang="en"><a href="'+esc(pre+"event/"+x[0]+".html")+'">'+esc(x[1])+'</a></h3>'
        +'<div class="meta c"><span>'+esc(ago(x[3])||"")+'</span><span class="rk '+rc(x[2])+'">'+esc(W.risk)+' '+(+x[2]).toFixed(1)+'</span></div></li>';}).join("");
      box.hidden=false;});
    [].forEach.call(trk,function(el){var v=(j.trk||{})[el.getAttribute("data-trk")];if(!v)return;
      el.innerHTML='<span class="rk '+rc(v.risk)+'">'+esc(W.risk)+' '+(+v.risk).toFixed(1)+'</span>'+(v.week>v.prev*1.15+0.5?' ▲':v.week<v.prev*0.85-0.5?' ▼':'');});
  }).catch(function(){});
  // WEB-1.8: the ask box — examples roll through the placeholder, "/" opens it, suggestions of places, trackers and sections
  function NZ(s){s=String(s||"").toLowerCase().normalize("NFD").replace(/\p{Mn}/gu,"").replace(/ς/g,"σ").replace(/ё/g,"е").replace(/ـ/g,"")
    .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[^\p{L}\p{N}\s]/gu," ");return s.replace(/\s+/g," ").trim();}
  var boxes=document.querySelectorAll("form.askbox"),still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  [].forEach.call(boxes,function(f){var q=f.querySelector("input"),x=f.querySelector(".ab-x"),ul=f.querySelector(".ab-sug"),ex=[],LB={},V=null,list=[],sel=-1,ei=0;
    try{ex=JSON.parse(f.getAttribute("data-examples")||"[]");LB=JSON.parse(f.getAttribute("data-lbl")||"{}");}catch(e){}
    function state(){f.classList.toggle("has-q",!!q.value);if(x)x.hidden=!q.value;}
    q.addEventListener("input",state);state();
    if(x)x.addEventListener("click",function(){q.value="";state();close();q.focus();});
    if(ex.length>1)setInterval(function(){if(q.value||document.activeElement===q||document.hidden)return;ei=(ei+1)%ex.length;
      if(still){q.placeholder=ex[ei];return;}q.classList.add("ph-out");setTimeout(function(){q.placeholder=ex[ei];q.classList.remove("ph-out");},260);},3800);
    function load(){if(V||!window.fetch)return;V={};fetch(f.getAttribute("data-vocab")).then(function(r){return r.json();}).then(function(v){V=v;
      var seen={};function add(name,kind,extra){var k=kind+"|"+name;if(!name||seen[k])return;seen[k]=1;list.push({n:name,k:kind,e:extra||"",z:NZ(name+" "+(extra||""))});}
      (v.topic_active||[]).forEach(function(s){add((v.tname||{})[s],"topic");});
      for(var r in (v.rname||{}))add(v.rname[r],"region",r!==v.rname[r]?r:"");
      for(var c in (v.catname||{}))add(v.catname[c],"section");
      for(var i in (v.cname||{})){var en=null;for(var pk in v.places){if(v.places[pk]===i&&/^[a-z ]+$/.test(pk)){en=pk;break;}}add(v.cname[i],"country",en&&NZ(v.cname[i])!==en?en.replace(/\b\w/g,function(m){return m.toUpperCase();}):"");}
      if(document.activeElement===q)suggest();}).catch(function(){});}
    function close(){ul.hidden=true;ul.innerHTML="";sel=-1;q.setAttribute("aria-expanded","false");q.removeAttribute("aria-activedescendant");}
    function frag(){var m=q.value.match(/(\S+)$/);return m?NZ(m[1]):"";}
    function suggest(){var fr=frag();if(!list.length||fr.length<2){close();return;}
      var hits=list.filter(function(o){return o.z.split(" ").some(function(w){return w.indexOf(fr)===0;});}).sort(function(a,b){
        var ra={topic:0,region:1,country:2,section:3},sa=a.z.indexOf(fr)===0?0:1,sb=b.z.indexOf(fr)===0?0:1;return sa-sb||ra[a.k]-ra[b.k]||a.n.length-b.n.length;}).slice(0,6);
      if(!hits.length){close();return;}
      ul.innerHTML=hits.map(function(o,i){return '<li role="option" id="'+ul.id+'-'+i+'" data-v="'+o.n.replace(/"/g,"&quot;")+'"><span class="t">'+(LB[o.k]||o.k)+'</span><span class="n">'
        +o.n.replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c];})+(o.e?' <span class="e">· '+o.e+'</span>':'')+'</span></li>';}).join("");
      ul.hidden=false;q.setAttribute("aria-expanded","true");sel=-1;}
    function pick(li){var v=li.getAttribute("data-v");q.value=q.value.replace(/(\S+)$/,"")+v+" ";state();close();q.focus();}
    function mark(){[].forEach.call(ul.children,function(li,i){li.setAttribute("aria-selected",i===sel?"true":"false");});
      if(sel>=0)q.setAttribute("aria-activedescendant",ul.children[sel].id);}
    q.addEventListener("focus",load);q.addEventListener("input",suggest);
    q.addEventListener("keydown",function(e){if(ul.hidden)return;var n=ul.children.length;
      if(e.key==="ArrowDown"){e.preventDefault();sel=(sel+1)%n;mark();}else if(e.key==="ArrowUp"){e.preventDefault();sel=(sel-1+n)%n;mark();}
      else if(e.key==="Enter"&&sel>=0){e.preventDefault();pick(ul.children[sel]);}else if(e.key==="Escape"){close();}});
    ul.addEventListener("mousedown",function(e){var li=e.target.closest("li");if(li){e.preventDefault();pick(li);}});
    q.addEventListener("blur",function(){setTimeout(close,120);});
    f.addEventListener("submit",close);});
  if(boxes.length)document.addEventListener("keydown",function(e){if(e.key!=="/"||e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target;
    if(t&&(t.isContentEditable||/^(input|textarea|select)$/i.test(t.tagName)))return;e.preventDefault();var q=boxes[0].querySelector("input");q.focus();q.select();});
  // WEB-1.7: filter the signals by kind
  [].forEach.call(document.querySelectorAll("[data-kf]"),function(b){b.addEventListener("click",function(){var k=b.getAttribute("data-kf");
    [].forEach.call(document.querySelectorAll("[data-kf]"),function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});
    [].forEach.call(document.querySelectorAll("li.sg"),function(li){li.hidden=!!k&&li.getAttribute("data-kind")!==k;});});});
  // WEB-1.5: the welcome folds to a single line for readers who have seen it (remembered in this browser only)
  var wl=document.getElementById("welcome"),wc=document.getElementById("w-close");
  if(wl&&wc){var mini=false;try{var wv=localStorage.getItem("athena-welcome");mini=wv==="mini"||(wv===null&&localStorage.getItem("athena-seen")==="1");if(wv===null)localStorage.setItem("athena-seen","1");}catch(e){}
    var setm=function(m){wl.classList.toggle("mini",m);wc.setAttribute("aria-expanded",m?"false":"true");wc.setAttribute("aria-label",m?W.wopen:W.wclose);wc.title=wc.getAttribute("aria-label");};
    setm(mini);wc.hidden=false;wc.addEventListener("click",function(){mini=!mini;setm(mini);try{localStorage.setItem("athena-welcome",mini?"mini":"full");}catch(e){}});}
  // 29 Oct 2026: every report time - in UTC, and how long ago it was from the reader's own current time ("28 Oct, 05:34 UTC · 3 h ago"),
  // brought up to date every minute while the page is open
  var stamps=[].slice.call(document.querySelectorAll("time[datetime]:not(#clock)"));
  function paint(){stamps.forEach(function(t){var iso=t.getAttribute("datetime"),a=ago(iso);
    if(t.hasAttribute("data-ago")&&a){t.textContent=a;}else if(fmt){t.textContent=fu(new Date(iso))+(a?" · "+a:"");}
    if(fmt)t.title=fu(new Date(iso));});}
  paint();if(stamps.length)setInterval(function(){if(!document.hidden)paint();},60000);
})();

/* 28 Oct: the menu - one drop-down open at a time; Escape or a click elsewhere closes it */
(function(){var nav=document.querySelector("nav.sections");if(!nav)return;
var all=function(){return nav.querySelectorAll("details")};
nav.addEventListener("toggle",function(ev){var d=ev.target;if(d.open)all().forEach(function(x){if(x!==d&&!x.contains(d))x.open=false})},true);
document.addEventListener("click",function(ev){if(!nav.contains(ev.target))all().forEach(function(x){x.open=false})});
document.addEventListener("keydown",function(ev){if(ev.key==="Escape")all().forEach(function(x){if(x.open){x.open=false;var s=x.querySelector("summary");if(s)s.focus()}})});
})();

/* 30 Oct 2026: the Sections panel - drawn once from data/sections-<lang>.json when it first opens on a wide screen */
(function(){var m=document.querySelector("nav.sections details.mega[data-kind=sections]");if(!m||!window.fetch)return;
var dd=m.querySelector(".mega-dd"),state=0,D=null,R=m.getAttribute("data-root")||"",P=m.getAttribute("data-pre")||"";
function x(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function u(p){return R+P+p}
function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":""}
function ago(ts){var h=Math.max(0,(Date.now()/1000-ts)/3600);return h<1?Math.max(1,Math.round(h*60))+" min":h<48?Math.round(h)+" h":Math.round(h/24)+" d"}
function mid(i){var s=D.sections[i],T=D.text,subs=s.subs.map(function(b){return '<a href="'+(b.n?u(b.url):u(s.url))+'"'+(b.n?'':' class="z"')+'>'+x(b.name)+(b.n?'<em>'+b.n+'</em>':'')+'</a>'}).join("");
 return '<h3><a href="'+u(s.url)+'">'+x(s.full)+'</a></h3><p class="mg-d">'+x(s.desc)+'</p><div class="mg-st"><div><b>'+s.n+'</b><span>'+x(T.events)+'</span></div><div><b>'+s.risk.toFixed(1)+'</b><span>'+x(T.top_risk)+'</span></div><div><b>'+s.cc+'</b><span>'+x(T.countries)+'</span></div></div><p class="mg-h">'+x(T.subs)+'</p><div class="mg-subs">'+subs+'</div>'}
function right(i){var s=D.sections[i],T=D.text;return '<p class="mg-h">'+x(T.now_in)+'</p>'+s.top.map(function(t){return '<a class="st" lang="en" href="'+u(t.url)+'">'+x(t.t)+'<small><i class="'+rc(t.risk)+'"></i>'+x(T.risk)+' '+t.risk.toFixed(1)+' · '+t.o+' '+x(T.outlets)+' · '+ago(t.ts)+'</small></a>'}).join("")+'<a class="all" href="'+u(s.url)+'">'+x(T.all.replace("{c}",s.name))+' &rarr;</a>'}
function pick(i){var l=dd.querySelectorAll(".mg-l a");for(var k=0;k<l.length;k++)l[k].classList.toggle("on",k===i);dd.querySelector(".mg-c").innerHTML=mid(i);dd.querySelector(".mg-r").innerHTML=right(i)}
function draw(){if(!D.sections.length)return;var on=(m.getAttribute("data-on")||"").replace("cat",""),first=0;
 var left=D.sections.map(function(s,i){if(String(s.id)===on)first=i;return '<a href="'+u(s.url)+'" data-i="'+i+'"><i style="background:'+x(s.color)+'"></i>'+x(s.name)+'<em>'+s.n+'</em></a>'}).join("");
 var ex=D.extra.map(function(b){return '<a href="'+u(b.url)+'">'+x(b.name)+'</a>'}).join("");
 dd.classList.add("full");dd.innerHTML='<div class="mg3"><div class="mg-l">'+left+'</div><div class="mg-c"></div><div class="mg-r"></div></div><div class="mg-x">'+ex+'</div>';
 var l=dd.querySelectorAll(".mg-l a");for(var k=0;k<l.length;k++){(function(a){var i=+a.getAttribute("data-i");a.addEventListener("mouseenter",function(){pick(i)});a.addEventListener("focus",function(){pick(i)})})(l[k])}
 pick(first)}
m.addEventListener("toggle",function(){if(!m.open||state||(window.matchMedia&&window.matchMedia("(max-width:820px)").matches))return;state=1;
 fetch(R+"data/sections-"+(m.getAttribute("data-lang")||"en")+".json").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){D=d;draw()}).catch(function(){state=0})});
})();

/* WLD-32: the World panel - continents | the chosen one's countries (Greece & Cyprus pinned) | its leading stories */
(function(){var m=document.querySelector("nav.sections details.mega[data-kind=world]");if(!m||!window.fetch)return;
var dd=m.querySelector(".mega-dd"),state=0,D=null,R=m.getAttribute("data-root")||"",P=m.getAttribute("data-pre")||"",F=R+"assets/cf/";
function x(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function u(p){return R+P+p}
function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":""}
function ago(ts){var h=Math.max(0,(Date.now()/1000-ts)/3600);return h<1?Math.max(1,Math.round(h*60))+" min":h<48?Math.round(h)+" h":Math.round(h/24)+" d"}
function c1(c){var fl=c.f?'<img src="'+F+x(c.iso)+'.svg" alt="" width="18" height="13">':'';return '<a href="'+(c.url?u(c.url):u(D.countries_url))+'"'+(c.q?' class="q"':'')+'>'+fl+x(c.name)+(c.n?'<i class="'+rc(c.risk)+'"></i><em>'+c.n+'</em>':'')+'</a>'}
function mid(i){var r=D.regions[i],T=D.text;var pin=D.pinned.map(c1).join("");
 return '<div class="mg-pin"><span>'+x(T.pinned)+'</span>'+pin+'</div><h3><a href="'+u(r.url)+'">'+x(r.name)+'</a></h3><div class="mg-st"><div><b>'+r.n+'</b><span>'+x(T.events)+'</span></div><div><b>'+r.risk.toFixed(1)+'</b><span>'+x(T.top_risk)+'</span></div><div><b>'+r.c.filter(function(c){return !c.q}).length+'</b><span>'+x(T.countries)+'</span></div></div><div class="mg-cg">'+r.c.map(c1).join("")+'</div>'}
function right(i){var r=D.regions[i],T=D.text;return '<p class="mg-h">'+x(T.now_in)+'</p>'+r.top.map(function(t){return '<a class="st" lang="en" href="'+u(t.url)+'">'+x(t.t)+'<small><i class="'+rc(t.risk)+'"></i>'+t.risk.toFixed(1)+' · '+t.o+' · '+ago(t.ts)+'</small></a>'}).join("")+'<a class="all" href="'+u(r.url)+'">'+x(T.all.replace("{r}",r.name))+' &rarr;</a>'}
function pick(i){var l=dd.querySelectorAll(".mg-l a");for(var k=0;k<l.length;k++)l[k].classList.toggle("on",k===i);dd.querySelector(".mg-c").innerHTML=mid(i);dd.querySelector(".mg-r").innerHTML=right(i)}
function draw(){if(!D.regions.length)return;var first=0,best=-1;D.regions.forEach(function(r,i){if(r.n>best){best=r.n;first=i}});
 var left=D.regions.map(function(r,i){return '<a href="'+u(r.url)+'" data-i="'+i+'"><i style="background:var(--'+(rc(r.risk)||"gold")+')"></i>'+x(r.name)+'<em>'+r.n+'</em></a>'}).join("");
 dd.classList.add("full");dd.innerHTML='<div class="mg3"><div class="mg-l">'+left+'</div><div class="mg-c"></div><div class="mg-r"></div></div><div class="mg-x"><a href="'+u(D.countries_url)+'">'+x(D.text.all_ctry)+'</a></div>';
 var l=dd.querySelectorAll(".mg-l a");for(var k=0;k<l.length;k++){(function(a){var i=+a.getAttribute("data-i");a.addEventListener("mouseenter",function(){pick(i)});a.addEventListener("focus",function(){pick(i)})})(l[k])}
 pick(first)}
m.addEventListener("toggle",function(){if(!m.open||state||(window.matchMedia&&window.matchMedia("(max-width:820px)").matches))return;state=1;
 fetch(R+"data/world-"+(m.getAttribute("data-lang")||"en")+".json").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){D=d;draw()}).catch(function(){state=0})});
})();

/* AL-34 Follow (kept in this browser only) and "For you" */
(function(){var K="athena-follow",S="athena-follow-seen";
function get(){try{var a=JSON.parse(localStorage.getItem(K)||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
function put(a){try{localStorage.setItem(K,JSON.stringify(a.slice(0,40)))}catch(e){}}
function has(a,k){for(var i=0;i<a.length;i++)if(a[i].k===k)return true;return false}
function paint(b,on){b.setAttribute("aria-pressed",on?"true":"false");b.classList.toggle("on",on);var n=b.textContent.split(" · ");b.textContent=(on?b.getAttribute("data-on"):b.getAttribute("data-off"))+(n.length>1?" · "+n.slice(1).join(" · "):"")}
var bs=document.querySelectorAll("button[data-follow]"),f=get();
for(var i=0;i<bs.length;i++){(function(b){paint(b,has(f,b.getAttribute("data-follow")));b.addEventListener("click",function(){var a=get(),k=b.getAttribute("data-follow"),on=has(a,k);
 a=on?a.filter(function(x){return x.k!==k}):a.concat([{k:k,n:b.getAttribute("data-fn")}]);put(a);
 var same=document.querySelectorAll('button[data-follow="'+k+'"]');for(var j=0;j<same.length;j++)paint(same[j],!on)})})(bs[i])}
var box=document.getElementById("foryou");if(!box||!f.length||!window.fetch)return;
var seen=0;try{seen=+localStorage.getItem(S)||0}catch(e){}
fetch(box.getAttribute("data-src")).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
 var F=d.fields||[],ix=function(n){return F.indexOf(n)},iS=ix("section"),iP=ix("places"),iT=ix("trackers"),iA=ix("about"),iL=ix("last_seen"),iH=ix("headline");
 var out=[];(d.events||[]).forEach(function(x){for(var j=0;j<f.length;j++){var k=f[j].k,t=k.slice(0,2),v=k.slice(2);
   if((t==="c_"&&String(x[iS])===v)||(t==="n_"&&(((iA>=0?x[iA]:null)||x[iP]||[]).indexOf(v)>=0))||(t==="t_"&&(x[iT]||[]).indexOf(v)>=0)){out.push(x);break}}});
 out.sort(function(a,b){return b[iL]-a[iL]});out=out.slice(0,8);
 var ol=box.querySelector(".fy-l"),pre=box.getAttribute("data-pre"),nw=box.getAttribute("data-new");
 if(!out.length){ol.innerHTML='<li class="fy-0">'+box.getAttribute("data-none").replace(/[<>&]/g,"")+'</li>'}
 else{out.forEach(function(x){var li=document.createElement("li"),a=document.createElement("a");a.href=pre+"event/"+x[0]+".html";a.textContent=x[iH];a.lang="en";
   if(x[iL]>seen&&seen){var s=document.createElement("b");s.className="fy-n";s.textContent=nw;li.appendChild(s)}li.appendChild(a);ol.appendChild(li)})}
 box.hidden=false;try{localStorage.setItem(S,String(Math.floor(Date.now()/1000)))}catch(e){}
}).catch(function(){});
})();
