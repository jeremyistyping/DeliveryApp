'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { returns } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReturnsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [returnRecords, setReturnRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    orderId: '',
    reason: '',
  });

  useEffect(() => {
    loadReturnsData();
  }, [filterStatus]);

  const loadReturnsData = async () => {
    setLoading(true);
    try {
      const [returnsRes, statsRes] = await Promise.all([
        returns.list({ status: filterStatus === 'ALL' ? undefined : filterStatus }),
        returns.stats(),
      ]);
      
      setReturnRecords(returnsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error: any) {
      console.error('Error loading returns data:', error);
      toast.error('Failed to load returns data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    try {
      await returns.updateStatus(returnId, { status: newStatus });
      toast.success('Status updated successfully!');
      loadReturnsData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await returns.create(newReturn);
      toast.success('Return request created successfully!');
      setShowCreateModal(false);
      setNewReturn({ orderId: '', reason: '' });
      loadReturnsData();
    } catch (error: any) {
      console.error('Error creating return:', error);
      toast.error(error.response?.data?.error || 'Failed to create return');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
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
                <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage return requests and processing</p>
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
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requested</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {stats.requested || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {stats.approved || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {stats.rejected || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {stats.inProgress || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {stats.completed || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">✔️</span>
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
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              + New Return Request
            </button>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading returns...</p>
              </div>
            </div>
          ) : returnRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📦</span>
              <p className="mt-4 text-gray-600">No return requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {returnRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.order?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.order?.recipientName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.requestedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {record.status === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'APPROVED')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {record.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusUpdate(record.id, 'IN_PROGRESS')}
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Start Processing
                            </button>
                          )}
                          {record.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleStatusUpdate(record.id, 'COMPLETED')}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Complete
                            </button>
                          )}
                          {(record.status === 'COMPLETED' || record.status === 'REJECTED') && (
                            <span className="text-gray-400">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Return Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">New Return Request</h2>
              
              <form onSubmit={handleCreateReturn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={newReturn.orderId}
                    onChange={(e) => setNewReturn({ ...newReturn, orderId: e.target.value })}
                    placeholder="Enter order ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason
                  </label>
                  <textarea
                    value={newReturn.reason}
                    onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value })}
                    placeholder="Describe the reason for return..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewReturn({ orderId: '', reason: '' });
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Create Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
