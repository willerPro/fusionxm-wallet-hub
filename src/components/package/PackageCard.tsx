
import { Card, CardContent } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export type InvestmentPackage = {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  expectedReturn: number;
  duration: string;
  riskLevel: "low" | "medium" | "high";
};

type PackageCardProps = {
  investmentPackage: InvestmentPackage;
  onSelect?: (investmentPackage: InvestmentPackage) => void;
};

const PackageCard = ({ investmentPackage, onSelect }: PackageCardProps) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(investmentPackage);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <PieChart className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-primary">{investmentPackage.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{investmentPackage.description}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Min. Investment</p>
            <p className="font-medium">${investmentPackage.minInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Expected Return</p>
            <p className="font-medium text-green-600">+{investmentPackage.expectedReturn}%</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-medium">{investmentPackage.duration}</p>
          </div>
          <div>
            <p className="text-gray-500">Risk Level</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(investmentPackage.riskLevel)}`}>
              {investmentPackage.riskLevel.charAt(0).toUpperCase() + investmentPackage.riskLevel.slice(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
