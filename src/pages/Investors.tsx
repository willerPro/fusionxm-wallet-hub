import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InvestorCard, { Investor } from "@/components/investor/InvestorCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import InvestorForm from "@/components/investor/InvestorForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

const Investors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has permission to access this page
    if (user.email !== "moisentak@gmail.com") {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    fetchInvestors();
  }, [user, navigate, toast]);
  
  const fetchInvestors = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Investor type
      const transformedInvestors = data.map((investor: any) => ({
        id: investor.id,
        fullName: `${investor.first_name} ${investor.last_name}`,
        email: investor.email || '',
        phone: investor.phone || '',
        investorType: 'individual', // We'll need to add this field to the database if we want to use this
      }));
      
      setInvestors(transformedInvestors);
    } catch (error) {
      console.error("Error fetching investors:", error);
      toast({
        title: "Error loading investors",
        description: "There was a problem loading your investors.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInvestor = async (investorData: {
    fullName: string;
    email: string;
    phone: string;
    investorType: string;
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      // Split full name into first and last name
      const nameParts = investorData.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || ''; // Default to empty string if no last name
      
      const { data, error } = await supabase
        .from('investors')
        .insert([{
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: investorData.email,
          phone: investorData.phone,
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newInvestor: Investor = {
          id: data[0].id,
          fullName: `${data[0].first_name} ${data[0].last_name}`,
          email: data[0].email || '',
          phone: data[0].phone || '',
          investorType: investorData.investorType,
        };
        
        setInvestors([newInvestor, ...investors]);
        
        toast({
          title: "Investor added",
          description: `${investorData.fullName} has been added successfully.`,
          duration: 3000,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating investor:", error);
      toast({
        title: "Error adding investor",
        description: "There was a problem adding the investor.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Investors</h2>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Investor
        </Button>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search investors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredInvestors.length > 0 ? (
          filteredInvestors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))
        ) : (
          <div className="text-center py-10">
            {searchQuery ? (
              <p className="text-gray-500">No investors found matching "{searchQuery}"</p>
            ) : (
              <>
                <p className="text-gray-500 mb-4">You haven't added any investors yet</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Add Your First Investor
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Investor</DialogTitle>
            <DialogDescription>
              Enter the investor's details below
            </DialogDescription>
          </DialogHeader>
          <InvestorForm onSubmit={handleAddInvestor} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investors;
