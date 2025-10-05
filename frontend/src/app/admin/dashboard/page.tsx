'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Package,
  Users,
  Settings,
  TrendingUp,
  LogOut,
  Shield,
  UserCog,
  BarChart3,
  FileText,
  Bell,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isMainAdmin = user?.role === 'MAIN_ADMIN';
  const isGeneralAdmin = user?.role === 'GENERAL_ADMIN';

  // Stats data
  const stats = [
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+12.5%',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Users',
      value: '856',
      change: '+8.2%',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Revenue',
      value: 'Rp 45.2M',
      change: '+15.3%',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Deliveries Today',
      value: '127',
      change: '+5.1%',
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', status: 'IN_TRANSIT', amount: 'Rp 150,000' },
    { id: 'ORD-002', customer: 'Jane Smith', status: 'DELIVERED', amount: 'Rp 200,000' },
    { id: 'ORD-003', customer: 'Bob Wilson', status: 'PENDING', amount: 'Rp 300,000' },
    { id: 'ORD-004', customer: 'Alice Brown', status: 'CONFIRMED', amount: 'Rp 175,000' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-200">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-600">
                {isMainAdmin ? 'Main Administrator' : 'General Administrator'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Orders</span>
            </button>

            {isMainAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'users'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">All Users</span>
                </button>

                <button
                  onClick={() => setActiveTab('admins')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'admins'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserCog className="h-5 w-5" />
                  <span className="font-medium">Admin Management</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'reports'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Reports</span>
            </button>

            {isMainAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </button>
            )}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-primary text-white p-2 rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'orders' && 'Order Management'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'admins' && 'Admin Management'}
                {activeTab === 'reports' && 'Reports & Analytics'}
                {activeTab === 'settings' && 'System Settings'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isMainAdmin ? 'Full system access' : 'Operational access'}
              </p>
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {order.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && isMainAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <Button className="bg-primary hover:bg-primary/90">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
              <p className="text-gray-600">User management interface will be displayed here.</p>
              <p className="text-sm text-gray-500 mt-2">Only Main Admins can access this section.</p>
            </div>
          )}

          {activeTab === 'admins' && isMainAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserCog className="h-4 w-4 mr-2" />
                  Add New Admin
                </Button>
              </div>
              <p className="text-gray-600">Admin rights and permissions management.</p>
              <p className="text-sm text-gray-500 mt-2">Only Main Admins can manage admin accounts.</p>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h3>
              <p className="text-gray-600">
                {isGeneralAdmin ? 'Manage and process orders.' : 'Full order management and oversight.'}
              </p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
              <p className="text-gray-600">View detailed reports and analytics.</p>
            </div>
          )}

          {activeTab === 'settings' && isMainAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">Configure system-wide settings.</p>
              <p className="text-sm text-gray-500 mt-2">Only Main Admins can modify system settings.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
