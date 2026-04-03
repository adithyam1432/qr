import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../App';
import { db, auth } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, QrCode, User, Heart, PhoneCall, LogOut, Edit3, Share2, Download, Settings, MapPin, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!emergencyUrl) return;
    navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const emergencyDoc = await getDoc(doc(db, 'emergency_profiles', user.uid));
        
        if (userDoc.exists()) setUserProfile(userDoc.data() as UserProfile);
        if (emergencyDoc.exists()) setEmergencyProfile(emergencyDoc.data() as EmergencyProfile);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const emergencyUrl = user?.uid ? `${window.location.origin}/emergency/${user.uid}` : '';

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-red-600" />
          <span className="text-xl font-bold tracking-tight text-gray-900">MediQR</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Admin Panel">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-full h-full p-1 text-gray-400" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: QR Code */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Emergency QR</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 inline-block mb-6 shadow-inner">
              {emergencyUrl ? (
                <QRCodeSVG 
                  value={emergencyUrl} 
                  size={200} 
                  level="H"
                  includeMargin={true}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                  Generating...
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-8">
              This code links directly to your public emergency profile. 
              Keep it accessible on your phone or print it.
            </p>
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download QR Code
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Profile Link'}
              </button>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
            <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Pro Tip
            </h3>
            <p className="text-sm text-red-700 leading-relaxed">
              Set your QR code as your phone's lock screen wallpaper so first responders can scan it without unlocking your device.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Profile Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Medical Profile</h2>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            {emergencyProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Type</label>
                    <div className="mt-1 text-2xl font-bold text-red-600">{emergencyProfile.bloodType}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Allergies</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {emergencyProfile.allergies.length > 0 ? (
                        emergencyProfile.allergies.map((a, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">None reported</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Medications</label>
                    <div className="mt-1 space-y-2">
                      {emergencyProfile.medications.length > 0 ? (
                        emergencyProfile.medications.map((m, i) => (
                          <div key={i} className="text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> {m}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">None reported</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emergency Contacts</label>
                    <div className="mt-2 space-y-4">
                      {emergencyProfile.emergencyContacts.map((c, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.relationship}</div>
                          </div>
                          <a href={`tel:${c.phone}`} className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-red-600 transition-colors">
                            <PhoneCall className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medical History</label>
                    <p className="mt-1 text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {emergencyProfile.medicalHistory || <span className="text-gray-400 italic">No history provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 mb-6">Your emergency profile is incomplete.</p>
                <Link to="/profile" className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2">
                  Complete Profile Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              <Link to="/profile" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                    <div className="text-gray-900 font-bold">{userProfile?.fullName || user?.displayName || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    <PhoneCall className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                    <div className="text-gray-900 font-bold">{userProfile?.phone || <span className="text-gray-400 italic font-normal">Not provided</span>}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    <Shield className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Insurance Details</label>
                    <div className="text-gray-900 font-bold">
                      {userProfile?.insuranceProvider ? (
                        <>
                          <div className="text-gray-900">{userProfile.insuranceProvider}</div>
                          <div className="text-xs text-gray-500 font-medium">Policy: {userProfile.insurancePolicyNumber}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic font-normal">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Home Address</label>
                    <div className="text-gray-900 font-bold leading-tight">
                      {userProfile?.address || <span className="text-gray-400 italic font-normal">Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Account Email: <span className="font-bold text-gray-700">{userProfile?.email || user?.email}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
