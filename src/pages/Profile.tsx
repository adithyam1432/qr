import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useTheme } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile, EmergencyContact } from '../types';
import { Shield, ArrowLeft, Save, Plus, Trash2, Heart, User, PhoneCall, Activity, Globe, Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  const [bloodType, setBloodType] = useState<EmergencyProfile['bloodType']>('Unknown');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [firstAidInstructions, setFirstAidInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' }
  ]);

  const calculateCompleteness = () => {
    let score = 0;
    const total = 8;
    if (fullName) score++;
    if (phone) score++;
    if (address) score++;
    if (insuranceProvider) score++;
    if (bloodType && bloodType !== 'Unknown') score++;
    if (allergies.length > 0) score++;
    if (medications.length > 0) score++;
    if (emergencyContacts.some(c => c.name && c.phone)) score++;
    return Math.round((score / total) * 100);
  };

  const getMissingFields = () => {
    const missing = [];
    if (!fullName) missing.push({ id: 'personal-info', label: 'Full Name', importance: 'Critical for identification' });
    if (!phone) missing.push({ id: 'personal-info', label: 'Phone Number', importance: 'Primary contact method' });
    if (!address) missing.push({ id: 'personal-info', label: 'Home Address', importance: 'Needed for emergency services' });
    if (!insuranceProvider) missing.push({ id: 'personal-info', label: 'Insurance Details', importance: 'Speeds up hospital admission' });
    if (!bloodType || bloodType === 'Unknown') missing.push({ id: 'medical-info', label: 'Blood Type', importance: 'Vital for transfusions' });
    if (allergies.length === 0) missing.push({ id: 'medical-info', label: 'Allergies', importance: 'Prevents dangerous reactions' });
    if (medications.length === 0) missing.push({ id: 'medical-info', label: 'Medications', importance: 'Avoids drug interactions' });
    if (!emergencyContacts.some(c => c.name && c.phone)) missing.push({ id: 'emergency-contacts', label: 'Emergency Contacts', importance: 'Who to call first' });
    return missing;
  };

  const completeness = calculateCompleteness();
  const missingFields = getMissingFields();
  const isFieldMissing = (label: string) => missingFields.some(f => f.label === label);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const emergencyDoc = await getDoc(doc(db, 'emergency_profiles', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setInsuranceProvider(data.insuranceProvider || '');
          setInsurancePolicyNumber(data.insurancePolicyNumber || '');
        } else {
          setFullName(user.displayName || '');
        }

        if (emergencyDoc.exists()) {
          const data = emergencyDoc.data() as EmergencyProfile;
          setBloodType(data.bloodType || 'Unknown');
          setAllergies(data.allergies || []);
          setMedications(data.medications || []);
          setMedicalHistory(data.medicalHistory || '');
          setFirstAidInstructions(data.firstAidInstructions || '');
          setIsPublic(data.isPublic !== false);
          setEmergencyContacts(data.emergencyContacts || [{ name: '', relationship: '', phone: '' }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      const emergencyRef = doc(db, 'emergency_profiles', user.uid);

      const userProfileData = {
        uid: user.uid,
        fullName,
        email: user.email || '',
        phone,
        address,
        insuranceProvider,
        insurancePolicyNumber,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // Firestore rules handle if it already exists
      };

      const emergencyProfileData = {
        uid: user.uid,
        bloodType,
        allergies,
        medications,
        medicalHistory,
        firstAidInstructions,
        isPublic,
        emergencyContacts: emergencyContacts.filter(c => c.name && c.phone),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, userProfileData, { merge: true });
      await setDoc(emergencyRef, emergencyProfileData, { merge: true });

      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/emergency_profiles');
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }]);
  const removeContact = (index: number) => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...emergencyContacts];
    newContacts[index][field] = value;
    setEmergencyContacts(newContacts);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f8f9fa] dark:bg-gray-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col font-sans selection:bg-red-100 selection:text-red-600 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 h-20 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">Edit Profile</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            form="profile-form"
            disabled={saving}
            className="px-8 py-3 bg-gray-900 dark:bg-red-600 text-white rounded-2xl font-black hover:bg-black dark:hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-gray-200 dark:shadow-none active:scale-95 uppercase tracking-widest text-sm"
          >
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Profile Setup</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Complete your medical profile to ensure best care.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-600 tracking-tighter">{completeness}%</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Complete</div>
            </div>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1 border border-gray-200 dark:border-gray-700">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${completeness === 100 ? 'bg-green-500' : 'bg-red-600'}`}
            />
          </div>
          
          {completeness < 100 && (
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Improve Your Profile</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missingFields.map((field, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(field.id);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="flex flex-col items-start p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all text-left group"
                  >
                    <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors uppercase tracking-tight">{field.label}</span>
                    <span className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{field.importance}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <motion.form 
          id="profile-form" 
          onSubmit={handleSave} 
          className="space-y-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          
          <motion.section 
            id="personal-info"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-900/30">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Full Name
                  {isFieldMissing('Full Name') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Required</span>}
                </label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white ${isFieldMissing('Full Name') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Phone Number
                  {isFieldMissing('Phone Number') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Missing</span>}
                </label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white ${isFieldMissing('Phone Number') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Home Address
                  {isFieldMissing('Home Address') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Missing</span>}
                </label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white min-h-[120px] resize-none ${isFieldMissing('Home Address') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Insurance Provider
                  {isFieldMissing('Insurance Details') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Missing</span>}
                </label>
                <input 
                  type="text" 
                  value={insuranceProvider} 
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white ${isFieldMissing('Insurance Details') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Policy Number</label>
                <input 
                  type="text" 
                  value={insurancePolicyNumber} 
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </motion.section>

          <motion.section 
            id="medical-info"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 dark:border-red-900/30">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Medical Information</h2>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Blood Type
                  {isFieldMissing('Blood Type') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Critical</span>}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBloodType(t as any)}
                      className={`py-4 rounded-2xl text-sm font-black transition-all uppercase tracking-widest border-2 ${bloodType === t ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100 scale-105' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-red-200 dark:hover:border-red-900/50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Allergies
                  {isFieldMissing('Allergies') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Missing</span>}
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newAllergy} 
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add an allergy..."
                    className={`flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white ${isFieldMissing('Allergies') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => { if(newAllergy) { setAllergies([...allergies, newAllergy]); setNewAllergy(''); } }}
                    className="w-14 h-14 bg-gray-900 dark:bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-black dark:hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allergies.map((a, i) => (
                    <span key={i} className="px-5 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-sm font-black border border-red-100 dark:border-red-900/30 flex items-center gap-3 shadow-sm">
                      {a} 
                      <button type="button" onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))} className="hover:scale-125 transition-transform">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  Medications
                  {isFieldMissing('Medications') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Missing</span>}
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMedication} 
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add a medication..."
                    className={`flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white ${isFieldMissing('Medications') ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-700'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => { if(newMedication) { setMedications([...medications, newMedication]); setNewMedication(''); } }}
                    className="w-14 h-14 bg-gray-900 dark:bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-black dark:hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {medications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all">
                      <span className="text-gray-900 dark:text-white font-bold">{m}</span>
                      <button type="button" onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Medical History</label>
                <textarea 
                  value={medicalHistory} 
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="List any chronic conditions, surgeries, or other relevant info..."
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">First Aid & Emergency Medication</label>
                <textarea 
                  value={firstAidInstructions} 
                  onChange={(e) => setFirstAidInstructions(e.target.value)}
                  placeholder="Instructions for emergency tablets, first aid treatment, or immediate care steps..."
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900 dark:text-white min-h-[120px] resize-none"
                />
              </div>
            </div>
          </motion.section>

          <motion.section 
            id="emergency-contacts"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-10 transition-colors"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 dark:border-purple-900/30">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                  Emergency Contacts
                  {isFieldMissing('Emergency Contacts') && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Critical</span>}
                </h2>
              </div>
              <button 
                type="button" 
                onClick={addContact}
                className="px-6 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl text-xs font-black hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all uppercase tracking-widest flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            </div>
            <div className="space-y-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 relative group hover:bg-white dark:hover:bg-gray-900 hover:shadow-2xl hover:shadow-gray-100 dark:hover:shadow-none transition-all">
                  {emergencyContacts.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeContact(index)}
                      className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</label>
                      <input 
                        type="text" 
                        value={contact.name} 
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="w-full px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Relationship</label>
                      <input 
                        type="text" 
                        value={contact.relationship} 
                        onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                        className="w-full px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone</label>
                      <input 
                        type="tel" 
                        value={contact.phone} 
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="w-full px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </motion.form>
      </main>
    </div>
  );
}
