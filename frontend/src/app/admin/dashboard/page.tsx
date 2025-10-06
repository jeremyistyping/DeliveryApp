'use client';

import { useState, useEffect } from 'react';
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
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  ShieldCheck,
  Ban,
  CheckCircle,
  Save,
  X,
} from 'lucide-react';
import { users as usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    systemName: 'Mengantar Delivery System',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    maintenanceMode: false,
    maxUploadSize: '10',
    sessionTimeout: '60',
    enableRegistration: true,
  });

  const isMainAdmin = user?.role === 'MAIN_ADMIN';
  const isGeneralAdmin = user?.role === 'GENERAL_ADMIN';

  // Fetch users data
  useEffect(() => {
    if (activeTab === 'users' && isMainAdmin) {
      fetchUsers();
      fetchUserStats();
    }
  }, [activeTab, isMainAdmin]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = allUsers;

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [allUsers, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.list();
      setAllUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await usersApi.stats();
      setUserStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user stats');
    }
  };

  const handlePromoteUser = async (userId: string, newRole: string) => {
    try {
      await usersApi.updateRole(userId, { role: newRole });
      toast.success(`User promoted to ${newRole} successfully`);
      setShowPromoteModal(false);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.updateStatus(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
    // In a real app, you would call an API here
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MAIN_ADMIN':
        return 'bg-red-100 text-red-800';
      case 'GENERAL_ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      case 'MERCHANT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <div className="space-y-6">
              {/* User Stats */}
              {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Admins</p>
                        <p className="text-2xl font-bold text-gray-900">{userStats.totalAdmins}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-100 text-red-600">
                        <Shield className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Regular Users</p>
                        <p className="text-2xl font-bold text-gray-900">{userStats.totalRegularUsers}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-100 text-green-600">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Merchants</p>
                        <p className="text-2xl font-bold text-gray-900">{userStats.totalMerchants}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Management Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                  <div className="flex items-center space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    {/* Role Filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="MAIN_ADMIN">Main Admin</option>
                      <option value="GENERAL_ADMIN">General Admin</option>
                      <option value="USER">User</option>
                      <option value="MERCHANT">Merchant</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-primary text-white p-2 rounded-full">
                                  <Users className="h-4 w-4" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {u.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {u.merchant ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  u.merchant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {u.merchant.isActive ? 'Active' : 'Inactive'}
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {u.id !== user?.id && (
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Promote Button */}
                                  {u.role === 'USER' && (
                                    <button
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setShowPromoteModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                      title="Promote User"
                                    >
                                      <ShieldCheck className="h-4 w-4" />
                                    </button>
                                  )}
                                  {/* Toggle Status Button */}
                                  {u.merchant && (
                                    <button
                                      onClick={() => handleToggleUserStatus(u.id, u.merchant.isActive)}
                                      className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded"
                                      title={u.merchant.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                      {u.merchant.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    </button>
                                  )}
                                  {/* Delete Button */}
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                    title="Delete User"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
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
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  General Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      value={settings.systemName}
                      onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxUploadSize}
                        onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive SMS notifications for urgent updates</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.smsNotifications ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & Access */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Access
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Enable User Registration</p>
                      <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, enableRegistration: !settings.enableRegistration })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableRegistration ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableRegistration ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Temporarily disable access for maintenance</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* System Maintenance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  System Maintenance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Automatic Backup</p>
                      <p className="text-sm text-gray-600">Automatically backup database daily</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoBackup ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Clear Cache</p>
                      <p className="text-sm text-gray-600">Clear system cache to improve performance</p>
                    </div>
                    <Button
                      onClick={() => toast.success('Cache cleared successfully!')}
                      variant="outline"
                      className="ml-4"
                    >
                      Clear Now
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Database Backup</p>
                      <p className="text-sm text-red-700">Create a manual backup of the database</p>
                    </div>
                    <Button
                      onClick={() => toast.success('Backup started!')}
                      variant="outline"
                      className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Backup Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => {
                    setSettings({
                      systemName: 'Mengantar Delivery System',
                      emailNotifications: true,
                      smsNotifications: false,
                      autoBackup: true,
                      maintenanceMode: false,
                      maxUploadSize: '10',
                      sessionTimeout: '60',
                      enableRegistration: true,
                    });
                    toast.success('Settings reset to default');
                  }}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
                <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Promote User Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promote User</h3>
            <p className="text-gray-600 mb-6">
              Promote <strong>{selectedUser.name}</strong> to a higher role?
            </p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handlePromoteUser(selectedUser.id, 'GENERAL_ADMIN')}
                className="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">General Admin</p>
                  <p className="text-sm text-gray-600">Operational access for managing deliveries</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </button>
              <button
                onClick={() => handlePromoteUser(selectedUser.id, 'MAIN_ADMIN')}
                className="w-full flex items-center justify-between p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">Main Admin</p>
                  <p className="text-sm text-gray-600">Full system access including user management</p>
                </div>
                <Shield className="h-6 w-6 text-red-600" />
              </button>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone. All user data will be permanently removed.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
