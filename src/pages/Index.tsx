
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, FileText } from 'lucide-react';
import { loginUser } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md text-center mb-6 md:mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
          <div className="relative w-20 h-20 mb-2 sm:mb-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <img 
              src="/placeholder.svg" 
              alt="Lextria Research Logo" 
              className="h-full w-full p-2 relative z-10 object-contain"
              id="company-logo"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">Lextria Research</h1>
            <p className="text-gray-600 text-sm md:text-base">Patent Tracking & Management System</p>
          </div>
        </div>
      </div>
      
      <Card className="w-full max-w-md border shadow-lg animate-fade-in bg-white/80 backdrop-blur-sm">
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <div className="bg-primary text-white p-3 rounded-full shadow-md">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        
        <CardHeader className="space-y-1 pt-10">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800">Sign in to your account</CardTitle>
          <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
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
      
      <div className="mt-6 md:mt-8 text-center text-xs sm:text-sm text-gray-500 animate-fade-in">
        <p>© {new Date().getFullYear()} Lextria Research. All rights reserved.</p>
      </div>

      {/* Decorative elements that only appear on larger screens */}
      {!isMobile && (
        <>
          <div className="fixed top-20 left-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="fixed bottom-10 right-20 w-80 h-80 bg-indigo-100/20 rounded-full filter blur-3xl"></div>
        </>
      )}
    </div>
  );
};

export default Index;
