
import React from "react";
import SignupForm from "@/components/auth/SignupForm";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-secondary/10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">FusionXM</h1>
        <p className="text-gray-600">Create Your Investment Account</p>
      </div>
      <SignupForm />
    </div>
  );
};

export default SignUp;
