'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Upload,
  TruckIcon, 
  DollarSign, 
  RotateCcw,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut,
  Users,
  User,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/orders', icon: Package },
    { name: 'Bulk Import', href: '/orders/import', icon: Upload },
    { name: 'Shipping', href: '/shipping', icon: TruckIcon },
    { name: 'COD', href: '/cod', icon: DollarSign },
    { name: 'Returns', href: '/returns', icon: RotateCcw },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  // Add Owner menu for OWNER/ADMIN users
  if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
    navigation.push({ name: 'Merchants', href: '/owner/merchants', icon: Users });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-2">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary text-white rounded-lg p-2 flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Mengantar
              </span>
            </Link>
          </div>

          {/* Right side - Dark mode & Account */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Account Menu */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Role: <span className="font-medium">{user?.role}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      // Navigate to settings (you can implement this)
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="fixed left-0 top-16 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-50 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                  isActive(item.href)
                    ? 'bg-primary/10 border-primary text-primary dark:text-primary'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      </nav>
    </>
  );
}
