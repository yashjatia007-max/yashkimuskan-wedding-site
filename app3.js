(function(){
'use strict';
var D=document, root=D.documentElement;
function $(id){return D.getElementById(id);}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s));}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function smooth(t){return t*t*(3-2*t);}
var motionOK=!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var canHover=!!(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches);
var useTr='translate' in root.style;

// ======================= PHASE ENGINE (same dates as the main site) =======================
var T_START=new Date('2026-11-20T12:00:00+05:30').getTime();
var T_PHERA=new Date('2026-11-21T18:00:00+05:30').getTime();
var T_AFTER=new Date('2026-11-22T06:00:00+05:30').getTime();
var T_UPLOAD_CLOSE=new Date('2026-11-30T23:59:00+05:30').getTime();
var RSVP_ENDPOINT='https://script.google.com/macros/s/AKfycbyv0goxTGlCWfX36fzbVXiQ3OJa9IYulBMFdro_dhNbn2l87YY2HD1rsZBgyiWWyyGo/exec'; // photo uploader endpoint (unchanged)
var MEMORIES={playlistId:'',albumUrl:'',photos:[],uploads:true};
var MUSIC_SRC='';

var hero=$('hero'), skyEl=$('sky'), barFill=$('bar').firstElementChild, chap=$('chap'), chNum=$('chNum'), chName=$('chName');
var evEls=$$('.ev[data-t]').map(function(e){return {el:e,t:new Date(e.getAttribute('data-t')).getTime(),name:e.querySelector('.en').textContent,place:e.querySelector('.ep').textContent};});
var lastPhase=null;
function pad(n){return (n<10?'0':'')+n;}

function phase(){var n=Date.now();return n<T_START?'before':n<T_AFTER?'during':'after';}
function fmtTime(ts){return new Date(ts).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Asia/Kolkata'});}
function vis(el){return !!el&&el.offsetHeight>0;}

function applyPhase(){
  var ph=phase(); if(ph===lastPhase) return; lastPhase=ph;
  root.setAttribute('data-phase',ph);
  var grid=$('cdGrid'),grid2=$('cdGrid2'),label=$('cdLabel'),note=$('cdNote'),mem=$('memories'),now=$('now');
  if(ph==='before'){
    grid.style.display='grid';grid2.style.display='none';label.innerHTML='COMING SOON &nbsp;&middot;&nbsp; THE PREMIERE BEGINS IN';
  }else{
    grid.style.display='none';grid2.style.display='block';note.style.display='none';
    if(ph==='during'){label.textContent='NOW SHOWING';}
    else{label.textContent='MARRIED SINCE';}
    renderMemories(ph);
    if(ph==='after'&&mem&&now&&now.parentNode) now.parentNode.insertBefore(mem,now.nextSibling);
  }
  renumber(); measure(); frame(); revealNow();
}
function renumber(){
  var i=0;
  $$('[data-chapter]').forEach(function(s){
    if(!vis(s)) return;
    s._idx=i; var c=s.querySelector('.chn'); if(c) c.textContent='ACT '+pad(i+1); i++;
  });
}

// ======================= ACT NAVIGATOR (tap the bottom-left chip) =======================
// Some chapters hide/show depending on the wedding phase (see the html[data-phase] rules
// in the CSS), so the menu is rebuilt fresh every time it opens - never cached - and only
// ever lists chapters that are actually visible/reachable right now, numbered to match
// each section's own live eyebrow (renumber() already applied the same skip-aware count).
var chapMenu=$('chapMenu'), lastChapEl=null;
function buildChapMenu(){
  if(!chapMenu) return;
  chapMenu.innerHTML='';
  var i=0;
  $$('[data-chapter]').forEach(function(s){
    if(!vis(s)) return;
    i++;
    var li=D.createElement('li'); li.setAttribute('role','none');
    var btn=D.createElement('button'); btn.type='button'; btn.setAttribute('role','menuitem');
    btn.innerHTML='<b>'+pad(i)+'</b><span>'+s.getAttribute('data-chapter')+'</span>';
    btn.setAttribute('aria-current', s===lastChapEl?'true':'false');
    btn.addEventListener('click',function(){
      closeChapMenu();
      var y=s.getBoundingClientRect().top+window.pageYOffset;
      window.scrollTo({top:y,behavior:motionOK?'smooth':'auto'});
    });
    li.appendChild(btn); chapMenu.appendChild(li);
  });
}
function onChapDocClick(e){ if(!chap.contains(e.target)&&!(chapMenu&&chapMenu.contains(e.target))) closeChapMenu(); }
function onChapKey(e){ if(e.key==='Escape'){closeChapMenu();chap.focus();} }
function openChapMenu(){
  buildChapMenu();
  chapMenu.classList.add('open'); chapMenu.setAttribute('aria-hidden','false');
  chap.classList.add('open'); chap.setAttribute('aria-expanded','true');
  D.addEventListener('click',onChapDocClick,true);
  D.addEventListener('keydown',onChapKey,true);
}
function closeChapMenu(){
  if(!chapMenu) return;
  chapMenu.classList.remove('open'); chapMenu.setAttribute('aria-hidden','true');
  chap.classList.remove('open'); chap.setAttribute('aria-expanded','false');
  D.removeEventListener('click',onChapDocClick,true);
  D.removeEventListener('keydown',onChapKey,true);
}
if(chap){
  chap.addEventListener('click',function(){
    if(chapMenu&&chapMenu.classList.contains('open')) closeChapMenu(); else openChapMenu();
  });
  chap.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();chap.click();}
  });
}

