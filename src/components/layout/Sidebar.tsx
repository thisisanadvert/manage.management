import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatures } from '../../hooks/useFeatures';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Wallet, 
  FileText, 
  BellRing, 
  Vote, 
  Building2, 
  UserCheck,
  HelpCircle,
  Users,
  Calendar,
  Share2,
  Scale,
  Mail,
  X,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';

interface SidebarProps {
  onItemClick?: () => void;
}

const Sidebar = ({ onItemClick }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFeatureEnabled, isDevelopmentEnvironment } = useFeatures();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const baseRoute = user?.role ? `/${user.role.split('-')[0]}` : '';
  
  const navigation = [
    {
      name: 'Dashboard',
      href: baseRoute,
      icon: LayoutDashboard,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Building Setup',
      href: `${baseRoute}/building-setup`,
      icon: Building2,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Issues',
      href: `${baseRoute}/issues`,
      icon: AlertTriangle,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Finances',
      href: `${baseRoute}/finances`,
      icon: Wallet,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Documents',
      href: `${baseRoute}/documents`,
      icon: FileText,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Announcements',
      href: `${baseRoute}/announcements`,
      icon: BellRing,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'Voting',
      href: `${baseRoute}/voting`,
      icon: Vote,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'AGMs',
      href: `${baseRoute}/agms`,
      icon: Calendar,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
    {
      name: 'RTM Formation',
      href: `${baseRoute}/rtm`,
      icon: Scale,
      roles: ['rtm-director'] // Only RTM directors can access RTM formation tools
    },
    {
      name: 'Share Certificates',
      href: `${baseRoute}/shares`,
      icon: Share2,
      roles: ['rmc-director'] // Only RMC directors have share certificates
    },
    {
      name: 'Supplier Network',
      href: `${baseRoute}/suppliers`,
      icon: UserCheck,
      beta: true,
      roles: ['rtm-director', 'rmc-director'],
      requiresFeature: 'supplierNetwork'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['rtm-director', 'rmc-director', 'leaseholder', 'shareholder', 'management-company']
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          buildingId: user?.metadata?.buildingId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setShowContactModal(false);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Support</h2>
          <button onClick={() => setShowContactModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '') && 
    (!item.requiresFeature || isFeatureEnabled(item.requiresFeature))
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={`
                group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-all
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}
              `}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 transition-colors
                  ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'}
                `} 
              />
              <span className="flex-1">{item.name}</span>
              {item.beta && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-800">
                  Beta
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/help"
          className="flex items-center px-2 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 transition-colors"
        >
          <HelpCircle className="mr-3 h-5 w-5 text-gray-500" />
          Help & Resources
        </Link>
        
        <div className="mt-6 bg-primary-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary-800">Need assistance?</h3>
          <p className="mt-1 text-xs text-primary-600">
            Contact our support team for help with your property management needs.
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>

      {showContactModal && <ContactModal />}
    </div>
  );
};

export default Sidebar;