"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, SearchX, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/orders?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
          setTotalPages(data.pages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Confirmed":
      case "Processing":
      case "Packed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Shipped":
      case "Out for Delivery": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled":
      case "Returned":
      case "Refunded": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-64 bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border rounded-2xl p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You haven't placed any orders. Browse our collections and discover premium products.
        </p>
        <Button asChild><Link href="/products">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-card border rounded-2xl overflow-hidden">
            {/* Order Header */}
            <div className="bg-secondary/30 border-b p-4 sm:p-6 flex flex-wrap gap-6 justify-between items-start text-sm">
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-muted-foreground mb-1">Order Placed</div>
                  <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Total</div>
                  <div className="font-medium">₹{order.totalPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Ship To</div>
                  <div className="font-medium">{order.shippingAddress.fullName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground mb-1">Order ID</div>
                <div className="font-mono font-medium">{order.orderId}</div>
              </div>
            </div>

            {/* Order Body */}
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="space-y-6">
                {order.orderItems.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 sm:gap-6">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-xl overflow-hidden shrink-0 border">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product}`} className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mb-2">
                        {item.variant?.color && <span>Color: {item.variant.color} </span>}
                        {item.variant?.size && <span>Size: {item.variant.size}</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span>₹{(item.discountPrice || item.price).toLocaleString()}</span>
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${item.product}`}>Buy Again</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer */}
            <div className="bg-secondary/10 border-t p-4 flex justify-between items-center text-sm">
              <span className="text-muted-foreground uppercase text-xs font-medium tracking-wider">
                Payment: {order.paymentMethod} ({order.paymentStatus})
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6 border-t mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <div className="flex items-center px-4 font-medium">{page} / {totalPages}</div>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
