import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';
import {
  LayoutDashboard,
  QrCode,
  UserPlus,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const pageTitles: Record<string, string> = {
  '/': 'Control Deck',
  '/checkin': 'Check-in Gate',
  '/register': 'Enroll Attendee',
  '/attendees': 'Attendee Roster',
  '/events': 'Events Management',
  '/history': 'Check-in Stream',
  '/admin': 'Admin & Staff',
};

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Aftermiles Admin';

  return (
    <div className="flex h-screen w-full bg-neo-bg overflow-hidden font-sans text-white">
      <OfflineBanner />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:p-6 pb-28 sm:pb-32 lg:pb-8 no-scrollbar bg-neo-bg">
          <div className="max-w-7xl mx-auto min-h-full flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>

            {/* Dedicated scroll clearance spacer on mobile */}
            <div className="h-14 lg:hidden shrink-0 pointer-events-none" aria-hidden="true" />
          </div>
        </main>

        {/* Neo-Brutalist Floating Bottom Navigation Dock (Mobile / Small Tablet) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe px-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md bg-[#171622]/95 backdrop-blur-md border-2 border-white/15 rounded-2xl shadow-brutal-lg p-1.5 flex items-center justify-between mb-2">
            {/* Home / Dashboard */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all',
                  isActive
                    ? 'text-neo-yellow font-black'
                    : 'text-gray-400 hover:text-white active:scale-95 font-bold'
                )
              }
            >
              <LayoutDashboard className="h-5 w-5 stroke-[2.5]" />
              <span className="text-[10px] uppercase tracking-tight mt-0.5">Home</span>
            </NavLink>

            {/* Attendees / People */}
            <NavLink
              to="/attendees"
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all',
                  isActive
                    ? 'text-neo-yellow font-black'
                    : 'text-gray-400 hover:text-white active:scale-95 font-bold'
                )
              }
            >
              <Users className="h-5 w-5 stroke-[2.5]" />
              <span className="text-[10px] uppercase tracking-tight mt-0.5">People</span>
            </NavLink>

            {/* Center Focal Scanner Action */}
            <div className="flex items-center justify-center px-1">
              <NavLink
                to="/checkin"
                aria-label="Check-in Scanner"
                className={({ isActive }) =>
                  cn(
                    'relative -top-3 w-12 h-12 sm:w-13 sm:h-13 rounded-xl border-2 flex items-center justify-center transition-all',
                    'shadow-brutal active:translate-y-[-8px] active:shadow-none',
                    isActive
                      ? 'bg-[#171622] text-neo-yellow border-2 border-neo-yellow ring-2 ring-neo-yellow/30'
                      : 'bg-[#171622] text-gray-400 border-2 border-white/20 hover:text-white'
                  )
                }
              >
                <QrCode className="h-6 w-6 stroke-[2.5]" />
              </NavLink>
            </div>

            {/* Register / Enroll */}
            <NavLink
              to="/register"
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all',
                  isActive
                    ? 'text-neo-yellow font-black'
                    : 'text-gray-400 hover:text-white active:scale-95 font-bold'
                )
              }
            >
              <UserPlus className="h-5 w-5 stroke-[2.5]" />
              <span className="text-[10px] uppercase tracking-tight mt-0.5">Enroll</span>
            </NavLink>

            {/* Events */}
            <NavLink
              to="/events"
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all',
                  isActive
                    ? 'text-neo-yellow font-black'
                    : 'text-gray-400 hover:text-white active:scale-95 font-bold'
                )
              }
            >
              <Calendar className="h-5 w-5 stroke-[2.5]" />
              <span className="text-[10px] uppercase tracking-tight mt-0.5">Events</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
