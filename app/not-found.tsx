"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div id="not-found-intercept" style={{ display: "none" }}>
      Redirecting to home page...
    </div>
  );
}