import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, Heart, PhoneCall, AlertTriangle, AlertCircle, Activity, User, Info, MapPin, Lock, ArrowLeft, Sun, Moon, LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme, useAuth } from '../App';

export default function EmergencyView() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;
      try {
        // Fetch emergency profile first (publicly readable)
        const emergencyDoc = await getDoc(doc(db, 'emergency_profiles', uid));
        
        if (emergencyDoc.exists()) {
          const data = emergencyDoc.data() as EmergencyProfile;
          if (data.isPublic === false) {
            setIsPrivate(true);
          } else {
            setEmergencyProfile(data);
            
            // Try to fetch full user profile (might fail if not owner/admin)
            try {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
              }
            } catch (userErr) {
              // Silently fail for user profile as it's restricted
              console.log('User profile restricted, using emergency profile data');
            }
          }
        } else {
          setError('Emergency profile not found. The user may not have completed their profile setup.');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `emergency_profiles/${uid}`);
        setError('Failed to load emergency information. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 dark:bg-red-900 flex flex-col items-center justify-center p-6 text-white text-center transition-colors">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold">Loading Emergency Profile...</h1>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <Lock className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Private Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">This user has restricted access to their emergency profile. Only authorized personnel can view this information.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gray-900 dark:bg-red-600 text-white rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>
      </div>
    );
  }

  if (error || !emergencyProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">{error || 'This QR code may be invalid or the profile has been removed.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* Emergency Header */}
      <header className="bg-red-600 dark:bg-red-900 text-white p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider leading-none">Emergency Info</h1>
              <p className="text-xs opacity-80 font-bold mt-1">CRITICAL MEDICAL DATA</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                title="Admin Dashboard"
              >
                <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {user?.uid === uid && (
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                title="Your Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="bg-white text-red-600 dark:text-red-900 px-3 py-1 rounded-full text-sm font-black">
              {emergencyProfile.bloodType}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4 pb-24">
        {/* Patient Name */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border-l-8 border-red-600 dark:border-red-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {userProfile?.fullName || emergencyProfile?.fullName || 'Unknown Patient'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Patient Profile</p>
            </div>
          </div>
        </motion.div>

        {/* Critical Alerts: Allergies */}
        {emergencyProfile.allergies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-900/30"
          >
            <h3 className="text-red-800 dark:text-red-400 font-black flex items-center gap-2 mb-4 text-lg">
              <AlertTriangle className="w-6 h-6" /> ALLERGIES
            </h3>
            <div className="flex flex-wrap gap-2">
              {emergencyProfile.allergies.map((a, i) => (
                <span key={i} className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl text-lg font-black shadow-sm">
                  {a.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Medications */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-gray-900 dark:text-white font-black flex items-center gap-2 mb-4 text-lg">
            <Activity className="w-6 h-6 text-red-600 dark:text-red-500" /> CURRENT MEDICATIONS
          </h3>
          <div className="space-y-3">
            {emergencyProfile.medications.length > 0 ? (
              emergencyProfile.medications.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold text-gray-800 dark:text-gray-200">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500"></div> {m}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">None reported</p>
            )}
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-gray-900 dark:text-white font-black flex items-center gap-2 mb-4 text-lg">
            <PhoneCall className="w-6 h-6 text-red-600 dark:text-red-500" /> EMERGENCY CONTACTS
          </h3>
          <div className="space-y-3">
            {emergencyProfile.emergencyContacts.map((c, i) => (
              <a 
                key={i} 
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 active:bg-red-100 dark:active:bg-red-900/40 transition-colors"
              >
                <div>
                  <div className="font-black text-red-900 dark:text-red-400 text-lg">{c.name}</div>
                  <div className="text-sm text-red-700 dark:text-red-500 font-bold uppercase tracking-wider">{c.relationship}</div>
                </div>
                <div className="w-12 h-12 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-none">
                  <PhoneCall className="w-6 h-6" />
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Medical History */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-gray-900 dark:text-white font-black flex items-center gap-2 mb-4 text-lg">
            <Info className="w-6 h-6 text-red-600 dark:text-red-500" /> MEDICAL HISTORY
          </h3>
          <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">
            {emergencyProfile.medicalHistory || 'No history provided.'}
          </p>
        </motion.div>

        {/* First Aid & Emergency Care */}
        {emergencyProfile.firstAidInstructions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30"
          >
            <h3 className="text-red-900 dark:text-red-400 font-black flex items-center gap-2 mb-4 text-lg uppercase">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" /> First Aid & Emergency Care
            </h3>
            <p className="text-red-800 dark:text-red-200 font-black leading-relaxed whitespace-pre-wrap text-lg">
              {emergencyProfile.firstAidInstructions}
            </p>
          </motion.div>
        )}

        {/* Insurance & Address */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Insurance
              </h4>
              <p className="font-bold text-gray-800 dark:text-gray-200">
                {userProfile?.insuranceProvider || emergencyProfile?.insuranceProvider ? `${userProfile?.insuranceProvider || emergencyProfile?.insuranceProvider}` : 'Not provided'}
              </p>
              {(userProfile?.insurancePolicyNumber || emergencyProfile?.insurancePolicyNumber) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Policy: {userProfile?.insurancePolicyNumber || emergencyProfile?.insurancePolicyNumber}</p>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Home Address
              </h4>
              <p className="font-bold text-gray-800 dark:text-gray-200 leading-tight">
                {userProfile?.address || emergencyProfile?.address || 'Not provided'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3 h-3" /> Secure MediQR System
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 px-8">
            This information is provided by the user for emergency use only. 
            MediQR is not responsible for the accuracy of the data.
          </p>
        </div>
      </main>

      {/* Quick Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-30 flex gap-3">
        <a 
          href={`tel:${emergencyProfile.emergencyContacts[0]?.phone}`}
          className="flex-1 py-4 bg-red-600 dark:bg-red-700 text-white rounded-2xl font-black text-center shadow-lg shadow-red-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-5 h-5" /> CALL PRIMARY CONTACT
        </a>
      </div>
    </div>
  );
}
