
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, TrendingUp, TrendingDown, Settings, Database, LogOut, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';

const AppSidebar = () => {
  // Use our custom sidebar context
  const { expanded } = useSidebar();
  const { signOut, user } = useAuth();

  return <Sidebar className="border-r bg-background">
      <div className="flex h-full flex-col" data-expanded={expanded ? 'true' : 'false'}>
        <div className="p-2 pt-6">
          <h2 className="flex items-center px-4 text-lg font-semibold tracking-tight">
            <img src="/logo.svg" alt="Finca" className="h-6 mr-2" />
            {expanded && <span className="ensure finca image is accurately used as logo">Finca</span>}
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
              <LayoutDashboard size={18} />
              {expanded && <span>Dashboard</span>}
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
              <FileText size={18} />
              {expanded && <span>Transactions</span>}
            </Link>
            <Link to="/income" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
              <TrendingUp size={18} />
              {expanded && <span>Income</span>}
            </Link>
            <Link to="/expenses" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
              <TrendingDown size={18} />
              {expanded && <span>Expenses</span>}
            </Link>
            <Link to="/chat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
              <MessageSquare size={18} />
              {expanded && <span>Chat</span>}
            </Link>
          </nav>
          
          <div className="mt-6">
            <h3 className="px-4 text-sm font-medium text-muted-foreground">Administration</h3>
            <nav className="grid gap-1 px-2 mt-2">
              <Link to="/configure" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
                <Database size={18} />
                {expanded && <span>Master Data</span>}
              </Link>
              <Link to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
                <Settings size={18} />
                {expanded && <span>Settings</span>}
              </Link>
              {user && (
                <button 
                  onClick={signOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors w-full text-left"
                >
                  <LogOut size={18} />
                  {expanded && <span>Sign Out</span>}
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </Sidebar>;
};
export default AppSidebar;
