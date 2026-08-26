/* ==========================================================================
   PRODERMA PLUS — WOW sloj (vanilla, bez zavisnosti)
   Nadogradnja na app.js. Svaki efekat je nezavisan IIFE — ako jedan padne,
   ostali rade. Sve gasi prefers-reduced-motion i pointer:coarse gde treba.
   ========================================================================== */
(function () {
'use strict';

var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine   = window.matchMedia('(pointer: fine)').matches;

/* ======================================================================
   1. AURORA — tečni WebGL preliv iza sadržaja
   Fragment shader sa tri sloja simpleks-šuma. Boje se čitaju iz CSS
   varijabli pa se menjaju zajedno sa paletom.
   ====================================================================== */
(function aurora() {
  if (reduce) return;
  var cv = document.createElement('canvas');
  cv.id = 'aurora'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);

  var gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) { cv.remove(); return; }

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'uniform vec2 res; uniform float t;',
    'uniform vec3 cA, cB, cC, base;',
    'vec2 h(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));',
    ' return -1.+2.*fract(sin(p)*43758.5453123);}',
    'float n(vec2 p){const float K1=.366025404,K2=.211324865;',
    ' vec2 i=floor(p+(p.x+p.y)*K1); vec2 a=p-i+(i.x+i.y)*K2;',
    ' float m=step(a.y,a.x); vec2 o=vec2(m,1.-m);',
    ' vec2 b=a-o+K2, c=a-1.+2.*K2;',
    ' vec3 w=max(.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.);',
    ' vec3 nn=w*w*w*w*vec3(dot(a,h(i)),dot(b,h(i+o)),dot(c,h(i+1.)));',
    ' return dot(nn,vec3(70.));}',
    'float fbm(vec2 p){float v=0.,a=.5;',
    ' for(int i=0;i<4;i++){v+=a*n(p); p*=2.02; a*=.5;} return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/res.xy;',
    ' vec2 q=vec2(uv.x*(res.x/res.y),uv.y);',
    ' float s=t*.045;',
    ' float f1=fbm(q*1.7+vec2(s,s*.6));',
    ' float f2=fbm(q*2.3+vec2(-s*.8,s*1.1)+f1*.6);',
    ' float f3=fbm(q*1.2+vec2(s*.5,-s*.7)+f2*.4);',
    ' vec3 col=base;',
    ' col=mix(col,cA,smoothstep(-.15,.75,f1)*.85);',
    ' col=mix(col,cB,smoothstep(-.1,.8,f2)*.6);',
    ' col=mix(col,cC,smoothstep(.05,.85,f3)*.5);',
    ' float vig=smoothstep(1.25,.15,length(uv-.5));',
    ' float top=smoothstep(1.0,.05,uv.y);',
    ' gl_FragColor=vec4(col, (.55+.35*vig)*(.35+.65*top));',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { cv.remove(); return; }
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't');
  var uA = gl.getUniformLocation(pr, 'cA'), uB = gl.getUniformLocation(pr, 'cB');
  var uC = gl.getUniformLocation(pr, 'cC'), uBase = gl.getUniformLocation(pr, 'base');

  function hex2rgb(h) {
    h = (h || '').trim().replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var v = parseInt(h, 16);
    if (isNaN(v)) return [1, 1, 1];
    return [((v>>16)&255)/255, ((v>>8)&255)/255, (v&255)/255];
  }
  function pushColors() {
    var cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(uA, hex2rgb(cs.getPropertyValue('--glow-a')));
    gl.uniform3fv(uB, hex2rgb(cs.getPropertyValue('--glow-b')));
    gl.uniform3fv(uC, hex2rgb(cs.getPropertyValue('--glow-c')));
    gl.uniform3fv(uBase, hex2rgb(cs.getPropertyValue('--ivory') || '#FDFBF7'));
  }
  pushColors();
  // paleta se menja uživo -> osveži boje
  new MutationObserver(pushColors).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-palette'] });

  function size() {
    var dpr = 1;   // pun dpr na 4K shaderu jede GPU bez vidljive razlike
    cv.width  = Math.floor(innerWidth  * dpr);
    cv.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(uRes, cv.width, cv.height);
  }
  size();
  addEventListener('resize', size, { passive: true });

  var t0 = performance.now(), vis = true, raf;
  document.addEventListener('visibilitychange', function () {
    vis = !document.hidden;
    if (vis) { t0 = performance.now() - last * 1000; raf = requestAnimationFrame(draw); }
    else cancelAnimationFrame(raf);
  });
  var last = 0;
  var prev = 0;
  function draw(now) {
    if (vis) raf = requestAnimationFrame(draw);
    if (now - prev < 33) return;        // ~30fps je dovoljno za spor preliv
    prev = now;
    last = (now - t0) / 1000;
    gl.uniform1f(uT, last);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  raf = requestAnimationFrame(draw);
  setTimeout(function () { cv.classList.add('on'); }, 120);
})();

