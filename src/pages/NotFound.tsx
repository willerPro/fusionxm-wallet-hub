
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 max-w-lg">
        {!isOnline ? (
          <>
            <h1 className="text-4xl font-bold mb-4">Connection Error</h1>
            <p className="text-xl text-gray-600 mb-4">
              Unable to access this page. Please check your internet connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline">
              Return to Home
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default NotFound;
