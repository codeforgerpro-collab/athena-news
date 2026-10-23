
(function(){
  var d=document.documentElement, L=d.getAttribute("lang")==="el";
  try{var t=localStorage.getItem("athena-site-theme");if(t)d.setAttribute("data-theme",t);}catch(e){}
  var b=document.getElementById("theme");
  if(b)b.addEventListener("click",function(){var cur=d.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
    var n=cur==="dark"?"light":"dark";d.setAttribute("data-theme",n);try{localStorage.setItem("athena-site-theme",n);}catch(e){}});
  function ago(s){var m=Math.round((Date.now()-Date.parse(s))/60000);if(isNaN(m))return null;if(m<2)return L?"μόλις τώρα":"just now";
    if(m<60)return m+(L?" λεπτά πριν":" min ago");var h=Math.round(m/60);if(h<48)return h+(L?" ώρες πριν":" h ago");return Math.round(h/24)+(L?" ημέρες πριν":" days ago");}
  var fmt,fday;try{fmt=new Intl.DateTimeFormat(L?"el-GR":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    fday=new Intl.DateTimeFormat(L?"el-GR":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}catch(e){}
  var u=document.querySelector(".util"),td=document.getElementById("today");if(td&&fday)td.textContent=fday.format(new Date());
  if(u&&window.fetch)fetch((u.getAttribute("data-root")||"")+"data/updated.json",{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
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
    var brk=it.every(function(x){return x.kind==="breaking";}),root=tk.getAttribute("data-root")+tk.getAttribute("data-prefix");
    function esc(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
    function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":"";}
    var one=it.map(function(x){var a=ago(x.time)||"";return '<a class="ti" href="'+esc(root+x.page)+'">'+(!brk&&x.kind==="breaking"?'<em class="tn">'+(L?"Νέο":"New")+'</em>':'')+'<time datetime="'+esc(x.time)+'">'+esc(a)+'</time><b>'+esc(x.title)+'</b>'
      +'<span class="rk '+rc(x.risk)+'">'+(L?"Κίνδυνος ":"Risk ")+x.risk.toFixed(1)+'</span></a>';}).join("");
    var lbl=brk?(L?"Έκτακτο":"Breaking"):(L?"Τελευταία":"Latest");
    tk.className="ticker"+(brk?"":" latest");tk.setAttribute("role","region");tk.setAttribute("aria-label",lbl);
    tk.innerHTML='<div class="wrap"><div class="tl"><i></i>'+lbl+'<span>· '+it.length+'</span></div><div class="tv"><div class="tt">'+one+'<span aria-hidden="true" style="display:inline-flex">'+one+'</span></div></div>'
      +'<button class="tp" type="button" aria-label="'+(L?"Παύση":"Pause")+'" title="'+(L?"Παύση / συνέχεια":"Pause / play")+'">❚❚</button></div>';
    [].forEach.call(tk.querySelectorAll('[aria-hidden] a'),function(a){a.tabIndex=-1;});
    var tt=tk.querySelector(".tt");tk.hidden=false;
    var dv=document.querySelector(".dev");if(dv)dv.hidden=true;                             // the bar replaces the static "developing" strip
    tt.style.setProperty("--tkd",Math.max(25,Math.round(tt.scrollWidth/2/60))+"s");          // ~60 px a second, whatever the number of items
    var pb=tk.querySelector(".tp");pb.addEventListener("click",function(){var p=tk.classList.toggle("paused");pb.textContent=p?"▶":"❚❚";});
  }).catch(function(){});
  [].forEach.call(document.querySelectorAll("time[datetime]"),function(t){var a=ago(t.getAttribute("datetime"));
    if(t.hasAttribute("data-ago")&&a){t.textContent=a;}else if(fmt){t.textContent=fmt.format(new Date(t.getAttribute("datetime")));}
    if(fmt)t.title=fmt.format(new Date(t.getAttribute("datetime")));});
})();
