"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch("/api/admin/products?limit=1"),
          fetch("/api/admin/orders?limit=5"),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setStats((s) => ({ ...s, products: prodData.total }));
        }

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setRecentOrders(orderData.orders);
          setStats((s) => ({
            ...s,
            orders: orderData.total,
            revenue: orderData.orders.reduce(
              (sum: number, o: any) => sum + (o.isPaid ? o.totalPrice : 0),
              0
            ),
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border rounded-xl">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">View All</Link>
          </Button>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{order.orderId}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.user?.name || "Unknown"} • {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{order.totalPrice.toLocaleString()}</div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === "Delivered" ? "bg-green-100 text-green-700" :
                    order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
