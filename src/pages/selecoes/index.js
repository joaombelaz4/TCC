import { PH_MIN, PH_MAX, CL_MIN, CL_MAX } from '../../config/env.js';
import { getPool, getPoolHistory, getAlerts, getSettings, saveSettings } from '../../services/selecoes.service.js';
import { statusLabel } from '../../utils/formatters.js';

// ── Chart instances ───────────────────────────────────────
let mainChartInst = null;
let clChartInst   = null;

// ── Active time ranges ────────────────────────────────────
let mainRange = '24h';
let clRange   = '24h';

/** Shared Chart.js defaults */
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
    x: {
      grid: { color: '#1c2e4860' },
      ticks: { color: '#4a607a', font: { size: 11, family: 'Share Tech Mono' } },
      border: { display: false },
    },
    y: {
      grid: { color: '#1c2e4860' },
      ticks: { color: '#4a607a', font: { size: 11, family: 'Share Tech Mono' } },
      border: { display: false },
    },
  },
};

/** Returns full pH dataset for a given pool and time range. */
async function buildPhDataset(poolIdx, range) {
  const limit = range === '7d' ? 7 : range === '30d' ? 30 : 48;
  const rows = await getPoolHistory(poolIdx, limit);
  if (!rows.length) return { count: 0, labels: [], vals: [] };

  const history = [...rows].reverse();
  return {
    count: history.length,
    labels: range === '24h'
      ? history.map(r => r.time)
      : history.map(r => r.date),
    vals: history.map(r => r.ph),
  };
}

/** Returns full chlorine dataset for a given pool and time range. */
async function buildClDataset(poolIdx, range) {
  const limit = range === '7d' ? 7 : range === '30d' ? 30 : 48;
  const rows = await getPoolHistory(poolIdx, limit);
  if (!rows.length) return { count: 0, labels: [], vals: [] };

  const history = [...rows].reverse();
  return {
    count: history.length,
    labels: range === '24h'
      ? history.map(r => r.time)
      : history.map(r => r.date),
    vals: history.map(r => r.cl),
  };
}

// ── Public renderers ──────────────────────────────────────

/** Renders the pH line chart. */
export async function renderMainChart(poolIdx) {
  const ctx = document.getElementById('main-chart');
  if (!ctx) return;
  if (mainChartInst) { mainChartInst.destroy(); mainChartInst = null; }

  const chartContainer = ctx.parentElement;
  const { count, labels, vals } = await buildPhDataset(poolIdx, mainRange);
  if (!count) {
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
    chartContainer.innerHTML = '<canvas id="main-chart"></canvas>';
  }

  const canvas = document.getElementById('main-chart');
  const showPoints = mainRange !== '24h';
  const chartCtx = canvas.getContext('2d');

  mainChartInst = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { data: Array(count).fill(PH_MAX), borderColor: '#ff3f5a50', borderDash: [5, 5], pointRadius: 0, fill: false, borderWidth: 1.5, label: 'Máx' },
        { data: Array(count).fill(PH_MIN), borderColor: '#f5a62350', borderDash: [5, 5], pointRadius: 0, fill: false, borderWidth: 1.5, label: 'Mín' },
        {
          data: vals, borderColor: '#00d4a8', borderWidth: 2.5,
          pointRadius: showPoints ? 4 : 0,
          pointBackgroundColor: vals.map(v => (v < PH_MIN || v > PH_MAX) ? '#ff3f5a' : '#00d4a8'),
          tension: .35, fill: true, label: 'pH',
          backgroundColor: (c) => {
            const g = c.chart.ctx.createLinearGradient(0, 0, 0, 300);
            g.addColorStop(0, '#00d4a825'); g.addColorStop(1, '#00d4a800');
            return g;
          },
        },
      ],
    },
    options: {
      ...chartBase,
      plugins: {
        ...chartBase.plugins,
        legend: { display: true, labels: { color: '#4a607a', font: { size: 11 }, boxWidth: 12 } },
      },
      scales: {
        ...chartBase.scales,
        y: { ...chartBase.scales.y, min: 6, max: 10, title: { display: true, text: 'pH', color: '#4a607a' } },
      },
    },
  });
}

