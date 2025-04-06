
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'sonner';

// Import pages
import Index from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionNew from '@/pages/TransactionNew';
import TransactionDetail from '@/pages/TransactionDetail';
import Income from '@/pages/Income';
import Expenses from '@/pages/Expenses';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfigureMasterData from '@/pages/ConfigureMasterData';
import FincaChat from '@/pages/FincaChat';

// Import context providers
import { AuthProvider } from '@/context/AuthContext';
import { CashflowProvider } from '@/context/CashflowContext';
import { SidebarProvider } from '@/context/SidebarContext';
import UserSettings from '@/pages/UserSettings';

// Import Sidebar components from ui
import { SidebarProvider as UISidebarProvider } from '@/components/ui/sidebar';
import ChatButton from '@/components/chat/ChatButton';
import { useLocation } from 'react-router-dom';

const App = () => {
  // Initialize query client here to ensure it's stable across renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  // Simple error boundary fallback component
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-4">The application encountered an error. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const ConditionalChatButton = () => {
    const location = useLocation();
    // Don't show chat button on auth page
    if (location.pathname === '/auth') {
      return null;
    }
    return <ChatButton />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <AuthProvider>
          <CashflowProvider>
            <ThemeProvider defaultTheme="system" storageKey="finca-ui-theme">
              <UISidebarProvider>
                <SidebarProvider>
                  <Routes>
                    {/* Redirect from / to /dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Auth Route */}
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/transactions/new" element={<TransactionNew />} />
                      <Route path="/transactions/:id" element={<TransactionDetail />} />
                      <Route path="/income" element={<Income />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/settings" element={<UserSettings />} />
                      <Route path="/configure" element={<ConfigureMasterData />} />
                      <Route path="/chat" element={<FincaChat />} />
                    </Route>
                    
                    {/* Error/Not Found Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster position="top-right" />
                  <ConditionalChatButton />
                </SidebarProvider>
              </UISidebarProvider>
            </ThemeProvider>
          </CashflowProvider>
        </AuthProvider>
      </Suspense>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
