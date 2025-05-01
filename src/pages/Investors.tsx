
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InvestorCard, { Investor } from "@/components/investor/InvestorCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import InvestorForm from "@/components/investor/InvestorForm";
import { useToast } from "@/components/ui/use-toast";

const Investors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate loading investors from localStorage
    const savedInvestors = localStorage.getItem("investors");
    if (savedInvestors) {
      try {
        setInvestors(JSON.parse(savedInvestors));
      } catch (error) {
        console.error("Failed to parse investors", error);
      }
    } else {
      // Set initial demo investors if none exist
      const initialInvestors: Investor[] = [
        {
          id: "1",
          fullName: "John Smith",
          email: "john.smith@example.com",
          phone: "+1 (555) 123-4567",
          investorType: "individual",
        },
        {
          id: "2",
          fullName: "Acme Corporation",
          email: "info@acmecorp.com",
          phone: "+1 (555) 987-6543",
          investorType: "corporate",
        },
      ];
      setInvestors(initialInvestors);
      localStorage.setItem("investors", JSON.stringify(initialInvestors));
    }
  }, []);

  const handleAddInvestor = (investorData: {
    fullName: string;
    email: string;
    phone: string;
    investorType: string;
  }) => {
    setIsLoading(true);
    
    // Simulate API call to create investor
    setTimeout(() => {
      const newInvestor: Investor = {
        id: Date.now().toString(),
        ...investorData,
      };
      
      const updatedInvestors = [...investors, newInvestor];
      setInvestors(updatedInvestors);
      localStorage.setItem("investors", JSON.stringify(updatedInvestors));
      
      toast({
        title: "Investor added",
        description: `${investorData.fullName} has been added successfully.`,
        duration: 3000,
      });
      
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <InvestorForm onSubmit={handleAddInvestor} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investors;
