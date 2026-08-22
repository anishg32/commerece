"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expirationDate: "",
    usageLimit: 100,
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAdding(false);
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="animate-pulse p-8">Loading coupons...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create Coupon</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Coupon Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-2 border rounded-lg bg-background uppercase" placeholder="e.g. SUMMER50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg bg-background" placeholder="e.g. 50% off on summer collection" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Discount Type</label>
              <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full p-2 border rounded-lg bg-background">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Discount Value</label>
              <input type="number" required min="1" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Min Order Amount (₹)</label>
              <input type="number" min="0" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Max Discount Amount (₹)</label>
              <input type="number" min="0" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-background" placeholder="Leave 0 for no limit" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Usage Limit</label>
              <input type="number" required min="1" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Expiration Date</label>
              <input type="date" required value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="w-full p-2 border rounded-lg bg-background" />
            </div>
            
            <div className="sm:col-span-2 pt-4">
              <Button type="submit" className="w-full sm:w-auto">Save Coupon</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Discount</th>
              <th className="p-4 font-semibold">Usage</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Expiration</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2 font-bold font-mono">
                    <Tag className="w-4 h-4 text-primary" /> {coupon.code}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{coupon.description}</div>
                </td>
                <td className="p-4 font-medium">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-secondary rounded-full h-2 max-w-[100px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium">{coupon.usageCount}/{coupon.usageLimit}</span>
                  </div>
                </td>
                <td className="p-4">
                  {coupon.isActive ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 w-fit px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-100 w-fit px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Inactive</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(coupon.expirationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No coupons found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
