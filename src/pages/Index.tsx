
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet, Users, PieChart, ShieldCheck, TrendingUp, Rocket, BriefCase, CircleDollarSign } from "lucide-react";

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
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-secondary/5 to-secondary/20">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary">NEXORAVEST</h1>
          <p className="text-gray-600 mt-2">Investment Wallet Management</p>
        </div>
        
        <div className="mb-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Your Smart Investment Hub</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Power your future with smart, secure, and sustainable investments.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                At NEXORAVEST, we make it simple to diversify your portfolio and back high-impact projects in renewable energy, 
                smart infrastructure, and emerging technologies. Our platform offers a seamless, transparent, and fully digital 
                experience—so you can grow your capital strategically and responsibly.
              </p>
              
              <div className="bg-primary/5 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-primary mb-3">Who Is the NEXORAVEST Investor?</h3>
                <p className="italic text-gray-700 leading-relaxed">
                  A Stakeholder in Innovation and Impact
                </p>
                <p className="text-gray-700 mt-3 leading-relaxed">
                  At NEXORAVEST, our investors are more than funders—they're changemakers. Whether you're starting small or 
                  investing big, you're part of a community building a better, smarter future.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-none animate-scale-in">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Investments</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security protecting your assets</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-none animate-scale-in" style={{animationDelay: "0.1s"}}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Growth Focused</h3>
              <p className="text-sm text-gray-600">Strategic investment packages for optimal returns</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-none animate-scale-in" style={{animationDelay: "0.2s"}}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CircleDollarSign className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Options</h3>
              <p className="text-sm text-gray-600">Customized investment plans for all budget levels</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-none animate-scale-in" style={{animationDelay: "0.3s"}}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Rocket className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Future Forward</h3>
              <p className="text-sm text-gray-600">Invest in technologies shaping tomorrow's world</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 py-6 text-lg" 
            onClick={() => navigate("/login")}
          >
            Sign In to Your Account
          </Button>
          <Button 
            className="w-full py-6 text-lg" 
            variant="outline"
            onClick={() => navigate("/signup")}
          >
            Create an Account
          </Button>
          <p className="text-center text-gray-500 text-sm mt-4">
            Join thousands of investors building a smarter future with NEXORAVEST
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
