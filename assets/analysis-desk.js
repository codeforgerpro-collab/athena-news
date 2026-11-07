(function(){"use strict";
var f=document.getElementById("dk-ask");if(!f)return;
var cfg={};try{cfg=JSON.parse(document.getElementById("dk-cfg").textContent)}catch(e){}
var cards=[].slice.call(document.querySelectorAll(".dk-card")),res=document.getElementById("dk-res"),hz=document.getElementById("dk-hz"),tp=document.getElementById("dk-topic");
function norm(s){s=String(s||"").toLowerCase();try{s=s.normalize("NFD").replace(/[̀-ͯ]/g,"")}catch(e){}return s}
function setH(){var v=hz.value;[].forEach.call(document.querySelectorAll("[data-h]"),function(n){n.textContent=v})}
function run(){
  var q=norm(document.getElementById("dk-q").value).split(/[^a-z0-9Ͱ-Ͽ]+/).filter(function(w){return w.length>2});
  var t=tp?tp.value:"";res.innerHTML="";
  if(!q.length){res.hidden=true;return}
  var sc=cards.filter(function(c){return!t||c.getAttribute("data-topic")===t}).map(function(c){
    var kw=c.getAttribute("data-kw")||"",n=0;q.forEach(function(w){if(kw.indexOf(w)>-1)n++});return{c:c,n:n}}).filter(function(x){return x.n>0});
  sc.sort(function(a,b){return b.n-a.n});sc=sc.slice(0,5);res.hidden=false;
  var h=document.createElement("h3");h.textContent=sc.length?cfg.res:cfg.none;res.appendChild(h);
  if(!sc.length)return;
  var ul=document.createElement("ul");
  sc.forEach(function(x,i){var li=document.createElement("li"),a=document.createElement("a");a.href="#"+x.c.id;a.textContent=x.c.querySelector(".dk-q").textContent;
    a.addEventListener("click",function(){x.c.open=true});li.appendChild(a);ul.appendChild(li);if(i===0)x.c.open=true});
  res.appendChild(ul);
}
f.addEventListener("submit",function(ev){ev.preventDefault();setH();run();var r=document.getElementById("dk-res");if(!r.hidden&&r.scrollIntoView)r.scrollIntoView({block:"nearest"})});
hz.addEventListener("change",setH);
var cap=document.getElementById("dk-cap");
[].forEach.call(document.querySelectorAll(".dk-dot"),function(d){
  function show(){cap.textContent=d.getAttribute("data-t")+" · "+d.getAttribute("data-r")+"/10"}
  function hide(){cap.textContent=cfg.hint||""}
  d.addEventListener("mouseenter",show);d.addEventListener("focus",show);d.addEventListener("mouseleave",hide);d.addEventListener("blur",hide);
  d.addEventListener("click",function(){var c=document.getElementById("a"+d.getAttribute("data-id"));if(c)c.open=true});
});
var qi=document.getElementById("dk-q"),ex=cfg.ex||[],k=0,ph=qi.getAttribute("placeholder");
if(ex.length&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)){setInterval(function(){
  if(document.activeElement===qi||qi.value)return;k=(k+1)%ex.length;qi.setAttribute("placeholder",ex[k])},3500)}
if(tp)tp.addEventListener("change",run);
if(location.hash&&/^#a\d+$/.test(location.hash)){var c=document.querySelector(location.hash);if(c&&c.tagName==="DETAILS")c.open=true}
setH();
})();