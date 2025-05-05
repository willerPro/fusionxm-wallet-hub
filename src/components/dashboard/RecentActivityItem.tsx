
import { Activity } from "@/types/activity";
import { formatDistanceToNow, parseISO } from "date-fns";

const RecentActivityItem = ({ activity }: { activity: Activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "deposit":
        return "↑";
      case "withdrawal":
        return "↓";
      case "received":
        return "+";
      case "sent":
        return "-";
      case "crypto_send":
        return "⇒";
      case "crypto_receive":
        return "⇐";
      default:
        return "○";
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case "deposit":
      case "received":
      case "crypto_receive":
        return "text-green-500";
      case "withdrawal":
      case "sent":
      case "crypto_send":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      // Fallback to the original date string if parsing fails
      return dateString;
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-100">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor()} bg-opacity-10 mr-3`}
      >
        {getActivityIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.description}</p>
        <p className="text-xs text-gray-500">
          {formatDate(activity.date)}
        </p>
      </div>
      <div className={`text-right ${getActivityColor()}`}>
        <p className="text-sm font-semibold">
          {activity.amount > 0 ? "+" : ""}
          {activity.amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default RecentActivityItem;
