/* MediMate website — all hard-coded, fully interactive */
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

const DOCTORS = {
  "Dr. Weber Micheal": { spec:"Neurology", rating:"5.0 (1120)", exp:"12 years", fee:85, img:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop" },
  "Dr. Elizabeth Blackwell": { spec:"Neurology", rating:"4.8 (2100)", exp:"15 years", fee:65, img:"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop" },
  "Dr. Luca Thompson": { spec:"Cardiology", rating:"4.9 (1502)", exp:"12 years", fee:150, img:"https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&q=80&auto=format&fit=crop" },
  "Dr. Sofia Martinez": { spec:"Dermatology", rating:"4.7 (860)", exp:"10 years", fee:180, img:"https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80&auto=format&fit=crop" },
  "Dr. Michael Chen": { spec:"Paediatrics", rating:"4.9 (1104)", exp:"12 years", fee:120, img:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80&auto=format&fit=crop" },
  "Dr. Amara Osei": { spec:"Oncology", rating:"4.9 (730)", exp:"14 years", fee:190, img:"https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&q=80&auto=format&fit=crop" },
  "Dr. James Park": { spec:"Urology", rating:"4.6 (540)", exp:"9 years", fee:110, img:"https://randomuser.me/api/portraits/men/52.jpg" },
  "Dr. Sarah Johnson": { spec:"Radiology", rating:"4.8 (940)", exp:"15 years", fee:150, img:"https://randomuser.me/api/portraits/women/65.jpg" },
};
const REPLIES = [
  "Got it! I've noted that — your slot is safe with me ✅",
  "Thanks for sharing! For faster care, please bring your last lab report 📄",
  "Your video link is ready — tap 📹 Start video call anytime",
  "Perfect! I've updated your pre-visit tasks to 3/3 Done 🎉",
  "Noted! Dr. will confirm within ~10 mins. Anything else? 💜",
];

/* ---------- toast ---------- */
function toast(msg){
  const w = $('#toastWrap');
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  w.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.translate='0 10px'; setTimeout(()=>t.remove(),300); }, 2400);
  if(navigator.vibrate) try{navigator.vibrate(12)}catch(e){}
}

/* ---------- ripple + tap sound feel ---------- */
document.addEventListener('pointerdown', e=>{
  const el = e.target.closest('.tap');
  if(!el) return;
  if(navigator.vibrate) try{navigator.vibrate(8)}catch(err){}
  const r = el.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const s = document.createElement('span');
  s.className='ripple';
  s.style.width = s.style.height = d+'px';
  s.style.left = (e.clientX - r.left - d/2)+'px';
  s.style.top = (e.clientY - r.top - d/2)+'px';
  el.appendChild(s);
  setTimeout(()=>s.remove(), 650);
}, {passive:true});

