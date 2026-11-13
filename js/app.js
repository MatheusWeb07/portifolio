/**
 * ============================================================================
 * MATHEUS FELIPE — PORTFÓLIO (GLINTO.CO.KR × CODE MAKERS HERO)
 * Lenis Smooth Scroll Fluido · Sistema de Abas Internas · Glinto Center Scroll
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. LISTA DE PROJETOS (FORMATO EXATO DO PRINT ANEXADO DA GLINTO)
  //    Pronta para receber os projetos reais que você indicar
  // --------------------------------------------------------------------------
  const PROJECTS_LIST = [
    {
      id: 'anl-engenharia',
      title: 'ANL Engenharia',
      categoryFilter: 'web',
      categoriaLabel: 'engenharia & consultoria',
      tipoProjeto: 'Website Institucional & Soluções Técnicas',
      badge: '{ Engenharia }',
      date: '2026 / Concluído',
      image: 'assets/anl-engenharia.jpg',
      url: 'https://anlengenharia.vercel.app/'
    },
    {
      id: 'projeto-01',
      title: 'Monarch Superyachts',
      categoryFilter: 'web',
      categoriaLabel: 'luxo náutico',
      tipoProjeto: 'Website Institucional & Catálogo',
      badge: '{ Engenharia }',
      date: '2026 / 2 meses',
      image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80',
      url: 'sites/monarch/index.html'
    },
    {
      id: 'projeto-02',
      title: 'Nexa Web',
      categoryFilter: 'sistemas',
      categoriaLabel: 'telecomunicações',
      tipoProjeto: 'Plataforma Web & Sistema Integrado',
      badge: '{ Engenharia }',
      date: '2026 / 3+ meses',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      url: 'sites/nexa/index.html'
    },
    {
      id: 'projeto-03',
      title: 'Vanice Estates',
      categoryFilter: 'web',
      categoriaLabel: 'imobiliário',
      tipoProjeto: 'Portal de Imóveis & Concierge',
      badge: '{ Web }',
      date: '2026 / 2 meses',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
      url: 'sites/vanice/index.html'
    },
    {
      id: 'projeto-04',
      title: 'Prospectly SaaS',
      categoryFilter: 'sistemas',
      categoriaLabel: 'b2b & automação',
      tipoProjeto: 'Aplicação Web & Painel de Gestão',
      badge: '{ Python & JS }',
      date: '2026 / 3+ meses',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      url: 'https://prospectly-tau.vercel.app/'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. LENIS SMOOTH SCROLL ENGINE (CONFIGURAÇÃO EXATA DO PROJETO ANL — SUPER FLUIDO)
  // --------------------------------------------------------------------------
  let lenis = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 0.65,
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

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

  document.querySelectorAll('[data-open-tab]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetTab = trigger.getAttribute('data-open-tab');
      if (targetTab) switchSiteTab(targetTab);
    });
  });

  window.addEventListener('resize', updateDropletToActive, { passive: true });
  window.addEventListener('load', updateDropletToActive, { passive: true });
  setTimeout(updateDropletToActive, 120);

  // --------------------------------------------------------------------------
  // 4. GLINTO INFO ROWS (ANIMAÇÕES DE ENTRADA ESTILO ANL + BARRA INFERIOR)
  // --------------------------------------------------------------------------
  const streamSteps = document.querySelectorAll('[data-scroll-step]');
  const bottomBarItems = document.querySelectorAll('[data-jump-step]');

  function setActiveGlintoStep(stepIndex) {
    bottomBarItems.forEach((item) => {
      const match = Number(item.getAttribute('data-jump-step')) === stepIndex;
      item.classList.toggle('is-active', match);
    });
  }

  if ('IntersectionObserver' in window && streamSteps.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            const idx = Number(entry.target.getAttribute('data-scroll-step'));
            setActiveGlintoStep(idx);
          } else if (entry.intersectionRatio === 0) {
            entry.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: [0, 0.16],
        rootMargin: '0px 0px -6% 0px'
      }
    );

    streamSteps.forEach((stepEl) => revealObserver.observe(stepEl));
  } else {
    streamSteps.forEach((stepEl) => stepEl.classList.add('in-view'));
  }

  bottomBarItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-jump-step'));
      const targetStep = document.querySelector(`[data-scroll-step="${idx}"]`);
      if (targetStep) {
        targetStep.classList.add('in-view');
        setActiveGlintoStep(idx);
        if (lenis) {
          lenis.scrollTo(targetStep, { offset: -100, duration: 1.2 });
        } else {
          targetStep.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. RENDERIZAÇÃO DO CATÁLOGO DE PROJETOS (ESTILO EXATO DO PRINT ANEXADO)
  // --------------------------------------------------------------------------
  const worksGrid = document.getElementById('glinto-works-grid');
  const filterBtns = document.querySelectorAll('[data-work-filter]');

  function renderWorksGrid(filter = 'all') {
    if (!worksGrid) return;
    const items =
      filter === 'all'
        ? PROJECTS_LIST
        : PROJECTS_LIST.filter((p) => p.categoryFilter === filter);

    worksGrid.innerHTML = items
      .map(
        (p) => `
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="glinto-work-card" data-cursor="ABRIR">
          <div class="glinto-work-thumb">
            <span class="glinto-work-badge">${p.badge}</span>
            <img src="${p.image}" alt="${p.title}" width="520" height="325" loading="lazy">
          </div>
          <div class="glinto-work-meta">
            <span>categoria <strong>${p.categoriaLabel}</strong></span>
            <span>tipo de projeto <strong>${p.tipoProjeto}</strong></span>
          </div>
          <h2 class="glinto-work-name">${p.title}</h2>
          <div class="glinto-work-date">${p.date}</div>
        </a>
      `
      )
      .join('');

    bindCursorHoverEvents();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorksGrid(btn.getAttribute('data-work-filter'));
    });
  });

  renderWorksGrid('all');

  // --------------------------------------------------------------------------
  // 6. CURSOR MAGNÉTICO (MANTIDO COMO PEDIDO)
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
})();
