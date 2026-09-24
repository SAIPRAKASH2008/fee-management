/* =====================================================
   charts.js — Chart.js Configuration & Rendering
   ===================================================== */

const Charts = {

  defaults: {
    fontColor: '#94a3b8',
    gridColor: 'rgba(255,255,255,0.05)',
    tooltipBg: '#0f1630',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Apply global defaults once
  applyGlobals() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = this.defaults.fontColor;
    Chart.defaults.font.family = this.defaults.fontFamily;
    Chart.defaults.font.size = 12;
  },

  // ─── COLLECTION vs PENDING — Doughnut ───────────────
  renderCollectionDonut(canvasId, collected, pending) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.applyGlobals();
    if (App.charts[canvasId]) { App.charts[canvasId].destroy(); }

    App.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Collected', 'Pending'],
        datasets: [{
          data: [collected, Math.max(0, pending)],
          backgroundColor: ['#10b981', '#f59e0b'],
          hoverBackgroundColor: ['#059669', '#d97706'],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: this.defaults.tooltipBg,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => ` ${formatCurrency(ctx.raw)}`
            }
          }
        }
      }
    });
    return App.charts[canvasId];
  },

  // ─── MONTHLY TREND — Bar Chart ──────────────────────
  renderMonthlyBar(canvasId, labels, data) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.applyGlobals();
    if (App.charts[canvasId]) { App.charts[canvasId].destroy(); }

    App.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Collection (₹)',
          data,
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx: c, chartArea} = chart;
            if (!chartArea) return '#3b82f6';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59,130,246,0.9)');
            gradient.addColorStop(1, 'rgba(59,130,246,0.2)');
            return gradient;
          },
          hoverBackgroundColor: 'rgba(96,165,250,0.9)',
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#94a3b8', font:{ size:11 } }
          },
          y: {
            grid: { color: this.defaults.gridColor, drawBorder: false },
            border: { display: false, dash:[4,4] },
            ticks: {
              color: '#94a3b8',
              font: { size:11 },
              callback: v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: this.defaults.tooltipBg,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => ` Collection: ${formatCurrency(ctx.raw)}`
            }
          }
        }
      }
    });
    return App.charts[canvasId];
  },

  // ─── PAYMENT MODE — Pie Chart ────────────────────────
  renderPaymentModePie(canvasId, modes) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.applyGlobals();
    if (App.charts[canvasId]) { App.charts[canvasId].destroy(); }

    const labels = Object.keys(modes).map(k => k.charAt(0).toUpperCase()+k.slice(1));
    const data   = Object.values(modes);
    const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6'];

    App.charts[canvasId] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          hoverOffset: 8,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color:'#94a3b8', padding:16, usePointStyle:true, pointStyle:'circle', font:{size:11} }
          },
          tooltip: {
            backgroundColor: this.defaults.tooltipBg,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` }
          }
        }
      }
    });
    return App.charts[canvasId];
  },

  // ─── COURSE DISTRIBUTION — Horizontal Bar ───────────
  renderCourseBar(canvasId, courseData) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.applyGlobals();
    if (App.charts[canvasId]) { App.charts[canvasId].destroy(); }

    App.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(courseData),
        datasets: [{
          label: 'Students',
          data: Object.values(courseData),
          backgroundColor: ['rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(245,158,11,0.7)','rgba(139,92,246,0.7)'],
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: this.defaults.gridColor },
            border: { display:false },
            ticks: { color:'#94a3b8', font:{size:11} }
          },
          y: {
            grid: { display:false },
            border: { display:false },
            ticks: { color:'#94a3b8', font:{size:11} }
          }
        },
        plugins: {
          legend: { display:false },
          tooltip: {
            backgroundColor: this.defaults.tooltipBg,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth:1, padding:10,
          }
        }
      }
    });
    return App.charts[canvasId];
  },

  // ─── STUDENT DUES BREAKDOWN — Stacked Bar ───────────
  renderDuesBreakdown(canvasId, heads) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.applyGlobals();
    if (App.charts[canvasId]) { App.charts[canvasId].destroy(); }

    App.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: heads.map(h => h.head_name),
        datasets: [
          {
            label: 'Paid',
            data: heads.map(h => h.paid),
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderRadius: { topLeft:4, topRight:4 },
          },
          {
            label: 'Remaining',
            data: heads.map(h => h.remaining),
            backgroundColor: 'rgba(245,158,11,0.5)',
            borderRadius: { topLeft:4, topRight:4 },
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display:false },
            border: { display:false },
            ticks: { color:'#94a3b8', font:{size:10} }
          },
          y: {
            stacked: true,
            grid: { color: this.defaults.gridColor },
            border: { display:false },
            ticks: { color:'#94a3b8', font:{size:10}, callback: v => v>=1000?`₹${v/1000}K`:`₹${v}` }
          }
        },
        plugins: {
          legend: { position:'bottom', labels:{ color:'#94a3b8', usePointStyle:true, pointStyle:'circle', font:{size:11}, padding:16 } },
          tooltip: {
            backgroundColor: this.defaults.tooltipBg,
            borderColor:'rgba(255,255,255,0.1)',
            borderWidth:1, padding:10,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
          }
        }
      }
    });
    return App.charts[canvasId];
  },
};