/* ---------- cursor glow + magnetic ---------- */
const glow = $('#cursorGlow');
window.addEventListener('pointermove', e=>{
  if(glow){ glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px'; }
  // hero parallax
  const hp = $('#heroPhones');
  if(hp && window.innerWidth>900){
    const cx = (e.clientX/window.innerWidth - .5), cy=(e.clientY/window.innerHeight - .5);
    hp.style.transform = `translate(${cx*14}px, ${cy*10}px)`;
  }
}, {passive:true});

$$('.magnetic').forEach(btn=>{
  btn.addEventListener('pointermove', e=>{
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
    btn.style.transform = `translate(${x*.12}px, ${y*.15}px) scale(1.03)`;
  });
  btn.addEventListener('pointerleave', ()=> btn.style.transform='');
});

/* ---------- tilt ---------- */
function bindTilt(){
  if(matchMedia('(pointer:coarse)').matches) return;
  $$('[data-tilt]').forEach(card=>{
    if(card.dataset.tiltBound) return; card.dataset.tiltBound='1';
    card.addEventListener('pointermove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - .5;
      const py = (e.clientY - r.top)/r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${px*12}deg) rotateX(${-py*10}deg) translateZ(6px)`;
    });
    card.addEventListener('pointerleave', ()=> card.style.transform='');
  });
  $$('[data-tilt-sm]').forEach(card=>{
    if(card.dataset.tiltBound) return; card.dataset.tiltBound='1';
    card.addEventListener('pointermove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - .5;
      const py = (e.clientY - r.top)/r.height - .5;
      card.style.transform = `perspective(700px) rotateY(${px*7}deg) rotateX(${-py*6}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', ()=> card.style.transform='');
  });
}
bindTilt();

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} }), {threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

/* ---------- nav ---------- */
const navLinks = $('#navLinks'), hamburger = $('#hamburger');
hamburger?.addEventListener('click', ()=> navLinks.classList.toggle('open'));
$$('#navLinks a, [data-goto]').forEach(a=>a.addEventListener('click', e=>{
  const id = a.dataset.goto || a.getAttribute('href')?.slice(1);
  if(!id) return;
  e.preventDefault();
  navLinks.classList.remove('open');
  document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
  $$('#navLinks a').forEach(x=>x.classList.toggle('active', x.dataset.nav===id));
  $$('.mobile-bar button').forEach(x=>x.classList.toggle('active', x.dataset.goto===id));
  toast('→ '+id.replace('-',' '));
}));
$('#searchToggleBtn')?.addEventListener('click', ()=>{ $('#navSearch').classList.toggle('open'); $('#globalSearch')?.focus(); });
$('#clearSearch')?.addEventListener('click', ()=>{ $('#globalSearch').value=''; applyFilters(); });
$('#notifBtn')?.addEventListener('click', ()=> toast('🔔 3 updates: lab ready, slot confirmed, chat from Dr. Weber'));
$('#demoCallBtn')?.addEventListener('click', ()=> openVideo('Dr. Elizabeth Blackwell'));
$('#promoVideoBtn')?.addEventListener('click', ()=> openVideo('Dr. Elizabeth Blackwell'));

/* ---------- promo carousel ---------- */
(() => {
  const track = $('.promo-track'); if(!track) return;
  const dots = $$('.promo-carousel .dots span');
  let i = 0;
  setInterval(()=>{
    i = (i+1)%3;
    track.style.transform = `translateX(-${i*100}%)`;
    dots.forEach((d,k)=>d.classList.toggle('on', k===i));
  }, 3800);
})();

/* ---------- filtering (specialty + search) ---------- */
let activeSpec = 'all';
$$('#specialtyPills .pill').forEach(p=>p.addEventListener('click', ()=>{
  $$('#specialtyPills .pill').forEach(x=>x.classList.remove('active'));
  p.classList.add('active'); activeSpec = p.dataset.spec;
  applyFilters();
  toast(activeSpec==='all' ? 'Showing all doctors' : 'Filtered: '+activeSpec);
}));
$$('.spec-row .spec').forEach(s=>s.addEventListener('click', ()=>{
  $$('.spec-row .spec').forEach(x=>x.classList.remove('active')); s.classList.add('active');
  toast('Specialty: '+s.textContent.trim());
}));
['globalSearch','doctorSearch'].forEach(id=>{
  document.getElementById(id)?.addEventListener('input', applyFilters);
});
$('#findBtn')?.addEventListener('click', ()=>{ applyFilters(); document.getElementById('doctors')?.scrollIntoView({behavior:'smooth'}); });
$('#resetDocs')?.addEventListener('click', ()=>{ activeSpec='all'; $('#doctorSearch').value=''; $('#globalSearch').value=''; $$('#specialtyPills .pill').forEach((x,k)=>x.classList.toggle('active',k===0)); applyFilters(); });
function applyFilters(){
  const q = (($('#doctorSearch')?.value||'') + ' ' + ($('#globalSearch')?.value||'')).toLowerCase();
  let n = 0;
  $$('#doctorGrid .doc-card').forEach(c=>{
    const name = (c.dataset.name||'').toLowerCase(), spec = (c.dataset.specCard||'').toLowerCase();
    const okQ = !q.trim() || name.includes(q.trim()) || spec.includes(q.trim());
    const okS = activeSpec==='all' || spec===activeSpec.toLowerCase();
    const show = okQ && okS;
    c.style.display = show ? '' : 'none'; if(show) n++;
  });
  $$('#recentVisits .visit-lg').forEach(c=>{
    const spec=(c.dataset.specCard||'').toLowerCase();
    c.style.display = (activeSpec==='all'||spec===activeSpec.toLowerCase()) ? '' : 'none';
  });
  $('#docCount').textContent = n;
  $('#noDocs').classList.toggle('hidden', n!==0);
  $('#noDocsQ').textContent = q.trim();
}

/* ---------- save hearts ---------- */
const saved = new Set(['Dr. Weber Micheal','Dr. Luca Thompson','Dr. Sofia Martinez']);
document.addEventListener('click', e=>{
  const h = e.target.closest('[data-save]');
  if(!h) return;
  const name = h.dataset.save;
  if(saved.has(name)){ saved.delete(name); h.classList.remove('saved'); toast('Removed '+name+' from Saved'); }
  else { saved.add(name); h.classList.add('saved'); toast('♥ Saved '+name); }
  syncSaved();
});
function syncSaved(){
  $$('[data-save]').forEach(b=>b.classList.toggle('saved', saved.has(b.dataset.save)));
  $('#savedCount').textContent = saved.size;
  $$('#savedList .saved-card').forEach(c=>{ c.style.display = saved.has(c.dataset.name) ? '' : 'none'; });
  const any = [...saved].length>0;
  $('#noSaved').classList.toggle('hidden', any);
}
syncSaved();

/* ---------- booking modal ---------- */
let bookingDoctor = 'Dr. Weber Micheal', bookingSlot='Today 2:00 PM', bookingType='Video via flex call';
const bModal = $('#bookingModal');
function openBooking(name){
  bookingDoctor = name || 'Dr. Weber Micheal';
  const d = DOCTORS[bookingDoctor] || {spec:'General', rating:'4.8', fee:85};
  $('#bookingTitle').textContent = 'Book '+bookingDoctor;
  $('#bookingSub').textContent = `⭐ ${d.rating} · $${d.fee}/session · ${bookingSlot} available`;
  bModal.classList.add('open'); bModal.setAttribute('aria-hidden','false');
}
function closeBooking(){ bModal.classList.remove('open'); bModal.setAttribute('aria-hidden','true'); }
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-book-doctor]');
  if(b) openBooking(b.dataset.bookDoctor);
  if(e.target.closest('[data-toast]')) toast(e.target.closest('[data-toast]').dataset.toast);
});
$('#closeBooking')?.addEventListener('click', closeBooking);
bModal?.addEventListener('click', e=>{ if(e.target===bModal) closeBooking(); });
$$('#slotGrid button').forEach(s=>s.addEventListener('click', ()=>{ $$('#slotGrid button').forEach(x=>x.classList.remove('active')); s.classList.add('active'); bookingSlot=s.textContent.trim(); }));
$$('.type-row button').forEach(t=>t.addEventListener('click', ()=>{ $$('.type-row button').forEach(x=>x.classList.remove('active')); t.classList.add('active'); bookingType=t.dataset.type; }));
$('#confirmBooking')?.addEventListener('click', ()=>{
  const pname = $('#patientName').value.trim() || 'Kevin Merico';
  closeBooking();
  toast(`✅ Booked! ${bookingDoctor} · ${bookingSlot} · ${bookingType}`);
  pushChat('out', `🎉 Booking confirmed for ${pname} with ${bookingDoctor} — ${bookingSlot} (${bookingType}). 15% discount applied!`);
  setTimeout(()=>pushChat('in', `Wonderful! I've received your booking for ${bookingSlot}. Please complete pre-visit tasks (2/3 done) ✅`), 1200);
  document.getElementById('chat')?.scrollIntoView({behavior:'smooth'});
});

