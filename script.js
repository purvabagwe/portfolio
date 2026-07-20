/**
 * =====================================================
 * PURVA BAGWE PORTFOLIO — script.js
 * Modern Vanilla ES6+ JavaScript
 * Features: Typed animation, scroll reveal, nav,
 *           hero canvas, skills, form validation,
 *           ripple effects, lazy loading & more.
 * =====================================================
 */

'use strict';

/* ─── Utility ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =====================================================
   1. SCROLL PROGRESS BAR
   ===================================================== */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
  }

  document.addEventListener('scroll', update, { passive: true });
  update();
}

/* =====================================================
   2. STICKY NAVBAR — scroll effect & active link
   ===================================================== */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  const navLinkEls= $$('.nav-link');
  const sections  = $$('section[id]');

  if (!navbar) return;

  /* Scroll class */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveLink();
  }

  /* Highlight nav link based on scroll position */
  function highlightActiveLink() {
    let current = '';
    const offset = 100;

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) {
        current = sec.id;
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* Hamburger toggle */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks?.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* Close nav on link click (mobile) */
  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close nav on outside click */
  document.addEventListener('click', e => {
    if (navLinks?.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger?.contains(e.target)) {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =====================================================
   3. TYPED TEXT ANIMATION
   ===================================================== */
function initTypedText() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'Frontend Developer',
    'Full Stack Developer',
    'Python Developer',
    'UI/UX Enthusiast',
    'AI Integrator',
    'Problem Solver',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let isDeleting = false;
  let isPaused   = false;

  const TYPE_SPEED   = 80;
  const DELETE_SPEED = 45;
  const PAUSE_AFTER  = 1800;
  const PAUSE_BEFORE = 300;

  function type() {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;

      if (charIdx === current.length) {
        isPaused = true;
        setTimeout(() => { isPaused = false; isDeleting = true; tick(); }, PAUSE_AFTER);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx  = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }
    }

    tick();
  }

  function tick() {
    if (isPaused) return;
    const speed = isDeleting ? DELETE_SPEED : TYPE_SPEED;
    setTimeout(type, speed);
  }

  tick();
}

/* =====================================================
   4. HERO CANVAS — Particle network background
   ===================================================== */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;
  let W, H;

  const CONFIG = {
    count:        55,
    maxDist:      140,
    speed:        0.35,
    size:         { min: 1, max: 2.5 },
    colors:       ['rgba(124,58,237,', 'rgba(34,211,238,', 'rgba(168,85,247,'],
    lineOpacity:  0.18,
    mouseRadius:  120,
  };

  let mouse = { x: -9999, y: -9999 };

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * CONFIG.speed * 2,
      vy:   (Math.random() - 0.5) * CONFIG.speed * 2,
      r:    CONFIG.size.min + Math.random() * (CONFIG.size.max - CONFIG.size.min),
      color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      alpha: 0.4 + Math.random() * 0.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      /* Mouse repulsion */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.vx += (dx / dist) * force * 0.5;
        p.vy += (dy / dist) * force * 0.5;
      }

      /* Friction */
      p.vx *= 0.99;
      p.vy *= 0.99;

      /* Move */
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      /* Draw particle */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      /* Connect nearby */
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const ex = p.x - q.x;
        const ey = p.y - q.y;
        const d  = Math.hypot(ex, ey);

        if (d < CONFIG.maxDist) {
          const opacity = CONFIG.lineOpacity * (1 - d / CONFIG.maxDist);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.color + opacity + ')';
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    });

    animFrame = requestAnimationFrame(draw);
  }

  /* Pause animation when tab hidden (performance) */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      draw();
    }
  });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  init();
  draw();
}

/* =====================================================
   5. SCROLL REVEAL ANIMATIONS
   ===================================================== */
function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');
  const timelineItems = $$('.timeline-item');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  /* Timeline items separate observer */
  const timelineObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 120);
          timelineObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  timelineItems.forEach(el => timelineObs.observe(el));
}

/* =====================================================
   6. SKILL BAR ANIMATIONS + TABS
   ===================================================== */