/* ======================================================================
   2. INERCIJALNI SKROL — "lenis" logika u 30 linija
   Transform na wrapperu bi razbio sticky/fixed, pa se umesto toga
   interpolira sam scrollTop. Radi samo na mišu; touch ostaje nativan.
   ====================================================================== */
(function smooth() {
  if (reduce || !fine) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // CSS `scroll-behavior: smooth` bi se tuklo sa ovim easingom -> gasi se.
  // Kotve dobijaju sopstveni tween kroz isti `target`, pa ništa ne gubimo.
  var root = document.documentElement;
  root.style.scrollBehavior = 'auto';

  var target = window.scrollY, cur = target, running = false;
  var EASE = 0.20;

  function max() { return root.scrollHeight - window.innerHeight; }
  function clamp(v) { return Math.max(0, Math.min(max(), v)); }

  function loop() {
    var d = target - cur;
    if (Math.abs(d) < 0.35) {
      cur = target; running = false;
      window.scrollTo(0, cur);
      return;
    }
    cur += d * EASE;
    window.scrollTo(0, cur);
    requestAnimationFrame(loop);
  }
  function kick() {
    if (running) return;
    running = true; cur = window.scrollY;
    requestAnimationFrame(loop);
  }

  addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;                                   // zoom
    if (e.target.closest && e.target.closest('[data-noscroll],.ba,select,textarea,.mobile-menu')) return;
    e.preventDefault();
    target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 28 : 1));
    kick();
  }, { passive: false });

  // kotve: #hash linkovi idu kroz isti tween
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    var head = document.querySelector('.site-header');
    var off  = head ? head.getBoundingClientRect().height + 18 : 24;
    target = clamp(el.getBoundingClientRect().top + window.scrollY - off);
    kick();
    history.replaceState(null, '', id);
  }, true);

  // spoljni skrol (tastatura, scrollbar, touch) -> uskladi cilj
  addEventListener('keydown', function () { target = window.scrollY; running = false; }, { passive: true });
  addEventListener('mousedown', function () { target = window.scrollY; running = false; }, { passive: true });
  addEventListener('touchstart', function () { target = window.scrollY; running = false; }, { passive: true });
  addEventListener('resize', function () { target = clamp(window.scrollY); }, { passive: true });
})();

/* ======================================================================
   3. PAGE TRANSITION — zavesa pri prelasku na drugu stranicu
   ====================================================================== */
(function pageTransition() {
  var veil = document.createElement('div');
  veil.className = 'pt-veil';
  veil.innerHTML = '<i>PRODERMA PLUS</i>';
  document.body.appendChild(veil);

  // ulazna animacija (zavesa se povlači naviše)
  requestAnimationFrame(function () {
    if (sessionStorage.getItem('pp-nav') === '1') {
      veil.classList.add('up');
      requestAnimationFrame(function () {
        veil.classList.remove('up');
        veil.classList.add('down');
        setTimeout(function () { veil.className = 'pt-veil'; }, 700);
      });
      sessionStorage.removeItem('pp-nav');
    }
  });

  if (reduce) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#' || a.target === '_blank' ||
        /^(mailto:|tel:|javascript:)/.test(href)) return;
    if (a.host && a.host !== location.host) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    sessionStorage.setItem('pp-nav', '1');
    veil.classList.add('up');
    setTimeout(function () { location.href = href; }, 560);
  });
})();

/* ======================================================================
   4. CLICK SPARK — varnice na klik
   ====================================================================== */
