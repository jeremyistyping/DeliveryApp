'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { shipping } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ShippingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'rates' | 'tracking'>('rates');
  
  // Rate Checker State
  const [rateForm, setRateForm] = useState({
    origin: '',
    destination: '',
    weight: '',
    courier: 'JNE',
  });
  const [rates, setRates] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const couriers = [
    { value: 'JNE', label: 'JNE' },
    { value: 'TIKI', label: 'TIKI' },
    { value: 'POS', label: 'POS Indonesia' },
    { value: 'NINJA', label: 'Ninja Express' },
    { value: 'SICEPAT', label: 'SiCepat' },
    { value: 'ANTERAJA', label: 'AnterAja' },
  ];

  const handleCheckRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRates(true);
    
    try {
      const response = await shipping.getRates({
        origin: rateForm.origin,
        destination: rateForm.destination,
        weight: parseFloat(rateForm.weight),
        courier: rateForm.courier,
      });
      
      setRates(response.data.data.rates || []);
      toast.success('Rates loaded successfully!');
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch rates');
      setRates([]);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoadingTracking(true);
    
    try {
      const response = await shipping.trackByNumber(trackingNumber);
      setTrackingResult(response.data.data);
      toast.success('Tracking information loaded!');
    } catch (error: any) {
      console.error('Error tracking:', error);
      toast.error(error.response?.data?.error || 'Failed to track package');
      setTrackingResult(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
                <p className="text-sm text-gray-500 mt-1">Check rates and track packages</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('rates')}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                activeTab === 'rates'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Check Rates
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                activeTab === 'tracking'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Track Package
            </button>
          </div>
        </div>

        {/* Rate Checker */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Rate Calculator</h2>
            
            <form onSubmit={handleCheckRates} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin City
                  </label>
                  <input
                    type="text"
                    value={rateForm.origin}
                    onChange={(e) => setRateForm({ ...rateForm, origin: e.target.value })}
                    placeholder="e.g., Jakarta"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination City
                  </label>
                  <input
                    type="text"
                    value={rateForm.destination}
                    onChange={(e) => setRateForm({ ...rateForm, destination: e.target.value })}
                    placeholder="e.g., Surabaya"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rateForm.weight}
                    onChange={(e) => setRateForm({ ...rateForm, weight: e.target.value })}
                    placeholder="e.g., 1.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courier
                  </label>
                  <select
                    value={rateForm.courier}
                    onChange={(e) => setRateForm({ ...rateForm, courier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {couriers.map((courier) => (
                      <option key={courier.value} value={courier.value}>
                        {courier.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingRates}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingRates ? 'Checking...' : 'Check Rates'}
              </button>
            </form>

            {/* Rates Results */}
            {rates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Available Services:</h3>
                <div className="space-y-3">
                  {rates.map((rate, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{rate.service}</p>
                        <p className="text-sm text-gray-500">ETD: {rate.etd} days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          Rp {rate.cost.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tracking */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Track Your Package</h2>
            
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., TK123456789)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingTracking}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingTracking ? 'Tracking...' : 'Track Package'}
              </button>
            </form>

            {/* Tracking Results */}
            {trackingResult && (
              <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-bold text-gray-900">{trackingResult.trackingNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                        {trackingResult.status}
                      </span>
                    </div>
                  </div>
                </div>

                {trackingResult.history && trackingResult.history.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Tracking History:</h3>
                    <div className="space-y-3">
                      {trackingResult.history.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.status}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            {item.city && (
                              <p className="text-sm text-gray-500 mt-1">📍 {item.city}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(item.date).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
