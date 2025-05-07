
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BalanceCardProps = {
  title: string;
  amount: number;
  currency?: string;
  change?: number;
  changeType?: "positive" | "negative";
  animate?: boolean;
};

const BalanceCard = ({
  title,
  amount,
  currency = "USD",
  change,
  changeType = "positive",
  animate = false,
}: BalanceCardProps) => {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className={cn(
            "text-2xl font-semibold",
            animate && "transition-all duration-1000"
          )}>
            {formattedAmount}
          </p>
          {change !== undefined && (
            <span
              className={`ml-2 text-sm font-medium ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? "+" : "-"}
              {change}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
