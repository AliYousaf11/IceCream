import React, { useState } from 'react';
import { Phone, Lock, User as UserIcon, ShieldCheck, ArrowRight, Eye, EyeOff, IceCream, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (data: { phone: string; password: string }) => Promise<any>;
  onSignUp: (data: { name: string; phone: string; password: string }) => Promise<any>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
}) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'signin') {
        if (!phone.trim() || !password.trim()) {
          setErrorMessage('Please enter your mobile phone number and password');
          setIsLoading(false);
          return;
        }
        await onSignIn({ phone: phone.trim(), password: password.trim() });
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name');
          setIsLoading(false);
          return;
        }
        if (!phone.trim()) {
          setErrorMessage('Please enter your mobile phone number');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }
        await onSignUp({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        });
      }
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={true}
    >
      <div className="text-center mb-6">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-[1.5px] shadow-lg mx-auto mb-3">
          <div className="w-full h-full bg-[#0b142b] rounded-2xl flex items-center justify-center">
            <IceCream className="w-6 h-6 text-amber-300" />
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {tab === 'signin' ? 'Sign In to Ice Cream Store' : 'Create Store Account'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {tab === 'signin'
            ? 'Enter your registered mobile number and password'
            : 'Register a new profile to manage stock & staff'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-xl mb-5 border border-slate-200/60">
        <button
          type="button"
          onClick={() => {
            setTab('signin');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'signin'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('signup');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'signup'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'signup' && (
          <div>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Muhammad Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
            />
          </div>
        )}

        <div>
          <Input
            label="Mobile Phone Number"
            required
            type="tel"
            placeholder="03001234567 or +923001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            helperText="Used as your unique sign-in identifier"
          />
        </div>

        <div>
          <Input
            label="Password"
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-700 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-3 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white font-bold py-3 shadow-md"
        >
          {tab === 'signin' ? 'Sign In with Mobile' : 'Register & Enter'}
        </Button>
      </form>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Secure Mobile Session</span>
      </div>
    </Modal>
  );
};
