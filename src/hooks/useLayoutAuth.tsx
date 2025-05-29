
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
        
        // Admin-only pages (admin can access everything)
        const adminOnlyPages = ['/employees', '/bulk-upload'];
        
        // Filer-only pages (filer handles approvals now)
        const filerOnlyPages = ['/approvals'];
        
        // Admin and filer can access these pages
        const adminFilerPages = ['/clients'];
        
        // Prevent non-admins from accessing admin-only pages
        if (parsedUser.role !== 'admin' && adminOnlyPages.some(page => currentPath.startsWith(page))) {
          console.log('Non-admin trying to access admin page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          // Redirect based on role
          if (parsedUser.role === 'drafter') {
            navigate('/drafts');
          } else if (parsedUser.role === 'filer') {
            navigate('/approvals');
          } else {
            navigate('/dashboard');
          }
        }
        
        // Prevent non-filers from accessing filer-only pages
        else if (parsedUser.role !== 'filer' && parsedUser.role !== 'admin' && filerOnlyPages.some(page => currentPath.startsWith(page))) {
          console.log('Non-filer trying to access filer page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          if (parsedUser.role === 'drafter') {
            navigate('/drafts');
          } else {
            navigate('/dashboard');
          }
        }
        
        // Prevent non-admin/non-filer from accessing admin-filer pages
        else if (!['admin', 'filer'].includes(parsedUser.role) && adminFilerPages.some(page => currentPath.startsWith(page))) {
          console.log('Non-admin/non-filer trying to access admin-filer page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          if (parsedUser.role === 'drafter') {
            navigate('/drafts');
          } else {
            navigate('/dashboard');
          }
        }
        
        // Drafter-only pages
        else if (parsedUser.role !== 'drafter' && parsedUser.role !== 'admin' && currentPath.startsWith('/drafts')) {
          console.log('Non-drafter trying to access drafter page:', currentPath);
          toast.error('You do not have permission to access this page');
          
          if (parsedUser.role === 'filer') {
            navigate('/approvals');
          } else {
            navigate('/dashboard');
          }
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
