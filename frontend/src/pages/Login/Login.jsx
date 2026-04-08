import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Pill,
  Lock,
  User,
  Database,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [systemStatus, setSystemStatus] = useState({ api: false, db: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/health");
      if (response.status === 200) {
        setSystemStatus({ api: true, db: true });
      }
    } catch (error) {
      setSystemStatus({ api: false, db: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setLoading(true);

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const result = await login(credentials);
      toast.success("Welcome back! Login successful");

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
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage =
          "Unable to connect to server. Please check your connection.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex items-center gap-12">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-1 flex-col justify-center text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-sm font-semibold">
                  Modern Healthcare Management
                </span>
              </div>

              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Haramaya
                </span>
                <br />
                <span className="text-white">Pharmacy</span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-md">
                Streamline your pharmacy operations with our comprehensive
                management system
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">Secure & Reliable</p>
                  <p className="text-sm text-gray-400">
                    Enterprise-grade security
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">Real-time Updates</p>
                  <p className="text-sm text-gray-400">
                    Instant inventory tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">Easy to Use</p>
                  <p className="text-sm text-gray-400">
                    Intuitive interface design
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="relative px-8 py-8 text-center border-b border-white/10">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                      <Pill size={32} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome Back
                </h2>
                <p className="text-gray-300 text-sm">
                  Sign in to continue to your dashboard
                </p>
              </div>

              {/* Form */}
              <div className="px-8 py-8">
                {/* System Status */}
                <div className="mb-6 flex items-center justify-center gap-4">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      systemStatus.api
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    <Activity size={12} />
                    <span>API</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      systemStatus.db
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    <Database size={12} />
                    <span>Database</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 animate-shake">
                      <p className="text-red-300 font-medium text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <User size={16} className="text-blue-400" />
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={credentials.username}
                      onChange={(e) => {
                        setCredentials({
                          ...credentials,
                          username: e.target.value,
                        });
                        if (error) setError("");
                      }}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                      <Lock size={16} className="text-blue-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={credentials.password}
                        onChange={(e) => {
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          });
                          if (error) setError("");
                        }}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 px-6 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-300 mb-3 flex items-center justify-center gap-2">
                      <Shield size={14} className="text-blue-400" />
                      Demo Credentials
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20">
                        <p className="text-gray-400 font-medium mb-1">
                          Username
                        </p>
                        <p className="font-mono font-bold text-blue-300">
                          admin
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20">
                        <p className="text-gray-400 font-medium mb-1">
                          Password
                        </p>
                        <p className="font-mono font-bold text-blue-300">
                          admin123
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
                <div className="text-center text-xs text-gray-400">
                  <p className="font-medium">© 2026 Haramaya University</p>
                  <p className="mt-1">Pharmacy Management System v2.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;
