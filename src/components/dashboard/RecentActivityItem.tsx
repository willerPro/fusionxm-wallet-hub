
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface RecentActivityItemProps {
  activity: Activity;
}

const RecentActivityItem = ({ activity }: RecentActivityItemProps) => {
  const isDeposit = activity.type === 'deposit';
  const formattedDate = new Date(activity.created_at).toLocaleDateString();
  
  return (
    <Link to={`/transactions/${activity.id}`} className="flex items-center justify-between py-2 px-1 hover:bg-gray-100 rounded-md transition-colors">
      <div className="flex items-center">
        <div className={`rounded-full p-1 mr-3 ${isDeposit ? 'bg-green-100' : 'bg-orange-100'}`}>
          {isDeposit ? (
            <ArrowDownRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-orange-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{activity.description}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      <div>
        <p className={`text-sm font-medium ${isDeposit ? 'text-green-600' : 'text-orange-600'}`}>
          {isDeposit ? '+' : '-'}${activity.amount.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default RecentActivityItem;
