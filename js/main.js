/**
 * MA SOLUÇÕES E ENGENHARIA — 1:1 VIDEO MOTION ENGINE
 * Coreografias fiéis ao vídeo de referência:
 * 1. Indicador deslizante na barra branca de Tabs do Hero + auto-play suave
 * 2. Expansão fluida dos anéis concêntricos em cápsula + efeito de digitação no scroll (00:04 - 00:05)
 * 3. Carrossel interativo das 3 colunas ovais no fundo branco com botões < > (00:06 - 00:07)
 * 4. Linha vertical central fina com ponto viajante sincronizado ao scroll (00:09 - 00:14)
 * 5. Modal do vídeo de referência principal e integração direta com WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  initTopNavbar();
  initHeroGlidingTabs();
  initConcentricScrollMotion();
  initOvalCarouselControls();
  initZigzagTimelineScroll();
  initVideoModal();
  initCleanContactForm();
});

/* ==========================================================================
   1. TOP NAVBAR & MOBILE MENU
   ========================================================================== */
function initTopNavbar() {
  const navbar = document.getElementById('topNavbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 16) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }, { passive: true });

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

/* ==========================================================================
   2. HERO WHITE TAB BAR WITH GLIDING PILL INDICATOR (1:1 Video 00:00 - 00:01)
   ========================================================================== */
function initHeroGlidingTabs() {
  const tabbar = document.getElementById('heroTabbar');
  const indicator = document.getElementById('tabbarIndicator');
  const tabs = Array.from(document.querySelectorAll('.hero-tab'));
  const panels = Array.from(document.querySelectorAll('.hero-panel'));

  if (!tabbar || !indicator || !tabs.length) return;

  let currentIndex = 0;
  let autoCycleTimer = null;
  let userInteracted = false;

  function moveIndicator(activeTab) {
    if (!activeTab) return;
    const tabRect = activeTab.getBoundingClientRect();
    const barRect = tabbar.getBoundingClientRect();
    const offsetLeft = tabRect.left - barRect.left + tabbar.scrollLeft;

    indicator.style.width = `${tabRect.width}px`;
    indicator.style.transform = `translateX(${offsetLeft - 7}px)`;
  }

  function activateTab(index) {
    currentIndex = index;
    const targetTab = tabs[index];
    const targetPanelId = targetTab.getAttribute('data-panel');

    tabs.forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });

    panels.forEach(p => {
      p.classList.toggle('active', p.id === targetPanelId);
    });

    moveIndicator(targetTab);
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      userInteracted = true;
      stopAutoCycle();
      activateTab(idx);
    });
  });

  window.addEventListener('resize', () => {
    moveIndicator(tabs[currentIndex]);
  });

  // Initial position after layout settles
  requestAnimationFrame(() => {
    moveIndicator(tabs[0]);
  });

  function startAutoCycle() {
    autoCycleTimer = setInterval(() => {
      if (userInteracted) return;
      const next = (currentIndex + 1) % tabs.length;
      activateTab(next);
    }, 4200);
  }

  function stopAutoCycle() {
    if (autoCycleTimer) {
      clearInterval(autoCycleTimer);
      autoCycleTimer = null;
    }
  }

  startAutoCycle();
}

/* ==========================================================================
   3. SCENE 3: CONCENTRIC STADIUM PILLS & TYPEWRITER ON SCROLL (00:04 - 00:05)
   ========================================================================== */
