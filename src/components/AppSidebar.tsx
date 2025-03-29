
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BadgeDollarSign, Settings, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: Home },
    { title: 'Transactions', path: '/transactions', icon: BadgeDollarSign },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BadgeDollarSign size={30} className="text-sidebar-primary" />
          <span className="text-xl font-bold tracking-tight">Genzi Finca</span>
        </Link>
        <SidebarTrigger className="md:hidden absolute right-2 top-4" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className={`${location.pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-white font-medium">
                {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
            <LogOut size={18} />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
