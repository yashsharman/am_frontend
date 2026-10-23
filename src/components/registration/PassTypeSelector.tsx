import { cn } from '../../utils/cn';
import type { PassType } from '../../types';

interface PassTypeSelectorProps {
  value: PassType;
  onChange: (value: PassType) => void;
}

export function PassTypeSelector({ value, onChange }: PassTypeSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Pass Type *</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('one_day')}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all',
            value === 'one_day'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <div className="text-2xl mb-1">🎫</div>
          <p className={cn('font-semibold text-sm', value === 'one_day' ? 'text-indigo-700' : 'text-gray-700')}>
            One Day
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Single event pass</p>
        </button>

        <button
          type="button"
          onClick={() => onChange('exclusive')}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all',
            value === 'exclusive'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <div className="text-2xl mb-1">⭐</div>
          <p className={cn('font-semibold text-sm', value === 'exclusive' ? 'text-indigo-700' : 'text-gray-700')}>
            Exclusive
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Multi-event credits</p>
        </button>
      </div>
    </div>
  );
}
