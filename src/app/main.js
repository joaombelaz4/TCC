import { initNavbar }             from '../components/navbar/index.js';
import { tickSensorReadings }     from '../services/selecoes.service.js';
import { updateDashboard, renderMiniChart } from '../pages/home/index.js';
import {
  renderMainChart, renderClChart,
  renderHistoryTable, renderAlerts,
  initSelecoes, destroyCharts,
} from '../pages/selecoes/index.js';

// ── State ─────────────────────────────────────────────────
let currentPool = 0;
let appReady    = false;

// ── Login / Logout ────────────────────────────────────────
function doLogin() {
  const screen = document.getElementById('login-screen');
  screen.style.transition = 'opacity .4s';
  screen.style.opacity    = '0';

  setTimeout(() => {
    screen.style.display = 'none';
    const app = document.getElementById('app');
    app.classList.add('visible');
    app.style.opacity    = '0';
    app.style.transition = 'opacity .4s';
    setTimeout(() => (app.style.opacity = '1'), 50);

    if (!appReady) { bootApp().then(() => { appReady = true; }); }
    else           { updateDashboard(currentPool); renderMiniChart(currentPool); }
  }, 400);
}

function doLogout() {
  document.getElementById('app').classList.remove('visible');
  const ls = document.getElementById('login-screen');
  ls.style.display    = 'flex';
  ls.style.opacity    = '0';
  ls.style.transition = 'opacity .4s';
  setTimeout(() => (ls.style.opacity = '1'), 50);
}

// ── Routing ───────────────────────────────────────────────
const PAGE_HANDLERS = {
  dashboard: () => { updateDashboard(currentPool); renderMiniChart(currentPool); },
  graficos:  () => { setTimeout(() => { renderMainChart(currentPool); renderClChart(currentPool); }, 100); },
  historico: () => renderHistoryTable(currentPool),
  alertas:   () => renderAlerts(),
  config:    () => {},
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${name}`);
  if (target) target.classList.add('active');
  PAGE_HANDLERS[name]?.();
}

// ── Pool switch ───────────────────────────────────────────
function switchPool(idx) {
  currentPool = idx;
  destroyCharts();

  // Re-render whatever page is currently visible
  const active = document.querySelector('.page.active');
  if (active) {
    const name = active.id.replace('page-', '');
    PAGE_HANDLERS[name]?.();
  }
}

// ── Boot ──────────────────────────────────────────────────
async function bootApp() {
  // Injeta o HTML das páginas secundárias antes de qualquer init
  const res  = await fetch('src/pages/selecoes/index.html');
  const html = await res.text();
  document.getElementById('selecoes-pages').innerHTML = html;

  initNavbar({
    onNavigate:   showPage,
    onPoolChange: switchPool,
    onLogout:     doLogout,
  });

  initSelecoes(currentPool);
  updateDashboard(currentPool);
  renderMiniChart(currentPool);
  renderHistoryTable(currentPool);
  renderAlerts();

  // Sensor simulation: small drift every 30 s
  setInterval(() => {
    tickSensorReadings();
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      updateDashboard(currentPool);
    }
  }, 30_000);
}

// ── Login form wiring ─────────────────────────────────────
function toggleForm(which) {
  document.getElementById('form-login').style.display    = which === 'login'    ? '' : 'none';
  document.getElementById('form-register').style.display = which === 'register' ? '' : 'none';
}

// Expose only what the HTML inline handlers need
window.doLogin    = doLogin;
window.toggleForm = toggleForm;
