const els=document.querySelectorAll('.r');
const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');obs.unobserve(x.target)}})},{threshold:.08});
els.forEach(el=>obs.observe(el));
setTimeout(()=>{document.querySelectorAll('#hero .r').forEach(el=>el.classList.add('on'))},80);
function tc(h){const c=h.closest('.cc'),o=c.classList.contains('open');document.querySelectorAll('.cc.open').forEach(x=>x.classList.remove('open'));if(!o)c.classList.add('open')}
function tf(q){q.parentElement.classList.toggle('open')}
document.getElementById('yr').textContent=new Date().getFullYear();

/* ═══ ANIMATIONS ═══ */
const hasHover=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* 1. Hero spotlight — follows cursor */
(function(){
  const hero=document.getElementById('hero');
  if(!hero||!hasHover)return;
  const sp=document.createElement('div');
  sp.className='spotlight';
  hero.appendChild(sp);
  let raf=null;
  hero.addEventListener('mousemove',e=>{
    if(raf)cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const r=hero.getBoundingClientRect();
      sp.style.setProperty('--mx',(e.clientX-r.left)+'px');
      sp.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });
  hero.addEventListener('mouseenter',()=>sp.classList.add('active'));
  hero.addEventListener('mouseleave',()=>sp.classList.remove('active'));
})();

/* 2. Animated counters — parse number, preserve prefix/suffix */
function animateCounter(el){
  if(el.dataset.animated)return;
  el.dataset.animated='1';
  const original=el.textContent.trim();
  const m=original.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
  if(!m)return;
  const prefix=m[1],numStr=m[2],suffix=m[3];
  const target=parseFloat(numStr.replace(/,/g,''));
  if(!isFinite(target)||target===0)return;
  const hasComma=numStr.includes(',');
  const duration=1400;
  const start=performance.now();
  function frame(now){
    const elapsed=now-start;
    const p=Math.min(elapsed/duration,1);
    const eased=1-Math.pow(1-p,3); /* ease-out cubic */
    const cur=Math.floor(target*eased);
    const display=hasComma?cur.toLocaleString('en-US'):cur.toString();
    el.textContent=prefix+display+suffix;
    if(p<1)requestAnimationFrame(frame);
    else el.textContent=original; /* exact final value */
  }
  requestAnimationFrame(frame);
}

/* Hero counters — animate after page settles */
setTimeout(()=>{
  document.querySelectorAll('#hero .hsv').forEach(animateCounter);
},700);

/* Case KPI counters — animate when card becomes visible */
const counterObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.ckv').forEach(animateCounter);
      counterObs.unobserve(e.target);
    }
  });
},{threshold:0.25});
document.querySelectorAll('.cc').forEach(c=>counterObs.observe(c));

/* 3. Magnetic effect on primary gold CTAs */
(function(){
  if(!hasHover)return;
  /* Apply only to prominent gold buttons in hero, cases-cta, creatives-cta, and main cta section */
  const ctas=document.querySelectorAll('#hero .bg, .ccta .bg, .cv-cta .bg, #cta .bg');
  ctas.forEach(btn=>{
    btn.style.transition='transform .25s cubic-bezier(0.2,0.8,0.2,1), background .2s, box-shadow .2s';
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const cx=r.left+r.width/2;
      const cy=r.top+r.height/2;
      const dx=(e.clientX-cx)*0.25;
      const dy=(e.clientY-cy)*0.35;
      btn.style.transform=`translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='';
    });
  });
})();

/* 3.5. Mobile menu — burger toggle, Esc close, scroll lock */
(function(){
  const burger = document.querySelector('.burger');
  const mmenu = document.getElementById('mmenu');
  if(!burger || !mmenu) return;

  const links = mmenu.querySelectorAll('a');

  function openMenu(){
    burger.classList.add('active');
    burger.setAttribute('aria-expanded','true');
    mmenu.classList.add('open');
    mmenu.setAttribute('aria-hidden','false');
    document.body.classList.add('menu-open');
  }
  function closeMenu(){
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded','false');
    mmenu.classList.remove('open');
    mmenu.setAttribute('aria-hidden','true');
    document.body.classList.remove('menu-open');
  }
  function toggleMenu(){
    if(mmenu.classList.contains('open')) closeMenu();
    else openMenu();
  }

  burger.addEventListener('click', toggleMenu);

  /* Close on link tap (smooth scroll handled by browser via scroll-behavior) */
  links.forEach(a => a.addEventListener('click', () => {
    /* Small delay so the menu close animation feels natural before scroll starts */
    setTimeout(closeMenu, 50);
  }));

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && mmenu.classList.contains('open')) closeMenu();
  });

  /* Close if window resized to desktop */
  window.addEventListener('resize', () => {
    if(window.innerWidth > 900 && mmenu.classList.contains('open')) closeMenu();
  });
})();

/* 4. Creative video — click to play with sound. One video at a time. */
(function(){
  const cards = document.querySelectorAll('.cv-card');

  function stopAllVideos(except){
    cards.forEach(c => {
      const v = c.querySelector('video');
      if(!v || v === except) return;
      v.pause();
      v.currentTime = 0;
      v.muted = true;
      v.removeAttribute('controls');
      c.classList.remove('playing');
    });
  }

  cards.forEach(card => {
    const video = card.querySelector('video');
    if(!video) return;

    /* Once the native controls are up they own the whole video surface.
       The scrubber lives in the video shadow DOM, so a drag on it arrives
       here as a plain click on VIDEO — toggling on that stopped playback
       and rewound to 0, which is why seeking snapped back. */
    video.addEventListener('click', e => {
      e.stopPropagation();
      if(video.hasAttribute('controls')) return;
      togglePlay();
    });

    card.addEventListener('click', e => {
      if(e.target.tagName === 'VIDEO') return; /* handled above */
      togglePlay();
    });

    function togglePlay(){
      if(video.paused){
        stopAllVideos(video);
        video.muted = false;
        video.currentTime = 0;
        video.setAttribute('controls', '');
        const p = video.play();
        if(p && p.then) p.then(() => {
          card.classList.add('playing');
          /* On mobile carousel: scroll card into view (center it) */
          if(window.matchMedia('(max-width: 900px)').matches){
            card.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
          }
        }).catch(err => {
          /* If unmute autoplay fails, fallback to muted */
          video.muted = true;
          video.play().then(() => card.classList.add('playing')).catch(()=>{});
        });
      } else {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('controls');
        card.classList.remove('playing');
      }
    }

    /* When video ends naturally, reset to preview state */
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.muted = true;
      video.removeAttribute('controls');
      card.classList.remove('playing');
    });
  });
})();
