'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  merchant?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login({ email, password });
      const { user: userData, token } = response.data.data;

      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'lax' });
      Cookies.set('user', JSON.stringify(userData), { expires: 7, secure: true, sameSite: 'lax' });
      
      setUser(userData);
      toast.success('Login successful!', { duration: 3000 });
      
      // Redirect based on user role
      if (userData.role === 'MAIN_ADMIN' || userData.role === 'GENERAL_ADMIN') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'USER') {
        router.push('/user/dashboard');
      } else if (userData.role === 'MERCHANT') {
        // Merchants - check if profile complete
        if (!userData.merchant) {
          router.push('/merchant/onboarding');
        } else {
          router.push('/merchant/dashboard');
        }
      } else {
        // Fallback for any other role
        router.push('/user/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages with persistent toasts
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Account not found. Please register first.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Connection error. Please check your internet.';
      }
      
      // Show persistent error toast that requires manual dismissal
      console.log('🔴 Showing persistent error toast:', errorMessage); // Debug
      const toastId = toast.error(errorMessage, {
        duration: Infinity,
        style: {
          maxWidth: '500px',
        },
      });
      console.log('🎯 Toast ID:', toastId, '| Duration: Infinity'); // Debug
      
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await auth.register({ name, email, password });
      
      // Don't auto-login - user must login manually after registration
      // Show success message with redirect info
      toast.success('Account created successfully! Please login with your credentials.', { 
        duration: 5000,
        style: {
          maxWidth: '500px',
        },
      });
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error messages with persistent toasts
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 409 || error.response?.data?.error?.includes('already exists')) {
        errorMessage = 'Email already registered. Please login instead.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Connection error. Please check your internet.';
      }
      
      // Show persistent error toast that requires manual dismissal
      toast.error(errorMessage, {
        duration: Infinity,
        style: {
          maxWidth: '500px',
        },
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}