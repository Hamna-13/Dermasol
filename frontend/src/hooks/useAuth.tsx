import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('dermaSolUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('dermaSolUsers') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name
    };

    users.push(newUser);
    localStorage.setItem('dermaSolUsers', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('dermaSolUser', JSON.stringify(userWithoutPassword));
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('dermaSolUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    setUser(userWithoutPassword);
    localStorage.setItem('dermaSolUser', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dermaSolUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
