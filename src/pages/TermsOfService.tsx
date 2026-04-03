import { Shield, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../App';

export default function TermsOfService() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>

          <div className="prose prose-red max-w-none space-y-6 text-gray-600 dark:text-gray-300">
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Last Updated: April 3, 2026</p>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the MediQR service, you agree to be bound by these Terms of Service. 
                If you do not agree to all of these terms, you should not use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Description of Service</h2>
              <p>
                MediQR provides a digital medical profile linked to a unique QR code. 
                The service is intended to provide quick access to medical information in emergency situations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. User Responsibilities</h2>
              <p>
                <strong>Accuracy of Information:</strong> You are solely responsible for the accuracy and completeness of the information you provide in your medical profile. 
                MediQR is not responsible for any consequences resulting from inaccurate or incomplete data.
              </p>
              <p>
                <strong>QR Code Security:</strong> You are responsible for the physical security of your QR code. 
                Anyone who scans your QR code can view the information you have added to your emergency profile.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Medical Disclaimer</h2>
              <p className="font-bold text-gray-900 dark:text-white">
                MediQR IS NOT A MEDICAL SERVICE PROVIDER. THE SERVICE IS FOR INFORMATION PURPOSES ONLY. 
                IN AN EMERGENCY, ALWAYS CALL LOCAL EMERGENCY SERVICES (E.G., 911).
              </p>
              <p>
                MediQR does not guarantee that first responders or medical professionals will scan or use the QR code in an emergency. 
                The service is provided "as is" without any warranties of any kind.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MediQR shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Modifications to Service</h2>
              <p>
                MediQR reserves the right to modify or discontinue the service at any time without notice. 
                We also reserve the right to update these Terms of Service from time to time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or the service itself.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
