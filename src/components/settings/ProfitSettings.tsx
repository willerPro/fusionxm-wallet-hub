
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet, TrendingUp, Activity, Users, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Wallet as WalletType } from "@/types/wallet";

interface UserStats {
  totalBalance: number;
  totalProfit: number;
  activeActivities: number;
  totalInvestors: number;
  totalBots: number;
  memberSince: string;
}

interface ProfitSettingsProps {
  onBack: () => void;
}

const ProfitSettings = ({ onBack }: ProfitSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBalance: 0,
    totalProfit: 0,
    activeActivities: 0,
    totalInvestors: 0,
    totalBots: 0,
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setStats(prev => ({
          ...prev,
          memberSince: new Date(profileData.created_at).toLocaleDateString()
        }));
      }

      // Fetch wallets
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (walletsData) {
        setWallets(walletsData);
        const totalBalance = walletsData.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
        setStats(prev => ({ ...prev, totalBalance }));
      }

      // Fetch activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('current_profit')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (activitiesData) {
        const totalProfit = activitiesData.reduce((sum, activity) => sum + (activity.current_profit || 0), 0);
        setStats(prev => ({ 
          ...prev, 
          totalProfit,
          activeActivities: activitiesData.length 
        }));
      }

      // Fetch investors
      const { data: investorsData } = await supabase
        .from('investors')
        .select('id')
        .eq('user_id', user.id);

      if (investorsData) {
        setStats(prev => ({ ...prev, totalInvestors: investorsData.length }));
      }

      // Fetch bots
      const { data: botsData } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'running');

      if (botsData) {
        setStats(prev => ({ ...prev, totalBots: botsData.length }));
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName || '';
    const last = lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">User Profile & Statistics</h2>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'User Profile'
                }
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Member since: {stats.memberSince}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Active User</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Activities</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.activeActivities}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Wallets</p>
                <p className="text-2xl font-bold text-orange-600">
                  {wallets.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalInvestors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.totalBots}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Detail */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{wallet.name}</h4>
                    <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(wallet.balance || 0)}</p>
                    {wallet.password_protected && (
                      <Badge variant="secondary" className="text-xs">Protected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfitSettings;
