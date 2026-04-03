import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || "token";
  const userKey = import.meta.env.VITE_USER_STORAGE_KEY || "user";

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    const savedUser = localStorage.getItem(userKey);

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [tokenKey, userKey]);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data;

    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
    setUser(user);

    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      setUser(null);
    }
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => user?.roles?.includes(role));
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some((permission) =>
      user?.permissions?.includes(permission),
    );
  };

  const getDashboardRoute = () => {
    if (!user?.roles?.length) return "/dashboard";

    const role = user.roles[0]; // Primary role
    switch (role) {
      case "Admin":
        return "/admin/dashboard";
      case "Data Clerk":
        return "/clerk/dashboard";
      case "Physician":
        return "/physician/dashboard";
      case "Pharmacist":
        return "/pharmacist/dashboard";
      case "Drug Supplier":
        return "/supplier/dashboard";
      default:
        return "/dashboard";
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    getDashboardRoute,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
