
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CashflowProvider } from "@/context/CashflowContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import TransactionNew from "./pages/TransactionNew";
import TransactionDetail from "./pages/TransactionDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ConfirmSignup from "./pages/ConfirmSignup";
import ConfigureMasterData from "./pages/ConfigureMasterData";
import FincaChat from "./pages/FincaChat";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";

const App = () => {
  console.log("App rendering");
  
  // Create a client inside the component
  const [queryClient] = React.useState(
    () => 
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CashflowProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Auth routes - no protection */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/confirm-signup" element={<ConfirmSignup />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                  <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                  <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
                  <Route path="/transactions/new" element={<ProtectedRoute><TransactionNew /></ProtectedRoute>} />
                  <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/configure" element={<ProtectedRoute><ConfigureMasterData /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><FincaChat /></ProtectedRoute>} />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CashflowProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
