"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
