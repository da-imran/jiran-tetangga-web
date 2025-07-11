
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    } else {
      // Here you might want to add token verification logic
      // For now, we'll assume the token is valid if it exists
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-8">
        <div className="w-full space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