(function clickSpark() {
  if (reduce || !fine) return;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    var n = 9;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var s = document.createElement('i');
        s.className = 'spark';
        var a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        var d = 22 + Math.random() * 30;
        s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
        document.body.appendChild(s);
        s.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + Math.cos(a) * d + 'px), calc(-50% + ' +
                       Math.sin(a) * d + 'px)) scale(0)', opacity: 0 }
        ], { duration: 460 + Math.random() * 220, easing: 'cubic-bezier(.2,.9,.25,1)' })
         .onfinish = function () { s.remove(); };
      })(i);
    }
  });
})();

/* ======================================================================
   5. FLOWING MENU — slika usluge prati kursor nad redom
   ====================================================================== */
(function flowingMenu() {
  var list = $('.svc-list');
  if (!list || reduce || !fine) return;

  var fol = document.createElement('div');
  fol.className = 'sr-follow';
  fol.innerHTML = '<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">';
  document.body.appendChild(fol);
  var img = fol.querySelector('img');

  var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = null;

  function loop() {
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    fol.style.left = cx + 'px'; fol.style.top = cy + 'px';
    if (on || Math.abs(tx - cx) > 0.5) raf = requestAnimationFrame(loop);
    else raf = null;
  }

  $$('.svc-row', list).forEach(function (row) {
    var src = (row.querySelector('.sr-img') || {}).src;
    var title = (row.querySelector('.sr-t') || {}).textContent || '';

    row.addEventListener('mouseenter', function (e) {
      if (!src) return;
      img.src = src;
      fol.dataset.label = title;
      tx = e.clientX; ty = e.clientY;
      if (!on) { cx = tx; cy = ty + 40; }
      on = true;
      fol.classList.add('on');
      list.classList.add('flowing');
      row.classList.add('flow-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    row.addEventListener('mouseleave', function () {
      on = false;
      fol.classList.remove('on');
      list.classList.remove('flowing');
      row.classList.remove('flow-on');
    });
  });
})();

/* ======================================================================
   6. TILT + GLARE — kartice tima
   ====================================================================== */
(function tiltCards() {
  if (reduce || !fine) return;
  $$('.tm').forEach(function (card) {
    var g = document.createElement('span');
    g.className = 'tm-glare'; g.setAttribute('aria-hidden', 'true');
    card.appendChild(g);
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.transform =
        'perspective(900px) rotateX(' + ((0.5 - py) * 9).toFixed(2) + 'deg) rotateY(' +
        ((px - 0.5) * 11).toFixed(2) + 'deg) translateZ(10px) scale(1.02)';
      g.style.setProperty('--gx', (px * 100) + '%');
      g.style.setProperty('--gy', (py * 100) + '%');
    });
    card.addEventListener('mouseleave', function () {
      card.classList.remove('tilting');
      card.style.transform = '';
    });
  });
})();

/* ======================================================================
   7. BEFORE / AFTER — drag slider + tabovi
   ====================================================================== */
