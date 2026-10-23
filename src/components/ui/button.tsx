import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-black uppercase tracking-wider ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-purple disabled:pointer-events-none disabled:opacity-50 select-none active:translate-x-0.5 active:translate-y-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-neo-purple text-white border-2 border-neo-black shadow-brutal hover:bg-indigo-600 active:shadow-none',
        destructive:
          'bg-neo-peach text-white border-2 border-neo-black shadow-brutal hover:bg-red-600 active:shadow-none',
        outline:
          'border-2 border-neo-black bg-white hover:bg-neo-yellow text-neo-black shadow-brutal-sm active:shadow-none',
        secondary:
          'bg-neo-bg text-neo-black border-2 border-neo-black shadow-brutal-sm hover:bg-neo-yellow active:shadow-none',
        ghost: 'hover:bg-neo-yellow/30 text-neo-black',
        link: 'text-neo-purple underline-offset-4 hover:underline normal-case',
        success:
          'bg-neo-lime text-neo-black border-2 border-neo-black shadow-brutal hover:bg-[#34e294] active:shadow-none',
        warning:
          'bg-neo-yellow text-neo-black border-2 border-neo-black shadow-brutal hover:bg-amber-300 active:shadow-none',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-8 rounded-md px-2.5 text-xs',
        lg: 'h-12 rounded-xl px-6 text-sm',
        xl: 'h-14 rounded-xl px-8 text-base',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
