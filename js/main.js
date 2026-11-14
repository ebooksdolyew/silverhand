/* Menus (o da hero e o da barra fixa): mesmo comportamento para os dois. */
(function () {
    var toggles = document.querySelectorAll('[data-menu]');

    function setOpen(toggle, open) {
      var menu = document.getElementById(toggle.dataset.menu);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      if (open) menu.querySelector('a').focus();
    }
    function closeAll(except) {
      toggles.forEach(function (t) { if (t !== except && t.getAttribute('aria-expanded') === 'true') setOpen(t, false); });
    }

    toggles.forEach(function (toggle) {
      var menu = document.getElementById(toggle.dataset.menu);
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        closeAll(toggle);
        setOpen(toggle, open);
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(toggle, false);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      toggles.forEach(function (t) {
        if (t.getAttribute('aria-expanded') === 'true') { setOpen(t, false); t.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      toggles.forEach(function (t) {
        var menu = document.getElementById(t.dataset.menu);
        if (!menu.hidden && !menu.contains(e.target) && !t.contains(e.target)) setOpen(t, false);
      });
    });
  })();

/* Navegação: fora do topo o logo some e os botões flutuantes ganham fundo. */
  (function () {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    function update() { bar.classList.toggle('is-scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

/* Navbar acompanha a rolagem: o link da seção na tela fica verde e a pílula
   verde desliza até ele. Em "Book a visit" quem acende é o botão de agendar;
   na hero nada acende. */
  (function () {
    var nav = document.querySelector('.topbar-links');
    var cta = document.querySelector('.topbar .topbar-cta');
    var links = [].slice.call(document.querySelectorAll('.topbar-links a, .topbar-menu a:not(.menu-cta)'));
    if (!nav || !links.length) return;
    var pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.appendChild(pill);

    /* seções vigiadas: as dos links da barra e o agendar (o #contact do
       menu do celular fica de fora: o rodapé está atrás do FAQ no palco) */
    var ids = [], seen = {};
    [].slice.call(nav.querySelectorAll('a')).concat(cta ? [cta] : []).forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (id && !seen[id] && document.getElementById(id)) { seen[id] = 1; ids.push(id); }
    });

    /* seções sem link próprio (as de cada serviço) acendem o link de
       data-nav: { el, id } = elemento vigiado e link que ele acende */
    var spots = ids.map(function (id) { return { el: document.getElementById(id), id: id }; });
    [].slice.call(document.querySelectorAll('[data-nav]')).forEach(function (el) {
      if (seen[el.dataset.nav]) spots.push({ el: el, id: el.dataset.nav });
    });

    var current = null, placed = false;
    function place() {
      var a = current && nav.querySelector('a[href="#' + current + '"]');
      if (!a || !a.offsetWidth) { pill.classList.remove('is-on'); return; }
      if (!placed) pill.style.transition = 'none';
      pill.style.setProperty('--px', a.offsetLeft + 'px');
      pill.style.setProperty('--pw', a.offsetWidth + 'px');
      pill.classList.add('is-on');
      if (!placed) { pill.offsetWidth; pill.style.transition = ''; placed = true; }
    }
    function set(id) {
      if (id === current) return;
      current = id;
      links.concat(cta ? [cta] : []).forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      place();
    }
    /* acende a seção mais abaixo cujo topo já passou de 35% da tela */
    var locked = null;
    function pick() {
      if (locked) return;
      var line = window.innerHeight * .35, id = null, best = -Infinity;
      spots.forEach(function (sp) {
        var top = sp.el.getBoundingClientRect().top;
        if (top <= line && top > best) { best = top; id = sp.id; }
      });
      set(id);
    }
    /* clique num link: ele acende na hora e fica até a pessoa rolar por conta
       própria (no fim da página FAQ e agendar dividem a mesma tela) */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      var id = a && a.getAttribute('href').slice(1);
      if (id && seen[id]) { locked = id; set(id); }
    });
    function unlock() { if (locked) { locked = null; onScroll(); } }
    ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, unlock, { passive: true }); });
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; pick(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { placed = false; place(); pick(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placed = false; place(); });
    pick();
  })();

/* Botões: o preenchimento do hover nasce onde o cursor (ou o dedo) entra e
   recolhe para onde ele sai (style.css lê --mx/--my). */
  (function () {
    var sel = '#cta-book-visit, #cta-see-work, .mow-cta, .fin-btn, .fin-nav-cta, .topbar-cta, .menu-cta';
    function origin(e) {
      var el = e.currentTarget, r = el.getBoundingClientRect();
      el.style.setProperty('--mx', Math.round(e.clientX - r.left) + 'px');
      el.style.setProperty('--my', Math.round(e.clientY - r.top) + 'px');
    }
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      el.addEventListener('pointerenter', origin);
      el.addEventListener('pointerleave', origin);
      el.addEventListener('pointerdown', origin);
    });
  })();