(function beforeAfter() {
  var ba = $('.ba');
  if (!ba) return;

  function set(pct) {
    pct = Math.max(0, Math.min(100, pct));
    ba.style.setProperty('--pos', pct + '%');
    ba.setAttribute('aria-valuenow', Math.round(pct));
  }
  function fromEvent(e) {
    var r = ba.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    set((x / r.width) * 100);
  }

  var down = false;
  ba.addEventListener('pointerdown', function (e) {
    down = true; ba.classList.add('dragging');
    ba.setPointerCapture && ba.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  ba.addEventListener('pointermove', function (e) { if (down) fromEvent(e); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    ba.addEventListener(ev, function () { down = false; ba.classList.remove('dragging'); });
  });
  // hover-scrub bez klika — deluje "živo" na demou
  ba.addEventListener('mousemove', function (e) { if (!down && fine) fromEvent(e); });

  // tastatura
  ba.setAttribute('tabindex', '0');
  ba.setAttribute('role', 'slider');
  ba.setAttribute('aria-label', 'Poređenje pre i posle tretmana');
  ba.setAttribute('aria-valuemin', '0'); ba.setAttribute('aria-valuemax', '100');
  ba.addEventListener('keydown', function (e) {
    var cur = parseFloat(ba.style.getPropertyValue('--pos')) || 50;
    if (e.key === 'ArrowLeft')  { set(cur - 4); e.preventDefault(); }
    if (e.key === 'ArrowRight') { set(cur + 4); e.preventDefault(); }
  });

  // tabovi
  var imgB = $('.ba-before', ba), imgA = $('.ba-after', ba);
  $$('.ba-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.ba-tab').forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
      tab.setAttribute('aria-selected', 'true');
      var src = tab.dataset.img;
      // src se menja odmah; fade radi CSS tranzicija. Oslanjanje na
      // Animation.onfinish bi zakazalo u pozadinskom tabu (WAAPI stane).
      [imgB, imgA].forEach(function (im) {
        im.style.opacity = '0';
        var swap = function () {
          im.removeEventListener('load', swap);
          requestAnimationFrame(function () { im.style.opacity = '1'; });
        };
        im.addEventListener('load', swap);
        im.src = src;
        if (im.complete) swap();                       // već keširana
        setTimeout(function () { im.style.opacity = '1'; }, 400);   // sigurnosna mreža
      });
      set(50);
    });
  });

  // uvodna animacija kad sekcija uđe u vidno polje
  new IntersectionObserver(function (es, o) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      o.unobserve(en.target);
      if (reduce) { set(50); return; }
      var s = performance.now();
      (function sweep(now) {
        var p = Math.min((now - s) / 1400, 1);
        var e2 = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        set(18 + e2 * 64);
        if (p < 1) requestAnimationFrame(sweep); else set(50);
      })(s);
    });
  }, { threshold: 0.35 }).observe(ba);
})();



/* ======================================================================
   10. NAV PILL — pozadina koja klizi ispod aktivnog linka
   ====================================================================== */
(function navPill() {
  var ul = $('.nav-links');
  if (!ul || reduce || !fine) return;
  var pill = document.createElement('span');
  pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true');
  ul.appendChild(pill);

  function move(a) {
    var r = a.getBoundingClientRect(), pr = ul.getBoundingClientRect();
    pill.style.width  = r.width + 10 + 'px';
    pill.style.height = r.height + 10 + 'px';
    pill.style.transform = 'translate(' + (r.left - pr.left - 5) + 'px,' +
                                          (r.top - pr.top - 5) + 'px)';
    pill.style.opacity = '1';
  }
  $$('a', ul).forEach(function (a) {
    a.addEventListener('mouseenter', function () { move(a); });
    a.addEventListener('focus', function () { move(a); });
  });
  ul.addEventListener('mouseleave', function () { pill.style.opacity = '0'; });
})();


/* ======================================================================
   12. STICKY CTA (mobilni) — pojavi se posle heroja
   ====================================================================== */
(function mobileCta() {
  var bar = $('.mcta');
  if (!bar) return;
  var hero = $('#hero');
  if (!hero) { bar.classList.add('on'); return; }

  function sync() {
    var r = hero.getBoundingClientRect();
    bar.classList.toggle('on', r.bottom < window.innerHeight * 0.2);
  }
  // dva nezavisna okidača: observer je jeftin, scroll je siguran
  new IntersectionObserver(function () { sync(); }, { threshold: [0, 0.15, 1] }).observe(hero);
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync, { passive: true });
  sync();
})();

/* ======================================================================
   13. STAR BORDER — primarnim CTA dugmadima
   ====================================================================== */
(function starBorder() {
  $$('.btn:not(.btn--ghost)').forEach(function (b) { b.classList.add('btn--star'); });
})();


/* ======================================================================
   15. PUT PACIJENTA — vizual prati aktivan korak
   Vizual je CSS-om pinovan; JS samo bira koja je slika aktivna na osnovu
   toga koji je korak najbliži sredini ekrana.
   ====================================================================== */
