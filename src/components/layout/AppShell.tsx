import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';
import { LayoutDashboard, QrCode, UserPlus, Users, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/checkin': 'Event Check-in',
  '/register': 'Register Attendee',
  '/attendees': 'Attendees',
  '/events': 'Events Management',
  '/history': 'Check-in History',
  '/admin': 'Admin & Staff',
};

const mobileNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checkin', icon: QrCode, label: 'Check-in', highlight: true },
  { to: '/register', icon: UserPlus, label: 'Register' },
  { to: '/attendees', icon: Users, label: 'Attendees' },
  { to: '/events', icon: Calendar, label: 'Events' },
];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Aftermiles Admin';

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <OfflineBanner />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        
        {/* Main Content Area: pb-16 on mobile for the bottom bar, normal on lg screens */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Mobile-first PWA experience) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-bottom">
          {mobileNavItems.map(({ to, icon: Icon, label, highlight }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs font-medium transition-all select-none',
                  isActive
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-900',
                  highlight && isActive && 'text-indigo-600',
                  highlight && !isActive && 'text-indigo-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-xl transition-all',
                      highlight && 'bg-indigo-50 p-1.5 -mt-2 shadow-sm border border-indigo-100',
                      isActive && highlight && 'bg-indigo-600 text-white',
                      isActive && !highlight && 'bg-indigo-50 text-indigo-600'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', highlight && isActive && 'text-white')} />
                  </div>
                  <span className={cn('text-[11px] mt-0.5 leading-tight', isActive && 'font-bold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