function initSkills() {
  /* Tab switching */
  const tabs    = $$('.skill-tab');
  const panels  = $$('.skill-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetPanel = $(`#tab-${target}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        animateBarsInPanel(targetPanel);
      }
    });
  });

  /* Animate bars when panel becomes visible */
  const skillsSection = $('#skills');
  if (!skillsSection) return;

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activePanel = $('.skill-panel.active');
          if (activePanel) animateBarsInPanel(activePanel);
          sectionObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  sectionObs.observe(skillsSection);
}

function animateBarsInPanel(panel) {
  const bars = $$('.skill-bar', panel);
  bars.forEach((bar, i) => {
    setTimeout(() => {
      bar.classList.add('animated');
    }, i * 80 + 100);
  });
}

/* =====================================================
   7. BUTTON RIPPLE EFFECT
   ===================================================== */
function initRipple() {
  $$('.btn, .btn-project').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.disabled) return;

      const circle = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left  - size / 2;
      const y      = e.clientY - rect.top   - size / 2;

      circle.style.cssText = `
        position: absolute;
        width:  ${size}px;
        height: ${size}px;
        left:   ${x}px;
        top:    ${y}px;
        background: rgba(255,255,255,0.18);
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-anim 0.6s ease forwards;
      `;

      /* Ensure btn is relatively positioned */
      const pos = getComputedStyle(this).position;
      if (pos === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  });

  /* Inject ripple keyframes once */
  if (!document.getElementById('ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* =====================================================
   8. CONTACT FORM VALIDATION
   ===================================================== */
function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (!form) return;

  const fields = {
    name:    { el: $('#form-name'),    err: $('#name-error'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).' },
    email:   { el: $('#form-email'),   err: $('#email-error'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
    subject: { el: $('#form-subject'), err: $('#subject-error'), validate: v => v.trim().length >= 3 ? '' : 'Please enter a subject (at least 3 characters).' },
    message: { el: $('#form-message'), err: $('#message-error'), validate: v => v.trim().length >= 10 ? '' : 'Please enter a message (at least 10 characters).' },
  };

  /* Live validation */
  Object.values(fields).forEach(({ el, err, validate }) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const msg = validate(el.value);
      showFieldState(el, err, msg);
    });
    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      showFieldState(el, err, msg);
    });
  });

  function showFieldState(input, errEl, msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    input.classList.toggle('error',   !!msg);
    input.classList.toggle('success', !msg && input.value.trim().length > 0);
  }

  function validateAll() {
    let valid = true;
    Object.values(fields).forEach(({ el, err, validate }) => {
      if (!el) return;
      const msg = validate(el.value);
      showFieldState(el, err, msg);
      if (msg) valid = false;
    });
    return valid;
  }

  /* Submit */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateAll()) return;

    const submitBtn = $('#form-submit');
    submitBtn?.classList.add('loading');
    submitBtn && (submitBtn.disabled = true);

    /* Simulate async send */
    setTimeout(() => {
      submitBtn?.classList.remove('loading');
      submitBtn && (submitBtn.disabled = false);
      form.reset();
      Object.values(fields).forEach(({ el }) => {
        el?.classList.remove('error', 'success');
      });
      success?.classList.add('show');
      setTimeout(() => success?.classList.remove('show'), 5000);
    }, 1600);
  });
}

/* =====================================================
   9. FOOTER YEAR
   ===================================================== */
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* =====================================================
   10. HERO GREETING ANIMATION
   ===================================================== */
function initHeroGreeting() {
  const greeting = $('#hero-greeting');
  if (greeting) {
    setTimeout(() => greeting.style.opacity = '1', 200);
  }
}

/* =====================================================
   11. SMOOTH SCROLL — anchor links
   ===================================================== */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();

      const navH  = document.getElementById('navbar')?.offsetHeight || 72;
      const top   = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* =====================================================
   12. LAZY LOADING IMAGES
   ===================================================== */
function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; /* Native lazy already supported */

  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        imgObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imgObserver.observe(img));
}

