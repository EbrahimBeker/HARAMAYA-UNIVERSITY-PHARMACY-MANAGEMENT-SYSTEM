import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Pill, Lock, User, Database, CheckCircle } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ api: false, db: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        setSystemStatus({ api: true, db: true });
      }
    } catch (error) {
      setSystemStatus({ api: false, db: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Pill size={48} className="text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Haramaya Pharmacy</h1>
          <p className="text-gray-600">Management System</p>
          
          {/* System Status */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className={`flex items-center gap-1 ${systemStatus.api ? 'text-green-600' : 'text-red-600'}`}>
              <CheckCircle size={14} />
              <span>API {systemStatus.api ? 'Online' : 'Offline'}</span>
            </div>
            <div className={`flex items-center gap-1 ${systemStatus.db ? 'text-green-600' : 'text-red-600'}`}>
              <Database size={14} />
              <span>MySQL {systemStatus.db ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              className="form-input"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="w-full btn btn-primary py-3 text-base font-semibold"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600 font-medium">Default Login Credentials</p>
            <p className="text-xs text-gray-500 mt-1">Username: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin</span></p>
            <p className="text-xs text-gray-500">Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123</span></p>
          </div>
          <div className="text-center text-xs text-gray-500">
            <p>© 2026 Haramaya University</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
