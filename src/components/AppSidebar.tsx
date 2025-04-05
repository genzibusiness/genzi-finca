
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';

const AppSidebar = () => {
  // Use our custom sidebar context
  const { expanded } = useSidebar();
  
  return (
    <Sidebar expanded={expanded} className="border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-2 pt-6">
          <h2 className="flex items-center px-4 text-lg font-semibold tracking-tight">
            <img src="/logo.svg" alt="Finca" className="h-6 mr-2" />
            Finca
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/transactions" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <FileText size={18} />
              <span>Transactions</span>
            </Link>
            <Link 
              to="/income" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <TrendingUp size={18} />
              <span>Income</span>
            </Link>
            <Link 
              to="/expenses" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <TrendingDown size={18} />
              <span>Expenses</span>
            </Link>
          </nav>
          
          <div className="mt-6">
            <h3 className="px-4 text-sm font-medium text-muted-foreground">Account</h3>
            <nav className="grid gap-1 px-2 mt-2">
              <Link 
                to="/settings" 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
