import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users2,
  Building2,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/common/NotificationDropdown';

export const RecruiterLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Job Postings', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Company Profile', path: '/recruiter/profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/recruiter/dashboard" className="flex items-center gap-2.5">
                
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-slate-900 tracking-tight leading-none">
                    Jobs Portal
                  </span>
                  <span className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider mt-0.5">
                    Recruiter Console
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
                            ? 'text-violet-700 bg-violet-50/80 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <Link
                to="/recruiter/jobs?action=create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm transition-all shadow-violet-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Job</span>
              </Link>

              <NotificationDropdown />

              <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center justify-center text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'R'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {user?.company_name || 'Recruiter'}
                  </span>
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
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2">
              <Link
                to="/recruiter/jobs?action=create"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Job</span>
              </Link>
            </div>
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
          <p>© 2026 Jobs Portal Inc. ATS Candidate Screening & Recruitment Suite.</p>
          <div className="flex items-center">
            <span>Deterministic 60/20/20 ATS Scoring</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

