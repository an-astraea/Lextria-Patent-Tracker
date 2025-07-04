
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export const useLayoutAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  useEffect(() => {
    console.log('useLayoutAuth hook running, path:', location.pathname);
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Stored user:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Check if the user is trying to access a page they shouldn't have access to
        const currentPath = location.pathname;
        
        // Admin-only pages
        const adminOnlyPages = ['/employees', '/bulk-upload'];
        
        // Prevent non-admins from accessing admin-only pages
        if (!parsedUser.role.includes('admin') && adminOnlyPages.some(page => currentPath.startsWith(page))) {
          console.log('Non-admin trying to access admin page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          // Redirect based on role
          if (parsedUser.role === 'drafter') {
            navigate('/drafts');
          } else if (parsedUser.role === 'filer') {
            navigate('/filings');
          } else {
            navigate('/dashboard');
          }
        }
        
        // Filer-only restrictions (drafters can now access most pages)
        else if (parsedUser.role === 'filer' && currentPath.startsWith('/drafts')) {
          console.log('Filer trying to access drafter page:', currentPath);
          toast.error('You do not have permission to access this page');
          navigate('/filings');
        }
      } else if (!isIndexPage) {
        navigate('/');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      if (!isIndexPage) {
        navigate('/');
      }
      setIsLoading(false);
    }
  }, [navigate, isIndexPage, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return {
    user,
    isLoading,
    isIndexPage,
    handleLogout
  };
};
