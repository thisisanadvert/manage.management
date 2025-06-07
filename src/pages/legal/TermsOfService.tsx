import React from 'react';
import { Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded">
                <Building2 size={24} />
              </div>
              <span className="text-2xl font-bold text-primary-800 pixel-font">Manage.Management</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Manage.Management, you accept and agree to be bound by the 
              terms and provision of this agreement.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Manage.Management is a property management platform designed to facilitate 
              communication and management between RTM directors, leaseholders, and management companies.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password 
              and for restricting access to your computer.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the service to:</p>
            <ul>
              <li>Upload or transmit any unlawful, harmful, or objectionable content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
            </ul>

            <h2>5. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also 
              governs your use of the service.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall Manage.Management be liable for any indirect, incidental, 
              special, consequential, or punitive damages.
            </p>

            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, 
              without prior notice or liability, under our sole discretion.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these terms at any time. If a revision 
              is material, we will provide at least 30 days notice.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@manage.management" className="text-primary-600 hover:text-primary-800">
                legal@manage.management
              </a>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
