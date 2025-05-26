
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Investor } from "./InvestorCard";
import { KycData } from "@/pages/Investors";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface InvestorDetailsProps {
  investor: Investor;
  kycData?: KycData;
  onBack: () => void;
}

interface WalletData {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

const InvestorDetails = ({ investor, kycData, onBack }: InvestorDetailsProps) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvestorWallets();
  }, [investor.id]);

  const fetchInvestorWallets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('id, name, balance, currency')
        .eq('user_id', investor.id);
      
      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error("Error fetching investor wallets:", error);
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Investor Details</h2>
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
    </div>
  );
};

export default InvestorDetails;
