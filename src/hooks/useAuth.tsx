
import { useState, useEffect, createContext, useContext } from 'react';

// Define the User interface - Restored original roles
interface User {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  role: 'admin' | 'drafter' | 'filer'; // Restored original roles
  created_at: string;
  updated_at: string;
}

// Define the context value interface
interface AuthContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (!isInitialized) {
    return null; // Or a loading indicator
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the hook
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