function tick(){
  applyPhase();
  var n=Date.now();
  if(lastPhase==='before'){
    var d=Math.max(0,T_START-n);
    set('c-d',Math.floor(d/86400000));set('c-h',pad(Math.floor(d/3600000)%24));set('c-m',pad(Math.floor(d/60000)%60));set('c-s',pad(Math.floor(d/1000)%60));
    return;
  }
  var big=$('cdBig'),sub=$('cdSub');
  if(lastPhase==='during'){
    var next=null;for(var i=0;i<evEls.length;i++){if(evEls[i].t>n){next=evEls[i];break;}}
    if(next){big.textContent=next.name.replace(/\s*·\s*/,' · ');sub.innerHTML='Up next &middot; '+fmtTime(next.t)+'<br>'+next.place;}
    else{big.textContent='The last dance';sub.textContent='Thank you for being here.';}
    var nx=null;
    evEls.forEach(function(e){var past=e.t<=n;if(!past&&!nx){nx=e;}
      e.el.classList.toggle('past',past);e.el.classList.toggle('next',e===nx&&!past);});
  }else{
    var days=Math.floor((n-T_PHERA)/86400000);
    big.textContent='21 November 2026';
    sub.innerHTML=days<1?'Just married':days+(days===1?' day':' days')+' of marriage';
  }
}
function set(id,v){var e=$(id),s=String(v);if(e.textContent!==s){e.textContent=s;if(motionOK&&id!=='c-d'){e.classList.remove('tk');void e.offsetWidth;e.classList.add('tk');}}}

// ======================= MEMORIES (same behaviour as the main site) =======================
var gridBound=false;
function renderMemories(ph){
  var vid=$('memVideo'),grid=$('memGrid'),empty=$('memEmpty'),links=$('memLinks'),head=$('memHead'),upBox=$('upBox');
  var has=false;
  if(ph==='after'){head.innerHTML='Moments from the <em>film</em>';}
  if(ph==='during'){head.innerHTML='Share what you <em>capture</em>';empty.innerHTML='Our photographs will appear here<br>once the celebrations are over.';}
  if(MEMORIES.playlistId){
    vid.style.display='block';
    vid.innerHTML='<div style="position:relative;padding-bottom:56.25%;height:0;border:1px solid #F4C55A;border-radius:12px;overflow:hidden"><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list='+MEMORIES.playlistId+'" title="Wedding films" loading="lazy" allowfullscreen allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; fullscreen" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe></div>';
    has=true;
  }
  if(MEMORIES.photos&&MEMORIES.photos.length){
    grid.innerHTML=MEMORIES.photos.map(function(src,i){return '<img src="'+src+'" alt="Wedding photograph '+(i+1)+'" loading="lazy" data-full="'+src+'">';}).join('');
    has=true;
    if(!gridBound){gridBound=true;grid.addEventListener('click',function(ev){if(ev.target.tagName!=='IMG')return;$('lbImg').src=ev.target.getAttribute('data-full');$('lightbox').style.display='flex';});}
  }
  links.innerHTML=MEMORIES.albumUrl?'<a class="btn gold" href="'+MEMORIES.albumUrl+'" target="_blank" rel="noopener">SEE EVERY PHOTOGRAPH</a>':'';
  if(MEMORIES.albumUrl) has=true;
  empty.style.display=has?'none':'block';
  upBox.style.display=(MEMORIES.uploads&&Date.now()<T_UPLOAD_CLOSE)?'block':'none';
}
(function(){
  var lb=$('lightbox');
  lb.addEventListener('click',function(){lb.style.display='none';$('lbImg').src='';});
  D.addEventListener('keydown',function(e){if(e.key==='Escape')lb.style.display='none';});
})();
(function(){
  var pick=$('upPick'),input=$('upFiles'),who=$('upWho'),status=$('upStatus'),bar=$('upBar'),fill=$('upFill');
  function say(m,c){status.style.display='block';status.textContent=m;status.style.color=c||'';}
  function shrink(file){return new Promise(function(res,rej){
    var img=new Image(),url=URL.createObjectURL(file);
    img.onload=function(){var max=1600,w=img.width,h=img.height;if(w>max||h>max){var r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      var c=D.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',0.82));};
    img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('unreadable'));};img.src=url;});}
  pick.addEventListener('click',function(){if(!who.value.trim()){say('Please add your name first.','#FF9A8A');who.focus();return;}input.click();});
  input.addEventListener('change',function(){
    var files=Array.prototype.slice.call(input.files||[]);if(!files.length)return;
    pick.disabled=true;bar.style.display='block';var done=0,failed=0;
    function next(i){
      if(i>=files.length){pick.disabled=false;input.value='';fill.style.width='100%';
        say(failed?(done+' sent, '+failed+' could not be sent. Try those again?'):('Thank you \u2014 '+done+(done===1?' photograph':' photographs')+' received.'),failed?'#FF9A8A':'#F3D98B');
        setTimeout(function(){bar.style.display='none';fill.style.width='0';},1800);return;}
      say('Sending '+(i+1)+' of '+files.length+'\u2026');fill.style.width=Math.round(i/files.length*100)+'%';
      shrink(files[i]).then(function(u){return fetch(RSVP_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'photo',who:who.value.trim(),mime:'image/jpeg',file:u,website:''})});})
      .then(function(r){return r.json().catch(function(){return {ok:true};});})
      .then(function(r){if(r&&r.ok===false)throw new Error('rejected');done++;})
      .catch(function(){failed++;}).then(function(){next(i+1);});
    }
    next(0);
  });
})();

