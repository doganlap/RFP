/**
 * Enterprise Application Layout
 */
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store';
import { cn } from '../../utils/cn';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 overflow-auto flex flex-col">
        <Header />
        <main
          className={cn(
            'flex-1 relative overflow-y-auto focus:outline-none',
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
