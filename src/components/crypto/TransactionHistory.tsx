
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CryptoTransaction } from '@/types/activity';

interface TransactionHistoryProps {
  transactions: CryptoTransaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    {transaction.type === "send" ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">
                      {transaction.type === "send" ? "Sent" : "Received"} {transaction.coin_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(transaction.created_at)}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    {transaction.address.slice(0, 8)}...{transaction.address.slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={transaction.type === "send" ? "text-red-600" : "text-green-600"}>
                    {transaction.type === "send" ? "-" : "+"}{transaction.amount}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">No transactions yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
