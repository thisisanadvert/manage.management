import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary-800 pixel-font">Manage.Management</span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Empowering homeowners with better property management.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/issues" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Issues Management
                </Link>
              </li>
              <li>
                <Link to="/finances" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Finances
                </Link>
              </li>
              <li>
                <Link to="/documents" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Documents
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/rtm-resources" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  RTM Resources
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/leaseholder-rights" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Leaseholder Rights
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Manage.Management. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <Heart size={14} className="text-error-500 fill-error-500" />
              <span>for homeowners</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;