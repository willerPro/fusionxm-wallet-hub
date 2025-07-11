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

const OTPLoginForm = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithOTP(email);
      
      if (error) {
        setError(error.message || "Failed to send OTP");
      } else {
        setStep('otp');
        toast({
          title: "OTP Sent",
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
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
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
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
          </form>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              onClick={handleBackToEmail}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Email
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
              disabled={loading}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Resend Code
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSendOTP} className="space-y-4">
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
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default OTPLoginForm;