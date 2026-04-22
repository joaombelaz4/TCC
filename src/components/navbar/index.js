/**
 * Navbar component
 * Handles topbar + sidebar interactions.
 *
 * @param {Object} handlers
 * @param {Function} handlers.onNavigate   - called with page name string
 * @param {Function} handlers.onPoolChange - called with pool index number
 * @param {Function} handlers.onLogout     - called on logout click
 */
export function initNavbar({ onNavigate, onPoolChange, onLogout }) {
  // ── Sidebar navigation ──────────────────────────────
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      setActiveNavItem(page);
      onNavigate(page);
    });
  });

  // ── Pool selector ────────────────────────────────────
  document.getElementById('pool-select').addEventListener('change', e => {
    onPoolChange(parseInt(e.target.value, 10));
  });

  // ── Logout ───────────────────────────────────────────
  document.getElementById('btn-logout').addEventListener('click', onLogout);

  // ── Notifications ────────────────────────────────────
  document.getElementById('notif-btn').addEventListener('click', toggleNotifPanel);

  document.addEventListener('click', e => {
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) {
      document.getElementById('notif-panel').classList.remove('show');
    }
  });
}

export function setActiveNavItem(page) {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

function toggleNotifPanel() {
  document.getElementById('notif-panel').classList.toggle('show');
}
