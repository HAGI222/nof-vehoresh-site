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
})();
