import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import DevUserSwitcher from '../dev/DevUserSwitcher';
import DevPanel from '../dev/DevPanel';
import ImpersonationBanner from '../admin/ImpersonationBanner';
import ImpersonationStyleProvider from '../admin/ImpersonationStyleProvider';
import AccessibilityToolbar from '../landing/AccessibilityToolbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ImpersonationStyleProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ImpersonationBanner />
        <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <div className={`hidden lg:block w-64 flex-shrink-0`}>
          <Sidebar />
        </div>
        
        {/* Mobile sidebar */}
        {isMobile && (
          <div
            className={`fixed inset-0 z-[1050] transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div
              className="absolute inset-0 bg-gray-600 opacity-75"
              onClick={toggleSidebar}
            ></div>
            <div className={`fixed inset-y-0 left-0 flex flex-col z-[1060] w-64 bg-white transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <Footer />

        {/* Accessibility Toolbar - Available for all logged-in users */}
        <AccessibilityToolbar />

        {/* Developer Tools - Only visible to super user */}
        <DevPanel />
        <DevUserSwitcher />
      </div>
    </ImpersonationStyleProvider>
  );
};

export default MainLayout;