
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BalanceCard from "@/components/dashboard/BalanceCard";
import RecentActivityItem, { Activity } from "@/components/dashboard/RecentActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Wallet } from "@/components/wallet/WalletCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch wallets
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (walletsError) throw walletsError;
        
        const transformedWallets = walletsData.map((wallet: any) => ({
          id: wallet.id,
          name: wallet.name,
          balance: parseFloat(wallet.balance || 0),
          currency: wallet.currency,
        }));
        
        setWallets(transformedWallets);
        
        // Calculate total balance
        const total = transformedWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        setTotalBalance(total);
        
        // For demo, we'll set invested amount as 80% of total balance
        setTotalInvested(total * 0.8);
        
        // Fetch recent transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*, wallets(*)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (transactionsError) throw transactionsError;
        
        // Transform transactions to activities
        const transformedActivities = transactionsData.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type as Activity['type'],
          amount: parseFloat(transaction.amount),
          description: `${transaction.type === 'deposit' ? 'Deposit to' : 'Withdrawal from'} ${transaction.wallets.name}`,
          date: new Date(transaction.created_at),
        }));
        
        setActivities(transformedActivities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <BalanceCard 
          title="Total Balance" 
          amount={totalBalance} 
          change={2.4} 
          changeType="positive" 
        />
        <BalanceCard 
          title="Total Invested" 
          amount={totalInvested} 
          change={1.2} 
          changeType="positive" 
        />
      </div>

      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-medium">My Wallets</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary flex items-center"
          onClick={() => navigate("/wallets")}
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {wallets.length > 0 ? (
          wallets.slice(0, 2).map((wallet) => (
            <Card 
              key={wallet.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/wallets?selected=${wallet.id}`)}
            >
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-primary">{wallet.name}</h3>
                <p className="mt-1 text-xl font-semibold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Button 
            variant="outline" 
            className="border-dashed border-2 py-8 flex items-center justify-center"
            onClick={() => navigate("/wallets")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Wallet
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button 
              variant="ghost"
              size="sm"
              className="text-primary"
            >
              See All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No recent activities</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
