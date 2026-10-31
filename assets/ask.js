
(function(){
  // WEB-1.5 — Ask: the question is read in the browser and matched against data/ask.json; nothing is sent anywhere
  var box=document.getElementById("ask");if(!box||!window.fetch)return;
  var root=box.getAttribute("data-root"),pre=box.getAttribute("data-prefix"),lang=document.documentElement.lang||"en";
  var form=document.getElementById("ask-form"),inp=document.getElementById("ask-q"),out=document.getElementById("ask-out"),rd=document.getElementById("ask-read");
  var V=null,EV=null,X=null,shown=20,last=[];
  function esc(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function N(s){s=String(s||"").toLowerCase().normalize("NFD").replace(/\p{Mn}/gu,"").replace(/ς/g,"σ").replace(/ё/g,"е").replace(/ـ/g,"")
    .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[^\p{L}\p{N}\s+.<>=]/gu," ");return s.replace(/\s+/g," ").trim();}
  function rc(v){return v>=8?"crit":v>=6?"high":v>=4?"elev":"";}
  var RT=null;try{RT=new Intl.RelativeTimeFormat(lang,{numeric:"auto",style:"short"});}catch(e){}
  function ago(ts){var m=Math.round((Date.now()/1000-ts)/60),h=Math.round(m/60),d=Math.round(h/24);
    if(!RT)return m<60?Math.max(1,m)+" min":h<48?h+" h":d+" d";return m<60?RT.format(-Math.max(1,m),"minute"):h<48?RT.format(-h,"hour"):RT.format(-d,"day");}
  // one word of the question against one word of the vocabulary (inflected languages: the stem is enough)
  function wm(q,v){if(q===v)return true;if(V.lang==="ar"&&q.length>3&&/^[وبلف]/.test(q)&&q.slice(1)===v)return true;
    if(q===v+"s"||q===v+"es")return true;
    if(V.inflected&&v.length>=5){var s=v.slice(0,v.length-(v.length>=7?2:1));if(q.indexOf(s)===0&&q.length>=v.length-1&&q.length<=v.length+3)return true;
      if(V.lang==="ar"&&/^[وبلف]/.test(q)&&q.slice(1).indexOf(s)===0)return true;}
    return false;}
  function index(){var L=[];function add(map,kind){for(var k in map){if(!k)continue;L.push({w:k.split(" "),k:kind,v:map[k],n:k.length});}}
    add(V.time,"since");add(V.risk,"risk");add(V.sort,"sort");var act={};for(var k in V.topics){if(V.topic_active.indexOf(V.topics[k])>=0)act[k]=V.topics[k];}add(act,"topic");add(V.cats,"section");add(V.regions,"region");add(V.places,"country");
    L.sort(function(a,b){return b.w.length-a.w.length||b.n-a.n;});var by={};
    L.forEach(function(e){var f=e.w[0].slice(0,2);(by[f]=by[f]||[]).push(e);});return by;}
  function parse(q){var w=N(q).split(" ").filter(Boolean),used=[],r={country:[],region:[],topic:[],section:[],since:0,risk:0,sort:"",words:[]};
    for(var i=0;i<w.length;i++){if(used[i])continue;
      // "risk above 7", "κίνδυνος πάνω από 7", "riesgo 7+"
      if(V.risk_word.some(function(x){return w[i].indexOf(x)===0;})){for(var j=i+1;j<Math.min(w.length,i+5);j++){var m=w[j].match(/^(\d+(?:\.\d+)?)\+?$/);
        if(m){r.risk=Math.min(10,Math.max(r.risk,parseFloat(m[1])));for(var z=i;z<=j;z++)used[z]=1;break;}
        var mx=w[j].match(/^(\d+(?:\.\d+)?)-$/);if(mx){r.rmax=parseFloat(mx[1]);for(var z=i;z<=j;z++)used[z]=1;break;}}if(used[i])continue;}
      var keys=[w[i].slice(0,2)];if(V.lang==="ar"&&w[i].length>3)keys.push(w[i].slice(1,3));var best=null;
      keys.forEach(function(f){(X[f]||[]).forEach(function(e){if(best&&best.w.length>=e.w.length)return;if(i+e.w.length>w.length)return;
        for(var k=0;k<e.w.length;k++){if(used[i+k]||!wm(w[i+k],e.w[k]))return;}best=e;});});
      if(best){for(var k=0;k<best.w.length;k++)used[i+k]=1;
        if(best.k==="since")r.since=r.since?Math.min(r.since,best.v):best.v;else if(best.k==="risk")r.risk=Math.max(r.risk,best.v);
        else if(best.k==="sort")r.sort=best.v;
        else if(r[best.k].indexOf(best.v)<0)r[best.k].push(best.v);}}
    w.forEach(function(x,i){if(!used[i]&&V.stop.indexOf(x)<0&&(x.length>=3||/^\d+$/.test(x)))r.words.push(x);});
    if((r.risk||r.rmax)&&!r.sort&&!r.words.length&&!r.country.length&&!r.region.length&&!r.topic.length&&!r.section.length&&!r.since)r.sort="risk";
    return r;}
  function tw(t){return N(t).split(" ");}
  function hits(words,title){var tt=title.__w||(title.__w=tw(title.t));var n=0;
    words.forEach(function(q){if(tt.some(function(x){return x===q||(q.length>=4&&x.indexOf(q)===0)||(q.length>=5&&q.indexOf(x)===0&&x.length>=4);}))n++;});return n;}
  function run(q){var r=parse(q),now=Date.now()/1000,strong=r.country.length||r.region.length||r.topic.length||r.section.length;
    var regs={};r.region.forEach(function(x){(V.region_members[x]||[]).forEach(function(i){regs[i]=1;});});
    var res=[];EV.forEach(function(e){
      if(r.since&&now-e[7]>r.since*3600)return;if(r.risk&&e[3]<r.risk)return;if(r.rmax&&e[3]>=r.rmax)return;
      if(r.section.length&&!r.section.some(function(s){return String(s)===String(e[2]);}))return;
      if(r.topic.length&&!r.topic.some(function(s){return e[10].indexOf(s)>=0;}))return;
      var cm=r.country.filter(function(c){return e[9].indexOf(c)>=0;}).length;if(r.country.length&&!cm)return;
      if(r.region.length&&!e[9].some(function(c){return regs[c];}))return;
      var o={t:e[1]},h=r.words.length?hits(r.words,o):0;
      if(!strong&&r.words.length&&!h)return;if(!strong&&r.words.length>=3&&h<Math.ceil(r.words.length/2))return;
      res.push({e:e,s:h*3+cm*2+(cm===r.country.length&&cm>1?3:0)+e[4]*0.3+(now-e[7]<86400?1:0)});});
    var S=r.sort||"rel";
    res.sort(S==="latest"?function(a,b){return b.e[7]-a.e[7];}:S==="covered"?function(a,b){return b.e[6]-a.e[6]||b.e[5]-a.e[5];}
      :S==="risk"?function(a,b){return b.e[3]-a.e[3]||b.e[4]-a.e[4];}:function(a,b){return b.s-a.s||b.e[4]-a.e[4];});
    r.sortUsed=S;return {r:r,res:res};}
  // ASKH-36: questions about the site itself ("how do I follow Greece?") get a short answer and a link
  function hk(list,x){return list.some(function(k){return k===x||(k.length>=5&&x.length>=4&&(x.indexOf(k.slice(0,k.length-1))===0||k.indexOf(x)===0));});}
  function helpFor(q){if(!V.help)return [];var w=N(q).split(" ").filter(Boolean),intent=w.some(function(x){return V.help_intent.indexOf(x)>=0;}),out=[];
    V.help.forEach(function(h){var s=0,k=0;w.forEach(function(x){if(hk(h.s,x))s++;else if(hk(h.w,x))k++;});
      if(s||(intent&&k))out.push({h:h,sc:s*2+(intent?k+1:0)});});
    out.sort(function(a,b){return b.sc-a.sc;});return out.slice(0,2);}
  function helpHtml(list){if(!list.length)return "";
    return '<div class="ahelp"><h2 class="ah">'+esc(V.help_head)+'</h2>'+list.map(function(o){var h=o.h;
      return '<div class="ahc"><b>'+esc(h.q)+'</b><p>'+esc(h.a)+'</p>'+(h.href?'<a href="'+esc(root+pre+h.href)+'">'+esc(V.help_open)+' &rsaquo;</a>':'')+'</div>';}).join("")+'</div>';}
  function chip(l,v){return '<span class="achip"><b>'+esc(l)+'</b> '+esc(v)+'</span>';}
  function reading(r){var T=V.text,L=T.lbl,c=[];
    r.country.forEach(function(x){c.push(chip(L.country,V.cname[x]||x));});r.region.forEach(function(x){c.push(chip(L.region,V.rname[x]||x));});
    r.topic.forEach(function(x){c.push(chip(L.topic,V.tname[x]||x));});r.section.forEach(function(x){c.push(chip(L.section,V.catname[x]||x));});
    if(r.since)c.push(chip(L.since,T.hours[String(r.since)]||r.since+" h"));if(r.risk)c.push(chip(L.risk,T.risk_min.replace("{v}",r.risk)));if(r.rmax)c.push(chip(L.risk,(T.risk_max||"< {v}").replace("{v}",r.rmax)));
    if(r.words.length)c.push(chip(L.words,r.words.join(" ")));c.push(chip(L.sort,T.sort[r.sortUsed]));
    return '<h2 class="ah">'+esc(T.reading)+'</h2><div class="achips">'+c.join("")+'</div>';}
  function item(x){var e=x.e,T=V.text,L=T.lbl;
    return '<li><div class="kick"'+((V.catcol||{})[e[2]]?' style="--sc:'+V.catcol[e[2]]+'"><i style="background:'+V.catcol[e[2]]+'"></i>':'>')+esc(V.catname[e[2]]||"")+'</div><h3 class="hl-s" lang="en"><a href="'+esc(root+pre+"event/"+e[0]+".html")+'">'+esc(e[1])+'</a></h3>'
      +'<div class="meta c"><span>'+esc(ago(e[7]))+'</span><span>'+esc(L.outlets)+' '+e[5]+'</span><span>'+esc(L.countries)+' '+e[6]+'</span>'
      +'<span class="rk '+rc(e[3])+'">'+esc(L.risk)+' '+(+e[3]).toFixed(1)+'</span></div></li>';}
  var helped=false;
  function draw(){var T=V.text;
    if(!last.length){out.innerHTML=helped?"":'<div class="empty"><b>'+esc(T.none)+'</b><br>'+esc(T.none_tip)+'</div>';return;}
    out.innerHTML='<p class="small afound">'+esc(T.found.replace("{n}",last.length))+'</p><ol class="ares">'+last.slice(0,shown).map(item).join("")+'</ol>'
      +(last.length>shown?'<button type="button" class="abtn ghost" id="ask-more">'+esc(T.more)+'</button>':"");
    var mb=document.getElementById("ask-more");if(mb)mb.onclick=function(){shown+=20;draw();};}
  function ask(q,push){q=(q||"").trim();if(!q){rd.innerHTML="";out.innerHTML="";return;}
    var a=run(q),hl=helpFor(q);last=a.res;shown=20;helped=hl.length>0;
    rd.innerHTML=helpHtml(hl)+(helped&&!last.length?"":reading(a.r));draw();
    try{var u=new URL(location.href);u.searchParams.set("q",q);history[push?"pushState":"replaceState"](null,"",u);}catch(e){}}
  form.addEventListener("submit",function(ev){ev.preventDefault();ask(inp.value,true);});
  [].forEach.call(document.querySelectorAll("[data-q]"),function(a){a.addEventListener("click",function(ev){ev.preventDefault();inp.value=a.getAttribute("data-q");
    ask(inp.value,true);box.scrollIntoView({behavior:"smooth",block:"start"});});});
  window.addEventListener("popstate",function(){var q=new URLSearchParams(location.search).get("q")||"";inp.value=q;ask(q,false);});
  out.innerHTML='<p class="small">'+esc(box.getAttribute("data-loading"))+'</p>';
  Promise.all([fetch(root+"assets/ask-"+lang+".json").then(function(r){return r.json();}),fetch(root+"data/ask.json",{cache:"no-store"}).then(function(r){return r.json();})])
    .then(function(a){V=a[0];EV=a[1].events;X=index();out.innerHTML="";var q=new URLSearchParams(location.search).get("q")||"";if(q){inp.value=q;ask(q,false);}})
    .catch(function(){out.innerHTML='<div class="empty">'+esc(box.getAttribute("data-failed"))+'</div>';});
})();
