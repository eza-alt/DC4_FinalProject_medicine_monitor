import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview', icon: '▦', end: true },
  { to: '/medicines', label: 'Medicines', icon: '✚' },
  { to: '/batches', label: 'Stock Batches', icon: '▤' },
  { to: '/requests', label: 'Stock Requests', icon: '⇄' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const pageName =
    links.find((link) => link.to === location.pathname)?.label ||
    'Health Center';

  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">✚</div>

          <div>
            <div className="brand-title">CareStock</div>
            <div className="brand-caption">HEALTH CENTER MEDICINE STOCK AND EXPIRY MONITOR</div>
          </div>
        </div>

        <div className="nav-section-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `side-link${isActive ? ' active' : ''}`
              }
            >
              <span className="side-icon" aria-hidden="true">
                {link.icon}
              </span>

              <span>{link.label}</span>

              {link.to === '/requests' && (
                <span className="nav-arrow">›</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <div className="sidebar-note-icon">♥</div>

          <strong>Medicine safety first</strong>

          <p>
            Keep stock levels healthy and expiry dates under control.
          </p>
        </div>

        {/* USER PROFILE */}
        <div className="sidebar-profile">
          <div className="avatar">{initial}</div>

          <div className="profile-copy">
            <strong>{user?.name || 'User'}</strong>

            <span>
              {isAdmin ? 'Administrator' : user?.role || 'Staff'}
            </span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
          >
            ↪
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-shell">
        <header className="topbar">
          <div>
            <div className="topbar-eyebrow">
              HEALTH CENTER / INVENTORY
            </div>

            <div className="topbar-title">{pageName}</div>
          </div>

          <div className="topbar-right">
            <span className="secure-pill">
              <span className="secure-dot" />
              Inventory workspace
            </span>

            <div className="topbar-avatar">{initial}</div>
          </div>
        </header>

        <main className="container page-content">
          <Outlet />

          <footer className="app-footer">
            <span>
              CareStock
              <span className="footer-dot"> • </span>
              Medicine Stock & Expiry Monitor
            </span>

            <span>
              Medical Blue{' '}
              <span className="footer-blue">#2563EB</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}