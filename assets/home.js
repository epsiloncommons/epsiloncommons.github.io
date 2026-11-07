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
    var AUTO = 0.11;                          // natural spin in radians per second
    var vy = reduceMQ.matches ? 0 : AUTO;     // current yaw speed
    var vp = 0;                               // current pitch speed
    var dragging = false, px = 0, py = 0, pt = 0, hint = $('.drag-hint');
    function auto() { return reduceMQ.matches ? 0 : AUTO; }
    function hintOff() { if (hint) { hint.classList.add('gone'); } }
    function frame(ts) {
      if (!running) { return; }
      var dt = Math.min(48, ts - last); last = ts;
      if (!dragging) {
        vy += (auto() - vy) * (1 - Math.exp(-dt / 900));   // ease back to the natural spin
        vp *= Math.exp(-dt / 350);                          // pitch momentum fades; the tilt stays where it was left
        ay += vy * dt / 1000;
        tilt = clamp(tilt + vp * dt / 1000, -1.45, 1.45);
      }
      draw(ts);
      if (!dragging && auto() === 0 && Math.abs(vy) < 0.004 && Math.abs(vp) < 0.004) { running = false; return; }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    /* Drag (mouse, touch, pen) or arrow keys to turn it. */
    cv.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) { return; }
      dragging = true; cv.classList.add('dragging');
      px = e.clientX; py = e.clientY; pt = e.timeStamp; vy = 0; vp = 0;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* older browsers: still works inside the canvas */ }
      hintOff(); start();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!dragging) { return; }
      var k = 3.6 / Math.max(w, 1), dx = (e.clientX - px) * k, dy = (e.clientY - py) * k, dt = Math.max(1, e.timeStamp - pt) / 1000;
      px = e.clientX; py = e.clientY; pt = e.timeStamp;
      ay += dx; tilt = clamp(tilt - dy, -1.45, 1.45);
      vy = vy * 0.6 + (dx / dt) * 0.4; vp = vp * 0.6 - (dy / dt) * 0.4;
    });
    function release(e) {
      if (!dragging) { return; }
      dragging = false; cv.classList.remove('dragging');
      if (e.timeStamp - pt > 90 || reduceMQ.matches) { vy = auto(); vp = 0; }   // let go while still: no fling
      vy = clamp(vy, -6, 6); vp = clamp(vp, -6, 6);
      start();
    }
    cv.addEventListener('pointerup', release);
    cv.addEventListener('pointercancel', release);
    cv.addEventListener('keydown', function (e) {
      var s = 0.14, used = true;
      if (e.key === 'ArrowLeft') { ay -= s; } else if (e.key === 'ArrowRight') { ay += s; }
      else if (e.key === 'ArrowUp') { tilt = clamp(tilt + s, -1.45, 1.45); } else if (e.key === 'ArrowDown') { tilt = clamp(tilt - s, -1.45, 1.45); }
      else { used = false; }
      if (used) { e.preventDefault(); hintOff(); start(); }
    });
    root.classList.add('surface-ok'); // show the canvas first, so it can be measured
    size(); draw(0);
    window.addEventListener('resize', function () { size(); draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) { start(); } else { stop(); } }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });
    if (reduceMQ.addEventListener) { reduceMQ.addEventListener('change', function () { vy = auto(); start(); }); }
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


  /* ---------- 2b. Words: headings arrive word by word; one paragraph lights up as you scroll ---------- */
  function splitWords(el, cls) {
    var text = el.textContent.replace(/\s+/g, ' ').trim(), words = text.split(' ');
    el.setAttribute('aria-label', text);
    el.textContent = '';
    words.forEach(function (word, i) {
      var s = document.createElement('span');
      s.className = cls; s.style.setProperty('--wi', i); s.setAttribute('aria-hidden', 'true'); s.textContent = word;
      el.appendChild(s);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
    });
    return $$('.' + cls, el);
  }
  var scrubs = [];
  function initScrub(el) { scrubs.push({ el: el, words: splitWords(el, 'sw') }); }
  function updateScrub(vh) {
    scrubs.forEach(function (s) {
      var r = s.el.getBoundingClientRect(), n = s.words.length;
      var p = clamp((vh * 0.88 - r.top) / (vh * 0.42 + r.height), 0, 1) * (n + 3);
      s.words.forEach(function (w, i) { w.style.opacity = (0.22 + 0.78 * clamp(p - i, 0, 1)).toFixed(2); });
    });
  }

  /* ---------- 2c. Closing waves: slow drift, and they react a little to scroll ---------- */
  var waveCfg = [], waveRun = false, waveRaf = 0, waveT0 = 0;
  function waveD(base, amp, f, ph) {
    var a = [], i, x, n = 120, TAU = Math.PI * 2;
    for (i = 0; i <= n; i++) {
      x = i / n;
      a.push((x * 1000).toFixed(0) + ' ' + (base + amp * Math.sin(x * TAU * f + ph) + 0.6 * amp * Math.sin(x * TAU * f * 2.3 + ph * 1.7)).toFixed(0));
    }
    return 'M' + a.join('L');
  }
  function waveTick(ts) {
    if (!waveRun) { return; }
    var t = (ts - waveT0) / 1000, y = window.pageYOffset;
    waveCfg.forEach(function (c, i) {
      var amp = c.amp * (1 + 0.14 * Math.sin(t * 0.5 + i));
      c.el.setAttribute('d', waveD(c.base, amp, c.f, c.ph + t * c.sp + y * 0.0012 * (1 + i * 0.3)));
    });
    waveRaf = requestAnimationFrame(waveTick);
  }
  function initWaves() {
    var host = $('.final');
    waveCfg = $$('.horizon path').map(function (p, i) {
      return { el: p, base: +p.getAttribute('data-base'), amp: +p.getAttribute('data-amp'), f: +p.getAttribute('data-f'), ph: +p.getAttribute('data-ph'), sp: (0.16 + i * 0.05) * (i % 2 ? -1 : 1) };
    });
    if (!host || !waveCfg.length || reduceMQ.matches || !('IntersectionObserver' in window)) { return; }
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !document.hidden) { if (!waveRun) { waveRun = true; waveT0 = performance.now(); waveRaf = requestAnimationFrame(waveTick); } }
      else { waveRun = false; cancelAnimationFrame(waveRaf); }
    }, { rootMargin: '120px' }).observe(host);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { waveRun = false; cancelAnimationFrame(waveRaf); } });
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
      ribbon.style.strokeDashoffset = (1 - clamp((y + vh * 0.5) / (total - vh * 0.5), 0, 1)).toFixed(4);
    }
    updateScrub(vh);
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
    $$('.split').forEach(function (h) { splitWords(h, 'wi'); });
    if (!reduceMQ.matches) { $$('.scrub').forEach(initScrub); }
    initWaves();
    if (epsSection) { initEps(epsSection); }
    if (ribbon && !reduceMQ.matches) { ribbon.style.strokeDashoffset = '1'; }
    var items = $$('.reveal, .split, .observe');
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
