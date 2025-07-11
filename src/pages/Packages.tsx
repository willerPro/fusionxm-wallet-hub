import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PackageCard from "@/components/package/PackageCard";
import PackageForm from "@/components/package/PackageForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

type Package = {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  interestRate: number;
  durationDays: number;
};

const Packages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

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
    
    fetchPackages();
  }, [user, navigate, toast]);

  const fetchPackages = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Package type
      const transformedPackages = data.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || '',
        minAmount: Number(pkg.amount),
        maxAmount: Number(pkg.amount) * 2, // Derived from amount
        interestRate: Number(pkg.profit || 0),
        durationDays: 30 // Default duration
      }));
      
      setPackages(transformedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error loading packages",
        description: "There was a problem loading investment packages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async (packageData: { 
    name: string; 
    description: string; 
    minInvestment: number; 
    expectedReturn: number;
    duration: string;
    riskLevel: 'low' | 'medium' | 'high'; 
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      // Calculate duration days based on the selected option
      let durationDays = 30;
      switch (packageData.duration) {
        case 'short':
          durationDays = 30;
          break;
        case 'medium':
          durationDays = 90;
          break;
        case 'long':
          durationDays = 180;
          break;
      }
      
      // Calculate max amount based on risk level (optional)
      const maxAmount = packageData.riskLevel === 'high' ? packageData.minInvestment * 10 : 
                        packageData.riskLevel === 'medium' ? packageData.minInvestment * 5 : 
                        packageData.minInvestment * 2;
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          name: packageData.name,
          description: packageData.description,
          amount: packageData.minInvestment,
          profit: packageData.expectedReturn,
          type: 'package',
          activity_type: 'investment',
          user_id: user.id,
          status: 'active'
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newPackage: Package = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          minAmount: Number(data[0].amount),
          maxAmount: Number(data[0].amount) * 2,
          interestRate: Number(data[0].profit),
          durationDays: durationDays
        };
        
        setPackages([newPackage, ...packages]);
        
        toast({
          title: "Package created",
          description: `${packageData.name} has been created successfully.`,
          duration: 3000,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error creating package",
        description: "There was a problem creating your investment package.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Investment Packages</h2>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.length > 0 ? (
          packages.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              name={pkg.name}
              description={pkg.description}
              minAmount={pkg.minAmount}
              maxAmount={pkg.maxAmount}
              interestRate={pkg.interestRate}
              durationDays={pkg.durationDays}
            />
          ))
        ) : (
          <div className="text-center py-10 col-span-full">
            <p className="text-gray-500 mb-4">You don't have any investment packages yet</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Create Your First Package
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Investment Package</DialogTitle>
          </DialogHeader>
          <PackageForm onSubmit={handleCreatePackage} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
