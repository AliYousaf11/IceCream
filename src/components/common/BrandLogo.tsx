import React from 'react';
import { IceCream } from 'lucide-react';

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<BrandLogoSize, { box: string; icon: string; radius: string }> = {
  sm: { box: 'w-10 h-10', icon: 'w-5 h-5', radius: 'rounded-xl' },
  md: { box: 'w-12 h-12', icon: 'w-6 h-6', radius: 'rounded-2xl' },
  lg: { box: 'w-14 h-14', icon: 'w-7 h-7', radius: 'rounded-2xl' },
  xl: { box: 'w-16 h-16', icon: 'w-8 h-8', radius: 'rounded-2xl' },
};

export interface BrandLogoProps {
  size?: BrandLogoSize;
  pulse?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const { box, icon, radius } = sizeMap[size];

  return (
    <div
      className={`${box} ${radius} bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-[1.5px] shadow-xl shadow-blue-950/40 shrink-0 ${className}`}
    >
      <div className={`w-full h-full bg-[#0b142b] ${radius} flex items-center justify-center`}>
        <IceCream className={`${icon} text-amber-300 ${pulse ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
};
