
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, Settings, Users, Activity } from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Wallets", path: "/wallets", icon: Wallet },
    { name: "Investors", path: "/investors", icon: Users },
    { name: "Activities", path: "/activities", icon: Activity },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-secondary">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-1/5 h-full ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-500"}`} />
              <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>{item.name}</span>
              {isActive && (
                <div className="absolute top-0 w-1/5 h-1 bg-primary rounded-b-md"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
