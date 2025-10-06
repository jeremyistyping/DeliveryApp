'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cod } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CODPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [codRecords, setCodRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadCODData();
  }, [filterStatus]);

  const loadCODData = async () => {
    setLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        cod.list({ status: filterStatus === 'ALL' ? undefined : filterStatus }),
        cod.summary(),
      ]);
      
      setCodRecords(recordsRes.data.data || []);
      setSummary(summaryRes.data.data || {});
    } catch (error: any) {
      console.error('Error loading COD data:', error);
      toast.error('Failed to load COD data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (codId: string, newStatus: string) => {
    try {
      await cod.updateStatus(codId, { status: newStatus });
      toast.success('Status updated successfully!');
      loadCODData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleBulkSettle = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one COD record');
      return;
    }

    try {
      await cod.bulkSettle(selectedIds);
      toast.success(`${selectedIds.length} COD records settled successfully!`);
      setSelectedIds([]);
      loadCODData();
    } catch (error: any) {
      console.error('Error settling CODs:', error);
      toast.error(error.response?.data?.error || 'Failed to settle CODs');
    }
  };

  const toggleSelection = (codId: string) => {
    setSelectedIds(prev =>
      prev.includes(codId)
        ? prev.filter(id => id !== codId)
        : [...prev, codId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === codRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(codRecords.map(record => record.id));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COLLECTED: 'bg-blue-100 text-blue-800',
      REMITTED: 'bg-purple-100 text-purple-800',
      SETTLED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl font-bold text-gray-900">COD Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage cash on delivery payments</p>
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
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    Rp {(summary.totalPending || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    Rp {(summary.totalCollected || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Remitted</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    Rp {(summary.totalRemitted || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">📤</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Settled</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    Rp {(summary.totalSettled || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COLLECTED">Collected</option>
                <option value="REMITTED">Remitted</option>
                <option value="SETTLED">Settled</option>
              </select>
              
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkSettle}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Settle Selected ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* COD Records Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading COD records...</p>
              </div>
            </div>
          ) : codRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-gray-600">No COD records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === codRecords.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelection(record.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.order?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.order?.recipientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          Rp {record.amount.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Created: {new Date(record.createdAt).toLocaleDateString('id-ID')}</div>
                        {record.collectedAt && (
                          <div>Collected: {new Date(record.collectedAt).toLocaleDateString('id-ID')}</div>
                        )}
                        {record.settledAt && (
                          <div>Settled: {new Date(record.settledAt).toLocaleDateString('id-ID')}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(record.id, 'COLLECTED')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark Collected
                          </button>
                        )}
                        {record.status === 'COLLECTED' && (
                          <button
                            onClick={() => handleStatusUpdate(record.id, 'REMITTED')}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Mark Remitted
                          </button>
                        )}
                        {record.status === 'REMITTED' && (
                          <button
                            onClick={() => handleStatusUpdate(record.id, 'SETTLED')}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Mark Settled
                          </button>
                        )}
                        {record.status === 'SETTLED' && (
                          <span className="text-gray-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