/* ---------- chat ---------- */
const chatBody = $('#chatBody');
function pushChat(who, text){
  const d = document.createElement('div');
  d.className = 'msg '+who; d.innerHTML = text.replace(/</g,'&lt;') + ` <span class="time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} ${who==='out'?'✓✓':''}</span>`;
  chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
  if(who==='out'){
    setTimeout(()=>{ pushChat('in', REPLIES[Math.floor(Math.random()*REPLIES.length)]); }, 1100);
  }
}
$('#chatForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const v = $('#chatText').value.trim(); if(!v) return;
  $('#chatText').value=''; pushChat('out', v);
});
$$('[data-quick]').forEach(q=>q.addEventListener('click', ()=> pushChat('out', q.dataset.quick)));
document.addEventListener('click', e=>{
  const c = e.target.closest('[data-chat-doctor]');
  if(!c) return;
  const name = c.dataset.chatDoctor;
  const d = DOCTORS[name];
  if(d){ $('#chatName').textContent = name.replace('Dr. ','Dr. ').split(' ').slice(0,3).join(' '); $('#chatAvatar').src = d.img; }
  document.getElementById('chat')?.scrollIntoView({behavior:'smooth'});
  toast('💬 Chat opened with '+name);
  $$('.chat-person').forEach(p=>p.classList.toggle('active', p.dataset.chatDoctor===name));
});

