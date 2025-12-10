"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Terminal } from "lucide-react";

import { Button, Input, PasswordInput, Checkbox } from "@/components/ui";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues:  {
      email:  "",
      password:  "",
      rememberMe: false,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // TODO:  Replace with actual API call to your C# backend
      console.log("Login data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response from backend
      const mockResponse = {
        success: true,
        user: {
          id: "1",
          email:  data.email,
          role: "member" as "member" | "admin",
        },
        requiresPasswordChange: true, // TRUE if using temp password
      };

      // Check if user needs to set a new password
      if (mockResponse. requiresPasswordChange) {
        // Redirect to set password page
        router.push("/set-password");
        return;
      }

      // Otherwise, redirect based on role
      if (mockResponse.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setServerError("Invalid email or password.  Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
          <Terminal className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight text-lg">
          AEON
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500">
          Sign in to your account to continue
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-red-400 text-xs">!</span>
          </div>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register("email")}
        />

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-200">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Forgot password? 
            </Link>
          </div>
          <PasswordInput
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            disabled={isLoading}
            {...register("password")}
          />
        </div>

        {/* Remember Me */}
        <Checkbox
          label="Remember me for 30 days"
          disabled={isLoading}
          {...register("rememberMe")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#050505] px-4 text-zinc-600">
            New to Aeon? 
          </span>
        </div>
      </div>

      {/* Request Access Button */}
      <Button
        variant="secondary"
        className="w-full"
        size="lg"
        onClick={() => router.push("/request-access")}
      >
        Request access
      </Button>

      {/* Security Note */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        Protected by enterprise-grade security. {" "}
        <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">
          Learn more
        </a>
      </p>
    </div>
  );
}