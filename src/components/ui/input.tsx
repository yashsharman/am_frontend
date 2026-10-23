import * as React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-2 border-white/20 bg-[#171622] px-3.5 py-2 text-sm font-bold text-white shadow-brutal-sm placeholder:text-gray-500 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-purple focus-visible:border-neo-purple disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
