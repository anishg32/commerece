"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Profile Form State
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      setSuccess("Profile updated successfully!");
      update({ name, email }); // Update next-auth session locally
      setTimeout(() => { setIsEditProfileOpen(false); setSuccess(""); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      
      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => { setIsChangePasswordOpen(false); setSuccess(""); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <Button variant="outline" onClick={() => {
                setName(session?.user?.name || "");
                setEmail(session?.user?.email || "");
                setIsEditProfileOpen(true);
                setError(""); setSuccess("");
              }}>Edit Profile</Button>
              <Button variant="outline" onClick={() => {
                setCurrentPassword(""); setNewPassword("");
                setIsChangePasswordOpen(true);
                setError(""); setSuccess("");
              }}>Change Password</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Edit Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEditProfileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm bg-destructive/10 text-destructive rounded-lg">{error}</div>}
            {success && <div className="p-3 mb-4 text-sm bg-green-500/10 text-green-600 rounded-lg">{success}</div>}
            
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Change Password</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsChangePasswordOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm bg-destructive/10 text-destructive rounded-lg">{error}</div>}
            {success && <div className="p-3 mb-4 text-sm bg-green-500/10 text-green-600 rounded-lg">{success}</div>}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