// ======================= CALENDAR / DIRECTIONS =======================
(function(){
  var loc='Express Inn, Pathardi Phata, Mumbai Agra Road, Ambad, Nashik 422010';
  var g='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent("Yash & Muskan's wedding")+'&dates=20261120T073000Z/20261121T173000Z&location='+encodeURIComponent(loc)+'&details='+encodeURIComponent('Two days of celebration, 20 & 21 November 2026. Contacts: Yogesh Jatia +91 93248 37375, Umesh Choudhari +91 70201 39769.');
  var c=$('bCal');if(c)c.href=g;
  var i=$('bIcs');
  if(i)i.addEventListener('click',function(e){
    e.preventDefault();
    var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Yash and Muskan//Wedding//EN'];
    [['20261120T073000Z','20261120T183000Z',"Yash & Muskan: Day 1 (Mayara, Sangeet)"],['20261121T023000Z','20261121T173000Z',"Yash & Muskan: Wedding day (Haldi to Reception)"]].forEach(function(v,k){
      L.push('BEGIN:VEVENT','UID:ym-wedding-'+k+'@yashkimuskan.com','DTSTAMP:20260920T000000Z','DTSTART:'+v[0],'DTEND:'+v[1],'SUMMARY:'+v[2].replace(/,/g,'\\,'),'LOCATION:'+loc.replace(/,/g,'\\,'),'END:VEVENT');});
    L.push('END:VCALENDAR');
    var blob=new Blob([L.join('\r\n')],{type:'text/calendar'}),a=D.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='yash-muskan-wedding.ics';D.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);D.body.removeChild(a);},500);
  });
})();

// ======================= MUSIC =======================
(function(){
  var b=$('mbtn'),a=$('bgm');if(!MUSIC_SRC)return;
  a.src=MUSIC_SRC;a.volume=.45;b.classList.add('on');
  b.addEventListener('click',function(){
    if(a.paused){a.play().then(function(){b.setAttribute('aria-pressed','true');b.style.background='#E2B857';b.style.color='#241040';}).catch(function(){});}
    else{a.pause();b.setAttribute('aria-pressed','false');b.style.background='';b.style.color='';}
  });
})();

