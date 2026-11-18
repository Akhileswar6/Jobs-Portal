import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FileCheck2,
  Milestone,
  UserCircle,
  LogOut,
  Menu,
  X,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/common/NotificationDropdown';

export const CandidateLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Discover Jobs', path: '/candidate/jobs', icon: Compass },
    { label: 'Applications', path: '/candidate/applications', icon: FileCheck2 },
    { label: 'AI Roadmap', path: '/candidate/roadmap', icon: Milestone, badge: 'AI' },
    { label: 'My Profile', path: '/candidate/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/candidate/dashboard" className="flex items-center gap-2.5">
                
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-slate-900 tracking-tight leading-none">
                    Jobs Portal
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    Candidate Portal
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[11px] text-slate-400">Candidate</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Jobs Portal Inc. Professional ATS & Job Board.</p>
          <div className="flex items-center">
            <span>Deterministic ATS Matching Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

