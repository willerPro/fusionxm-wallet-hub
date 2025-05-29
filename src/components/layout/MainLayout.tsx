
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
      
      if (!user && !publicRoutes.includes(location.pathname)) {
        console.log("No user detected, redirecting to login");
        navigate("/login");
      }
    }
  }, [navigate, location.pathname, user, loading]);
  
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  const isChatPage = location.pathname === "/settings" && location.search.includes("support");
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <OfflineWarning />
      {!isAuthPage && <Header />}
      <main className={`flex-1 ${!isAuthPage && !isChatPage ? "pb-16" : ""}`}>
        {children}
      </main>
      {!isAuthPage && !isChatPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
