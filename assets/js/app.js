/* ==========================================================================
   PRODERMA PLUS — app.js
   Vanilla JS, bez zavisnosti. Sve je modularno (IIFE po celini) da bi se
   moglo 1:1 preneti u WordPress temu (wp_enqueue_script).
   ========================================================================== */
(function () {
'use strict';

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

/* ======================================================================
   1. PRELOADER
   ====================================================================== */
window.addEventListener('load', function () {
  var pl = $('#preloader');
  setTimeout(function () {
    if (pl) pl.classList.add('done');
    var hero = $('#hero');
    if (hero) hero.classList.add('ready');
  }, 420);
});
// bezbednosni fallback ako "load" nikad ne okine (spor CDN)
setTimeout(function () {
  var pl = $('#preloader');
  if (pl && !pl.classList.contains('done')) { pl.classList.add('done'); }
  var hero = $('#hero'); if (hero) hero.classList.add('ready');
}, 3500);

/* ======================================================================
   2. ANIMIRANA MESH POZADINA (canvas)
   ====================================================================== */
(function mesh() {
  return;   /* ISKLJUČENO: aurora je preuzela pozadinu; dva canvasa su trošila GPU bez razlike */
  var cv = $('#mesh');
  if (!cv || reduceMotion) return;
  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  var W = 0, H = 0, blobs = [], colors = [];
  var t = 0, raf = null, visible = true;

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors = ['--glow-a', '--glow-b', '--glow-c', '--brand-soft'].map(function (v) {
      return (cs.getPropertyValue(v) || '#9ccfc9').trim();
    });
    blobs.forEach(function (b, i) { b.c = colors[i % colors.length]; });
  }

  function resize() {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    var n = window.innerWidth < 760 ? 4 : 6;
    blobs = [];
    for (var i = 0; i < n; i++) {
      blobs.push({
        x: Math.random(), y: Math.random(),
        r: 0.24 + Math.random() * 0.26,
        sx: (Math.random() - 0.5) * 0.00016,
        sy: (Math.random() - 0.5) * 0.00016,
        ph: Math.random() * Math.PI * 2,
        c: '#9ccfc9'
      });
    }
    readColors();
  }

  function hexToRgba(hex, a) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(hex, 16);
    if (isNaN(n)) return 'rgba(150,200,195,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function draw() {
    t += 1;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      b.x += b.sx; b.y += b.sy;
      if (b.x < -0.25 || b.x > 1.25) b.sx *= -1;
      if (b.y < -0.25 || b.y > 1.25) b.sy *= -1;
      var wob = Math.sin(t * 0.0035 + b.ph) * 0.045;
      var cx = (b.x + wob) * W, cy = (b.y - wob * 0.6) * H;
      var rr = (b.r + wob * 0.4) * Math.max(W, H);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, hexToRgba(b.c, 0.58));
      g.addColorStop(0.5, hexToRgba(b.c, 0.20));
      g.addColorStop(1, hexToRgba(b.c, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
    }
    if (visible) raf = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible && !raf) raf = requestAnimationFrame(draw);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
  });

  window.addEventListener('resize', function () { resize(); }, { passive: true });
  document.addEventListener('palettechange', readColors);

  resize(); build(); raf = requestAnimationFrame(draw);
})();

/* ======================================================================
   2b. ČESTICE PREKO CELOG SAJTA — sitne pastelne tačke koje sporo plutaju
   naviše. Kontejner je position:fixed pa efekat "prati" ceo skrol, ne
   samo hero. JS samo generiše elemente jednom; animacija je čist CSS.
   ====================================================================== */
(function dust() {
  return;   /* ISKLJUČENO: tačkice nisu doprinosile, a rAF je radio non-stop */
  var host = $('#dust');
  if (!host || reduceMotion) return;
  var n = window.innerWidth < 760 ? 22 : 46;
  var cs = getComputedStyle(document.documentElement);
  var tones = ['--brand-soft', '--accent-soft', '--glow-a', '--glow-c']
    .map(function (v) { return (cs.getPropertyValue(v) || '#E9C7D1').trim(); });
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    var s = document.createElement('i');
    var dur = (16 + Math.random() * 20).toFixed(1);
    s.style.left = (Math.random() * 100).toFixed(1) + '%';
    s.style.setProperty('--s', (3 + Math.random() * 6).toFixed(1) + 'px');
    s.style.setProperty('--d', dur + 's');
    s.style.setProperty('--dl', '-' + (Math.random() * dur).toFixed(1) + 's');
    s.style.setProperty('--dx', (Math.random() * 120 - 60).toFixed(0) + 'px');
    s.style.setProperty('--dc', tones[i % tones.length]);
    frag.appendChild(s);
  }
  host.appendChild(frag);
})();

/* ======================================================================
   2c. NASLOV — reveal po slovima + reč koja se smenjuje
   Tekst se seče na karaktere tek u JS-u, pa u HTML-u ostaje čitav i
   dostupan screen readerima i pretraživačima ako JS ne prođe.
   ====================================================================== */
(function heroHeadline() {
  // 2c-1. seci [data-split] na pojedinačna slova
  $$('[data-split]').forEach(function (el) {
    var txt = el.textContent;
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    for (var i = 0; i < txt.length; i++) {
      var c = document.createElement('span');
      c.className = 'ch' + (txt[i] === ' ' ? ' ch--sp' : '');
      c.textContent = txt[i] === ' ' ? ' ' : txt[i];
      c.style.setProperty('--i', i);
      c.setAttribute('aria-hidden', 'true');
      el.appendChild(c);
    }
  });

  // 2c-2. rotacija reči u naslovu
  var rot = $('#heroRot');
  if (!rot || reduceMotion) return;
  var words = $$('.rot-w', rot);
  if (words.length < 2) return;

  // Širina se zaključava na najdužu reč da se podvlaka ne trza pri svakoj
  // izmeni. Meri se stvarna širina teksta (grid deca su justify-self:start,
  // pa im je širina jednaka sadržaju, ne kontejneru).
  function lockWidth() {
    rot.style.minWidth = '';
    var max = 0;
    words.forEach(function (w) {
      max = Math.max(max, w.getBoundingClientRect().width);
    });
    if (max > 0) rot.style.minWidth = Math.ceil(max) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockWidth);
  else window.addEventListener('load', lockWidth);
  // font-size je clamp() po vw — širina se mora premeriti pri promeni prozora
  var rz = null;
  window.addEventListener('resize', function () {
    clearTimeout(rz); rz = setTimeout(lockWidth, 180);
  }, { passive: true });

  var idx = 0, timer = null;
  function step() {
    var cur = words[idx];
    idx = (idx + 1) % words.length;
    var nxt = words[idx];
    cur.classList.remove('on'); cur.classList.add('out');
    nxt.classList.remove('out'); nxt.classList.add('on');
    setTimeout(function () { cur.classList.remove('out'); }, 700);
  }
  function start() { if (!timer) timer = setInterval(step, 2600); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // ne troši ciklus dok je tab u pozadini
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
  setTimeout(start, 2200);
})();

/* ======================================================================
   2d. TRAKA NAPRETKA SKROLA
   ====================================================================== */
(function scrollBar() {
  var bar = $('#scrollBar');
  if (!bar || reduceMotion) return;
  var tick = false;
  function upd() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', h > 0 ? (window.scrollY / h).toFixed(4) : 0);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { tick = true; requestAnimationFrame(upd); }
  }, { passive: true });
  upd();
})();

/* ======================================================================
   2e. CITAT KOJI SE "ISPISUJE"
   Maske po redovima kreću tek kad citat uđe u kadar, i to samo jednom —
   da se ne ponavlja pri svakom prolasku skrolom.
   ====================================================================== */
(function handwriting() {
  var fig = $('#hwQuote');
  if (!fig) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    fig.classList.add('writing');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      fig.classList.add('writing');
      io.disconnect();
    });
  }, { threshold: 0.45 });
  io.observe(fig);
})();

/* ======================================================================
   2f. SPISAK USLUGA — klik na cenovnik
   Mišem se opis otvara preko :hover u CSS-u. Na dodir (RUNDA 8) kartice su
   sad UVEK ekspandovane (opis + dugme stalno vidljivi, bez tap-to-open
   koraka), pa klik/tastatura vode direktno na cenovnik i na dodir isto
   kao mišem — više nema razloga za dvostepeni tap.
   ====================================================================== */
(function svcRows() {
  var rows = $$('.svc-row');
  if (!rows.length) return;

  function goToPrice(row) {
    var g = row.getAttribute('data-price-group');
    window.location.href = 'cenovnik.html' + (g ? ('?g=' + encodeURIComponent(g)) : '');
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { goToPrice(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        goToPrice(row);
      }
    });
  });
})();

/* ======================================================================
   2g. RADNO VREME — današnji dan i trenutni status
   Računa se po vremenu u Nišu, a ne po satu na uređaju posetioca —
   inače bi pacijent iz drugog vremenskog pojasa video netačan status.
   ====================================================================== */
