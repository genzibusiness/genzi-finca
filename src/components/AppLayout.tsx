
import React from 'react';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/context/AuthContext';
import Copyright from './Copyright';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSidebar } from '@/context/SidebarContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { preferences, loading } = useUserPreferences();
  const { expanded } = useSidebar();
  const sidebarWidth = expanded ? '16rem' : '4rem';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main 
        className="flex-1 flex flex-col" 
        style={{ 
          marginLeft: sidebarWidth, 
          width: `calc(100% - ${sidebarWidth})`,
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
        }}
      >
        <div className="flex justify-end p-2 sm:p-4 border-b">
          {preferences && (
            <div className="flex items-center mr-4">
              <span className="text-sm text-muted-foreground mr-2">
                Display Currency: {preferences.preferred_currency}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="h-8"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
        <Copyright />
      </main>
    </div>
  );
};

export default AppLayout;