// ======================= PARTICLES =======================
function Particles(cv,cfg){
  this.cv=cv;this.ctx=cv.getContext('2d');this.cfg=cfg;this.list=[];this.on=false;this.resize();
}
Particles.prototype.resize=function(){
  var dpr=Math.min(window.devicePixelRatio||1,2);this.w=this.cv.clientWidth||1;this.h=this.cv.clientHeight||1;
  this.cv.width=Math.round(this.w*dpr);this.cv.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);
  var area=this.w*this.h,e=Math.round(clamp(area/this.cfg.eDiv,8,this.cfg.eMax)),p=Math.round(clamp(area/this.cfg.pDiv,3,this.cfg.pMax));
  this.list=[];var i;for(i=0;i<e;i++)this.list.push(this.make('e',true));for(i=0;i<p;i++)this.list.push(this.make('p',true));
};
var ECOL=['255,226,154','255,190,90','255,243,219','255,143,184'],CCOL=['240,53,125','255,165,31','255,226,154','255,243,219','42,180,190','190,30,90'],PCOL=['255,165,31','255,190,60','240,120,30','255,214,110'];
Particles.prototype.make=function(k,init){
  var r=Math.random,w=this.w,h=this.h;
  if(k==='e')return {k:'e',x:r()*w,y:init?r()*h:h+10,vx:(r()-.5)*10,vy:-(10+r()*28),s:1+r()*2.4,a:.35+r()*.65,ph:r()*6.28,c:ECOL[(r()*4)|0],life:1};
  var big=this.cfg.big,cf=this.cfg.confetti&&r()<.8;
  var o={k:'p',x:r()*w,y:init?r()*h:-14,vx:(r()-.5)*22,vy:(big?34:22)+r()*30,s:cf?(4+r()*5):((big?5:3)+r()*(big?6:4)),a:.7+r()*.3,ph:r()*6.28,rot:r()*6.28,vr:(r()-.5)*4,c:'',life:1,cf:cf};
  var arr=cf?CCOL:PCOL;o.c=arr[(r()*arr.length)|0];return o;
};
Particles.prototype.burst=function(x,y){
  for(var i=0;i<34;i++){var a=Math.random()*6.283,sp=80+Math.random()*260,p=this.make('p',false);
    p.cf=true;p.c=CCOL[(Math.random()*6)|0];p.x=x;p.y=y;p.vx=Math.cos(a)*sp;p.vy=Math.sin(a)*sp-120;p.burst=true;p.life=1;p.s=4+Math.random()*5;this.list.push(p);}
};
Particles.prototype.step=function(dt,t){
  var c=this.ctx,w=this.w,h=this.h,L=this.list;c.clearRect(0,0,w,h);
  for(var i=L.length-1;i>=0;i--){
    var p=L[i];
    if(p.burst){p.vy+=320*dt;p.vx*=.982;p.life-=dt*.55;if(p.life<=0){L.splice(i,1);continue;}}
    p.x+=(p.vx+Math.sin(t*.0012+p.ph)*(p.k==='p'?16:8))*dt;p.y+=p.vy*dt;
    if(p.k==='p')p.rot+=(p.vr||1)*dt;
    if(!p.burst){
      if(p.k==='e'&&p.y<-12){L[i]=this.make('e',false);continue;}
      if(p.k==='p'&&p.y>h+16){L[i]=this.make('p',false);continue;}
      if(p.x<-20)p.x=w+20;else if(p.x>w+20)p.x=-20;
    }
    var al=p.a*(p.burst?clamp(p.life*1.4,0,1):1);
    if(p.k==='e'){
      var tw=.5+.5*Math.sin(t*.005+p.ph),r=p.s*(1+tw);
      c.globalCompositeOperation='lighter';
      c.fillStyle='rgba('+p.c+','+(al*(.3+.7*tw)).toFixed(3)+')';
      c.beginPath();c.moveTo(p.x,p.y-r*2.2);c.lineTo(p.x+r*.45,p.y-r*.45);c.lineTo(p.x+r*2.2,p.y);c.lineTo(p.x+r*.45,p.y+r*.45);c.lineTo(p.x,p.y+r*2.2);c.lineTo(p.x-r*.45,p.y+r*.45);c.lineTo(p.x-r*2.2,p.y);c.lineTo(p.x-r*.45,p.y-r*.45);c.closePath();c.fill();
      c.globalCompositeOperation='source-over';
    }else if(p.cf){
      c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(1,Math.max(.12,Math.abs(Math.sin(p.rot*1.7+p.ph))));
      c.fillStyle='rgba('+p.c+','+al.toFixed(3)+')';c.fillRect(-p.s,-p.s*.5,p.s*2,p.s);c.restore();
    }else{
      c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(1,.45+.55*Math.abs(Math.sin(p.rot*1.3+p.ph)));
      c.fillStyle='rgba('+p.c+','+al.toFixed(3)+')';c.beginPath();c.ellipse(0,0,p.s,p.s*.55,0,0,6.283);c.fill();
      c.fillStyle='rgba(120,40,10,'+(al*.25).toFixed(3)+')';c.fillRect(-p.s*.9,-.3,p.s*1.8,.6);c.restore();
    }
  }
};
var P1=null,P2=null,rafOn=false,lastT=0;
function loop(t){
  var dt=Math.min(.05,(t-lastT)/1000||.016);lastT=t;
  var any=false;
  if(P1&&P1.on){P1.step(dt,t);any=true;} if(P2&&P2.on){P2.step(dt,t);any=true;}
  if(heroActive){heroPointer();}
  if(any||heroActive){requestAnimationFrame(loop);}else{rafOn=false;}
}
function wake(){if(!rafOn){rafOn=true;lastT=performance.now();requestAnimationFrame(loop);}}

