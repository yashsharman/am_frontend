import { Menu, LogOut, Bell, Cloud } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCheckinStore } from '../../stores/checkinStore';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  const { user, logout } = useAuth();
  const { currentEvent } = useCheckinStore();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OP';

  return (
    <header className="h-16 w-full z-30 bg-[#f5f3ff]/95 backdrop-blur-md border-b-2 border-neo-black shrink-0 px-4 lg:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-neo-black hover:bg-neo-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Menu className="h-5 w-5 font-bold" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-neo-purple border-2 border-neo-black shadow-brutal-sm flex items-center justify-center p-1 text-white font-black text-sm">
            ⚡
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg lg:text-xl font-black text-neo-black tracking-tight">Aftermiles</span>
              <span className="w-2.5 h-2.5 rounded-full bg-neo-lime border-2 border-neo-black animate-pulse"></span>
            </div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-neo-purple mt-0.5">
              {title === 'Dashboard' ? 'Control Deck' : title}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Active gate / event indicator */}
        <div className="hidden sm:flex h-9 px-3 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm items-center gap-1.5 text-xs font-black uppercase text-neo-black">
          <Cloud className="h-3.5 w-3.5 text-neo-purple stroke-[3]" />
          <span className="max-w-[120px] truncate">
            {currentEvent ? currentEvent.name : 'Gate #01'}
          </span>
        </div>

        {/* Notifications button */}
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-md bg-white border-2 border-neo-black shadow-brutal-sm hover:bg-neo-peach active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-neo-black"
          type="button"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neo-peach border-2 border-neo-black"></span>
        </button>

        {/* User initials badge */}
        <div
          title={`${user?.name || 'Operator'} (${user?.role?.replace('_', ' ') || 'Staff'})`}
          className="w-9 h-9 rounded-md bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center font-black text-xs text-neo-black select-none cursor-default"
        >
          {userInitials}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          title="Logout"
          aria-label="Logout"
          className="w-9 h-9 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm flex items-center justify-center hover:bg-rose-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-gray-700 hover:text-red-600"
          type="button"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
