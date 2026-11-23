(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const SLOPE = Math.tan((4 * Math.PI) / 180); // de lat staat onder 4 graden, net als de sectieranden
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const navH = () => $('[data-nav]').offsetHeight;

  /* ---------- smooth scroll (Lenis) gekoppeld aan ScrollTrigger ---------- */
  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduce && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- navigatie ---------- */
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -navH(), duration: 1.3 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- de film: vuil op glas, getekend op een canvas ---------- */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function paintFilm(canvas, img, seed, mode = 'fog') {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !img.naturalWidth) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rng(seed);

    // object-fit: cover, dezelfde uitsnede als de echte foto
    const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
    let sw, sh, sx, sy;
    if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2; }

    if (mode === 'grime') { paintGrime(ctx, img, { sx, sy, sw, sh }, w, h, R); return { ctx, w, h }; }

    // wazige onderlaag: klein tekenen, groot terugschalen
    const off = document.createElement('canvas');
    off.width = Math.max(8, Math.round(w / 26)); off.height = Math.max(8, Math.round(h / 26));
    off.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, off.width, off.height);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, w, h);

    ctx.fillStyle = 'rgba(166,182,180,.5)'; ctx.fillRect(0, 0, w, h);          // grauwe waas
    for (let i = 0; i < 16; i++) {                                              // ongelijke nevel
      const x = R() * w, y = R() * h, r = (0.15 + R() * 0.3) * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(240,246,245,.16)'); g.addColorStop(1, 'rgba(240,246,245,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    const area = w * h;
    for (let i = 0, n = area / 520; i < n; i++) {                               // vuilspikkels
      ctx.fillStyle = `rgba(46,56,52,${0.06 + R() * 0.2})`;
      ctx.beginPath(); ctx.arc(R() * w, R() * h, 0.5 + R() * 1.9, 0, 7); ctx.fill();
    }
    for (let i = 0, n = area / 9000; i < n; i++) {                              // druppels en lopers
      const x = R() * w, y = R() * h, r = 3 + R() * 10;
      if (R() < 0.45) {
        const len = 30 + R() * 190;
        const g = ctx.createLinearGradient(x, y, x, y + len);
        g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1 + R() * 1.6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (R() - 0.5) * 6, y + len); ctx.stroke();
      }
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(0.7, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(36,48,48,.3)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, 7); ctx.fill();
    }
    return { ctx, w, h };
  }

  // een gevel die echt vuil is: scherp, dof, groen van de aanslag en met regensporen
  function paintGrime(ctx, img, c, w, h, R) {
    ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.72; ctx.fillStyle = 'hsl(0 0% 50%)'; ctx.fillRect(0, 0, w, h); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(150,160,130,.55)'); g.addColorStop(1, 'rgba(84,104,64,.82)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
    for (let i = 0; i < w / 9; i++) {                                            // regensporen
      const x = R() * w, len = h * (0.25 + R() * 0.75), sw = 1 + R() * 9;
      const s = ctx.createLinearGradient(0, 0, 0, len);
      const dark = R() < 0.7;
      s.addColorStop(0, dark ? 'rgba(30,38,24,0)' : 'rgba(235,240,225,0)');
      s.addColorStop(0.3, dark ? `rgba(30,38,24,${0.1 + R() * 0.16})` : `rgba(235,240,225,${0.08 + R() * 0.1})`);
      s.addColorStop(1, dark ? 'rgba(30,38,24,0)' : 'rgba(235,240,225,0)');
      ctx.fillStyle = s; ctx.fillRect(x, R() * (h - len), sw, len);
    }
    for (let i = 0, n = (w * h) / 450; i < n; i++) {                              // aanslag en spikkels
      ctx.fillStyle = `rgba(40,52,30,${0.05 + R() * 0.2})`;
      ctx.beginPath(); ctx.arc(R() * w, h * Math.pow(R(), 0.7), 0.5 + R() * 2.2, 0, 7); ctx.fill();
    }
  }

  function erase(film, x0, x1) {
    const { ctx, w, h } = film;
    const o = (SLOPE * h) / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x0 - 1 + o, 0); ctx.lineTo(x1 + o, 0); ctx.lineTo(x1 - o, h); ctx.lineTo(x0 - 1 - o, h);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ---------- hero: het ene georkestreerde moment ---------- */
  const hero = $('.hero');
  const heroImg = $('[data-hero-img]');
  const heroFilm = $('[data-hero-film]');
  const blade = $('[data-hero-blade]');

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const film = reduce ? null : paintFilm(heroFilm, heroImg, 7);
    tl.from('.hero__title .line > span', { yPercent: 112, duration: 1.1, stagger: 0.12 }, 0.3);

    if (film) {
      const { w, h } = film;
      const o = (SLOPE * h) / 2;
      const from = -o - 14, to = w + o + 16;
      const st = { x: from };
      let last = from;
      blade.style.transform = `translate3d(${from}px,0,0) skewX(-4deg)`;
      tl.to(st, {
        x: to, duration: 2.1, ease: 'power2.inOut',
        onUpdate() {
          erase(film, last, st.x); last = st.x;
          blade.style.transform = `translate3d(${st.x - 5}px,0,0) skewX(-4deg)`;
        },
        onComplete() { heroFilm.remove(); blade.remove(); },
      }, 0.8);
    } else {
      heroFilm.remove(); blade.remove();
    }
    tl.from('[data-hero-in]', { opacity: 0, y: 14, duration: 0.9, stagger: 0.12 }, film ? 1.9 : 0.8)
      .from('[data-hero-fact]', { opacity: 0, y: 12, duration: 0.8, stagger: 0.1 }, film ? 2.2 : 1);

    if (reduce) tl.progress(1);

    // diepte: de foto beweegt langzamer dan de tekst
    gsap.to('[data-hero-inner]', {
      yPercent: 5.5, scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (hasGsap) {
    const go = () => heroIntro();
    if (heroImg.complete && heroImg.naturalWidth) go();
    else { heroImg.addEventListener('load', go, { once: true }); heroImg.addEventListener('error', () => { heroFilm.remove(); blade.remove(); }, { once: true }); }

    // foto's komen van onder naar boven in beeld en bewegen rustig mee
    $$('[data-reveal]').forEach((box) => {
      const img = $('img', box);
      if (!reduce) {
        gsap.fromTo(box, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: box, start: 'top 82%', once: true } });
        gsap.fromTo(img, { yPercent: -5, scale: 1.14 }, { yPercent: 5, scale: 1.14, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    });
  } else {
    heroFilm.remove(); blade.remove();
  }

  /* ---------- diensten: panelen ---------- */
  const panes = $$('[data-pane]');
  const openPane = (p) => panes.forEach((q) => q.classList.toggle('is-open', q === p));
  panes.forEach((p) => {
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') openPane(p); });
    p.addEventListener('focusin', () => openPane(p));
    p.addEventListener('click', () => openPane(p));
  });
  if (hasGsap) {
    gsap.matchMedia().add('(max-width: 1000px)', () => {
      panes.forEach((p) => p.classList.remove('is-open'));
      const triggers = panes.map((p) => ScrollTrigger.create({ trigger: p, start: 'top 72%', once: true, onEnter: () => p.classList.add('is-open') }));
      return () => { triggers.forEach((t) => t.kill()); openPane(panes[0]); };
    });
  }

  /* ---------- voor en na: de lat ---------- */
  const cmp = $('[data-cmp]');
  const cmpImg = $('.cmp__img', cmp);
  const cmpFilm = $('[data-cmp-film]');
  const handle = $('[data-cmp-handle]');
  const tagVoor = $('.cmp__tag--voor', cmp), tagNa = $('.cmp__tag--na', cmp);
  let pct = 50, demo = null;

  function setPct(p) {
    pct = clamp(p, 2, 98);
    const px = (cmp.clientWidth * pct) / 100;
    cmp.style.setProperty('--x', px + 'px');
    cmp.style.setProperty('--s', (cmp.clientHeight * SLOPE) / 2 + 'px');
    const r = Math.round(pct);
    tagVoor.classList.toggle('is-off', pct < 22);
    tagNa.classList.toggle('is-off', pct > 78);
    handle.setAttribute('aria-valuenow', String(r));
    handle.setAttribute('aria-valuetext', `${r} procent voor, ${100 - r} procent na`);
  }
  const paintCmp = () => { paintFilm(cmpFilm, cmpImg, 11, 'grime'); setPct(pct); };
  if (cmpImg.complete && cmpImg.naturalWidth) paintCmp(); else cmpImg.addEventListener('load', paintCmp, { once: true });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paintCmp, 150); });

  const fromPointer = (e) => { const r = cmp.getBoundingClientRect(); setPct(((e.clientX - r.left) / r.width) * 100); };
  const stopDemo = () => { handle.classList.add('is-touched'); if (demo) { demo.kill(); demo = null; } };
  cmp.addEventListener('pointerdown', (e) => { stopDemo(); cmp.setPointerCapture(e.pointerId); fromPointer(e); cmp.onpointermove = fromPointer; });
  const release = () => { cmp.onpointermove = null; };
  cmp.addEventListener('pointerup', release); cmp.addEventListener('pointercancel', release);
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 12 : 4;
    const map = { ArrowLeft: pct - step, ArrowDown: pct - step, ArrowRight: pct + step, ArrowUp: pct + step, Home: 2, End: 98 };
    if (e.key in map) { e.preventDefault(); stopDemo(); setPct(map[e.key]); }
  });
  if (hasGsap && !reduce) {
    const s = { p: 100 };
    setPct(100);
    demo = gsap.to(s, { p: 50, duration: 1.9, ease: 'power3.inOut', onUpdate: () => setPct(s.p), paused: true,
      scrollTrigger: { trigger: cmp, start: 'top 75%', once: true, onEnter: () => demo && demo.play() } });
  } else setPct(50);

  /* ---------- werkwijze: de lijn groeit mee, het stapnummer rolt omhoog ---------- */
  const stepsList = $('[data-steps]');
  const stepsEl = $('.steps');
  const nowCol = $('.steps__now-col');
  const items = $$('.steps__list li');
  if (hasGsap && !reduce && stepsList) {
    stepsEl.classList.add('steps--live');
    const fill = $('[data-steps-fill]', stepsList);
    fill.style.setProperty('--p', 0);
    ScrollTrigger.create({ trigger: stepsList, start: 'top 65%', end: 'bottom 60%', onUpdate: (self) => fill.style.setProperty('--p', self.progress) });
    items.forEach((li, i) => ScrollTrigger.create({
      trigger: li, start: 'top 68%',
      onEnter: () => { li.classList.add('is-active'); nowCol.style.setProperty('--i', i); },
      onLeaveBack: () => { li.classList.remove('is-active'); nowCol.style.setProperty('--i', Math.max(0, i - 1)); },
    }));
  } else items.forEach((li) => li.classList.add('is-active'));

  /* ---------- extra beweging: alles verticaal, nooit een kop van links naar rechts ---------- */
  const bq = $('blockquote');
  if (hasGsap && !reduce) {
    // voortgangslijn onderaan de navigatie
    const prog = $('[data-progress]');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => prog.style.setProperty('--p', self.progress) });

    // de diensten komen als vier panelen van onder naar boven in beeld
    gsap.fromTo(panes, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.out', stagger: 0.13,
      scrollTrigger: { trigger: '[data-panes]', start: 'top 82%', once: true }, clearProps: 'clipPath' });

    // lopende tekst, lijstjes en formulier stijgen zacht op, een voor een
    const rise = ['.sec__note', '.cmp-copy p', '.over__text > p', '.over__who li', '.steps__list li', '.offer__copy > p', '.offer__direct li', '.form > *'].join(',');
    gsap.set(rise, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(rise, {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true, clearProps: 'transform' }),
    });

    // de balk naast het citaat groeit in beeld
    if (bq) ScrollTrigger.create({ trigger: bq, start: 'top 88%', once: true, onEnter: () => bq.classList.add('is-in') });

    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      // knoppen trekken zacht naar de muis toe
      $$('.btn--lg').forEach((b) => {
        const mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
        b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.14); my((e.clientY - r.top - r.height / 2) * 0.3); });
        b.addEventListener('pointerleave', () => { mx(0); my(0); });
      });

      // de hero-foto reageert subtiel op de muis, pas als de veeg klaar is
      const hx = gsap.quickTo(heroImg, 'x', { duration: 1.2, ease: 'power3' }), hy = gsap.quickTo(heroImg, 'y', { duration: 1.2, ease: 'power3' });
      gsap.set(heroImg, { scale: 1.05 });
      hero.addEventListener('pointermove', (e) => {
        if (heroFilm.isConnected) return;
        const r = hero.getBoundingClientRect();
        hx(-((e.clientX - r.left) / r.width - 0.5) * 22); hy(-((e.clientY - r.top) / r.height - 0.5) * 14);
      });
      hero.addEventListener('pointerleave', () => { hx(0); hy(0); });
    }
  } else if (bq) bq.classList.add('is-in');

  /* ---------- snelle acties verbergen bij het formulier ---------- */
  const dock = $('[data-dock]');
  const offer = $('#offerte');
  if (dock && offer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dock.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe(offer);
  }

  /* ---------- offerteformulier ---------- */
  const form = $('[data-form]');
  const status = $('[data-form-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rules = {
      naam: () => (form.naam.value.trim() ? '' : 'Vul uw naam in.'),
      tel: () => {
        const v = form.tel.value.trim();
        if (!v) return 'Vul een telefoonnummer in zodat we u kunnen bellen.';
        return v.replace(/\D/g, '').length < 9 ? 'Dit nummer lijkt te kort. Controleer de cijfers.' : '';
      },
      plaats: () => (form.plaats.value.trim() ? '' : 'Vul de plaats van de klus in.'),
    };
    let first = null;
    for (const [name, check] of Object.entries(rules)) {
      const msg = check();
      form[name].setAttribute('aria-invalid', String(Boolean(msg)));
      $('#e-' + name).textContent = msg;
      if (msg && !first) first = form[name];
    }
    if (first) { status.textContent = ''; first.focus(); return; }
    const body = [`Ik ben: ${form.type.value}`, `Naam: ${form.naam.value}`, `Telefoon: ${form.tel.value}`, `Plaats: ${form.plaats.value}`, `Dienst: ${form.dienst.value}`, '', form.info.value].join('\n');
    status.textContent = 'Uw e-mailprogramma opent met de aanvraag ingevuld. Verstuur die mail om af te ronden. Dit is een prototype: er is niets verzonden.';
    location.href = `mailto:contact.adkcleaning@gmail.com?subject=${encodeURIComponent('Offerteaanvraag via de website')}&body=${encodeURIComponent(body)}`;
  });
})();
