import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fade-in">
        <div className="min-h-[calc(100vh-8rem)]">
          <Outlet />
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
      </div>
    </div>
  );
};

export default Layout;
