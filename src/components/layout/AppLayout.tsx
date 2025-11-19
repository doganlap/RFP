/**
 * Enterprise Application Layout
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Footer from './Footer';
import { useAppStore } from '../../store';
import { cn } from '../../utils/cn';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar - Hidden on landing page */}
      {!isLandingPage && <Sidebar />}

      {/* Main content area */}
      <div className="flex-1 overflow-auto flex flex-col">
        {!isLandingPage && <Header />}
        <main
          className={cn(
            'flex-1 relative overflow-y-auto focus:outline-none',
            isLandingPage ? '' : (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')
          )}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
