
import React from "react";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-secondary/10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">FusionXM</h1>
        <p className="text-gray-600">Investment Management Platform</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
