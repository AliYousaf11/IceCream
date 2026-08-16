import React from 'react';
import { BrandLogo } from './BrandLogo';

export interface GlobalLoaderProps {
  message?: string;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  message = 'Loading Ice Cream Store...',
}) => {
  return (
    <div className="min-h-screen bg-[#070d1e] flex flex-col items-center justify-center text-white overflow-hidden relative">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] bg-gradient-to-tr from-amber-500/10 via-blue-900/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <BrandLogo size="xl" pulse />
        <h1 className="mt-5 text-xl font-extrabold tracking-tight">Ice Cream Store</h1>
        <p className="mt-1.5 text-sm text-blue-200/80">{message}</p>
        <div className="mt-5 w-40 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 animate-[loader-bar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
