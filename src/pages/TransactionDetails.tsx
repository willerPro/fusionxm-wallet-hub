
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Separator } from "@/components/ui/separator";

interface TransactionDetails {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  status: string;
  created_at: string;
  wallet_name: string;
  wallet_currency: string;
}

const TransactionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTransactionDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            wallets (
              name,
              currency
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast("Transaction not found", {
            description: "The requested transaction could not be found."
          });
          navigate('/dashboard');
          return;
        }

        setTransaction({
          id: data.id,
          type: data.type as "deposit" | "withdrawal",
          amount: data.amount,
          status: data.status,
          created_at: data.created_at,
          wallet_name: data.wallets?.name || 'Unknown',
          wallet_currency: data.wallets?.currency || 'USD'
        });
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast("Error loading transaction", {
          description: "There was a problem loading the transaction details."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id, navigate, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-4 max-w-xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-medium mb-2">Transaction Not Found</h2>
              <p className="text-gray-500 mb-4">The transaction you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
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
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Transaction ID</p>
            <p className="font-mono text-sm truncate max-w-[180px]">{transaction.id}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Type</p>
            <span className={`capitalize ${transaction.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
              {transaction.type}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Amount</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: transaction.wallet_currency 
              }).format(transaction.amount)}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Status</p>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Wallet</p>
            <p>{transaction.wallet_name}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Date</p>
            <p>{formatDate(transaction.created_at)}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between pt-2">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-xs">{new Date(transaction.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <CreditCard className="h-4 w-4 mr-1" />
              <span className="text-xs">{transaction.wallet_currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;
