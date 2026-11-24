// Global error handling
window.addEventListener('error', function(e) {
  console.error('Global error:', e.message, 'at', e.filename, ':', e.lineno);
});
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});

// Performance marks
if (window.performance && performance.mark) {
  performance.mark('page_start');
  window.addEventListener('load', function() {
    performance.mark('page_loaded');
    performance.measure('page_load', 'page_start', 'page_loaded');
  });
}

// Async-load Google Fonts stylesheet (replaces inline onload, which a strict CSP blocks)
document.querySelectorAll('link[data-async-css]').forEach(function(l) {
  if (l.sheet) { l.media = 'all'; } else { l.addEventListener('load', function() { l.media = 'all'; }); }
});

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('SW registered: ', registration.scope);
    }, function(err) {
      console.log('SW registration failed: ', err);
    });
  });
}

// ── MAGNETIC HOVER ──
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .track-card').forEach(el => {
  el.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    this.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

// ── NEURAL CANVAS (performance-optimised) ──
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [];
let canvasPaused = false;
let lastFrame = 0;
const TARGET_FPS = 30; // cap at 30 fps — invisible to users, halves CPU use
const FRAME_MS  = 1000 / TARGET_FPS;
// Fewer nodes on mobile/low-res screens
const NODE_COUNT = window.innerWidth < 768 ? 30 : 45;
const LINK_DIST  = 120;
const LINK_DIST2 = LINK_DIST * LINK_DIST; // avoid sqrt in hot loop

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resize(); initNodes(); }, 200);
});

// Pause when tab is hidden — saves battery
document.addEventListener('visibilitychange', () => {
  canvasPaused = document.hidden;
  if (!canvasPaused) { lastFrame = 0; requestAnimationFrame(draw); }
});

class Node {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.45 + 0.15;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  }
}

function initNodes() {
  nodes = Array.from({ length: NODE_COUNT }, () => new Node());
}
initNodes();

// Determine node colour based on current theme
function nodeColor() {
  return document.body.classList.contains('light') ? '0,153,170' : '0,245,255';
}

function draw(ts) {
  if (canvasPaused) return;
  requestAnimationFrame(draw);

  // FPS throttle
  if (ts - lastFrame < FRAME_MS) return;
  lastFrame = ts;

  ctx.clearRect(0, 0, W, H);
  nodes.forEach(n => n.update());

  const col = nodeColor();

  // Batch lines by alpha bucket to minimise strokeStyle changes
  ctx.lineWidth = 0.5;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx   = nodes[i].x - nodes[j].x;
      const dy   = nodes[i].y - nodes[j].y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < LINK_DIST2) {
        const alpha = (1 - Math.sqrt(dist2) / LINK_DIST) * 0.28;
        ctx.strokeStyle = `rgba(${col},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw dots — shadow only once per frame
  ctx.shadowBlur  = 5;
  ctx.shadowColor = `rgba(${col},0.8)`;
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col},${n.opacity})`;
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}
requestAnimationFrame(draw);

// ── SCROLL REVEALS ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stat-card, .track-card, .feature-card, .milestone, .path-node').forEach(el => {
  observer.observe(el);
});

// ── COUNTER ANIMATION ──
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        if (num.dataset.static) return; // skip static values like "9–18"
        const target = parseInt(num.dataset.target || '98');
        const suffix = num.dataset.suffix || '';
        animateCounter(num, target, suffix);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

document.querySelector('#stats') && statsObserver.observe(document.querySelector('#stats'));

// Fix last stat
document.querySelector('[data-suffix="%"]').dataset.target = '98';

// ── PARALLAX ON SCROLL ──
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    heroLogo.style.transform = `translateY(${sy * 0.15}px) rotate(${sy * 0.02}deg)`;
  }
});

// ── NAV SCROLL STYLE ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.style.borderBottomColor = 'rgba(0,245,255,0.15)';
  } else {
    nav.style.borderBottomColor = 'rgba(0,245,255,0.08)';
  }
});

// ── TRACK CARDS TILT ──
document.querySelectorAll('.track-card, .feature-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / rect.height) * -8;
    const ry = ((e.clientX - cx) / rect.width) * 8;
    this.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

// ── ENROLLMENT MODAL ──
const modal = document.getElementById('enrollModal');
const modalClose = document.getElementById('modalClose');
const formSubmit = document.getElementById('formSubmit');
const modalForm = document.getElementById('modalForm');
const modalSuccess = document.getElementById('modalSuccess');

function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// All "Enroll" triggers
document.querySelectorAll('[data-enroll]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal(); }));
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── FORMSPREE ENDPOINT ──
// Replace YOUR_FORM_ID below with your Formspree form ID.
// Create a free form at https://formspree.io → copy the ID from your endpoint URL.
// Example: if your endpoint is https://formspree.io/f/xpwzabcd, your ID is xpwzabcd
const FORMSPREE_ID = 'YOUR_FORM_ID';

function showFieldError(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#ff4466';
  el.style.boxShadow = '0 0 12px rgba(255,68,102,0.3)';

  // Show error message below the field
  let errMsg = el.nextElementSibling;
  if (!errMsg || !errMsg.classList.contains('field-error')) {
    errMsg = document.createElement('span');
    errMsg.className = 'field-error';
    errMsg.style.cssText = 'font-family:"Exo 2",sans-serif;font-size:0.75rem;color:#ff4466;margin-top:0.3rem;display:block;';
    el.parentNode.appendChild(errMsg);
  }
  errMsg.textContent = 'This field is required';

  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
    if (errMsg) errMsg.textContent = '';
  }, 3000);
}

