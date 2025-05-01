
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PackageCardProps {
  key?: string;
  id?: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationDays: number;
  onSelect?: () => void;
}

const PackageCard = ({
  name,
  description,
  minAmount,
  maxAmount,
  interestRate,
  durationDays,
  onSelect
}: PackageCardProps) => {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount Range:</span>
            <span className="font-medium">
              ${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Interest Rate:</span>
            <span className="font-medium text-green-600">{interestRate}%</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium">{durationDays} days</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-6 pt-4">
        <Button 
          className="w-full" 
          onClick={onSelect}
        >
          Select Package
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
