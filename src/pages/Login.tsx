import { signInWithPopup, AuthError } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login failed:', authError.code, authError.message);
      
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('The login window was closed before completion. Please try again.');
      } else if (authError.code === 'auth/cancelled-by-user') {
        setError('Login was cancelled. Please try again.');
      } else {
        setError(`Login failed: ${authError.code}. Please ensure Google Login is enabled in your Firebase Console and the current domain is authorized.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MediQR</h1>
        <p className="text-gray-600 mb-8">Securely store your medical information and generate your emergency QR code.</p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-700 text-left"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
          )}
          {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400 uppercase tracking-widest text-xs font-bold">Secure Access</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Your medical data is encrypted and only accessible via your unique QR code or your secure login.
        </p>
      </motion.div>

      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Back to Home <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
