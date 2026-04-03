import { Link } from 'react-router-dom';
import { Shield, QrCode, Heart, PhoneCall, ArrowRight, Activity, Lock, Smartphone, CheckCircle2, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../App';

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 font-sans selection:bg-red-100 selection:text-red-600 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">MediQR</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">How it works</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              Login
            </Link>
            <Link to="/login" className="px-6 py-3 text-sm font-black text-white bg-gray-900 dark:bg-red-600 rounded-2xl hover:bg-black dark:hover:bg-red-700 transition-all shadow-xl shadow-gray-200 dark:shadow-none active:scale-95 uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-red-50 dark:bg-red-900/10 rounded-full blur-[120px] opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[100px] opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                <Activity className="w-4 h-4" /> Emergency Preparedness
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9] mb-8">
                Instant Info. <br />
                <span className="text-red-600 italic">Saves Lives.</span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-lg mb-12 leading-relaxed">
                A secure digital medical profile linked to a unique QR code. 
                Empower first responders with critical data when every second counts.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-10 py-5 text-lg font-black text-white bg-red-600 rounded-[24px] hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-200 dark:shadow-none active:scale-95 uppercase tracking-widest"
                >
                  Create Profile <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400">
                    +2K
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-900 p-4 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-[32px] overflow-hidden p-8">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Emergency Profile</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Access</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      O+ Positive
                    </div>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm" />
                      <div className="h-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm" />
                      <div className="h-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm" />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 group cursor-pointer">
                      <QrCode className="w-32 h-32 text-gray-900 dark:text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 hidden md:block"
              >
                <Heart className="w-8 h-8 text-red-600 mb-2" />
                <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Allergies</div>
                <div className="text-[10px] text-gray-400 font-bold">Penicillin, Peanuts</div>
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 hidden md:block"
              >
                <PhoneCall className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Contact</div>
                <div className="text-[10px] text-gray-400 font-bold">+1 (555) 000-0000</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">Built for the <span className="text-red-600">Critical Moment.</span></h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Designed for speed, security, and reliability when it matters most.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-10 h-10 text-red-600" />,
                title: "Instant Scan",
                desc: "No apps or logins required for first responders. One scan reveals everything.",
                color: "bg-red-50 dark:bg-red-900/20"
              },
              {
                icon: <Lock className="w-10 h-10 text-blue-600" />,
                title: "Secure Storage",
                desc: "Your data is encrypted and you control exactly what is visible to others.",
                color: "bg-blue-50 dark:bg-blue-900/20"
              },
              {
                icon: <Smartphone className="w-10 h-10 text-purple-600" />,
                title: "Always Ready",
                desc: "Set as lock screen, print on a card, or wear it. Your info travels with you.",
                color: "bg-purple-50 dark:bg-purple-900/20"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-[#fbfbfb] dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all group"
              >
                <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-6 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 leading-none">Three Steps to <br /><span className="text-red-500">Peace of Mind.</span></h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Create Profile", desc: "Fill in your medical history, allergies, and emergency contacts in minutes." },
                  { step: "02", title: "Generate QR", desc: "Get your unique QR code instantly. Download it in high resolution for any use." },
                  { step: "03", title: "Stay Safe", desc: "Keep it on you. In an emergency, responders scan it to provide better care." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8">
                    <div className="text-4xl font-black text-red-500 tracking-tighter opacity-50">{item.step}</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-600 to-red-900 rounded-[60px] p-12 flex items-center justify-center shadow-2xl shadow-red-900/50 rotate-3">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl">
                  <QrCode className="w-48 h-48 text-gray-900" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[40px] shadow-2xl rotate-12 hidden md:block">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-5xl mx-auto bg-red-600 rounded-[60px] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-red-200 dark:shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-none">Ready to secure <br />your future?</h2>
            <p className="text-xl text-red-100 font-medium mb-12 max-w-xl mx-auto">Join thousands of people who trust MediQR for their emergency safety.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 px-12 py-6 bg-white text-red-600 rounded-[32px] font-black text-xl hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
            >
              Get Started Now <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">MediQR</span>
            </Link>
            <div className="flex items-center gap-12">
              <Link to="/privacy" className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
              <Link to="/terms" className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
              <a href="mailto:support@mediqr.com" className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Support</a>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-50 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 MediQR System. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Lock className="w-3 h-3" /> Securely Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