/* =====================================================
   13. SECTION TITLE ANIMATION
   ===================================================== */
function initSectionTitles() {
  const titles = $$('.section-title');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  titles.forEach(t => obs.observe(t));
}

/* =====================================================
   14. SKILL CARD HOVER — micro-interactions
   ===================================================== */
function initSkillCardEffects() {
  $$('.skill-card, .soft-skill-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transition = 'all 0.35s cubic-bezier(0.4,0,0.2,1)';
    });
  });
}

/* =====================================================
   15. NAV LINK UNDERLINE — magnetic effect on hover
   ===================================================== */
function initNavEffects() {
  $$('.nav-link').forEach(link => {
    link.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 4;
      this.style.transform = `translate(${x}px, ${y}px)`;
    });
    link.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
}

/* =====================================================
   16. PROJECT CARD — tilt effect
   ===================================================== */
function initProjectTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const tiltX = (-y * 6).toFixed(2);
      const tiltY = ( x * 6).toFixed(2);

      this.style.transform = `translateY(-8px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      this.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.transition = 'all 0.35s cubic-bezier(0.4,0,0.2,1)';
    });
  });
}

/* =====================================================
   17. ABOUT SECTION — counter stats (future-proof)
   ===================================================== */
function initCounters() {
  /* Reserved for stat counters if added */
}

/* =====================================================
   18. PERFORMANCE — prefers-reduced-motion check
   ===================================================== */
function respectReducedMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    /* Disable canvas and floating shapes */
    const canvas = $('#hero-canvas');
    const shapes = $('.floating-shapes');
    if (canvas) canvas.style.display = 'none';
    if (shapes) shapes.style.display = 'none';
  }
}

/* =====================================================
   19. SOCIAL ICON TOOLTIP (micro-interaction)
   ===================================================== */
function initTooltips() {
  $$('.social-icon[aria-label]').forEach(icon => {
    const label = icon.getAttribute('aria-label');
    if (!label) return;

    let tooltip;

    icon.addEventListener('mouseenter', function() {
      tooltip = document.createElement('span');
      tooltip.className = 'social-tooltip';
      tooltip.textContent = label;
      tooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%) scale(0.85);
        background: rgba(15,23,42,0.95);
        color: #F1F5F9;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 50;
        opacity: 0;
        transition: all 0.2s ease;
        border: 1px solid rgba(124,58,237,0.3);
        font-family: 'Inter', sans-serif;
      `;
      const parent = this.parentElement;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      this.style.position = 'relative';
      this.appendChild(tooltip);
      requestAnimationFrame(() => {
        tooltip.style.opacity   = '1';
        tooltip.style.transform = 'translateX(-50%) scale(1)';
      });
    });

    icon.addEventListener('mouseleave', function() {
      if (tooltip) {
        tooltip.style.opacity   = '0';
        tooltip.style.transform = 'translateX(-50%) scale(0.85)';
        setTimeout(() => tooltip?.remove(), 200);
        tooltip = null;
      }
    });
  });
}

/* =====================================================
   20. CURSOR GLOW EFFECT (subtle)
   ===================================================== */
function initCursorGlow() {
  if (window.innerWidth < 1024) return; /* Desktop only */

  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.style.cssText = `
    position: fixed;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9998;
    transition: transform 0.15s ease;
    top: 0; left: 0;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top  = `${e.clientY}px`;
  }, { passive: true });
}

/* =====================================================
   INITIALIZATION
   ===================================================== */
function init() {
  /* Run immediately */
  respectReducedMotion();
  initFooterYear();

  /* Run when DOM is ready */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initNavbar();
    initTypedText();
    initHeroGreeting();
    initScrollReveal();
    initSkills();
    initSmoothScroll();
    initLazyLoad();
    initContactForm();
    initSectionTitles();
    initRipple();
    initSkillCardEffects();
    initProjectTilt();
    initNavEffects();
    initTooltips();
    initCursorGlow();

    /* Hero canvas — slight delay for paint priority */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(initHeroCanvas, 100);
    }
  });
}

init();
