import React, { useState } from 'react';
import {
  Phone,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Package,
  Truck,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';

export interface AuthScreenProps {
  onSignIn: (data: { phone: string; password: string }) => Promise<any>;
  onSignUp: (data: { name: string; phone: string; password: string }) => Promise<any>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setPassword('');
    setErrorMessage(null);
  };

  const handleTabChange = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(false);

    try {
      if (tab === 'signin') {
        if (!phone.trim() || !password.trim()) {
          setErrorMessage('Please enter your mobile phone number and password');
          return;
        }
        setIsLoading(true);
        await onSignIn({ phone: phone.trim(), password: password.trim() });
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name');
          return;
        }
        if (!phone.trim()) {
          setErrorMessage('Please enter your mobile phone number');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long');
          return;
        }
        setIsLoading(true);
        await onSignUp({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070d1e] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Mesh & Radial Gradient Ambient Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-gradient-to-bl from-amber-500/15 via-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] bg-gradient-to-tr from-cyan-600/20 via-blue-900/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Modern Grid Matrix Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Premium Brand & Value Showcase (Desktop/Tablet) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Brand Title & Hero Typography */}
            <div>
              <div className="flex items-center justify-center lg:justify-start space-x-3.5 mb-3">
                <BrandLogo size="lg" pulse />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
                    Ice Cream Store
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-blue-300/80 mt-1">
                    Distribution & Cash Reconciliation ERP
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                A unified operating portal for managing ice cream stock, staff rider dispatches, daily returns, and automated shortage recovery ledgers.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xs hover:border-blue-500/30 transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2.5 group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-slate-200">Stock Inventory</h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Real-time stock alerts & item tracking
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xs hover:border-indigo-500/30 transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2.5 group-hover:scale-110 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-slate-200">Rider Dispatch</h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Seamless daily assignment & returns
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xs hover:border-amber-500/30 transition-all text-left group">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-slate-200">Zero Shortage</h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Automated financial balance ledger
                </p>
              </div>
            </div>

            {/* Bottom Trust Indicators */}
            <div className="hidden lg:flex items-center space-x-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Single Role System</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mobile Number Auth</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cloud Persistence</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Glassmorphic Auth Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-[1.5px] shadow-2xl backdrop-blur-2xl"
            >
              <div className="relative rounded-[22px] bg-[#0c152e]/90 p-6 sm:p-8 backdrop-blur-xl border border-white/10 shadow-inner">
                {/* Mode Selector Tabs */}
                <div className="relative flex p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
                  <button
                    type="button"
                    id="tab-signin"
                    onClick={() => handleTabChange('signin')}
                    className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 rounded-xl ${
                      tab === 'signin'
                        ? 'text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'signin' && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-blue-600/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Sign In
                  </button>

                  <button
                    type="button"
                    id="tab-signup"
                    onClick={() => handleTabChange('signup')}
                    className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 rounded-xl ${
                      tab === 'signup'
                        ? 'text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'signup' && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-blue-600/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    Create Account
                  </button>
                </div>

                {/* Subtitle Message */}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {tab === 'signin' ? 'Welcome back' : 'Create an Account'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tab === 'signin'
                      ? 'Sign in with your registered phone number to continue'
                      : 'Join the Ice Cream Store operating dashboard in seconds'}
                  </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start space-x-2.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span className="leading-snug">{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {tab === 'signup' && (
                    <div>
                      <label
                        htmlFor="auth-name"
                        className="block text-xs font-semibold text-slate-300 mb-1.5"
                      >
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-name"
                          type="text"
                          placeholder="e.g. Muhammad Ali"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="auth-phone"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Mobile Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-phone"
                        type="tel"
                        placeholder="03001234567 or +923001234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Used as your unique sign-in ID
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="auth-password"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Password <span className="text-rose-400">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={tab === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {tab === 'signup' && (
                      <div className="flex items-center space-x-1.5 mt-1.5">
                        <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              password.length === 0
                                ? 'w-0'
                                : password.length < 6
                                ? 'w-1/3 bg-rose-500'
                                : password.length < 8
                                ? 'w-2/3 bg-amber-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {password.length < 6 ? 'Min 6 chars' : 'Good'}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    id="auth-submit-btn"
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 mt-4 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border-0 rounded-xl transition-all active:scale-[0.99]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {tab === 'signin' ? 'Sign In to Store' : 'Create Account & Enter'}
                  </Button>
                </form>

                {/* Footer Security Guarantee */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-Bit Encrypted · Dedicated MongoDB Cloud</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