// ======================= HERO PARALLAX + POINTER =======================
var heroLayers=$$('#hero [data-speed]').map(function(e){return {el:e,sp:parseFloat(e.getAttribute('data-speed')),dp:parseFloat(e.getAttribute('data-depth')||0)};});
var hc=$('hcontent'),mx=0,my=0,tx=0,ty=0,curY=0,heroActive=true;
function setT(el,x,y){if(useTr)el.style.translate=x.toFixed(1)+'px '+y.toFixed(1)+'px';else el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';}
function applyHero(y){
  curY=y;
  for(var i=0;i<heroLayers.length;i++){var l=heroLayers[i];setT(l.el,mx*l.dp,y*l.sp+my*l.dp*.6);}
  var f=clamp(1-y/(vh*.65),0,1);
  hc.style.opacity=f.toFixed(3);hc.style.transform='translate3d(0,'+(y*.12).toFixed(1)+'px,0) scale('+(1-(1-f)*.05).toFixed(3)+')';
}
function heroPointer(){
  if(!canHover||!motionOK)return;
  var dx=tx-mx,dy=ty-my;if(Math.abs(dx)<.0008&&Math.abs(dy)<.0008)return;
  mx+=dx*.06;my+=dy*.06;applyHero(curY);
}
if(canHover&&motionOK){
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;wake();});
  hero.addEventListener('pointerleave',function(){tx=0;ty=0;});
}

// ======================= SCROLL ENGINE =======================
var vh=window.innerHeight,skyStops=[],pins=$$('.pin'),tls=$$('.tl'),pars=$$('[data-par]'),skyEls=$$('[data-sky]');
var ticking=false,lastChap=-1;
var route=$('route'),rtFg=$('rtFg'),rtDot=$('rtDot'),rtGlow=$('rtGlow'),rtL=0,rtFg2=$('rtFg2'),rtDot2=$('rtDot2'),rtGlow2=$('rtGlow2'),rtL2=0;
try{rtL=rtFg.getTotalLength();rtFg.style.strokeDasharray=rtL;rtFg.style.strokeDashoffset=motionOK?rtL:0;rtL2=rtFg2.getTotalLength();rtFg2.style.strokeDasharray=rtL2;rtFg2.style.strokeDashoffset=motionOK?rtL2:0;}catch(e){}
function rgb(h){h=h.trim().replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function mix(a,b,t){return 'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')';}
function measure(){
  vh=window.innerHeight;skyStops=[];var y=window.pageYOffset;
  skyEls.forEach(function(el){if(!vis(el))return;var r=el.getBoundingClientRect(),c=el.getAttribute('data-sky').split(',');skyStops.push({c:r.top+y+r.height/2,a:rgb(c[0]),b:rgb(c[1])});});
  skyStops.sort(function(a,b){return a.c-b.c;});
}
var vowsLit=-1,vowEls=$$('.vt'),frs=$$('.fr'),clap=$$('.vhead .clap')[0];
function vows(p){
  var lit=clamp(Math.floor((p-.04)/.86*4)+1,0,4);if(lit===vowsLit)return;vowsLit=lit;
  $('vows').style.setProperty('--lit',lit);
  frs.forEach(function(d,i){d.classList.toggle('on',i<lit);});
  vowEls.forEach(function(v,i){v.classList.toggle('act',i===lit);});
  if(clap&&lit>0){clap.classList.remove('snap');void clap.getBoundingClientRect();clap.classList.add('snap');}
}
var ldNum=$('ldNum'),ldLast='';
function leader(p){var n=p<.14?'3':p<.28?'2':p<.42?'1':'';if(n!==ldLast){ldLast=n;ldNum.textContent=n;}}
var reels=$$('.reel');
function frame(){
  ticking=false;
  var y=window.pageYOffset||root.scrollTop,H=root.scrollHeight-vh;
  barFill.style.transform='scaleX('+(H>0?clamp(y/H,0,1):0).toFixed(4)+')';
  // sky
  if(skyStops.length){
    var c=y+vh/2,s=skyStops,a,b,t;
    if(c<=s[0].c){a=b=s[0];t=0;}else if(c>=s[s.length-1].c){a=b=s[s.length-1];t=0;}
    else{for(var i=0;i<s.length-1;i++){if(c<s[i+1].c){a=s[i];b=s[i+1];t=smooth((c-a.c)/(b.c-a.c));break;}}}
    skyEl.style.background='linear-gradient(180deg,'+mix(a.a,b.a,t)+','+mix(a.b,b.b,t)+')';
    // stars drift
  }
  var st=$('stars').children;st[0].style.transform='translate3d(0,'+(-y*.03).toFixed(1)+'px,0)';st[1].style.transform='translate3d(0,'+(-y*.07).toFixed(1)+'px,0)';st[2].style.transform='translate3d(0,'+(-y*.12).toFixed(1)+'px,0)';
  if(motionOK){
    heroActive=y<vh*1.3;
    if(heroActive)applyHero(y);
    pins.forEach(function(el){
      if(!vis(el))return;var r=el.getBoundingClientRect();if(r.bottom<-120||r.top>vh+120)return;
      var p=clamp(-r.top/(r.height-vh),0,1);
      if(el._p===undefined||Math.abs(p-el._p)>.0003){el._p=p;el.style.setProperty('--p',p.toFixed(4));if(el.id==='vows')vows(p);if(el.id==='invite')leader(p);}
    });
    pars.forEach(function(el){
      var r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;
      var v=(r.top+r.height/2-vh/2)/vh,sp=parseFloat(el.getAttribute('data-par')),rot=parseFloat(el.getAttribute('data-rot')||0);
      if(useTr){el.style.translate='0 '+(v*sp*vh).toFixed(1)+'px';if(rot)el.style.rotate=(y*rot).toFixed(2)+'deg';}
    });
    if(route&&vis(route)){
      var rr=route.getBoundingClientRect();
      if(rr.bottom>0&&rr.top<vh&&rtL){var t2=clamp((vh*.9-rr.top)/(vh*.55+rr.height*.5),0,1);
        rtFg.style.strokeDashoffset=(rtL*(1-t2)).toFixed(1);
        var pt=rtFg.getPointAtLength(rtL*t2);rtDot.setAttribute('cx',pt.x);rtDot.setAttribute('cy',pt.y);rtGlow.setAttribute('cx',pt.x);rtGlow.setAttribute('cy',pt.y);
        rtDot.style.opacity=rtGlow.style.opacity=t2>0.01?1:0;
        rtFg2.style.strokeDashoffset=(rtL2*(1-t2)).toFixed(1);
        var p2=rtFg2.getPointAtLength(rtL2*t2);rtDot2.setAttribute('cx',p2.x);rtDot2.setAttribute('cy',p2.y);rtGlow2.setAttribute('cx',p2.x);rtGlow2.setAttribute('cy',p2.y);
        rtDot2.style.opacity=rtGlow2.style.opacity=t2>0.01?1:0;}
    }
  }else{ if(rtFg)rtFg.style.strokeDashoffset=0; if(rtFg2)rtFg2.style.strokeDashoffset=0; }
  reels.forEach(function(rl){if(!vis(rl))return;var rr=rl.getBoundingClientRect();if(rr.bottom<0||rr.top>vh)return;rl.style.setProperty('--rx',(-y*.6).toFixed(0)+'px');});
  tls.forEach(function(tl){if(!vis(tl))return;var r=tl.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;tl.style.setProperty('--lp',clamp((vh*.55-r.top)/r.height,0,1).toFixed(3));});
  // scene spy: one active event, nearest the middle of the screen
  var best=null,bd=1e9;evEls.forEach(function(e){var r=e.el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var d=Math.abs(r.top+r.height/2-vh*.52);if(d<bd){bd=d;best=e;}});
  evEls.forEach(function(e){e.el.classList.toggle('act',e===best&&bd<vh*.28);});
  // chapter chip
  var act=null;
  $$('[data-chapter]').forEach(function(s){if(!vis(s))return;var r=s.getBoundingClientRect();if(r.top<=vh*.5&&r.bottom>vh*.5)act=s;});
  if(act&&y>vh*.5){
    if(act._idx!==lastChap||chName.textContent!==act.getAttribute('data-chapter')){lastChap=act._idx;lastChapEl=act;chNum.textContent=pad((act._idx||0)+1);chName.textContent=act.getAttribute('data-chapter');if(chapMenu&&chapMenu.classList.contains('open'))buildChapMenu();}
    chap.classList.add('on');
  }else{ chap.classList.remove('on'); if(chapMenu&&chapMenu.classList.contains('open'))closeChapMenu(); }
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(frame);}}
window.addEventListener('scroll',req,{passive:true});
window.addEventListener('resize',function(){measure();if(P1)P1.resize();if(P2)P2.resize();req();});