(function hours() {
  var box = $('.hrs');
  if (!box) return;

  // Pon–Pet 14–20, Sub 10–14, Ned zatvoreno. Indeks 0 = nedelja.
  var PLAN = [null, [14,20], [14,20], [14,20], [14,20], [14,20], [10,14]];
  var KLJUC = ['ned','pon-pet','pon-pet','pon-pet','pon-pet','pon-pet','sub'];
  var IMENA = ['u nedelju','u ponedeljak','u utorak','u sredu','u četvrtak','u petak','u subotu'];

  function uNisu() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit',
        minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var o = {};
      f.forEach(function (p) { o[p.type] = p.value; });
      var dani = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
      return { d: dani[o.weekday], h: parseInt(o.hour,10) + parseInt(o.minute,10)/60 };
    } catch (e) {
      var n = new Date();                     // rezerva: lokalno vreme
      return { d: n.getDay(), h: n.getHours() + n.getMinutes()/60 };
    }
  }

  function osveži() {
    var t = uNisu();
    if (t.d == null || isNaN(t.h)) return;

    $$('.hrs-r').forEach(function (r) {
      r.classList.toggle('is-today', r.getAttribute('data-day') === KLJUC[t.d]);
    });

    var el = $('#hrsNow');
    if (!el) return;
    var danas = PLAN[t.d], otvoreno = !!danas && t.h >= danas[0] && t.h < danas[1];
    var txt;

    if (otvoreno) {
      txt = 'Otvoreno &middot; do ' + String(danas[1]).padStart(2,'0') + ':00';
    } else {
      // pronađi prvi naredni dan sa radnim vremenom
      var i = (danas && t.h < danas[0]) ? 0 : 1;
      for (; i <= 7; i++) {
        var d = (t.d + i) % 7;
        if (PLAN[d]) {
          var kada = (i === 0) ? 'danas' : (i === 1 ? 'sutra' : IMENA[d]);
          txt = 'Zatvoreno &middot; otvara se ' + kada + ' u ' +
                String(PLAN[d][0]).padStart(2,'0') + ':00';
          break;
        }
      }
    }
    el.querySelector('span').innerHTML = txt;
    el.classList.toggle('is-open', otvoreno);
    el.hidden = false;
  }

  osveži();
  setInterval(osveži, 60000);
})();

/* ======================================================================
   3. SVETLO KOJE PRATI KURSOR
   ====================================================================== */
(function cursor() {
  return;   /* ISKLJUČENO: kursor-tačka izbačena na zahtev klijenta */
  var glow = $('#cursorGlow'), dot = $('#cursorDot');
  if (!glow || !dot || reduceMotion) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  var tx = gx, ty = gy, dx = gx, dy = gy;
  var on = false;

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!on) { on = true; glow.classList.add('on'); dot.classList.add('on'); gx = tx; gy = ty; }
  }, { passive: true });

  window.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget) { glow.classList.remove('on'); dot.classList.remove('on'); on = false; }
  });

  // uvećanje nad interaktivnim elementima
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest ? e.target.closest('a,button,[data-spot],.ab,.tm,.price-row') : null;
    dot.classList.toggle('grow', !!el);
  });

  (function loop() {
    gx += (tx - gx) * 0.075;  // sporo, "svetlo"
    gy += (ty - gy) * 0.075;
    dx += (tx - dx) * 0.30;   // brzo, "tačka"
    dy += (ty - dy) * 0.30;
    glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
    dot.style.transform  = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
    requestAnimationFrame(loop);
  })();
})();

/* ======================================================================
   4. HEADER + MOBILNI MENI
   ====================================================================== */
