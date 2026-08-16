import React from 'react';
import {
  Package,
  Users,
  Send,
  BookOpen,
  RefreshCw,
  LogOut,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import { ActiveTab, User } from '../types';
import { Button } from './common/Button';
import { BrandLogo } from './common/BrandLogo';

export interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDbConnected: boolean;
  dbInfo: { database: string; mongodb: string };
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onResetData: () => void;
  productsCount: number;
  employeesCount: number;
  unsettledDispatchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDbConnected,
  dbInfo,
  user,
  onOpenAuth,
  onLogout,
  onRefresh,
  onResetData,
  productsCount,
  employeesCount,
  unsettledDispatchCount,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'products', label: 'Products Stock', icon: <Package className="w-4 h-4" />, count: productsCount },
    { id: 'employees', label: 'Staff Directory', icon: <Users className="w-4 h-4" />, count: employeesCount },
    {
      id: 'dispatch',
      label: 'Dispatch & Return',
      icon: <Send className="w-4 h-4" />,
      count: unsettledDispatchCount > 0 ? unsettledDispatchCount : undefined,
    },
    { id: 'ledger', label: 'Financial Ledger', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-[#03132e] border-b border-blue-900/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <BrandLogo size="sm" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black text-white tracking-tight">
                  Ice Cream Store
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 hidden sm:block">
                Stock, Dispatch & Cash Reconciliation
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center space-x-1 p-1 bg-blue-950/80 rounded-xl border border-blue-900/60 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs transition-all select-none ${
                    isActive
                      ? 'bg-[#1e40af] text-white font-bold border-2 border-[#03132e] shadow-xs'
                      : 'text-blue-200/80 hover:text-white hover:bg-blue-900/50 font-medium'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-blue-300'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-[#03132e] text-white border border-blue-900' : 'bg-blue-900/80 text-blue-200'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls & User Chip */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onRefresh}
              title="Refresh MongoDB state"
              aria-label="Refresh database records"
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/60 border border-blue-800/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center space-x-2 bg-blue-900/40 border border-blue-800/60 pl-2.5 pr-1 py-1 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1e40af] text-white border border-[#03132e] flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-blue-200 leading-none">{user.phone}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign out of your account"
                  className="p-1.5 text-blue-300 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenAuth}
                leftIcon={<LogIn className="w-4 h-4" />}
                className="text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile thumb navigation) */}
      <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#03132e] border-t border-blue-900/50 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive ? 'text-white font-bold' : 'text-blue-300/70 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-[#1e40af] text-white border-2 border-[#03132e] shadow-xs' : 'text-blue-300/70'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label.split(' ')[0]}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold border border-[#03132e]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
