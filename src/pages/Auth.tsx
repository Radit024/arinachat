import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Linkedin, Phone } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
const Auth = () => {
  const {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp
  } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // If user is already logged in, redirect to home page
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(registerEmail, registerPassword, fullName);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            {!showSignUp ?
          // Login Form
          <>
                <h2 className="text-2xl font-semibold text-center mb-6">Welcome back</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-500">Email address</Label>
                    <Input id="email" type="email" placeholder="name@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-500">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="h-12" />
                  </div>
                  
                  <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Continue'}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <p className="text-sm">
                    Don't have an account? 
                    <button onClick={() => setShowSignUp(true)} className="text-emerald-500 hover:text-emerald-600 ml-1 font-medium">
                      Sign up
                    </button>
                  </p>
                </div>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Button type="button" variant="outline" className="w-full h-12 font-medium border border-gray-300 flex items-center justify-center gap-2" onClick={signInWithGoogle} disabled={isSubmitting}>
                      <Github className="h-5 w-5" />
                      Continue with Google
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full h-12 font-medium border border-gray-300 flex items-center justify-center gap-2">
                      <Linkedin className="h-5 w-5" />
                      Continue with Microsoft Account
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full h-12 font-medium border border-gray-300 flex items-center justify-center gap-2">
                      <Phone className="h-5 w-5" />
                      Continue with phone
                    </Button>
                  </div>
                </div>
              </> :
          // Register Form
          <>
                <h2 className="text-2xl font-semibold text-center mb-6">Create an account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-500">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-gray-500">Email address</Label>
                    <Input id="registerEmail" type="email" placeholder="name@example.com" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required className="h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-500">Password</Label>
                    <Input id="registerPassword" type="password" placeholder="••••••••" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required className="h-12" />
                  </div>
                  
                  <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <p className="text-sm">
                    Already have an account? 
                    <button onClick={() => setShowSignUp(false)} className="text-emerald-500 hover:text-emerald-600 ml-1 font-medium">
                      Log in
                    </button>
                  </p>
                </div>
              </>}
          </CardContent>
        </Card>
        
        
      </div>
    </div>;
};
export default Auth;