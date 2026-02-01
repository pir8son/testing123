
import React, { useState, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

interface LoginScreenProps {
  onLoginSuccess: (userId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (error) setError('');
  };

  const handleSendCode = () => {
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit number.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate API delay for SMS sending
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      console.log("Code sent: 1234"); 
      alert(`Your verification code is: 1234`); 
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
        value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code === '1234') {
      setIsLoading(true);
      setError('');

      try {
          // 1. Authenticate with Firebase (Satisfies "request.auth != null" in Security Rules)
          console.log("[Login] Acquiring security token...");
          await signInAnonymously(auth);
          console.log("[Login] Security token acquired.");

          // 2. Identify User Profile
          // We STRIP formatting to ensure the ID is always just digits (e.g., 9194206969)
          // This ensures consistency regardless of how the user typed it.
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          const userId = cleanPhone || `user_${Date.now()}`;
          
          console.log(`[Login] Loading profile for: ${userId}`);
          
          // Simulate network delay for UX
          setTimeout(() => {
            onLoginSuccess(userId);
          }, 500);

      } catch (e: any) {
          console.error("[Login] Authentication Error:", e.message);
          
          // Fallback: If Auth fails (e.g. config issue), allow access but warn.
          // Firestore writes may fail if rules are strict.
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          const userId = cleanPhone || `user_${Date.now()}`;
          onLoginSuccess(userId);
      }

    } else {
      setError('Invalid code. Try 1234');
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-green-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-overlay" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-violet-400/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-overlay" />

      {/* Header Navigation */}
      <div className="pt-8 px-6 z-10 h-20 flex items-center">
        {step === 'OTP' && (
            <button 
                onClick={() => { setStep('PHONE'); setError(''); setOtp(['','','','']); }}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
                <ArrowLeftIcon className="w-6 h-6 text-gray-800 dark:text-white group-hover:-translate-x-1 transition-transform" />
            </button>
        )}
      </div>

      <div className="flex-1 flex flex-col px-8 z-10 mt-4">
        {/* Branding */}
        <div className="mb-10 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none mb-6 rotate-3">
                <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 leading-tight">
                {step === 'PHONE' ? 'Welcome\nto Swipe to Recipe' : 'Verify\nyour account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                {step === 'PHONE' 
                    ? 'Enter your mobile number to get started.' 
                    : `We sent a code to ${phoneNumber}`
                }
            </p>
        </div>

        {step === 'PHONE' ? (
            <div className="space-y-8 animate-fade-in-up delay-100">
                <div className="relative group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Mobile Number</label>
                    <div className="flex items-center border-b-2 border-gray-200 dark:border-gray-700 group-focus-within:border-green-500 transition-colors pb-2">
                        <span className="text-3xl font-medium text-gray-400 mr-3 select-none">US +1</span>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="(000) 000-0000"
                            className="flex-1 bg-transparent text-3xl font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
                </div>

                <button 
                    onClick={handleSendCode}
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 dark:shadow-none"
                >
                    {isLoading ? 'Sending Code...' : 'Continue'}
                </button>
            </div>
        ) : (
            <div className="space-y-8 animate-fade-in-up delay-100">
                <div className="flex gap-4 justify-between">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={otpRefs[index]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-16 h-20 text-center text-4xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 rounded-2xl focus:outline-none text-gray-900 dark:text-white transition-all caret-green-500 shadow-inner"
                        />
                    ))}
                </div>
                
                {error && <p className="text-center text-red-500 font-bold bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>}

                <div className="space-y-4">
                    <button 
                        onClick={handleVerify}
                        disabled={isLoading || otp.join('').length !== 4}
                        className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-2xl hover:bg-green-700 hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-200 dark:shadow-none"
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                    
                    <button 
                        onClick={handleSendCode}
                        className="w-full text-gray-500 dark:text-gray-400 font-semibold text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
      `}</style>
    </div>
  );
};
