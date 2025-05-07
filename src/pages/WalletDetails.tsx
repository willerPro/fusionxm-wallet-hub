
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Wallet as WalletType } from "@/types/wallet";

const WalletDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWalletDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast("Wallet not found", {
            description: "The requested wallet could not be found."
          });
          navigate('/wallets');
          return;
        }

        setWallet(data as WalletType);
      } catch (error) {
        console.error("Error fetching wallet:", error);
        toast("Error loading wallet", {
          description: "There was a problem loading the wallet details."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletDetails();
  }, [id, navigate, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto p-4 max-w-xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-medium mb-2">Wallet Not Found</h2>
              <p className="text-gray-500 mb-4">The wallet you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/wallets')}>
                Return to Wallets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0"
        onClick={() => navigate('/wallets')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Wallets
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Name</p>
            <p className="font-semibold">{wallet.name}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Balance</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: wallet.currency 
              }).format(wallet.balance)}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Currency</p>
            <p>{wallet.currency}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Type</p>
            <span className="capitalize">{wallet.type}</span>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-center space-x-3 pt-2">
            <Button 
              onClick={() => navigate(`/deposit?wallet=${wallet.id}`)}
              className="flex-1"
            >
              Deposit
            </Button>
            <Button 
              onClick={() => navigate(`/withdraw?wallet=${wallet.id}`)}
              variant="outline" 
              className="flex-1"
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDetails;
