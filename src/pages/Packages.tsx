
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PackageCard, { InvestmentPackage } from "@/components/package/PackageCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import PackageForm from "@/components/package/PackageForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

const Packages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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
        minInvestment: parseFloat(pkg.min_amount),
        expectedReturn: parseFloat(pkg.interest_rate),
        duration: `${pkg.duration_days} days`,
        riskLevel: getRiskLevel(parseFloat(pkg.interest_rate)),
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

  const getRiskLevel = (interestRate: number): 'low' | 'medium' | 'high' => {
    if (interestRate < 5) return 'low';
    if (interestRate < 10) return 'medium';
    return 'high';
  };

  const handleCreatePackage = async (packageData: {
    name: string;
    description: string;
    minInvestment: number;
    expectedReturn: number;
    duration: string;
    riskLevel: "low" | "medium" | "high";
  }) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      // Extract duration in days from the string (e.g., "30 days" -> 30)
      const durationDays = parseInt(packageData.duration.split(' ')[0]);
      
      const { data, error } = await supabase
        .from('packages')
        .insert([{
          user_id: user.id,
          name: packageData.name,
          description: packageData.description,
          min_amount: packageData.minInvestment,
          interest_rate: packageData.expectedReturn,
          duration_days: durationDays
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newPackage: InvestmentPackage = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          minInvestment: parseFloat(data[0].min_amount),
          expectedReturn: parseFloat(data[0].interest_rate),
          duration: `${data[0].duration_days} days`,
          riskLevel: packageData.riskLevel,
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

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2 className="text-xl font-semibold">Investment Packages</h2>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Package
        </Button>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} investmentPackage={pkg} />
          ))
        ) : (
          <div className="text-center py-10">
            {searchQuery ? (
              <p className="text-gray-500">No packages found matching "{searchQuery}"</p>
            ) : (
              <>
                <p className="text-gray-500 mb-4">You haven't created any investment packages yet</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Your First Package
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Investment Package</DialogTitle>
            <DialogDescription>
              Define the details for your new investment package
            </DialogDescription>
          </DialogHeader>
          <PackageForm onSubmit={handleCreatePackage} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
