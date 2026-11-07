(function(){"use strict";
var f=document.getElementById("dk-ask");if(!f)return;
var cfg={};try{cfg=JSON.parse(document.getElementById("dk-cfg").textContent)}catch(e){}
var cards=[].slice.call(document.querySelectorAll(".dk-card")),res=document.getElementById("dk-res"),hz=document.getElementById("dk-hz"),tp=document.getElementById("dk-topic");
function norm(s){s=String(s||"").toLowerCase();try{s=s.normalize("NFD").replace(/[̀-ͯ]/g,"")}catch(e){}return s}
function setH(){var v=hz.value;[].forEach.call(document.querySelectorAll("[data-h]"),function(n){n.textContent=v})}
var RD=cfg.rd||{},AL=cfg.al||{},STOP="what will the and are does did going next how why when that this with from have about into their could would should still there than then them were was has not you your who whom which que quoi sera vont les des est faire pour dans une sur par avec nous vous ils elles και για απο στην στο της του των τον την ενα μια ειναι θα".split(" ");
function mk(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function fill(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m})}
function terms(raw){var own=raw.slice(),al=[],read=[];raw.forEach(function(w){if(AL[w]){read.push(w+" → "+AL[w].slice(0,3).join(", "));AL[w].forEach(function(x){if(own.indexOf(x)<0&&al.indexOf(x)<0)al.push(x)})}});return{own:own,al:al,read:read}}
function reading(sc,raw,tm){
  var W=0,R=0,O=0,C=0,up=0,dn=0,fl=0,a="9999",z="0000";
  sc.forEach(function(x){var c=x.c,r=parseFloat(c.getAttribute("data-r"))||0,o=parseInt(c.getAttribute("data-no"),10)||1,w=o*x.n;
    W+=w;R+=r*w;O+=o;C=Math.max(C,parseInt(c.getAttribute("data-nc"),10)||0);
    var t=c.getAttribute("data-tr");if(t==="up")up+=w;else if(t==="dn")dn+=w;else if(t==="flat")fl+=w;
    var da=c.getAttribute("data-a"),dz=c.getAttribute("data-z");if(da&&da<a)a=da;if(dz&&dz>z)z=dz});
  var r=W?R/W:0,b=r<4?0:r<6?1:r<8?2:3,tr=(up>dn&&up>fl)?"up":(dn>up&&dn>fl)?"dn":(up+dn+fl>0)?"flat":"none";
  var d=mk("section","dk-rd");d.appendChild(mk("h3",null,RD.h));
  var q=mk("p","dk-rdq");q.appendChild(mk("b",null,RD.q+": "));q.appendChild(document.createTextNode(raw));d.appendChild(q);
  if(tm.read.length)d.appendChild(mk("p","small",RD.read+": "+tm.read.join("; ")));
  d.appendChild(mk("p","small",fill(RD.basis,{n:sc.length,o:O,c:C,a:a,b:z})));
  var dl=mk("dl","dk-ans");
  dl.appendChild(mk("dt",null,RD.now_l));dl.appendChild(mk("dd",null,fill(RD.now,{r:r.toFixed(1),band:(RD.bands||[])[b]})));
  dl.appendChild(mk("dt",null,fill(RD.path_h,{h:hz.value})));dl.appendChild(mk("dd",null,RD.fc[b]+" "+(RD.tr[tr]||"")));
  d.appendChild(dl);
  var tb=mk("table","dk-t"),tbd=mk("tbody");
  RD.oc.forEach(function(o,i){var tr2=mk("tr"),th=mk("th",null,o);th.setAttribute("scope","row");tr2.appendChild(th);tr2.appendChild(mk("td",null,RD.oc_d[i]));
    var k=RD.LK[b][i];tr2.appendChild(mk("td","dk-lk dk-"+k,RD.lk[k]));tbd.appendChild(tr2)});
  tb.appendChild(tbd);d.appendChild(tb);
  var w=mk("p");w.appendChild(document.createTextNode(RD.wrong_l+" "));w.appendChild(mk("b",null,RD.wrong));d.appendChild(w);
  d.appendChild(mk("p","small",RD.how));d.appendChild(mk("p","small dk-lim",RD.lim));
  var top=sc[0].c,lk=mk("a",null,RD.open+" ›");lk.href="#"+top.id;lk.addEventListener("click",function(){top.open=true});
  var pp=mk("p");pp.appendChild(lk);d.appendChild(pp);return d}
function run(){
  var raw=document.getElementById("dk-q").value,q=norm(raw).split(/[^a-z0-9Ͱ-Ͽ]+/).filter(function(w){return(w.length>2||AL[w])&&STOP.indexOf(w)<0});
  var t=tp?tp.value:"";res.innerHTML="";
  if(!q.length){res.hidden=true;return}
  var tm=terms(q);
  var sc=cards.filter(function(c){return!t||c.getAttribute("data-topic")===t}).map(function(c){
    var kw=c.getAttribute("data-kw")||"",n=0;tm.own.forEach(function(w){if(kw.indexOf(w)>-1)n+=2});tm.al.forEach(function(w){if(kw.indexOf(w)>-1)n+=1});return{c:c,n:n}}).filter(function(x){return x.n>0});
  sc.sort(function(a,b){return b.n-a.n});sc=sc.slice(0,6);res.hidden=false;
  if(sc.length)res.appendChild(reading(sc,raw,tm));
  var h=document.createElement("h3");h.textContent=sc.length?cfg.res:cfg.none;res.appendChild(h);
  if(!sc.length)return;
  var ul=document.createElement("ul");
  sc.slice(0,5).forEach(function(x,i){var li=document.createElement("li"),a=document.createElement("a");a.href="#"+x.c.id;a.textContent=x.c.querySelector(".dk-q").textContent;
    a.addEventListener("click",function(){x.c.open=true});li.appendChild(a);ul.appendChild(li)});
  res.appendChild(ul);
}
f.addEventListener("submit",function(ev){ev.preventDefault();setH();run();var r=document.getElementById("dk-res");if(!r.hidden&&r.scrollIntoView)r.scrollIntoView({block:"nearest"})});
hz.addEventListener("change",setH);
var cap=document.getElementById("dk-cap");
[].forEach.call(document.querySelectorAll(".dk-dot"),function(d){
  var tip=document.getElementById("dk-tip"),bw=tip&&tip.parentNode;
  function show(){cap.textContent=d.getAttribute("data-t")+" · "+d.getAttribute("data-r")+"/10";
    if(!tip)return;var b=d.getBoundingClientRect(),w=bw.getBoundingClientRect(),g=d.querySelector("circle:not(.dk-halo)").getBoundingClientRect();
    tip.innerHTML="";var t=document.createElement("b");t.textContent=d.getAttribute("data-t");var m=document.createElement("span");
    m.textContent=d.getAttribute("data-b")+" · "+d.getAttribute("data-r")+"/10 · "+(cfg.by||"")+" "+d.getAttribute("data-n");tip.appendChild(t);tip.appendChild(m);
    tip.hidden=false;var x=g.left+g.width/2-w.left,tw=tip.offsetWidth;x=Math.max(tw/2+4,Math.min(w.width-tw/2-4,x));tip.style.left=x+"px";tip.style.top=(g.top-w.top)+"px"}
  function hide(){cap.textContent=cfg.hint||"";if(tip)tip.hidden=true}
  d.addEventListener("mouseenter",show);d.addEventListener("focus",show);d.addEventListener("mouseleave",hide);d.addEventListener("blur",hide);
  d.addEventListener("click",function(){var c=document.getElementById("a"+d.getAttribute("data-id"));if(c)c.open=true});
});
var qi=document.getElementById("dk-q"),ex=cfg.ex||[],k=0,ph=qi.getAttribute("placeholder");
if(ex.length&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)){setInterval(function(){
  if(document.activeElement===qi||qi.value)return;k=(k+1)%ex.length;qi.setAttribute("placeholder",ex[k])},3500)}
