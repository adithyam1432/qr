import { Link } from 'react-router-dom';
import { Shield, QrCode, Heart, PhoneCall, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-red-600" />
          <span className="text-xl font-bold tracking-tight text-gray-900">MediQR</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Login
          </Link>
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Instant Medical Info <br />
            <span className="text-red-600">When Every Second Counts</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            A secure digital medical profile linked to a unique QR code. 
            Help first responders save your life with instant access to allergies, 
            medications, and emergency contacts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              Create Your Profile <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-gray-900 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Learn How It Works
            </button>
          </div>
        </motion.div>

        {/* Hero Image / Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-20 relative max-w-4xl mx-auto"
        >
          <div className="aspect-[16/9] bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden shadow-2xl flex items-center justify-center p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium">
                  <QrCode className="w-4 h-4" /> Scan for Emergency Info
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Your Life-Saving QR Code</h2>
                <p className="text-gray-600">
                  Print it on a card, wear it as a bracelet, or set it as your lock screen. 
                  Responders scan it to see exactly what they need to know.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center">
                  <QrCode className="w-full h-full text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MediQR?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Designed for speed, security, and reliability in critical moments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-8 h-8 text-red-600" />,
                title: "Instant Access",
                desc: "No login required for responders. They get the data they need in seconds."
              },
              {
                icon: <Heart className="w-8 h-8 text-red-600" />,
                title: "Comprehensive Data",
                desc: "Store allergies, medications, blood type, and full medical history securely."
              },
              {
                icon: <PhoneCall className="w-8 h-8 text-red-600" />,
                title: "One-Tap Contacts",
                desc: "Emergency contacts are displayed with direct call buttons for immediate notification."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            <span className="font-bold text-gray-900">MediQR</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 MediQR System. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