(function header() {
  var h = $('#header'), b = $('#burger'), m = $('#mobileMenu'), mc = $('#mmClose');
  var onScroll = function () { if (h) h.classList.toggle('stuck', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (b && m) {
    function closeMenu() {
      m.classList.remove('open'); b.classList.remove('open');
      b.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    }
    b.addEventListener('click', function () {
      var open = m.classList.toggle('open');
      b.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // dok je meni otvoren on svojim z-indexom (950) prekriva burger (900),
    // pa je pravo dugme za zatvaranje unutar samog menija (.mm-close)
    if (mc) mc.addEventListener('click', closeMenu);
    $$('a', m).forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
})();

/* ======================================================================
   5. SCROLL REVEAL
   ====================================================================== */
(function reveal() {
  var els = $$('[data-reveal],[data-reveal-group]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach(function (e) { e.classList.add('in'); }); return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

/* ======================================================================
   6. BROJAČI
   ====================================================================== */
(function counters() {
  var els = $$('[data-count]');
  if (!els.length) return;
  var run = function (el) {
    if (el.hasAttribute('data-plain')) { el.textContent = el.getAttribute('data-count'); return; }
    var to = parseFloat(el.getAttribute('data-count')) || 0;
    var suf = el.getAttribute('data-suffix') || '';
    var dur = 1400, st = null;
    function step(ts) {
      if (!st) st = ts;
      var p = Math.min((ts - st) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(run); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
  }, { threshold: 0.5 });
  els.forEach(function (e) { io.observe(e); });
})();

/* ======================================================================
   7. HERO SLAJDER
   ====================================================================== */
(function heroSlider() {
  var frame = $('#heroFrame'); if (!frame) return;
  var slides = $$('.hs', frame), dots = $$('#heroDots i'), i = 0;
  var caps = [
    ['Savremena oprema', 'Dijagnostika koja prati svetske trendove'],
    ['Prijatan prostor', 'Izolovan od gradske gužve, nadomak centra Niša'],
    ['Stručan tim', 'Tri profesora dermatovenerologije pod jednim krovom']
  ];
  var cT = $('#heroCapT'), cS = $('#heroCapS');
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    if (cT) cT.textContent = caps[i][0];
    if (cS) cS.textContent = caps[i][1];
  }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  if (!reduceMotion) setInterval(function () { go(i + 1); }, 6000);
})();

/* ======================================================================
   8. TILT + MAGNETIC + SPOTLIGHT
   ====================================================================== */
(function interactions() {
  if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

  // tilt
  $$('[data-tilt]').forEach(function (el) {
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(1100px) rotateY(' + (px * 6) + 'deg) rotateX(' + (-py * 6) + 'deg)';
      el.style.transition = 'transform .12s linear';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
    });
  });

  // magnetic dugmad
  $$('[data-magnetic]').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
      el.style.transform = 'translate(' + ((x - r.width / 2) * 0.12) + 'px,' + ((y - r.height / 2) * 0.18 - 2) + 'px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });

  // spotlight na karticama
  $$('[data-spot]').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ======================================================================
   9. TABOVI (O nama + Skin Lab)
   ====================================================================== */
(function tabs() {
  var aboutMobile = window.matchMedia('(max-width: 760px)');
  if (aboutMobile.matches) {
    // na mobilnom nijedna stavka nije otvorena dok korisnik ne klikne
    $$('[data-atab]').forEach(function (x) { x.classList.remove('on'); });
    $$('[data-apanel]').forEach(function (p) { p.classList.remove('on'); });
  }
  $$('[data-atab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = b.getAttribute('data-atab');
      if (aboutMobile.matches) {
        // pravi accordion na mobilnom: klik na već otvorenu stavku je
        // zatvara; klik na drugu otvara nju i zatvara ostale
        var panel = document.querySelector('[data-apanel="' + n + '"]');
        var wasOn = b.classList.contains('on');
        $$('[data-atab]').forEach(function (x) { x.classList.remove('on'); });
        $$('[data-apanel]').forEach(function (p) { p.classList.remove('on'); });
        if (!wasOn) { b.classList.add('on'); if (panel) panel.classList.add('on'); }
        return;
      }
      $$('[data-atab]').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('[data-apanel]').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-apanel') === n); });
    });
  });
  $$('[data-lab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = b.getAttribute('data-lab');
      $$('[data-lab]').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('[data-labp]').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-labp') === n); });
    });
  });
})();

/* ======================================================================
   10. UV VIDŽET  (Open-Meteo — bez API ključa)
   ====================================================================== */
var UV = (function () {
  var NIS = { lat: 43.3209, lon: 21.8958, name: 'Niš, Srbija' };
  var state = { uv: null, peak: null, peakH: null, type: 2, hourly: [], loc: NIS.name };

  // Minimalna eritemska doza (J/m²) po Fitzpatrick fototipu — standardne vrednosti
  var MED = { 1: 200, 2: 250, 3: 350, 4: 450, 5: 600, 6: 1000 };

  var LEVELS = [
    { max: 2.5,  n: 'Nizak',        c: '#DCEFE0', fg: '#3E6B4A', arc: '#7FB98D' },
    { max: 5.5,  n: 'Umeren',       c: '#FBF0D3', fg: '#8A6A1E', arc: '#DFBB55' },
    { max: 7.5,  n: 'Visok',        c: '#FCE3D0', fg: '#9A5824', arc: '#E39258' },
    { max: 10.5, n: 'Vrlo visok',   c: '#FBD9D5', fg: '#9E403A', arc: '#DD7A72' },
    { max: 99,   n: 'Ekstreman',    c: '#EEDFF3', fg: '#6C3E80', arc: '#A576BB' }
  ];

  function level(uv) {
    for (var i = 0; i < LEVELS.length; i++) if (uv <= LEVELS[i].max) return LEVELS[i];
    return LEVELS[LEVELS.length - 1];
  }

  function burnMinutes(uv, type) {
    if (!uv || uv <= 0.2) return null;
    return MED[type] / (uv * 1.5);
  }

  function fmtMin(m) {
    if (m === null) return '—';
    if (m > 300) return '> 5 h';
    if (m >= 60) { var h = Math.floor(m / 60), r = Math.round(m % 60); return h + ' h' + (r ? ' ' + r + ' min' : ''); }
    return Math.round(m) + ' min';
  }

  function spf(uv, type) {
    if (uv <= 2) return type <= 2 ? '30' : '15–30';
    if (uv <= 5) return type <= 2 ? '50' : '30';
    if (uv <= 7) return type <= 3 ? '50+' : '30–50';
    return '50+';
  }

  function advice(uv, type) {
    if (uv <= 2) return 'UV je nizak — zaštita nije neophodna za kratak boravak napolju. Dnevna krema sa SPF-om je i dalje najjeftinija anti-age investicija.';
    if (uv <= 5) return 'Umeren UV. U sredini dana potražite hlad, nosite naočare i nanesite zaštitu na lice, vrat i šake.';
    if (uv <= 7) return 'Visok UV. Zaštita je obavezna: SPF, šešir, naočare. Izbegavajte direktno sunce između 11 i 16 č.';
    if (uv <= 10) return 'Vrlo visok UV. Koža bez zaštite reaguje brzo. Ostanite u hladu u sredini dana i ponavljajte SPF na svaka 2 sata.';
    return 'Ekstreman UV. Izbegavajte direktno sunce. Ako morate napolje — pokrijte kožu, SPF 50+ i ponavljanje na svakih 90 minuta.';
  }

  function render() {
    var uv = state.uv;
    var lv = level(uv || 0);
    var C = 2 * Math.PI * 82;      // 515.2
    var TRACK = 386;               // 75% kruga
    var frac = Math.min((uv || 0) / 11, 1);

    var arc = $('#uvArc');
    if (arc) { arc.setAttribute('stroke-dasharray', (TRACK * frac).toFixed(1) + ' ' + C.toFixed(1)); arc.style.stroke = lv.arc; }

    var v = $('#uvVal'); if (v) v.textContent = uv === null ? '–' : (Math.round(uv * 10) / 10);
    var l = $('#uvLevel');
    if (l) { l.textContent = uv === null ? 'Podatak nedostupan' : lv.n; l.style.setProperty('--uv-c', lv.c); l.style.setProperty('--uv-fg', lv.fg); }

    var loc = $('#uvLoc');
    if (loc) loc.innerHTML = state.loc + ' · <button id="uvGeo" type="button">koristi moju lokaciju</button>';
    bindGeo();

    $('#uvMsg').textContent = uv === null
      ? 'Trenutno ne možemo da učitamo UV podatke. Osnovno pravilo ostaje: SPF svakog dana, i u hlad između 11 i 16 časova.'
      : advice(uv, state.type);

    $('#uvHead').textContent = uv === null ? 'Koliko sunca vaša koža podnese danas?'
      : 'Fototip ' + ['I','II','III','IV','V','VI'][state.type - 1] + ' · UV ' + (Math.round(uv * 10) / 10);

    $('#uvBurn').textContent = fmtMin(burnMinutes(uv, state.type));
    $('#uvSpf').textContent  = uv === null ? '–' : 'SPF ' + spf(uv, state.type);
    $('#uvSpfNote').textContent = (uv && uv > 7) ? 'ponoviti na 90 min' : 'ponoviti na 2 h';
    $('#uvPeak').textContent = state.peakH === null ? '–' : (String(state.peakH).padStart(2, '0') + ':00');

    // bočni rail
    var rv = $('#railUvVal'), rl = $('#railUvLvl'), rm = $('#railUvMsg'), rr = $('#railUvRing');
    if (rv) rv.textContent = uv === null ? '–' : (Math.round(uv * 10) / 10);
    if (rl) rl.textContent = uv === null ? 'Podatak nedostupan' : lv.n + ' UV';
    if (rr) { rr.style.setProperty('--rc-p', (frac * 100).toFixed(0) + '%'); rr.style.setProperty('--rc-c', lv.arc); }
    if (rm) {
      var bm = burnMinutes(uv, state.type);
      rm.textContent = uv === null
        ? 'Osnovno pravilo: SPF svakog dana, hlad između 11 i 16 h.'
        : 'Fototip ' + ['I','II','III','IV','V','VI'][state.type - 1] + ' — do prvog crvenila ' +
          fmtMin(bm) + '. Preporuka: SPF ' + spf(uv, state.type) + '.';
    }

    // graf po satima
    var bars = $('#uvBars');
    if (bars && state.hourly.length) {
      var max = Math.max.apply(null, state.hourly.map(function (h) { return h.v; })) || 1;
      var nowH = new Date().getHours();
      bars.innerHTML = state.hourly.map(function (h) {
        var pct = Math.max(3, (h.v / Math.max(max, 1)) * 100);
        var lab = (h.h % 3 === 0) ? '<span>' + h.h + '</span>' : '';
        return '<div class="ub' + (h.h === nowH ? ' now' : '') + '" style="height:' + pct + '%" title="' +
               h.h + ':00 — UV ' + (Math.round(h.v * 10) / 10) + '">' + lab + '</div>';
      }).join('');
    }
  }

  function bindGeo() {
    var g = $('#uvGeo');
    if (!g) return;
    g.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      g.textContent = 'tražim lokaciju…';
      navigator.geolocation.getCurrentPosition(function (p) {
        load(p.coords.latitude, p.coords.longitude, 'Vaša lokacija');
      }, function () { g.textContent = 'lokacija nije dostupna'; }, { timeout: 8000 });
    });
  }

  function load(lat, lon, name) {
    var url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=' + lat + '&longitude=' + lon
            + '&current=uv_index,temperature_2m,relative_humidity_2m'
            + '&hourly=uv_index'
            + '&timezone=auto&forecast_days=1';

    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      state.loc = name || NIS.name;

      // sati 6–20
      var H = [];
      if (d.hourly && d.hourly.time) {
        for (var i = 0; i < d.hourly.time.length; i++) {
          var hh = parseInt(d.hourly.time[i].slice(11, 13), 10);
          if (hh >= 6 && hh <= 20) H.push({ h: hh, v: d.hourly.uv_index[i] || 0 });
        }
      }
      state.hourly = H;

      var cur = (d.current && typeof d.current.uv_index === 'number') ? d.current.uv_index : null;
      if (cur === null && H.length) {
        var nh = new Date().getHours();
        var m = H.filter(function (x) { return x.h === nh; })[0];
        cur = m ? m.v : 0;
      }
      state.uv = cur;

      if (H.length) {
        var pk = H.reduce(function (a, b) { return b.v > a.v ? b : a; });
        state.peak = pk.v; state.peakH = pk.h;
      }

      // podaci za kalendar-vidžet
      if (d.current) {
        var t = $('#calTemp'), hu = $('#calHum'), hm = $('#calHumMsg');
        if (t && typeof d.current.temperature_2m === 'number') t.textContent = Math.round(d.current.temperature_2m) + '°C';
        if (hu && typeof d.current.relative_humidity_2m === 'number') {
          var rh = d.current.relative_humidity_2m;
          hu.textContent = Math.round(rh) + '%';
          if (hm) hm.textContent = rh < 35
            ? 'Vazduh je suv — kožna barijera brže gubi vodu. Pojačajte hidratantnu negu i unos tečnosti.'
            : rh > 70
              ? 'Vazduh je vlažan — lakše teksture su dovoljne; masne kreme mogu da zapuše pore.'
              : 'Vlažnost je u prijatnom opsegu za kožu.';
        }
      }
      render();
    }).catch(function () { state.uv = null; render(); });
  }

  function init() {
    if (!$('#uvVal')) return;
    $$('#pheno button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#pheno button').forEach(function (x) { x.classList.toggle('on', x === b); });
        state.type = parseInt(b.getAttribute('data-t'), 10);
        render();
      });
    });
    bindGeo();
    render();
    load(NIS.lat, NIS.lon, NIS.name);
  }

  return { init: init };
})();
UV.init();

/* ======================================================================
   10b. VAZDUH I POLEN  (Open-Meteo Air Quality — CAMS Europe, bez ključa)
   ====================================================================== */
