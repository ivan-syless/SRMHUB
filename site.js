(function(){
const C=window.CONFIG,$=s=>document.querySelector(s),P=document.body.dataset.page,$$=s=>document.querySelectorAll(s);
const ls={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const param=k=>new URL(location.href).searchParams.get(k);
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n);
const EM={'Road Trip':'🚗','Beach Days':'🏖️','Mountains':'⛰️','Campus Fest':'🎓','Group Chaos':'🎉','Late Night':'🌙','Full Length':'🎬'};
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0),0)%360;

// age gate (joke)
if(P==='gate'){
  const nx=param('next')||'';
  $('#enter').onclick=()=>{sessionStorage.setItem('srm_age','1');location.href=/^[\w.-]+(\?.*)?$/.test(nx)?nx:'index.html'};
  $('#exit').onclick=()=>{location.href='https://www.google.com'};
  return;
}
if(P==='404'){
  const r=param('reason'),v=param('v'),el=$('#why');
  if(r==='manifest')el.textContent="The video list couldn't be loaded. Try again in a moment.";
  else if(v)el.textContent='No video found for "'+v+'". It may have been removed.';
  return;
}
if(!sessionStorage.getItem('srm_age')){location.replace('gate.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search));return}

// header + footer
$('#hdr').innerHTML='<header class="top"><div class="bar"><a class="logo" href="index.html">SRM<b>hub</b></a><form class="search" id="sf"><input id="q" placeholder="Search trips, people, places…" autocomplete="off"><button>Search</button></form></div><nav class="nav"><a href="index.html" class="'+(P==='home'?'on':'')+'">HOME</a><a href="index.html?sort=viewed">VIDEOS</a><a href="categories.html" class="'+(P==='cats'?'on':'')+'">CATEGORIES</a><a href="index.html?cat=Full%20Length">FULL LENGTH</a><a href="index.html?sort=rated">COMMUNITY</a></nav></header>';
$('#ftr').innerHTML='<div class="ftr"><p>SRMhub is a parody site made for fun by friends. Not affiliated with any real website. Travel vlogs and college memories only.</p></div>';
$('#sf').onsubmit=e=>{e.preventDefault();location.href='index.html?q='+encodeURIComponent($('#q').value)};

const thumb=v=>v.thumb?'<img src="'+esc(v.thumb)+'" alt="">':v.youtube?'<img src="https://i.ytimg.com/vi/'+encodeURIComponent(v.youtube)+'/hqdefault.jpg" alt="">':'<div class="ph" style="background:linear-gradient(135deg,hsl('+hue(v.id)+' 60% 25%),hsl('+((hue(v.id)+60)%360)+' 70% 12%))">'+(EM[v.category]||'🎞️')+'</div>';
const card=v=>'<a class="card"'+(v.youtube?' data-yt="'+esc(v.youtube)+'"':'')+' href="video.html?v='+encodeURIComponent(v.id)+'"><div class="th">'+thumb(v)+'<span class="dur">'+esc(v.duration)+'</span></div><div><div class="ct">'+esc(v.title)+'</div><div class="cu">@'+esc(v.uploader)+' <i class="vf">✔</i></div><div class="cs">👁 '+fmt(v.views)+' · '+esc(v.date)+'</div></div></a>';

// hover preview: cycle 3 YouTube frames
document.addEventListener('mouseover',e=>{const c=e.target.closest('.card[data-yt]');if(!c||c.contains(e.relatedTarget))return;const img=c.querySelector('.th img');if(!img)return;
  const f=[1,2,3].map(n=>'https://i.ytimg.com/vi/'+encodeURIComponent(c.dataset.yt)+'/hq'+n+'.jpg');f.forEach(u=>{new Image().src=u});
  c._o=c._o||img.src;let i=0;img.src=f[0];c._t=setInterval(()=>{i++;img.src=f[i%3]},700)});
document.addEventListener('mouseout',e=>{const c=e.target.closest('.card[data-yt]');if(!c||c.contains(e.relatedTarget))return;clearInterval(c._t);const img=c.querySelector('.th img');if(img&&c._o)img.src=c._o});
const load=()=>fetch(C.manifest).then(r=>{if(!r.ok)throw 0;return r.json()}).catch(()=>{location.replace('404.html?reason=manifest');return new Promise(()=>{})});
const follow=(b,u)=>{const set=()=>{const f=ls.get('srm_f',[]).includes(u);b.textContent=f?'✔ Following':'+ Follow';b.classList.toggle('on',f)};b.onclick=()=>{let f=ls.get('srm_f',[]);f=f.includes(u)?f.filter(x=>x!==u):f.concat(u);ls.set('srm_f',f);set()};set()};

if(P==='home')load().then(vs=>{
  let sort=param('sort')||'recent',cat=param('cat')||'All',q=(param('q')||'').toLowerCase();
  $('#q').value=param('q')||'';
  $('#chips').innerHTML=['All'].concat(C.categories).map(c=>'<button class="chip" data-c="'+esc(c)+'">'+esc(c)+'</button>').join('');
  $('#tabs').innerHTML=[['recent','Most Recent'],['viewed','Most Viewed'],['rated','Top Rated']].map(a=>'<button class="tab" data-s="'+a[0]+'">'+a[1]+'</button>').join('');
  const draw=()=>{
    const l=vs.filter(v=>(cat==='All'||v.category===cat)&&(!q||[v.title,v.uploader,v.description].concat(v.tags||[]).join(' ').toLowerCase().includes(q)));
    l.sort((a,b)=>sort==='viewed'?b.views-a.views:sort==='rated'?b.likes-a.likes:b.date.localeCompare(a.date));
    $('#grid').innerHTML=l.length?l.map(card).join(''):'<p class="empty">No trips found 🧳</p>';
    $$('.chip').forEach(b=>b.classList.toggle('on',b.dataset.c===cat));
    $$('.tab').forEach(b=>b.classList.toggle('on',b.dataset.s===sort));
  };
  $('#chips').onclick=e=>{if(e.target.dataset.c){cat=e.target.dataset.c;draw()}};
  $('#tabs').onclick=e=>{if(e.target.dataset.s){sort=e.target.dataset.s;draw()}};
  draw();
});

if(P==='cats')load().then(vs=>{
  $('#catgrid').innerHTML=C.categories.map(c=>'<a class="cat" href="index.html?cat='+encodeURIComponent(c)+'"><span>'+EM[c]+'</span><b>'+esc(c)+'</b><small>'+vs.filter(v=>v.category===c).length+' videos</small></a>').join('');
});

if(P==='video')load().then(vs=>{
  const id=param('v'),v=vs.find(x=>x.id===id);
  if(!v){location.replace('404.html?v='+encodeURIComponent(id||''));return}
  document.title=v.title+' - SRMhub';
  const src=v.src?(/^https?:/.test(v.src)?v.src:C.videoBase+v.src):'';
  $('#player').innerHTML=v.youtube?'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.youtube)+'?rel=0" title="'+esc(v.title)+'" allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>':src?'<video controls playsinline preload="metadata" src="'+esc(src)+'"'+(v.thumb?' poster="'+esc(v.thumb)+'"':'')+'></video>':'<div class="nosrc">🎬<p>Video file not added yet</p></div>';
  $('#vt').textContent=v.title;
  $('#meta').textContent=fmt(v.views)+' Views  |  '+v.date+'  |  ✔ Verified Traveler';
  $('#ul').href='channel.html?u='+encodeURIComponent(v.uploader);
  $('#av').textContent=v.uploader[0].toUpperCase();$('#un').textContent='@'+v.uploader;
  follow($('#fb'),v.uploader);
  const VK='srm_v_'+id,vote=()=>{const s=ls.get(VK,'');$('#lk').textContent='👍 '+fmt(v.likes+(s==='like'?1:0));$('#lk').classList.toggle('on',s==='like');$('#dk').classList.toggle('on',s==='dislike')};
  $('#lk').onclick=()=>{ls.set(VK,ls.get(VK,'')==='like'?'':'like');vote()};
  $('#dk').onclick=()=>{ls.set(VK,ls.get(VK,'')==='dislike'?'':'dislike');vote()};vote();
  $('#cat').innerHTML='<b style="color:var(--o)">'+esc(v.category)+'</b> — '+esc(v.description)+'<div>'+(v.tags||[]).map(t=>'<a class="tag" href="index.html?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>').join('')+'</div>';
  const K='srm_c_'+id,rc=()=>{const c=ls.get(K,[]);$('#cc').textContent=c.length;$('#cl').innerHTML=c.length?c.map(x=>'<div class="cm"><div class="av">'+esc(x.n[0].toUpperCase())+'</div><div><b>'+esc(x.n)+'</b> <small>'+esc(x.d)+'</small><p>'+esc(x.m)+'</p></div></div>').join(''):'<p class="empty">No comments yet. Be the first!</p>'};
  $('#cf').onsubmit=e=>{e.preventDefault();if($('#hp').value)return;const m=$('#cm').value.trim();if(!m)return;const c=ls.get(K,[]);c.unshift({n:$('#cn').value.trim()||'Anonymous Traveler',m:m,d:new Date().toLocaleDateString()});ls.set(K,c);$('#cm').value='';rc()};
  rc();
  $('#next').innerHTML=vs.filter(x=>x.id!==id).sort((a,b)=>(b.category===v.category)-(a.category===v.category)).slice(0,8).map(card).join('');
});

if(P==='channel')load().then(vs=>{
  const u=param('u'),l=vs.filter(v=>v.uploader===u);
  if(!l.length){location.replace('404.html?v='+encodeURIComponent(u||''));return}
  document.title='@'+u+' - SRMhub';
  $('#av').textContent=u[0].toUpperCase();$('#cn').textContent='@'+u;
  $('#st').textContent=l.length+' Videos  |  '+fmt(l.reduce((a,v)=>a+v.views,0))+' Views';
  follow($('#fb'),u);$('#grid').innerHTML=l.map(card).join('');
});
})();
