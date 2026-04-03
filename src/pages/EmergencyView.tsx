import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, Heart, PhoneCall, AlertTriangle, Activity, User, Info, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function EmergencyView() {
  const { uid } = useParams<{ uid: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        const emergencyDoc = await getDoc(doc(db, 'emergency_profiles', uid));
        
        if (userDoc.exists()) setUserProfile(userDoc.data() as UserProfile);
        if (emergencyDoc.exists()) {
          setEmergencyProfile(emergencyDoc.data() as EmergencyProfile);
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
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold">Loading Emergency Profile...</h1>
      </div>
    );
  }

  if (error || !emergencyProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-600">{error || 'This QR code may be invalid or the profile has been removed.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Emergency Header */}
      <header className="bg-red-600 text-white p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider leading-none">Emergency Info</h1>
              <p className="text-xs opacity-80 font-bold mt-1">CRITICAL MEDICAL DATA</p>
            </div>
          </div>
          <div className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-black">
            {emergencyProfile.bloodType}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4 pb-24">
        {/* Patient Name */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-600"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{userProfile?.fullName || 'Unknown Patient'}</h2>
              <p className="text-gray-500 font-medium">Patient Profile</p>
            </div>
          </div>
        </motion.div>

        {/* Critical Alerts: Allergies */}
        {emergencyProfile.allergies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 p-6 rounded-2xl border-2 border-red-200"
          >
            <h3 className="text-red-800 font-black flex items-center gap-2 mb-4 text-lg">
              <AlertTriangle className="w-6 h-6" /> ALLERGIES
            </h3>
            <div className="flex flex-wrap gap-2">
              {emergencyProfile.allergies.map((a, i) => (
                <span key={i} className="px-4 py-2 bg-red-600 text-white rounded-xl text-lg font-black shadow-sm">
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
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-gray-900 font-black flex items-center gap-2 mb-4 text-lg">
            <Activity className="w-6 h-6 text-red-600" /> CURRENT MEDICATIONS
          </h3>
          <div className="space-y-3">
            {emergencyProfile.medications.length > 0 ? (
              emergencyProfile.medications.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-bold text-gray-800">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div> {m}
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
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-gray-900 font-black flex items-center gap-2 mb-4 text-lg">
            <PhoneCall className="w-6 h-6 text-red-600" /> EMERGENCY CONTACTS
          </h3>
          <div className="space-y-3">
            {emergencyProfile.emergencyContacts.map((c, i) => (
              <a 
                key={i} 
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 active:bg-red-100 transition-colors"
              >
                <div>
                  <div className="font-black text-red-900 text-lg">{c.name}</div>
                  <div className="text-sm text-red-700 font-bold uppercase tracking-wider">{c.relationship}</div>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200">
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
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-gray-900 font-black flex items-center gap-2 mb-4 text-lg">
            <Info className="w-6 h-6 text-red-600" /> MEDICAL HISTORY
          </h3>
          <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
            {emergencyProfile.medicalHistory || 'No history provided.'}
          </p>
        </motion.div>

        {/* Insurance & Address */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Insurance
              </h4>
              <p className="font-bold text-gray-800">
                {userProfile?.insuranceProvider ? `${userProfile.insuranceProvider}` : 'Not provided'}
              </p>
              {userProfile?.insurancePolicyNumber && (
                <p className="text-sm text-gray-500 font-medium">Policy: {userProfile.insurancePolicyNumber}</p>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Home Address
              </h4>
              <p className="font-bold text-gray-800 leading-tight">
                {userProfile?.address || 'Not provided'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-gray-500 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3 h-3" /> Secure MediQR System
          </div>
          <p className="text-[10px] text-gray-400 mt-4 px-8">
            This information is provided by the user for emergency use only. 
            MediQR is not responsible for the accuracy of the data.
          </p>
        </div>
      </main>

      {/* Quick Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30 flex gap-3">
        <a 
          href={`tel:${emergencyProfile.emergencyContacts[0]?.phone}`}
          className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-center shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-5 h-5" /> CALL PRIMARY CONTACT
        </a>
      </div>
    </div>
  );
}