(function air() {
  if (!$('#airAqi') && !$('#railAirVal')) return;
  var NIS = { lat: 43.3209, lon: 21.8958 };

  // Evropski AQI — zvanične granice
  var AQI = [
    { max: 20,  n: 'Dobar',          c: '#DCEFE0', fg: '#3E6B4A', arc: '#7FB98D' },
    { max: 40,  n: 'Prihvatljiv',    c: '#E7F0D8', fg: '#5A6B33', arc: '#A8BF72' },
    { max: 60,  n: 'Umeren',         c: '#FBF0D3', fg: '#8A6A1E', arc: '#DFBB55' },
    { max: 80,  n: 'Loš',            c: '#FCE3D0', fg: '#9A5824', arc: '#E39258' },
    { max: 100, n: 'Vrlo loš',       c: '#FBD9D5', fg: '#9E403A', arc: '#DD7A72' },
    { max: 1e5, n: 'Ekstremno loš',  c: '#EEDFF3', fg: '#6C3E80', arc: '#A576BB' }
  ];

  // Polen: [naziv, latinski, prag_umeren, prag_visok, prag_vrlo_visok] u zrncima/m³
  var POLLEN = [
    ['alder_pollen',    'Jova',      'Alnus',      10,  50, 500],
    ['birch_pollen',    'Breza',     'Betula',     10,  50, 500],
    ['grass_pollen',    'Trave',     'Poaceae',     5,  20, 200],
    ['mugwort_pollen',  'Pelin',     'Artemisia',   5,  20,  50],
    ['olive_pollen',    'Maslina',   'Olea',       10,  50, 200],
    ['ragweed_pollen',  'Ambrozija', 'Ambrosia',    5,  20,  50]
  ];

  var LVL = [
    { n: 'Nizak',      c: '#7FB98D', fg: '#3E6B4A' },
    { n: 'Umeren',     c: '#DFBB55', fg: '#8A6A1E' },
    { n: 'Visok',      c: '#E39258', fg: '#9A5824' },
    { n: 'Vrlo visok', c: '#DD7A72', fg: '#9E403A' }
  ];

  function aqiLevel(v) {
    for (var i = 0; i < AQI.length; i++) if (v <= AQI[i].max) return AQI[i];
    return AQI[AQI.length - 1];
  }

  function pollenLevel(v, t1, t2, t3) {
    if (v < t1) return 0;
    if (v < t2) return 1;
    if (v < t3) return 2;
    return 3;
  }

  function aqiMsg(v) {
    if (v <= 20) return 'Vazduh je čist. Nema dodatnog opterećenja za kožnu barijeru.';
    if (v <= 40) return 'Vazduh je prihvatljiv. Uobičajena večernja rutina čišćenja je dovoljna.';
    if (v <= 60) return 'Umereno zagađenje. PM čestice se talože na koži tokom dana — večernje čišćenje lica nije opcija, već obaveza.';
    if (v <= 80) return 'Zagađen vazduh. Čestice pojačavaju oksidativni stres i pogoršavaju akne, rozaceu i ekcem. Antioksidans ujutru, temeljno čišćenje uveče.';
    if (v <= 100) return 'Vrlo loš vazduh. Skratite boravak napolju. Kod postojećih dermatoza očekujte pogoršanje u naredna 24–48 h.';
    return 'Ekstremno zagađen vazduh. Izbegavajte duži boravak napolju; kod hroničnih kožnih oboljenja javite se ako se stanje pogorša.';
  }

  function skinMsg(aqiV, worst, worstName) {
    var out = [];
    if (worst >= 2) {
      out.push('<strong style="color:#fff">' + worstName + '</strong> je u ' +
        (worst === 3 ? 'vrlo visokoj' : 'visokoj') + ' koncentraciji. Kod atopijskog dermatitisa, ekcema ' +
        'i kontaktne urtikarije koža često reaguje pre nosa — svrab, crvenilo i osip oko očiju i na vratu. ' +
        'Isperite lice i ruke po povratku kući i ne sušite veš napolju.');
    } else if (worst === 1) {
      out.push('Polen je u umerenoj koncentraciji. Osetljive osobe mogu primetiti blago crvenilo i svrab — ' +
        'blaga, nemirisna nega i hladni oblozi obično su dovoljni.');
    } else {
      out.push('Koncentracije polena su niske. Danas alergeni iz vazduha nisu značajno opterećenje za kožu.');
    }
    if (aqiV !== null && aqiV > 60) {
      out.push('Uz to, kvalitet vazduha je ispod proseka — kombinacija čestica i polena je ono što najčešće ' +
        'izazove „iznenadno“ pogoršanje ekcema.');
    }
    out.push('Ako se reakcije ponavljaju, koncentracija u vazduhu vam neće reći <em>na šta</em> reagujete — ' +
      'to utvrđuje epikutano testiranje.');
    return out.join(' ');
  }

  function render(d) {
    var cur = d && d.current ? d.current : null;

    // --- AQI ---
    var aqiV = cur && typeof cur.european_aqi === 'number' ? Math.round(cur.european_aqi) : null;
    var al = aqiLevel(aqiV === null ? 0 : aqiV);

    var eA = $('#airAqi'); if (eA) eA.textContent = aqiV === null ? '–' : aqiV;
    var eL = $('#airAqiLvl');
    if (eL) {
      eL.textContent = aqiV === null ? 'Podatak nedostupan' : al.n;
      eL.style.setProperty('--air-c', al.c);
      eL.style.setProperty('--air-fg', al.fg);
    }
    var p25 = $('#airPm25'), p10 = $('#airPm10');
    if (p25) p25.textContent = cur && typeof cur.pm2_5 === 'number' ? Math.round(cur.pm2_5) : '–';
    if (p10) p10.textContent = cur && typeof cur.pm10 === 'number' ? Math.round(cur.pm10) : '–';
    var eM = $('#airMsg');
    if (eM) eM.textContent = aqiV === null
      ? 'Podaci o kvalitetu vazduha trenutno nisu dostupni. Osnovno pravilo ostaje: temeljno čišćenje lica uveče.'
      : aqiMsg(aqiV);

    // --- POLEN ---
    var rows = [], worst = 0, worstName = 'Polen', any = false;
    POLLEN.forEach(function (p) {
      var v = cur && typeof cur[p[0]] === 'number' ? cur[p[0]] : null;
      if (v === null) return;
      any = true;
      var li = pollenLevel(v, p[3], p[4], p[5]);
      if (li > worst) { worst = li; worstName = p[1]; }
      var pct = Math.min(100, (v / p[5]) * 100);
      rows.push(
        '<div class="pollen-row">' +
          '<div class="pr-name">' + p[1] + '<span class="pr-lat">' + p[2] + '</span></div>' +
          '<div class="pr-bar"><i style="width:' + Math.max(3, pct).toFixed(0) + '%;background:' + LVL[li].c + '"></i></div>' +
          '<div class="pr-num">' + (v < 1 ? '<1' : Math.round(v)) + '</div>' +
          '<div class="pr-lvl" style="color:' + LVL[li].fg + '">' + LVL[li].n + '</div>' +
        '</div>'
      );
    });

    var pl = $('#pollenList');
    if (pl) {
      pl.innerHTML = any ? rows.join('')
        : '<div class="pl-empty">Podaci o polenu trenutno nisu dostupni za ovu lokaciju.</div>';
    }

    var sk = $('#airSkinMsg');
    if (sk) sk.innerHTML = any ? skinMsg(aqiV, worst, worstName)
      : 'Podaci o alergenima trenutno nisu dostupni. Ako primetite svrab, crvenilo ili osip bez jasnog uzroka, ' +
        'epikutano testiranje daje konkretan odgovor.';

    // --- BOČNI RAIL ---
    var rv = $('#railAirVal'), rl = $('#railAirLvl'), rm = $('#railAirMsg'), rr = $('#railAirRing');
    if (rv) rv.textContent = aqiV === null ? '–' : aqiV;
    if (rl) rl.textContent = aqiV === null ? 'Podatak nedostupan' : 'Vazduh: ' + al.n;
    if (rr) {
      rr.style.setProperty('--rc-p', Math.min(100, ((aqiV === null ? 0 : aqiV) / 100) * 100).toFixed(0) + '%');
      rr.style.setProperty('--rc-c', al.arc);
    }
    if (rm) {
      rm.textContent = !any
        ? 'Podaci o polenu nisu dostupni za ovu lokaciju.'
        : (worst >= 2
            ? worstName + ' — ' + LVL[worst].n.toLowerCase() + ' nivo. Moguće pogoršanje ekcema i svrab kože.'
            : 'Polen: ' + LVL[worst].n.toLowerCase() + ' nivo. Nema značajnog opterećenja za kožu.');
    }
  }

  var fields = ['european_aqi', 'pm2_5', 'pm10'].concat(POLLEN.map(function (p) { return p[0]; }));
  var url = 'https://air-quality-api.open-meteo.com/v1/air-quality'
          + '?latitude=' + NIS.lat + '&longitude=' + NIS.lon
          + '&current=' + fields.join(',')
          + '&timezone=auto&forecast_days=1';

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () { render(null); });
})();

/* ======================================================================
   10c. RAIL — sklanja se dok je Skin Lab u vidokrugu (tamo su puni podaci)
   ====================================================================== */
