
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BalanceCard from "@/components/dashboard/BalanceCard";
import RecentActivityItem, { Activity } from "@/components/dashboard/RecentActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "deposit",
        amount: 1500,
        description: "Deposit to Investment Wallet",
        date: new Date(2025, 4, 1),
      },
      {
        id: "2",
        type: "investment",
        amount: 1000,
        description: "Growth Portfolio Investment",
        date: new Date(2025, 4, 1),
      },
      {
        id: "3",
        type: "withdrawal",
        amount: 500,
        description: "Withdrawal to Bank Account",
        date: new Date(2025, 3, 29),
      },
    ];
    setActivities(mockActivities);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <BalanceCard 
          title="Total Balance" 
          amount={15000} 
          change={2.4} 
          changeType="positive" 
        />
        <BalanceCard 
          title="Total Invested" 
          amount={12000} 
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
        <Button 
          variant="outline" 
          className="border-dashed border-2 py-8 flex items-center justify-center"
          onClick={() => navigate("/wallets")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Wallet
        </Button>
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
