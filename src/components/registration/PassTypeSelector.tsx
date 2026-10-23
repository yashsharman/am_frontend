import { cn } from '../../utils/cn';
import type { PassType } from '../../types';
import { Ticket, Sparkles } from 'lucide-react';

interface PassTypeSelectorProps {
  value: PassType;
  onChange: (value: PassType) => void;
}

export function PassTypeSelector({ value, onChange }: PassTypeSelectorProps) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
        Pass Type Selection *
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('one_day')}
          className={cn(
            'p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden',
            value === 'one_day'
              ? 'bg-[#24213d] border-neo-purple shadow-brutal translate-x-0.5 translate-y-0.5 text-white'
              : 'bg-[#171622] border-white/20 shadow-brutal-sm hover:border-white/40 text-gray-200'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-neo-purple border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-white mb-2">
            <Ticket className="h-4 w-4 stroke-[2.5]" />
          </div>
          <p className="font-black uppercase tracking-tight text-sm text-white">
            One Day
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">Single event pass</p>
          {value === 'one_day' && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neo-purple border-2 border-white/40" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange('exclusive')}
          className={cn(
            'p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden',
            value === 'exclusive'
              ? 'bg-[#24213d] border-neo-yellow shadow-brutal translate-x-0.5 translate-y-0.5 text-white'
              : 'bg-[#171622] border-white/20 shadow-brutal-sm hover:border-white/40 text-gray-200'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-neo-black mb-2">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
          <p className="font-black uppercase tracking-tight text-sm text-white">
            Exclusive
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">3 Event Credits</p>
          {value === 'exclusive' && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neo-yellow border-2 border-neo-black" />
          )}
        </button>
      </div>
    </div>
  );
}
