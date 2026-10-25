
(function(){
  // WEB-1.4: one script for every language — the words come from W (site_i18n.JS), chosen by the page's lang
  var d=document.documentElement, LG=d.getAttribute("lang")||"en", ALL={"en":{"now":"just now","m":" min ago","h":" h ago","d":" days ago","brk":"Breaking","lat":"Latest","new":"New","risk":"Risk","pause":"Pause","pp":"Pause / play","clock":"Your local time","wclose":"Fold the welcome","wopen":"Show the welcome","intl":"en-GB"},"el":{"now":"μόλις τώρα","m":" λεπτά πριν","h":" ώρες πριν","d":" ημέρες πριν","brk":"Έκτακτο","lat":"Τελευταία","new":"Νέο","risk":"Κίνδυνος","pause":"Παύση","pp":"Παύση / συνέχεια","clock":"Η ώρα σας","wclose":"Σύμπτυξη του καλωσορίσματος","wopen":"Εμφάνιση του καλωσορίσματος","intl":"el-GR"},"es":{"now":"ahora mismo","m":" min","h":" h","d":" días","pre":"hace ","brk":"Última hora","lat":"Lo último","new":"Nuevo","risk":"Riesgo","pause":"Pausa","pp":"Pausa / reanudar","clock":"Su hora local","wclose":"Plegar la bienvenida","wopen":"Mostrar la bienvenida","intl":"es-ES"},"fr":{"now":"à l'instant","m":" min","h":" h","d":" jours","pre":"il y a ","brk":"Dernière minute","lat":"En continu","new":"Nouveau","risk":"Risque","pause":"Pause","pp":"Pause / lecture","clock":"Votre heure locale","wclose":"Replier l'accueil","wopen":"Afficher l'accueil","intl":"fr-FR"},"de":{"now":"gerade eben","m":" Min.","h":" Std.","d":" Tagen","pre":"vor ","brk":"Eilmeldung","lat":"Neueste","new":"Neu","risk":"Risiko","pause":"Pause","pp":"Pause / weiter","clock":"Ihre Ortszeit","wclose":"Willkommen einklappen","wopen":"Willkommen anzeigen","intl":"de-DE"},"ar":{"now":"الآن","m":" دقيقة","h":" ساعة","d":" يوم","pre":"قبل ","brk":"عاجل","lat":"الأحدث","new":"جديد","risk":"الخطر","pause":"إيقاف مؤقت","pp":"إيقاف / تشغيل","clock":"توقيتك المحلي","wclose":"طيّ الترحيب","wopen":"إظهار الترحيب","intl":"ar"},"ru":{"now":"только что","m":" мин назад","h":" ч назад","d":" дн. назад","brk":"Срочно","lat":"Последнее","new":"Новое","risk":"Риск","pause":"Пауза","pp":"Пауза / продолжить","clock":"Ваше местное время","wclose":"Свернуть приветствие","wopen":"Показать приветствие","intl":"ru-RU"}}, W=ALL[LG]||ALL.en, LOC=W.intl||"en-GB";
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
  function ago(s){var m=Math.round((Date.now()-Date.parse(s))/60000);if(isNaN(m))return null;if(m<2)return W.now;var p=W.pre||"";
    if(m<60)return p+m+W.m;var h=Math.round(m/60);if(h<48)return p+h+W.h;return p+Math.round(h/24)+W.d;}
  function esc(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":"";}
  var fmt,fday;try{fmt=new Intl.DateTimeFormat(LOC,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    fday=new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"long",year:"numeric"});}catch(e){}
  var u=document.querySelector(".util"),td=document.getElementById("today");if(td&&fday)td.textContent=fday.format(new Date());
  // the reader's own local time next to the date (their device's time zone), kept current
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
    if(fmt)t.title=fmt.format(new Date(j.updated));s.hidden=false;}).catch(function(){});
  var c=document.querySelector('meta[name="athena-count"]');
  if(c&&/^https?:$/.test(location.protocol)&&!/^(localhost|127\.|\[::1\])/.test(location.hostname)&&navigator.doNotTrack!=="1"&&!navigator.webdriver){
    try{var q="?p="+encodeURIComponent(location.pathname)+"&t="+encodeURIComponent(document.title)+"&r="+encodeURIComponent(document.referrer||"")
      +"&s="+encodeURIComponent(screen.width+","+screen.height+","+(window.devicePixelRatio||1))+"&rnd="+Math.random().toString(36).slice(2);
      var im=new Image();im.src=c.getAttribute("content")+q;}catch(e){}}
  // the rolling news bar (data/breaking.json): breaking events, or the latest important updates when nothing new broke
  var tk=document.getElementById("ticker");
  if(tk&&window.fetch)fetch(tk.getAttribute("data-root")+"data/breaking.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
    var it=(j&&j.items)||[];if(!it.length)return;
    var brk=it.every(function(x){return x.kind==="breaking";}),base=tk.getAttribute("data-root")+tk.getAttribute("data-prefix");
    var one=it.map(function(x){var a=ago(x.time)||"";return '<a class="ti" lang="en" href="'+esc(base+x.page)+'">'+(!brk&&x.kind==="breaking"?'<em class="tn" lang="'+LG+'">'+esc(W.new)+'</em>':'')+'<time datetime="'+esc(x.time)+'" lang="'+LG+'">'+esc(a)+'</time><b>'+esc(x.title)+'</b>'
      +'<span class="rk '+rc(x.risk)+'" lang="'+LG+'">'+esc(W.risk)+' '+x.risk.toFixed(1)+'</span></a>';}).join("");
    var lbl=brk?W.brk:W.lat;
    tk.className="ticker"+(brk?"":" latest");tk.setAttribute("role","region");tk.setAttribute("aria-label",lbl);
    tk.innerHTML='<div class="wrap"><div class="tl"><i></i>'+esc(lbl)+'<span>· '+it.length+'</span></div><div class="tv"><div class="tt">'+one+'<span aria-hidden="true" style="display:inline-flex">'+one+'</span></div></div>'
      +'<button class="tp" type="button" aria-label="'+esc(W.pause)+'" title="'+esc(W.pp)+'">❚❚</button></div>';
    [].forEach.call(tk.querySelectorAll('[aria-hidden] a'),function(a){a.tabIndex=-1;});
    var tt=tk.querySelector(".tt");tk.hidden=false;
    var dv=document.querySelector(".dev");if(dv)dv.hidden=true;                             // the bar replaces the static "developing" strip
    tt.style.setProperty("--tkd",Math.max(25,Math.round(tt.scrollWidth/2/60))+"s");          // ~60 px a second, whatever the number of items
    var pb=tk.querySelector(".tp");pb.addEventListener("click",function(){var p=tk.classList.toggle("paused");pb.textContent=p?"▶":"❚❚";});
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
  if(wl&&wc){var mini=false;try{mini=localStorage.getItem("athena-welcome")==="mini";}catch(e){}
    var setm=function(m){wl.classList.toggle("mini",m);wc.setAttribute("aria-expanded",m?"false":"true");wc.setAttribute("aria-label",m?W.wopen:W.wclose);wc.title=wc.getAttribute("aria-label");};
    setm(mini);wc.hidden=false;wc.addEventListener("click",function(){mini=!mini;setm(mini);try{localStorage.setItem("athena-welcome",mini?"mini":"full");}catch(e){}});}
  [].forEach.call(document.querySelectorAll("time[datetime]:not(#clock)"),function(t){var a=ago(t.getAttribute("datetime"));
    if(t.hasAttribute("data-ago")&&a){t.textContent=a;}else if(fmt){t.textContent=fmt.format(new Date(t.getAttribute("datetime")));}
    if(fmt)t.title=fmt.format(new Date(t.getAttribute("datetime")));});
})();
