import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { LogOut, User, Home, Pill, Users, Package, FileText, Wifi, WifiOff } from 'lucide-react';

const Navbar = () => {
  const { user, logout, hasAnyRole } = useAuth();
  const { isConnected } = useConnectionStatus();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
            <Pill size={24} />
            <span className="text-xl font-semibold">Haramaya Pharmacy</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            {hasAnyRole(['System Administrator', 'Pharmacist', 'Data Clerk / Cashier', 'Ward Nurse']) && (
              <Link to="/medicines" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Pill size={18} />
                <span>Medicines</span>
              </Link>
            )}

            {hasAnyRole(['System Administrator', 'Pharmacist']) && (
              <Link to="/suppliers" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Package size={18} />
                <span>Suppliers</span>
              </Link>
            )}

            {hasAnyRole(['System Administrator']) && (
              <Link to="/users" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Users size={18} />
                <span>Users</span>
              </Link>
            )}

            {hasAnyRole(['System Administrator', 'Pharmacist', 'Data Clerk / Cashier', 'Drug Supplier']) && (
              <Link to="/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <FileText size={18} />
                <span>Reports</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span>{isConnected ? 'Connected' : 'Offline'}</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2 text-sm">
                <User size={18} />
                <span>{user?.full_name}</span>
                <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                  {user?.roles?.[0]}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
