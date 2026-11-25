(function () {
  var doc = document.documentElement;
  var hdr = document.getElementById('hdr');
  var top = document.querySelector('.totop');

  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('solid', y > 40);
    if (top) top.classList.toggle('on', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (top) top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // phone menu
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט');
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(!doc.classList.contains('menu-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // the menu covers only part of the screen: a tap on the dark part beside it closes it
    var veil = document.querySelector('.menu-veil');
    if (veil) veil.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 767) setMenu(false);
    });
  }

  // gentle fade-in while scrolling
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // client quotes: one at a time, changing by itself; dots let the visitor choose
  var list = document.querySelector('.quotes-list');
  if (list) {
    var quotes = list.querySelectorAll('.said');
    var dots = document.createElement('div');
    var now = 0, timer = null, held = false;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dots.className = 'q-dots';
    function show(i) {
      now = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, k) {
        q.classList.toggle('on', k === now);
        q.setAttribute('aria-hidden', k === now ? 'false' : 'true');
        dots.children[k].setAttribute('aria-current', k === now ? 'true' : 'false');
      });
    }
    function play() {
      clearInterval(timer);
      if (!still && !held) timer = setInterval(function () { show(now + 1); }, 6500);
    }
    quotes.forEach(function (q, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'המלצה ' + (k + 1) + ' מתוך ' + quotes.length);
      b.addEventListener('click', function () { show(k); play(); });
      dots.appendChild(b);
    });
    list.classList.add('rot');
    list.insertAdjacentElement('afterend', dots);
    show(0);
    ['mouseenter', 'focusin'].forEach(function (ev) {
      list.parentNode.addEventListener(ev, function () { held = true; clearInterval(timer); });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      list.parentNode.addEventListener(ev, function () { held = false; play(); });
    });
    play();
  }

  // pop-up inviting to an introduction meeting: once per visit, after the visitor has read part of the page
  var pop = document.getElementById('pop');
  if (pop) {
    var KEY = 'nv-pop-seen';
    var back = null, popTimer = null;
    var closeBtn = pop.querySelector('.pop-x');
    function wasSeen() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
    function markSeen() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
    function isOpen() { return pop.classList.contains('on'); }
    function openPop(force) {
      if (isOpen() || doc.classList.contains('menu-open')) return;
      if (!force && wasSeen()) return;
      back = document.activeElement;
      pop.classList.add('on');
      pop.setAttribute('aria-hidden', 'false');
      doc.classList.add('pop-open');
      markSeen();
      stopWaiting();
      if (closeBtn) closeBtn.focus();
    }
    function closePop() {
      if (!isOpen()) return;
      pop.classList.remove('on');
      pop.setAttribute('aria-hidden', 'true');
      doc.classList.remove('pop-open');
      if (back && back.focus) back.focus();
    }
    function onRead() {
      var room = document.documentElement.scrollHeight - window.innerHeight;
      if (room > 0 && (window.scrollY || 0) > room * 0.4) openPop(false);
    }
    function stopWaiting() {
      clearTimeout(popTimer);
      window.removeEventListener('scroll', onRead);
    }
    if (closeBtn) closeBtn.addEventListener('click', closePop);
    pop.addEventListener('click', function (e) {
      if (e.target === pop || e.target.closest('a')) closePop();
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { closePop(); return; }
      if (e.key !== 'Tab') return;
      var stops = pop.querySelectorAll('button, a[href]');
      var first = stops[0], last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    if (location.hash === '#popup') {
      openPop(true);                       // a link ending in #popup always shows it (for review)
    } else if (!wasSeen()) {
      window.addEventListener('scroll', onRead, { passive: true });
      popTimer = setTimeout(function () { openPop(false); }, 30000);
    }
  }

  // planting strips: a narrow window onto a tall photo that moves much slower than the page,
  // so the planting is clearly seen sliding behind while scrolling
  var strips = document.querySelectorAll('.drift');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (strips.length && !calm) {
    var waiting = false;
    function drift() {
      waiting = false;
      var vh = window.innerHeight;
      var k = window.innerWidth < 768 ? 0.5 : 0.62;      // share of the scroll the photo "stays behind"
      strips.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var img = el.firstElementChild;
        var extra = k * (vh + r.height);
        var p = (vh - r.top) / (vh + r.height);           // 0 entering from below, 1 leaving at the top
        if (p < 0) p = 0; else if (p > 1) p = 1;
        img.style.height = Math.ceil(r.height + extra) + 'px';
        img.style.transform = 'translate3d(0,' + (-extra * (1 - p)).toFixed(1) + 'px,0)';
      });
    }
    function ask() { if (!waiting) { waiting = true; requestAnimationFrame(drift); } }
    strips.forEach(function (el) { el.classList.add('live'); });
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    drift();
  }

  // plant page: small pictures under the main one; a click shows that picture large
  var tbox = document.querySelector('.p-thumbs');
  var big = document.getElementById('p-main');
  if (tbox && big) {
    tbox.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      big.removeAttribute('width');
      big.removeAttribute('height');
      big.src = a.getAttribute('href');
      big.alt = a.getAttribute('data-alt') || '';
      tbox.querySelectorAll('a').forEach(function (x) { x.classList.toggle('on', x === a); });
    });
  }

  // a click on a garden photo shows it large over the page
  var lb = null, lbImg = null, lbBack = null;
  function lbOpen(src, alt) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lb';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'תמונה מוגדלת');
      lb.innerHTML = '<button class="lb-x" type="button" aria-label="סגירה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button><img alt="">';
      lbImg = lb.querySelector('img');
      lb.addEventListener('click', function (e) { if (e.target !== lbImg) lbClose(); });
      document.body.appendChild(lb);
    }
    lbBack = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('on');
    doc.classList.add('lb-open');
    lb.querySelector('.lb-x').focus();
  }
  function lbClose() {
    if (!lb) return;
    lb.classList.remove('on');
    doc.classList.remove('lb-open');
    if (lbBack && lbBack.focus) lbBack.focus();
  }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (z) { e.preventDefault(); lbOpen(z.getAttribute('href'), z.getAttribute('data-alt')); return; }
    var im = e.target.closest('.shots img');
    if (im) lbOpen(im.currentSrc || im.src, im.alt);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && lb.classList.contains('on')) lbClose();
  });

  // client quotes carousel: three cards in view from the start, one step at a time, by itself, in an endless loop
  var qRun = document.querySelector('.q-run');
  if (qRun) {
    var qCards = qRun.querySelectorAll('.q-card');
    var qSet = qCards.length / 3;                 // the cards are printed three times; the middle set is the home set
    var qNow = qSet + 1, qTimer = null, qHeld = false, qSeen = false, qWait = null;
    var qStill = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function qMark() {
      qCards.forEach(function (c, k) { c.classList.toggle('on', k === qNow); });
    }
    function qNearest() {
      var r = qRun.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, gap = 1e9;
      qCards.forEach(function (c, k) {
        var cr = c.getBoundingClientRect(), d = Math.abs(cr.left + cr.width / 2 - mid);
        if (d < gap) { gap = d; best = k; }
      });
      return best;
    }
    function qGo(i, smooth) {
      qNow = Math.max(0, Math.min(qCards.length - 1, i));
      var r = qRun.getBoundingClientRect(), cr = qCards[qNow].getBoundingClientRect();
      qRun.scrollBy({ left: (cr.left + cr.width / 2) - (r.left + r.width / 2), behavior: smooth === false || qStill ? 'auto' : 'smooth' });
      qMark();
    }
    function qHome() {                            // once the movement has settled, jump silently back into the middle set
      qNow = qNearest();
      if (qNow >= 2 * qSet) { qRun.style.scrollSnapType = 'none'; qGo(qNow - qSet, false); qRun.style.scrollSnapType = ''; }
      else if (qNow < qSet) { qRun.style.scrollSnapType = 'none'; qGo(qNow + qSet, false); qRun.style.scrollSnapType = ''; }
      else qMark();
    }
    function qPlay() {
      clearInterval(qTimer);
      if (!qStill && !qHeld && qSeen) qTimer = setInterval(function () { qGo(qNow + 1); }, 4500);
    }
    qRun.addEventListener('scroll', function () {
      clearTimeout(qWait);
      qWait = setTimeout(qHome, 160);
    }, { passive: true });
    var qPrev = document.querySelector('.q-arrow.prev'), qNext = document.querySelector('.q-arrow.next');
    if (qPrev) qPrev.addEventListener('click', function () { qGo(qNow - 1); qPlay(); });
    if (qNext) qNext.addEventListener('click', function () { qGo(qNow + 1); qPlay(); });
    qRun.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { qGo(qNow + 1); qPlay(); }
      else if (e.key === 'ArrowRight') { qGo(qNow - 1); qPlay(); }
    });
    // a finger on the row or keyboard focus holds it; the mouse does not, so it keeps moving by itself
    ['focusin', 'touchstart'].forEach(function (ev) {
      qRun.addEventListener(ev, function () { qHeld = true; clearInterval(qTimer); }, { passive: true });
    });
    ['focusout', 'touchend'].forEach(function (ev) {
      qRun.addEventListener(ev, function () { qHeld = false; qPlay(); }, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { qSeen = en[0].isIntersecting; qPlay(); }, { threshold: 0.3 }).observe(qRun);
    } else { qSeen = true; }
    qGo(qNow, false);
    window.addEventListener('load', function () { qGo(qNow, false); });
    window.addEventListener('resize', function () { qGo(qNow, false); });
    qPlay();
  }

  // phone: the meeting button slides in at the bottom once the visitor starts scrolling
  var stick = document.querySelector('.stick');
  if (stick) {
    var stickShow = function () { stick.classList.toggle('on', (window.scrollY || 0) > 220); };
    window.addEventListener('scroll', stickShow, { passive: true });
    stickShow();
  }

  // phone: stacked photos become one photo that changes by itself and drifts a little while scrolling.
  // Covers the row of three photos on the home page, and any two photos that land right under each other
  // (a photo that ends one text block followed by the photo that opens the next).
  var phone = window.matchMedia && window.matchMedia('(max-width: 767px)');
  if (phone && phone.matches) {
    var quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var shows = [];
    document.querySelectorAll('.strip, .team-pics').forEach(function (s) {
      var figs = s.querySelectorAll('figure');
      if (figs.length > 1) shows.push({ box: s, items: figs, at: 0 });
    });
    var pics = Array.prototype.slice.call(document.querySelectorAll('.split > .pic'));
    for (var pi = 0; pi < pics.length - 1; pi++) {
      var a = pics[pi], b = pics[pi + 1];
      if (a.parentNode === b.parentNode) continue;
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (rb.top > ra.top && rb.top - ra.bottom < 90) {
        var extra = b.querySelector('img').cloneNode(false);
        extra.loading = 'eager';
        extra.removeAttribute('fetchpriority');
        a.appendChild(extra);
        a.classList.add('mslide');
        b.classList.add('m-gone');
        shows.push({ box: a, items: a.querySelectorAll('img'), at: 0 });
        pi++;
      }
    }
    shows.forEach(function (sh, k) {
      sh.items[0].classList.add('on');
      sh.box.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; });
      if (quiet) return;
      setTimeout(function () {
        setInterval(function () {
          sh.items[sh.at].classList.remove('on');
          sh.at = (sh.at + 1) % sh.items.length;
          sh.items[sh.at].classList.add('on');
        }, 3800);
      }, k * 900);
    });
    if (shows.length && !quiet) {
      var showWait = false;
      var showDrift = function () {
        showWait = false;
        var vh = window.innerHeight;
        shows.forEach(function (sh) {
          var r = sh.box.getBoundingClientRect();
          if (r.bottom < -60 || r.top > vh + 60) return;
          var t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
          if (t > 1) t = 1; else if (t < -1) t = -1;
          var move = 'translate3d(0,' + (-t * r.height * 0.1).toFixed(1) + 'px,0)';
          sh.box.querySelectorAll('img').forEach(function (im) { im.style.transform = move; });
        });
      };
      window.addEventListener('scroll', function () { if (!showWait) { showWait = true; requestAnimationFrame(showDrift); } }, { passive: true });
      showDrift();
    }
  }

  // phone: the swiped rows move by themselves, one card at a time, in an endless loop (a finger on the row holds it)
  if (phone && phone.matches) {
    var rowStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    [['.g-run.home', '.g-card'], ['.plants-run', '.plant'], ['.cards-run', '.card']].forEach(function (pair) {
      var run = document.querySelector(pair[0]);
      if (!run) return;
      var all = Array.prototype.slice.call(run.querySelectorAll(pair[1]));
      var n = all.filter(function (c) { return c.getAttribute('aria-hidden') !== 'true'; }).length;
      if (n < 2 || all.length < 2 * n) return;
      var cards = all.slice(0, 2 * n);
      cards.slice(n).forEach(function (c) { c.classList.add('m-twin'); });
      run.classList.add('m-loop');
      var now = n, timer = null, held = false, seen = false, wait = null;
      function nearest() {
        var r = run.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, gap = 1e9;
        cards.forEach(function (c, k) {
          var cr = c.getBoundingClientRect(), d = Math.abs(cr.left + cr.width / 2 - mid);
          if (d < gap) { gap = d; best = k; }
        });
        return best;
      }
      function go(i, smooth) {
        now = Math.max(0, Math.min(cards.length - 1, i));
        var r = run.getBoundingClientRect(), cr = cards[now].getBoundingClientRect();
        run.scrollBy({ left: (cr.left + cr.width / 2) - (r.left + r.width / 2), behavior: smooth === false || rowStill ? 'auto' : 'smooth' });
      }
      function jump(i) { run.style.scrollSnapType = 'none'; go(i, false); run.style.scrollSnapType = ''; }
      function home() {                       // once the movement has settled, step silently back so there is always a card on each side
        now = nearest();
        if (now >= 2 * n - 1) jump(now - n);
        else if (now <= 0) jump(now + n);
      }
      function play() {
        clearInterval(timer);
        if (!rowStill && !held && seen) timer = setInterval(function () { go(now + 1); }, 3200);
      }
      run.addEventListener('scroll', function () { clearTimeout(wait); wait = setTimeout(home, 160); }, { passive: true });
      run.addEventListener('touchstart', function () { held = true; clearInterval(timer); }, { passive: true });
      run.addEventListener('touchend', function () { held = false; play(); }, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { seen = en[0].isIntersecting; play(); }, { threshold: 0.3 }).observe(run);
      } else { seen = true; }
      jump(now);
      window.addEventListener('load', function () { jump(now); });
      play();
    });
  }
})();