/* Animações em loop (folhas, anéis, carrossel, setas) param quando a seção
   sai da tela: style.css pausa tudo dentro de .is-off. */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('main > section'), function (sec) { io.observe(sec); });
  })();

/* Fundo atrás da página: verde-escuro do rodapé da metade para baixo, para o
   "puxar além do fim" (iPhone, Mac) não mostrar uma barra verde-clara. */
  (function () {
    var root = document.documentElement, half = 0, end = null;
    function measure() { half = root.scrollHeight / 2; update(); }
    function update() {
      var v = window.scrollY + window.innerHeight / 2 > half;
      if (v !== end) { end = v; root.classList.toggle('at-end', v); }
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
  })();

/* Seção final: ano do rodapé, formulário (validação local) e serviço
     pré-selecionado quando se chega por um link de serviço. */
  (function () {
    var year = document.getElementById('fin-year');
    if (year) year.textContent = new Date().getFullYear();

    var form = document.getElementById('book-form');
    if (!form) return;
    var status = form.querySelector('.fin-status');
    var select = form.elements.service;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href="#book"][data-service-id]');
      if (link && select.querySelector('option[value="' + link.dataset.serviceId + '"]')) select.value = link.dataset.serviceId;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        var bad = !el.checkValidity() || (el.name === 'phone' && el.value.replace(/\D/g, '').length < 7);
        el.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        status.className = 'fin-status err';
        status.textContent = 'Please fill in every field so we can reach you.';
        firstBad.focus();
        return;
      }
      status.className = 'fin-status';
      status.textContent = 'Thanks, ' + form.elements.name.value.trim().split(' ')[0] + '! We will text you to set up the visit.';
      form.reset();
    });
    form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });
  })();

