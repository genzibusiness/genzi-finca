
import React, { createContext, useContext, useState, useEffect } from 'react';

export type FincaSidebarContextType = {
  expanded: boolean;
  toggleExpanded: () => void;
};

const SidebarContext = createContext<FincaSidebarContextType>({
  expanded: true,
  toggleExpanded: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for previously saved state in localStorage
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(expanded));
  }, [expanded]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <SidebarContext.Provider value={{ expanded, toggleExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): FincaSidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
