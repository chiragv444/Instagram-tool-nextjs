"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getLocaleHomePath } from "@/lib/i18n-config";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const targetPath = getLocaleHomePath(pathname);

  useEffect(() => {
    router.replace(targetPath);
  }, [router, targetPath]);

  return (
    <div id="not-found-intercept" style={{ display: "none" }}>
      Redirecting to home page...
    </div>
  );
}