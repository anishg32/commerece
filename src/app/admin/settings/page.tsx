"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    codEnabled: true,
    codMinAmount: 0,
    codMaxAmount: 50000,
    taxRate: 0.18,
    freeShippingThreshold: 500,
    shippingRate: 50,
    currency: "INR"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings({
            codEnabled: data.codEnabled,
            codMinAmount: data.codMinAmount,
            codMaxAmount: data.codMaxAmount,
            taxRate: data.taxRate,
            freeShippingThreshold: data.freeShippingThreshold,
            shippingRate: data.shippingRate,
            currency: data.currency
          });
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Settings saved successfully!");
    } catch (e: unknown) {
      alert((e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setSettings(s => ({ ...s, [field]: value }));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">Manage global store configurations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Payment Settings */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Payment Configuration</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors">
              <input 
                type="checkbox" 
                checked={settings.codEnabled} 
                onChange={(e) => updateSetting("codEnabled", e.target.checked)}
                className="w-5 h-5 rounded border accent-primary"
              />
              <div>
                <div className="font-medium">Enable Cash on Delivery (COD)</div>
                <div className="text-sm text-muted-foreground">Allow customers to pay when their order is delivered.</div>
              </div>
            </label>
            
            {settings.codEnabled && (
              <div className="grid sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20 ml-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Minimum Order Amount for COD</label>
                  <input 
                    type="number" 
                    value={settings.codMinAmount} 
                    onChange={(e) => updateSetting("codMinAmount", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Maximum Order Amount for COD</label>
                  <input 
                    type="number" 
                    value={settings.codMaxAmount} 
                    onChange={(e) => updateSetting("codMaxAmount", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tax & Shipping */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tax & Shipping</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tax Rate (Decimal)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="1"
                  value={settings.taxRate} 
                  onChange={(e) => updateSetting("taxRate", Number(e.target.value))}
                  className={inputClass}
                  placeholder="e.g. 0.18 for 18%"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {(settings.taxRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Currency Code</label>
              <select 
                value={settings.currency} 
                onChange={(e) => updateSetting("currency", e.target.value)}
                className={inputClass}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Flat Shipping Rate</label>
              <input 
                type="number" 
                value={settings.shippingRate} 
                onChange={(e) => updateSetting("shippingRate", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Free Shipping Threshold</label>
              <input 
                type="number" 
                value={settings.freeShippingThreshold} 
                onChange={(e) => updateSetting("freeShippingThreshold", Number(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="min-w-[140px]">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
