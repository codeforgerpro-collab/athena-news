
/* SGH-37 ATHENA Signals: draws the charts from data/athena-signals.json for the chosen section; nothing is sent anywhere */
(function(){var box=document.getElementById("sg");if(!box)return;var P={};try{P=JSON.parse(document.getElementById("sg-cfg").textContent)}catch(e){return}
var L=P.l,R=P.root||"",PF=P.prefix||"",D=null,sec="0",rng=90,NS="http://www.w3.org/2000/svg";
function $(i){return document.getElementById(i)}
function f(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&o[k]!=null?o[k]:m})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function dt(i,y){var o={day:"numeric",month:"short",timeZone:"UTC"};if(y)o.year="numeric";try{return new Intl.DateTimeFormat(P.lang,o).format(new Date((D.d0+i)*864e5))}catch(e){return String(D.d0+i)}}
function pal(){var c=getComputedStyle(document.documentElement);function g(n,d){var v=c.getPropertyValue(n).trim();return v||d}
 return{ink:g("--ink","#141a24"),mut:g("--muted","#5b6472"),rule:g("--rule","#d9d1c1"),gold:g("--gold","#a8843a"),gold2:g("--gold2","#8a6a24"),elev:g("--elev","#a16207"),high:g("--high","#c2410c"),crit:g("--crit","#9f1239"),paper:g("--paper","#fbf8f2"),chip:g("--chip","#efe8da")}}
var C=pal();function rc(v){v=v/10;return v>=8?C.crit:v>=6?C.high:v>=4?C.elev:C.gold}
function nm(k){return P.cats[k]||k}
function body(id){return document.querySelector("#sg-"+id+" .sg-b")}
function rd(id,t){var n=document.querySelector("#sg-"+id+" .sg-read");if(n)n.textContent=t||""}
function svg(w,h,inner,label){return '<svg class="sg-svg" viewBox="0 0 '+w+' '+h+'" data-w="'+w+'" data-h="'+h+'" role="img" aria-label="'+esc(label||"")+'" font-family="Helvetica Neue,Arial,sans-serif" font-size="12">'+inner+'</svg>'}
function lock(id,need,n,k){var b=body(id);b.innerHTML='<div class="sg-lock"><b>'+esc(f(L[k||"need"],{need:need,n:n}))+'</b><span class="sg-pg"><i style="width:'+Math.max(2,Math.min(100,Math.round(n/need*100)))+'%"></i></span></div>';rd(id,"")}
function T(x,y,t,o){o=o||{};return '<text x="'+x+'" y="'+y+'" fill="'+(o.c||C.mut)+'"'+(o.a?' text-anchor="'+o.a+'"':'')+(o.s?' font-size="'+o.s+'"':'')+(o.w?' font-weight="'+o.w+'"':'')+(o.f?' font-family="'+o.f+'"':'')+'>'+esc(t)+'</text>'}
function S(){return D.s[sec]}
function NW(){return box.clientWidth<560}
/* Pulse */
function pulse(){var s=S(),n=s.n.length;if(n<D.gate.pulse){return lock("pulse",D.gate.pulse,n)}
 var nw=NW(),from=rng>0?Math.max(0,n-rng):0,m=n-from,W=nw?380:760,H=nw?250:260,pl=nw?28:34,pr=nw?8:14,pt=18,pb=30,iw=W-pl-pr,ih=H-pt-pb,mx=1,i,o="";
 for(i=from;i<n;i++)mx=Math.max(mx,s.n[i]);
 for(i=0;i<=10;i+=2.5){var y=pt+ih-i/10*ih;o+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" stroke="'+C.rule+'" stroke-width=".6"/>'+T(pl-6,y+4,String(i),{a:"end",s:10})}
 var bw=Math.max(1.5,iw/m*.7);for(i=from;i<n;i++){var x=pl+(i-from+.5)/m*iw,bh=s.n[i]/mx*ih*.5;o+='<rect x="'+(x-bw/2).toFixed(1)+'" y="'+(pt+ih-bh).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" fill="'+C.rule+'" opacity=".75"/>'}
 var d="",pk=[];for(i=from;i<n;i++){if(s.r[i]<0){d+=" ";continue}var xx=pl+(i-from+.5)/m*iw,yy=pt+ih-s.r[i]/100*ih;d+=(d.slice(-1)===""||d.slice(-1)===" "?"M":"L")+xx.toFixed(1)+" "+yy.toFixed(1);pk.push([s.r[i],i,xx,yy])}
 o+='<path d="'+d.replace(/^\s+/,"")+'" fill="none" stroke="'+C.gold2+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
 pk.sort(function(a,b){return b[0]-a[0]});var shown=[];for(i=0;i<pk.length&&shown.length<(nw?2:3);i++){var ok=true;shown.forEach(function(q){if(Math.abs(q[1]-pk[i][1])<Math.max(4,m/8))ok=false});if(ok)shown.push(pk[i])}
 shown.forEach(function(q){o+='<circle cx="'+q[2].toFixed(1)+'" cy="'+q[3].toFixed(1)+'" r="4" fill="'+rc(q[0])+'" stroke="'+C.paper+'" stroke-width="1.5"/>'+T(Math.min(W-pr-4,Math.max(pl+4,q[2])),q[3]-9,dt(q[1])+" · "+(q[0]/10).toFixed(1),{a:"middle",c:C.ink,s:11,w:600})});
 var tk=Math.min(nw?3:5,m-1);for(i=0;i<=tk;i++){var j=from+Math.round(i*(m-1)/tk);o+=T(pl+(j-from+.5)/m*iw,H-9,dt(j),{a:i===0?"start":i===tk?"end":"middle",s:10.5})}
 o+='<line data-x="1" id="sg-pc" x1="0" x2="0" y1="'+pt+'" y2="'+(pt+ih)+'" stroke="'+C.ink+'" stroke-width=".8" opacity="0"/><rect data-x="1" id="sg-po" x="'+pl+'" y="'+pt+'" width="'+iw+'" height="'+ih+'" fill="transparent"/>';
 body("pulse").innerHTML=svg(W,H,o,L.pulse_t+": "+nm(sec));rd("pulse","");
 var ov=$("sg-po");function mv(e){var r=ov.getBoundingClientRect(),k=Math.max(0,Math.min(m-1,Math.floor((e.clientX-r.left)/r.width*m))),j=from+k,c=$("sg-pc"),xx=pl+(k+.5)/m*iw;c.setAttribute("x1",xx);c.setAttribute("x2",xx);c.setAttribute("opacity",".5");rd("pulse",dt(j,1)+" · "+s.n[j]+" "+L.ev+" · "+L.risk+" "+(s.r[j]<0?"-":(s.r[j]/10).toFixed(1)))}
 ov.addEventListener("pointermove",mv);ov.addEventListener("pointerleave",function(){$("sg-pc").setAttribute("opacity","0");rd("pulse","")})}
/* Gauge */
function gauge(){var g=D.g[sec];if(!g)return lock("gauge",D.gate.gauge,D.nd);var W=520,H=218,o="",pl=12,iw=W-2*pl;
 function meter(y,big,txt,p,col){var x=Math.max(8,iw*p/100);o+=T(pl,y,big,{c:C.ink,s:32,w:700,f:"Georgia,serif"})+T(pl,y+24,txt,{c:C.ink,s:14});o+='<rect x="'+pl+'" y="'+(y+36)+'" width="'+iw+'" height="12" rx="6" fill="'+C.chip+'"/><rect x="'+pl+'" y="'+(y+36)+'" width="'+x.toFixed(1)+'" height="12" rx="6" fill="'+col+'"/><circle cx="'+(pl+x).toFixed(1)+'" cy="'+(y+42)+'" r="9" fill="'+col+'" stroke="'+C.paper+'" stroke-width="2"/>'}
 meter(36,g.risk.toFixed(1),f(L.g_risk,{p:g.pr,n:g.days}),g.pr,rc(g.risk*10));meter(124,g.hs.toFixed(1)+"%",f(L.g_vol,{p:g.pv}),g.pv,C.gold);
 body("gauge").innerHTML=svg(W,H,o,L.gauge_t+": "+nm(sec)+" "+f(L.g_risk,{p:g.pr,n:g.days}));rd("gauge","")}
/* Rising and fading */
function move(){var mvd=D.mv&&D.mv[sec];if(!mvd)return lock("move",D.gate.move,D.nd);var rows=[];
 function blk(title,b,isc){if(!b||!(b.up.length||b.dn.length))return;rows.push({h:title});b.up.forEach(function(z){rows.push({z:z,c:isc,u:1})});b.dn.forEach(function(z){rows.push({z:z,c:isc,u:0})})}
 if(sec==="0"&&mvd.s)blk(L.m_sec,mvd.s,false);blk(L.m_cty,mvd.c,true);
 if(!rows.length){body("move").innerHTML='<p class="sg-d">'+esc(L.m_none)+'</p>';return rd("move","")}
 var W=520,rh=34,H=rows.length*rh+12,o="",y=6;
 rows.forEach(function(r){y+=rh;if(r.h){o+=T(8,y-10,r.h,{c:C.ink,w:700,s:14.5});return}
  var z=r.z,name=r.c?(P.cty[z.k]?P.cty[z.k].n:z.k):nm(String(z.k)),len=Math.min(Math.abs(z.z),6)/6*120,col=r.u?C.high:C.gold2;
  o+=T(8,y-11,(r.u?"▲ ":"▼ ")+name,{c:C.ink,s:14})+'<rect x="150" y="'+(y-22)+'" width="'+Math.max(4,len).toFixed(1)+'" height="14" rx="3" fill="'+col+'"/>'+T(156+Math.max(4,len),y-10.5,f(L.m_vs,{o:z.o,b:z.b}),{s:12.5})});
 body("move").innerHTML=svg(W,H,o,L.move_t+": "+nm(sec));rd("move","")}
/* Heat calendar */
function heat(){var h=D.hm&&D.hm[sec];if(!h||D.nd<D.gate.heat)return lock("heat",D.gate.heat,D.nd);var nw=NW(),nc=h.v[0].length,W=nw?380:760,lw=nw?86:130,cw=(W-lw-6)/nc,ch=nw?18:17,H=h.k.length*ch+(nw?96:62),o="",i,j;
 h.k.forEach(function(k,r){o+=T(lw-8,34+r*ch+12,P.cty[k]?P.cty[k].n:k,{a:"end",c:C.ink,s:11.5});for(j=0;j<nc;j++){var v=h.v[r][j];o+='<rect x="'+(lw+j*cw).toFixed(1)+'" y="'+(34+r*ch)+'" width="'+(cw-1).toFixed(1)+'" height="'+(ch-2)+'" rx="2" fill="'+(v<0?C.chip:rc(v))+'" opacity="'+(v<0?.55:(.35+Math.min(1,v/90)*.65).toFixed(2))+'"'+(v<0?'':' data-r="'+r+'" data-j="'+j+'"')+'/>'}});
 var tk=Math.min(nw?3:5,nc-1);for(i=0;i<=tk;i++){j=Math.round(i*(nc-1)/tk);o+=T(lw+(j+.5)*cw,22,dt(h.from+j),{a:i===0?"start":i===tk?"end":"middle",s:10.5})}
 var ly=H-(nw?44:16),lg=[[C.gold,"<4"],[C.elev,"4-6"],[C.high,"6-8"],[C.crit,"8+"]],ls=nw?58:70;lg.forEach(function(g,k){o+='<rect x="'+(lw+k*ls)+'" y="'+(ly-9)+'" width="12" height="12" rx="2" fill="'+g[0]+'"/>'+T(lw+k*ls+17,ly+1,g[1],{s:nw?12:11})});o+='<rect x="'+(nw?lw:lw+290)+'" y="'+((nw?ly+17:ly)-9)+'" width="12" height="12" rx="2" fill="'+C.chip+'"/>'+T((nw?lw:lw+290)+17,(nw?ly+17:ly)+1,L.h_none,{s:nw?12:11});
 body("heat").innerHTML=svg(W,H,o,L.heat_t+": "+nm(sec));rd("heat","");
 body("heat").querySelector("svg").addEventListener("pointermove",function(e){var t=e.target;if(t.getAttribute&&t.getAttribute("data-r")!==null){var r=+t.getAttribute("data-r"),j=+t.getAttribute("data-j"),k=h.k[r];rd("heat",(P.cty[k]?P.cty[k].n:k)+" · "+dt(h.from+j,1)+" · "+L.risk+" "+(h.v[r][j]/10).toFixed(1))}})}
/* Similar days + band */
function spark(a){var p=a.p,m0=Math.max(0,a.d-6),w=96,h=28,v=p.filter(function(x){return x!=null}),lo=Math.min.apply(null,v),hi=Math.max.apply(null,v),sp=Math.max(.5,hi-lo),d="";
 p.forEach(function(x,i){if(x==null)return;d+=(d?"L":"M")+(2+i/(p.length-1)*(w-4)).toFixed(1)+" "+(h-3-(x-lo)/sp*(h-6)).toFixed(1)});var mx=2+(a.d-m0)/(p.length-1)*(w-4);
 return '<svg class="sg-sp" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><line x1="'+mx.toFixed(1)+'" x2="'+mx.toFixed(1)+'" y1="0" y2="'+h+'" stroke="'+C.rule+'"/><path d="'+d+'" fill="none" stroke="'+C.gold2+'" stroke-width="1.8"/></svg>'}
function ch(v){if(v==null)return"-";var c=v>.4?"sg-up":v<-.4?"sg-dn":"";return '<span class="'+c+'">'+(v>0?"+":"")+v.toFixed(1)+'</span>'}
function sim(){var a=D.an&&D.an[sec];if(!a){lock("sim",D.gate.analog,D.nd);lock("band",D.gate.analog,D.nd);body("sim").innerHTML=body("sim").innerHTML.replace("sg-lock","sg-lock");return}
 var t='<table class="sg-tb"><thead><tr><th>'+esc(L.s_day)+'</th><th></th><th>'+esc(L.s_then)+'</th><th>'+esc(f(L.s_after,{k:3}))+'</th><th>'+esc(f(L.s_after,{k:7}))+'</th><th>'+esc(f(L.s_after,{k:14}))+'</th></tr></thead><tbody>';
 a.a.forEach(function(r){t+='<tr><td>'+esc(dt(r.d,1))+'</td><td>'+spark(r)+'</td><td>'+r.r.toFixed(1)+'</td><td>'+ch(r.ch["3"])+'</td><td>'+ch(r.ch["7"])+'</td><td>'+ch(r.ch["14"])+'</td></tr>'});
 body("sim").innerHTML=t+'</tbody></table>';rd("sim","");band(a)}
function band(a){var nw=NW(),s=S(),n=s.n.length,W=nw?380:760,H=nw?260:270,pl=nw?28:34,pr=nw?8:14,pt=16,pb=30,iw=W-pl-pr,ih=H-pt-pb,past=nw?14:21,tot=past+14,b=a.band,o="",i;
 var vals=[];for(i=Math.max(0,n-past);i<n;i++)if(s.r[i]>=0)vals.push(s.r[i]/10);b.q25.concat(b.q75).forEach(function(x){vals.push(x)});
 var lo=Math.max(0,Math.floor(Math.min.apply(null,vals)-.5)),hi=Math.min(10,Math.ceil(Math.max.apply(null,vals)+.5));if(hi-lo<2)hi=Math.min(10,lo+2);
 function X(k){return pl+k/(tot-1)*iw}function Y(v){return pt+ih-(v-lo)/(hi-lo)*ih}
 for(i=lo;i<=hi;i++){o+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(i)+'" y2="'+Y(i)+'" stroke="'+C.rule+'" stroke-width=".6"/>'+T(pl-6,Y(i)+4,String(i),{a:"end",s:10})}
 var d="",k0=past-1;for(i=0;i<past;i++){var j=n-past+i;if(j<0||s.r[j]<0)continue;d+=(d?"L":"M")+X(i).toFixed(1)+" "+Y(s.r[j]/10).toFixed(1)}
 o+='<path d="'+d+'" fill="none" stroke="'+C.gold2+'" stroke-width="2.2" stroke-linejoin="round"/>';
 var up="",dn="";for(i=0;i<14;i++){up+=(i?"L":"M")+X(k0+1+i).toFixed(1)+" "+Y(b.q75[i]).toFixed(1);dn=("L"+X(k0+1+i).toFixed(1)+" "+Y(b.q25[i]).toFixed(1))+dn}
 o+='<path d="M'+X(k0).toFixed(1)+" "+Y(b.cur).toFixed(1)+up.replace(/^M/,"L")+dn+'Z" fill="'+C.gold+'" opacity=".25"/>';
 var md="M"+X(k0).toFixed(1)+" "+Y(b.cur).toFixed(1);for(i=0;i<14;i++)md+="L"+X(k0+1+i).toFixed(1)+" "+Y(b.q50[i]).toFixed(1);
 o+='<path d="'+md+'" fill="none" stroke="'+C.ink+'" stroke-width="1.6" stroke-dasharray="5 4"/><line x1="'+X(k0).toFixed(1)+'" x2="'+X(k0).toFixed(1)+'" y1="'+pt+'" y2="'+(pt+ih)+'" stroke="'+C.mut+'" stroke-dasharray="2 3"/>'
  +'<circle cx="'+X(k0).toFixed(1)+'" cy="'+Y(b.cur).toFixed(1)+'" r="4.5" fill="'+rc(b.cur*10)+'" stroke="'+C.paper+'" stroke-width="1.5"/>'+T(X(k0)-6,pt+11,L.band_now+" "+b.cur.toFixed(1),{a:"end",c:C.ink,w:600,s:11.5});
 o+=T(X(k0+14),Y(b.q75[13])-7,L.band_q+": "+b.q25[13].toFixed(1)+" - "+b.q75[13].toFixed(1),{a:"end",c:C.ink,s:11.5})+T(X(0),H-9,dt(n-past),{s:10.5})+T(X(k0),H-9,dt(n-1),{a:"middle",s:10.5})+T(X(k0+7),H-9,"+7",{a:"middle",s:10.5})+T(X(k0+14),H-9,"+14",{a:"end",s:10.5});
 var vd=D.bt&&D.bt[sec],good=vd&&vd.ok&&vd.skill_brier>0&&vd.skill_mae>0,note=vd&&vd.ok?'<p class="sg-vd'+(good?" ok":"")+'">'+esc(good?L.v_good:L.v_flat)+'</p>':"";
 body("band").innerHTML=svg(W,H,o,L.band_t+": "+nm(sec))+'<p class="sg-read" style="min-height:0">'+esc(f(L.band_n,{u:a.up,d:a.down,k:a.k}))+'</p>'+note;rd("band","")}
/* Lead-lag and quiet */
function lead(){var ll=(D.ll||[]).filter(function(z){return sec==="0"||String(z.a)===sec||String(z.b)===sec});if(D.nd<D.gate.lead)return lock("lead",D.gate.lead,D.nd);
 if(!ll.length){body("lead").innerHTML='<p class="sg-d">'+esc(L.lead_none)+'</p>';return}
 body("lead").innerHTML='<ul class="sg-ls">'+ll.slice(0,6).map(function(z){return '<li>'+esc(f(L.lead_it,{a:nm(String(z.a)),b:nm(String(z.b)),l:z.lag,r:z.r}))+'<span class="bar"><i style="width:'+Math.round(Math.min(1,Math.abs(z.r))*100)+'%"></i></span></li>'}).join("")+'</ul>'}
function quiet(){if(D.nd<D.gate.quiet)return lock("quiet",D.gate.quiet,D.nd);if(D.qg){body("quiet").innerHTML='<p class="sg-d">'+esc(L.q_gap)+'</p>';return}var q=D.qt||[];
 if(!q.length){body("quiet").innerHTML='<p class="sg-d">'+esc(L.quiet_none)+'</p>';return}
 body("quiet").innerHTML='<ul class="sg-ls">'+q.map(function(z){var c=P.cty[z.k]||{n:z.k,u:""},nme=esc(c.n);return '<li>'+(c.u?'<a href="'+esc(R+PF+c.u)+'">'+nme+'</a>':nme)+' - '+esc(f(L.quiet_it,{y:z.y,m:z.m}))+'</li>'}).join("")+'</ul>'}
/* Day replay */
var RP={i:-1,t:null};
function replay(){var ks=Object.keys(D.rp||{}).map(Number).sort(function(a,b){return a-b});if(!ks.length)return lock("replay",1,0);var lo=ks[0],hi=D.nd-1;if(RP.i<lo||RP.i>hi)RP.i=hi;
 body("replay").innerHTML='<div class="sg-pl"><button type="button" id="sg-pv" aria-label="'+esc(L.prev)+'">‹</button><input class="sg-sl" id="sg-sl" type="range" min="'+lo+'" max="'+hi+'" value="'+RP.i+'" aria-label="'+esc(L.rp_t)+'"><button type="button" id="sg-nx" aria-label="'+esc(L.next)+'">›</button><button type="button" id="sg-pp">'+esc(L.play)+'</button></div><div class="sg-rpd" id="sg-rd"></div><ul class="sg-ls" id="sg-rl"></ul>';
 function show(){var i=RP.i,s=S(),ev=(D.rp[String(i)]||[]).filter(function(x){return sec==="0"||String(x.c)===sec}).slice(0,5);$("sg-sl").value=i;
  $("sg-rd").textContent=dt(i,1)+" · "+f(L.rp_ev,{n:s.n[i],r:s.r[i]<0?"-":(s.r[i]/10).toFixed(1)});
  $("sg-rl").innerHTML=ev.length?ev.map(function(x){var lk=P.have.indexOf(x.id)>=0,t=esc(x.t);return '<li><span class="'+(x.r>=6?"sg-up":"")+'">'+x.r.toFixed(1)+'</span> · '+(lk?'<a href="'+esc(R+PF+"event/"+x.id+".html")+'" lang="en">'+t+'</a>':'<span lang="en">'+t+'</span>')+' <span class="sg-m">('+esc(nm(String(x.c)))+')</span></li>'}).join(""):'<li>'+esc(L.rp_none)+'</li>'}
 function stop(){if(RP.t){clearInterval(RP.t);RP.t=null}$("sg-pp").textContent=L.play}
 $("sg-sl").addEventListener("input",function(){stop();RP.i=+this.value;show()});$("sg-pv").addEventListener("click",function(){stop();RP.i=Math.max(lo,RP.i-1);show()});$("sg-nx").addEventListener("click",function(){stop();RP.i=Math.min(hi,RP.i+1);show()});
 $("sg-pp").addEventListener("click",function(){if(RP.t)return stop();if(RP.i>=hi)RP.i=lo;this.textContent=L.pause;RP.t=setInterval(function(){if(RP.i>=hi){stop();return}RP.i++;show()},850);show()});show();rd("replay","")}
/* Track record */
function track(){var b=D.bt&&D.bt[sec];if(!b||!b.ok)return lock("track",D.gate.track,b?b.n:0,"tr_none");var t='<div class="sg-tiles"><div class="sg-tile"><b>'+b.n+'</b><span>'+esc(f(L.tr_n,{n:b.n}))+'</span></div><div class="sg-tile"><b>'+b.brier.toFixed(2)+'</b><span>'+esc(f(L.tr_b,{a:b.brier.toFixed(3),b:b.brier_clim.toFixed(3)}))+'</span></div><div class="sg-tile"><b>'+b.mae.toFixed(2)+'</b><span>'+esc(f(L.tr_m,{a:b.mae.toFixed(2),b:b.mae_naive.toFixed(2)}))+'</span></div></div><ul class="sg-ls">';
 b.bins.forEach(function(x){if(x.n)t+='<li>'+esc(f(L.tr_c,{p:Math.round(x.p*100),o:Math.round(x.o*100),n:x.n}))+'</li>'});
 var good=b.skill_brier>0&&b.skill_mae>0;body("track").innerHTML=t+'</ul><p class="sg-vd'+(good?" ok":"")+'">'+esc(good?L.v_good:L.v_flat)+'</p>';rd("track","")}
/* Share as an image: the chart, its title, the section and the site, drawn on a canvas (never leaves the browser) */
function link(){var c=document.querySelector('link[rel="canonical"]'),u=(c&&c.href)||(location.origin+location.pathname);return u.split("#")[0]+"#s="+sec}
function share(card,btn){var sv=card.querySelector("svg.sg-svg");if(!sv)return;var w=+sv.getAttribute("data-w"),h=+sv.getAttribute("data-h"),cl=sv.cloneNode(true);[].forEach.call(cl.querySelectorAll("[data-x]"),function(n){n.parentNode.removeChild(n)});cl.setAttribute("xmlns",NS);cl.setAttribute("width",w);cl.setAttribute("height",h);
 var PW=1200,pad=48,sc=(PW-2*pad)/w,ph=Math.round(h*sc)+190,cv=document.createElement("canvas");cv.width=PW;cv.height=ph;var x=cv.getContext("2d"),img=new Image();
 img.onload=function(){x.fillStyle=C.paper;x.fillRect(0,0,PW,ph);x.fillStyle=C.gold;x.fillRect(0,0,PW,8);x.fillStyle=C.ink;x.font="700 38px Georgia,serif";x.fillText(card.getAttribute("data-t"),pad,78);x.fillStyle=C.mut;x.font="22px Helvetica Neue,Arial,sans-serif";x.fillText(nm(sec)+" · "+D.from+" - "+D.to,pad,114);
  x.drawImage(img,pad,136,w*sc,h*sc);x.fillStyle=C.ink;x.font="700 26px Georgia,serif";x.fillText(P.name,pad,ph-34);x.fillStyle=C.mut;x.font="20px Helvetica Neue,Arial,sans-serif";x.textAlign="right";x.fillText(location.host+location.pathname.replace(/index\.html$/,""),PW-pad,ph-34);
  cv.toBlob(function(bl){if(!bl)return;var fn="athena-signals-"+card.id.replace("sg-","")+"-"+sec+".png",id=card.id.replace("sg-",""),ttl=card.getAttribute("data-t"),u=link();
   function save(done){var a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.parentNode.removeChild(a)},500);done(L.saved)}
   var ex=[{l:L.save_i,fn:save}];
   try{if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write)ex.push({l:L.copy_i,fn:function(done){navigator.clipboard.write([new ClipboardItem({"image/png":bl})]).then(function(){done(L.copied_i)},function(){save(done)})}})}catch(e){}
   try{var file=new File([bl],fn,{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[file]}))ex.push({l:L.share_i,fn:function(){navigator.share({files:[file],title:ttl,text:ttl+" - "+u,url:u}).catch(function(){})}})}catch(e){}
   if(window.ATH_SH&&window.ATH_SH.open){window.ATH_SH.open(btn,{u:u,t:ttl,d:nm(sec)+" · "+D.from+" - "+D.to,extra:ex});return}
   save(function(){});try{navigator.clipboard.writeText(u).then(function(){rd(id,L.saved2)},function(){rd(id,L.saved)})}catch(e){rd(id,L.saved)}},"image/png")};
 img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(cl))}
