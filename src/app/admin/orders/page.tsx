"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentMethod", paymentFilter);
      
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.pages);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Confirmed":
      case "Processing":
      case "Packed": return "bg-blue-100 text-blue-700";
      case "Shipped":
      case "Out for Delivery": return "bg-purple-100 text-purple-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Cancelled":
      case "Returned":
      case "Refunded": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">{total} total orders</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
            <option value="Refunded">Refunded</option>
          </select>
          <select 
            value={paymentFilter} 
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Payments</option>
            <option value="razorpay">Razorpay</option>
            <option value="cod">COD</option>
          </select>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left p-4 font-medium">Order ID</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium">{order.orderId}</td>
                    <td className="p-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div>{order.user?.name || order.customerInfo?.name || "Guest"}</div>
                      <div className="text-xs text-muted-foreground">{order.user?.email || order.customerInfo?.email}</div>
                    </td>
                    <td className="p-4 font-medium">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full uppercase ${
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : 
                        order.paymentStatus === "failed" ? "bg-red-100 text-red-700" : 
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full outline-none cursor-pointer border ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-xl font-bold">Order {selectedOrder.orderId}</h2>
                <p className="text-sm text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>✕</Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Details</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customerInfo?.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customerInfo?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customerInfo?.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                    <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="bg-secondary/20 rounded-lg p-4 text-sm grid sm:grid-cols-2 gap-4">
                  <div>
                    <p><span className="text-muted-foreground">Method:</span> <span className="uppercase">{selectedOrder.paymentMethod}</span></p>
                    <p><span className="text-muted-foreground">Status:</span> {selectedOrder.paymentStatus}</p>
                    {selectedOrder.isPaid && <p><span className="text-muted-foreground">Paid At:</span> {new Date(selectedOrder.paidAt).toLocaleString()}</p>}
                  </div>
                  <div>
                    {selectedOrder.razorpayOrderId && <p><span className="text-muted-foreground">Razorpay Order ID:</span> <br/> <code className="text-xs bg-black/10 px-1 rounded">{selectedOrder.razorpayOrderId}</code></p>}
                    {selectedOrder.razorpayPaymentId && <p><span className="text-muted-foreground">Razorpay Payment ID:</span> <br/> <code className="text-xs bg-black/10 px-1 rounded">{selectedOrder.razorpayPaymentId}</code></p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Order Items ({selectedOrder.orderItems?.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-secondary rounded overflow-hidden relative shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <div className="text-xs text-muted-foreground">
                          {item.variant?.color && <span>Color: {item.variant.color} </span>}
                          {item.variant?.size && <span>Size: {item.variant.size}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">₹{(item.discountPrice || item.price) * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{selectedOrder.itemsPrice}</span></div>
                  {selectedOrder.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{selectedOrder.discountAmount}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₹{selectedOrder.taxPrice}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>₹{selectedOrder.shippingPrice}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>₹{selectedOrder.totalPrice}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