(function railVisibility() {
  var rail = $('#rail'), hero = $('#hero'),
      lab = $('#skin-lab'), foot = document.querySelector('.site-footer');
  if (!rail || !('IntersectionObserver' in window)) return;

  // Sklonjen je i dok se gleda hero — tamo bi se sudarao sa fotografijom.
  var hidden = { hero: true, lab: false, foot: false };
  function apply() {
    rail.classList.toggle('tucked', hidden.hero || hidden.lab || hidden.foot);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.target === hero) hidden.hero = en.isIntersecting;
      if (en.target === lab)  hidden.lab  = en.isIntersecting;
      if (en.target === foot) hidden.foot = en.isIntersecting;
    });
    apply();
  }, { threshold: 0.18 });

  if (hero) io.observe(hero); else hidden.hero = false;
  if (lab) io.observe(lab);
  if (foot) io.observe(foot);
  apply();
})();

/* ======================================================================
   11. KVIZ — TIP KOŽE
   ====================================================================== */
(function quiz() {
  var body = $('#quizBody'); if (!body) return;
  var bar = $('#qpBar'), num = $('#qpN');

  var Q = [
    { q: 'Kako vaša koža izgleda 2–3 sata nakon umivanja, bez ikakve nege?',
      a: [
        { t: 'Zategnuto i suvo, ponegde se ljušti', i: '🌵', s: { dry: 3 } },
        { t: 'Sjaji cela — čelo, nos, obrazi', i: '💧', s: { oil: 3 } },
        { t: 'Sjaji samo T-zona, obrazi su normalni', i: '🔀', s: { comb: 3 } },
        { t: 'Crveni se i pecka', i: '🔥', s: { sens: 3 } }
      ] },
    { q: 'Koliko su vidljive pore na vašim obrazima?',
      a: [
        { t: 'Jedva se primećuju', i: '·', s: { dry: 2 } },
        { t: 'Vidljive su, posebno na nosu', i: '◦', s: { comb: 2, oil: 1 } },
        { t: 'Izražene po celom licu', i: '○', s: { oil: 3 } },
        { t: 'Ne obraćam pažnju na pore — smeta mi crvenilo', i: '◉', s: { sens: 2 } }
      ] },
    { q: 'Kako koža reaguje na novi proizvod ili kozmetiku?',
      a: [
        { t: 'Skoro nikad nema reakcije', i: '✓', s: { oil: 1, comb: 1 } },
        { t: 'Povremeno se zacrveni pa se smiri', i: '~', s: { sens: 2 } },
        { t: 'Često pecka, svrbi ili se javi osip', i: '⚠', s: { sens: 4 } },
        { t: 'Javljaju se bubuljice', i: '●', s: { oil: 2 } }
      ] },
    { q: 'Šta vas trenutno najviše smeta na koži?',
      a: [
        { t: 'Bore i gubitak čvrstine', i: '⌛', s: { age: 4 } },
        { t: 'Fleke, neujednačen ton', i: '🎨', s: { pigm: 4 } },
        { t: 'Akne i zapušene pore', i: '⚫', s: { oil: 3 } },
        { t: 'Suvoća i osećaj zatezanja', i: '💦', s: { dry: 3 } }
      ] },
    { q: 'Koliko vremena nedeljno provedete na direktnom suncu bez zaštite?',
      a: [
        { t: 'Praktično nimalo — uvek koristim SPF', i: '☂', s: { age: 0 } },
        { t: 'Do sat vremena', i: '🌤', s: { pigm: 1 } },
        { t: 'Nekoliko sati', i: '☀', s: { pigm: 2, age: 2 } },
        { t: 'Puno — radim ili treniram napolju', i: '🔆', s: { pigm: 3, age: 3 } }
      ] },
    { q: 'Kada ste poslednji put bili kod dermatologa?',
      a: [
        { t: 'U poslednjih godinu dana', i: '📅', s: {} },
        { t: 'Pre 2–5 godina', i: '🗓', s: {} },
        { t: 'Više od 5 godina', i: '⏳', s: { check: 2 } },
        { t: 'Nikada', i: '—', s: { check: 3 } }
      ] }
  ];

  var TYPES = {
    dry: {
      name: 'Suva i dehidrirana koža',
      d: 'Vaša koža slabije zadržava vodu i lipide, pa se javljaju zatezanje, ljuštenje i sitne linije dehidratacije. Prioritet je obnova kožne barijere, ne agresivna eksfolijacija.',
      r: [
        ['Tretman', 'Tretman hidratacije', 'Dubinsko vraćanje vlage i obnova barijere kože.'],
        ['Dijagnostika', 'Dermatološki pregled', 'Isključivanje ekcema, atopije i drugih uzroka suvoće.'],
        ['Nega', 'Blagi hemijski piling', 'Uklanjanje mrtvih ćelija bez oštećenja barijere.']
      ]
    },
    oil: {
      name: 'Masna koža sklona aknama',
      d: 'Pojačana produkcija sebuma i zapušene pore. Cilj je regulacija, a ne isušivanje — presuva masna koža reaguje još jačim lučenjem sebuma.',
      r: [
        ['Tretman', 'Hemijski piling', 'Regulacija sebuma, otpušavanje pora i ujednačavanje teksture.'],
        ['Dijagnostika', 'Pregled specijaliste', 'Procena stepena akni i plan terapije.'],
        ['Intervencija', 'Uklanjanje izraslina radiotalasima', 'Za milije, fibrome i benigne promene.']
      ]
    },
    comb: {
      name: 'Mešovita koža',
      d: 'Masna T-zona i normalni do suvi obrazi. Zahteva zoniranu negu — jedan proizvod za celo lice retko rešava obe strane problema.',
      r: [
        ['Tretman', 'Tretman hidratacije', 'Balansiranje suvih zona bez opterećenja T-zone.'],
        ['Tretman', 'Hemijski piling', 'Ciljano na T-zonu i proširene pore.'],
        ['Dijagnostika', 'Dermatološki pregled', 'Postavljanje plana nege po zonama lica.']
      ]
    },
    sens: {
      name: 'Osetljiva i reaktivna koža',
      d: 'Koža brzo reaguje crvenilom, peckanjem ili osipom. Pre bilo kakvog estetskog tretmana potrebno je utvrditi okidač — često je u pitanju kontaktna alergija.',
      r: [
        ['Dijagnostika', 'Alergološko epikutano testiranje', 'Otkrivanje tačnog alergena koji izaziva reakciju.'],
        ['Pregled', 'Pregled profesora', 'Za hronične i teže odredive reakcije kože.'],
        ['Tretman', 'Tretman hidratacije', 'Umirivanje i obnova oštećene barijere.']
      ]
    },
    age: {
      name: 'Zrela koža — prioritet čvrstina',
      d: 'Gubitak kolagena i elastina, opuštanje kontura i tanje linije. Rezultat daje kombinacija tretmana, a ne jedan zahvat.',
      r: [
        ['Tretman', 'Lifting', 'Podizanje i zatezanje opuštenih kontura lica.'],
        ['Tretman', 'Tretman hidratacije', 'Vraćanje punoće i sjaja koži.'],
        ['Dijagnostika', 'Digitalna dermoskopija', 'Kontrola svih promena nastalih tokom godina.']
      ]
    },
    pigm: {
      name: 'Hiperpigmentacije i neujednačen ton',
      d: 'Fleke od sunca, melazma ili tragovi posle akni. Tretman bez svakodnevne UV zaštite se vraća na početak — SPF nije opcija, već deo protokola.',
      r: [
        ['Tretman', 'Tretman hiperpigmentacije', 'Ciljano posvetljivanje i ujednačavanje tona.'],
        ['Tretman', 'Hemijski piling', 'Postepeno uklanjanje pigmentovanih slojeva.'],
        ['Dijagnostika', 'FotoFinder mapiranje', 'Razlikovanje bezopasnih fleka od sumnjivih promena.']
      ]
    }
  };

  var idx = 0, score = { dry: 0, oil: 0, comb: 0, sens: 0, age: 0, pigm: 0, check: 0 };

  function progress() {
    if (bar) bar.style.width = ((idx / Q.length) * 100) + '%';
    if (num) num.textContent = 'Pitanje ' + Math.min(idx + 1, Q.length) + ' / ' + Q.length;
  }

  function renderQ() {
    progress();
    var q = Q[idx];
    body.innerHTML =
      '<div class="quiz-q">' + q.q + '</div><div class="quiz-opts">' +
      q.a.map(function (a, k) {
        return '<button type="button" data-o="' + k + '"><span class="qo-i">' + a.i + '</span>' + a.t + '</button>';
      }).join('') + '</div>';

    $$('button[data-o]', body).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = q.a[parseInt(b.getAttribute('data-o'), 10)].s || {};
        Object.keys(s).forEach(function (k) { score[k] = (score[k] || 0) + s[k]; });
        idx++;
        if (idx >= Q.length) renderResult(); else renderQ();
      });
    });
  }

  function renderResult() {
    if (bar) bar.style.width = '100%';
    if (num) num.textContent = 'Rezultat';

    var best = 'comb', bv = -1;
    ['dry', 'oil', 'comb', 'sens', 'age', 'pigm'].forEach(function (k) {
      if (score[k] > bv) { bv = score[k]; best = k; }
    });
    var T = TYPES[best];
    var checkNote = score.check >= 2
      ? '<p style="font-size:.88rem;color:var(--ink-2);max-width:52ch;margin:0 auto 24px">Prošlo je dosta vremena od poslednjeg pregleda — preporučujemo <strong>dermoskopiju svih mladeža</strong> uz prvi dolazak, nezavisno od tipa kože.</p>'
      : '';

    body.innerHTML =
      '<div class="quiz-result">' +
        '<div class="qr-type">' + T.name + '</div>' +
        '<p class="qr-desc">' + T.d + '</p>' +
        checkNote +
        '<div class="quiz-recs">' +
          T.r.map(function (r) {
            return '<div class="qrc"><span>' + r[0] + '</span><b>' + r[1] + '</b><p>' + r[2] + '</p></div>';
          }).join('') +
        '</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
          '<a class="btn" href="#kontakt">Zakaži konsultaciju</a>' +
          '<button class="btn btn--ghost" type="button" id="quizAgain">Uradi ponovo</button>' +
        '</div>' +
      '</div>';

    var again = $('#quizAgain');
    if (again) again.addEventListener('click', function () {
      idx = 0; Object.keys(score).forEach(function (k) { score[k] = 0; }); renderQ();
    });
  }

  renderQ();
})();

