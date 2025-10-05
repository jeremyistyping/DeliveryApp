'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { orders } from '@/lib/api';
import { Package, Upload, Printer, Eye, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', page, statusFilter],
    queryFn: () => orders.list({ page, status: statusFilter || undefined }).then(res => res.data),
  });

  const handlePrintLabel = async (orderId: string, orderNumber: string) => {
    try {
      const response = await orders.generateLabel(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `label-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Label downloaded! Print count updated.');
      refetch();
    } catch (error) {
      toast.error('Failed to generate label');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
      DELIVERED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Manage your shipping orders</p>
            </div>
            <div className="flex space-x-3">
              <Button asChild variant="outline">
                <Link href="/orders/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Link>
              </Button>
              <Button asChild>
                <Link href="/orders/create">
                  <Package className="h-4 w-4 mr-2" />
                  Create Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first order</p>
              <Button asChild>
                <Link href="/orders/create">Create Order</Link>
              </Button>
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
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Print Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-500">{order.trackingNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.recipientName}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {order.recipientCity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.courier} - {order.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Printer className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={order.printCount > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                            {order.printCount}x
                          </span>
                        </div>
                        {order.lastPrintedAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(order.lastPrintedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintLabel(order.id, order.orderNumber)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{data.pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
