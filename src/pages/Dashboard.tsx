import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useAuth, useTheme } from '../App';
import { db, auth } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, QrCode, User, Heart, PhoneCall, LogOut, Edit3, Share2, Download, Settings, MapPin, Copy, Check, AlertCircle, X, FileText, Image as ImageIcon, Activity, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrSize, setQrSize] = useState(512);
  const [qrFormat, setQrFormat] = useState<'png' | 'svg'>('png');

  const calculateCompleteness = () => {
    if (!userProfile || !emergencyProfile) return 0;
    let score = 0;
    const total = 8;
    
    if (userProfile.fullName) score++;
    if (userProfile.phone) score++;
    if (userProfile.address) score++;
    if (userProfile.insuranceProvider) score++;
    if (emergencyProfile.bloodType && emergencyProfile.bloodType !== 'Unknown') score++;
    if (emergencyProfile.allergies.length > 0) score++;
    if (emergencyProfile.medications.length > 0) score++;
    if (emergencyProfile.emergencyContacts.length > 0) score++;
    
    return Math.round((score / total) * 100);
  };

  const completeness = calculateCompleteness();

  const handleCopyLink = () => {
    if (!emergencyUrl) return;
    navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (qrFormat === 'png') {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `MediQR-${user?.uid || 'profile'}.png`;
      link.href = url;
      link.click();
    } else {
      const svg = document.getElementById('qr-svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `MediQR-${user?.uid || 'profile'}.svg`;
      link.href = url;
      link.click();
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setUserProfile(doc.data() as UserProfile);
      setLoading(false);
    });

    const unsubEmergency = onSnapshot(doc(db, 'emergency_profiles', user.uid), (doc) => {
      if (doc.exists()) setEmergencyProfile(doc.data() as EmergencyProfile);
    });

    return () => {
      unsubUser();
      unsubEmergency();
    };
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const emergencyUrl = user?.uid ? `${window.location.origin}/emergency/${user.uid}` : '';

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col font-sans selection:bg-red-100 selection:text-red-600 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 h-20 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">MediQR</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {isAdmin && (
            <Link to="/admin" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all" title="Admin Panel">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-full h-full p-2 text-gray-400" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {completeness < 100 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-900/30 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-amber-100/20 dark:shadow-none relative overflow-hidden group transition-colors"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Complete Your Profile</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Your emergency profile is {completeness}% complete. Add missing info to help first responders.</p>
              </div>
            </div>
            <div className="w-full md:w-80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{completeness}%</span>
              </div>
              <div className="h-3 bg-amber-50 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-amber-100 dark:border-gray-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  className="h-full bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                />
              </div>
              <Link to="/profile" className="mt-4 text-xs font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center justify-end gap-1 group/link">
                Update Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Profile Completion Warning */}
        {!emergencyProfile && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">Complete Your Profile</h3>
                <p className="text-amber-700/80 dark:text-amber-300/80 font-medium">Your emergency QR code won't work until you provide your medical information.</p>
              </div>
            </div>
            <Link 
              to="/profile" 
              className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black hover:bg-amber-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-amber-100 dark:shadow-none"
            >
              Setup Profile Now
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: QR Code */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 text-center relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter uppercase">Your Emergency QR</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 inline-block mb-8 shadow-inner group cursor-pointer">
                {emergencyUrl ? (
                  <QRCodeSVG 
                    value={emergencyUrl} 
                    size={220} 
                    level="H"
                    includeMargin={true}
                    className="w-full h-full group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-400">
                    <Activity className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                This code links directly to your public emergency profile. 
                Keep it accessible on your phone or print it.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="w-full py-5 px-6 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-100 dark:shadow-none active:scale-95 uppercase tracking-widest text-sm"
                >
                  <Download className="w-5 h-5" /> Download QR Code
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-full py-5 px-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-sm border border-gray-100 dark:border-gray-700"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  {copied ? 'Copied!' : 'Copy Profile Link'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:border-gray-700">
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-lg">
                  Print it on a card, wear it as a bracelet, or set it as your lock screen. Responders scan it to see exactly what they need to know.
                </p>
                <div className="pt-4 flex justify-center">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                    <QRCodeSVG 
                      value={emergencyUrl} 
                      size={120} 
                      level="M"
                      className=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Profile Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 transition-colors">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Medical Profile</h2>
                <Link to="/profile" className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-sm font-black hover:bg-red-100 dark:hover:bg-red-900/30 transition-all uppercase tracking-widest">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Link>
              </div>

              {emergencyProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Blood Type</label>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl text-3xl font-black text-red-600 border border-red-100 dark:border-red-900/30 shadow-sm">
                        {emergencyProfile.bloodType}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Allergies</label>
                      <div className="flex flex-wrap gap-3">
                        {emergencyProfile.allergies.length > 0 ? (
                          emergencyProfile.allergies.map((a, i) => (
                            <span key={i} className="px-5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm font-black border border-gray-100 dark:border-gray-700 shadow-sm">
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 font-medium italic">None reported</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Current Medications</label>
                      <div className="space-y-3">
                        {emergencyProfile.medications.length > 0 ? (
                          emergencyProfile.medications.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                              <span className="text-gray-900 dark:text-white font-bold">{m}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 font-medium italic">None reported</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Emergency Contacts</label>
                      <div className="space-y-4">
                        {emergencyProfile.emergencyContacts.map((c, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:bg-white dark:hover:bg-gray-850 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all">
                            <div>
                              <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{c.name}</div>
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{c.relationship}</div>
                            </div>
                            <a href={`tel:${c.phone}`} className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm border border-gray-100 dark:border-gray-600">
                              <PhoneCall className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Medical History</label>
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                          {emergencyProfile.medicalHistory || <span className="text-gray-400 italic">No history provided</span>}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">First Aid & Emergency Care</label>
                      <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[24px] border border-red-100 dark:border-red-900/20">
                        <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">
                          {emergencyProfile.firstAidInstructions || <span className="text-gray-400 italic font-medium">No specific instructions provided</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-400 font-medium mb-8">Your emergency profile is incomplete.</p>
                  <Link to="/profile" className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all inline-flex items-center gap-3 shadow-xl shadow-red-100 dark:shadow-none uppercase tracking-widest text-sm">
                    Complete Profile Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 transition-colors">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Personal Information</h2>
                <Link to="/profile" className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">
                  <Settings className="w-6 h-6" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Full Name</label>
                      <div className="text-gray-900 dark:text-white font-black text-lg tracking-tight">{userProfile?.fullName || user?.displayName || 'Not set'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <PhoneCall className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Phone Number</label>
                      <div className="text-gray-900 dark:text-white font-black text-lg tracking-tight">{userProfile?.phone || <span className="text-gray-400 italic font-medium">Not provided</span>}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Insurance Details</label>
                      <div className="text-gray-900 dark:text-white font-black text-lg tracking-tight">
                        {userProfile?.insuranceProvider ? (
                          <>
                            <div className="text-gray-900 dark:text-white">{userProfile.insuranceProvider}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Policy: {userProfile.insurancePolicyNumber}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 italic font-medium">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Home Address</label>
                      <div className="text-gray-900 dark:text-white font-black text-lg tracking-tight leading-tight">
                        {userProfile?.address || <span className="text-gray-400 italic font-medium">Not provided</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Email:</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{userProfile?.email || user?.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors"
            >
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Download QR Code</h3>
                <button onClick={() => setShowQRModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-10 flex flex-col items-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-inner mb-10 group cursor-pointer">
                  {qrFormat === 'png' ? (
                    <QRCodeCanvas
                      id="qr-canvas"
                      value={emergencyUrl}
                      size={qrSize}
                      level="H"
                      includeMargin={true}
                      style={{ width: '240px', height: '240px' }}
                      className="group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <QRCodeSVG
                      id="qr-svg"
                      value={emergencyUrl}
                      size={qrSize}
                      level="H"
                      includeMargin={true}
                      style={{ width: '240px', height: '240px' }}
                      className="group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>

                <div className="w-full space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Format</label>
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                        <button 
                          onClick={() => setQrFormat('png')}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${qrFormat === 'png' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600' : 'text-gray-400'}`}
                        >
                          <ImageIcon className="w-4 h-4" /> PNG
                        </button>
                        <button 
                          onClick={() => setQrFormat('svg')}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${qrFormat === 'svg' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600' : 'text-gray-400'}`}
                        >
                          <FileText className="w-4 h-4" /> SVG
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Size</label>
                      <select 
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                        className="w-full py-4 px-5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 uppercase tracking-widest border-none"
                      >
                        <option value={256}>Small (256px)</option>
                        <option value={512}>Medium (512px)</option>
                        <option value={1024}>Large (1024px)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={downloadQR}
                    className="w-full py-6 bg-red-600 text-white rounded-[24px] font-black hover:bg-red-700 transition-all shadow-2xl shadow-red-100 dark:shadow-none flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-lg"
                  >
                    <Download className="w-6 h-6" /> Download {qrFormat.toUpperCase()}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