(function journey() {
  var sec = $('#put');
  if (!sec) return;
  var steps = $$('.jr-step', sec);
  var shots = $$('.jr-stage img', sec);
  var nEl = $('[data-jr-num]', sec), tEl = $('[data-jr-title]', sec);
  if (!steps.length) return;

  var active = -1;
  function sync() {
    // van kadra se ne računa ništa — jedan rect je jeftiniji od IO stanja
    // koje ume da ostane "ugašeno" ako observer zakasni
    var sr = sec.getBoundingClientRect();
    if (sr.bottom < -100 || sr.top > window.innerHeight + 100) return;
    // "poslednji korak koji je prešao liniju čitanja", a ne "najbliži njoj":
    // po sredini je prvi korak (kraći od ostalih) trajao trećinu koliko i
    // ostali, pa se prva slika smenjivala prebrzo. Ovako svaki korak drži
    // tačno svoju visinu.
    var line = window.innerHeight * 0.62, best = 0;
    steps.forEach(function (st, i) {
      if (st.getBoundingClientRect().top <= line) best = i;
    });
    if (best === active) return;
    active = best;
    steps.forEach(function (st, i) { st.classList.toggle('on', i === best); });
    shots.forEach(function (im, i) { im.classList.toggle('on', i === best); });
    if (nEl) nEl.textContent = 'Korak 0' + (best + 1);
    if (tEl) tEl.textContent = (steps[best].querySelector('h3') || {}).textContent || '';
  }
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync, { passive: true });
  sync();
})();

/* ======================================================================
   16. TEHNOLOGIJA — horizontalni skrol vezan za vertikalni
   Sekcija je visoka onoliko koliko traka treba da otputuje. Viewport se
   pinuje, traka se pomera po napretku kroz sekciju.
   ====================================================================== */
(function techScroll() {
  var sec = $('[data-tech]');
  if (!sec) return;
  var track = $('.tech-track', sec);
  var bar   = $('.tech-progress i', sec);
  if (!track) return;

  var wide = window.matchMedia('(min-width: 940px)');
  var dist = 0;

  function measure() {
    if (!wide.matches || reduce) {
      sec.style.height = '';
      track.style.transform = '';
      return;
    }
    // koliko traka viri van ekrana = koliko treba da otputuje
    dist = Math.max(0, track.scrollWidth - window.innerWidth);
    // visina sekcije: jedan ekran (pin) + put trake, sa malo vazduha
    sec.style.height = (window.innerHeight + dist + 120) + 'px';
    sync();
  }

  function sync() {
    if (!wide.matches || reduce) return;
    var r = sec.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;   // van kadra
    var total = sec.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
    track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  }

  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', measure, { passive: true });
  wide.addEventListener ? wide.addEventListener('change', measure)
                        : wide.addListener(measure);
  // slike menjaju scrollWidth kad se učitaju
  addEventListener('load', measure);
  $$('img', track).forEach(function (im) {
    if (!im.complete) im.addEventListener('load', measure, { once: true });
  });
  measure();
})();

/* ======================================================================
   17. TIM — kartica sa biografijom mora da bude dohvatljiva tastaturom
   ====================================================================== */
(function teamFocus() {
  $$('.tm').forEach(function (card) {
    if (card.querySelector('.tm-bio') && !card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
  });
})();


/* ======================================================================
   SCROLL STACK — utisci (scroll-driven, bez stalne rAF petlje)
   ====================================================================== */
(function scrollStack() {
  var cards = $$('.rs-card');
  if (!cards.length || reduce) return;
  var queued = false;

  function apply() {
    queued = false;
    var top = parseFloat(getComputedStyle(cards[0]).top) || 120;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], r = c.getBoundingClientRect();
      var k = Math.min(Math.max(0, top - r.top) / 260, 1);
      c.style.transform = 'scale(' + (1 - k * 0.055).toFixed(3) + ')';
      c.style.opacity = (1 - k * 0.35).toFixed(2);
      c.style.zIndex = i;
    }
  }
  // van kadra se ne računa ništa — inače je 5 kartica × transform na
  // svakom skrolu sve do futera, što je pravilo seckanje
  var host = cards[0].closest('section') || cards[0].parentNode;

  function onScroll() {
    if (queued) return;
    var r = host.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    queued = true;
    requestAnimationFrame(apply);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
})();



/* ======================================================================
   18. NASLOV SLOVO PO SLOVO
   ====================================================================== */
