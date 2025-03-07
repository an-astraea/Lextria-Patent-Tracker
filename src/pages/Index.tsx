
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Shield, FileSearch } from 'lucide-react';
import { loginUser } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Check if user is already logged in
  React.useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      setLoading(true);
      const user = await loginUser(email, password);
      if (user) {
        toast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-10 w-10 text-primary mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Lextria Research</h1>
        </div>
        <p className="text-gray-600">Patent Tracking & Management System</p>
      </div>
      
      <Card className="w-full max-w-md border-none shadow-lg animate-fade-in">
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <div className="bg-primary text-white p-3 rounded-full shadow-md">
            <FileSearch className="h-6 w-6" />
          </div>
        </div>
        
        <CardHeader className="space-y-1 pt-10">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Sign in to your account</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your credentials to access the patent management portal
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                disabled={loading} 
                required 
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={loading} 
                required 
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 mt-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="border-t border-gray-100 pt-4 pb-6">
          <p className="w-full text-center text-sm text-gray-500">
            For support, please contact your administrator
          </p>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in">
        <p>© {new Date().getFullYear()} Lextria Research. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
