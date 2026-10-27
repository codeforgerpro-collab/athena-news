(function(){var d=document.documentElement,m=null,ok={classic:1,night:1,aegean:1,future:1,neon:1,contrast:1};
try{m=localStorage.getItem("athena-site-mode");if(!m){var o=localStorage.getItem("athena-site-theme");m=o==="dark"?"night":o==="light"?"classic":null;}}catch(e){}
if(ok[m]){d.setAttribute("data-theme",m);d.setAttribute("data-tone",{night:1,future:1,neon:1}[m]?"dark":"light");}
var z=[0.85,0.92,1,1.1,1.2,1.35],i=2;try{var s=parseInt(localStorage.getItem("athena-text-size"),10);if(s>=0&&s<z.length)i=s;}catch(e){}
if(i!==2)d.style.zoom=z[i];d.setAttribute("data-tsz",i);})();
