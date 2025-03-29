
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
  Database
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg font-bold text-black bg-white p-1 h-7 border-black">
              GF
            </Badge>
            <span className="font-bold">Genzi Finca</span>
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
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/transactions') || location.pathname.startsWith('/transactions/')}
              tooltip="Transactions"
            >
              <Link to="/transactions">
                <CreditCard className="h-5 w-5" />
                <span>Transactions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/configure')}
              tooltip="Configure"
            >
              <Link to="/configure">
                <Database className="h-5 w-5" />
                <span>Configure</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/settings')}
              tooltip="Settings"
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-2">
        <Button
          variant="outline"
          className="w-full gap-2 justify-start mb-2 bg-black text-white hover:bg-black/90"
          onClick={() => navigate('/transactions/new')}
        >
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
        
        <Button
          variant="ghost"
          className="w-full gap-2 justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
