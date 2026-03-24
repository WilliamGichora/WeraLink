import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Phone, Hammer, Briefcase, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [authEmail, setAuthEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { register: registerUser, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const onRegSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await registerUser(data);
      setAuthEmail(data.email);
      setStep('OTP');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await verifyOTP(authEmail, data.otp, 'signup');
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
      await resendOTP(authEmail, 'signup');
      setSuccessMsg("Verification code has been successfully resent!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-accent-dark mb-1">{step === 'OTP' ? "Verify Code" : "Create Account"}</h3>
        <p className="text-gray-500 text-sm">
           {step === 'OTP' ? `We sent a code to ${authEmail}` : "Join the WeraLink community today."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {step === 'CREDENTIALS' ? (
      <form onSubmit={handleSubmit(onRegSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="reg-name" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="reg-name" 
              type="text" 
              {...register("name", { required: "Name is required" })}
              placeholder="John Doe" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message?.toString()}</p>}
        </div>

        <div>
           <Label htmlFor="reg-phone" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="reg-phone" 
              type="tel" 
              {...register("phone", { required: "Phone is required" })}
              placeholder="+254 7XX XXX XXX" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message?.toString()}</p>}
        </div>

        <div>
          <Label htmlFor="reg-email" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="reg-email" 
              type="email" 
              {...register("email", { required: "Email is required" })}
              placeholder="john@example.com" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</p>}
        </div>

        <div>
          <Label htmlFor="reg-password" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Create Password
          </Label>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <Input 
               id="reg-password" 
               type="password" 
               {...register("password", { required: "Password is required", minLength: 8 })}
               placeholder="Min. 8 characters" 
               className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera"
             />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>}
        </div>

        <div>
          <Label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-3">
            I want to join as a:
          </Label>
          <div className="grid grid-cols-2 gap-3">
             <label className="relative flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-primary-wera/5 cursor-pointer group transition-all has-checked:border-primary-wera has-checked:bg-primary-wera/5">
                <input 
                  type="radio" 
                  value="WORKER" 
                  {...register("role", { required: "Role is required" })} 
                  className="sr-only peer" 
                />
                <div className="bg-card-bg-wera p-2 rounded-full mb-1 group-hover:bg-white transition-colors peer-checked:bg-white">
                  <Hammer className="w-5 h-5 text-accent-text" />
                </div>
                <span className="text-xs font-bold text-text-main">Worker</span>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-gray-300 peer-checked:border-primary-wera flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-wera opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
             </label>

             <label className="relative flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-primary-wera/5 cursor-pointer group transition-all has-checked:border-primary-wera has-checked:bg-primary-wera/5">
                <input 
                  type="radio" 
                  value="EMPLOYER" 
                  {...register("role", { required: "Role is required" })} 
                  className="sr-only peer" 
                />
                <div className="bg-card-bg-wera p-2 rounded-full mb-1 group-hover:bg-white transition-colors peer-checked:bg-white">
                  <Briefcase className="w-5 h-5 text-accent-text" />
                </div>
                <span className="text-xs font-bold text-text-main">Employer</span>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-gray-300 peer-checked:border-primary-wera flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-wera opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
             </label>
          </div>
          {errors.role && <p className="text-xs text-red-500 mt-1 pb-2">Please select your role.</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-wera transition-all transform active:scale-[0.98] mt-2">
            {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      ) : (
      <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="reg-otp" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1">
            Verification Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              id="reg-otp" 
              type="text" 
              {...register("otp", { required: "OTP is required" })}
              placeholder="Enter 6-digit code" 
              className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-text-main shadow-sm py-3 focus-visible:ring-primary-wera" 
            />
          </div>
          {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp.message?.toString()}</p>}
          {successMsg && <p className="text-xs text-green-500 mt-1">{successMsg}</p>}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-wera hover:bg-primary-dark transition-all transform active:scale-[0.98]">
            {isLoading ? "Verifying..." : "Verify Account"}
        </Button>
        <button type="button" onClick={handleResend} disabled={isLoading} className="w-full mt-2 text-sm text-primary-wera hover:text-primary-dark font-medium bg-transparent border-none">
            Didn't receive a code? Resend
        </button>
        <button type="button" onClick={() => setStep('CREDENTIALS')} disabled={isLoading} className="w-full mt-1 text-sm text-gray-500 hover:text-primary-wera bg-transparent border-none">
            Back to Registration Form
        </button>
      </form>
      )}
    </div>
  );
}
