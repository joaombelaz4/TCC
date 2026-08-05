import { initNavbar } from '../components/navbar/index.js';
import { getAlerts, getPools } from '../services/selecoes.service.js';
import { updateDashboard, renderMiniChart } from '../pages/home/index.js';
import {
  renderMainChart,
  renderClChart,
  renderHistoryTable,
  renderAlerts,
  initSelecoes,
  destroyCharts,
} from '../pages/selecoes/index.js';

let currentPool = 0;
let appReady = false;

function doLogin() {
  const screen = document.getElementById('login-screen');
  screen.style.transition = 'opacity .4s';
  screen.style.opacity = '0';

  setTimeout(() => {
    screen.style.display = 'none';
    const app = document.getElementById('app');
    app.classList.add('visible');
    app.style.opacity = '0';
    app.style.transition = 'opacity .4s';
    setTimeout(() => (app.style.opacity = '1'), 50);

    if (!appReady) {
      bootApp().then(() => { appReady = true; });
    } else {
      updateDashboard(currentPool);
      renderMiniChart(currentPool);
    }
  }, 400);
}

function doLogout() {
  document.getElementById('app').classList.remove('visible');
  const ls = document.getElementById('login-screen');
  ls.style.display = 'flex';
  ls.style.opacity = '0';
  ls.style.transition = 'opacity .4s';
  setTimeout(() => (ls.style.opacity = '1'), 50);
}

const PAGE_HANDLERS = {
  dashboard: async () => {
    await updateDashboard(currentPool);
    await renderMiniChart(currentPool);
  },
  graficos: async () => {
    setTimeout(async () => {
      await renderMainChart(currentPool);
      await renderClChart(currentPool);
    }, 100);
  },
  historico: async () => await renderHistoryTable(currentPool),
  alertas: async () => await renderAlerts(),
  config: () => {},
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${name}`);
  if (target) target.classList.add('active');
  PAGE_HANDLERS[name]?.();
}

async function updateAlertsPanel() {
  try {
    const alerts = await getAlerts();
    const badge = document.getElementById('alert-nav-badge');
    const notifCount = document.getElementById('notif-count');
    const panel = document.getElementById('notif-items');

    if (badge) {
      badge.textContent = alerts.length;
      badge.style.display = alerts.length ? 'inline-flex' : 'none';
    }

    if (notifCount) {
      notifCount.textContent = alerts.length;
    }

    if (!panel) return;

    if (!alerts.length) {
      panel.innerHTML = `<div class="empty-state"><p>Sem notificações no momento.</p></div>`;
      return;
    }

    panel.innerHTML = alerts.slice(0, 3).map(alert => `
      <div class="tooltip-notif">
        <div class="tn-dot ${alert.type}"></div>
        <div>
          <div class="tn-text">${alert.pool}: ${alert.title}</div>
          <div class="tn-time">${alert.time}</div>
        </div>
      </div>`).join('');
  } catch (error) {
    console.error('Failed to update notification panel', error);
  }
}

async function populatePoolSelect() {
  try {
    const pools = await getPools(true);
    const select = document.getElementById('pool-select');
    if (!select) return;

    select.innerHTML = pools.map((pool, idx) => `
      <option value="${idx}">${pool.name} (${pool.size})</option>
    `).join('');

    if (pools.length > 0) {
      currentPool = Math.min(currentPool, pools.length - 1);
      select.value = currentPool;
    }
  } catch (error) {
    console.error('Falha ao carregar as piscinas', error);
  }
}

async function switchPool(idx) {
  currentPool = idx;
  destroyCharts();
  const active = document.querySelector('.page.active');
  if (active) {
    const name = active.id.replace('page-', '');
    PAGE_HANDLERS[name]?.();
  }
}

async function bootApp() {
  const res = await fetch('src/pages/selecoes/index.html');
  const html = await res.text();
  document.getElementById('selecoes-pages').innerHTML = html;

  initNavbar({
    onNavigate: showPage,
    onPoolChange: switchPool,
    onLogout: doLogout,
  });

  await populatePoolSelect();
  await initSelecoes(currentPool);
  await updateDashboard(currentPool);
  await renderMiniChart(currentPool);
  await renderHistoryTable(currentPool);
  await renderAlerts();
  await updateAlertsPanel();

  setInterval(async () => {
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      await updateDashboard(currentPool);
    }
  }, 30000);
}

function toggleForm(which) {
  document.getElementById('form-login').style.display = which === 'login' ? '' : 'none';
  document.getElementById('form-register').style.display = which === 'register' ? '' : 'none';
}

window.doLogin = doLogin;
window.toggleForm = toggleForm;
