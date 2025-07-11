import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

const OTPSignupForm = () => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUpWithOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await signUpWithOTP(email, firstName, lastName);
      
      if (error) {
        setError(error.message || "Failed to send verification code");
      } else {
        setStep('otp');
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await verifyOTP(email, otp);
      
      if (error) {
        setError(error.message || "Invalid verification code");
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Welcome to NEXORAVEST!",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOtp("");
    setError("");
  };

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Enter Verification Code</CardTitle>
          <CardDescription className="text-center">
            We sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </Button>
          </form>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              onClick={handleBackToDetails}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleSignUp({ preventDefault: () => {} } as React.FormEvent)}
              disabled={loading}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Resend Code
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default OTPSignupForm;