/* Entrada ao rolar: textos e cartões sobem com fade quando aparecem na tela.
   Quem entra junto (mesma leva do observer) entra em cascata. Sem JS ou com
   movimento reduzido nada é escondido (o CSS só esconde .rv dentro de .js). */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var groups = [
    ['up',   '.hero-location, .hero-title, .hero-desc, #cta-book-visit, #cta-see-work'],
    ['zoom', '.garden-photo'],
    ['up',   '.svc-eyebrow, .svc-title'],
    ['up',   '.mow-cta'],
    ['up',   '.svx-eyebrow, .svx-title, .svx-body'],
    ['left', '.svx-l .svx-art'],
    ['right', '.svx-r .svx-art'],
    ['up',   '.sea-eyebrow, .sea-title'],
    ['up',   '.cmb-txt, .cmb-item, .cmb-step'],
    ['fade', '.cmb-carousel'],
    ['fade', '.cmb-div, .cmb-arrow'],
    ['up',   '.fin-t, .fin-q, .fin-form > .fin-box, .fin-sel-ico'],
    ['zoom', '.fin-map'],
    ['fade', '.fin-photo']
  ];
  var els = [];
  groups.forEach(function (g) {
    document.querySelectorAll(g[1]).forEach(function (el) {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv', 'rv-' + g[0]);
      el.addEventListener('animationend', function done(e) {
        if (e.target !== el) return;
        el.classList.add('rv-done');   /* libera a camada (will-change) */
        el.removeEventListener('animationend', done);
      });
      els.push(el);
    });
  });
  var io = new IntersectionObserver(function (entries) {
    var shown = entries.filter(function (e) { return e.isIntersecting; })
      .map(function (e) { return e.target; })
      .sort(function (a, b) {
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (ra.top - rb.top) || (ra.left - rb.left);
      });
    shown.forEach(function (el, i) {
      el.style.setProperty('--rv-d', (el.classList.contains('rv-mask') ? 200 + i * 160 : Math.min(i * 90, 600)) + 'ms');
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();

/* Efeitos presos à rolagem (cartões de serviços e estações empilhadas).
   A rolagem só calcula o alvo de cada cartão; um laço de animação faz o valor
   mostrado (--sp) deslizar até o alvo, então a rodinha do mouse (que pula de
   ~100 px em ~100 px) vira movimento contínuo. O laço para sozinho quando tudo
   chega no alvo. Só translate/rotate/scale/opacity: nada de layout nem repaint. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = [];   /* { el, target, cur } */
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ease = function (q) { return q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; };

  /* Serviços (linhas do índice): --sp 0 (abaixo da tela) → 1; a coluna da direita começa um pouco depois. */
  var svc = [];   /* os nomes de Our Services usam a revelação com máscara (rv-mask) */

  /* Estações: monte no centro do grupo (girados como cartas) que se desfaz em
     cascata. --dx/--dy = do lugar do cartão até o centro (offsetLeft/Top). */
  var sea = [].slice.call(document.querySelectorAll('.sea-card'));
  var rots = [-7, 5, -3, 8], box = null;
  sea.forEach(function (el, i) {
    el.classList.add('stack');
    el.style.setProperty('--rot', rots[i % rots.length] + 'deg');
    el.style.zIndex = 10 + sea.length - i;   /* o primeiro fica no topo e sai primeiro */
    items.push({ el: el, target: 0, cur: 0, kind: 'sea', i: i });
  });
  function measureSea() {
    var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    sea.forEach(function (c) {
      l = Math.min(l, c.offsetLeft); t = Math.min(t, c.offsetTop);
      r = Math.max(r, c.offsetLeft + c.offsetWidth); b = Math.max(b, c.offsetTop + c.offsetHeight);
    });
    var cx = (l + r) / 2, cy = (t + b) / 2;
    sea.forEach(function (c) {
      c.style.setProperty('--dx', (cx - c.offsetLeft - c.offsetWidth / 2).toFixed(1) + 'px');
      c.style.setProperty('--dy', (cy - c.offsetTop - c.offsetHeight / 2).toFixed(1) + 'px');
    });
    box = { cy: cy };
  }

  function targets() {
    var vh = window.innerHeight, vw = window.innerWidth, p = 0;
    if (sea.length) {
      if (!box) measureSea();
      var mid = sea[0].offsetParent.getBoundingClientRect().top + box.cy; /* centro da pilha na tela */
      p = clamp((vh * .85 - mid) / (vh * .45));   /* pilha a 85% da tela → 40% */
    }
    var step = .2, len = 1 - step * (sea.length - 1);
    items.forEach(function (it) {
      if (it.kind === 'svc') {
        var rc = it.el.getBoundingClientRect();
        it.target = clamp((vh * (1 - .15 * (rc.left / vw)) - rc.top) / (vh * .42));
      } else {
        it.target = ease(clamp((p - it.i * step) / len));
      }
    });
  }

  var running = false, last = 0;
  function frame(now) {
    var dt = Math.min(64, now - (last || now)); last = now;
    var k = 1 - Math.exp(-dt / 110);   /* ~110 ms para cobrir 63% da distância, em qualquer fps */
    var moving = false;
    items.forEach(function (it) {
      var d = it.target - it.cur;
      if (Math.abs(d) < .001) { if (it.cur !== it.target) { it.cur = it.target; it.el.style.setProperty('--sp', it.cur); } return; }
      it.cur += d * k; moving = true;
      it.el.style.setProperty('--sp', it.cur.toFixed(4));
    });
    if (moving) requestAnimationFrame(frame); else { running = false; last = 0; }
  }
  function kick() { if (!near) return; targets(); if (!running) { running = true; requestAnimationFrame(frame); } }

  /* longe das duas seções os cartões já estão no fim (ou no começo) do
     efeito: não precisa medir nada a cada rolagem. Ao sair, calcula uma última
     vez para assentar no valor final. */
  var near = true;
  if ('IntersectionObserver' in window) {
    var seen = new Map();
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen.set(e.target, e.isIntersecting); });
      var was = near;
      near = false; seen.forEach(function (v) { if (v) near = true; });
      if (was && !near) { near = true; kick(); near = false; }
      else if (near) kick();
    }, { rootMargin: '50% 0px' });
    [document.querySelector('.services'), document.querySelector('.seasons')].forEach(function (sec) { if (sec) watch.observe(sec); });
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { box = null; kick(); });
  /* posição inicial sem animar (ex.: recarregar no meio da página) */
  targets();
  items.forEach(function (it) { it.cur = it.target; it.el.style.setProperty('--sp', it.cur); });
})();

