"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MockGoogleLoginDialogProps {
  isOpen: boolean;
  onClose: (email: string | null) => void;
}

export function MockGoogleLoginDialog({ isOpen, onClose }: MockGoogleLoginDialogProps) {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-lg border animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <svg className="h-8 w-8 text-primary" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Sign in with Google</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter a simulated Google email address to continue to ARJ Store.
        </p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) onClose(email.trim());
          }}
        >
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="test@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onClose(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
