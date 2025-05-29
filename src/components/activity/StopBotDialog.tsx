
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Activity } from "@/pages/Activities";

interface StopBotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  onConfirm: (password: string) => Promise<void>;
  isLoading: boolean;
}

const StopBotDialog: React.FC<StopBotDialogProps> = ({
  isOpen,
  onClose,
  activity,
  onConfirm,
  isLoading
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onConfirm(password);
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Stop Bot Activity
          </DialogTitle>
          <DialogDescription>
            You are about to stop the "{activity.activity_type}" bot activity.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Stopping this bot may result in:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Loss of current profit: <span className="font-semibold">${(activity.current_profit || 0).toFixed(2)}</span></li>
              <li>Amount in use: <span className="font-semibold">${(activity.amount_in_use || 0).toFixed(2)}</span></li>
              {activity.wallet && (
                <li>Wallet balance: <span className="font-semibold">${activity.wallet.balance.toFixed(2)}</span></li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Enter your password to confirm:
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-1"
              disabled={isLoading}
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                "Stop Bot"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StopBotDialog;
