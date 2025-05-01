
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User } from "lucide-react";

const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock signup - would connect to backend in real implementation
    setTimeout(() => {
      if (fullName && email && password) {
        localStorage.setItem("user", JSON.stringify({ fullName, email }));
        toast({
          title: "Account created successfully",
          description: "Welcome to FusionXM",
          duration: 3000,
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Please fill all fields and try again",
          duration: 3000,
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
        <CardDescription>Register to manage your investments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center border rounded-md pl-3 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <User className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center border rounded-md pl-3 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <Mail className="h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center border rounded-md pl-3 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <Lock className="h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Already have an account? 
          <button 
            className="ml-1 text-primary hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