// ======================= REVEALS + SCROLL-SPY =======================
var io=null;
function revealNow(){ $$('.rv').forEach(function(el){ if(!io||!motionOK){el.classList.add('in');} else if(!el.classList.contains('in')){io.observe(el);} }); }
if(motionOK&&'IntersectionObserver' in window){
  io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  var vis2=new IntersectionObserver(function(es){es.forEach(function(e){
    var P=e.target===hero?P1:P2;if(P){P.on=e.isIntersecting;if(e.isIntersecting)wake();}
  });},{threshold:0});
  var cv1=$('pc'),cv2=$('pc2');
  P1=new Particles(cv1,{eDiv:14000,eMax:42,pDiv:22000,pMax:34,big:false,confetti:true});
  P2=new Particles(cv2,{eDiv:26000,eMax:16,pDiv:9000,pMax:70,big:true,confetti:true});
  vis2.observe(hero);vis2.observe($('finale'));
  hero.addEventListener('pointerdown',function(e){var r=cv1.getBoundingClientRect();P1.burst(e.clientX-r.left,e.clientY-r.top);wake();});
  $('finale').addEventListener('pointerdown',function(e){var r=cv2.getBoundingClientRect();P2.burst(e.clientX-r.left,e.clientY-r.top);wake();});
}else{
}

