import { Shield, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../App';

export default function PrivacyPolicy() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 transition-colors"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>

          <div className="prose prose-red max-w-none space-y-6 text-gray-600 dark:text-gray-300">
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Last Updated: April 3, 2026</p>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
              <p>
                At MediQR, we take your privacy and the security of your medical information extremely seriously. 
                This Privacy Policy explains how we collect, use, and protect your data when you use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Information We Collect</h2>
              <p>We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Your name and email address provided via Google Login.</li>
                <li><strong>Medical Profile Data:</strong> Information you voluntarily provide, including blood type, allergies, medications, and medical history.</li>
                <li><strong>Emergency Contacts:</strong> Names and phone numbers of individuals you designate to be contacted in an emergency.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. How We Use Your Information</h2>
              <p>
                Your information is used solely for the purpose of providing the MediQR service. 
                Specifically, to display your medical profile to first responders or anyone who scans your unique QR code.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Data Sharing and Visibility</h2>
              <p>
                <strong>QR Code Access:</strong> By default, anyone who scans your unique QR code can view the information you have added to your emergency profile. 
                You can control the visibility of your profile through the "Privacy & Sharing" settings in your dashboard.
              </p>
              <p>
                <strong>Third Parties:</strong> We do not sell, trade, or otherwise transfer your personal information to outside parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Data Security</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. 
                Your data is stored in secure Firebase databases with strict access controls.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your medical profile at any time through the MediQR dashboard. 
                Deleting your account will permanently remove all your data from our systems.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Contact Us</h2>
              <p>
                If you have any questions regarding this Privacy Policy, you may contact us at privacy@mediqr.system.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
