import { useState, useEffect } from 'react';
import { Bell, Search, Menu, Settings, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserRole = () => {
    switch (user?.role) {
      case 'rtm-director':
        return 'RTM Director';
      case 'sof-director':
        return 'Share of Freehold Director';
      case 'leaseholder':
        return 'Leaseholder';
      case 'shareholder':
        return 'Share of Freeholder';
      case 'management-company':
        return 'Management Company';
      default:
        return 'User';
    }
  };

  return (
    <header 
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        scrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and menu button */}
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden mr-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            
            <a
              href="https://manage.management"
              className="flex items-center"
            >
              <Logo size="md" showText={true} />
            </a>
          </div>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center w-1/3 relative">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
              />
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
          </div>
          
          {/* Right-side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent-500 rounded-full"></span>
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 animate-slide-down">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 border-l-4 border-primary-500">
                      <p className="text-sm font-medium text-gray-900">New announcement posted</p>
                      <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Issue #23 status updated</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                  {getUserInitials()}
                </div>
                <span className="hidden md:inline text-sm font-medium">{getUserRole()}</span>
              </button>
              
              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 animate-slide-down">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;