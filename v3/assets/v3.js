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
    list.parentNode.appendChild(dots);
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
})();
