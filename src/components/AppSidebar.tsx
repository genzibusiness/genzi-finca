
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Home, BarChart4, FileCog, MessageSquare, ArrowDown, ArrowUp, Settings, Menu } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { name: 'Income', path: '/income', icon: <ArrowUp className="h-5 w-5" /> },
  { name: 'Expenses', path: '/expenses', icon: <ArrowDown className="h-5 w-5" /> },
  { name: 'Transactions', path: '/transactions', icon: <BarChart4 className="h-5 w-5" /> },
  { name: 'Finca Chat', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
  { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  { name: 'Configure', path: '/configure', icon: <FileCog className="h-5 w-5" /> },
];

const AppSidebar = () => {
  const location = useLocation();
  const { expanded, toggleExpanded } = useSidebar();
  const isCollapsed = !expanded;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-[#004058] transition-width duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo and collapse button */}
        <div className={cn(
          "relative flex h-16 items-center justify-between border-b border-white/10 bg-[#004058] px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/adc2386b-98c0-4b41-8e5c-0659f259536f.png" 
                alt="Finca" 
                className="h-8 w-8" 
              />
              {!isCollapsed && <span className="text-xl font-semibold text-white">Genzi Finca</span>}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("text-white hover:bg-[#00526e]", isCollapsed ? "absolute right-0 -mr-3 top-4 bg-[#004058]" : "")}
            onClick={toggleExpanded}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu button - only shown on smaller screens */}
        <div className="lg:hidden flex justify-between items-center px-4 py-2 border-b border-white/10">
          <span className="font-medium text-white">Menu</span>
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation items */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-[#00526e] text-white"
                    : "text-white hover:bg-[#00526e] hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="mt-auto p-4">
          <Separator className="my-2 bg-white/10" />
          {!isCollapsed && (
            <div className="text-xs text-white/70">
              <p>© 2025 Genzi Finca</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
