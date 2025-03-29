
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeDollarSign } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { user, updatePassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  // Check for token in URL
  useEffect(() => {
    const handleToken = async () => {
      try {
        // Get token from URL
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        
        if (!token) {
          toast.error('Password reset token is missing');
          setIsVerifying(false);
          return;
        }
        
        // Verify token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });
        
        if (error) {
          console.error('Error verifying token:', error);
          toast.error('Invalid or expired password reset token');
          setIsTokenValid(false);
        } else {
          console.log('Token verified successfully:', data);
          setIsTokenValid(true);
          // Clean up URL
          window.history.replaceState({}, document.title, '/reset-password');
        }
      } catch (error) {
        console.error('Error during token verification:', error);
        toast.error('Failed to verify reset token');
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    handleToken();
  }, []);
  
  // If still verifying token, show loading
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <BadgeDollarSign size={40} className="text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifying Reset Link</CardTitle>
            <CardDescription>Please wait while we verify your reset link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If token is invalid and not logged in, redirect to login page
  if (!isTokenValid && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <BadgeDollarSign size={40} className="text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button className="w-full" onClick={() => navigate('/auth')}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If operation successful, show success message with link to login
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <BadgeDollarSign size={40} className="text-primary" />
            </div>
            <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
            <CardDescription>Your password has been successfully updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <BadgeDollarSign size={40} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <ResetPasswordForm onSubmit={updatePassword} onSuccess={() => setIsSuccess(true)} />
      </Card>
    </div>
  );
};

const ResetPasswordForm = ({ 
  onSubmit,
  onSuccess
}: { 
  onSubmit: (password: string) => Promise<void>,
  onSuccess: () => void
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof resetSchema>) => {
    setIsLoading(true);
    try {
      await onSubmit(values.password);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPassword;
