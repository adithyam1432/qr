import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile, EmergencyContact } from '../types';
import { Shield, ArrowLeft, Save, Plus, Trash2, Heart, User, PhoneCall, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();
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
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' }
  ]);

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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Edit Profile</span>
          </div>
        </div>
        <button 
          form="profile-form"
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <form id="profile-form" onSubmit={handleSave} className="space-y-8">
          
          {/* Personal Info */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700">Home Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Insurance Provider</label>
                <input 
                  type="text" 
                  value={insuranceProvider} 
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Policy Number</label>
                <input 
                  type="text" 
                  value={insurancePolicyNumber} 
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Medical Info */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" /> Medical Information
            </h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Blood Type</label>
                <select 
                  value={bloodType} 
                  onChange={(e) => setBloodType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Allergies</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newAllergy} 
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add an allergy..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => { if(newAllergy) { setAllergies([...allergies, newAllergy]); setNewAllergy(''); } }}
                    className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100 flex items-center gap-2">
                      {a} <button type="button" onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Medications</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMedication} 
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add a medication..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => { if(newMedication) { setMedications([...medications, newMedication]); setNewMedication(''); } }}
                    className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {medications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-700">{m}</span>
                      <button type="button" onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Medical History</label>
                <textarea 
                  value={medicalHistory} 
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="List any chronic conditions, surgeries, or other relevant info..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                />
              </div>
            </div>
          </section>

          {/* Emergency Contacts */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-red-600" /> Emergency Contacts
              </h2>
              <button 
                type="button" 
                onClick={addContact}
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            </div>
            <div className="space-y-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative">
                  {emergencyContacts.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeContact(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                      <input 
                        type="text" 
                        value={contact.name} 
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Relationship</label>
                      <input 
                        type="text" 
                        value={contact.relationship} 
                        onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                      <input 
                        type="tel" 
                        value={contact.phone} 
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
