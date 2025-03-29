
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/context/AuthContext';
import Copyright from './Copyright';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background relative">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Copyright />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