function draw(){C=pal();$("sg-hist").textContent=f(L.hist,{n:D.nd,a:D.from,b:D.to});var ld=$("sg-lead"),g=D.g[sec];ld.textContent=g?f(L.g_risk,{p:g.pr,n:g.days})+" · "+nm(sec):f(L.building,{n:D.nd});
 [pulse,gauge,move,heat,sim,lead,quiet,replay,track].forEach(function(fn){try{fn()}catch(e){}})}
function hash(){var m=/[#&]s=(\d+)/.exec(location.hash);return m&&P.cats[m[1]]?m[1]:"0"}
fetch(R+"data/athena-signals.json",{credentials:"omit"}).then(function(r){return r.json()}).then(function(d){if(!d||!d.nd){$("sg-lead").textContent=f(L.building,{n:0});return}D=d;sec=hash();$("sg-sec").value=sec;draw();
 $("sg-sec").addEventListener("change",function(){sec=this.value;try{history.replaceState(null,"","#s="+sec)}catch(e){}draw()});
 [].forEach.call(box.querySelectorAll(".sg-rg button"),function(b){b.addEventListener("click",function(){rng=+b.getAttribute("data-r");[].forEach.call(box.querySelectorAll(".sg-rg button"),function(x){x.classList.toggle("on",x===b)});pulse()})});
 [].forEach.call(box.querySelectorAll("[data-sh]"),function(b){b.addEventListener("click",function(e){e.stopPropagation();share(b.closest(".sg-c"),b)})});
 var tm=null,wasN=NW();function again(){clearTimeout(tm);tm=setTimeout(function(){C=pal();[pulse,gauge,move,heat,sim].forEach(function(fn){try{fn()}catch(e){}})},120)}
 window.addEventListener("resize",function(){if(NW()!==wasN){wasN=NW();again()}});
 try{new MutationObserver(again).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","class"]});matchMedia("(prefers-color-scheme: dark)").addEventListener("change",again)}catch(e){}
}).catch(function(){$("sg-lead").textContent=f(L.building,{n:0})})})();
