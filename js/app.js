/**
 * ============================================================================
 * MATHEUS FELIPE — PORTFÓLIO (GLINTO.CO.KR × CODE MAKERS HERO)
 * Lenis Smooth Scroll Fluido · Sistema de Abas Internas · Glinto Center Scroll
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. LISTA DE PROJETOS (DADOS REAIS — USADOS NA HOME E NA ABA PROJETOS)
  // --------------------------------------------------------------------------
  const PROJECTS_LIST = [
    {
      id: 'anl-engenharia',
      title: 'ANL Engenharia',
      categoryFilter: 'web',
      categories: ['web', 'design'],
      categoriaLabel: 'Engenharia & Consultoria',
      tipoProjeto: 'Website Institucional & Soluções Técnicas',
      summary: 'Portal corporativo de alta conversão com animações suaves, diagramas técnicos interativos e foco em geração de orçamentos.',
      stack: ['React', 'Tailwind', 'Framer Motion', 'Lenis'],
      badge: '{ Engenharia }',
      year: '2026',
      date: '2026 / Concluído',
      image: 'assets/anl-engenharia.jpg',
      url: 'https://anlengenharia.vercel.app/'
    },
    {
      id: 'projeto-01',
      title: 'Monarch Superyachts',
      categoryFilter: 'web',
      categories: ['web', 'design'],
      categoriaLabel: 'Luxo Náutico',
      tipoProjeto: 'Website Editorial & Experiência Visual',
      summary: 'Experiência editorial imersiva para estaleiro de superiates com tipografia de luxo, parallax contínuo e scroll Lenis 1.1.18.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'Lenis'],
      badge: '{ Editorial }',
      year: '2026',
      date: '2026 / Concluído',
      image: 'assets/monarch.jpg',
      url: 'https://monarch-seven-wine.vercel.app/'
    },
    {
      id: 'projeto-02',
      title: 'Nexa Web',
      categoryFilter: 'sistemas',
      categories: ['sistemas', 'web'],
      categoriaLabel: 'Telecomunicações',
      tipoProjeto: 'Plataforma Web & Consulta CEP',
      summary: 'Plataforma de fibra óptica com hero espacial de partículas, arquitetura modular e consulta dinâmica de cobertura.',
      stack: ['JavaScript', 'Canvas FX', 'CSS3', 'API CEP'],
      badge: '{ Engenharia }',
      year: '2026',
      date: '2026 / Concluído',
      image: 'assets/nexa.jpg',
      url: 'https://nexa-mauve-alpha-90.vercel.app/'
    },
    {
      id: 'projeto-03',
      title: 'Vanice Estates',
      categoryFilter: 'web',
      categories: ['web', 'design'],
      categoriaLabel: 'Imobiliário High-End',
      tipoProjeto: 'Portal de Imóveis & Coleção Privada',
      summary: 'Vitrine minimalista para residências de exceção no Rio de Janeiro, com direção de arte escura e navegação curada.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'UI Design'],
      badge: '{ Design }',
      year: '2026',
      date: '2026 / Concluído',
      image: 'assets/vanice.png',
      url: 'https://vanice-five.vercel.app/'
    },
    {
      id: 'projeto-04',
      title: 'Prospectly SaaS',
      categoryFilter: 'sistemas',
      categories: ['sistemas'],
      categoriaLabel: 'B2B & Automação',
      tipoProjeto: 'SaaS & Motor de Prospecção',
      summary: 'Suite para agências analisarem estabelecimentos no Google Maps e gerarem páginas de demonstração em segundos.',
      stack: ['Python', 'JavaScript', 'Maps API', 'SaaS'],
      badge: '{ Python & JS }',
      year: '2026',
      date: '2026 / Concluído',
      image: 'assets/prospectly.png',
      url: 'https://prospectly-tau.vercel.app/'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. LENIS SMOOTH SCROLL ENGINE (LENIS@1.1.18 IDÊNTICO AO MONARCH)
  // --------------------------------------------------------------------------
  let lenis = null;
  const scrollProgressEl = document.getElementById('aw-scroll-progress');

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    if (document.getElementById('aw-preloader')) {
      lenis.stop();
    }

    function raf(now) {
      requestAnimationFrame(raf);
      lenis.raf(now);

      if (scrollProgressEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
        scrollProgressEl.style.width = pct.toFixed(2) + '%';
      }
    }
    requestAnimationFrame(raf);
  }

  // --------------------------------------------------------------------------
  // 2B. PRELOADER SPLIT-CURTAIN ESTILO AWWWARDS / MONARCH
  // --------------------------------------------------------------------------
  (function initPreloader() {
    const preloader = document.getElementById('aw-preloader');
    if (!preloader) return;
    const bar = document.getElementById('aw-pre-bar');
    const count = document.getElementById('aw-pre-count');
    let loaded = document.readyState === 'complete';
    if (!loaded) window.addEventListener('load', () => { loaded = true; });
    setTimeout(() => { loaded = true; }, 1400);

    const t0 = performance.now();
    let shown = 0;

    function step() {
      const target = loaded ? 100 : 88;
      const elapsed = Math.min(1, (performance.now() - t0) / 1150);
      shown = Math.min(shown + (target - shown) * 0.12, elapsed * 100);
      if (loaded && elapsed >= 1) shown = 100;

      if (bar) bar.style.width = shown.toFixed(1) + '%';
      if (count) count.textContent = String(Math.round(shown)).padStart(3, '0');

      if (shown < 99.5) {
        requestAnimationFrame(step);
        return;
      }

      if (bar) bar.style.width = '100%';
      if (count) count.textContent = '100';

      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.remove('is-loading');
        if (lenis) {
          lenis.start();
          lenis.resize();
        }
        window.dispatchEvent(new CustomEvent('pf:preloaded'));
        setTimeout(() => {
          if (preloader.parentNode) preloader.remove();
        }, 1250);
      }, 160);
    }
    requestAnimationFrame(step);
  })();

  // --------------------------------------------------------------------------
  // 3. BARRA EM VIDRO FOSCO/ÁGUA E SISTEMA DE ABAS SEPARADAS DENTRO DO SITE
  // --------------------------------------------------------------------------
  const waterNav = document.getElementById('water-nav');
  const navDroplet = document.getElementById('nav-droplet');
  const tabButtons = document.querySelectorAll('.water-tab');
  const tabViews = document.querySelectorAll('.tab-view');

  function moveDropletToTab(tabBtn) {
    if (!navDroplet || !tabBtn || !waterNav) return;
    const navRect = waterNav.getBoundingClientRect();
    const btnRect = tabBtn.getBoundingClientRect();
    const left = btnRect.left - navRect.left;
    navDroplet.style.width = `${btnRect.width}px`;
    navDroplet.style.transform = `translate3d(${left - 8}px, 0, 0)`;
  }

  function updateDropletToActive() {
    const activeBtn = document.querySelector('.water-tab.active');
    if (activeBtn) moveDropletToTab(activeBtn);
  }

  function switchSiteTab(tabName) {
    tabViews.forEach((view) => {
      const match = view.getAttribute('data-view') === tabName;
      view.classList.toggle('is-active', match);
      if (match) {
        view.removeAttribute('hidden');
      } else {
        view.setAttribute('hidden', '');
      }
    });

    tabButtons.forEach((btn) => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', match);
    });

    updateDropletToActive();
    window.dispatchEvent(new CustomEvent('pf:tabchange', { detail: tabName }));

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      setTimeout(() => lenis.resize(), 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchSiteTab(btn.getAttribute('data-tab'));
    });
    btn.addEventListener('mouseenter', () => moveDropletToTab(btn));
  });

  if (waterNav) {
    waterNav.addEventListener('mouseleave', updateDropletToActive);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest && e.target.closest('[data-open-tab]');
    if (!trigger) return;
    const targetTab = trigger.getAttribute('data-open-tab');
    if (targetTab) switchSiteTab(targetTab);
  });

  window.addEventListener('resize', updateDropletToActive, { passive: true });
  window.addEventListener('load', updateDropletToActive, { passive: true });
  setTimeout(updateDropletToActive, 120);

  // --------------------------------------------------------------------------
  // 4. CURSOR MAGNÉTICO (MANTIDO COMO PEDIDO)
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorLabel = document.getElementById('cursor-label');

  function bindCursorHoverEvents() {
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseenter', () => {
        if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor') || 'VER';
        document.body.classList.add('cursor-expanded');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-expanded');
      });
    });
  }

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursorDot.style.transform = `translate3d(${targetX - 3.5}px, ${targetY - 3.5}px, 0)`;
      },
      { passive: true }
    );

    function animateCursor() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      const w = cursorRing.offsetWidth || 36;
      const h = cursorRing.offsetHeight || 36;
      cursorRing.style.transform = `translate3d(${ringX - w / 2}px, ${ringY - h / 2}px, 0)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
    bindCursorHoverEvents();
  }

  // --------------------------------------------------------------------------
  // 7. RELÓGIO UTC-3 E BOTÕES DE COPIAR E-MAIL / TELEFONE
  // --------------------------------------------------------------------------
  const liveClock = document.getElementById('live-clock');
  function updateClock() {
    if (!liveClock) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit'
      });
      liveClock.textContent = `${timeStr} UTC-3`;
    } catch (_) {}
  }
  updateClock();
  setInterval(updateClock, 15000);

  const copyEmailBtn = document.getElementById('btn-copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard
        .writeText('matheusfelipe16felipe@gmail.com')
        .then(() => showToast('E-mail copiado: matheusfelipe16felipe@gmail.com'))
        .catch(() => showToast('matheusfelipe16felipe@gmail.com'));
    });
  }

  const copyPhoneBtn = document.getElementById('btn-copy-phone');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      navigator.clipboard
        .writeText('+55 31 97188-0711')
        .then(() => showToast('WhatsApp copiado: (31) 97188-0711'))
        .catch(() => showToast('(31) 97188-0711'));
    });
  }

  function showToast(msg) {
    const toast = document.getElementById('water-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  window.__PF = {
    PROJECTS_LIST,
    switchTab: switchSiteTab,
    bindCursor: bindCursorHoverEvents,
    getLenis: () => lenis,
    showToast
  };
})();
