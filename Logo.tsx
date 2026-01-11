
import React from 'react';

export const CarbonSenseLogo: React.FC<{ className?: string; size?: number; showText?: boolean }> = ({ 
  className = "", 
  size = 32,
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-900"
      >
        <path 
          d="M50 85C50 85 45 70 40 60C35 50 25 45 25 45C25 45 35 40 40 30C45 20 50 10 50 10C50 10 55 20 60 30C65 40 75 45 75 45C75 45 65 50 60 60C55 70 50 85 50 85Z" 
          fill="currentColor" 
        />
        <path 
          d="M35 55C35 55 28 52 20 55C12 58 5 65 5 65C5 65 12 60 20 58C28 56 35 58 35 58" 
          fill="currentColor" 
          opacity="0.8"
        />
        <path 
          d="M65 55C65 55 72 52 80 55C88 58 95 65 95 65C95 65 88 60 80 58C72 56 65 58 65 58" 
          fill="currentColor" 
          opacity="0.8"
        />
        <circle cx="50" cy="45" r="8" fill="white" />
        <circle cx="50" cy="45" r="5" fill="currentColor" />
      </svg>
      {showText && (
        <span className="text-xl font-black tracking-widest text-emerald-900 uppercase">
          CarbonSense
        </span>
      )}
    </div>
  );
};