/* ======================================================================
   12. SEZONSKI KALENDAR NEGE
   ====================================================================== */
(function calendar() {
  var wrapM = $('#calMonths'); if (!wrapM) return;

  var M = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
  var D = [
    { s: 'Zima · najniži UV', t: 'Obnova barijere posle praznika',
      i: 'Grejanje isušuje vazduh, a temperaturne oscilacije oslabljuju kožnu barijeru. Ovo je najbolji mesec u godini za tretmane koji zahtevaju oporavak bez sunca.',
      f: ['Hidratacija', 'Hemijski piling', 'Hiperpigmentacije'],
      l: ['Najniži UV u godini — idealan period za pilinge i laserske tretmane.',
          'Bogatija hidratantna krema uveče, lakša tokom dana.',
          'SPF 30 i zimi — sneg reflektuje do 80% UV zračenja.',
          'Ako se javljaju crvenilo i ljuštenje, proverite da li je u pitanju seboroični dermatitis.'] },
    { s: 'Zima · nizak UV', t: 'Pilinzi i korekcija pigmentacija',
      i: 'Koža je i dalje van sezone sunca, pa serije hemijskih pilinga daju najbolji odnos rezultata i rizika od postinflamatorne pigmentacije.',
      f: ['Hemijski piling', 'Lifting', 'Dermoskopija'],
      l: ['Idealno vreme za seriju pilinga — potrebno je 3–6 tretmana u razmaku od 2–3 nedelje.',
          'Godišnja dermoskopija: mart je već blizu, ne odlažite.',
          'Usne i kapci prvi pokazuju dehidrataciju — ne zaboravite ih.',
          'Nastavite SPF 30 dnevno, čak i po oblačnom danu.'] },
    { s: 'Rano proleće · UV raste', t: 'Priprema kože za jače sunce',
      i: 'UV indeks počinje osetno da raste, ali koža je posle zime najmanje otporna. Ovo je poslednji miran period za agresivnije tretmane.',
      f: ['Hiperpigmentacije', 'SPF navika', 'Dermoskopija'],
      l: ['Poslednji mesec za intenzivnije pilinge pre sezone sunca.',
          'Prebacite se na SPF 50 za lice — UV skače brže nego što se očekuje.',
          'Zakažite godišnji pregled mladeža pre letnjeg izlaganja.',
          'Uvedite antioksidans (vitamin C) ujutru, ispod zaštite.'] },
    { s: 'Proleće · UV umeren–visok', t: 'Prevencija pigmentacija',
      i: 'Prvi sunčani dani su podmukli — koža je nenaviknuta, a UV već dovoljno jak da izazove fleke koje se posle godinu dana leče.',
      f: ['SPF 50', 'Hidratacija', 'Epilacija'],
      l: ['SPF 50 svakog dana, ponavljanje ako ste duže napolju.',
          'Alergološko testiranje ako se javljaju sezonske reakcije kože.',
          'Početak sezone laserske epilacije — najbolje pre intenzivnog tamnjenja.',
          'Šeširi i naočare nisu kozmetika, već zaštita.'] },
    { s: 'Proleće · UV visok', t: 'Zaštita i lakše teksture',
      i: 'UV je već na nivou letnjih vrednosti u sredini dana. Koža se prilagođava toplijem vremenu — teške kreme postaju nepotreban teret.',
      f: ['SPF 50', 'Lakše teksture', 'Kontrola mladeža'],
      l: ['Prelazak na lakše, gel-teksture hidratacije.',
          'Izbegavajte direktno sunce između 11 i 16 časova.',
          'Pratite mladeže po ABCDE pravilu — jednom mesečno.',
          'Odložite jače pilinge do jeseni.'] },
    { s: 'Leto · UV visok', t: 'Sezona maksimalne zaštite',
      i: 'UV indeks dostiže najviše vrednosti u godini. Sve što uradite sada vidi se za pet godina — pozitivno ili negativno.',
      f: ['SPF 50+', 'Hidratacija', 'Bez pilinga'],
      l: ['SPF 50+ obavezno, ponavljanje na svaka 2 sata i posle kupanja.',
          'Nema hemijskih pilinga i lasera na izloženim zonama.',
          'Pojačan unos tečnosti — dehidratacija se vidi na koži.',
          'Kod svake nove ili promenjene promene na koži — pregled odmah.'] },
    { s: 'Leto · UV vrlo visok', t: 'Vrhunac UV — oprez',
      i: 'Najzahtevniji mesec za kožu. Opekotina u julu nije „prolazna neprijatnost“ — to je oštećenje DNK koje se sabira kroz život.',
      f: ['SPF 50+', 'Hlad', 'Posle-sunca nega'],
      l: ['Sredina dana — u hladu, bez izuzetka.',
          'Posle sunca: umirujuće, nemasne formulacije, bez alkohola.',
          'Znojenje i sunce pogoršavaju akne — ne prekidajte terapiju sami.',
          'Pratite UV indeks pre izlaska (vidžet iznad).'] },
    { s: 'Leto · UV vrlo visok', t: 'Održavanje, bez agresije',
      i: 'Kraj sezone — koža je najviše izložena i najviše dehidrirana. Pigmentacije nastale sada postaju vidljive tek u septembru.',
      f: ['SPF 50+', 'Hidratacija', 'Praćenje fleka'],
      l: ['Nastavite punu zaštitu do kraja meseca.',
          'Zabeležite (fotografišite) fleke koje su se pojavile — koristiće na pregledu.',
          'Intenzivna hidratacija uveče, bez kiselina.',
          'Ako je bilo opekotine — zakažite pregled, ne čekajte.'] },
    { s: 'Rana jesen · UV pada', t: 'Popravni ispit posle leta',
      i: 'UV opada i koža konačno može da primi korektivne tretmane. Ovo je mesec u kome se rešava sve što je leto ostavilo.',
      f: ['Hiperpigmentacije', 'Hemijski piling', 'Dermoskopija'],
      l: ['Start sezone pilinga i tretmana hiperpigmentacije.',
          'Obavezna kontrola mladeža posle letnjeg izlaganja.',
          'Uvođenje retinoida — uz savet dermatologa.',
          'SPF ostaje u rutini, samo niži faktor.'] },
    { s: 'Jesen · UV nizak', t: 'Sezona korektivnih tretmana',
      i: 'Najbolji odnos rezultata i rizika u celoj godini. Koža se oporavlja brzo, a sunce više ne poništava efekat tretmana.',
      f: ['Hemijski piling', 'Lifting', 'Laserska epilacija'],
      l: ['Idealno vreme za serije pilinga i laserske tretmane.',
          'Laserska epilacija najefikasnija kada koža nije potamnela.',
          'Vratite bogatije teksture kako temperatura pada.',
          'Planirajte tretmane koji traže više seansi — ima vremena do proleća.'] },
    { s: 'Jesen · UV nizak', t: 'Obnova posle sezone sunca',
      i: 'Grejanje počinje da radi, vlažnost vazduha pada. Koža gubi vodu brže nego što je nadoknađuje.',
      f: ['Hidratacija', 'Barijera', 'Pilinzi'],
      l: ['Hidratacija postaje prioritet — spolja i iznutra.',
          'Nastavak serije korektivnih tretmana.',
          'Ekcemi i atopija se pogoršavaju — reagujte na prve znake.',
          'Nemojte prekidati SPF, samo smanjite faktor.'] },
    { s: 'Zima · najniži UV', t: 'Zaštita barijere i planiranje',
      i: 'Hladnoća, vetar i suv vazduh iz grejanja. Koža lica i šaka najviše trpi, a decembarski stres pogoršava sve inflamatorne dermatoze.',
      f: ['Hidratacija', 'Barijera', 'Kontrola'],
      l: ['Bogatije, okluzivnije kreme uveče — posebno za šake.',
          'Izbegavajte vruće tuširanje: isušuje kožu više nego hladnoća.',
          'Zakažite godišnju kontrolu ako je niste imali.',
          'Planirajte veće tretmane za januar–mart, dok je UV najniži.'] }
  ];

  var now = new Date().getMonth();
  var sel = now;

  wrapM.innerHTML = M.map(function (m, k) {
    return '<button type="button" data-m="' + k + '" class="' + (k === now ? 'now ' : '') + (k === sel ? 'on' : '') + '">' + m.slice(0, 3) + '</button>';
  }).join('');

  function paint(k) {
    var d = D[k];
    $('#calSeason').textContent = d.s;
    $('#calTitle').textContent = M[k] + ' — ' + d.t;
    $('#calIntro').textContent = d.i;
    $('#calFocus').innerHTML = d.f.map(function (f) { return '<span>' + f + '</span>'; }).join('');
    $('#calList').innerHTML = d.l.map(function (x) {
      return '<li><svg viewBox="0 0 24 24"><use href="#iCheck"/></svg><span>' + x + '</span></li>';
    }).join('');
  }

  $$('button[data-m]', wrapM).forEach(function (b) {
    b.addEventListener('click', function () {
      sel = parseInt(b.getAttribute('data-m'), 10);
      $$('button[data-m]', wrapM).forEach(function (x) { x.classList.toggle('on', x === b); });
      paint(sel);
    });
  });

  paint(sel);
})();

