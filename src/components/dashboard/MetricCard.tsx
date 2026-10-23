import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'purple' | 'lime' | 'peach' | 'yellow' | 'pink' | 'black';
  subtitle?: string;
  badge?: string;
}

const colorMap = {
  purple: {
    iconBg: 'bg-neo-purple text-white border-white/20',
    badgeBg: 'bg-neo-purple text-white border-white/20',
  },
  lime: {
    iconBg: 'bg-neo-lime text-neo-black border-neo-black',
    badgeBg: 'bg-neo-lime text-neo-black border-neo-black',
  },
  peach: {
    iconBg: 'bg-neo-peach text-white border-white/20',
    badgeBg: 'bg-neo-peach text-white border-white/20',
  },
  yellow: {
    iconBg: 'bg-neo-yellow text-neo-black border-neo-black',
    badgeBg: 'bg-neo-yellow text-neo-black border-neo-black',
  },
  pink: {
    iconBg: 'bg-neo-pink text-neo-black border-neo-black',
    badgeBg: 'bg-neo-pink text-neo-black border-neo-black',
  },
  black: {
    iconBg: 'bg-[#1f1d2e] text-white border-white/20',
    badgeBg: 'bg-[#1f1d2e] text-white border-white/20',
  },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  color = 'purple',
  subtitle,
  badge,
}: MetricCardProps) {
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-[#171622] border-2 border-white/15 rounded-xl p-3.5 shadow-brutal flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:border-white/30 transition-all text-white">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] uppercase font-black tracking-wider text-gray-400 truncate block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white leading-none mt-1.5 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span
              className={cn(
                'px-2 py-0.5 rounded border-2 font-black text-xs shadow-brutal-sm',
                c.badgeBg
              )}
            >
              {badge}
            </span>
          )}
          <div
            className={cn(
              'w-8 h-8 rounded-lg border-2 shadow-brutal-sm flex items-center justify-center shrink-0',
              c.iconBg
            )}
          >
            <Icon className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2 border-t-2 border-dashed border-white/10 text-[11px] font-bold text-gray-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}