/* Seletor de serviço: em aparelhos com mouse, a lista nativa (azul do sistema,
   cantos retos) vira um painel no visual do site. O <select> continua no
   formulário (valor, validação, pré-seleção pelos links); o painel só o
   espelha. No toque fica o seletor nativo do aparelho. */
(function () {
  var select = document.querySelector('#book-form select[name="service"]');
  if (!select || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var ico = select.parentNode.querySelector('.fin-sel-ico');
  var dd = document.createElement('div');
  dd.className = 'fin-dd fin-box fin-sel';
  dd.innerHTML = '<button type="button" class="fin-field fin-dd-btn" aria-haspopup="listbox" aria-expanded="false"></button>' +
    '<ul class="fin-dd-list" role="listbox" tabindex="-1" hidden></ul>';
  select.parentNode.insertBefore(dd, select.nextSibling);
  select.classList.add('fin-sel-native');
  select.tabIndex = -1;
  var btn = dd.querySelector('button'), list = dd.querySelector('ul'), active = -1;
  var opts = [].filter.call(select.options, function (o) { return o.value; });
  btn.setAttribute('aria-label', select.getAttribute('aria-label'));
  list.setAttribute('aria-label', select.getAttribute('aria-label'));
  opts.forEach(function (o, i) {
    var li = document.createElement('li');
    li.id = 'fin-dd-' + o.value; li.setAttribute('role', 'option'); li.textContent = o.textContent;
    li.addEventListener('click', function () { pick(i); });
    li.addEventListener('mousemove', function () { setActive(i); });
    list.appendChild(li);
  });
  var items = list.children;
  function sync() {
    var o = select.options[select.selectedIndex];
    btn.textContent = o ? o.textContent : '';
    btn.classList.toggle('is-empty', !select.value);
    opts.forEach(function (op, i) { items[i].setAttribute('aria-selected', String(op.selected && !!select.value)); });
    if (select.getAttribute('aria-invalid') === 'true') btn.setAttribute('aria-invalid', 'true'); else btn.removeAttribute('aria-invalid');
  }
  function setActive(i) {
    if (active > -1) items[active].classList.remove('is-active');
    active = i; items[i].classList.add('is-active');
    list.setAttribute('aria-activedescendant', items[i].id);
    items[i].scrollIntoView({ block: 'nearest' });
  }
  function open() {
    list.hidden = false; btn.setAttribute('aria-expanded', 'true');
    /* a seção final corta o que passa do rodapé: sem espaço embaixo, abre para cima */
    dd.classList.remove('is-up');
    var end = Math.min(window.innerHeight, dd.closest('section').getBoundingClientRect().bottom);
    if (list.getBoundingClientRect().bottom > end - 8) dd.classList.add('is-up'); dd.classList.add('is-open'); if (ico) ico.classList.add('is-open');
    var cur = opts.findIndex(function (o) { return o.selected && o.value; });
    setActive(cur > -1 ? cur : 0); list.focus();
  }
  function close(refocus) {
    list.hidden = true; btn.setAttribute('aria-expanded', 'false'); dd.classList.remove('is-open'); if (ico) ico.classList.remove('is-open');
    if (refocus) btn.focus();
  }
  function pick(i) {
    select.value = opts[i].value;
    select.removeAttribute('aria-invalid');
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync(); close(true);
  }
  btn.addEventListener('click', function () { list.hidden ? open() : close(true); });
  btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
  list.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(items.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'Tab') close(false);
  });
  document.addEventListener('click', function (e) {
    if (!dd.contains(e.target) && !list.hidden) close(false);
    setTimeout(sync, 0);   /* links "Book" com data-service-id mudam o select sem evento */
  });
  /* o envio marca/limpa o select; foco nele (campo inválido) vai para o botão */
  select.addEventListener('focus', function () { btn.focus(); });
  select.form.addEventListener('submit', function () { setTimeout(sync, 0); });
  select.form.addEventListener('reset', function () { setTimeout(sync, 0); });
  select.addEventListener('change', sync);
  sync();
})();

