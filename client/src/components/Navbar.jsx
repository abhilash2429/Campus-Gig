import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navByRole = {
  student: [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/gigs', label: 'Browse Gigs' },
    { to: '/student/applications', label: 'My Applications' },
  ],
  faculty: [
    { to: '/client', label: 'Dashboard' },
    { to: '/client/post-gig', label: 'Post Gig' },
  ],
  client: [
    { to: '/client', label: 'Dashboard' },
    { to: '/client/post-gig', label: 'Post Gig' },
  ],
  college_admin: [
    { to: '/admin/college', label: 'Dashboard' },
    { to: '/admin/college/users', label: 'Users' },
    { to: '/admin/college/gigs', label: 'Gigs' },
    { to: '/admin/college/payouts', label: 'Payouts' },
  ],
  super_admin: [
    { to: '/admin/super', label: 'Overview' },
    { to: '/admin/super/colleges', label: 'Colleges' },
    { to: '/admin/super/colleges/new', label: '+ New College' },
  ],
};

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-btn-primary flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Campus <span className="text-gradient">GIG</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to !== '/student/gigs' && link.to !== '/student/applications'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User block */}
          <div className="hidden md:flex items-center gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-btn-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize leading-none mt-0.5">
                  {(user?.role || '').replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost btn-sm flex items-center gap-1.5"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-btn-primary flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{(user?.role || '').replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost btn-sm"
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
