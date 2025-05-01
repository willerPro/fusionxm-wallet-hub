
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";

type WalletFormProps = {
  onSubmit: (walletData: { 
    name: string; 
    currency: string; 
    password?: string;
    passwordProtected: boolean;
    backupKey?: string;
  }) => void;
  isLoading: boolean;
};

const WalletForm = ({ onSubmit, isLoading }: WalletFormProps) => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupKey, setBackupKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      currency, 
      password: passwordProtected ? password : undefined,
      passwordProtected,
      backupKey: backupEnabled ? backupKey : undefined
    });
  };

  const generateBackupKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setBackupKey(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create New Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Wallet Name
            </label>
            <Input
              id="name"
              placeholder="My Investment Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Currency
            </label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label htmlFor="password-protection" className="text-sm font-medium">
                  Password Protection
                </Label>
              </div>
              <Switch 
                id="password-protection" 
                checked={passwordProtected}
                onCheckedChange={setPasswordProtected}
              />
            </div>

            {passwordProtected && (
              <div className="mt-2 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter wallet password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={passwordProtected}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label htmlFor="backup-key" className="text-sm font-medium">
                  Create Backup Key
                </Label>
              </div>
              <Switch 
                id="backup-key" 
                checked={backupEnabled}
                onCheckedChange={setBackupEnabled}
              />
            </div>

            {backupEnabled && (
              <div className="mt-2 space-y-2">
                <Input
                  type="text"
                  placeholder="Backup key for recovery"
                  value={backupKey}
                  onChange={(e) => setBackupKey(e.target.value)}
                  required={backupEnabled}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={generateBackupKey}
                >
                  Generate Random Key
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!name || isLoading || (passwordProtected && !password) || (backupEnabled && !backupKey)}
          >
            {isLoading ? "Creating..." : "Create Wallet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WalletForm;
