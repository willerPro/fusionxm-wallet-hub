
import React from 'react';
import { QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  walletAddress: string;
  coinType: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ walletAddress, coinType }) => {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setHasCopied(true);
    toast({
      title: "Address Copied",
      description: "TRC20 address has been copied to clipboard.",
    });
    
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <Card className="border-2 border-dashed p-4">
      <CardContent className="flex flex-col items-center pt-6 space-y-4">
        <div className="p-4 bg-white border rounded-lg">
          {/* Simple QR code visualization using the lucide icon */}
          <QrCode size={160} />
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold">{coinType} TRC20 Address</h3>
          <p className="text-xs text-gray-500 mt-1 break-all">
            {walletAddress}
          </p>
        </div>
        
        <Button 
          variant="outline"
          className="w-full"
          onClick={copyAddressToClipboard}
        >
          {hasCopied ? "Copied!" : "Copy Address"}
        </Button>
        
        <div className="bg-blue-50 p-3 rounded-md w-full">
          <p className="text-sm text-blue-700">
            Send only {coinType} to this address. Sending any other coin may result in permanent loss.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
