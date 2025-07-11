import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InvestorCard, { Investor } from "@/components/investor/InvestorCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Loader2, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import InvestorForm from "@/components/investor/InvestorForm";
import KycForm from "@/components/investor/KycForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import InvestorDetails from "@/components/investor/InvestorDetails";

export interface KycData {
  id: string;
  username: string;
  full_names: string;
  identity_type: string;
  identity_number: string;
  location: string | null;
  picture: string | null;
  front_pic_id: string | null;
  rear_pic_id: string | null;
  investor_id: string;
}

const Investors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [kycData, setKycData] = useState<KycData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [viewingInvestor, setViewingInvestor] = useState<Investor | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchInvestors();
    fetchKycData();
  }, [user, navigate]);
  
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
        fullName: investor.name,
        email: investor.email || '',
        phone: '', // Not available in investors table
        investorType: 'individual',
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

  const fetchKycData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setKycData(data?.map((profile: any) => ({
        id: profile.id,
        username: profile.first_name || 'Unknown',
        full_names: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
        identity_type: 'passport',
        identity_number: profile.phone || '000000000',
        location: 'Not provided',
        picture: '',
        front_pic_id: '',
        rear_pic_id: '',
        investor_id: profile.id
      })) || []);
    } catch (error) {
      console.error("Error fetching KYC data:", error);
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
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data, error } = await supabase
        .from('investors')
        .insert([{
          user_id: user.id,
          name: investorData.fullName,
          email: investorData.email,
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newInvestor: Investor = {
          id: data[0].id,
          fullName: data[0].name,
          email: data[0].email || '',
          phone: '', // Not available in investors table
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

  const handleAddKyc = async (kycFormData: {
    username: string;
    full_names: string;
    identity_type: string;
    identity_number: string;
    location: string;
    picture: string;
    front_pic_id: string;
    rear_pic_id: string;
  }) => {
    if (!user || !selectedInvestor) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          first_name: kycFormData.username,
          last_name: kycFormData.full_names.split(' ').slice(1).join(' '),
          email: selectedInvestor.email,
          phone: kycFormData.identity_number,
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newKycData: KycData = {
          id: data[0].id,
          username: data[0].first_name || 'Unknown',
          full_names: `${data[0].first_name || ''} ${data[0].last_name || ''}`.trim() || 'Unknown',
          identity_type: 'passport',
          identity_number: data[0].phone || '',
          location: 'Not provided',
          picture: '',
          front_pic_id: '',
          rear_pic_id: '',
          investor_id: selectedInvestor.id
        };
        setKycData([...kycData, newKycData]);
        toast({
          title: "KYC data added",
          description: `KYC information for ${selectedInvestor.fullName} has been added successfully.`,
        });
      }
      
      setIsKycDialogOpen(false);
      setSelectedInvestor(null);
    } catch (error) {
      console.error("Error adding KYC data:", error);
      toast({
        title: "Error adding KYC data",
        description: "There was a problem adding the KYC information.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKycClick = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsKycDialogOpen(true);
  };

  const handleInvestorSelect = (investor: Investor) => {
    setViewingInvestor(investor);
  };

  const handleBackToList = () => {
    setViewingInvestor(null);
  };

  const handleDeleteInvestor = (investorId: string) => {
    setInvestors(investors.filter(investor => investor.id !== investorId));
    setKycData(kycData.filter(kyc => kyc.investor_id !== investorId));
  };

  const getKycForInvestor = (investorId: string) => {
    return kycData.find(kyc => kyc.investor_id === investorId);
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

  // Show investor details if one is selected
  if (viewingInvestor) {
    return (
      <div className="container mx-auto p-4 max-w-xl">
        <InvestorDetails
          investor={viewingInvestor}
          kycData={getKycForInvestor(viewingInvestor.id)}
          onBack={handleBackToList}
          onDelete={handleDeleteInvestor}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Investors</h2>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
          onClick={() => setIsDialogOpen(true)}
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
          placeholder="Search investors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredInvestors.length > 0 ? (
          filteredInvestors.map((investor) => {
            const investorKyc = getKycForInvestor(investor.id);
            return (
              <div key={investor.id} className="relative">
                <InvestorCard 
                  investor={investor} 
                  onSelect={handleInvestorSelect}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant={investorKyc ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKycClick(investor);
                    }}
                    className={investorKyc ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    {investorKyc ? "View KYC" : "Add KYC"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            {searchQuery ? (
              <p className="text-gray-500">No investors found matching "{searchQuery}"</p>
            ) : (
              <p className="text-gray-500">You haven't added any investors yet</p>
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

      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getKycForInvestor(selectedInvestor?.id || '') ? 'View KYC Information' : 'Add KYC Information'}
            </DialogTitle>
            <DialogDescription>
              {selectedInvestor && `KYC details for ${selectedInvestor.fullName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedInvestor && (
            <KycForm 
              onSubmit={handleAddKyc} 
              isLoading={isCreating}
              initialData={getKycForInvestor(selectedInvestor.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investors;
