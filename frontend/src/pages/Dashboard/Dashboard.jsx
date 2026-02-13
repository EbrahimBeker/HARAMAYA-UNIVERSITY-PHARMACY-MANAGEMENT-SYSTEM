import { useAuth } from '../../context/AuthContext';
import { Pill, Users, Package, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Medicines', value: '0', icon: Pill, color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: '0', icon: TrendingUp, color: 'bg-red-500' },
    { title: 'Total Suppliers', value: '0', icon: Package, color: 'bg-green-500' },
    { title: 'Active Users', value: '0', icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your pharmacy today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
            <div className={`${stat.color} bg-opacity-10 p-4 rounded-xl`}>
              <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-12 text-gray-500">
            <p>No recent activity</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary">Add Medicine</button>
            <button className="w-full btn btn-secondary">Add Supplier</button>
            <button className="w-full btn btn-success">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
