import React, { useState } from 'react';
import { BRAND_CONFIG } from '../config/brand';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'stacked';
  whiteText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  whiteText = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const logoSrc =
    variant === 'horizontal' ? '/logo-horizontal.png' : BRAND_CONFIG.LOGO_PATH;

  // Responsive sizing based on size and variant
  const sizeStyles = {
    horizontal: {
      sm: 'h-8 sm:h-9 max-w-[160px] sm:max-w-[190px]',
      md: 'h-10 sm:h-11 max-w-[190px] sm:max-w-[220px]',
      lg: 'h-12 sm:h-14 max-w-[240px] sm:max-w-[280px]',
    },
    stacked: {
      sm: 'h-10 sm:h-12 max-w-[140px]',
      md: 'h-14 sm:h-16 max-w-[180px]',
      lg: 'h-20 sm:h-24 max-w-[240px]',
    },
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {!imgError ? (
        <img
          src={logoSrc}
          alt={`${BRAND_CONFIG.BRAND_NAME} - ${BRAND_CONFIG.TAGLINE}`}
          className={`${sizeStyles[variant][size]} w-auto object-contain transition-transform`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback: Text + Upward Arrow icon if image is missing */
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#14305E] text-white shadow-xs ring-1 ring-white/20">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F2A12B"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span
              className={`${textSizes[size]} font-extrabold ${
                whiteText ? 'text-white' : 'text-[#14305E]'
              }`}
            >
              Beyond<span className="text-[#1B7A9C]">Educations</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
