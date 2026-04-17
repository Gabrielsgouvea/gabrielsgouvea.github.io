/* ============================================================
   script.js — GitHub Resume
   ============================================================ */

/* ---------- Navbar scroll shadow ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

/* Close on link click (mobile) */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---------- Active nav link on scroll ---------- */
// Include both <section id> and <h2 id> anchors as scroll targets
const scrollTargets = document.querySelectorAll('section[id], h2[id], h1[id]');
const navItems = document.querySelectorAll('.nav-link[data-section]');

function updateActiveLink() {
  const scrollPos = window.scrollY + 90;
  let current = '';

  scrollTargets.forEach(el => {
    if (scrollPos >= el.offsetTop) current = el.id;
  });

  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === current);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

/* ---------- Scroll-reveal IntersectionObserver ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling cards slightly
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

// Apply staggered delays to sibling cards
document.querySelectorAll('.job-card').forEach((el, i) => {
  el.dataset.delay = i * 80;
});
document.querySelectorAll('.tech-block').forEach((el, i) => {
  el.dataset.delay = i * 100;
});
document.querySelectorAll('.video-card').forEach((el, i) => {
  el.dataset.delay = i * 120;
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Smooth scroll for nav links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- Image fallback placeholder ---------- */
document.querySelectorAll('.gallery-fig img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      height: 180px;
      background: #1c2128;
      border: 1px dashed #30363d;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b949e;
      font-size: 0.8rem;
      font-family: 'JetBrains Mono', monospace;
    `;
    placeholder.textContent = '📷 ' + (this.alt || 'Imagem não encontrada');
    this.parentElement.insertBefore(placeholder, this);
  });
});