(function(){var tr=document.getElementById("dk-try"),f=document.getElementById("dk-ask");if(!tr||!ex.length||!f)return;
  var l=document.createElement("span");l.textContent=((cfg.dd||{}).try||"")+":";tr.appendChild(l);
  ex.slice(0,3).forEach(function(q){var b=document.createElement("button");b.type="button";b.textContent=q.replace(/\?$/,"");b.title=q;
    b.onclick=function(){qi.value=q;qi.dispatchEvent(new Event("input",{bubbles:true}));if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event("submit",{cancelable:true}))};tr.appendChild(b)});
  tr.hidden=false})();
if(tp)tp.addEventListener("change",run);
if(location.hash&&/^#a\d+$/.test(location.hash)){var c=document.querySelector(location.hash);if(c&&c.tagName==="DETAILS")c.open=true}
var CHG=cfg.ch||{},sk="athena-desk-seen",st={t:0,v:{}};
try{st=JSON.parse(localStorage.getItem(sk)||"")||st}catch(e){st={t:0,v:{}}}
var nowv={},mvd=0,nwd=0,had=Object.keys(st.v||{}).length>0;
cards.forEach(function(c){var id=c.id,r=parseFloat(c.getAttribute("data-r"))||0,b=c.querySelector(".dk-chg");nowv[id]=r;if(!b||!had)return;
  if(!(id in st.v)){nwd++;b.textContent=CHG["new"];b.hidden=false}
  else{var d=r-st.v[id];if(Math.abs(d)>=0.3){mvd++;b.textContent=fill(d>0?CHG.up:CHG.dn,{d:Math.abs(d).toFixed(1)});b.className+=d>0?" up":" dn";b.hidden=false}}});
var sb=document.getElementById("dk-since");if(sb&&(mvd||nwd)){sb.textContent=fill(CHG.sum,{m:mvd,n:nwd})+" "+CHG.priv;sb.hidden=false}
try{if(!had||(Date.now()-st.t)>216e5)localStorage.setItem(sk,JSON.stringify({t:Date.now(),v:nowv}))}catch(e){}
setH();
var DD=cfg.dd||{},SUG=cfg.sug||[],box=document.getElementById("dk-box"),pn=document.getElementById("dk-dd"),xb=document.getElementById("dk-x"),items=[],act=-1,RK="athena-desk-recent",WRD=/[^a-z0-9Ͱ-Ͽ]+/;
function recent(){try{var a=JSON.parse(localStorage.getItem(RK)||"[]");return Array.isArray(a)?a.filter(function(x){return typeof x==="string"}).slice(0,5):[]}catch(e){return[]}}
function remember(v){v=String(v||"").trim();if(v.length<3)return;try{var a=recent().filter(function(x){return x!==v});a.unshift(v);localStorage.setItem(RK,JSON.stringify(a.slice(0,5)))}catch(e){}}
function quick(raw){var q=norm(raw).split(WRD).filter(function(w){return(w.length>2||AL[w])&&STOP.indexOf(w)<0});if(!q.length)return[];var tm=terms(q),t=tp?tp.value:"";
  return cards.filter(function(c){return!t||c.getAttribute("data-topic")===t}).map(function(c){var kw=c.getAttribute("data-kw")||"",n=0;tm.own.forEach(function(w){if(kw.indexOf(w)>-1)n+=2});tm.al.forEach(function(w){if(kw.indexOf(w)>-1)n+=1});return{c:c,n:n}}).filter(function(x){return x.n>0}).sort(function(a,b){return b.n-a.n})}
function cnt(n){return n===1?DD.n1:fill(DD.n,{n:n})}
function setAct(i){if(act>-1&&items[act])items[act].setAttribute("aria-selected","false");act=i;if(i>-1&&items[i]){items[i].setAttribute("aria-selected","true");qi.setAttribute("aria-activedescendant",items[i].id);if(items[i].scrollIntoView)items[i].scrollIntoView({block:"nearest"})}else qi.removeAttribute("aria-activedescendant")}
function isOpen(){return!pn.hidden}
function closeDD(){pn.hidden=true;qi.setAttribute("aria-expanded","false");setAct(-1)}
function ask(v){qi.value=v;syncX();closeDD();remember(v);setH();run();if(!res.hidden&&res.scrollIntoView)res.scrollIntoView({block:"nearest"})}
function openCard(c){closeDD();c.open=true;try{history.replaceState(null,"","#"+c.id)}catch(e){}if(c.scrollIntoView)c.scrollIntoView({block:"start"})}
function syncX(){xb.hidden=!qi.value}
function build(){
  var raw=qi.value.trim();pn.textContent="";items=[];act=-1;
  function gh(t,btn){var d=mk("div","dk-gh");d.setAttribute("role","presentation");d.appendChild(mk("span",null,t));if(btn)d.appendChild(btn);pn.appendChild(d)}
  function op(t,m,fn,cls){var d=mk("div","dk-op"+(cls?" "+cls:""));d.setAttribute("role","option");d.id="dk-o"+items.length;d.setAttribute("aria-selected","false");d.appendChild(mk("span","dk-ot",t));if(m)d.appendChild(mk("span","dk-om",m));
    d.addEventListener("mousedown",function(e){e.preventDefault()});d.addEventListener("click",fn);d.addEventListener("mousemove",function(){var i=items.indexOf(d);if(i!==act)setAct(i)});items.push(d);pn.appendChild(d)}
  function sugs(f){var out=[];SUG.forEach(function(s){if(f&&(norm(s).indexOf(f)<0||norm(s)===f))return;var n=quick(s).length;if(n>0)out.push([s,n])});return out}
  var found=0;
  if(raw.length<2){
    var rc=recent();
    if(rc.length){var cb=mk("button",null,DD.rclr);cb.type="button";cb.addEventListener("mousedown",function(e){e.preventDefault()});cb.addEventListener("click",function(){try{localStorage.removeItem(RK)}catch(e){}build()});
      gh(DD.recent,cb);rc.forEach(function(s){op(s,"",function(){ask(s)})});found++}
    var sg=sugs("").slice(0,5);
    if(sg.length){gh(DD.try);sg.forEach(function(x){op(x[0],cnt(x[1]),function(){ask(x[0])})});found++}
    else if((cfg.ex||[]).length){gh(DD.try);cfg.ex.forEach(function(s){op(s,"",function(){ask(s)})});found++}
  }else{
    op(DD.ask+" “"+raw+"”","↵",function(){ask(raw)},"dk-main");
    var m=quick(raw).slice(0,5);
    if(m.length){gh(DD.match);m.forEach(function(x){var c=x.c;op(c.querySelector(".dk-q").textContent,(parseFloat(c.getAttribute("data-r"))||0).toFixed(1)+"/10",function(){openCard(c)})});found++}
    var sg2=sugs(norm(raw)).slice(0,3);
    if(sg2.length){gh(DD.try);sg2.forEach(function(x){op(x[0],cnt(x[1]),function(){ask(x[0])})});found++}
    if(!m.length&&!sg2.length)pn.appendChild(mk("div","dk-none",DD.none))
  }
  var ft=mk("div","dk-ft");ft.appendChild(mk("b",null,DD.tips_h));var ul=mk("ul");(DD.tips||[]).forEach(function(t){ul.appendChild(mk("li",null,t))});ft.appendChild(ul);ft.appendChild(mk("span","dk-kb",DD.kb));pn.appendChild(ft)}
function openDD(){pn.hidden=false;qi.setAttribute("aria-expanded","true");build()}
qi.addEventListener("focus",openDD);qi.addEventListener("click",function(){if(!isOpen())openDD()});
qi.addEventListener("input",function(){syncX();openDD()});
qi.addEventListener("keydown",function(ev){var k=ev.key;
  if(k==="ArrowDown"||k==="ArrowUp"){ev.preventDefault();if(!isOpen()){openDD();return}var n=items.length;if(!n)return;setAct(k==="ArrowDown"?(act+1)%n:(act<=0?n-1:act-1))}
  else if(k==="Enter"&&isOpen()&&act>-1){ev.preventDefault();items[act].click()}
  else if(k==="Escape"){if(isOpen()){ev.preventDefault();closeDD()}}
  else if(k==="Tab")closeDD()});
document.addEventListener("mousedown",function(ev){if(isOpen()&&!box.contains(ev.target))closeDD()});
document.addEventListener("keydown",function(ev){if(ev.key!=="/"||ev.ctrlKey||ev.metaKey||ev.altKey)return;var t=ev.target,n=t&&t.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||(t&&t.isContentEditable))return;ev.preventDefault();qi.focus()});
xb.addEventListener("click",function(){qi.value="";syncX();qi.focus();openDD()});
f.addEventListener("submit",function(){remember(qi.value);closeDD()});
var sgb=[].slice.call(document.querySelectorAll(".dk-sg button"));
function syncSeg(){sgb.forEach(function(b){var on=b.getAttribute("data-v")===hz.value;b.setAttribute("aria-checked",on?"true":"false");b.className=on?"on":""})}
sgb.forEach(function(b){b.addEventListener("click",function(){hz.value=b.getAttribute("data-v");try{hz.dispatchEvent(new Event("change"))}catch(e){}syncSeg();if(res&&!res.hidden)run()})});
syncSeg();syncX();
})();