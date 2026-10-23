import { Menu } from "lucide-react";
import aftermilesLogo from "../../assets/aftermiles.jpg";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  return (
    <header className="h-16 w-full z-30 bg-[#13121d]/95 backdrop-blur-md border-b-2 border-white/10 shrink-0 px-4 lg:px-6 flex items-center justify-between gap-3 text-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 rounded-md bg-[#171622] border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-white hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Menu className="h-5 w-5 font-bold stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src={aftermilesLogo}
            alt="Aftermiles"
            className="w-9 h-9 rounded-lg object-cover border-2 border-white/20 shadow-brutal-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg lg:text-xl font-black text-white tracking-tight">
                Aftermiles
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {title && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline-block">
            {title}
          </span>
        )}
      </div>
    </header>
  );
}
