
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import PackageCard from "@/components/package/PackageCard";
import PackageForm from "@/components/package/PackageForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";

type InvestmentPackage = {
  id: string;
  name: string;
  description?: string;
  minAmount: number;
  maxAmount?: number;
  interestRate: number;
  durationDays: number;
};

const Packages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPackages();
  }, [user, navigate]);

  const fetchPackages = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our InvestmentPackage type
      const transformedPackages = data.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || '',
        minAmount: Number(pkg.min_amount),
        maxAmount: pkg.max_amount ? Number(pkg.max_amount) : undefined,
        interestRate: Number(pkg.interest_rate),
        durationDays: pkg.duration_days,
      }));
      
      setPackages(transformedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error loading packages",
        description: "There was a problem loading your investment packages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async (packageData: {
    name: string;
    description: string;
    minAmount: number;
    maxAmount?: number;
    interestRate: number;
    durationDays: number;
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          name: packageData.name,
          description: packageData.description || null,
          min_amount: packageData.minAmount,
          max_amount: packageData.maxAmount || null,
          interest_rate: packageData.interestRate,
          duration_days: packageData.durationDays,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newPackage: InvestmentPackage = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          minAmount: Number(data[0].min_amount),
          maxAmount: data[0].max_amount ? Number(data[0].max_amount) : undefined,
          interestRate: Number(data[0].interest_rate),
          durationDays: data[0].duration_days,
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
    <div className="container mx-auto p-4 pb-20 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Investment Packages</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-3 text-center py-16">
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Packages Available</h3>
            <p className="text-gray-500 mb-6">Create your first investment package to get started</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Create Package
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
