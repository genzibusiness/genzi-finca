
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { CashflowProvider } from '@/context/CashflowContext';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile } = useAuth();

  return (
    <CashflowProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </CashflowProvider>
  );
};

export default AppLayout;
