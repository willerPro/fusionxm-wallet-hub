import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2, Trash2, ChevronDown, ChevronUp, StopCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import ActivityForm from "@/components/activity/ActivityForm";
import StopBotDialog from "@/components/activity/StopBotDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Activity {
  id: string;
  activity_type: string | null;
  amount: number;
  created_at: string;
  current_profit: number | null;
  date_added: string | null;
  description: string | null;
  is_active: boolean | null;
  name: string;
  profit: number | null;
  status: string;
  total_earned: number | null;
  type: string;
  updated_at: string;
  user_id: string;
  wallet_id: string | null;
  wallet?: {
    name: string;
    balance: number;
  };
}

const Activities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [stopBotDialog, setStopBotDialog] = useState<{
    isOpen: boolean;
    activity: Activity | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    activity: null,
    isLoading: false,
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchActivities();
  }, [user, navigate]);
  
  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          wallet:wallets(name, balance)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error loading activities",
        description: "There was a problem loading your activities.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (activityData: {
    activity_type: string;
    description: string;
    status: string;
    wallet_id?: string;
    name: string;
    type: string;
    amount?: number;
  }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingActivity) {
        // Update existing activity
        const { data, error } = await supabase
          .from('activities')
          .update({
            activity_type: activityData.activity_type,
            description: activityData.description,
            status: activityData.status,
            wallet_id: activityData.wallet_id || null,
            name: activityData.name,
            type: activityData.type,
            amount: activityData.amount || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingActivity.id)
          .eq('user_id', user.id)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActivities(activities.map(activity => 
            activity.id === editingActivity.id ? data[0] as Activity : activity
          ));
          toast({
            title: "Activity updated",
            description: "Activity has been updated successfully.",
          });
        }
      } else {
        // Create new activity
        const { data, error } = await supabase
          .from('activities')
          .insert([{
            user_id: user.id,
            activity_type: activityData.activity_type,
            description: activityData.description,
            status: activityData.status,
            wallet_id: activityData.wallet_id || null,
            name: activityData.name,
            type: activityData.type,
            amount: activityData.amount || 0,
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActivities([data[0] as Activity, ...activities]);
          toast({
            title: "Activity added",
            description: "New activity has been added successfully.",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error saving activity",
        description: "There was a problem saving the activity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopBot = async (password: string) => {
    if (!user || !stopBotDialog.activity) return;
    
    setStopBotDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Here you would typically verify the password with your authentication system
      // For now, we'll just update the activity status to 'stopped'
      const { data, error } = await supabase
        .from('activities')
        .update({
          status: 'stopped',
          updated_at: new Date().toISOString(),
        })
        .eq('id', stopBotDialog.activity.id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setActivities(activities.map(activity => 
          activity.id === stopBotDialog.activity!.id ? { ...activity, status: 'stopped' } : activity
        ));
        toast({
          title: "Bot stopped",
          description: "The bot activity has been stopped successfully.",
        });
      }
      
      setStopBotDialog({ isOpen: false, activity: null, isLoading: false });
    } catch (error) {
      console.error("Error stopping bot:", error);
      toast({
        title: "Error stopping bot",
        description: "There was a problem stopping the bot activity.",
        variant: "destructive",
      });
    } finally {
      setStopBotDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setActivities(activities.filter(activity => activity.id !== id));
      toast({
        title: "Activity deleted",
        description: "Activity has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error deleting activity",
        description: "There was a problem deleting the activity.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingActivity(null);
    setIsDialogOpen(true);
  };

  const handleStopBotClick = (activity: Activity) => {
    setStopBotDialog({
      isOpen: true,
      activity,
      isLoading: false,
    });
  };

  const toggleRowExpansion = (activityId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(activityId)) {
      newExpandedRows.delete(activityId);
    } else {
      newExpandedRows.add(activityId);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Activities</h2>
        <Button 
          size="icon"
          className="bg-primary hover:bg-primary/90 rounded-full"
          onClick={handleAddNew}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredActivities.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            {isMobile ? (
              // Mobile view with expandable cards
              <div className="space-y-4 p-4">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{activity.activity_type}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'active' ? 'bg-green-100 text-green-800' :
                            activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            activity.status === 'stopped' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(activity.id)}
                        >
                          {expandedRows.has(activity.id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                      
                      <div className="text-2xl font-bold mb-2">
                        <span className={
                          (activity.current_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }>
                          ${(activity.current_profit || 0).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">profit</span>
                      </div>

                      {expandedRows.has(activity.id) && (
                        <div className="space-y-3 mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <div className="font-medium">${(activity.amount || 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Current Profit:</span>
                              <div className="font-medium">${(activity.current_profit || 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Wallet:</span>
                              <div className="font-medium">
                                {activity.wallet ? `${activity.wallet.name} ($${activity.wallet.balance.toFixed(2)})` : 'No wallet'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Date Added:</span>
                              <div className="font-medium">
                                {activity.date_added ? 
                                  new Date(activity.date_added).toLocaleDateString() : 
                                  'Not set'
                                }
                              </div>
                            </div>
                          </div>
                          
                          {activity.description && (
                            <div>
                              <span className="text-gray-500 text-sm">Description:</span>
                              <div className="text-sm">{activity.description}</div>
                            </div>
                          )}
                          
                          <div className="flex space-x-2 pt-2">
                            {activity.status === 'active' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStopBotClick(activity)}
                              >
                                <StopCircle className="h-4 w-4 mr-2" />
                                Stop Bot
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(activity.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop table view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Profit</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow 
                      key={activity.id}
                      className={activity.status === 'active' ? 'animate-pulse hover:animate-none' : ''}
                    >
                      <TableCell>
                        <div className={activity.status === 'active' ? 'animate-fade-in' : ''}>
                          <div className="font-medium">{activity.activity_type}</div>
                          {activity.description && (
                            <div className="text-sm text-gray-500">{activity.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          activity.status === 'active' ? 'bg-green-100 text-green-800 animate-scale-in' :
                          activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'stopped' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium transition-colors duration-300 ${
                          (activity.current_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        } ${activity.status === 'active' ? 'hover-scale' : ''}`}>
                          ${(activity.current_profit || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                        ${(activity.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                        ${(activity.total_earned || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                        {activity.wallet ? (
                          <div>
                            <div className="font-medium">{activity.wallet.name}</div>
                            <div className="text-sm text-gray-500">${activity.wallet.balance.toFixed(2)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No wallet</span>
                        )}
                      </TableCell>
                      <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                        {activity.date_added ? 
                          new Date(activity.date_added).toLocaleDateString() : 
                          'Not set'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {activity.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStopBotClick(activity)}
                              className={activity.status === 'active' ? 'hover-scale' : ''}
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(activity.id)}
                            className={activity.status === 'active' ? 'hover-scale' : ''}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          {searchQuery ? (
            <p className="text-gray-500">No activities found matching "{searchQuery}"</p>
          ) : (
            <p className="text-gray-500">You haven't added any activities yet</p>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Edit Activity' : 'Add New Activity'}
            </DialogTitle>
            <DialogDescription>
              {editingActivity ? 'Update the activity details below' : 'Enter the activity details below'}
            </DialogDescription>
          </DialogHeader>
          <ActivityForm 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting}
            initialData={editingActivity}
          />
        </DialogContent>
      </Dialog>

      {stopBotDialog.activity && (
        <StopBotDialog
          isOpen={stopBotDialog.isOpen}
          onClose={() => setStopBotDialog({ isOpen: false, activity: null, isLoading: false })}
          activity={stopBotDialog.activity}
          onConfirm={handleStopBot}
          isLoading={stopBotDialog.isLoading}
        />
      )}
    </div>
  );
};

export default Activities;