/* ---------- profile ---------- */
document.addEventListener('click', e=>{
  const p = e.target.closest('[data-open-profile]');
  if(!p) return;
  const name = p.dataset.openProfile, d = DOCTORS[name];
  if(d){
    $('#profName').textContent = name;
    $('#profImg').src = d.img;
    document.getElementById('doctor-profile')?.scrollIntoView({behavior:'smooth'});
    toast('👤 '+name+' · '+d.spec+' · $'+d.fee);
  }
});
$$('.tabs button').forEach(t=>t.addEventListener('click', ()=>{
  $$('.tabs button').forEach(x=>x.classList.remove('active')); t.classList.add('active');
  ['info','avail','edu'].forEach(k=> $('#tab-'+k)?.classList.toggle('hidden', k!==t.dataset.tab));
}));

/* ---------- days ---------- */
$$('#dayStrip .day').forEach(d=>d.addEventListener('click', ()=>{
  $$('#dayStrip .day').forEach(x=>x.classList.remove('active')); d.classList.add('active');
  toast('📅 '+d.dataset.day+' — 3 visits scheduled');
}));

/* ---------- video modal ---------- */
const vModal = $('#videoModal');
let vSec = 0, vInt = null;
function openVideo(name){
  $('#videoName').textContent = name || 'Dr. Elizabeth Blackwell';
  const d = DOCTORS[name];
  if(d) $('#videoImg').src = d.img;
  vModal.classList.add('open');
  vSec = 0; clearInterval(vInt);
  vInt = setInterval(()=>{ vSec++; const m=String(Math.floor(vSec/60)).padStart(2,'0'), s=String(vSec%60).padStart(2,'0'); $('#videoTimer').textContent = m+':'+s; }, 1000);
  toast('📹 Connecting video… (demo)');
}
function closeVideo(){ vModal.classList.remove('open'); clearInterval(vInt); }
document.addEventListener('click', e=>{ if(e.target.closest('[data-video-doctor]')) openVideo(e.target.closest('[data-video-doctor]').dataset.videoDoctor); });
$('#closeVideo')?.addEventListener('click', closeVideo);
$('#endCallBtn')?.addEventListener('click', ()=>{ closeVideo(); toast('📞 Call ended · 12:20 duration · receipt sent'); });
vModal?.addEventListener('click', e=>{ if(e.target===vModal) closeVideo(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeBooking(); closeVideo(); } });

/* ---------- counters ---------- */
(() => {
  const els = $$('[data-count]');
  const o = new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting) return; o.unobserve(en.target);
    const end = +en.target.dataset.count, t0 = performance.now();
    (function tick(t){ const p = Math.min(1,(t-t0)/1400); en.target.textContent = Math.floor(end*(1-Math.pow(1-p,3))).toLocaleString()+'+'; if(p<1) requestAnimationFrame(tick); })(t0);
  }));
  els.forEach(e=>o.observe(e));
})();

/* ---------- call timer chip ---------- */
setInterval(()=>{ const el=$('#callTimer'); if(!el) return; let [m,s]=el.textContent.split(':').map(Number); s++; if(s>59){s=0;m++;} el.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }, 60000);

toast('💜 Welcome Kevin! Tap anything — everything works');

/* ---------- newsletter ---------- */
$('#newsForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const v = $('#newsEmail').value.trim();
  toast(v ? `💜 Health tips will be sent to ${v}` : 'Please enter your email first');
  if(v) $('#newsEmail').value = '';
});
