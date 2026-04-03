import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  Pill,
  Lock,
  User,
  Database,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ api: false, db: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");
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
      const result = await login(credentials);
      toast.success("Welcome back! Login successful");

      // Role-based redirection
      const user = result.user;
      if (user?.roles?.length > 0) {
        const primaryRole = user.roles[0];
        switch (primaryRole) {
          case "Admin":
            navigate("/admin/dashboard");
            break;
          case "Data Clerk":
            navigate("/clerk/dashboard");
            break;
          case "Physician":
            navigate("/physician/dashboard");
            break;
          case "Pharmacist":
            navigate("/pharmacist/dashboard");
            break;
          case "Drug Supplier":
            navigate("/supplier/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Simple dot pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(156, 146, 172, 0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                      <Pill size={40} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles
                        size={16}
                        className="text-yellow-300 animate-pulse"
                      />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Haramaya Pharmacy
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Management System
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <Shield size={14} className="text-green-300" />
                    <span className="text-white text-sm font-medium">
                      Secure Access
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              {/* System Status */}
              <div className="mb-6 flex items-center justify-center gap-6">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.api
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <Activity size={14} />
                  <span>API {systemStatus.api ? "Online" : "Offline"}</span>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    systemStatus.db
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <Database size={14} />
                  <span>
                    Database {systemStatus.db ? "Connected" : "Offline"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={16} className="text-blue-600" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      value={credentials.username}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          username: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Lock size={16} className="text-blue-600" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                    <Shield size={16} className="text-blue-600" />
                    Demo Credentials
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-white/50">
                      <p className="text-gray-600 font-medium">Username</p>
                      <p className="font-mono font-bold text-blue-700">admin</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-white/50">
                      <p className="text-gray-600 font-medium">Password</p>
                      <p className="font-mono font-bold text-blue-700">
                        admin123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-center text-xs text-gray-500">
                <p className="font-medium">© 2026 Haramaya University</p>
                <p className="mt-1">Pharmacy Management System v2.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
