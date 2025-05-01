
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PackageCard from "@/components/package/PackageCard";
import PackageForm from "@/components/package/PackageForm";

interface Package {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number | null;
  interest_rate: number;
  duration_days: number;
  created_at: string;
}

const Packages = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error loading packages",
        description: "There was a problem loading your investment packages. Please try again.",
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
    try {
      const { error } = await supabase
        .from('packages')
        .insert({
          name: packageData.name,
          description: packageData.description,
          min_amount: packageData.minAmount,
          max_amount: packageData.maxAmount || null,
          interest_rate: packageData.interestRate,
          duration_days: packageData.durationDays
        });
      
      if (error) throw error;
      
      toast({
        title: "Package created",
        description: "Your investment package has been created successfully.",
        duration: 3000,
      });
      
      setIsDialogOpen(false);
      fetchPackages();
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error creating package",
        description: "There was a problem creating your investment package. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Adapter function to convert between the two different property naming conventions
  const handlePackageFormSubmit = (packageData: { 
    name: string;
    description: string;
    minInvestment: number;
    expectedReturn: number;
    duration: string;
    riskLevel: 'low' | 'medium' | 'high';
  }) => {
    const durationDays = parseInt(packageData.duration.split(' ')[0]);
    
    handleCreatePackage({
      name: packageData.name,
      description: packageData.description,
      minAmount: packageData.minInvestment,
      interestRate: packageData.expectedReturn,
      durationDays: durationDays
    });
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Investment Packages</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Package
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              description={pkg.description}
              minAmount={pkg.min_amount}
              maxAmount={pkg.max_amount || undefined}
              interestRate={pkg.interest_rate}
              durationDays={pkg.duration_days}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">You haven't created any investment packages yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Package
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Investment Package</DialogTitle>
          </DialogHeader>
          <PackageForm onSubmit={handlePackageFormSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
