
import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
}
