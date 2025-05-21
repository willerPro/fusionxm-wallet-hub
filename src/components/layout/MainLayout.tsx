
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import OfflineWarning from "./OfflineWarning";
import { useAuth } from "../auth/AuthContext";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Only redirect after auth has finished loading
    if (!loading) {
      const publicRoutes = ["/login", "/signup", "/"];
      const currentPath = location.pathname;
      
      // If not authenticated and trying to access protected route, redirect to login
      if (!user && !publicRoutes.includes(currentPath)) {
        navigate("/login");
      }
      
      // If authenticated and trying to access login/signup, redirect to dashboard
      if (user && (currentPath === "/login" || currentPath === "/signup")) {
        navigate("/dashboard");
      }
    }
  }, [navigate, location.pathname, user, loading]);
  
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <OfflineWarning />
      <Header />
      <main className={`flex-1 ${!isAuthPage ? "pb-16" : ""}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
