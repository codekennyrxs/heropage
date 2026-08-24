/* Kahvi POS landing — scroll reveal + sticky-header elevation */
(function () {
  'use strict';

  /* ---- scroll-reveal for .rv elements ---- */
  var els = document.querySelectorAll('.rv');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (e, i) {
      // slight stagger within a group by delaying the transition
      e.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(e);
    });
  }

  /* ---- elevate the sticky header once the page scrolls ---- */
  var topbar = document.querySelector('.topbar');
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
