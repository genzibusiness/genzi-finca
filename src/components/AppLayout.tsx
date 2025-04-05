
import React from 'react';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/context/AuthContext';
import Copyright from './Copyright';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { preferences, loading } = useUserPreferences();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
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
        {children}
        <Copyright />
      </main>
    </div>
  );
};

export default AppLayout;
