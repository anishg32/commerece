"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-card border rounded-2xl p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{session?.user?.name || "Customer"}</h2>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active Account
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Full Name</label>
              <div className="font-medium text-lg">{session?.user?.name || "Not provided"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Email Address</label>
              <div className="font-medium text-lg">{session?.user?.email}</div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-4">Account Actions</h3>
            <div className="flex gap-4">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="outline">Change Password</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
