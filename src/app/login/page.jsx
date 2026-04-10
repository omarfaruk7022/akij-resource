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
      <div className="min-h-screen flex flex-col bg-[#EBEBEB]">
        {/* Browser tab bar */}
        <div className="bg-[#D6D6D6] border-b border-[#C4C4C4] px-4 py-1.5">
          <span className="text-xs text-[#555555]">Login</span>
        </div>

        {/* Navbar */}

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-md w-full max-w-[460px] px-10 py-10 shadow-md">
            {/* Lock icon + heading */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 rounded-full bg-[#EDE7FF] flex items-center justify-center mb-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    fill="#6633FF"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    stroke="#6633FF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="white" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">
                Sign In
              </h1>
              <div className="w-10 h-[3px] bg-[#6633FF] rounded-full mt-2" />
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
                  className={`w-full px-3 py-2.5 text-sm text-gray-800 bg-white rounded border outline-none transition-all focus:ring-2 focus:ring-[#6633FF]/20 focus:border-[#6633FF] ${
                    errors.email ? "border-red-400" : "border-[#6633FF]"
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
                    className={`w-full px-3 py-2.5 pr-10 text-sm text-gray-800 bg-white rounded border outline-none transition-all focus:ring-2 focus:ring-[#6633FF]/20 focus:border-[#6633FF] ${
                      errors.password ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="text-sm text-[#6633FF] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forget Password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#6633FF] hover:bg-[#5522ee] disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-semibold py-3 rounded transition-colors duration-200"
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
        </main>

        {/* Footer */}
      </div>
    </>
  );
}
