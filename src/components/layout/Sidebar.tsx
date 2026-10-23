import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  UserPlus,
  Users,
  Calendar,
  Clock,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import aftermilesLogo from '../../assets/aftermiles.jpg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Control Deck' },
  { to: '/checkin', icon: QrCode, label: 'Gate Scanner' },
  { to: '/register', icon: UserPlus, label: 'Enroll Attendee' },
  { to: '/attendees', icon: Users, label: 'Attendee Roster' },
  { to: '/events', icon: Calendar, label: 'Events Schedule' },
  { to: '/history', icon: Clock, label: 'Scan Stream' },
];

const adminItems = [{ to: '/admin', icon: Settings, label: 'Admin Settings' }];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neo-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-neo-black text-white border-r-2 border-neo-black flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0 shadow-brutal-lg' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src={aftermilesLogo}
              alt="Aftermiles"
              className="w-9 h-9 rounded-lg object-cover border-2 border-white/20 shadow-brutal-sm"
            />
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Aftermiles</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neo-lime">Control Deck</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wide transition-all',
                  isActive
                    ? 'bg-neo-yellow text-neo-black font-black border-2 border-neo-black shadow-brutal-sm translate-x-0.5'
                    : 'text-gray-300 font-bold hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Administration
                </p>
              </div>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wide transition-all',
                      isActive
                        ? 'bg-neo-yellow text-neo-black font-black border-2 border-neo-black shadow-brutal-sm translate-x-0.5'
                        : 'text-gray-300 font-bold hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Card & Logout at bottom of sidebar */}
        <div className="p-3 border-t-2 border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-neo-peach border border-white/20 text-white font-black text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate">{user?.name || 'Operator'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {user?.role?.replace('_', ' ') || 'Staff'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              title="Logout"
              aria-label="Logout"
              className="w-8 h-8 rounded-md bg-[#171622] border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-gray-400 hover:bg-rose-900/40 hover:text-rose-400 hover:border-rose-500/50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0"
              type="button"
            >
              <LogOut className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
