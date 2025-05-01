
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export type Investor = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  investorType: string;
};

type InvestorCardProps = {
  investor: Investor;
  onSelect?: (investor: Investor) => void;
};

const InvestorCard = ({ investor, onSelect }: InvestorCardProps) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(investor);
    }
  };

  const formatInvestorType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex items-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-primary">{investor.fullName}</h3>
          <p className="text-sm text-gray-500">{investor.email}</p>
          <div className="mt-1 flex items-center">
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-primary">
              {formatInvestorType(investor.investorType)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestorCard;
