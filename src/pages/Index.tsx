
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet, Users, PieChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const checkAuth = () => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-secondary/10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FusionXM</h1>
          <p className="text-gray-600 mt-2">Investment Wallet Management</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Wallet Management</h3>
                  <p className="text-sm text-gray-500">Create wallets, deposit and withdraw funds</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Investor Profiles</h3>
                  <p className="text-sm text-gray-500">Register and manage investor information</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Investment Packages</h3>
                  <p className="text-sm text-gray-500">Create custom investment opportunities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/signup")}
          >
            Create an Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
