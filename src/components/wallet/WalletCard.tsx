
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

type WalletCardProps = {
  wallet: Wallet;
  onSelect?: (wallet: Wallet) => void;
};

const WalletCard = ({ wallet, onSelect }: WalletCardProps) => {
  const navigate = useNavigate();
  
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: wallet.currency,
  }).format(wallet.balance);

  const handleClick = () => {
    if (onSelect) {
      onSelect(wallet);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-primary">{wallet.name}</h3>
        <p className="mt-1 text-2xl font-semibold">{formattedBalance}</p>
        
        <div className="mt-4 flex gap-2">
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/deposit?walletId=${wallet.id}`);
            }}
          >
            Deposit
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/withdraw?walletId=${wallet.id}`);
            }}
          >
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
