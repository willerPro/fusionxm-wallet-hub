import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import ActivityForm from "@/components/activity/ActivityForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Activity {
  id: string;
  activity_type: string;
  description: string | null;
  status: string;
  wallet_id: string | null;
  date_added: string;
  date_ended: string | null;
  current_profit: number | null;
  amount_in_use: number | null;
  server_space_taken: number | null;
  next_update_set: string | null;
}

const Activities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
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
        .select('*')
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
    date_ended?: string;
    current_profit?: number;
    amount_in_use?: number;
    server_space_taken?: number;
    next_update_set?: string;
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
            date_ended: activityData.date_ended || null,
            current_profit: activityData.current_profit || 0,
            amount_in_use: activityData.amount_in_use || 0,
            server_space_taken: activityData.server_space_taken || 0,
            next_update_set: activityData.next_update_set || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingActivity.id)
          .eq('user_id', user.id)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActivities(activities.map(activity => 
            activity.id === editingActivity.id ? data[0] : activity
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
            date_ended: activityData.date_ended || null,
            current_profit: activityData.current_profit || 0,
            amount_in_use: activityData.amount_in_use || 0,
            server_space_taken: activityData.server_space_taken || 0,
            next_update_set: activityData.next_update_set || null,
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActivities([data[0], ...activities]);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Profit</TableHead>
                  <TableHead>Amount in Use</TableHead>
                  <TableHead>Server Space</TableHead>
                  <TableHead>Next Update</TableHead>
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
                      ${(activity.amount_in_use || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                      {(activity.server_space_taken || 0).toFixed(1)} MB
                    </TableCell>
                    <TableCell className={activity.status === 'active' ? 'hover-scale' : ''}>
                      {activity.next_update_set ? 
                        new Date(activity.next_update_set).toLocaleDateString() : 
                        'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          className={activity.status === 'active' ? 'hover-scale' : ''}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
    </div>
  );
};

export default Activities;
