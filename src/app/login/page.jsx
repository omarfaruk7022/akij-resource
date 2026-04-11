"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Phone, Mail } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const schema = z.object({
  email: z.string().min(1, "Email / User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, user, token, isLoading, _hasHydrated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (token && user) {
      if (user.role === "employer") router.replace("/employer/dashboard");
      else router.replace("/candidate/dashboard");
    }
  }, [_hasHydrated, token, user, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      if (result.user.role === "employer") router.push("/employer/dashboard");
      else router.push("/candidate/dashboard");
    } else {
      toast.error(result.error || "Invalid credentials");
    }
  };

  return (
    <>
      <ToastContainer />
      <Navbar />
      <div className="min-h-screen flex flex-col bg-[#EBEBEB]">
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <div className="bg-white rounded-md w-full max-w-[460px] px-10 py-10 shadow-md">
            <div className="flex flex-col items-center mb-7">
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">
                Sign In
              </h1>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* Email / User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email/ User ID
                </label>
                <input
                  {...register("email")}
                  type="text"
                  placeholder="Enter your email/User ID"
                  className={`w-full px-3 py-2.5 text-sm text-gray-800 bg-white rounded border outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.email ? "border-red-400" : "border-primary"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2.5 pr-10 text-sm text-gray-800 bg-white rounded border outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      errors.password ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forget password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forget Password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#5522ee] text-white text-[15px] font-semibold py-3 rounded cursor-pointer transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                      />
                      <path
                        d="M12 2a10 10 0 0110 10"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
          <div className="w-full max-w-[460px] mt-4 bg-[#F8F8FF] border border-[#E5E1FF] rounded-xl overflow-hidden text-sm text-gray-700">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#E5E1FF] bg-[#F1EFFF]">
              <p className="font-semibold text-primary">Demo Credentials</p>
            </div>

            {/* Table */}
            <div className="divide-y divide-[#E5E1FF]">
              {/* Employer Row */}
              <button
                onClick={() => {
                  setValue("email", "employer@demo.com");
                  setValue("password", "demo123");
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#EEEAFE] transition"
              >
                <span className="text-gray-500">Employer</span>
                <span className="font-medium text-gray-800">
                  employer@demo.com
                </span>
              </button>

              {/* Candidate Row */}
              <button
                onClick={() => {
                  setValue("email", "candidate@demo.com");
                  setValue("password", "demo123");
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#EEEAFE] transition"
              >
                <span className="text-gray-500">Candidate</span>
                <span className="font-medium text-gray-800">
                  candidate@demo.com
                </span>
              </button>

              {/* Password Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-white">
                <span className="text-gray-500">Password</span>
                <span className="font-medium text-gray-800">demo123</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
      </div>
      <Footer />
    </>
  );
}
