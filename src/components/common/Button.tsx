import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl select-none focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 space-x-1.5 min-h-[38px]',
    md: 'text-sm px-4 py-2.5 space-x-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 space-x-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#1e40af] text-white hover:bg-[#1d4ed8] active:bg-[#1e3a8a] focus:ring-[#03132e] shadow-xs border-2 border-[#03132e] font-semibold',
    secondary:
      'bg-slate-100 text-[#03132e] hover:bg-slate-200 active:bg-slate-300 focus:ring-[#03132e] border border-slate-300 font-medium',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-600 shadow-xs border-2 border-rose-950 font-semibold',
    outline:
      'bg-white text-[#1e40af] hover:bg-blue-50 active:bg-blue-100 border-2 border-[#03132e] font-semibold focus:ring-[#03132e]',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-[#03132e] focus:ring-[#03132e]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