formSubmit.addEventListener('click', async () => {
  const school   = document.getElementById('f-school').value.trim();
  const contact  = document.getElementById('f-contact').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const students = document.getElementById('f-students').value.trim();
  const track    = document.getElementById('f-track').value;
  const message  = document.getElementById('f-message').value.trim();

  // Honeypot: real users never see this field. Pretend success for bots, send nothing.
  if (document.getElementById('f-website').value) {
    modalForm.style.display = 'none';
    modalSuccess.classList.add('show');
    return;
  }

  let hasError = false;
  if (!school)   { showFieldError('f-school');  hasError = true; }
  if (!contact)  { showFieldError('f-contact'); hasError = true; }
  if (!email)    { showFieldError('f-email');   hasError = true; }
  if (hasError) return;

  // Loading state
  const btnText = formSubmit.querySelector('span');
  const originalText = btnText.textContent;
  formSubmit.disabled = true;
  btnText.textContent = 'Sending…';
  formSubmit.style.opacity = '0.7';

  try {
    const res = await fetch(`https://formspree.io/f/mjgllnob`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        school_name:      school,
        contact_person:   contact,
        email:            email,
        phone:            phone    || 'Not provided',
        num_students:     students || 'Not provided',
        interested_track: track    || 'Not specified',
        message:          message  || 'No message',
        _subject:         `CMind Demo Request — ${school}`
      })
    });

    if (res.ok) {
      modalForm.style.display = 'none';
      modalSuccess.classList.add('show');
      setTimeout(() => {
        closeModal();
        setTimeout(() => {
          modalForm.style.display = '';
          modalSuccess.classList.remove('show');
          // Reset form
          ['f-school','f-contact','f-email','f-phone','f-students','f-message'].forEach(id => {
            document.getElementById(id).value = '';
          });
          document.getElementById('f-track').value = '';
        }, 500);
      }, 3500);
    } else {
      const data = await res.json();
      const errDetail = data.errors ? data.errors.map(e => e.message).join(', ') : 'Submission failed. Please try again or email us directly at hello@cmind.tech';
      btnText.textContent = '⚠ ' + errDetail;
      setTimeout(() => { btnText.textContent = originalText; }, 4000);
    }
  } catch (err) {
    btnText.textContent = '⚠ Network error — please try again';
    setTimeout(() => { btnText.textContent = originalText; }, 4000);
  } finally {
    formSubmit.disabled = false;
    formSubmit.style.opacity = '1';
  }
});

document.querySelectorAll('.founder-flip').forEach(card => {
  card.addEventListener('click', function(e) {
    // Don't flip when clicking LinkedIn
    if (e.target.closest('.founder-li')) return;
    this.classList.toggle('flipped');
  });
});

document.querySelectorAll('.track-card').forEach((card, i) => {
  card.style.transitionDelay = (i % 3) * 0.1 + 's';
});
document.querySelectorAll('.feature-card').forEach((card, i) => {
  card.style.transitionDelay = (i % 3) * 0.1 + 's';
});

// ── MOBILE NAV TOGGLE ──
const hamburger  = document.getElementById('nav-hamburger');
const mobileNav  = document.getElementById('mobile-nav');

function openMobileNav() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

// Close on link click
document.querySelectorAll('[data-mobile-link]').forEach(link => {
  link.addEventListener('click', () => closeMobileNav());
});

// Close button handler
const mobileNavClose = document.getElementById('mobile-nav-close');
if (mobileNavClose) {
  mobileNavClose.addEventListener('click', () => closeMobileNav());
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMobileNav();
});

// ── THEME TOGGLE ──
const themeBtn = document.getElementById('theme-toggle');
const STORAGE_KEY = 'cmind-theme';

function applyTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light');
    themeBtn.textContent = '☀️';
    themeBtn.setAttribute('title', 'Switch to dark mode');
  } else {
    document.body.classList.remove('light');
    themeBtn.textContent = '🌙';
    themeBtn.setAttribute('title', 'Switch to light mode');
  }
}

// Respect stored preference, then OS preference
const stored = localStorage.getItem(STORAGE_KEY);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(stored ? stored : (prefersDark ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  const isLight = document.body.classList.contains('light');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
});

// Listen for OS-level preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
});
