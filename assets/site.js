
(function(){
  // WEB-1.4: one script for every language — the words come from W (site_i18n.JS), chosen by the page's lang
  var d=document.documentElement, LG=d.getAttribute("lang")||"en", ALL={"en":{"now":"just now","m":" min ago","h":" h ago","d":" days ago","brk":"Breaking","lat":"Latest","new":"New","risk":"Risk","pause":"Pause","pp":"Pause / play","clock":"Your local time","intl":"en-GB"},"el":{"now":"μόλις τώρα","m":" λεπτά πριν","h":" ώρες πριν","d":" ημέρες πριν","brk":"Έκτακτο","lat":"Τελευταία","new":"Νέο","risk":"Κίνδυνος","pause":"Παύση","pp":"Παύση / συνέχεια","clock":"Η ώρα σας","intl":"el-GR"},"es":{"now":"ahora mismo","m":" min","h":" h","d":" días","pre":"hace ","brk":"Última hora","lat":"Lo último","new":"Nuevo","risk":"Riesgo","pause":"Pausa","pp":"Pausa / reanudar","clock":"Su hora local","intl":"es-ES"},"fr":{"now":"à l'instant","m":" min","h":" h","d":" jours","pre":"il y a ","brk":"Dernière minute","lat":"En continu","new":"Nouveau","risk":"Risque","pause":"Pause","pp":"Pause / lecture","clock":"Votre heure locale","intl":"fr-FR"},"de":{"now":"gerade eben","m":" Min.","h":" Std.","d":" Tagen","pre":"vor ","brk":"Eilmeldung","lat":"Neueste","new":"Neu","risk":"Risiko","pause":"Pause","pp":"Pause / weiter","clock":"Ihre Ortszeit","intl":"de-DE"},"ar":{"now":"الآن","m":" دقيقة","h":" ساعة","d":" يوم","pre":"قبل ","brk":"عاجل","lat":"الأحدث","new":"جديد","risk":"الخطر","pause":"إيقاف مؤقت","pp":"إيقاف / تشغيل","clock":"توقيتك المحلي","intl":"ar"},"ru":{"now":"только что","m":" мин назад","h":" ч назад","d":" дн. назад","brk":"Срочно","lat":"Последнее","new":"Новое","risk":"Риск","pause":"Пауза","pp":"Пауза / продолжить","clock":"Ваше местное время","intl":"ru-RU"}}, W=ALL[LG]||ALL.en, LOC=W.intl||"en-GB";
  try{var t=localStorage.getItem("athena-site-theme");if(t)d.setAttribute("data-theme",t);}catch(e){}
  var b=document.getElementById("theme");
  if(b)b.addEventListener("click",function(){var cur=d.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
    var n=cur==="dark"?"light":"dark";d.setAttribute("data-theme",n);try{localStorage.setItem("athena-site-theme",n);}catch(e){}});
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
  [].forEach.call(document.querySelectorAll("time[datetime]:not(#clock)"),function(t){var a=ago(t.getAttribute("datetime"));
    if(t.hasAttribute("data-ago")&&a){t.textContent=a;}else if(fmt){t.textContent=fmt.format(new Date(t.getAttribute("datetime")));}
    if(fmt)t.title=fmt.format(new Date(t.getAttribute("datetime")));});
})();
