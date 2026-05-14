import React from 'react';
import { cn } from '@/lib/utils';

interface WeraLinkLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const WeraLinkLogo: React.FC<WeraLinkLogoProps> = ({ 
  variant = 'light', 
  size = 'md', 
  showText = true,
  className,
  ...props 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-4xl' },
    xl: { icon: 'w-16 h-16', text: 'text-5xl' },
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-accent-dark',
    primary: 'text-primary-wera',
  };

  return (
    <div className={cn('flex items-center gap-2 select-none', className)} {...props}>
      <svg 
        className={cn("shrink-0", sizeClasses[size].icon)} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="24" fill="#B32B3A" />
        <path 
          d="M25 35L40 70L50 45L60 70L75 35" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <circle cx="50" cy="25" r="5" fill="white" />
      </svg>
      
      {showText && (
        <span className={cn('font-black tracking-tight leading-none', sizeClasses[size].text, textColors[variant])}>
          Wera<span className="text-primary-wera">Link</span>
        </span>
      )}
    </div>
  );
};
