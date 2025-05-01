
import { ArrowDown, ArrowUp } from "lucide-react";

export type ActivityType = "deposit" | "withdrawal" | "investment";

export type Activity = {
  id: string;
  type: ActivityType;
  amount: number;
  description: string;
  date: Date;
};

type RecentActivityItemProps = {
  activity: Activity;
};

const RecentActivityItem = ({ activity }: RecentActivityItemProps) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "deposit":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "investment":
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center py-3 px-4 hover:bg-gray-50 rounded-md">
      <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center">
        {getActivityIcon(activity.type)}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">
          {activity.date.toLocaleDateString()} • {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-medium ${activity.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
          {activity.type === "deposit" ? "+" : "-"}
          ${activity.amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default RecentActivityItem;