(function letters() {
  var els = $$('.hero-h1 [data-letters]');
  if (!els.length) return;
  var i = 0;
  els.forEach(function (el) {
    var txt = el.textContent;
    el.textContent = '';
    txt.split('').forEach(function (ch) {
      var sp = document.createElement('span');
      sp.className = 'lt';
      sp.textContent = ch === ' ' ? '\u00A0' : ch;
      if (reduce) { sp.style.animation = 'none'; sp.style.opacity = '1'; }
      else sp.style.animationDelay = (0.45 + (i++) * 0.045).toFixed(3) + 's';
      el.appendChild(sp);
    });
  });
})();

/* ======================================================================
   19. TIM — klik otvara punu biografiju
   ====================================================================== */
(function teamModal() {
  var cards = $$('.tm');
  if (!cards.length) return;

  var modal = document.createElement('div');
  modal.className = 'bio-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML =
    '<div class="bio-back"></div>' +
    '<div class="bio-card">' +
      '<button class="bio-x" type="button" aria-label="Zatvori">&times;</button>' +
      '<div class="bio-ph"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></div>' +
      '<div class="bio-txt">' +
        '<h3></h3><span class="bio-role"></span><p></p>' +
        '<div class="bio-tags"></div>' +
        '<div class="bio-cta">' +
          '<a class="btn" href="#kontakt">Zaka&#382;i kod ovog lekara</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var mImg  = $('.bio-ph img', modal), mH = $('h3', modal),
      mRole = $('.bio-role', modal),   mP = $('.bio-txt p', modal),
      mTags = $('.bio-tags', modal);
  var lastFocus = null;

  function open(card) {
    var img  = card.querySelector('.tm-ph img');
    var name = (card.querySelector('h3') || {}).textContent || '';
    var role = (card.querySelector('figcaption > span') || {}).textContent || '';
    var bio  = (card.querySelector('.tm-bio p') || {}).textContent || '';
    var tags = $$('.tm-cred span', card).map(function (t) { return t.textContent; });

    if (img) { mImg.src = img.src; mImg.alt = name; }
    mH.textContent = name;
    mRole.textContent = role;
    mP.textContent = bio;
    mTags.innerHTML = tags.map(function (t) { return '<span>' + t + '</span>'; }).join('');

    lastFocus = document.activeElement;
    modal.classList.add('on');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.bio-x', modal).focus();
  }
  function close() {
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { open(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });
  $('.bio-back', modal).addEventListener('click', close);
  $('.bio-x', modal).addEventListener('click', close);
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('on')) close();
  });
  // CTA vodi na kontakt -> zatvori modal pa pusti skrol
  $('.bio-cta a', modal).addEventListener('click', close);
})();


/* ======================================================================
   20. ŠIRINA ROTIRAJUĆE REČI U H1
   .rot je grid u kom sve varijante dele istu ćeliju, pa mu je širina
   uvek bila najduža varijanta. Red je zbog toga izgledao razvučen.
   Ovde se meri svaka reč i --rotw se animira ka aktivnoj.
   ====================================================================== */
(function rotWidth() {
  var rot = $('.hero h1 .rot');
  if (!rot) return;
  var words = $$('.rot-w', rot);
  if (!words.length) return;

  var widths = [];
  function measure() {
    // meri se van grida da ćelija ne nametne svoju širinu
    var probe = document.createElement('span');
    var cs = getComputedStyle(words[0]);
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
      'font:' + cs.font + ';font-style:' + cs.fontStyle + ';' +
      'letter-spacing:' + cs.letterSpacing;
    document.body.appendChild(probe);
    widths = words.map(function (w) {
      probe.textContent = w.textContent;
      return Math.ceil(probe.getBoundingClientRect().width) + 2;
    });
    probe.remove();
    apply();
  }
  function apply() {
    var i = words.findIndex ? words.findIndex(function (w) { return w.classList.contains('on'); }) : -1;
    if (i < 0) { for (var j = 0; j < words.length; j++) if (words[j].classList.contains('on')) { i = j; break; } }
    if (i < 0 || !widths[i]) return;
    // inline width: CSS custom property nije probijala grid min-content
    rot.style.setProperty('--rotw', widths[i] + 'px');
    rot.style.width = widths[i] + 'px';
  }

  // fontovi menjaju metriku kad se učitaju
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  addEventListener('resize', measure, { passive: true });

  new MutationObserver(apply).observe(rot, {
    subtree: true, attributes: true, attributeFilter: ['class']
  });
})();
})();
