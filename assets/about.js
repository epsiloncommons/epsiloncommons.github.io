/* About page: scroll-driven story. Chat bubbles scroll away; three useful ones are filed onto a wiki page.
   Everything else on the page is CSS. Without JS, or with reduced motion, the story is a plain static sequence. */
(function () {
  'use strict';
  var sec = document.querySelector('.scrolly');
  if (!sec) { return; }
  var fig = sec.querySelector('.story-fig');
  var bubbles = [].slice.call(fig.querySelectorAll('.bubble'));
  var kept = bubbles.filter(function (b) { return b.classList.contains('keep'); });
  var slots = [].slice.call(fig.querySelectorAll('.slot'));
  var card = fig.querySelector('.pagecard');
  var badge = fig.querySelector('.badge');
  var steps = [].slice.call(sec.querySelectorAll('.story-step'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var rest = [], target = [], current = -1, ticking = false, active = false;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function measure() {
    bubbles.forEach(function (b) { b.style.transform = 'none'; });
    kept.forEach(function (b, i) { slots[i].style.height = b.offsetHeight + 'px'; });
    var f = fig.getBoundingClientRect();
    rest = bubbles.map(function (b) { var r = b.getBoundingClientRect(); return { x: r.left - f.left, y: r.top - f.top }; });
    target = slots.map(function (s) { var r = s.getBoundingClientRect(); return { x: r.left - f.left, y: r.top - f.top }; });
  }

  function render(p) {
    var a1 = 0.30, a2 = 0.63, k = 0;
    var q = clamp((p - a1) / (a2 - a1 - 0.03), 0, 1);
    bubbles.forEach(function (b, i) {
      var appear = clamp((p - i * 0.035) / 0.06, 0, 1);
      var isKept = b.classList.contains('keep');
      var dx = 0, dy = 0, op = appear;
      if (!isKept) {
        dx = (b.classList.contains('me') ? 1 : -1) * ease(q) * 70;
        dy = -ease(q) * (24 + i * 6);
        op = appear * (1 - clamp(q * 1.7, 0, 1));
      } else {
        var kk = kept.indexOf(b);
        var t = clamp((p - 0.66 - kk * 0.06) / 0.2, 0, 1);
        dx = (target[kk].x - rest[i].x) * ease(t);
        dy = (target[kk].y - rest[i].y) * ease(t);
        b.classList.toggle('hl', q > 0.45 && t < 1);
        b.classList.toggle('landed', t >= 1);
      }
      b.style.opacity = op.toFixed(3);
      b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
    });
    card.style.opacity = (0.35 + 0.65 * clamp((p - 0.62) / 0.2, 0, 1)).toFixed(3);
    badge.style.opacity = clamp((p - 0.93) / 0.05, 0, 1).toFixed(3);
    var idx = p < a1 ? 0 : (p < a2 ? 1 : 2);
    if (idx !== current) {
      current = idx;
      steps.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
    }
  }

  function progress() {
    var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 61;
    var r = sec.getBoundingClientRect();
    var total = r.height - (window.innerHeight - nav);
    return clamp((nav - r.top) / total, 0, 1);
  }

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () { ticking = false; render(progress()); });
  }

  function setup() {
    if (active) { return; }
    active = true;
    measure();
    render(progress());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); render(progress()); });
  }

  function showFinal() {
    /* Reduced motion: no scrolling effects. Show the finished picture, with the useful messages already on the wiki page. */
    sec.classList.add('static');
    measure();
    render(1);
    window.addEventListener('resize', function () { measure(); render(1); });
  }

  function init() {
    if (reduce.matches) { showFinal(); return; }
    setup();
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(init); } else { window.addEventListener('load', init); }
})();
