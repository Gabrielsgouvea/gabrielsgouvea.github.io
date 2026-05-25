/* ============================================================
   script.js — GitHub Resume
   ============================================================ */

/* ---------- Navbar scroll shadow ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ---------- PDF dropdown ---------- */
const pdfBtn      = document.getElementById('nav-pdf-btn');
const pdfDropdown = document.getElementById('nav-pdf-dropdown');

pdfBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = pdfDropdown.classList.toggle('open');
  pdfBtn.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', () => {
  pdfDropdown.classList.remove('open');
  pdfBtn.setAttribute('aria-expanded', 'false');
});

pdfDropdown.addEventListener('click', (e) => e.stopPropagation());

/* Baixar PDF: fetch → blob → save dialog, sem redirecionar a página */
const pdfDownloadLink = document.querySelector('#nav-pdf-dropdown a[download]');
if (pdfDownloadLink) {
  pdfDownloadLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = pdfDownloadLink.getAttribute('href');

    // Evita erros de restrição de segurança CORS ao visualizar no protocolo file:// localmente
    if (window.location.protocol === 'file:') {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV-Gabriel.pdf';
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      a.remove();
      pdfDropdown.classList.remove('open');
      pdfBtn.setAttribute('aria-expanded', 'false');
      return;
    }

    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const obj  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = obj;
      a.download = 'CV-Gabriel.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(obj);
    } catch {
      /* fallback: abre em nova aba se fetch falhar */
      window.open(url, '_blank', 'noopener');
    }
    pdfDropdown.classList.remove('open');
    pdfBtn.setAttribute('aria-expanded', 'false');
  });
}

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
  const scrollPos = window.scrollY + 120; // Calibrado para scroll-margin-top (100px)
  let current = '';

  // Detecção se o usuário chegou ao final absoluto da página
  const isBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 10);

  if (isBottom) {
    const targetIdsWithNav = Array.from(navItems).map(item => item.dataset.section);
    for (let i = scrollTargets.length - 1; i >= 0; i--) {
      const id = scrollTargets[i].id;
      if (targetIdsWithNav.includes(id)) {
        current = id;
        break;
      }
    }
  } else {
    scrollTargets.forEach(el => {
      if (scrollPos >= el.offsetTop) current = el.id;
    });
  }

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
    // Se for o logo (casinha ou nome), rola para o topo total (y = 0)
    if (anchor.classList.contains('nav-logo')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
      background: var(--bg-subtle);
      border: 1px dashed var(--border-default);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-family: 'JetBrains Mono', monospace;
    `;
    placeholder.textContent = '📷 ' + (this.alt || 'Imagem não encontrada');
    this.parentElement.insertBefore(placeholder, this);
  });
});

/* ---------- Dashboard Charts Declarations ---------- */
let colChartInstance = null;
let pizzaChartInstance = null;
let bubbleChartInstance = null;
let radarChartInstance = null;

// Função para atualizar dinamicamente as cores dos gráficos com base no tema ativo
function updateChartsTheme(isLight) {
  const textColor = isLight ? '#57606a' : '#8b949e';
  const gridColor = isLight ? 'rgba(208, 215, 222, 0.4)' : 'rgba(48, 54, 61, 0.4)';
  const tooltipBg = isLight ? '#ffffff' : '#161b22';
  const tooltipBorder = isLight ? '#d0d7de' : '#30363d';
  const tooltipTextColor = isLight ? '#24292f' : '#e6edf3';
  const tooltipBodyColor = isLight ? '#57606a' : '#8b949e';
  const doughnutBorderColor = isLight ? '#ffffff' : '#161b22';

  if (colChartInstance) {
    colChartInstance.options.scales.x.grid.color = gridColor;
    colChartInstance.options.scales.x.ticks.color = textColor;
    colChartInstance.options.scales.y.grid.color = gridColor;
    colChartInstance.options.scales.y.ticks.color = textColor;
    colChartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
    colChartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
    colChartInstance.options.plugins.tooltip.titleColor = tooltipTextColor;
    colChartInstance.options.plugins.tooltip.bodyColor = tooltipTextColor;
    colChartInstance.update();
  }

  if (pizzaChartInstance) {
    pizzaChartInstance.data.datasets[0].borderColor = doughnutBorderColor;
    pizzaChartInstance.options.plugins.legend.labels.color = textColor;
    pizzaChartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
    pizzaChartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
    pizzaChartInstance.options.plugins.tooltip.titleColor = tooltipTextColor;
    pizzaChartInstance.options.plugins.tooltip.bodyColor = tooltipTextColor;
    pizzaChartInstance.update();
  }

  if (bubbleChartInstance) {
    bubbleChartInstance.options.scales.x.grid.color = gridColor;
    bubbleChartInstance.options.scales.x.ticks.color = textColor;
    bubbleChartInstance.options.scales.x.title.color = textColor;
    bubbleChartInstance.options.scales.y.grid.color = gridColor;
    bubbleChartInstance.options.scales.y.ticks.color = textColor;
    bubbleChartInstance.options.scales.y.title.color = textColor;
    bubbleChartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
    bubbleChartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
    bubbleChartInstance.options.plugins.tooltip.titleColor = tooltipTextColor;
    bubbleChartInstance.options.plugins.tooltip.bodyColor = tooltipBodyColor;
    
    // Altera dinamicamente as cores dos labels das bolinhas para garantir leitura legível em modo claro e escuro
    bubbleChartInstance.options.plugins.datalabels.color = isLight ? '#24292f' : '#e6edf3';
    
    bubbleChartInstance.update();
  }

  if (radarChartInstance) {
    const accentBlue = isLight ? '#0969da' : '#1f6feb';
    radarChartInstance.data.datasets[0].borderColor = accentBlue;
    radarChartInstance.data.datasets[0].pointBackgroundColor = accentBlue;
    radarChartInstance.data.datasets[0].backgroundColor = isLight ? 'rgba(9, 105, 218, 0.12)' : 'rgba(31, 111, 235, 0.15)';
    
    radarChartInstance.options.scales.r.grid.color = gridColor;
    radarChartInstance.options.scales.r.angleLines.color = gridColor;
    radarChartInstance.options.scales.r.ticks.color = textColor;
    radarChartInstance.options.scales.r.pointLabels.color = isLight ? '#24292f' : '#e6edf3';
    
    radarChartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
    radarChartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
    radarChartInstance.options.plugins.tooltip.titleColor = tooltipTextColor;
    radarChartInstance.options.plugins.tooltip.bodyColor = tooltipTextColor;
    
    radarChartInstance.update();
  }
}

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
  colChartInstance = new Chart(colCtx, {
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
  pizzaChartInstance = new Chart(pizCtx, {
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
      { x: 3,   y: 1.0,  r: 9,  label: 'HTML' },
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
      { x: 3, y: 2.15, r: 16, label: 'Xojo (RealBasic)' },
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

  bubbleChartInstance = new Chart(bubCtx, {
    type: 'bubble',
    data: { datasets: [smallBubbles, mediumBubbles, largeBubbles] },
    plugins: [{
      id: 'bubbleLeaderLines',
      afterDatasetsDraw(chart) {
        const ctx2 = chart.ctx;
        chart.data.datasets.forEach((dataset, di) => {
          const meta = chart.getDatasetMeta(di);
          dataset.data.forEach((point, i) => {
            const el = meta.data[i];
            if (!el || !point.label) return;
            const { x, y } = el;
            const r = point.r;

            const rightLabels = ['JavaScript'];
            const belowLabels = ['Python', 'HTML', 'Basic4android / B4J'];
            const leftLabels  = ['CSS'];

            let dx = 0, dy = -1; // default: top
            if (rightLabels.includes(point.label)) { dx = 1;  dy = 0; }
            else if (belowLabels.includes(point.label)) { dx = 0;  dy = 1; }
            else if (leftLabels.includes(point.label))  { dx = -1; dy = 0; }

            const x1 = x + dx * (r + 2);
            const y1 = y + dy * (r + 2);
            const x2 = x + dx * (r + 12);
            const y2 = y + dy * (r + 12);

            ctx2.save();
            ctx2.beginPath();
            ctx2.moveTo(x1, y1);
            ctx2.lineTo(x2, y2);
            ctx2.strokeStyle = document.documentElement.classList.contains('light-theme') ? '#000000' : '#ffffff';
            ctx2.lineWidth = 1;
            ctx2.stroke();
            ctx2.restore();
          });
        });
      }
    }],
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
            const label = ctx.dataset.data[ctx.dataIndex].label;
            if (['JavaScript'].includes(label)) return 'right';
            if (['Python', 'HTML', 'Basic4android / B4J'].includes(label)) return 'bottom';
            if (['CSS'].includes(label)) return 'left';
            return 'top';
          },
          offset: (ctx) => {
            const r = ctx.dataset.data[ctx.dataIndex].r;
            return r + 14;
          },
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

  // 4. Radar Chart — Resumo Geral das Habilidades (Teia de 10 níveis)
  const radCtx = document.getElementById('radarChart');
  if (radCtx) {
    radarChartInstance = new Chart(radCtx, {
      type: 'radar',
      data: {
        labels: ['Desenvolvimento', 'Finanças', 'Redes', 'Segurança', 'Designer'],
        datasets: [{
          label: 'Nível de Habilidade',
          data: [9, 7, 6, 6, 4],
          backgroundColor: 'rgba(31, 111, 235, 0.15)',
          borderColor: '#1f6feb',
          pointBackgroundColor: '#1f6feb',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#1f6feb',
          borderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }, // O radar fica mais limpo sem datalabels numéricos nas pontas
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
                return ` Nível: ${context.raw}/10`;
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1,
              display: true,
              backdropColor: 'transparent',
              color: '#8b949e',
              font: { size: 10 }
            },
            grid: {
              color: 'rgba(48, 54, 61, 0.4)'
            },
            angleLines: {
              color: 'rgba(48, 54, 61, 0.4)'
            },
            pointLabels: {
              color: '#8b949e',
              font: { size: 11, weight: '600' }
            }
          }
        }
      }
    });
  }

  // Garante que os gráficos sejam iniciados com as cores corretas de acordo com o tema atual
  const isCurrentlyLight = document.documentElement.classList.contains('light-theme');
  updateChartsTheme(isCurrentlyLight);
});

/* ---------- Theme Switcher Logic ---------- */
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateChartsTheme(isLight);
  });
}