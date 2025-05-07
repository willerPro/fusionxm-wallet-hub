
import React from "react";
import SignupForm from "@/components/auth/SignupForm";
import { useIsMobile } from "@/hooks/use-mobile";

const SignUp = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-b from-secondary/5 to-secondary/20">
      <div className={`mb-8 text-center ${isMobile ? 'w-full' : 'max-w-md'}`}>
        <img 
          src="https://i.imgur.com/ZE0BXbI.png" 
          alt="NEXORAVEST Logo" 
          className="h-20 mb-4 mx-auto animate-fade-in"
        />
        <h1 className="text-3xl font-bold text-primary">NEXORAVEST</h1>
        <p className="text-gray-600 mt-1">Create Your Investment Account</p>
      </div>
      <SignupForm />
    </div>
  );
};

export default SignUp;
