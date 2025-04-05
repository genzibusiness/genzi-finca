import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'sonner';

// Import pages
import Index from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionNew from '@/pages/TransactionNew';
import TransactionDetail from '@/pages/TransactionDetail';
import Income from '@/pages/Income';
import Expenses from '@/pages/Expenses';
import Configure from '@/pages/Configure';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import context providers
import { AuthProvider } from '@/context/AuthContext';
import { CashflowProvider } from '@/context/CashflowContext';
import UserSettings from '@/pages/UserSettings';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>
          <CashflowProvider>
            <ThemeProvider defaultTheme="system" storageKey="finca-ui-theme">
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
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
                  <Route path="/configure" element={<Configure />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                
                {/* Error/Not Found Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </ThemeProvider>
          </CashflowProvider>
        </AuthProvider>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
