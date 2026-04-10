'use client';
// src/app/candidate/login/page.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, BookOpen, Mail, Lock, UserPlus } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { toast } from '@/components/ui/Toast';
import ToastContainer from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function CandidateLoginPage() {
  const router = useRouter();
  const { login, register: registerUser, user, token, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  useEffect(() => {
    if (token && user?.role === 'candidate') {
      router.replace('/candidate/dashboard');
    }
  }, [token, user, router]);

  useEffect(() => { reset(); }, [isRegister, reset]);

  const onSubmit = async (data) => {
    let result;
    if (isRegister) {
      result = await registerUser(data.name, data.email, data.password, 'candidate');
    } else {
      result = await login(data.email, data.password, 'candidate');
    }
    if (result.success) {
      toast.success(isRegister ? `Welcome, ${result.user.name}!` : `Welcome back, ${result.user.name}!`);
      router.push('/candidate/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E1B4B] to-[#312E81] flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AssessHub</span>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Showcase your
              <br />
              <span className="text-emerald-300">skills and talent</span>
              <br />
              to employers.
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed">
              Take timed assessments, answer questions, and let your performance speak for itself.
            </p>
            <div className="mt-8 space-y-3">
              {['Fair, timed online exams', 'Multiple question formats', 'Instant result feedback', 'Secure exam environment'].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-indigo-200 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-indigo-300 text-sm">
            &copy; {new Date().getFullYear()} AssessHub. All rights reserved.
          </div>
        </div>

        {/* Right – form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">AssessHub</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegister ? 'Create Account' : 'Candidate Sign In'}
              </h1>
              <p className="text-gray-500">
                {isRegister ? 'Register as a candidate to take exams' : 'Sign in to access your exams'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isLoading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {!isRegister && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium mb-1">Demo Credentials</p>
                <p className="text-xs text-emerald-600">Email: candidate@demo.com</p>
                <p className="text-xs text-emerald-600">Password: demo123</p>
              </div>
            )}

            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1 mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
              <p className="text-sm text-gray-500">
                Are you an employer?{' '}
                <Link href="/employer/login" className="text-indigo-600 font-medium hover:underline">
                  Employer Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
