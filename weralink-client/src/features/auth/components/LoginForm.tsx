import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [authEmail, setAuthEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { login, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const onLoginSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await login(data.email, data.password);
      setAuthEmail(data.email);
      setStep('OTP');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await verifyOTP(authEmail, data.otp, 'magiclink');
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await resendOTP(authEmail, 'magiclink');
      setErrorMsg("Verification code has been successfully resent!"); // Temporarily using error field for success msg
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-accent-dark mb-1">{step === 'OTP' ? "Verify Code" : "Welcome Back"}</h3>
        <p className="text-gray-500 text-sm">
          {step === 'OTP' ? `We sent a code to ${authEmail}` : "Sign in to access your dashboard."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {step === 'CREDENTIALS' ? (
      <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="email" 
              type="email" 
              {...register("email", { required: "Email is required" })}
              placeholder="e.g. john@example.com" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</p>}
        </div>

        <div>
           <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password" className="block text-xs font-semibold text-text-main uppercase tracking-wider">
              Password
            </Label>
            <a href="#" className="text-xs text-primary-wera hover:text-primary-dark font-medium">Forgot Password?</a>
          </div>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <Input 
               id="password" 
               type="password" 
               {...register("password", { required: "Password is required" })}
               placeholder="••••••••" 
               className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera"
             />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message?.toString()}</p>}
        </div>

        <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary-wera focus:ring-primary-wera border-gray-300 rounded cursor-pointer" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                Remember me
            </label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-wera transition-all transform active:scale-[0.98]">
            {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      ) : (
      <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="otp" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Verification Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="otp" 
              type="text" 
              {...register("otp", { required: "OTP is required" })}
              placeholder="Enter 6-digit code" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp.message?.toString()}</p>}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark transition-all transform active:scale-[0.98]">
            {isLoading ? "Verifying..." : "Verify & Login"}
        </Button>
        <button type="button" onClick={handleResend} disabled={isLoading} className="w-full mt-2 text-sm text-primary-wera hover:text-primary-dark font-medium bg-transparent border-none">
            Didn't receive a code? Resend
        </button>
        <button type="button" onClick={() => setStep('CREDENTIALS')} disabled={isLoading} className="w-full mt-1 text-sm text-gray-500 hover:text-primary-wera bg-transparent border-none">
            Back to Login
        </button>
      </form>
      )}
    </div>
  );
}
