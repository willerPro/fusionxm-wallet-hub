import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, User, Mail, Phone, MapPin, CreditCard, Trash2 } from "lucide-react";
import { Investor } from "./InvestorCard";
import { KycData } from "@/pages/Investors";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface InvestorDetailsProps {
  investor: Investor;
  kycData?: KycData;
  onBack: () => void;
  onDelete: (investorId: string) => void;
}

interface WalletData {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

const InvestorDetails = ({ investor, kycData, onBack, onDelete }: InvestorDetailsProps) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestorWallets();
  }, [investor.id]);

  const fetchInvestorWallets = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching wallets for investor:", investor.id);
      
      // First get the investor record to find the user_id
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('user_id')
        .eq('id', investor.id)
        .single();
      
      if (investorError) {
        console.error("Error fetching investor data:", investorError);
        setWallets([]);
        return;
      }

      if (!investorData?.user_id) {
        console.log("No user_id found for investor");
        setWallets([]);
        return;
      }

      console.log("Found user_id:", investorData.user_id);

      // Now fetch wallets using the user_id
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name, balance, currency')
        .eq('user_id', investorData.user_id);
      
      if (error) {
        console.error("Error fetching wallets:", error);
        setWallets([]);
        return;
      }

      console.log("Fetched wallets:", data);
      setWallets(data || []);
    } catch (error) {
      console.error("Error in fetchInvestorWallets:", error);
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('investors')
        .delete()
        .eq('id', investor.id);
      
      if (error) throw error;
      
      toast({
        title: "Investor deleted",
        description: `${investor.fullName} has been deleted successfully.`,
      });
      
      onDelete(investor.id);
      onBack();
    } catch (error) {
      console.error("Error deleting investor:", error);
      toast({
        title: "Error deleting investor",
        description: "There was a problem deleting the investor.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Investor Details</h2>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Name:</span>
            <span>{investor.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Email:</span>
            <span>{investor.email || "No email provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Phone:</span>
            <span>{investor.phone || "No phone provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Type:</span>
            <span className="capitalize">{investor.investorType}</span>
          </div>
        </CardContent>
      </Card>

      {/* KYC Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            KYC Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kycData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Username:</span>
                <span>{kycData.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Full Names:</span>
                <span>{kycData.full_names}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Identity Type:</span>
                <span className="capitalize">{kycData.identity_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Identity Number:</span>
                <span>{kycData.identity_number}</span>
              </div>
              {kycData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Location:</span>
                  <span>{kycData.location}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No KYC information available yet</p>
          )}
        </CardContent>
      </Card>

      {/* Wallets Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : wallets.length > 0 ? (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-gray-500">{wallet.currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{wallet.balance.toFixed(2)} {wallet.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No wallet information available yet</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the investor "{investor.fullName}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvestorDetails;
