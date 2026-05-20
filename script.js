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

  // Multi-line version for bar chart datalabels (array = each item is a new line)
  const barDatalabelLines = {
    0.92: ['11', 'meses'],
    1.5:  ['1', 'ano', 'e meio'],
    2.5:  ['2', 'anos', 'e meio'],
    3.5:  ['3', 'anos', 'e meio'],
    5:    ['5', 'anos']
  };

  const getBarLabel = (val) => barDatalabelLines[val] || [val + ' anos'];

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
          textAlign: 'center',
          font: {
            weight: 'bold',
            size: 11
          },
          formatter: (value) => getBarLabel(value)
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
          formatter: (value) => getTooltipLabel(value)
        }
      }
    }
  });

  // 3. Bubble Chart — Linguagens de Programação
  const bubCtx = document.getElementById('bubbleChart');
  if (!bubCtx) return;

  const smallBubbles = {
    label: 'Pequeno (P)',
    backgroundColor: 'rgba(31, 111, 235, 0.75)',
    borderColor: '#388bfd',
    borderWidth: 1.5,
    hoverBackgroundColor: 'rgba(56, 139, 253, 0.9)',
    data: [
      { x: 3,   y: 1,    r: 9,  label: 'HTML' },
      { x: 2,   y: 0.5,  r: 9,  label: 'Java' },
      { x: 2.3, y: 0.42, r: 9,  label: 'JavaScript' },
      { x: 1,   y: 0.25, r: 9,  label: 'CSS' },
      { x: 1.7, y: 0.42, r: 9,  label: 'Python' },
      { x: 1,   y: 0.5,  r: 9,  label: 'C' },
    ]
  };

  const mediumBubbles = {
    label: 'Médio (M)',
    backgroundColor: 'rgba(63, 185, 80, 0.75)',
    borderColor: '#56d364',
    borderWidth: 1.5,
    hoverBackgroundColor: 'rgba(86, 211, 100, 0.9)',
    data: [
      { x: 4, y: 2, r: 16, label: 'Basic4android / B4J' },
      { x: 3, y: 2, r: 16, label: 'Xojo (RealBasic)' },
    ]
  };

  const largeBubbles = {
    label: 'Grande (G)',
    backgroundColor: 'rgba(248, 81, 73, 0.75)',
    borderColor: '#ff7b72',
    borderWidth: 1.5,
    hoverBackgroundColor: 'rgba(255, 123, 114, 0.9)',
    data: [
      { x: 8, y: 3, r: 26, label: 'Visual Basic 6.0' },
    ]
  };

  new Chart(bubCtx, {
    type: 'bubble',
    data: { datasets: [smallBubbles, mediumBubbles, largeBubbles] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#8b949e',
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].raw.label,
            label: (ctx) => {
              const d = ctx.raw;
              const meses = Math.round(d.y * 12);
              const tempoStr = d.y >= 1
                ? `${d.y} ano${d.y > 1 ? 's' : ''}`
                : `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
              return [` Estudo: ${tempoStr}`, ` Nível de Domínio: ${d.x}/10`];
            }
          }
        },
        datalabels: {
          color: '#e6edf3',
          anchor: 'center',
          align: (ctx) => {
            const right = ['JavaScript'];
            const below = ['Python', 'Xojo (RealBasic)'];
            if (right.includes(ctx.dataset.data[ctx.dataIndex].label)) return 'right';
            return below.includes(ctx.dataset.data[ctx.dataIndex].label) ? 'bottom' : 'top';
          },
          offset: 6,
          font: { size: 10, weight: '500' },
          formatter: (value) => value.label
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Nível de Domínio',
            color: '#8b949e',
            font: { size: 12 }
          },
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1,
            callback: (v) => v === 0 ? '' : v
          },
          grid: { color: 'rgba(48, 54, 61, 0.4)' }
        },
        y: {
          title: {
            display: true,
            text: 'Anos de Estudo',
            color: '#8b949e',
            font: { size: 12 }
          },
          min: 0,
          max: 3.8,
          ticks: {
            stepSize: 0.5,
            callback: (v) => {
              if (v === 0) return '';
              if (v < 1) return `${Math.round(v * 12)}m`;
              return `${v}a`;
            }
          },
          grid: { color: 'rgba(48, 54, 61, 0.4)' }
        }
      }
    }
  });
});

