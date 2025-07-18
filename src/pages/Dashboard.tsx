
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BalanceCard from "@/components/dashboard/BalanceCard";
import RecentActivityItem from "@/components/dashboard/RecentActivityItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Loader2, ArrowRight, Plus } from "lucide-react";
import { Wallet } from "@/types/wallet";
import { Activity } from "@/types/activity";
import { toast } from "@/components/ui/sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [runningProfit, setRunningProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch wallets for the current user only
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (walletsError) throw walletsError;
        
        // Transform the data to match our Wallet type
        const transformedWallets: Wallet[] = walletsData.map((wallet: any) => ({
          id: wallet.id,
          name: wallet.name,
          balance: parseFloat(wallet.balance || 0),
          currency: wallet.currency,
          passwordProtected: wallet.password_protected || false
        }));
        
        setWallets(transformedWallets);
        
        // Calculate total balance from user's wallets only
        const total = transformedWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        setTotalBalance(total);
        
        // Set running profit to 0 as requested
        setRunningProfit(0);
        
        // Fetch recent activities for the current user
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*, wallets(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (activitiesError) throw activitiesError;
        
        // Transform activities to match our Activity interface
        const transformedActivities = activitiesData.map((activity: any) => ({
          id: activity.id,
          activity_type: activity.activity_type,
          amount: parseFloat(activity.amount || 0),
          created_at: activity.created_at,
          current_profit: activity.current_profit,
          date_added: activity.date_added,
          description: activity.description || `${activity.activity_type} activity`,
          is_active: activity.is_active,
          name: activity.name,
          profit: activity.profit,
          status: activity.status,
          total_earned: activity.total_earned,
          type: activity.type,
          updated_at: activity.updated_at,
          user_id: activity.user_id,
          wallet_id: activity.wallet_id,
        }));
        
        setActivities(transformedActivities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast("Error loading dashboard data. Please try again.");
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
        />
        <BalanceCard 
          title="Running Profit" 
          amount={runningProfit} 
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
