import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, EmergencyProfile } from '../types';
import { Shield, User, Heart, PhoneCall, Search, ArrowLeft, Filter, Calendar, Tag, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { isDarkMode, toggleTheme } = useTheme();
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

  if (loading) return <div className="flex items-center justify-center h-screen dark:bg-gray-950 dark:text-white">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 flex flex-col font-sans selection:bg-red-100 selection:text-red-600 transition-colors duration-300">
      <header className="bg-gray-900 dark:bg-gray-900 text-white px-6 h-20 flex items-center justify-between sticky top-0 z-50 shadow-2xl shadow-gray-900/20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-red-500/20 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">User Directory</h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{filteredUsers.length}</span>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Total Registered Profiles</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black transition-all uppercase tracking-widest shadow-xl shadow-gray-100 dark:shadow-none ${showFilters ? 'bg-gray-900 dark:bg-red-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 hover:border-red-200'}`}
            >
              <Filter className="w-4 h-4" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-8 py-4 pr-12 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-red-500/10 hover:border-red-200 transition-all shadow-xl shadow-gray-100 dark:shadow-none cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Last Updated</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 48 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 grid grid-cols-1 md:grid-cols-3 gap-10 shadow-xl shadow-gray-100 dark:shadow-none">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Blood Type Filter</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(t => (
                      <button
                        key={t}
                        onClick={() => setBloodFilter(t)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${bloodFilter === t ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none' : 'bg-gray-50 dark:bg-gray-800 border-gray-50 dark:border-gray-800 text-gray-400 hover:border-red-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Quick Search</label>
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase tracking-tight">Pro Tip: Use filters to quickly identify critical blood types during emergencies.</p>
                  </div>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:shadow-gray-100 dark:hover:shadow-none transition-all group"
              >
                <div className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors border border-gray-100 dark:border-gray-800 group-hover:border-red-100 dark:group-hover:border-red-900/30">
                      <User className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{u.fullName}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-sm font-bold text-gray-400">{u.email}</span>
                        <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" /> Updated {lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-100 dark:shadow-none">
                      <Heart className="w-5 h-5" /> 
                      <span className="text-lg font-black tracking-tighter">{ep?.bloodType || 'N/A'}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/emergency/${u.uid}`)}
                      className="px-8 py-4 bg-gray-900 dark:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
                
                {ep && (
                  <div className="px-10 py-8 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Allergies</span>
                      <div className="flex flex-wrap gap-2">
                        {ep.allergies.length > 0 ? ep.allergies.map((a, idx) => (
                          <span key={idx} className="text-[10px] px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight shadow-sm">{a}</span>
                        )) : <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">No allergies listed</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Medications</span>
                      <div className="flex flex-wrap gap-2">
                        {ep.medications.length > 0 ? ep.medications.map((m, idx) => (
                          <span key={idx} className="text-[10px] px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight shadow-sm">{m}</span>
                        )) : <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">No medications</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Primary Contact</span>
                      {ep.emergencyContacts[0] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                            <PhoneCall className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{ep.emergencyContacts[0].name}</div>
                            <div className="text-[10px] font-bold text-gray-400">{ep.emergencyContacts[0].phone}</div>
                          </div>
                        </div>
                      ) : <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">No contacts</span>}
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
