'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];  // Changed from Role[] to string[] for flexibility
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles,
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect in useEffect
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-zinc-500">You don&apos;t have permission to view this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Higher-order component version for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requiredRoles?: string[] }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={options?.requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}