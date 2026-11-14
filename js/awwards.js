/**
 * ============================================================================
 * MATHEUS FELIPE — PORTFÓLIO · CAMADA "AWWARDS"
 * 1. Esfera de água interativa (WebGL, shader próprio — sem bibliotecas)
 * 2. Manifesto com palavras que acendem no scroll
 * 3. Lista de capacidades com preview que segue o cursor
 * 4. Projetos com scroll vertical → horizontal (fixo na tela)
 * 5. Reveals de entrada + botão magnético
 * ============================================================================
 */
(function () {
  'use strict';

  const PF = window.__PF || {};
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = false;
  const fine = window.matchMedia('(pointer: fine)').matches;

  const viewInicio = document.getElementById('view-inicio');
  const inicioActive = () => viewInicio && viewInicio.classList.contains('is-active');

  // ==========================================================================
  // 1. ESFERA DE ÁGUA INTERATIVA (WEBGL)
  // ==========================================================================
  (function initWaterOrb() {
    const canvas = document.getElementById('water-orb');
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true }) ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      canvas.classList.add('no-gl');
      return;
    }

    const VERT = `
      attribute vec2 aPos;
      void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
    `;

    const FRAG = `
      precision highp float;
      uniform vec2  uRes;
      uniform float uTime;
      uniform vec2  uOff;
      uniform vec2  uLight;
      uniform vec4  uRip[8];

      // Altura da superfície da água: ondas das gotas + movimento ocioso
      float height(vec2 p){
        float h = 0.0;
        for(int i = 0; i < 8; i++){
          vec4 r = uRip[i];
          float age = uTime - r.z;
          if(age > 0.0 && age < 4.5){
            float d = length(p - r.xy);
            float front = age * 0.6;
            float env = exp(-abs(d - front) * 4.2) * exp(-age * 1.05);
            h += sin((d - front) * 32.0) * env * 0.42 * r.w;
          }
        }
        return h;
      }

      float idle(vec2 p){
        float h = 0.06 * sin(p.x * 6.0 + uTime * 1.05 + 1.6 * sin(p.y * 5.0 - uTime * 0.7));
        h += 0.042 * sin(p.y * 10.0 - uTime * 1.25 + 1.3 * sin(p.x * 6.0 + uTime * 0.85));
        return h;
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
        vec2 c  = uv - uOff;
        float R = 0.74;
        float r = length(c);

        float halo = exp(-max(r - R, 0.0) * 5.5) * 0.38;
        vec3 haloCol = vec3(1.0, 0.16, 0.27);

        vec3 col = vec3(0.0);
        float a = 0.0;

        if(r < R){
          float z = sqrt(R * R - r * r) / R;
          vec3 n = normalize(vec3(c / R, z));

          // normal perturbada pelas ondas
          float e = 0.012;
          float h0 = height(uv) + idle(uv);
          float hx = height(uv + vec2(e, 0.0)) + idle(uv + vec2(e, 0.0)) - h0;
          float hy = height(uv + vec2(0.0, e)) + idle(uv + vec2(0.0, e)) - h0;
          vec2 g = vec2(hx, hy) / e;
          n = normalize(n + vec3(-g * 0.05, 0.0));

          vec3 V = vec3(0.0, 0.0, 1.0);
          float fres = pow(1.0 - max(dot(n, V), 0.0), 2.4);

          // luz que segue o mouse
          vec3 L = normalize(vec3(uLight, 0.85));
          vec3 H = normalize(L + V);
          float spec = pow(max(dot(n, H), 0.0), 110.0);
          float spec2 = pow(max(dot(n, normalize(vec3(-0.55, 0.5, 0.75) + V)), 0.0), 60.0);

          // refração: linhas topográficas vistas através da água
          vec2 rp = c + n.xy * 0.42;
          float f = rp.y * 0.95
                  + 0.22 * sin(rp.x * 3.2 + uTime * 0.35)
                  + 0.10 * sin(rp.x * 7.5 - uTime * 0.28 + rp.y * 2.0);
          float lines = smoothstep(0.42, 0.5, abs(fract(f * 9.0) - 0.5));

          vec3 deep = vec3(0.075, 0.006, 0.022);
          vec3 mid  = vec3(0.66, 0.045, 0.13);
          vec3 hot  = vec3(1.0, 0.24, 0.32);
          float dm = smoothstep(-0.75, 0.85, rp.y + 0.3 * n.x);

          col = mix(deep, mid, dm * 0.9);
          col += lines * mix(vec3(0.75, 0.09, 0.17), hot, dm) * 0.95;

          // cáusticas
          float caus = pow(max(sin(rp.x * 15.0 + h0 * 34.0) * sin(rp.y * 15.0 - uTime * 0.7 + h0 * 20.0), 0.0), 5.0);
          col += caus * 0.16 * hot;

          // brilho de borda (fresnel) + reflexo do céu
          float sky = smoothstep(0.0, 1.0, n.y * 0.5 + 0.5);
          col += fres * vec3(1.0, 0.34, 0.44) * 0.9;
          col += sky * fres * 0.28 * vec3(1.0, 0.55, 0.6);

          // especulares (água molhada)
          col += spec * vec3(1.0, 0.92, 0.94) * 1.5;
          col += spec2 * vec3(1.0, 0.7, 0.75) * 0.45;

          col = 1.0 - exp(-col * 1.35);
          a = 1.0 - smoothstep(R - 0.012, R, r);
        }

        vec3 outCol = col * a + haloCol * halo * (1.0 - a);
        float outA  = a + halo * (1.0 - a);
        gl_FragColor = vec4(outCol, outA);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[orb] shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.classList.add('no-gl');
      return;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.classList.add('no-gl');
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uOff = gl.getUniformLocation(prog, 'uOff');
    const uLight = gl.getUniformLocation(prog, 'uLight');
    const uRip = gl.getUniformLocation(prog, 'uRip');

    gl.clearColor(0, 0, 0, 0);

    // anel de ondulações (x, y, t0, força)
    const rips = new Float32Array(32);
    for (let i = 0; i < 8; i++) rips[i * 4 + 2] = -100;
    let ripIdx = 0;
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;

    function addRipple(x, y, s) {
      rips[ripIdx * 4] = x;
      rips[ripIdx * 4 + 1] = y;
      rips[ripIdx * 4 + 2] = now();
      rips[ripIdx * 4 + 3] = s;
      ripIdx = (ripIdx + 1) % 8;
    }

    let offX = 0, offY = 0, offTX = 0, offTY = 0;
    let lightX = -0.45, lightY = 0.55, lightTX = -0.45, lightTY = 0.55;
    let lastX = 0, lastY = 0, lastRip = 0, lastMove = 0;

    function toLocal(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: 1 - ((e.clientY - rect.top) / rect.height) * 2,
        w: rect.width
      };
    }

    window.addEventListener(
      'pointermove',
      (e) => {
        if (!inicioActive()) return;
        const p = toLocal(e);
        lastMove = performance.now();
        lightTX = clamp(p.x, -1.4, 1.4) * 0.85;
        lightTY = clamp(p.y, -1.4, 1.4) * 0.85;
        offTX = clamp(p.x, -1.6, 1.6) * 0.06;
        offTY = clamp(p.y, -1.6, 1.6) * 0.06;

        const inside = Math.hypot(p.x - offX, p.y - offY) < 0.8;
        if (inside) {
          const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
          const t = performance.now();
          if (t - lastRip > 65 && dist > 5) {
            addRipple(p.x, p.y, clamp(dist / 38, 0.3, 1.1));
            lastRip = t;
          }
        }
        lastX = e.clientX;
        lastY = e.clientY;
      },
      { passive: true }
    );

    canvas.addEventListener('pointerdown', (e) => {
      const p = toLocal(e);
      addRipple(p.x, p.y, 1.7);
      setTimeout(() => addRipple(p.x, p.y, 1.1), 120);
    });

    // gota ocasional (a água está "viva" mesmo sem interação)
    setInterval(() => {
      if (!inicioActive() || document.hidden) return;
      if (performance.now() - lastMove < 1800) return;
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.45;
      addRipple(offX + Math.cos(ang) * rad, offY + Math.sin(ang) * rad, 0.85);
    }, 2600);

    let visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }).observe(canvas);
    }

    let curW = 0;
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || !inicioActive()) return;
      const cssW = canvas.clientWidth;
      if (!cssW) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.round(cssW * dpr);
      if (px !== curW) {
        canvas.width = px;
        canvas.height = px;
        curW = px;
        gl.viewport(0, 0, px, px);
      }

      offX = lerp(offX, offTX, 0.06);
      offY = lerp(offY, offTY, 0.06);
      lightX = lerp(lightX, lightTX, 0.08);
      lightY = lerp(lightY, lightTY, 0.08);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, px, px);
      gl.uniform1f(uTime, now());
      gl.uniform2f(uOff, offX, offY);
      gl.uniform2f(uLight, lightX, lightY);
      gl.uniform4fv(uRip, rips);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  })();

  // ==========================================================================
  // 2. MANIFESTO — palavras acendem conforme o scroll
  // ==========================================================================
  const manifesto = document.getElementById('aw-manifesto');
  const manifestoText = document.getElementById('aw-manifesto-text');
  let words = [];

  function splitManifesto() {
    if (!manifestoText) return;
    const frag = document.createDocumentFragment();

    function pushWords(text, hl) {
      text.split(/\s+/).filter(Boolean).forEach((w) => {
        const span = document.createElement('span');
        span.className = 'w' + (hl ? ' hl' : '');
        span.textContent = w;
        frag.appendChild(span);
        frag.appendChild(document.createTextNode(' '));
      });
    }

    manifestoText.childNodes.forEach((node) => {
      if (node.nodeType === 3) pushWords(node.textContent, false);
      else if (node.nodeType === 1) pushWords(node.textContent, true);
    });

    manifestoText.textContent = '';
    manifestoText.appendChild(frag);
    words = Array.from(manifestoText.querySelectorAll('.w'));
  }
  splitManifesto();

  function updateManifesto() {
    if (!manifesto || !words.length) return;
    const vh = window.innerHeight;
    const rect = manifestoText.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > vh + 50) {
      if (rect.top > vh) words.forEach((w) => (w.style.opacity = 0.16));
      else words.forEach((w) => (w.style.opacity = 1));
      return;
    }
    const start = vh * 0.88;
    const end = vh * 0.42;
    const p = clamp((start - rect.top) / (start - end + rect.height), 0, 1);
    const n = words.length;
    for (let i = 0; i < n; i++) {
      const t = clamp(p * (n + 2) - i, 0, 1);
      words[i].style.opacity = (0.16 + 0.84 * t).toFixed(3);
    }
  }

  // ==========================================================================
  // 3. CAPACIDADES + PREVIEW FLUTUANTE COMPARTILHADO
  // ==========================================================================
  const preview = document.getElementById('aw-preview');
  const previewInner = document.getElementById('aw-preview-inner');
  const capRows = Array.from(document.querySelectorAll('.aw-cap'));
  const projects = PF.PROJECTS_LIST || [];
  const previewImgs = {};
  let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0, pvRot = 0;

  function ensurePreviewImage(src) {
    if (!previewInner || !src || previewImgs[src]) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    previewInner.appendChild(img);
    previewImgs[src] = img;
  }

  function bindPreviewTriggers(els) {
    if (!preview || !previewInner || !fine) return;
    els.forEach((el) => {
      const src = el.getAttribute('data-preview');
      if (!src) return;
      ensurePreviewImage(src);
      el.addEventListener('mouseenter', () => {
        Object.keys(previewImgs).forEach((k) => previewImgs[k].classList.toggle('active', k === src));
        preview.classList.add('on');
      });
      el.addEventListener('mouseleave', () => preview.classList.remove('on'));
    });
  }

  if (preview && previewInner && fine) {
    projects.forEach((p) => ensurePreviewImage(p.image));
    window.addEventListener(
      'mousemove',
      (e) => {
        pvTX = e.clientX;
        pvTY = e.clientY;
      },
      { passive: true }
    );
    bindPreviewTriggers(capRows);
  }

  function updatePreview() {
    if (!preview || !fine) return;
    const dx = pvTX - pvX;
    pvX = lerp(pvX, pvTX, 0.13);
    pvY = lerp(pvY, pvTY, 0.13);
    pvRot = lerp(pvRot, clamp(dx * 0.08, -9, 9), 0.1);
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    preview.style.transform = `translate3d(${pvX - w / 2}px, ${pvY - h / 2}px, 0) rotate(${pvRot.toFixed(2)}deg)`;
  }

  // ==========================================================================
  // 4. PROJETOS SELECIONADOS — ESTÁGIO 3D + ÍNDICE CINÉTICO
  // ==========================================================================
  const caseListEl = document.getElementById('aw-case-list');
  const stageCurEl = document.getElementById('aw-works-cur');
  const stageTotalEl = document.getElementById('aw-works-total');
  const stageBadgeEl = document.getElementById('aw-stage-badge');
  const stageYearEl = document.getElementById('aw-stage-year');
  const stageImgEl = document.getElementById('aw-stage-img');
  const stageLinkEl = document.getElementById('aw-stage-link');
  const stageCtaEl = document.getElementById('aw-stage-cta');
  const stageCatEl = document.getElementById('aw-stage-cat');
  const stageStackEl = document.getElementById('aw-stage-stack');
  const stageSummaryEl = document.getElementById('aw-stage-summary');
  const stageCurtainEl = document.getElementById('aw-stage-curtain');
  const stageNextBtn = document.getElementById('aw-stage-next');
  const pad2 = (n) => String(n).padStart(2, '0');
  let activeCaseIdx = 0;

  function setActiveCase(idx, withWipe) {
    if (!projects.length) return;
    const nextIdx = ((idx % projects.length) + projects.length) % projects.length;
    const p = projects[nextIdx];
    const changed = nextIdx !== activeCaseIdx;
    activeCaseIdx = nextIdx;

    if (stageCurEl) stageCurEl.textContent = pad2(nextIdx + 1);
    if (stageTotalEl) stageTotalEl.textContent = pad2(projects.length);
    if (stageBadgeEl) stageBadgeEl.textContent = p.badge;
    if (stageYearEl) stageYearEl.textContent = p.year || '2026';
    if (stageCatEl) stageCatEl.textContent = p.categoriaLabel;
    if (stageSummaryEl) stageSummaryEl.textContent = p.summary || '';
    if (stageLinkEl) stageLinkEl.href = p.url;
    if (stageCtaEl) stageCtaEl.href = p.url;

    if (stageStackEl) {
      stageStackEl.innerHTML = (p.stack || []).map((t) => `<span>${t}</span>`).join('');
    }

    if (stageImgEl) {
      if (withWipe && changed && stageCurtainEl && !reduced) {
        stageCurtainEl.classList.remove('wipe');
        void stageCurtainEl.offsetWidth;
        stageCurtainEl.classList.add('wipe');
        setTimeout(() => {
          stageImgEl.src = p.image;
          stageImgEl.alt = p.title;
        }, 160);
      } else {
        stageImgEl.src = p.image;
        stageImgEl.alt = p.title;
      }
    }

    if (caseListEl) {
      const items = caseListEl.querySelectorAll('.aw-case-item');
      items.forEach((el, i) => {
        const active = i === nextIdx;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }
  }

  function initCaseShowcase() {
    if (!caseListEl || !projects.length) return;
    caseListEl.innerHTML = projects
      .map(
        (p, i) => `
      <button type="button" class="aw-case-item${i === 0 ? ' is-active' : ''}" role="option" aria-selected="${i === 0 ? 'true' : 'false'}" data-case-idx="${i}" data-cursor="VER CASO">
        <span class="aw-ci-num">${pad2(i + 1)}</span>
        <span class="aw-ci-main">
          <span class="aw-ci-title">${p.title}</span>
          <span class="aw-ci-sub">${p.categoriaLabel} · ${p.tipoProjeto}</span>
        </span>
        <span class="aw-ci-arrow" aria-hidden="true">↗</span>
      </button>`
      )
      .join('');

    caseListEl.querySelectorAll('.aw-case-item').forEach((btn) => {
      const idx = Number(btn.getAttribute('data-case-idx'));
      btn.addEventListener('mouseenter', () => {
        if (fine) setActiveCase(idx, true);
      });
      btn.addEventListener('click', () => {
        if (idx === activeCaseIdx && !fine) {
          window.open(projects[idx].url, '_blank', 'noopener,noreferrer');
          return;
        }
        setActiveCase(idx, true);
      });
    });

    if (stageNextBtn) {
      stageNextBtn.addEventListener('click', () => setActiveCase(activeCaseIdx + 1, true));
    }

    setActiveCase(0, false);
  }
  initCaseShowcase();

  // ==========================================================================
  // 5. SUPERFÍCIES 3D INTERATIVAS (SPOTLIGHT + TILT) & REVEALS
  // ==========================================================================
  function bindInteractiveSurfaces(root) {
    const scope = root || document;
    if (!fine || reduced) return;

    scope.querySelectorAll('[data-spotlight]').forEach((el) => {
      if (el.dataset.spBound) return;
      el.dataset.spBound = '1';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
      });
    });

    scope.querySelectorAll('[data-tilt]').forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = '1';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${(-ny * 5).toFixed(2)}deg) rotateY(${(nx * 6).toFixed(2)}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
  bindInteractiveSurfaces(document);

  const revealEls = document.querySelectorAll('.aw-reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  function revealTabView(tabName) {
    const view = document.getElementById('view-' + tabName);
    if (!view) return;
    const items = view.querySelectorAll('.aw-tab-reveal');
    items.forEach((el, idx) => {
      el.classList.remove('in');
      requestAnimationFrame(() => {
        setTimeout(() => el.classList.add('in'), reduced ? 0 : idx * 70 + 30);
      });
    });
  }

  // ==========================================================================
  // 6. ABA SOBRE — ODÔMETROS + ACORDEÃO MANIFESTO
  // ==========================================================================
  const sobreRows = Array.from(document.querySelectorAll('#aw-sobre-accordion [data-acc-row]'));
  sobreRows.forEach((row) => {
    const trigger = row.querySelector('.aw-ed-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const wasOpen = row.classList.contains('is-open');
      sobreRows.forEach((r) => {
        r.classList.remove('is-open');
        const btn = r.querySelector('.aw-ed-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        row.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      const l = PF.getLenis && PF.getLenis();
      if (l && l.resize) setTimeout(() => l.resize(), 450);
    });
  });

  function animateSobreCounters() {
    document.querySelectorAll('#view-sobre [data-count]').forEach((el) => {
      const target = Number(el.getAttribute('data-count')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const start = performance.now();
      const dur = 1250;
      function step(now) {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ==========================================================================
  // 7. ABA SERVIÇOS — ACORDEÃO EDITORIAL + PREVIEW FLUTUANTE + HANDOFF CONTATO
  // ==========================================================================
  const srvBands = Array.from(document.querySelectorAll('#aw-srv-accordion [data-srv-band]'));
  bindPreviewTriggers(srvBands);

  srvBands.forEach((band) => {
    const head = band.querySelector('.aw-srv-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const wasOpen = band.classList.contains('is-open');
      srvBands.forEach((b) => {
        b.classList.remove('is-open');
        const h = b.querySelector('.aw-srv-head');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        band.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
      const l = PF.getLenis && PF.getLenis();
      if (l && l.resize) setTimeout(() => l.resize(), 450);
    });
  });

  document.querySelectorAll('[data-start-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-start-service');
      if (preview) preview.classList.remove('on');

      document.querySelectorAll('#aw-brief-types .aw-conf-chip').forEach((c) => {
        c.classList.toggle('is-selected', c.getAttribute('data-btype') === serviceName);
      });
      const noteInput = document.getElementById('aw-brief-note');
      if (noteInput && !noteInput.value.trim()) {
        noteInput.value = `Interesse na frente: ${serviceName}.`;
      }
      updateBriefPreview();
      if (PF.switchTab) PF.switchTab('contato');
      if (PF.showToast) PF.showToast(`Frente "${serviceName}" selecionada no briefing!`);
    });
  });

  // ==========================================================================
  // 8. ABA PROJETOS — GRADE 3D + LISTA ÍNDICE COM PREVIEW AO VIVO
  // ==========================================================================
  let currentProjFilter = 'all';
  let currentProjView = 'grid';

  function renderProjectsArchive() {
    const stage = document.getElementById('glinto-works-grid');
    if (!stage) return;

    const list = projects.filter((p) => {
      if (currentProjFilter === 'all') return true;
      return (p.categories || [p.categoryFilter]).includes(currentProjFilter);
    });

    const countPill = document.getElementById('aw-proj-count-pill');
    if (countPill) countPill.textContent = `${pad2(list.length)} ${list.length === 1 ? 'projeto exibido' : 'projetos em produção'}`;

    if (currentProjView === 'index') {
      stage.innerHTML = `<div class="aw-proj-index">${list
        .map(
          (p, i) => `
        <a class="aw-proj-row" href="${p.url}" target="_blank" rel="noopener noreferrer" data-preview="${p.image}" data-cursor="VISITAR">
          <span class="aw-pr-num">${pad2(i + 1)}</span>
          <span class="aw-pr-title">${p.title}</span>
          <span class="aw-pr-cat">${p.categoriaLabel} · ${p.tipoProjeto}</span>
          <span class="aw-pr-year">${p.year || '2026'}</span>
          <span class="aw-pr-arr" aria-hidden="true">↗</span>
        </a>`
        )
        .join('')}</div>`;
      bindPreviewTriggers(Array.from(stage.querySelectorAll('.aw-proj-row')));
    } else {
      stage.innerHTML = `<div class="aw-proj-grid">${list
        .map(
          (p) => `
        <a class="aw-proj-card" href="${p.url}" target="_blank" rel="noopener noreferrer" data-spotlight data-tilt data-cursor="VISITAR">
          <div class="aw-glare" aria-hidden="true"></div>
          <div class="aw-proj-thumb">
            <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async">
            <span class="aw-proj-badge">${p.badge}</span>
          </div>
          <div class="aw-proj-body">
            <div class="aw-proj-meta-row">
              <span>${p.categoriaLabel}</span>
              <span>${p.year || '2026'}</span>
            </div>
            <h3 class="aw-proj-title">${p.title}</h3>
            <p class="aw-proj-desc">${p.summary || p.tipoProjeto}</p>
            <div class="aw-proj-tags">
              ${(p.stack || []).map((t) => `<span>${t}</span>`).join('')}
            </div>
          </div>
        </a>`
        )
        .join('')}</div>`;
      bindInteractiveSurfaces(stage);
    }

    if (PF.bindCursor) PF.bindCursor();
  }

  document.querySelectorAll('[data-work-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentProjFilter = btn.getAttribute('data-work-filter') || 'all';
      document.querySelectorAll('[data-work-filter]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderProjectsArchive();
    });
  });

  document.querySelectorAll('[data-proj-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentProjView = btn.getAttribute('data-proj-view') || 'grid';
      document.querySelectorAll('[data-proj-view]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderProjectsArchive();
    });
  });
  renderProjectsArchive();

  // ==========================================================================
  // 9. ABA CONTATO — CONSTRUTOR DE BRIEFING AO VIVO
  // ==========================================================================
  function getBriefMessage() {
    const typeBtn = document.querySelector('#aw-brief-types .aw-conf-chip.is-selected');
    const stageBtn = document.querySelector('#aw-brief-stages .aw-conf-chip.is-selected');
    const nameInput = document.getElementById('aw-brief-name');
    const noteInput = document.getElementById('aw-brief-note');

    const type = typeBtn ? typeBtn.getAttribute('data-btype') : 'Site Awwwards / 3D';
    const stage = stageBtn ? stageBtn.getAttribute('data-bstage') : 'Projeto do zero';
    const sender = nameInput && nameInput.value.trim() ? nameInput.value.trim() : null;
    const note = noteInput && noteInput.value.trim() ? noteInput.value.trim() : null;

    const lines = [
      sender ? `Olá Matheus! Aqui é ${sender}.` : 'Olá Matheus!',
      `Tenho interesse em desenvolver: ${type} (${stage}).`
    ];
    if (note) lines.push(`Detalhes / Escopo: ${note}`);
    lines.push('Podemos alinhar os próximos passos?');
    return lines.join('\n');
  }

  function updateBriefPreview() {
    const msg = getBriefMessage();
    const prevEl = document.getElementById('aw-brief-preview');
    const waEl = document.getElementById('aw-brief-wa');
    const mailEl = document.getElementById('aw-brief-mail');
    if (prevEl) prevEl.textContent = msg;
    if (waEl) waEl.href = `https://wa.me/5531971880711?text=${encodeURIComponent(msg)}`;
    if (mailEl) {
      const sub = 'Novo Projeto — Portfólio Matheus Felipe';
      mailEl.href = `mailto:matheusfelipe16felipe@gmail.com?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`;
    }
  }

  document.querySelectorAll('#aw-brief-types .aw-conf-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#aw-brief-types .aw-conf-chip').forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      updateBriefPreview();
    });
  });

  document.querySelectorAll('#aw-brief-stages .aw-conf-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#aw-brief-stages .aw-conf-chip').forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      updateBriefPreview();
    });
  });

  ['aw-brief-name', 'aw-brief-note'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateBriefPreview);
  });

  const copyBriefBtn = document.getElementById('aw-brief-copy');
  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', async () => {
      const msg = getBriefMessage();
      try {
        await navigator.clipboard.writeText(msg);
      } catch (_) {}
      if (PF.showToast) PF.showToast('Resumo do briefing copiado!');
    });
  }
  updateBriefPreview();

  // ==========================================================================
  // 10. BOTÃO MAGNÉTICO + LOOP PRINCIPAL + TROCA DE ABAS
  // ==========================================================================
  const magnet = document.getElementById('aw-magnet');
  const magnetLabel = magnet ? magnet.querySelector('.aw-magnet-label') : null;
  let mgX = 0, mgY = 0, mgTX = 0, mgTY = 0;
  let mouseX = -9999, mouseY = -9999;

  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    },
    { passive: true }
  );

  function updateMagnet() {
    if (!magnet || !fine) return;
    const r = magnet.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const cx = r.left + r.width / 2 - mgX;
    const cy = r.top + r.height / 2 - mgY;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < r.width * 0.95) {
      mgTX = dx * 0.38;
      mgTY = dy * 0.38;
    } else {
      mgTX = 0;
      mgTY = 0;
    }
    mgX = lerp(mgX, mgTX, 0.16);
    mgY = lerp(mgY, mgTY, 0.16);
    magnet.style.transform = `translate3d(${mgX.toFixed(2)}px, ${mgY.toFixed(2)}px, 0)`;
    if (magnetLabel) magnetLabel.style.transform = `translate3d(${(mgX * 0.25).toFixed(2)}px, ${(mgY * 0.25).toFixed(2)}px, 0)`;
  }

  function tick() {
    if (inicioActive()) {
      updateManifesto();
      updateMagnet();
    }
    updatePreview();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('pf:tabchange', (e) => {
    const tab = e.detail;
    if (preview) preview.classList.remove('on');
    revealTabView(tab);
    if (tab === 'sobre') animateSobreCounters();
  });
})();
