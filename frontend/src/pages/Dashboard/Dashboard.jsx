import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medicinesAPI, suppliersAPI, usersAPI } from '../../services/api';
import { Pill, Users, Package, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import Loading from '../../components/Common/Loading';

const Dashboard = () => {
  const { user, hasAnyRole } = useAuth();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockItems: 0,
    totalSuppliers: 0,
    activeUsers: 0,
    totalStock: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises = [
        medicinesAPI.getAll({ limit: 1000 }),
        suppliersAPI.getAll({ limit: 1000 })
      ];

      if (hasAnyRole(['System Administrator'])) {
        promises.push(usersAPI.getAll({ limit: 1000 }));
      }

      const responses = await Promise.all(promises);
      
      const medicines = responses[0].data.data || [];
      const suppliers = responses[1].data.data || [];
      const users = responses[2]?.data.data || [];

      // Calculate statistics
      const lowStockCount = medicines.filter(med => 
        (med.quantity_available || 0) <= (med.reorder_level || 10)
      ).length;

      const totalStock = medicines.reduce((sum, med) => sum + (med.quantity_available || 0), 0);

      setStats({
        totalMedicines: medicines.length,
        lowStockItems: lowStockCount,
        totalSuppliers: suppliers.filter(s => s.is_active).length,
        activeUsers: users.filter(u => u.is_active).length,
        totalStock
      });

      // Generate recent activity
      const activities = [];
      if (medicines.length > 0) {
        activities.push({
          id: 1,
          message: `${medicines.length} medicines in inventory with ${totalStock} total units`,
          time: 'Current',
          type: 'info'
        });
      }
      if (lowStockCount > 0) {
        activities.push({
          id: 2,
          message: `${lowStockCount} medicines need restocking`,
          time: 'Alert',
          type: 'warning'
        });
      }
      setRecentActivity(activities);

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: 'Total Medicines', 
      value: stats.totalMedicines.toString(), 
      icon: Pill, 
      color: 'bg-blue-500',
      link: '/medicines',
      show: true
    },
    { 
      title: 'Total Stock Units', 
      value: stats.totalStock.toString(), 
      icon: Package, 
      color: 'bg-purple-500',
      link: '/medicines',
      show: true
    },
    { 
      title: 'Low Stock Items', 
      value: stats.lowStockItems.toString(), 
      icon: TrendingUp, 
      color: 'bg-red-500',
      link: '/medicines',
      show: true
    },
    { 
      title: 'Active Suppliers', 
      value: stats.totalSuppliers.toString(), 
      icon: Package, 
      color: 'bg-green-500',
      link: '/suppliers',
      show: hasAnyRole(['System Administrator', 'Pharmacist'])
    },
    { 
      title: 'Active Users', 
      value: stats.activeUsers.toString(), 
      icon: Users, 
      color: 'bg-indigo-500',
      link: '/users',
      show: hasAnyRole(['System Administrator'])
    },
  ].filter(stat => stat.show);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your pharmacy today.</p>
        <div className="mt-2 flex items-center gap-2">
          <Activity size={16} className="text-green-500" />
          <span className="text-sm text-gray-600">System Status: <span className="text-green-600 font-semibold">Connected to MySQL</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${stat.color} bg-opacity-10 p-4 rounded-xl`}>
              <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
            </div>
            {stat.link && (
              <a 
                href={stat.link} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.type === 'warning' && (
                    <AlertTriangle size={16} className="text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/medicines" className="w-full btn btn-primary block text-center">
              Manage Medicines
            </a>
            <a href="/suppliers" className="w-full btn btn-secondary block text-center">
              Manage Suppliers
            </a>
            {hasAnyRole(['System Administrator']) && (
              <a href="/users" className="w-full btn btn-success block text-center">
                Manage Users
              </a>
            )}
            <a href="/reports" className="w-full btn btn-secondary block text-center">
              View Reports
            </a>
          </div>
        </div>
      </div>

      {stats.lowStockItems > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h3>
              <p className="text-yellow-700">
                {stats.lowStockItems} medicine{stats.lowStockItems > 1 ? 's' : ''} need restocking. 
                <a href="/medicines" className="ml-2 text-yellow-800 underline font-medium">
                  View details →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
