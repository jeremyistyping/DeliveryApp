'use client';

import { useState } from 'react';
import { Package, MapPin, CheckCircle, Clock, TruckIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shipping } from '@/lib/api';
import toast from 'react-hot-toast';

interface TrackingHistory {
  status: string;
  description: string;
  date: string;
  city?: string;
}

interface TrackingData {
  trackingNumber: string;
  orderNumber: string;
  status: string;
  courier: string;
  service: string;
  recipientName: string;
  recipientCity: string;
  createdAt: string;
  history: TrackingHistory[];
}

export default function OrderTracking({ orderId, trackingNumber: initialTracking }: { orderId?: string; trackingNumber?: string }) {
  const [trackingNumber, setTrackingNumber] = useState(initialTracking || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const handleTrack = async () => {
    if (!trackingNumber && !orderId) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (orderId) {
        response = await shipping.trackByOrder(orderId);
      } else {
        response = await shipping.trackByNumber(trackingNumber);
      }
      
      setTrackingData(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch tracking information');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (statusLower.includes('transit') || statusLower.includes('delivery')) {
      return <TruckIcon className="h-6 w-6 text-blue-500" />;
    } else if (statusLower.includes('picked')) {
      return <Package className="h-6 w-6 text-orange-500" />;
    } else {
      return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'text-green-600 bg-green-50';
    if (statusLower.includes('transit') || statusLower.includes('delivery')) return 'text-blue-600 bg-blue-50';
    if (statusLower.includes('picked')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {!orderId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Track Your Order</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., JNE123456789)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <Button onClick={handleTrack} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Tracking...' : 'Track'}
            </Button>
          </div>
        </div>
      )}

      {/* Auto track if orderId provided */}
      {orderId && !trackingData && !loading && (
        <div className="text-center py-4">
          <Button onClick={handleTrack}>Load Tracking Information</Button>
        </div>
      )}

      {/* Tracking Information */}
      {trackingData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Tracking Number</div>
                <div className="text-2xl font-bold">{trackingData.trackingNumber}</div>
                <div className="text-sm mt-1 opacity-90">Order: {trackingData.orderNumber}</div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusColor(trackingData.status)}`}>
                  {trackingData.status.replace(/_/g, ' ')}
                </div>
                <div className="text-sm mt-2 opacity-90">
                  {trackingData.courier} - {trackingData.service}
                </div>
              </div>
            </div>
          </div>

          {/* Shipment Info */}
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Recipient</div>
              <div className="font-medium">{trackingData.recipientName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Destination</div>
              <div className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {trackingData.recipientCity}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Shipment History</h4>
            
            {trackingData.history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No tracking history available yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Items */}
                <div className="space-y-6">
                  {trackingData.history.map((item, index) => (
                    <div key={index} className="relative flex items-start pl-12">
                      {/* Timeline Dot */}
                      <div className="absolute left-0 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'ring-4 ring-primary ring-opacity-20' : ''
                        }`}>
                          {getStatusIcon(item.status)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.description}</div>
                            {item.city && (
                              <div className="text-sm text-gray-600 mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.city}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                            {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !trackingData && trackingNumber && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Enter a tracking number to see shipment details</p>
        </div>
      )}
    </div>
  );
}
