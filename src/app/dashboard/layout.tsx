import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Package, User, Heart, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="bg-card border rounded-2xl p-6 mb-4 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-semibold">{session.user.name || "Customer"}</h2>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>

          <nav className="flex flex-col gap-1">
            <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium text-sm">
              <Package className="w-4 h-4" /> My Orders
            </Link>
            <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium text-sm">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary text-destructive transition-colors font-medium text-sm mt-4">
              <LogOut className="w-4 h-4" /> Sign Out
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