function initConcentricScrollMotion() {
  const outer = document.getElementById('stadiumOuter');
  const mid = document.getElementById('stadiumMid');
  const inner = document.getElementById('stadiumInner');
  const heading = document.getElementById('typewriterHeading');

  if (!outer || !heading) return;

  const fullText = 'O que é a MA Soluções e Engenharia?';
  const shortText = 'O que é a';
  let hasTyped = false;

  function runTypewriter() {
    if (hasTyped) return;
    hasTyped = true;
    heading.textContent = shortText;
    let i = shortText.length;

    const interval = setInterval(() => {
      i++;
      heading.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 38);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runTypewriter();
      }
    });
  }, { threshold: 0.45 });

  observer.observe(outer);

  window.addEventListener('scroll', () => {
    const rect = outer.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top < vh && rect.bottom > 0) {
      const progress = Math.min(1, Math.max(0, 1 - Math.abs((rect.top + rect.height / 2 - vh / 2) / (vh * 0.7))));
      const scaleOuter = 0.94 + progress * 0.06;
      const scaleMid = 0.95 + progress * 0.05;
      const scaleInner = 0.96 + progress * 0.04;

      outer.style.transform = `scale(${scaleOuter.toFixed(3)})`;
      if (mid) mid.style.transform = `scale(${scaleMid.toFixed(3)})`;
      if (inner) inner.style.transform = `scale(${scaleInner.toFixed(3)})`;
    }
  }, { passive: true });
}

/* ==========================================================================
   4. SCENE 4: 3-COLUMN OVAL SHOWCASE CONTROLS (< > BUTTONS — 00:06 - 00:07)
   ========================================================================== */
function initOvalCarouselControls() {
  const track = document.getElementById('ovalTrack');
  const prevBtn = document.getElementById('ovalPrevBtn');
  const nextBtn = document.getElementById('ovalNextBtn');

  if (!track || !prevBtn || !nextBtn) return;

  let isAnimating = false;

  nextBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    track.style.transform = 'translateX(-18px)';
    setTimeout(() => {
      const first = track.firstElementChild;
      if (first) track.appendChild(first);
      track.style.transform = 'translateX(0)';
      isAnimating = false;
    }, 260);
  });

  prevBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    track.style.transform = 'translateX(18px)';
    setTimeout(() => {
      const last = track.lastElementChild;
      if (last) track.prepend(last);
      track.style.transform = 'translateX(0)';
      isAnimating = false;
    }, 260);
  });
}

/* ==========================================================================
   5. SCENE 6: THIN CENTRAL TIMELINE LINE & TRAVELLING DOT (00:09 - 00:14)
   ========================================================================== */
function initZigzagTimelineScroll() {
  const container = document.getElementById('zigzagTimeline');
  const progressLine = document.getElementById('timelineProgress');
  const dot = document.getElementById('timelineDot');

  if (!container || !progressLine || !dot) return;

  function updateTimeline() {
    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const startOffset = vh * 0.55;
    const scrolled = startOffset - rect.top;
    const percentage = Math.min(100, Math.max(0, (scrolled / rect.height) * 100));

    progressLine.style.height = `${percentage.toFixed(2)}%`;
    dot.style.top = `${percentage.toFixed(2)}%`;
  }

  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
}

/* ==========================================================================
   6. REFERENCE VIDEO MODAL (`assets/video-referencia.mp4`)
   ========================================================================== */
function initVideoModal() {
  const openBtn = document.getElementById('openVideoDemoBtn');
  const modal = document.getElementById('videoModal');
  const closeBtn = document.getElementById('closeVideoModalBtn');
  const player = document.getElementById('refVideoPlayer');

  if (!openBtn || !modal || !closeBtn || !player) return;

  openBtn.addEventListener('click', () => {
    modal.classList.add('open');
    player.currentTime = 0;
    player.play().catch(() => {});
  });

  function closeModal() {
    modal.classList.remove('open');
    player.pause();
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* ==========================================================================
   7. CLEAN CONTACT FORM TO WHATSAPP
   ========================================================================== */
function initCleanContactForm() {
  const form = document.getElementById('cleanContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('fNome').value.trim();
    const sobrenome = document.getElementById('fSobrenome').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const telefone = document.getElementById('fTelefone').value.trim();
    const mensagem = document.getElementById('fMensagem').value.trim();

    const text = encodeURIComponent(
      `Olá, MA Soluções e Engenharia!\n\n` +
      `Nome: ${nome} ${sobrenome}\n` +
      `Email: ${email}\n` +
      `Telefone: ${telefone || 'Não informado'}\n` +
      `Mensagem: ${mensagem}`
    );

    window.open(`https://wa.me/5531988469218?text=${text}`, '_blank');
    form.reset();
  });
}