/* FAQ: as respostas abrem como cartões flutuantes, então só uma fica aberta
   por vez (o name="faq" já faz isso nos navegadores novos; aqui vale para
   todos). Fecha também ao clicar fora ou com Esc. */
(function () {
  var box = document.querySelector('.fin-q[data-accordion]');
  if (!box) return;
  var items = [].slice.call(box.querySelectorAll('details'));
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    if (!box.contains(e.target)) items.forEach(function (d) { d.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = items.filter(function (d) { return d.open; })[0];
    if (open) { open.open = false; open.querySelector('summary').focus(); }
  });
})();

/* Manchas da hero ao carregar: a maior de cada versão é "pintada" da direita
   para a esquerda (uma borda suave e inclinada vai revelando a forma, que não
   se deforma em momento algum); as menores só aparecem em fade, depois.
   Cada mancha anima numa cópia própria (<svg> só com ela, do tamanho da
   mancha inteira, inclusive o que passa da borda do palco), e a original volta
   no fim: nada do SVG é redesenhado a cada quadro. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!Element.prototype.animate) return;
  var svgs = [].filter.call(document.querySelectorAll('.hero-green'), function (s) { return getComputedStyle(s).display !== 'none'; });
  var blobs = [];
  svgs.forEach(function (svg) {
    [].forEach.call(svg.querySelectorAll(':scope > path[fill^="url("], :scope > g:not(.green-in) > path[fill^="url("]'), function (p) {
      var r = p.getBoundingClientRect();
      if (r.width && r.height) blobs.push({ svg: svg, p: p, r: r, area: r.width * r.height });
    });
  });
  if (!blobs.length) return;
  var big = blobs.reduce(function (m, b) { return b.area > m.area ? b : m; });
  var small = 0;
  blobs.forEach(function (bl) {
    var svg = bl.svg, p = bl.p, host0 = svg.parentNode;
    var vb = svg.viewBox.baseVal, box = svg.getBoundingClientRect(), pb = host0.getBoundingClientRect();
    var sx = box.width / vb.width, sy = box.height / vb.height;
    /* caixa da cópia = svg ∪ mancha (a onda do desktop passa da borda do palco) */
    var l = Math.min(0, bl.r.left - box.left), t = Math.min(0, bl.r.top - box.top);
    var rr = Math.max(box.width, bl.r.right - box.left), bb = Math.max(box.height, bl.r.bottom - box.top);
    var parts = [p], m = p.nextElementSibling, g = m && m.nextElementSibling;
    if (m && m.tagName.toLowerCase() === 'mask' && g && g.classList.contains('green-in')) parts.push(m, g);
    var clone = svg.cloneNode(false);
    clone.setAttribute('viewBox', [vb.x + l / sx, vb.y + t / sy, (rr - l) / sx, (bb - t) / sy].join(' '));
    /* posição e tamanho em % do palco (não em px): se a largura mudar durante
       o efeito (a barra de rolagem aparecendo, o celular girando), a cópia
       acompanha a mancha original e não há salto quando ela volta no fim */
    var pct = function (v, of) { return (v / of * 100) + '%'; };
    clone.style.cssText += ';position:absolute;inset:auto;overflow:visible;pointer-events:none;' +
      'left:' + pct(box.left - pb.left + l, pb.width) + ';top:' + pct(box.top - pb.top + t, pb.height) +
      ';width:' + pct(rr - l, pb.width) + ';height:' + pct(bb - t, pb.height) + ';' +
      'z-index:' + getComputedStyle(svg).zIndex + ';will-change:opacity,transform';
    var defs = svg.querySelector('defs'); if (defs) clone.appendChild(defs.cloneNode(true));
    var host = clone;
    if (p.parentNode !== svg) { host = p.parentNode.cloneNode(false); clone.appendChild(host); }
    parts.forEach(function (el) { host.appendChild(el.cloneNode(true)); });
    host0.insertBefore(clone, svg.nextSibling);
    p.style.visibility = 'hidden'; if (parts[2]) parts[2].style.visibility = 'hidden';
    var anim;
    if (bl === big) {
      /* máscara 3× mais larga que a cópia: transparente à esquerda, opaca à
         direita, com uma faixa de transição inclinada que corre da direita
         para a esquerda */
      var mk = 'linear-gradient(100deg, transparent 28%, rgba(0,0,0,.35) 40%, #000 58%)'; /* borda bem larga e macia */
      ['maskImage', 'webkitMaskImage'].forEach(function (k) { clone.style[k] = mk; });
      ['maskSize', 'webkitMaskSize'].forEach(function (k) { clone.style[k] = '300% 100%'; });
      ['maskRepeat', 'webkitMaskRepeat'].forEach(function (k) { clone.style[k] = 'no-repeat'; });
      anim = clone.animate([
        { maskPosition: '0% 0', webkitMaskPosition: '0% 0', transform: 'translateX(1.5%)', opacity: 0 },
        { opacity: 1, offset: .35 },
        { maskPosition: '100% 0', webkitMaskPosition: '100% 0', transform: 'none', opacity: 1 }
      ], { duration: 2400, delay: 100, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'backwards' });
    } else {
      anim = clone.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 1200, delay: 1050 + small++ * 200, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'backwards' });
    }
    anim.onfinish = anim.oncancel = function () {
      p.style.visibility = ''; if (parts[2]) parts[2].style.visibility = '';
      clone.remove();
    };
  });
})();

