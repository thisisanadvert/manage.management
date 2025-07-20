import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Wallet,
  FileText,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const baseRoute = user?.role
    ? user.role === 'super-admin'
      ? '/rtm'  // Super-admin users default to RTM dashboard
      : `/${user.role.split('-')[0]}`
    : '';

  const navigation = [
    {
      name: user?.role === 'management-company' ? 'Portfolio' : 'Dashboard',
      href: baseRoute,
      icon: LayoutDashboard
    },
    { name: 'Issues', href: `${baseRoute}/issues`, icon: AlertTriangle },
    { name: 'Finances', href: `${baseRoute}/finances`, icon: Wallet },
    { name: 'Documents', href: `${baseRoute}/documents`, icon: FileText },
    { name: 'Updates', href: `${baseRoute}/announcements`, icon: BellRing },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center transition-colors
                ${isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-600 hover:text-primary-500'}
              `}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;