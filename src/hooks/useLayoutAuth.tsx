
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export const useLayoutAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  const handleRoleBasedRedirect = useCallback((userRole: string, currentPath: string) => {
    console.log('Checking role-based access:', { userRole, currentPath });
    
    // Admin-only pages
    const adminOnlyPages = ['/employees', '/bulk-upload'];
    
    // Check if non-admin is trying to access admin-only pages
    if (!userRole.includes('admin') && adminOnlyPages.some(page => currentPath.startsWith(page))) {
      console.log('Non-admin trying to access admin page:', currentPath);
      toast.error('You do not have permission to access this page');
      
      // Redirect based on role
      if (userRole === 'drafter') {
        navigate('/drafts', { replace: true });
      } else if (userRole === 'filer') {
        navigate('/filings', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return false;
    }
    
    // Drafter-specific restrictions
    if (userRole === 'drafter') {
      const drafterRestrictedPages = ['/filings', '/clients'];
      if (drafterRestrictedPages.some(page => currentPath.startsWith(page))) {
        console.log('Drafter trying to access restricted page:', currentPath);
        toast.error('You do not have permission to access this page');
        navigate('/drafts', { replace: true });
        return false;
      }
    }
    
    // Filer has access to approvals and clients as per requirements
    // No additional restrictions for filers
    
    return true;
  }, [navigate]);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;
    
    console.log('useLayoutAuth initializing, path:', location.pathname);
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Skip auth check for index page
        if (isIndexPage) {
          setIsLoading(false);
          setHasInitialized(true);
          return;
        }
        
        const storedUser = localStorage.getItem('user');
        console.log('Stored user:', storedUser);
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Check role-based permissions
          const hasAccess = handleRoleBasedRedirect(parsedUser.role, location.pathname);
          
          if (!hasAccess) {
            // Navigation will be handled by handleRoleBasedRedirect
            setIsLoading(false);
            setHasInitialized(true);
            return;
          }
        } else {
          // No user found, redirect to login
          console.log('No user found, redirecting to login');
          navigate('/', { replace: true });
        }
        
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (!isIndexPage) {
          navigate('/', { replace: true });
        }
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, [isIndexPage, location.pathname, handleRoleBasedRedirect, navigate, hasInitialized]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      setHasInitialized(false);
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout');
    }
  }, [navigate]);

  return {
    user,
    isLoading,
    isIndexPage,
    handleLogout
  };
};
