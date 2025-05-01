
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PackageCard, { InvestmentPackage } from "@/components/package/PackageCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PackageForm from "@/components/package/PackageForm";
import { useToast } from "@/components/ui/use-toast";

const Packages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate loading packages from localStorage
    const savedPackages = localStorage.getItem("investmentPackages");
    if (savedPackages) {
      try {
        setPackages(JSON.parse(savedPackages));
      } catch (error) {
        console.error("Failed to parse investment packages", error);
      }
    } else {
      // Set initial demo packages if none exist
      const initialPackages: InvestmentPackage[] = [
        {
          id: "1",
          name: "Growth Portfolio",
          description: "High-growth tech stocks with moderate risk profile",
          minInvestment: 5000,
          expectedReturn: 12,
          duration: "12 months",
          riskLevel: "medium",
        },
        {
          id: "2",
          name: "Stable Income",
          description: "Low-risk bonds and dividend stocks for regular income",
          minInvestment: 10000,
          expectedReturn: 6,
          duration: "24 months",
          riskLevel: "low",
        },
      ];
      setPackages(initialPackages);
      localStorage.setItem("investmentPackages", JSON.stringify(initialPackages));
    }
  }, []);

  const handleCreatePackage = (packageData: {
    name: string;
    description: string;
    minInvestment: number;
    expectedReturn: number;
    duration: string;
    riskLevel: "low" | "medium" | "high";
  }) => {
    setIsLoading(true);
    
    // Simulate API call to create package
    setTimeout(() => {
      const newPackage: InvestmentPackage = {
        id: Date.now().toString(),
        ...packageData,
      };
      
      const updatedPackages = [...packages, newPackage];
      setPackages(updatedPackages);
      localStorage.setItem("investmentPackages", JSON.stringify(updatedPackages));
      
      toast({
        title: "Package created",
        description: `${packageData.name} has been created successfully.`,
        duration: 3000,
      });
      
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <PackageForm onSubmit={handleCreatePackage} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
