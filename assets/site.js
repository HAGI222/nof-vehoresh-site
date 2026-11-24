(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // header state
  const header = $('.top');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, {passive: true}); onScroll();

  // mobile menu + services dropdown
  const burger = $('.burger'), nav = $('.nav');
  if (burger && nav) burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
    document.body.style.overflow = o ? 'hidden' : ''; header.classList.toggle('solid', o);
  });
  $$('.dd > button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.parentNode.classList.toggle('open'))));

  // two-level menu: hovering a main item shows its submenu; leaving the header returns to the current section
  const subs = $$('.nav2 .sub'), mains = $$('.nav2 .main li');
  if (subs.length) {
    const curLi = $('.nav2 .main li.on');
    const showSub = k => subs.forEach(u => u.hidden = u.dataset.sec !== k);
    mains.forEach(li => {
      const has = () => !!subs.find(u => u.dataset.sec === li.dataset.sec);
      li.addEventListener('mouseenter', () => { if (has()) showSub(li.dataset.sec); });
      li.addEventListener('focusin', () => { if (has()) showSub(li.dataset.sec); });
    });
    if (header) header.addEventListener('mouseleave', () => showSub(curLi ? curLi.dataset.sec : ''));
  }

  // cookie notice (Hebrew). Remembers the choice in this browser.
  (() => {
    let saved = null;
    try { saved = localStorage.getItem('admati-cookies'); } catch (e) {}
    if (saved) return;
    const box = document.createElement('div');
    box.className = 'cookies'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'הודעה על עוגיות');
    box.innerHTML = '<div class="cookies-in"><div class="cookies-txt"><h2>האתר משתמש בעוגיות</h2><p>אנחנו משתמשים בעוגיות כדי להבין איך גולשים באתר ולשפר אותו. חלק מהמידע עשוי לעבור לשירותי מדידה ופרסום שאנחנו עובדים איתם. אפשר לאשר הכול או לדחות הכול. <span class="cookies-link">מדיניות פרטיות</span></p></div>'
      + '<div class="cookies-btns"><button type="button" class="btn btn-leaf" data-c="all">אישור הכול</button><button type="button" class="btn btn-soil" data-c="none">דחיית הכול</button></div>'
      + '<button type="button" class="cookies-x" aria-label="סגירה" data-c="none">×</button></div>';
    document.body.append(box);
    box.addEventListener('click', e => {
      const c = e.target.closest('[data-c]'); if (!c) return;
      try { localStorage.setItem('admati-cookies', c.dataset.c); } catch (er) {}
      box.remove();
    });
  })();

  // menu option 1: on touch screens the first tap on an item with a box opens the box
  $$('.nav1 .main > li').forEach(li => {
    const drop = $('.drop', li), a = li.querySelector(':scope > a');
    if (!drop || !a) return;
    a.addEventListener('click', e => {
      if (matchMedia('(hover: none)').matches && !li.classList.contains('open')) {
        e.preventDefault();
        $$('.nav1 .main > li.open').forEach(x => x.classList.remove('open'));
        li.classList.add('open');
      }
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav1')) $$('.nav1 .main > li.open').forEach(x => x.classList.remove('open')); });

  // home: the opening photo zooms in slightly while scrolling down
  const heroImg = $('.show-hero .slide img');
  if (heroImg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroImg.style.animation = 'none';
    heroImg.style.transformOrigin = '50% 60%';
    heroImg.style.willChange = 'transform';
    let ticking = false;
    const zoom = () => {
      const r = heroImg.parentElement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      heroImg.style.transform = 'scale(' + (1 + p * 0.09).toFixed(4) + ')';
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(zoom); } }, {passive: true});
    zoom();
  }

  // gardens grid: on touch screens the first tap shows the second photo and the poetic line, the second tap opens the story
  $$('.gtile').forEach(t => t.addEventListener('click', e => {
    if (matchMedia('(hover: none)').matches && !t.classList.contains('on')) {
      e.preventDefault();
      $$('.gtile.on').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
    }
  }));

  // gardens grid filter: all / garden / balcony / public
  $$('.gfilter button').forEach(b => b.addEventListener('click', () => {
    $$('.gfilter button').forEach(x => x.classList.toggle('on', x === b));
    $$('.gtile').forEach(t => t.hidden = !(b.dataset.f === 'all' || t.dataset.cat === b.dataset.f));
  }));

  // before/after sliders
  $$('.ba').forEach(ba => {
    const input = $('input', ba);
    const set = v => ba.style.setProperty('--pos', v + '%');
    input.addEventListener('input', () => set(input.value)); set(input.value);
    ba._set = v => { input.value = v; set(v); };
  });

  // lightbox for the field mosaic
  const lb = $('#lb'), tiles = $$('#mosaic .tile');
  let cur = 0, opener = null;
  if (lb && tiles.length) {
    const lbImg = $('#lb-img'), lbCap = $('#lb-cap');
    const show = i => { cur = (i + tiles.length) % tiles.length; const img = $('img', tiles[cur]); lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = $('.cap', tiles[cur]).textContent; };
    tiles.forEach((t, i) => t.addEventListener('click', () => { opener = t; show(i); lb.showModal(); }));
    $('#lb-close').onclick = () => lb.close();
    $('#lb-next').onclick = () => show(cur + 1);
    $('#lb-prev').onclick = () => show(cur - 1);
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur + 1); if (e.key === 'ArrowRight') show(cur - 1); });
    lb.addEventListener('close', () => opener && opener.focus());
  }

  // garden rooms plan
  const bubs = $$('.plan .bub'), panels = $$('.room-panel');
  const showRoom = (id, scroll) => {
    bubs.forEach(x => { const on = x.dataset.room === id; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); x.setAttribute('tabindex', on ? '0' : '-1'); });
    panels.forEach(p => p.classList.toggle('on', p.id === 'room-' + id));
    if (scroll && innerWidth < 860) { const p = $('#room-' + id); p && p.scrollIntoView({behavior: 'smooth', block: 'start'}); }
  };
  const stepRoom = d => { const i = bubs.findIndex(x => x.classList.contains('on')); const nx = bubs[(i + d + bubs.length) % bubs.length]; showRoom(nx.dataset.room); return nx; };
  bubs.forEach(x => {
    x.addEventListener('click', () => showRoom(x.dataset.room, true));
    x.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showRoom(x.dataset.room, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); stepRoom(1).focus(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); stepRoom(-1).focus(); }
    });
  });
  $$('[data-room-step]').forEach(b => b.addEventListener('click', () => stepRoom(+b.dataset.roomStep)));
  if (bubs.length) showRoom(bubs[0].dataset.room);

  // home opening: cross-fading main image + small gallery
  const slides = $$('.slide'), thumbBtns = $$('.thumbs button');
  if (slides.length) {
    let cur = 0, timer = null;
    const go = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === cur));
      thumbBtns.forEach((b, k) => { b.classList.toggle('on', k === cur); b.setAttribute('aria-pressed', k === cur); });
      const tb = thumbBtns[cur]; if (tb && tb.parentNode) { const p = tb.parentNode; p.scrollTo({left: tb.offsetLeft - p.clientWidth / 2 + tb.clientWidth / 2, behavior: 'smooth'}); }
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => { if (!reduce) { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5500); } };
    thumbBtns.forEach((b, k) => b.addEventListener('click', () => { go(k); start(); }));
    start();
  }

  // gardens index: one photo follows the pointer over a place name
  const peek = $('.toc-peek');
  if (peek) {
    const pi = $('img', peek), pc = $('figcaption', peek);
    $$('.toc-row').forEach(a => {
      a.addEventListener('mouseenter', () => { if (!a.dataset.peek.endsWith('/')) { pi.src = a.dataset.peek; pc.textContent = a.dataset.note; peek.classList.add('on'); } });
      a.addEventListener('mouseleave', () => peek.classList.remove('on'));
      a.addEventListener('mousemove', e => { peek.style.left = Math.min(innerWidth - 320, e.clientX + 24) + 'px'; peek.style.top = Math.max(10, e.clientY - 120) + 'px'; });
    });
  }

  // home: passing over a garden corner shows its photo in the big frame (Hagai 24.11)
  const rf = $('.rooms-frame');
  if (rf) {
    const pic = $('.room-pic', rf), cap = $('.stamp', rf), capText = cap ? cap.textContent : '';
    $$('.rooms-mini a[data-photo]').forEach(a => { const im = new Image(); im.src = a.dataset.photo; });
    let back = null;
    const show = a => {
      clearTimeout(back);
      $$('.rooms-mini a').forEach(x => x.classList.toggle('on', x === a));
      if (!a.dataset.photo) return;
      pic.src = a.dataset.photo; pic.alt = a.textContent; pic.hidden = false;
      requestAnimationFrame(() => pic.classList.add('on'));
      if (cap) cap.textContent = a.textContent;
    };
    const hide = () => { back = setTimeout(() => {
      pic.classList.remove('on'); $$('.rooms-mini a').forEach(x => x.classList.remove('on'));
      if (cap) cap.textContent = capText; }, 250); };
    $$('.rooms-mini a').forEach(a => {
      a.addEventListener('mouseenter', () => show(a));
      a.addEventListener('focus', () => show(a));
      a.addEventListener('mouseleave', hide);
      a.addEventListener('blur', hide);
      // touch screens: the first tap shows the photo, a second tap opens the page
      a.addEventListener('click', e => { if (matchMedia('(hover: none)').matches && !a.classList.contains('on')) { e.preventDefault(); show(a); } });
    });
  }

  // contact form look (Hagai 24.11): the field name sits inside the box, like the reference
  $$('.contact form.lead .field').forEach(fd => {
    const lab = $('label', fd), ctl = $('input:not([type=file]):not([type=radio]), textarea, select', fd);
    if (!lab || !ctl) return;
    const txt = lab.textContent.trim();
    if (ctl.tagName === 'SELECT') { const o = ctl.options[0]; if (o && !o.value) o.textContent = txt; }
    else ctl.placeholder = txt;
    fd.classList.add('inph');
  });

  // clients: one at a time in the middle, changing by itself; pauses while the mouse or keyboard is on it
  $$('.clients-rot, .quotes-rot').forEach(ul => {
    const items = [...ul.children]; if (!items.length) return;
    const wait = ul.classList.contains('quotes-rot') ? 6500 : 3200;   // quotes stay longer, to be read
    let i = 0, timer = null;
    const dots = document.createElement('div'); dots.className = 'clients-dots';
    items.forEach((li, k) => {
      const b = document.createElement('button'); b.type = 'button';
      const nm = li.querySelector('footer b, b'), al = (li.querySelector('img') || {}).alt;
      b.setAttribute('aria-label', ((nm && nm.textContent) || al || '') + ' (' + (k + 1) + ' מתוך ' + items.length + ')');
      b.addEventListener('click', () => { show(k); restart(); });
      dots.appendChild(b);
    });
    ul.after(dots);
    const show = k => {
      i = (k + items.length) % items.length;
      items.forEach((li, n) => li.classList.toggle('on', n === i));
      $$('button', dots).forEach((b, n) => b.setAttribute('aria-current', n === i ? 'true' : 'false'));
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), wait); };
    const stop = () => clearInterval(timer);
    [ul, dots].forEach(el => { el.addEventListener('mouseenter', stop); el.addEventListener('mouseleave', restart); el.addEventListener('focusin', stop); el.addEventListener('focusout', restart); });
    show(0); restart();
  });

  // contact form (prototype: nothing is sent)
  $$('form.lead').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const name = (($('[name=name]', f) || {}).value || '').replace(/[<>&]/g, '');
    f.innerHTML = '<p class="sent">תודה' + (name ? ', ' + name : '') + '.</p><p>נחזור אליכם בימים הקרובים. (באב־הטיפוס הזה הטופס לא נשלח באמת.)</p>';
  }));

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // split headings into words only (Hebrew letters must stay joined)
  $$('.split').forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part; w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('todo')) walk(n);
    });
    walk(el);
  });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({lerp: .1, smoothWheel: true});
      lenis.on('scroll', ScrollTrigger.update);
      const raf = t => lenis.raf(t * 1000);
      gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
      if (lb) { lb.addEventListener('close', () => lenis.start()); tiles.forEach(t => t.addEventListener('click', () => lenis.stop())); }
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); lenis.scrollTo(t, {offset: t.id === 'main' ? 0 : -90}); }
      }));
    }
    $$('.split').forEach(el => gsap.from($$('.w > span', el), {yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .07, scrollTrigger: {trigger: el, start: 'top 88%'}}));
    if ($('.collage')) {
      gsap.from('.collage .main', {y: 60, rotate: 5, duration: 1.4, ease: 'expo.out', delay: .15});
      gsap.from('.collage .small', {y: 90, rotate: -14, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .4});
      gsap.from('.seal', {scale: .4, rotate: -40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: .6});
    }
    $$('.ba').forEach(ba => { const o = {v: 88}; ScrollTrigger.create({trigger: ba, start: 'top 75%', once: true, onEnter: () => gsap.fromTo(o, {v: 88}, {v: 50, duration: 1.6, ease: 'expo.out', onUpdate: () => ba._set(o.v.toFixed(1))})}); });
    $$('.tile img').forEach(img => gsap.fromTo(img, {yPercent: -6, scale: 1.12}, {yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: {trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true}}));
    const strip = $('#strip');
    if (strip) {
      strip.append(...[...strip.children].map(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('img', c).forEach(i => i.alt = ''); return c; }));
      const loop = gsap.to(strip, {xPercent: 50, ease: 'none', duration: 60, repeat: -1});
      ScrollTrigger.create({trigger: strip, start: 'top bottom', end: 'bottom top', onUpdate: self => gsap.to(loop, {timeScale: 1 + Math.min(4, Math.abs(self.getVelocity()) / 400), duration: .2, overwrite: true, onComplete: () => gsap.to(loop, {timeScale: 1, duration: 1.2})})});
    }
    return () => { lenis && lenis.destroy(); };
  });

  // projects: horizontal prints on desktop (RTL: track travels to the right)
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const track = $('#track'); if (!track) return;
    const sec = track.closest('.projects'); sec.classList.add('pinned');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {x: () => dist(), ease: 'none', scrollTrigger: {trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1}});
    return () => sec.classList.remove('pinned');
  });

  // drip line: one brown pipe running down the start edge, watering each section
  const svg = $('#drip');
  if (svg) {
    const NS = 'http://www.w3.org/2000/svg';
    let pathEl, drops = [];
    const build = () => {
      const H = document.documentElement.scrollHeight, W = document.documentElement.clientWidth;
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.height = H + 'px';
      svg.innerHTML = '';
      const narrow = W < 861;
      const xEdge = W - (narrow ? 8 : Math.max(18, (W - 1320) / 2 + 14));
      const xIn = W - (narrow ? 14 : Math.max(46, (W - 1320) / 2 + 40));
      const secs = $$('[data-drip]').map(s => s.getBoundingClientRect().top + scrollY);
      let d = `M ${xEdge} 90`;
      secs.forEach((y, i) => { if (!i) return; const mid = y - 140; d += ` L ${xEdge} ${mid} C ${xEdge} ${mid + 70}, ${xIn} ${mid + 50}, ${xIn} ${y - 20} S ${xEdge} ${y + 90}, ${xEdge} ${y + 160}`; });
      d += ` L ${xEdge} ${H - 60}`;
      pathEl = document.createElementNS(NS, 'path'); pathEl.setAttribute('d', d);
      if (narrow) pathEl.style.strokeWidth = 4;
      svg.append(pathEl);
      const len = pathEl.getTotalLength();
      for (let s = 120; s < len; s += 110) { const p = pathEl.getPointAtLength(s); const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', narrow ? 2.2 : 3); c.setAttribute('class', 'em'); c.dataset.at = s / len; svg.append(c); }
      drops = secs.slice(1).map(y => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', xIn); c.setAttribute('cy', y - 20); c.setAttribute('r', narrow ? 5 : 9); c.setAttribute('class', 'drop'); svg.append(c); return c; });
      return len;
    };
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let len = build();
      const paint = () => { const H = document.documentElement.scrollHeight; const p = Math.min(1, (scrollY + innerHeight * .7) / H); pathEl.style.strokeDasharray = len; pathEl.style.strokeDashoffset = len * (1 - p); $$('.em', svg).forEach(c => c.style.opacity = (+c.dataset.at <= p) ? 1 : 0); };
      const st = ScrollTrigger.create({start: 0, end: 'max', onUpdate: paint, onRefresh: paint});
      paint();
      drops.forEach(c => gsap.from(c, {attr: {r: 0}, duration: .8, ease: 'expo.out', scrollTrigger: {trigger: c, start: 'top 70%'}}));
      ScrollTrigger.addEventListener('refreshInit', () => { len = build(); });
      return () => st.kill();
    });
    mm.add('(prefers-reduced-motion: reduce)', () => { build(); ScrollTrigger.addEventListener('refreshInit', build); });
  }
  addEventListener('load', () => ScrollTrigger.refresh());
})();

// Version 2 (24.11): mobile menu button, and a WhatsApp button that steps aside on the opening screen and at the bottom
(function () {
  const header = document.querySelector('.top'), wrap = header && header.querySelector('.wrap'), nav = header && header.querySelector('.nav1');
  if (wrap && nav && !wrap.querySelector('.menu-btn')) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'menu-btn'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'תפריט');
    b.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(b);
    b.addEventListener('click', () => { const o = header.classList.toggle('menu-open'); b.setAttribute('aria-expanded', o); });
    nav.addEventListener('click', e => { if (e.target.closest('.drop a')) header.classList.remove('menu-open'); });
  }
  const wa = document.querySelector('a.wa');
  if (!wa) return;
  const hello = document.querySelector('.hello'), foot = document.querySelector('footer');
  const upd = () => {
    let hide = false;
    if (innerWidth <= 860) {
      if (hello && hello.getBoundingClientRect().bottom > innerHeight * 0.35) hide = true;
      if (foot && foot.getBoundingClientRect().top < innerHeight - 40) hide = true;
    }
    wa.classList.toggle('wa-away', hide);
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();