/* Our Services: a seção fica presa na tela e a haste se desenha junto com o
   scroll (detalhes do "preso" no style.css, .svc-pinned); quando a ponta passa
   pela altura de um nome, a folha dele brota do galho e o nome sobe logo
   depois. Volta ao rolar para cima. O valor mostrado desliza até o alvo (a
   rodinha do mouse pula de ~100 px em ~100 px), como nos cartões das
   estações. Sem JS ou com movimento reduzido fica tudo visível. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sec = document.querySelector('.services');
  if (!sec) return;
  var vines = [].slice.call(sec.querySelectorAll('.svc-vine'));
  var rows = [].slice.call(sec.querySelectorAll('.svc-list li'));
  if (!vines.length || !rows.length) return;
  sec.classList.add('svc-grow');

  var path = null, svg = null, len = 0, cur = 0, target = 0, running = false, last = 0;
  function pick() {   /* a haste visível muda com a orientação/largura */
    svg = vines.filter(function (v) { return getComputedStyle(v).display !== 'none'; })[0] || null;
    path = svg && svg.querySelector('path');
    len = path ? path.getTotalLength() : 0;
  }
  var stage = sec.querySelector('.svc-stage'), pin = sec.querySelector('.svc-pin');
  function mode() {   /* prende o palco só se ele couber inteiro na tela */
    sec.classList.toggle('svc-pinned', !!pin && stage.offsetHeight + 24 <= window.innerHeight);
  }
  function measure() {
    if (!path) return;
    var vh = window.innerHeight, p;
    if (sec.classList.contains('svc-pinned')) {
      /* preso: a haste começa um pouco antes de o palco parar (lead) e
         termina exatamente quando ele se solta (fim do .svc-pin) */
      var top = parseFloat(getComputedStyle(stage).top) || 0, lead = vh * .15;
      p = (top + lead - sec.getBoundingClientRect().top) / (pin.offsetHeight + lead);
    } else {
      /* sem prender: começa quando o topo da haste chega a 80% da tela e
         termina quando a ponta de baixo chega a 60% */
      var r = path.getBoundingClientRect();
      p = (vh * .8 - r.top) / (r.height + vh * .2);
    }
    target = p < 0 ? 0 : p > 1 ? 1 : p;
  }
  function draw() {
    path.style.strokeDashoffset = (1 - cur).toFixed(4);
    var sr = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var tipY = sr.top + path.getPointAtLength(cur * len).y * sr.height / vb.height;
    rows.forEach(function (li) {
      var lr = li.getBoundingClientRect();
      li.classList.toggle('is-grown', cur > .001 && tipY >= lr.top + lr.height / 2 - 2);
    });
  }
  function frame(now) {
    var dt = Math.min(64, now - (last || now)); last = now;
    var d = target - cur;
    if (Math.abs(d) < .0008) { cur = target; draw(); running = false; last = 0; return; }
    cur += d * (1 - Math.exp(-dt / 120));
    draw();
    requestAnimationFrame(frame);
  }
  function kick() {
    var r = sec.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;   /* longe: nada a fazer */
    measure();
    if (!running) { running = true; requestAnimationFrame(frame); }
  }
  mode(); pick(); measure(); cur = target; if (path) draw();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { mode(); pick(); measure(); cur = target; if (path) draw(); });
})();
