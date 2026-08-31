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

/* 4. Creative video — click to play with sound, one at a time.
      Custom control bar: Chrome's native panel is drawn inside the video
      element, so its scrubber drags arrived here as clicks on VIDEO (which
      stopped and rewound playback) and a live strip of video stayed visible
      underneath it. Owning the bar removes both problems. */
(function(){
  const cards = document.querySelectorAll('.cv-card');

  const fmt = t => {
    if(!isFinite(t)) return '0:00';
    const m = Math.floor(t/60), s = Math.floor(t%60);
    return m + ':' + String(s).padStart(2,'0');
  };

  function stopAllVideos(except){
    cards.forEach(c => {
      const v = c.querySelector('video');
      if(!v || v === except) return;
      v.pause();
      v.currentTime = 0;
      v.muted = true;
      c.classList.remove('playing');
    });
  }

  cards.forEach(card => {
    const video = card.querySelector('video');
    const media = card.querySelector('.cv-media');
    if(!video || !media) return;

    video.removeAttribute('controls');

    /* --- control bar ------------------------------------------------------ */
    const bar = document.createElement('div');
    bar.className = 'vctl';
    bar.innerHTML =
      '<button class="vbtn vplay" type="button" aria-label="Pause"></button>' +
      '<div class="vtrack" role="slider" tabindex="0" aria-label="Seek"' +
      ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="vbuf"></div><div class="vfill"></div><div class="vknob"></div></div>' +
      '<span class="vtime">0:00</span>' +
      '<button class="vbtn vmute" type="button" aria-label="Mute"></button>';
    media.appendChild(bar);

    const btnPlay = bar.querySelector('.vplay');
    const btnMute = bar.querySelector('.vmute');
    const track   = bar.querySelector('.vtrack');
    const fill    = bar.querySelector('.vfill');
    const knob    = bar.querySelector('.vknob');
    const time    = bar.querySelector('.vtime');

    const paint = () => {
      const d = video.duration;
      const p = (isFinite(d) && d > 0) ? (video.currentTime / d) * 100 : 0;
      fill.style.width = p + '%';
      knob.style.left  = p + '%';
      track.setAttribute('aria-valuenow', Math.round(p));
      time.textContent = fmt(video.currentTime) + ' / ' + fmt(d);
      btnPlay.classList.toggle('is-paused', video.paused);
      btnPlay.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
      btnMute.classList.toggle('is-muted', video.muted);
      btnMute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    };

    video.addEventListener('timeupdate', paint);
    video.addEventListener('loadedmetadata', paint);
    video.addEventListener('play', paint);
    video.addEventListener('pause', paint);
    video.addEventListener('volumechange', paint);

    /* --- scrubbing -------------------------------------------------------- */
    const seekTo = clientX => {
      const r = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if(isFinite(video.duration)) video.currentTime = ratio * video.duration;
      paint();
    };
    let scrubbing = false;
    track.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      scrubbing = true;
      try{ track.setPointerCapture(e.pointerId); }catch(_){}
      seekTo(e.clientX);
    });
    track.addEventListener('pointermove', e => { if(scrubbing) seekTo(e.clientX); });
    const endScrub = e => {
      if(!scrubbing) return;
      scrubbing = false;
      try{ track.releasePointerCapture(e.pointerId); }catch(_){}
    };
    track.addEventListener('pointerup', endScrub);
    track.addEventListener('pointercancel', endScrub);
    track.addEventListener('keydown', e => {
      if(!isFinite(video.duration)) return;
      const step = e.shiftKey ? 10 : 5;
      if(e.key === 'ArrowRight'){ video.currentTime = Math.min(video.duration, video.currentTime + step); e.preventDefault(); }
      if(e.key === 'ArrowLeft'){ video.currentTime = Math.max(0, video.currentTime - step); e.preventDefault(); }
    });

    /* the bar is ours: nothing inside it may reach the card handler */
    bar.addEventListener('click', e => e.stopPropagation());
    bar.addEventListener('pointerdown', e => e.stopPropagation());

    btnPlay.addEventListener('click', () => { video.paused ? video.play() : video.pause(); });
    btnMute.addEventListener('click', () => { video.muted = !video.muted; paint(); });

    /* --- start / stop ----------------------------------------------------- */
    function start(){
      stopAllVideos(video);
      video.muted = false;
      video.currentTime = 0;
      const p = video.play();
      if(p && p.then) p.then(() => {
        card.classList.add('playing');
        if(window.matchMedia('(max-width: 900px)').matches){
          card.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
        }
      }).catch(() => {
        video.muted = true;
        video.play().then(() => card.classList.add('playing')).catch(()=>{});
      });
    }
    function stop(){
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      card.classList.remove('playing');
      paint();
    }

    card.addEventListener('click', () => {
      card.classList.contains('playing') ? stop() : start();
    });

    video.addEventListener('ended', stop);
    paint();
  });
})();
