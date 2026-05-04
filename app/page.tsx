'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by verifying token
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // Not authenticated, redirect to login
          router.push('/login');
        }
      } catch (err) {
        // Error checking auth, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block">
          <div
            className="h-8 w-8 bg-blue-600 rounded-full animate-spin"
            style={{
              borderWidth: '2px',
              borderColor: '#1D4ED8',
              borderTopColor: 'transparent',
            }}
          />
        </div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