// ======================= CLAPPERBOARD OPENER =======================
function afterHeroOpen(fn,delay){
  if(!motionOK||hero.classList.contains('hero-open')){setTimeout(fn,delay);return;}
  D.addEventListener('ym-hero-open',function(){setTimeout(fn,delay);},{once:true});
}
(function(){
  if(!motionOK)return; // reduced motion: CSS already forces the curtain open and hides the clapper
  var hop=$('hop');if(!hop)return;
  var already=false;try{already=sessionStorage.getItem('ym_hero')==='1';}catch(e){}
  function openHero(){
    if(hero.classList.contains('hero-open'))return;
    hero.classList.add('hero-open');
    try{sessionStorage.setItem('ym_hero','1');}catch(e){}
    D.dispatchEvent(new Event('ym-hero-open'));
  }
  if(already){openHero();return;}

  var arm=$('hoarm'),hint=$('hohint'),TH0=-.46,G=44;
  var th=TH0,om=0,state='prop',held=null,fired=false,restT=0,hintT=0,autoT=null;
  var AC=null,bus=null;
  function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;}catch(e){return null;}}
  function nbuf(a,d){var n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<n;i++)c[i]=Math.random()*2-1;return b;}
  function env(p,t0,at,dc,pk){p.setValueAtTime(.0001,t0);p.exponentialRampToValueAtTime(pk,t0+at);p.exponentialRampToValueAtTime(.0001,t0+at+dc);}
  function getBus(a){if(bus&&bus.ctx===a)return bus;var inp=a.createGain(),cv=a.createConvolver(),wet=a.createGain(),n=Math.floor(a.sampleRate*.5),buf=a.createBuffer(2,n,a.sampleRate);
    for(var c=0;c<2;c++){var d=buf.getChannelData(c);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.8);}
    cv.buffer=buf;wet.gain.value=.34;inp.connect(a.destination);inp.connect(cv);cv.connect(wet);wet.connect(a.destination);bus={ctx:a,in:inp};return bus;}
  function noiseTo(a,out,t0,dur,type,freq,q,at,dc,pk){var n=a.createBufferSource();n.buffer=nbuf(a,dur);var f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;var g=a.createGain();env(g.gain,t0,at,dc,pk);n.connect(f);f.connect(g);g.connect(out);n.start(t0);}
  function toneTo(a,out,t0,type,f0,f1,dur,at,dc,pk){var o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);env(g.gain,t0,at,dc,pk);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+dur+.1);}
  function clapSfx(s){var a=ac();if(!a)return;var t0=a.currentTime,B=getBus(a).in,v=.22+.78*clamp(s,0,1);
    noiseTo(a,B,t0,.09,'highpass',2400,.7,.001,.05,.95*v);
    noiseTo(a,B,t0,.05,'bandpass',4300,1.2,.001,.022,.7*v);
    noiseTo(a,B,t0+.004,.07,'bandpass',1700,.9,.001,.05,.45*v);
    toneTo(a,B,t0,'triangle',1300,520,.05,.001,.05,.6*v);
    toneTo(a,B,t0,'sine',270,105,.1,.002,.12,.95*v);
    if(s>.55)toneTo(a,B,t0+.006,'square',780,300,.03,.001,.03,.16*v);}
  function swishSfx(v){var a=ac();if(!a)return;var t0=a.currentTime;noiseTo(a,a.destination,t0,.22,'bandpass',900+v*300,.7,.06,.14,.05+.05*clamp(v/9,0,1));}
  function vib(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

  function reveal(){
    hop.classList.add('on');
    autoT=setTimeout(function(){if(!fired)impact(6.2);},9000);
  }
  function fireOpen(){
    fired=true;
    hero.classList.remove('hero-flashing');void hero.offsetWidth;hero.classList.add('hero-flashing');
    hero.classList.remove('hero-shake');void hero.offsetWidth;hero.classList.add('hero-shake');
    vib([20,20,60]);
    if(autoT){clearTimeout(autoT);autoT=null;}
    setTimeout(function(){hero.classList.remove('hero-flashing');},1000);
    setTimeout(function(){
      openHero();
      hop.classList.remove('on');
      try{if(typeof P1!=='undefined'&&P1){var r=hero.getBoundingClientRect();P1.burst(r.width*.5,r.height*.42);P1.burst(r.width*.32,r.height*.5);P1.burst(r.width*.68,r.height*.5);}}catch(e){}
    },320);
  }
  function impact(v){
    var s=clamp(v/9,0,1);clapSfx(s);
    if(v>=5&&!fired)fireOpen();
    else if(v<5&&!fired){vib(12);hint.textContent='SNAP IT HARDER';hintT=1.6;}
  }
  function fall(kick){state='fall';om=Math.max(om,0)+(kick||0);swishSfx(Math.max(om,3));}
  hop.addEventListener('pointerdown',function(e){if(fired)return;e.preventDefault();if(autoT){clearTimeout(autoT);autoT=null;}held={y0:e.clientY,th0:th,lt:e.timeStamp,moved:0};state='held';om=0;try{hop.setPointerCapture(e.pointerId);}catch(_){}});
  hop.addEventListener('pointermove',function(e){
    if(!held)return;var dy=e.clientY-held.y0;held.moved=Math.max(held.moved,Math.abs(dy));
    var raw=held.th0+dy*.0115,nt=clamp(raw,TH0-.4,0),dtm=Math.max(.004,(e.timeStamp-held.lt)/1000);held.lt=e.timeStamp;
    var vel=clamp((raw-th)/dtm,-14,14);om=.45*om+.55*vel;
    if(raw>=0&&th<0){var v=clamp(Math.max(om,0),0,14);th=0;impact(v);held.y0=e.clientY-(0-held.th0)/.0115;held.th0=0;om=0;}
    else th=nt;
  });
  function up(){if(!held)return;var h=held;held=null;if(fired)return;if(h.moved<6){om=0;fall(4.2);}else{fall(0);}}
  hop.addEventListener('pointerup',up);hop.addEventListener('pointercancel',up);
  hop.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&!fired){e.preventDefault();if(autoT){clearTimeout(autoT);autoT=null;}om=0;fall(4.2);}});

  var last=performance.now(),raf=null;
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    var n=4,h=dt/n;
    for(var i=0;i<n;i++){
      if(state==='prop'){th=TH0+.035*Math.sin(now/450);om=0;}
      else if(state==='lift'){th+=(TH0-th)*Math.min(1,h*9);if(Math.abs(th-TH0)<.02){state='prop';}}
      else if(state==='fall'){om+=G*h;om*=1-.9*h;th+=om*h;
        if(th>=0){var v=om;th=0;if(v>.7){impact(v);om=-v*.3;if(om>-.7)om=0;if(om===0){state='rest';restT=0;}}else{om=0;state='rest';restT=0;}}}
      else if(state==='rest'){th=0;}
    }
    if(state==='rest'&&!fired){restT+=dt;if(restT>.9)state='lift';}
    if(hintT>0){hintT-=dt;if(hintT<=0&&!fired)hint.textContent='TAP OR FLICK THE CLAPPER DOWN';}
    arm.style.transform='rotate('+th.toFixed(4)+'rad)';
    if(!fired)raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);
  setTimeout(reveal,450);
})();

