import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border-2 border-neo-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wide transition-all shadow-brutal-sm',
  {
    variants: {
      variant: {
        default: 'bg-neo-purple text-white',
        secondary: 'bg-neo-bg text-neo-black',
        destructive: 'bg-neo-peach text-white',
        outline: 'bg-white text-neo-black',
        success: 'bg-neo-lime text-neo-black',
        warning: 'bg-neo-yellow text-neo-black',
        danger: 'bg-neo-peach text-white',
        info: 'bg-[#dae2fd] text-neo-purple',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
