import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, User, Heart, PhoneCall, Search, ArrowLeft, Filter, Calendar, Tag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [emergencyProfiles, setEmergencyProfiles] = useState<Record<string, EmergencyProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const emergencySnapshot = await getDocs(collection(db, 'emergency_profiles'));
        
        const usersData = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
        const emergencyData: Record<string, EmergencyProfile> = {};
        emergencySnapshot.docs.forEach(doc => {
          emergencyData[doc.id] = doc.data() as EmergencyProfile;
        });

        setUsers(usersData);
        setEmergencyProfiles(emergencyData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin/all_data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlood = bloodFilter === 'All' || emergencyProfiles[u.uid]?.bloodType === bloodFilter;
    return matchesSearch && matchesBlood;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
    const dateA = a.updatedAt?.seconds || 0;
    const dateB = b.updatedAt?.seconds || 0;
    return dateB - dateA;
  });

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold tracking-tight">Admin Control Panel</span>
          </div>
        </div>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registered Users</h2>
            <p className="text-gray-500 text-sm">Managing {filteredUsers.length} profiles</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Last Updated</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Blood Type</label>
                  <select 
                    value={bloodFilter}
                    onChange={(e) => setBloodFilter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
                  >
                    <option value="All">All Blood Types</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Search (Mobile)</label>
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none md:hidden"
                  />
                  <p className="text-xs text-gray-400 mt-2 hidden md:block italic">Advanced filtering options will appear here as the system grows.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6">
          {filteredUsers.map((u, i) => {
            const ep = emergencyProfiles[u.uid];
            const lastUpdated = u.updatedAt?.seconds ? new Date(u.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A';
            
            return (
              <motion.div 
                key={u.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{u.fullName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{u.email}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-100">
                      <Heart className="w-4 h-4" /> {ep?.bloodType || 'N/A'}
                    </div>
                    <button 
                      onClick={() => navigate(`/emergency/${u.uid}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Public Profile
                    </button>
                  </div>
                </div>
                
                {ep && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Allergies</span>
                      <div className="flex flex-wrap gap-1">
                        {ep.allergies.length > 0 ? ep.allergies.map((a, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{a}</span>
                        )) : <span className="text-[10px] text-gray-400 italic">None</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Medications</span>
                      <div className="flex flex-wrap gap-1">
                        {ep.medications.length > 0 ? ep.medications.map((m, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{m}</span>
                        )) : <span className="text-[10px] text-gray-400 italic">None</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Primary Contact</span>
                      {ep.emergencyContacts[0] ? (
                        <div className="text-[10px] text-gray-600 font-medium">
                          {ep.emergencyContacts[0].name} ({ep.emergencyContacts[0].phone})
                        </div>
                      ) : <span className="text-[10px] text-gray-400 italic">None</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
