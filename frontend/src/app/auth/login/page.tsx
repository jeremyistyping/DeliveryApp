'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // CRITICAL: Prevent form submission first
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 Login attempt started'); // Debug log
    
    // Don't proceed if already loading
    if (loading) {
      console.log('⏸️  Already loading, skipping...');
      return;
    }
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      console.log('❌ Validation failed: Empty fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      console.log('❌ Validation failed: Invalid email');
      return;
    }

    console.log('🚀 Calling login API...');
    
    setLoading(true);
    
    try {
      await login(email, password);
      console.log('✅ Login successful');
      // Success - login function will handle navigation
      // Don't set loading to false here - component will unmount
    } catch (error: any) {
      console.log('❌ Login error caught:', error);
      
      // Error toast is already shown by AuthContext with persistent duration
      // Just set the inline error for visual feedback
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 404) {
        setError('Account not found');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message === 'Network Error') {
        setError('Connection error. Please check your internet.');
      } else {
        setError('Login failed. Please try again.');
      }
      
      // IMPORTANT: Reset loading state on error so user can try again
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit} 
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: merchant1@example.com / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}