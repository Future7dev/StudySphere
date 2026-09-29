import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Upload, User, LogOut, Menu, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload',    label: 'Upload',    icon: Upload },
];

export default function Navbar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={state.isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
          <div className="navbar-logo-icon">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <span className="navbar-logo-text">StudySphere</span>
        </Link>

        {/* Desktop Nav */}
        {state.isAuthenticated && (
          <nav className="navbar-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`navbar-link ${isActive(to) ? 'active' : ''}`}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {state.isAuthenticated ? (
            <>
              <div className="navbar-streak">
                <span className="streak-fire">🔥</span>
                <span className="streak-count">{state.user.streak}</span>
              </div>
              <Link to="/profile" className="navbar-avatar-btn" title={state.user.name}>
                <div className="navbar-avatar">
                  {state.user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} className="navbar-logout" title="Sign out">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="navbar-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile animate-in">
          {state.isAuthenticated ? (
            <>
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`navbar-mobile-link ${isActive(to) ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <Link to="/profile" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
                <User size={16} /> Profile
              </Link>
              <button className="navbar-mobile-link danger" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link to="/signup" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
