
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
  [].forEach.call(document.querySelectorAll("time[datetime]"),function(t){var a=ago(t.getAttribute("datetime"));
    if(t.hasAttribute("data-ago")&&a){t.textContent=a;}else if(fmt){t.textContent=fmt.format(new Date(t.getAttribute("datetime")));}
    if(fmt)t.title=fmt.format(new Date(t.getAttribute("datetime")));});
})();
