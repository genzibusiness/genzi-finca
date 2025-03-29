
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ConfirmSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmSignup = async () => {
      try {
        setIsLoading(true);
        
        // Extract access token from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found in URL');
        }
        
        // Validate the session with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setIsSuccess(true);
          toast.success('Email confirmed successfully!');
        } else {
          throw new Error('Failed to confirm email');
        }
      } catch (error: any) {
        console.error('Error confirming signup:', error);
        setErrorMessage(error.message || 'Failed to confirm email');
        setIsSuccess(false);
        toast.error('Failed to confirm email');
      } finally {
        setIsLoading(false);
      }
    };
    
    confirmSignup();
  }, [navigate]);

  const handleContinue = () => {
    navigate('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Email Confirmation</CardTitle>
          <CardDescription className="text-center">
            {isLoading ? 'Verifying your email...' : isSuccess ? 'Your email has been confirmed!' : 'There was a problem confirming your email'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          ) : isSuccess ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-center">Welcome to Genzi Finca!</h3>
              <p className="text-center text-muted-foreground mt-2">
                Your email has been confirmed. You can now access all features of the application.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-center">Confirmation Failed</h3>
              <p className="text-center text-muted-foreground mt-2">
                {errorMessage || 'We could not confirm your email. The link may have expired or is invalid.'}
              </p>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {isLoading ? null : isSuccess ? (
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          ) : (
            <div className="flex flex-col w-full gap-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmSignup;
