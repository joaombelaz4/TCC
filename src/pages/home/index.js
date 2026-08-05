import { PH_MIN, PH_MAX, CL_MIN, CL_MAX } from '../../config/env.js';
import { getPool, getPoolHistory }          from '../../services/selecoes.service.js';
import { statusLabel }                     from '../../utils/formatters.js';
import { phStatus, clStatus }              from '../../utils/validators.js';

/** Injects the dashboard HTML into the content area (called once by the router). */
export async function mount(container) {
  const res  = await fetch('src/pages/home/index.html');
  const html = await res.text();
  container.innerHTML = html;
}

// ── Chart instance ────────────────────────────────────────
let miniChartInst = null;

const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#162035', titleColor: '#c8d6e8',
      bodyColor: '#c8d6e8', borderColor: '#1c2e48', borderWidth: 1,
    },
  },
  scales: {
    x: { grid: { color: '#1c2e4860' }, ticks: { color: '#4a607a', font: { size: 11, family: 'Share Tech Mono' } }, border: { display: false } },
    y: { grid: { color: '#1c2e4860' }, ticks: { color: '#4a607a', font: { size: 11, family: 'Share Tech Mono' } }, border: { display: false } },
  },
};

/** Updates all dashboard DOM elements for the current pool. */
export async function updateDashboard(poolIdx) {
  const p   = await getPool(poolIdx);
  const ps  = phStatus(p.pH);
  const cs  = clStatus(p.cl);
  const overall = ps === 'danger' || cs === 'danger' ? 'danger'
                : ps === 'warn'   || cs === 'warn'   ? 'warn'
                : 'ok';

  document.getElementById('dash-pool-title').textContent = `${p.name} (${p.size})`;
  document.getElementById('dash-pool-sub').textContent   = `Última leitura: ${p.lastTime} · Sensor online`;

  // pH gauge
  document.getElementById('ph-val').textContent = p.pH.toFixed(2);
  const phAngle = ((p.pH - 6) / (10 - 6)) * 180 - 90;
  document.getElementById('ph-needle').setAttribute('transform', `rotate(${phAngle},80,90)`);
  document.getElementById('ph-gauge-card').className = `gauge-card ${ps}`;
  const phSt = document.getElementById('ph-status');
  phSt.className   = `gauge-status ${ps}`;
  phSt.textContent = statusLabel(ps);

  // Chlorine gauge
  document.getElementById('cl-val').textContent = p.cl.toFixed(2);
  const clAngle = ((p.cl - 0) / (5 - 0)) * 180 - 90;
  document.getElementById('cl-needle').setAttribute('transform', `rotate(${clAngle},80,90)`);
  document.getElementById('cl-gauge-card').className = `gauge-card ${cs}`;
  const clSt = document.getElementById('cl-status');
  clSt.className   = `gauge-status ${cs}`;
  clSt.textContent = statusLabel(cs);

  // Stats
  document.getElementById('stat-temp').textContent  = `${p.temp}°C`;
  document.getElementById('stat-last').textContent  = p.lastTime;
  document.getElementById('stat-count').textContent = p.readings;
  const statusEl = document.getElementById('stat-status');
  statusEl.style.color  = overall === 'ok' ? 'var(--ok)' : overall === 'warn' ? 'var(--warn)' : 'var(--danger)';
  statusEl.textContent  = statusLabel(overall).toUpperCase();
  document.getElementById('stat-status-sub').textContent = overall === 'ok' ? 'Piscina liberada' : 'Verificar parâmetros';

  // Alert banner
  const banner = document.getElementById('main-alert-banner');
  if (overall === 'ok') {
    banner.className = 'alert-banner ok';
    banner.querySelector('span').textContent = 'Todos os parâmetros estão dentro do intervalo seguro.';
  } else {
    const msgs = [];
    if (ps !== 'ok') msgs.push(`pH ${p.pH.toFixed(2)} (${p.pH < PH_MIN ? 'ácido' : 'alcalino'})`);
    if (cs !== 'ok') msgs.push(`Cloro ${p.cl.toFixed(2)} ppm (${p.cl < CL_MIN ? 'baixo' : 'alto'})`);
    banner.className = `alert-banner ${overall}`;
    banner.querySelector('span').textContent = `Atenção: ${msgs.join(' · ')}`;
  }
}

/** Renders (or re-renders) the mini sparkline chart. */
export async function renderMiniChart(poolIdx) {
  const ctx = document.getElementById('mini-chart');
  if (!ctx) return;

  const chartContainer = ctx.parentElement;
  if (miniChartInst) { miniChartInst.destroy(); miniChartInst = null; }

  const rows = await getPoolHistory(poolIdx, 48);
  if (!rows.length) {
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>Sem histórico de pH para esta piscina.</p>
        </div>`;
    }
    return;
  }

  if (chartContainer) {
    chartContainer.innerHTML = '<canvas id="mini-chart"></canvas>';
  }

  const canvas = document.getElementById('mini-chart');
  const history = [...rows].reverse();
  const vals = history.map(r => r.ph);
  const labels = history.map(r => r.time);

  miniChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { data: Array(vals.length).fill(PH_MAX), borderColor: '#ff3f5a30', borderDash: [4, 4], pointRadius: 0, fill: false, borderWidth: 1 },
        { data: Array(vals.length).fill(PH_MIN), borderColor: '#ff3f5a30', borderDash: [4, 4], pointRadius: 0, fill: false, borderWidth: 1 },
        {
          data: vals, borderColor: '#00d4a8', borderWidth: 2, pointRadius: 0, tension: .3,
          fill: true,
          backgroundColor: (ctx2) => {
            const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, '#00d4a830');
            g.addColorStop(1, '#00d4a800');
            return g;
          },
        },
      ],
    },
    options: {
      ...chartBase,
      scales: { ...chartBase.scales, y: { ...chartBase.scales.y, min: 6.5, max: 8.5 } },
    },
  });
}