// ======================= SCROLL CUE + NUDGE =======================
(function(){
  var cue=$('cue');if(!cue)return;
  var nudging=false,cancelled=false,done=false,hidden=false;
  function cancel(){cancelled=true;}
  afterHeroOpen(function(){
    ['touchstart','pointerdown','wheel','keydown','mousedown'].forEach(function(ev){window.addEventListener(ev,cancel,{passive:true});});
    /* Scroll no longer hides the cue — it stays visible on the hero screen the whole
       time the hero is in view, and scrolls away naturally with the hero block itself
       once the user scrolls past it. Scrolling still cancels the pending one-time nudge
       animation below, since the user is already moving on their own. */
    window.addEventListener('scroll',function(){if(!nudging&&(window.pageYOffset||root.scrollTop)>24){cancelled=true;}},{passive:true});
  },0);
  var seen=false;try{seen=sessionStorage.getItem('ym_nudge')==='1';}catch(e){}
  afterHeroOpen(function(){if(!hidden&&!cancelled&&(window.pageYOffset||0)<24)cue.classList.add('on');},motionOK?4400:600);
  if(!motionOK||seen)return;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function nudge(){
    if(cancelled||done||D.hidden||(window.pageYOffset||0)>5)return;
    done=true;nudging=true;try{sessionStorage.setItem('ym_nudge','1');}catch(e){}
    var AMP=Math.round(Math.min(84,Math.max(56,vh*.09))),T1=750,HOLD=250,T2=900,t0=performance.now(),last=0;
    function step(now){
      if(cancelled){nudging=false;return;}
      var t=now-t0,y;
      if(t<T1)y=AMP*ease(t/T1);
      else if(t<T1+HOLD)y=AMP;
      else if(t<T1+HOLD+T2)y=AMP*(1-ease((t-T1-HOLD)/T2));
      else{y=0;}
      var cur=window.pageYOffset||root.scrollTop;
      if(Math.abs(cur-last)>4){nudging=false;cancelled=true;return;}
      last=Math.round(y);window.scrollTo(0,last);
      if(t>=T1+HOLD+T2){nudging=false;return;}
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  afterHeroOpen(nudge,6600);
})();

// ======================= GO =======================
tick();setInterval(tick,1000);
if(!motionOK){root.style.setProperty('--lit',4);}
measure();frame();revealNow();
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){measure();req();});
window.addEventListener('load',function(){measure();req();setTimeout(function(){measure();req();},1200);});
})();
