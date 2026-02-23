// frontend/components/auth/protected-route.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Role } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements
  if (requiredRoles && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this page.</p>
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
  options?: { requiredRoles?: Role[] }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={options?.requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}