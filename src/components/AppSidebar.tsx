
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  CreditCard,
  Database,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <Link to="/dashboard" className="flex items-center gap-1 sm:gap-2">
            <img 
              src="/lovable-uploads/c6205e0f-d02f-4ea9-a6dd-ea17fa945b79.png" 
              alt="Genzi Finca Logo" 
              className="h-6 w-6 sm:h-8 sm:w-8" 
            />
            <span className="font-bold text-sm sm:text-base whitespace-nowrap">Genzi Finca</span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Dashboard"
              className="text-xs sm:text-sm"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/transactions') || location.pathname.startsWith('/transactions/')}
              tooltip="Transactions"
              className="text-xs sm:text-sm"
            >
              <Link to="/transactions">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Transactions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/chat')}
              tooltip="Finca Chat"
              className="text-xs sm:text-sm"
            >
              <Link to="/chat">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Finca Chat</span>
                <Badge variant="outline" className="ml-auto text-xs bg-primary text-white border-primary">New</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/configure')}
              tooltip="Configure"
              className="text-xs sm:text-sm"
            >
              <Link to="/configure">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Configure</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/settings')}
              tooltip="Settings"
              className="text-xs sm:text-sm"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-2">
        <Button
          variant="outline"
          className="w-full gap-1 sm:gap-2 justify-start text-xs sm:text-sm mb-2 bg-black text-white hover:bg-black/90 hover:text-white py-1.5 sm:py-2"
          onClick={() => navigate('/transactions/new')}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          New Transaction
        </Button>
        
        <Button
          variant="ghost"
          className="w-full gap-1 sm:gap-2 justify-start text-xs sm:text-sm text-destructive hover:text-destructive py-1.5 sm:py-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