/* ======================================================================
   14. FORMA (demo — bez backend-a)
   ====================================================================== */
(function form() {
  var f = $('#bookForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('#formNote');
    // NAPOMENA: f.name bi vratio atribut forme, ne polje -> obavezno preko f.elements
    var name = f.elements.name.value.trim(), phone = f.elements.phone.value.trim();
    if (!name || !phone) {
      note.textContent = 'Molimo unesite ime i broj telefona.';
      note.style.color = '#B4534A';
      return;
    }
    // DEMO: bez servera. U produkciji -> WP Contact Form 7 / Vercel serverless funkcija.
    note.innerHTML = '<strong style="color:var(--brand-deep)">Hvala, ' + name.split(' ')[0] +
      '.</strong> Ovo je demo forma — u produkciji se zahtev šalje na e-mail klinike.';
    note.style.color = '';
    f.querySelector('button[type=submit]').textContent = 'Zahtev poslat ✓';
  });
})();

/* ======================================================================
   15. PALETTE SWITCHER — 3 alternativne palete boja, birač u dnu ekrana.
   Pamti izbor u localStorage (traje i posle zatvaranja pretraživača, važi
   na svim stranicama). Primenjeno je već i u <head> (inline skripta) da
   se izbegne bljesak podrazumevane palete pre učitavanja stilova.
   ====================================================================== */
(function palette() {
  var sw = $('#palSwitch'); if (!sw) return;
  var KEY = 'pp-palette';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) markOn(saved);

  function markOn(p) {
    $$('button', sw).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-p') === p); });
  }
  function apply(p) {
    document.documentElement.setAttribute('data-palette', p);
    markOn(p);
    try { localStorage.setItem(KEY, p); } catch (e) {}
    document.dispatchEvent(new Event('palettechange'));
  }
  $$('button', sw).forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-p')); });
  });
})();


/* ======================================================================
   16. SLIKE — troslojni fallback
   1) lokalna slika iz assets/img/  (preporuceno za produkciju)
   2) ako je nema -> data-remote (privremeno, sa starog proderma.rs)
   3) ako ni to -> sakrij <img>, ostaje gradijent iz CSS-a (nikad slomljena ikona)
   ====================================================================== */
(function images() {
  $$('img[data-fallback]').forEach(function (img) {
    var tried = 0;
    img.addEventListener('error', function () {
      tried++;
      if (tried === 1 && img.getAttribute('data-remote')) {
        img.src = img.getAttribute('data-remote');
      } else {
        img.style.display = 'none';
        var p = img.closest('.hero-frame, .about-media, .tm-ph, .hero-bleed, .hero-photo, .sr-media');
        if (p) p.setAttribute('data-noimg', '');
      }
    });
    // ako je slika vec pukla pre nego sto se JS ucitao
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event('error'));
    }
  });
})();

/* ======================================================================
   17. GODINA U FOOTERU + SMOOTH ANCHOR OFFSET
   ====================================================================== */
(function misc() {
  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();

})();

/* ==========================================================================
   WOW SLOJ — spojeno iz wow.js. Svaki efekat ostaje sopstveni IIFE (Aurora,
   PageTransition, StarBorder, ClickSpark, TiltedCard/Glare, Before/After,
   ScrollStack, LogoMarquee, StickyCTA, kontekstualni kursor, ScrollVelocity,
   GooeyNav, MagneticLift, Put pacijenta, Tehnologija, Tim bio...). Redosled
   zadržan POSLE app.js — isto kao što je wow.js ranije bio učitan posle
   app.js u <script> tagovima — ponašanje ostaje identično.
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

  // BACK dugme: kad se ode sa stranice, zavesa je podignuta preko celog
  // ekrana — i takvu je browser zamrzne u bfcache. Pri povratku se DOM
  // vraća u to isto stanje, a skripte se NE izvršavaju ponovo (zato ni
  // "pp-nav" grana iznad ne pomaže), pa je "PRODERMA PLUS" ostajao
  // zalepljen preko sadržaja i stranica je delovala mrtvo.
  function resetVeil() { veil.className = 'pt-veil'; }
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;              // samo povratak iz bfcache-a
    resetVeil();
    sessionStorage.removeItem('pp-nav');
  });
  addEventListener('popstate', resetVeil); // back/forward u istoj stranici

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
   6. TILT + GLARE — kartice tima
   ====================================================================== */
