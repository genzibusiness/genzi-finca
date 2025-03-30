
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading, resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize active tab from location state or default to signin
  const locationState = location.state as { activeTab?: string } | null;
  const initialTab = locationState?.activeTab || 'signin';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Check for confirmed email parameter
  const searchParams = new URLSearchParams(location.search);
  const isConfirmed = searchParams.get('confirmed') === 'true';

  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    }
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    }
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Email confirmed! You can now sign in.');
    }
  }, [isConfirmed]);
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      navigate('/');
    } catch (error) {
      // Error is handled in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.name);
      setActiveTab('signin');
      loginForm.setValue('email', values.email);
      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error) {
      // Error is handled in the signUp function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (values: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword(values.email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      // Error is handled in the resetPassword function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">Genzi Finca</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Manage your finances with ease
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin" className="text-xs sm:text-sm">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign Up</TabsTrigger>
            <TabsTrigger value="reset" className="text-xs sm:text-sm">Reset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleSignIn)}>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button 
                    type="submit" 
                    className="w-full text-sm sm:text-base py-2 sm:py-2.5" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="signup">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleSignUp)}>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            autoComplete="name"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs sm:text-sm font-normal">
                            I accept the terms and conditions
                          </FormLabel>
                        </div>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full text-sm sm:text-base py-2 sm:py-2.5" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="reset">
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="text-sm sm:text-base h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full text-sm sm:text-base py-2 sm:py-2.5" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
