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

/* ---------- Dashboard Charts ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const colCtx = document.getElementById('colunasChart');
  const pizCtx = document.getElementById('pizzaChart');

  if (!colCtx || !pizCtx) return;

  // Register the datalabels plugin
  Chart.register(ChartDataLabels);

  const tooltipLabels = {
    0.92: '11 meses',
    1.5: '1 ano e meio',
    2.5: '2 anos e meio',
    3.5: '3 anos e meio',
    5: '5 anos'
  };

  const getTooltipLabel = (val) => tooltipLabels[val] || (val + ' anos');

  // Chart.js global font override
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.color = '#8b949e';

  // 1. Column Chart (Left Side) - Banks & Modelings
  new Chart(colCtx, {
    type: 'bar',
    data: {
      labels: ['WolfCMS', 'PHPRunner', 'Oracle SQL', 'Powerdesigner', 'Workbench', 'MySQL'],
      datasets: [{
        label: 'Tempo de Experiência',
        data: [0.92, 0.92, 5, 5, 2.5, 0.92],
        backgroundColor: [
          '#1f6feb', // WolfCMS - Blue
          '#bc8cff', // PHPRunner - Purple
          '#e3b341', // Oracle SQL - Yellow
          '#f85149', // Powerdesigner - Red
          '#3fb950', // Workbench - Green
          '#f78166'  // MySQL - Orange
        ],
        borderColor: '#30363d',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: [
          '#388bfd',
          '#d3b6ff',
          '#f2cc60',
          '#ff7b72',
          '#56d364',
          '#ffa185'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#e6edf3',
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return ` Experiência: ${getTooltipLabel(context.raw)}`;
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          font: {
            weight: 'bold',
            size: 11
          },
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.forEach(val => {
              sum += val;
            });
            return (value * 100 / sum).toFixed(1) + "%";
          }
        }
      },
      scales: {
        y: {
          max: 6,
          grid: {
            color: 'rgba(48, 54, 61, 0.4)'
          },
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value + (value === 1 ? ' ano' : ' anos');
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // 2. Pie/Doughnut Chart (Right Side) - Main Technologies
  new Chart(pizCtx, {
    type: 'doughnut',
    data: {
      labels: ['Powerbuilder', 'PHP', 'C#', 'DevOps / ALM'],
      datasets: [{
        data: [5, 3.5, 1.5, 5],
        backgroundColor: [
          '#1f6feb', // Powerbuilder - Blue
          '#bc8cff', // PHP - Purple
          '#3fb950', // C# - Green
          '#f78166'  // DevOps / ALM - Orange
        ],
        borderColor: '#161b22',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15,
            color: '#8b949e'
          }
        },
        tooltip: {
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#e6edf3',
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return ` Experiência: ${getTooltipLabel(context.raw)}`;
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 11
          },
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.forEach(val => {
              sum += val;
            });
            return (value * 100 / sum).toFixed(1) + "%";
          }
        }
      }
    }
  });
});

