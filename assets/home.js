/* Epsilon Commons homepage. Plain JavaScript, no libraries.
   Every effect has a static fallback in the HTML/CSS, so the page works without this file. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. Hero: rotating wireframe Klein bottle (figure-8 immersion) ---------- */
  function initSurface(cv) {
    var ctx = cv.getContext('2d');
    if (!ctx || !window.Path2D) { throw new Error('canvas unavailable'); }
    var small = window.innerWidth < 640;
    var NU = small ? 14 : 20, NV = small ? 10 : 12, SU = 56, SV = 80;
    var TAU = Math.PI * 2;
    function P(u, v) {
      var cu = Math.cos(u / 2), su = Math.sin(u / 2);
      var r = 2 + cu * Math.sin(v) - su * Math.sin(2 * v);
      return [r * Math.cos(u), r * Math.sin(u), su * Math.sin(v) + cu * Math.sin(2 * v)];
    }
    var lines = [], i, j, pts;
    for (i = 0; i < NU; i++) { pts = []; for (j = 0; j <= SV; j++) { pts.push(P(i / NU * TAU, j / SV * TAU)); } lines.push(pts); }
    for (j = 0; j < NV; j++) { pts = []; for (i = 0; i <= SU; i++) { pts.push(P(i / SU * TAU, j / NV * TAU)); } lines.push(pts); }
    // three orbital rings
    var rings = [[4.9, 0.5, 0.2], [4.5, -0.9, 0.9], [4.1, 1.3, -0.6]].map(function (o) {
      var a = [], t, x, y, z, c, s;
      for (t = 0; t <= 96; t++) {
        x = o[0] * Math.cos(t / 96 * TAU); y = o[0] * Math.sin(t / 96 * TAU) * 0.55; z = 0;
        c = Math.cos(o[1]); s = Math.sin(o[1]); var y1 = y * c - z * s, z1 = y * s + z * c;
        c = Math.cos(o[2]); s = Math.sin(o[2]); var x1 = x * c + z1 * s, z2 = -x * s + z1 * c;
        a.push([x1, y1, z2]);
      }
      return a;
    });
    var tilt = 1.0, ay = 0.6, w = 0, h = 0, dpr = 1, scale = 1;
    var shades = ['rgba(139,145,255,.16)', 'rgba(139,145,255,.32)', 'rgba(110,170,255,.52)', 'rgba(101,201,255,.85)'];
    function size() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      scale = w / 2 / 5.1;
    }
    function proj(p, ca, sa, ct, st) {
      var x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca;
      var y = p[1] * ct - z * st, z3 = p[1] * st + z * ct;
      var f = 11 / (11 - z3);
      return [w / 2 + x * f * scale, h / 2 + y * f * scale, z3];
    }
    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var ca = Math.cos(ay), sa = Math.sin(ay), ct = Math.cos(tilt), st = Math.sin(tilt);
      var b = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      var k, n, a, c, d, q;
      for (k = 0; k < lines.length; k++) {
        a = proj(lines[k][0], ca, sa, ct, st);
        for (n = 1; n < lines[k].length; n++) {
          c = proj(lines[k][n], ca, sa, ct, st);
          d = (a[2] + c[2]) / 2;
          q = clamp(Math.floor((d + 3.2) / 6.4 * 4), 0, 3);
          b[q].moveTo(a[0], a[1]); b[q].lineTo(c[0], c[1]);
          a = c;
        }
      }
      ctx.lineJoin = 'round';
      for (q = 0; q < 4; q++) { ctx.strokeStyle = shades[q]; ctx.lineWidth = 0.7 + q * 0.22; ctx.stroke(b[q]); }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(101,201,255,.2)';
      rings.forEach(function (r, ri) {
        ctx.beginPath();
        r.forEach(function (p, m) { var s = proj(p, ca, sa, ct, st); if (m) { ctx.lineTo(s[0], s[1]); } else { ctx.moveTo(s[0], s[1]); } });
        ctx.stroke();
        var dot = proj(r[Math.floor(((t / (5200 + ri * 1700)) % 1) * 96)], ca, sa, ct, st);
        ctx.beginPath(); ctx.arc(dot[0], dot[1], 2.4, 0, TAU); ctx.fillStyle = ri === 1 ? '#C4A5FF' : '#65C9FF'; ctx.fill();
      });
    }
    var running = false, raf = 0, last = 0, visible = true;
    function frame(ts) {
      if (!running) { return; }
      var dt = Math.min(48, ts - last); last = ts;
      ay += dt * 0.00011;
      draw(ts);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !reduceMQ.matches && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { size(); draw(0); }
    root.classList.add('surface-ok'); // show the canvas first, so it can be measured
    size(); draw(0);
    window.addEventListener('resize', function () { size(); draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) { start(); } else { stop(); } }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });
    if (reduceMQ.addEventListener) { reduceMQ.addEventListener('change', function () { if (reduceMQ.matches) { stop(); still(); } else { start(); } }); }
    start();
  }

  /* ---------- 2. The epsilon section: shrink eps, watch N move right ---------- */
  var epsSection = $('#epsilon');
  var epsSet = null;
  function initEps(sec) {
    var X0 = 60, X1 = 900, YL = 230, A = 150, K = 2.6, W = 15, N = 260, EMAX = 118, EMIN = 11;
    var seg = [], ys = [], i, t;
    for (i = 0; i <= N; i++) {
      t = i / N;
      var x = X0 + (X1 - X0) * t, y = YL - A * Math.exp(-K * t) * Math.cos(W * t);
      ys.push(y); seg.push(x.toFixed(1) + ' ' + y.toFixed(1));
    }
    var el = {
      before: $('#eps-before'), after: $('#eps-after'), rect: $('#eps-rect'), top: $('#eps-top'), bot: $('#eps-bot'),
      n: $('#eps-n'), nt: $('#eps-n-text'), tt: $('#eps-tt'), tb: $('#eps-tb'), re: $('#read-eps'), rn: $('#read-n'), steps: $$('.eps-step', sec)
    };
    var lastStep = -1;
    epsSet = function (p) {
      var e = EMAX * Math.pow(EMIN / EMAX, p), last = 0, k;
      for (i = 0; i <= N; i++) { if (Math.abs(ys[i] - YL) > e) { last = i; } }
      k = Math.min(N, last + 1);
      el.before.setAttribute('d', 'M' + seg.slice(0, k + 1).join('L'));
      el.after.setAttribute('d', 'M' + seg.slice(k).join('L'));
      el.rect.setAttribute('y', (YL - e).toFixed(1)); el.rect.setAttribute('height', (2 * e).toFixed(1));
      el.top.setAttribute('y1', (YL - e).toFixed(1)); el.top.setAttribute('y2', (YL - e).toFixed(1));
      el.bot.setAttribute('y1', (YL + e).toFixed(1)); el.bot.setAttribute('y2', (YL + e).toFixed(1));
      el.tt.setAttribute('y', (YL - e - 8).toFixed(1)); el.tb.setAttribute('y', (YL + e + 24).toFixed(1));
      var nx = X0 + (X1 - X0) * k / N;
      el.n.setAttribute('x1', nx.toFixed(1)); el.n.setAttribute('x2', nx.toFixed(1));
      el.nt.setAttribute('x', (nx + 8).toFixed(1));
      el.re.textContent = (e / 100).toFixed(2);
      el.rn.textContent = (k / N * 10).toFixed(1);
      var s = p < 0.34 ? 0 : (p < 0.7 ? 1 : 2);
      if (s !== lastStep) { el.steps.forEach(function (n, m) { n.classList.toggle('on', m === s); }); lastStep = s; }
    };
    epsSet(0);
  }

  /* ---------- 3. Scroll-linked updates (one rAF-throttled handler) ---------- */
  var ribbon = $('#ribbon-path'), ticking = false;
  function navHeight() { var h = $('#quarto-header'); return h ? h.offsetHeight : 61; }
  function update() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    document.body.classList.toggle('scrolled', y > 24);
    root.style.setProperty('--sy', y);
    if (ribbon && !reduceMQ.matches) {
      var total = document.documentElement.scrollHeight;
      ribbon.style.strokeDashoffset = (1 - clamp((y + vh * 0.6) / total, 0, 1)).toFixed(4);
    }
    if (epsSection && epsSet) {
      var stage = $('.eps-stage', epsSection), nh = navHeight();
      var span = epsSection.offsetHeight - stage.offsetHeight;
      var p = clamp((nh - epsSection.getBoundingClientRect().top) / span, 0, 1);
      epsSet(clamp((p - 0.06) / 0.88, 0, 1));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  /* ---------- start everything; add the "js" class only if setup worked ---------- */
  try {
    root.style.setProperty('--nav-h', navHeight() + 'px');
    var cv = $('#surface');
    if (cv) { try { initSurface(cv); } catch (e) { root.classList.remove('surface-ok'); } }
    if (epsSection) { initEps(epsSection); }
    if (ribbon && !reduceMQ.matches) { ribbon.style.strokeDashoffset = '1'; }
    var items = $$('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      items.forEach(function (n) { io.observe(n); });
      root.classList.add('js');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { root.style.setProperty('--nav-h', navHeight() + 'px'); onScroll(); });
    update();
  } catch (err) {
    root.classList.remove('js');
    if (window.console) { console.warn('Homepage effects disabled:', err); }
  }
})();
