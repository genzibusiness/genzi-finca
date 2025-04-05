import React from 'react';
import { Sidebar, SidebarTab, SidebarTabs, SidebarSection } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Settings
} from 'lucide-react';

const AppSidebar = () => {
  return (
    <Sidebar className="border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-2 pt-6">
          <h2 className="flex items-center px-4 text-lg font-semibold tracking-tight">
            <img src="/logo.svg" alt="Finca" className="h-6 mr-2" />
            Finca
          </h2>
        </div>
        <SidebarTabs>
          <SidebarTab value="dashboard" url='/dashboard' icon={<LayoutDashboard size={18} />}>
            Dashboard
          </SidebarTab>
          <SidebarTab value="transactions" url='/transactions' icon={<FileText size={18} />}>
            Transactions
          </SidebarTab>
          <SidebarTab value="income" url='/income' icon={<TrendingUp size={18} />}>
            Income
          </SidebarTab>
          <SidebarTab value="expenses" url='/expenses' icon={<TrendingDown size={18} />}>
            Expenses
          </SidebarTab>
          
          <SidebarSection title="Account">
            <SidebarTab value="settings" url='/settings' icon={<Settings size={18} />}>
              Settings
            </SidebarTab>
          </SidebarSection>
        </SidebarTabs>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
