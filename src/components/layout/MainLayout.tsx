
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    const publicRoutes = ["/login", "/signup", "/"];
    
    if (!user && !publicRoutes.includes(location.pathname)) {
      navigate("/login");
    }
  }, [navigate, location.pathname]);
  
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Header />
      <main className={`flex-1 ${!isAuthPage ? "pb-16" : ""}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
