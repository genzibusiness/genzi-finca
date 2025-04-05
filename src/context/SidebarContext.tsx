
import React, { createContext, useContext, useState } from 'react';

// Create a separate interface for our context to avoid conflicts with shadcn's useSidebar
type FincaSidebarContextType = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

const FincaSidebarContext = createContext<FincaSidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <FincaSidebarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      {children}
    </FincaSidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(FincaSidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
}
