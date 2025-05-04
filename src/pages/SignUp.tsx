
import React from "react";
import SignupForm from "@/components/auth/SignupForm";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-secondary/10">
      <div className="mb-8 text-center">
        <img 
          src="https://i.imgur.com/ZE0BXbI.png" 
          alt="FusionXM Logo" 
          className="h-16 mb-2 mx-auto"
        />
        <h1 className="text-3xl font-bold text-primary">FusionXM</h1>
        <p className="text-gray-600 mt-1">Create Your Investment Account</p>
        <p className="text-sm text-gray-500 mt-3 max-w-md italic">
          Bold and visionary<br />
          Enter the future of wealth and limitless opportunity
        </p>
      </div>
      <SignupForm />
    </div>
  );
};

export default SignUp;
