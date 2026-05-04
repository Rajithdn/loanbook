// src/components/Layout.js - Main App Shell with Sidebar
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◈', end: true },
  { to: '/borrowers', label: 'Borrowers', icon: '◉' },
  { to: '/loans', label: 'Loans', icon: '◎' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>₹</span>
          <div>
            <div style={styles.logoText}>LoanBook</div>
            <div style={styles.logoSub}>Track every paisa</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          <div style={styles.navLabel}>MENU</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⇥</button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top bar (mobile) */}
        <header style={styles.topbar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>☰</button>
          <span style={styles.logoTextMobile}>LoanBook</span>
          <div style={styles.userAvatarSm}>{user?.name?.[0]?.toUpperCase()}</div>
        </header>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 99,
  },
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    transition: 'transform 0.3s ease',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: {
    fontSize: 28,
    color: 'var(--accent)',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    lineHeight: 1,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 18,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  nav: { flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '1px',
    padding: '0 8px 10px',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 16px',
    borderTop: '1px solid var(--border)',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    flexShrink: 0,
  },
  userName: { fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 18,
    padding: 4,
    borderRadius: 6,
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  main: {
    flex: 1,
    marginLeft: 240,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topbar: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: 20,
    cursor: 'pointer',
  },
  logoTextMobile: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 16,
    color: 'var(--accent)',
  },
  userAvatarSm: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
  },
  content: {
    flex: 1,
    padding: '32px 36px',
    maxWidth: 1200,
    width: '100%',
  },
};

// Responsive: show topbar and hide sidebar margin on mobile
const styleTag = document.createElement('style');
styleTag.textContent = `
  @media (max-width: 768px) {
    aside { transform: translateX(-100%); }
    .main-content { margin-left: 0 !important; }
    header { display: flex !important; }
    main { padding: 20px 16px !important; }
  }
`;
document.head.appendChild(styleTag);

export default Layout;
