
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServerCrash, ServerOff, Loader } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  if (!isOnline) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <ServerOff className="mx-auto h-16 w-16 text-orange-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Connection Error</h1>
            <p className="text-lg text-gray-600 mb-6">
              Unable to access this page. Please check your internet connection and try again.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-8 max-w-md">
          <Loader className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center p-8 max-w-lg">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Server Under Heavy Load</h1>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-red-500 h-2.5 rounded-full w-[85%] animate-pulse"></div>
          </div>
          <p className="text-gray-600 mb-6">
            We're experiencing high traffic at the moment. Our team is working to scale resources and restore optimal performance.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
