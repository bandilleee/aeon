'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Mail, Lock, Terminal, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (!result.success) {
        setError(result.error || "Login failed");
      }
      // No router.push here — auth context handles the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  // If 2FA required, redirect to 2FA page
  if (requires2FA) {
    router.push(`/login/2fa?userId=${userId}`);
    return null;
  }

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12">
      <div className="w-full max-w-md">
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
            Sign in to your account
          </h1>
          <p className="text-sm text-zinc-500">
            Enter your credentials below to continue
          </p>
        </div>

        {/* Server Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isLoading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          {/* Password */}
          <Input
            label="Password"
            placeholder="Enter your password"
            type="password"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            disabled={isLoading}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="text-sm text-zinc-400 cursor-pointer">
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
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
              Don't have an account?
            </span>
          </div>
        </div>

        {/* Request Access Button */}
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={() => router.push("/request-access")}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Request access
        </Button>
      </div>
    </div>
  );
}