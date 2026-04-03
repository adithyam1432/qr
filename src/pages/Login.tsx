import { signInWithPopup, AuthError, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { Shield, ArrowRight, AlertCircle, Loader2, Mail, Lock, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../App';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleProviderLogin = async (provider: any) => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login failed:', authError.code, authError.message);
      
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('The login window was closed before completion. Please try again.');
      } else if (authError.code === 'auth/network-request-failed') {
        setError('Network request failed. Please ensure Google/Email auth is enabled in your Firebase Console and your domain is allowlisted.');
      } else {
        setError(`Login failed: ${authError.code}. Please ensure this provider is enabled in your Firebase Console.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Email auth failed:', authError.code, authError.message);
      
      if (authError.code === 'auth/network-request-failed') {
        setError('Network request failed. Please ensure Email/Password auth is enabled in your Firebase Console.');
      } else if (authError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (authError.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(authError.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-10 text-center transition-colors"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-100 dark:shadow-none"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Welcome to MediQR</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">Your life-saving medical profile, accessible in seconds.</p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3 text-sm text-red-700 dark:text-red-400 text-left font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all font-medium text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all font-medium text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-gray-900 dark:bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 uppercase tracking-widest font-bold transition-colors">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={() => handleProviderLogin(googleProvider)}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            Continue with Google
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-red-600 font-black hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>

        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
          By continuing, you agree to our <Link to="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms</Link> & <Link to="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>. 
        </p>
      </motion.div>

      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
      >
        Back to Home <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
