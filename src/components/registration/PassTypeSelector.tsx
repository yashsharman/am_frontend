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
      <p className="text-xs font-black uppercase tracking-wider text-neo-black mb-2">
        Pass Type Selection *
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('one_day')}
          className={cn(
            'p-3.5 rounded-xl border-2 border-neo-black text-left transition-all relative overflow-hidden',
            value === 'one_day'
              ? 'bg-[#EEF2FF] shadow-brutal translate-x-0.5 translate-y-0.5'
              : 'bg-white shadow-brutal-sm hover:bg-neo-bg hover:translate-x-0.5'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-neo-purple border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-white mb-2">
            <Ticket className="h-4 w-4 stroke-[2.5]" />
          </div>
          <p className="font-black uppercase tracking-tight text-sm text-neo-black">
            One Day
          </p>
          <p className="text-[11px] font-bold text-gray-600 mt-0.5">Single event pass</p>
          {value === 'one_day' && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neo-purple border-2 border-neo-black" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange('exclusive')}
          className={cn(
            'p-3.5 rounded-xl border-2 border-neo-black text-left transition-all relative overflow-hidden',
            value === 'exclusive'
              ? 'bg-[#EEF2FF] shadow-brutal translate-x-0.5 translate-y-0.5'
              : 'bg-white shadow-brutal-sm hover:bg-neo-bg hover:translate-x-0.5'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-neo-black mb-2">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
          <p className="font-black uppercase tracking-tight text-sm text-neo-black">
            Exclusive
          </p>
          <p className="text-[11px] font-bold text-gray-600 mt-0.5">3 Event Credits</p>
          {value === 'exclusive' && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neo-yellow border-2 border-neo-black" />
          )}
        </button>
      </div>
    </div>
  );
}
