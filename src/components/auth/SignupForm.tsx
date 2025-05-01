
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useToast } from "../ui/use-toast";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Trim email to prevent whitespace issues
      const trimmedEmail = email.trim();
      console.log("Attempting to sign up with:", trimmedEmail);
      
      const { error, userCreated } = await signUp(trimmedEmail, password);
      
      if (error) {
        console.error("Sign up error details:", error);
        throw error;
      }
      
      if (userCreated) {
        console.log("Sign up successful, redirecting to login");
        toast({
          title: "Sign up successful",
          description: "Your account has been created. Please check your email to confirm your registration.",
          duration: 5000,
        });
        
        navigate("/login");
      } else {
        console.log("Sign up initiated, waiting for email confirmation");
        toast({
          title: "Sign up initiated",
          description: "Please check your email to confirm your registration.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Handle the specific database error with a more user-friendly message
      if (error.message && error.message.includes("Database error saving new user")) {
        toast({
          title: "Sign up partially successful",
          description: "Your account was created but there was an issue with some additional settings. You can still log in.",
          variant: "default",
          duration: 5000,
        });
        navigate("/login");
        return;
      }
      
      // Handle existing user error
      if (error.message && error.message.includes("User already registered")) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      toast({
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