(function tiltCards() {
  if (reduce || !fine) return;
  $$('.tm').forEach(function (card) {
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.transform =
        'perspective(900px) rotateX(' + ((0.5 - py) * 9).toFixed(2) + 'deg) rotateY(' +
        ((px - 0.5) * 11).toFixed(2) + 'deg) translateZ(10px) scale(1.02)';
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

  // RUNDA 8: ova pin-uz-sliku logika je za desktop raspored (.jr-stage
  // pored .jr-steps). Na mobilnom sad postoji sopstveni pin+fade fazon
  // (vidi putMobilePin niže) koji drugačije koristi istu .jr-step.on
  // klasu — bez ovog gate-a bi se ova dva međusobno nadjačavala.
  var wide = window.matchMedia('(min-width: 940px)');

  var active = -1;
  function sync() {
    if (!wide.matches) return;
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
   RUNDA 8: pre je ovo bilo desktop-only (ispod 940px se traka ručno
   swipe-ovala) — sad radi na svim širinama, i na mobilnom vertikalni
   skrol pomera karticu s desna u levo, isto kao na desktopu.
   ====================================================================== */
(function techScroll() {
  var sec = $('[data-tech]');
  if (!sec) return;
  var track = $('.tech-track', sec);
  var bar   = $('.tech-progress i', sec);
  if (!track) return;

  var dist = 0;

  function measure() {
    if (reduce) {
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
    if (reduce) return;
    var r = sec.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;   // van kadra
    var total = sec.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
    track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  }

  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', measure, { passive: true });
  // slike menjaju scrollWidth kad se učitaju
  addEventListener('load', measure);
  $$('img', track).forEach(function (im) {
    if (!im.complete) im.addEventListener('load', measure, { once: true });
  });
  measure();
})();

/* ======================================================================
   16b. TEHNOLOGIJA — klik na mobilnom ekspandira opis (strelica)
   ====================================================================== */
(function techExpand() {
  var cards = $$('.tech-card');
  if (!cards.length) return;
  var mq = window.matchMedia('(max-width: 939px)');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      if (!mq.matches) return;
      card.classList.toggle('active');
    });
  });
})();

/* ======================================================================
   16c. VAŠ PUT KOD NAS (mobilno) — pin + fade-crossfade
   RUNDA 10: zamena za RUNDA 9 rotaciju kocke (matrix3d+perspective je na
   telefonu sekao skrol). #put .jr-grid i dalje dobija veštački napumpanu
   visinu (isti trik kao techScroll() — sekcija je viša nego njen sadržaj
   da pruži skrol-prostor) i #put .jr-steps je position:sticky (pinovana).
   Svaki .jr-step je position:absolute preko cele kutije; ovde samo
   dodajemo/skidamo klasu .on kad se pređe u sledeći korak — CSS
   transition na opacity radi samu glatku smenu (jeftino, bez repainta
   3D transformacija). Dok se ne prođe i poslednji korak, sekcija je
   veštački visoka pa sajt fizički ne može da pređe na sledeću dok se svi
   koraci ne izmenjaju. */
(function putMobilePin() {
  var sec = $('#put');
  if (!sec) return;
  var wrap = $('.wrap', sec);
  var head = $('.sec-head', sec);
  var grid = $('.jr-grid', sec);
  var stage = $('.jr-steps', sec);
  var steps = $$('.jr-step', sec);
  if (!wrap || !grid || !stage || steps.length < 2) return;

  // Naslov sekcije i kartice se pinuju ZAJEDNO, da naslov ostane na ekranu
  // dok se koraci smenjuju. .jr-pin je runway (JS mu daje visinu), .jr-stick
  // je ono što se lepi. Na desktopu su oba obična div-a bez stila, pa se
  // raspored ne menja.
  var pin = document.createElement('div');
  pin.className = 'jr-pin';
  var stick = document.createElement('div');
  stick.className = 'jr-stick';
  wrap.insertBefore(pin, head || grid);
  pin.appendChild(stick);
  if (head) stick.appendChild(head);
  stick.appendChild(grid);

  var narrow = window.matchMedia('(max-width: 939px)');
  var perStep = 0, stickyTop = 0, active = -1;

  function measure() {
    if (!narrow.matches || reduce) {
      pin.style.height = '';
      steps.forEach(function (st) { st.classList.remove('on'); });
      active = -1;
      return;
    }
    // ~0.36 ekrana skrola po koraku — jedan "skrol" (wheel/swipe) treba
    // da prebaci na sledeći korak, ne dva
    perStep = window.innerHeight * 0.36;
    stickyTop = parseFloat(getComputedStyle(stick).top) || 0;
    // KLJUČNO: sticky blok ostaje zakačen samo (visina runway-a − visina
    // samog bloka) piksela. Ako je runway visok tačno perStep × brojKoraka,
    // izgubi se cela visina bloka i poslednji koraci "prolete" tek pošto se
    // blok već odlepio i otišao gore. Zato runway mora biti za visinu bloka
    // viši od zbira svih koraka.
    pin.style.height = (stick.offsetHeight + perStep * steps.length) + 'px';
    sync();
  }

  function sync() {
    if (!narrow.matches || reduce) return;
    var r = pin.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;   // van kadra
    // progres se meri OD TRENUTKA kad se blok zakačio (r.top === stickyTop),
    // a ne od vrha runway-a — inače indeksi kasne za stickyTop piksela
    var travelled = stickyTop - r.top;
    var idx = Math.min(steps.length - 1, Math.max(0, Math.floor(travelled / perStep)));
    if (idx === active) return;
    active = idx;
    steps.forEach(function (st, i) { st.classList.toggle('on', i === idx); });
  }

  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', measure, { passive: true });
  measure();
})();

/* ======================================================================
   16d. SKIN LAB — dugme "Detaljnije" otkriva dodatni sadržaj panela
   ====================================================================== */
(function labMoreToggle() {
  var toggles = $$('[data-labmore-toggle]');
  if (!toggles.length) return;
  toggles.forEach(function (btn) {
    var panel = btn.nextElementSibling;
    if (!panel || !panel.classList.contains('lab-more')) return;
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('active');
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();

/* ======================================================================
   16e. Tačkice (dots) ispod horizontalnih skrol redova — Usluge,
   Tehnologija, Tim, Utisci. Prati scroll i klikom skroluje na karticu.
   RUNDA 8: "Put kod nas" izbačen iz liste — .jr-steps više nije
   horizontalno skrolabilna lista (pinovan fade-stack umesto toga), pa
   tačkice koje prate scrollLeft tu više nemaju šta da prate. */
(function scrollDots() {
  var groups = [
    { list: '#usluge .svc-list', item: '.svc-row' },
    { list: '.tech-track',       item: '.tech-card' },
    { list: '.team-grid',        item: '.tm' }
    // .rs je izbačen: utisci više nisu horizontalni skrol, pa su te tačkice
    // ostajale zamrznute na prvoj — utisciDeck() sada pravi svoje koje prate
    // aktivnu karticu u špilu
  ];
  groups.forEach(function (g) {
    var list = $(g.list);
    if (!list) return;
    var items = $$(g.item, list);
    if (items.length < 2) return;

    var nav = document.createElement('div');
    nav.className = 'scroll-dots';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Pozicija u listi');
    items.forEach(function (it, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'scroll-dot';
      dot.setAttribute('aria-label', (i + 1) + ' od ' + items.length);
      dot.addEventListener('click', function () {
        list.scrollTo({
          left: it.offsetLeft - (list.clientWidth - it.clientWidth) / 2,
          behavior: 'smooth'
        });
      });
      nav.appendChild(dot);
    });
    list.insertAdjacentElement('afterend', nav);

    var dots = $$('.scroll-dot', nav);
    dots[0].classList.add('on');

    var ticking = false;
    function updateActive() {
      ticking = false;
      var center = list.scrollLeft + list.clientWidth / 2;
      var closest = 0, min = Infinity;
      items.forEach(function (it, i) {
        var itCenter = it.offsetLeft + it.clientWidth / 2;
        var d = Math.abs(itCenter - center);
        if (d < min) { min = d; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === closest); });
    }
    list.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
    }, { passive: true });
  });
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
  var narrow = window.matchMedia('(max-width: 640px)');

  function apply() {
    queued = false;
    if (narrow.matches) {
      // mobilni: .rs je horizontalni red kartica (CSS), efekat slaganja
      // iz vertikalnog skrola bi se ovde samo sudarao sa tim rasporedom
      cards.forEach(function (c) {
        c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = '';
      });
      return;
    }
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
   UTISCI MOBILNI — pin + "spil karata": kartice ispadaju jedna za drugom
   dok se sajt skroluje (isti fazon kao putMobilePin/techScroll — JS
   naduva runway pa upisuje --rs-active koji CSS calc() koristi po kartici)
   ====================================================================== */
(function utisciDeck() {
  var sec = $('#utisci');
  if (!sec) return;
  var wrap = $('.wrap', sec);
  var head = $('.sec-head', sec);
  var stage = $('.rs', sec);
  var cards = $$('.rs-card', sec);
  if (!wrap || !stage || cards.length < 2) return;

  cards.forEach(function (c, i) { c.setAttribute('data-rs', i); });

  // naslov sekcije i špil se pinuju zajedno (isto kao #put), da naslov
  // ostane na ekranu dok se kartice smenjuju
  var pin = document.createElement('div');
  pin.className = 'rs-pin';
  var stick = document.createElement('div');
  stick.className = 'rs-stick';
  wrap.insertBefore(pin, head || stage);
  pin.appendChild(stick);
  if (head) stick.appendChild(head);
  stick.appendChild(stage);

  // pokazivač dokle se stiglo kroz špil — sekcija je zaključana dok se ne
  // prođu sve kartice, pa je korisno videti koliko ih je ostalo
  var dots = document.createElement('div');
  dots.className = 'scroll-dots rs-dots';
  dots.setAttribute('aria-hidden', 'true');
  cards.forEach(function () {
    var d = document.createElement('span');
    d.className = 'scroll-dot';
    dots.appendChild(d);
  });
  stick.appendChild(dots);
  var dotEls = $$('.scroll-dot', dots);

  var narrow = window.matchMedia('(max-width: 640px)');
  var perCard = 0, stickyTop = 0, active = -1;

  function measure() {
    if (!narrow.matches || reduce) {
      pin.style.height = '';
      cards.forEach(function (c) { c.classList.remove('on'); });
      active = -1;
      return;
    }
    // ~0.28 ekrana skrola po kartici — jedan "skrol" treba da prebaci na
    // sledeću karticu, ne dva
    perCard = window.innerHeight * 0.28;
    stickyTop = parseFloat(getComputedStyle(stick).top) || 0;
    // isto kao kod #put: pinovani hod je (visina runway-a − visina bloka),
    // pa runway mora biti za visinu bloka viši od zbira svih kartica —
    // inače poslednja kartica dođe na red tek kad se špil već odlepio
    pin.style.height = (stick.offsetHeight + perCard * cards.length) + 'px';
    sync();
  }

  function sync() {
    if (!narrow.matches || reduce) return;
    var r = pin.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
    var travelled = stickyTop - r.top;
    var idx = Math.min(cards.length - 1, Math.max(0, Math.floor(travelled / perCard)));
    if (idx === active) return;
    active = idx;
    stage.style.setProperty('--rs-active', idx);
    cards.forEach(function (c, i) { c.classList.toggle('on', i === idx); });
    dotEls.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
  }

  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', measure, { passive: true });
  measure();
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

  // Na mobilnom je tim u horizontalnom redu, a klik/tap na strelicu
  // otvara bio inline (isti fazon kao Usluge/Tehnologija) — modal na celom
  // ekranu je suvišan kad je kartica već tako uska. Na širem ekranu (miš)
  // ponašanje ostaje isto kao pre: klik otvara modal.
  var teamMobile = window.matchMedia('(max-width: 640px)');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      if (teamMobile.matches) { card.classList.toggle('active'); return; }
      open(card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (teamMobile.matches) { card.classList.toggle('active'); return; }
        open(card);
      }
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
