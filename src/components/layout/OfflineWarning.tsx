
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';

const OfflineWarning: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4">
      <Alert variant="destructive" className="max-w-md">
        <WifiOff className="h-5 w-5 mr-2" />
        <AlertTitle className="text-xl">No Internet Connection</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">You are currently offline. Please check your connection and try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full"
          >
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineWarning;
