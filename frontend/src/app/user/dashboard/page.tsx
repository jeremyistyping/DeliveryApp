'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Package, Search, LogOut, User } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      // TODO: Implement actual API call
      // For now, show a demo result
      setTimeout(() => {
        setSearchResult({
          trackingNumber: trackingNumber,
          status: 'IN_TRANSIT',
          lastUpdate: new Date().toISOString(),
          recipientName: 'Demo Recipient',
          recipientCity: 'Jakarta',
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch tracking information');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PENDING':
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
                <p className="text-sm text-gray-600">Track your shipments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">User Account</p>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Track your delivery status by entering the tracking number below.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary" />
            Track Your Package
          </h3>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter tracking number (e.g., TK123456789)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Track
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tracking Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {searchResult.trackingNumber}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full border ${getStatusColor(searchResult.status)}`}>
                  <p className="font-semibold uppercase tracking-wide">
                    {getStatusLabel(searchResult.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Recipient Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {searchResult.recipientName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination City</p>
                  <p className="text-base font-medium text-gray-900">
                    {searchResult.recipientCity}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(searchResult.lastUpdate).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Tracking information is updated regularly. 
                  Please check back later for the latest status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900">Real-time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Access</p>
                <p className="text-lg font-semibold text-gray-900">Anytime</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Support</p>
                <p className="text-lg font-semibold text-gray-900">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
