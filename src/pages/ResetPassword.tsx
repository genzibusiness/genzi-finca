
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    // Extract token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      // Try from query params as well (older format)
      const searchParams = new URLSearchParams(location.search);
      const urlToken = searchParams.get('token');
      
      if (!urlToken) {
        setValidationError('Invalid or missing reset token');
        setValidating(false);
        return;
      }
      
      setToken(urlToken);
    } else {
      setToken(accessToken);
    }
    
    // Validate token with Supabase
    const validateToken = async () => {
      try {
        // This will set the session if the token is valid
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setValidationError('Invalid or expired reset token');
        } else {
          console.log('Valid session established');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setValidationError('Error validating token');
      } finally {
        setValidating(false);
      }
    };
    
    if (accessToken) {
      validateToken();
    } else {
      setValidating(false);
    }
  }, [location.search, location.hash]);

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      await updatePassword(data.password);
      toast.success('Password reset successfully');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Validating your reset token...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Error</CardTitle>
            <CardDescription className="text-center">
              There was a problem with your reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <p className="text-center text-destructive mb-4">{validationError}</p>
            <p className="text-center text-muted-foreground">
              The password reset link may have expired or is invalid. Please request a new password reset link.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/auth', { state: { activeTab: 'reset' } })}
            >
              Back to Reset Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
