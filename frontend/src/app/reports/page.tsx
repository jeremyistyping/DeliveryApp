'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { reports } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'cod' | 'shipping' | 'returns'>('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  // Report Data
  const [salesData, setSalesData] = useState<any>(null);
  const [codData, setCodData] = useState<any>(null);
  const [shippingData, setShippingData] = useState<any>(null);
  const [returnsData, setReturnsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [activeTab, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      switch (activeTab) {
        case 'sales':
          const salesRes = await reports.sales(params);
          setSalesData(salesRes.data.data);
          break;
        case 'cod':
          const codRes = await reports.cod(params);
          setCodData(codRes.data.data);
          break;
        case 'shipping':
          const shippingRes = await reports.shipping(params);
          setShippingData(shippingRes.data.data);
          break;
        case 'returns':
          const returnsRes = await reports.returns(params);
          setReturnsData(returnsRes.data.data);
          break;
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {salesData?.totalOrders || 0}
          </p>
          <p className="text-sm text-green-600 mt-1">+12% from last period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            Rp {(salesData?.totalRevenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-green-600 mt-1">+8% from last period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            Rp {(salesData?.avgOrderValue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-red-600 mt-1">-3% from last period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {salesData?.completedOrders || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {salesData?.completionRate || 0}% completion rate
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
        <div className="space-y-3">
          {salesData?.ordersByStatus?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700">{item.status}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-md">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${(item.count / (salesData?.totalOrders || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCODReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Total COD Amount</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            Rp {(codData?.totalAmount || 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Collected</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            Rp {(codData?.collected || 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            Rp {(codData?.pending || 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Settled</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            Rp {(codData?.settled || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">COD Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Count</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Pending</td>
                <td className="py-3 px-4 text-right font-medium">{codData?.counts?.pending || 0}</td>
                <td className="py-3 px-4 text-right font-medium">
                  Rp {(codData?.pending || 0).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-gray-600">Collected</td>
                <td className="py-3 px-4 text-right font-medium">{codData?.counts?.collected || 0}</td>
                <td className="py-3 px-4 text-right font-medium">
                  Rp {(codData?.collected || 0).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">Settled</td>
                <td className="py-3 px-4 text-right font-medium">{codData?.counts?.settled || 0}</td>
                <td className="py-3 px-4 text-right font-medium">
                  Rp {(codData?.settled || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderShippingReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Total Shipments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {shippingData?.totalShipments || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Shipping Cost</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            Rp {(shippingData?.totalCost || 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Avg Cost per Shipment</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            Rp {(shippingData?.avgCost || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Courier</h3>
        <div className="space-y-3">
          {shippingData?.byCourier?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-20 font-medium text-gray-900">{item.courier}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-md">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${(item.count / (shippingData?.totalShipments || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{item.count} orders</div>
                <div className="text-xs text-gray-500">
                  Rp {(item.totalCost || 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReturnsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Total Returns</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {returnsData?.totalReturns || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Return Rate</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {returnsData?.returnRate || 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {returnsData?.approved || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Rejected</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {returnsData?.rejected || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Return Reasons</h3>
        <div className="space-y-3">
          {returnsData?.topReasons?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.reason || 'Other'}</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.count / (returnsData?.totalReturns || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-500">
                  {((item.count / (returnsData?.totalReturns || 1)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">View detailed reports and insights</p>
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
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadReportData}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Sales Report
            </button>
            <button
              onClick={() => setActiveTab('cod')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'cod'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 COD Report
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🚚 Shipping Report
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'returns'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Returns Report
            </button>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading report...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'sales' && renderSalesReport()}
            {activeTab === 'cod' && renderCODReport()}
            {activeTab === 'shipping' && renderShippingReport()}
            {activeTab === 'returns' && renderReturnsReport()}
          </>
        )}
      </div>
    </div>
  );
}