/** Renders the chlorine line chart. */
export async function renderClChart(poolIdx) {
  const ctx = document.getElementById('cl-chart');
  if (!ctx) return;
  if (clChartInst) { clChartInst.destroy(); clChartInst = null; }

  const chartContainer = ctx.parentElement;
  const { count, labels, vals } = await buildClDataset(poolIdx, clRange);
  if (!count) {
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>Sem histórico de cloro para esta piscina.</p>
        </div>`;
    }
    return;
  }

  if (chartContainer) {
    chartContainer.innerHTML = '<canvas id="cl-chart"></canvas>';
  }

  const canvas = document.getElementById('cl-chart');
  const showPoints = clRange !== '24h';
  const chartCtx = canvas.getContext('2d');

  clChartInst = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { data: Array(count).fill(CL_MAX), borderColor: '#ff3f5a50', borderDash: [5, 5], pointRadius: 0, fill: false, borderWidth: 1.5 },
        { data: Array(count).fill(CL_MIN), borderColor: '#f5a62350', borderDash: [5, 5], pointRadius: 0, fill: false, borderWidth: 1.5 },
        {
          data: vals, borderColor: '#0090ff', borderWidth: 2.5,
          pointRadius: showPoints ? 4 : 0,
          pointBackgroundColor: vals.map(v => (v < CL_MIN || v > CL_MAX) ? '#ff3f5a' : '#0090ff'),
          tension: .35, fill: true,
          backgroundColor: (c) => {
            const g = c.chart.ctx.createLinearGradient(0, 0, 0, 240);
            g.addColorStop(0, '#0090ff25'); g.addColorStop(1, '#0090ff00');
            return g;
          },
        },
      ],
    },
    options: {
      ...chartBase,
      scales: {
        ...chartBase.scales,
        y: { ...chartBase.scales.y, min: 0, max: 5, title: { display: true, text: 'ppm', color: '#4a607a' } },
      },
    },
  });
}

/** Renders the history table for a pool. */
export async function renderHistoryTable(poolIdx) {
  const rows  = await getPoolHistory(poolIdx);
  document.getElementById('hist-count').textContent = `Mostrando ${rows.length} registros`;

  if (!rows.length) {
    document.getElementById('history-tbody').innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Nenhuma leitura registrada para esta piscina.</td>
      </tr>`;
    return;
  }

  document.getElementById('history-tbody').innerHTML = [...rows].reverse().map(r => `
    <tr>
      <td>${r.date} ${r.time}</td>
      <td class="td-mono" style="color:${r.status === 'ok' ? 'var(--ok)' : r.status === 'warn' ? 'var(--warn)' : 'var(--danger)'}">${r.ph}</td>
      <td class="td-mono">${r.cl}</td>
      <td class="td-mono">${r.temp}</td>
      <td><span class="badge ${r.status}">${statusLabel(r.status)}</span></td>
      <td style="color:var(--muted);font-size:12px">
        ${r.status === 'ok' ? '—' : r.status === 'warn' ? 'Verificar parâmetros' : 'Intervenção necessária'}
      </td>
    </tr>
  `).join('');
}

/** Renders the alerts list. */
export async function renderAlerts() {
  const list    = document.getElementById('alert-list');
  const alerts  = await getAlerts();

  if (!alerts.length) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p>Nenhum alerta para esta piscina</p>
      </div>`;
    return;
  }

  const iconOk = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  const iconWarn = (color) => `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`;

  list.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <div class="alert-icon ${a.type}">
        ${a.type === 'ok'
          ? iconOk
          : iconWarn(a.type === 'danger' ? 'var(--danger)' : 'var(--warn)')}
      </div>
      <div style="flex:1">
        <div class="ai-title">${a.title}</div>
        <div class="ai-meta">${a.pool} · ${a.msg}</div>
      </div>
      <div class="ai-time">${a.time}</div>
    </div>
  `).join('');
}

/** Wires up the time-range tab buttons inside the graficos page. */
export function initChartTabs(poolIdx) {
  document.querySelectorAll('.time-tab[data-chart]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const chart = btn.dataset.chart;
      const range = btn.dataset.range;

      // Reset sibling active states
      btn.closest('.time-tabs').querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (chart === 'ph') { mainRange = range; await renderMainChart(poolIdx); }
      else                { clRange   = range; await renderClChart(poolIdx);   }
    });
  });
}

async function loadSettings() {
  const settings = await getSettings();
  if (!settings) return;

  document.getElementById('cfg-ph-min').value = settings.ph_min ?? 7.2;
  document.getElementById('cfg-ph-max').value = settings.ph_max ?? 7.8;
  document.getElementById('cfg-cl-min').value = settings.cl_min ?? 0.5;
  document.getElementById('cfg-cl-max').value = settings.cl_max ?? 3.0;
  const select = document.querySelector('#cfg-sensor-frequency');
  if (select && settings.sensor_frequency) select.value = settings.sensor_frequency;
}

/** Wires up the config save button. */
export function initConfig() {
  document.getElementById('btn-save-config')?.addEventListener('click', async () => {
    const phMin = document.getElementById('cfg-ph-min').value;
    const phMax = document.getElementById('cfg-ph-max').value;
    const clMin = document.getElementById('cfg-cl-min').value;
    const clMax = document.getElementById('cfg-cl-max').value;
    const frequencySelect = document.querySelector('#cfg-sensor-frequency');
    const sensorFrequency = frequencySelect ? frequencySelect.value : '30m';

    await saveSettings({
      ph_min: phMin,
      ph_max: phMax,
      cl_min: clMin,
      cl_max: clMax,
      sensor_frequency: sensorFrequency,
    });

    alert('Configurações salvas!');
  });
}

/** Call once after the selecoes HTML is injected into the DOM. */
export async function initSelecoes(poolIdx) {
  initChartTabs(poolIdx);
  initConfig();
  await loadSettings();
}

/** Destroys all chart instances (call before switching pools). */
export function destroyCharts() {
  if (mainChartInst) { mainChartInst.destroy(); mainChartInst = null; }
  if (clChartInst)   { clChartInst.destroy();   clChartInst   = null; }
}
