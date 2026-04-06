import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function ForgotPasswordForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD'>('EMAIL');
  const [authEmail, setAuthEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { forgotPassword, verifyOTP, updatePassword } = useAuth();
  const navigate = useNavigate();

  const onEmailSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await forgotPassword(data.email);
      setAuthEmail(data.email);
      setStep('OTP');
      setSuccessMsg("Reset code sent! Please check your inbox.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Failed to send reset code. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await verifyOTP(authEmail, data.otp, 'recovery', false);
      setStep('NEW_PASSWORD');
      setSuccessMsg("Code verified! Please enter your new password.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await updatePassword(data.password);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Failed to securely update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex items-start flex-col">
        <button onClick={onBackToLogin} className="flex items-center text-sm text-gray-400 hover:text-primary-wera transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>
        <h3 className="text-2xl font-bold text-accent-dark mb-1">
            {step === 'EMAIL' && "Reset Password"}
            {step === 'OTP' && "Verify Recovery Code"}
            {step === 'NEW_PASSWORD' && "Create New Password"}
        </h3>
        <p className="text-gray-500 text-sm">
            {step === 'EMAIL' && "Enter your email to receive a secure recovery code."}
            {step === 'OTP' && `We sent a code to ${authEmail}`}
            {step === 'NEW_PASSWORD' && "Secure your account with a strong new password."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg border border-red-200 animate-in fade-in">
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-lg border border-green-200 animate-in fade-in">
          {successMsg}
        </div>
      )}

      {step === 'EMAIL' && (
      <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Account Email Address
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

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark transition-all transform active:scale-[0.98]">
            {isLoading ? "Sending Code..." : "Send Reset Code"}
        </Button>
      </form>
      )}

      {step === 'OTP' && (
      <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="otp" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            6-Digit Recovery Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="otp" 
              type="text" 
              {...register("otp", { required: "OTP is required" })}
              placeholder="Enter code" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp.message?.toString()}</p>}
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark transition-all transform active:scale-[0.98]">
            {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
        <button type="button" onClick={() => { setStep('EMAIL'); setErrorMsg(""); setSuccessMsg(""); }} disabled={isLoading} className="w-full mt-2 text-sm text-gray-500 hover:text-primary-wera bg-transparent border-none">
            Didn't receive it? Request again.
        </button>
      </form>
      )}

      {step === 'NEW_PASSWORD' && (
      <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            New Password
          </Label>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <Input 
               id="password" 
               type="password" 
               {...register("password", { required: "Password is required", minLength: 8 })}
               placeholder="Min. 8 characters" 
               className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera"
             />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>}
        </div>
        
        <div>
          <Label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1 mt-3">
            Confirm Password
          </Label>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <Input 
               id="confirmPassword" 
               type="password" 
               {...register("confirmPassword", { required: "Confirm password is required" })}
               placeholder="Re-enter new password" 
               className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera"
             />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">Please confirm your password.</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 transition-all transform active:scale-[0.98] mt-4">
            {isLoading ? "Updating..." : "Update Password & Continue"}
        </Button>
      </form>
      )}
    </div>
  );
}
